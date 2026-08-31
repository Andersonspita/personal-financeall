"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { categoryInputSchema } from "@/lib/validation";
import { budgetMonthKey, isIncomeCategoryGroup } from "@/lib/budgeting";
import { assertCanArchiveCategory, categoryKind } from "@/lib/categories";
import { DomainError, fieldErrorsFromZod, logAppError, type FormActionState } from "@/lib/errors";

function revalidateCategoryPaths() {
  revalidatePath("/orcamentos");
  revalidatePath("/transacoes");
  revalidatePath("/desejos");
  revalidatePath("/");
}

function parseCategoryForm(formData: FormData) {
  const monthlyLimitRaw = String(formData.get("monthlyLimit") ?? "").trim();
  return categoryInputSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    group: String(formData.get("group") ?? ""),
    icon: String(formData.get("icon") ?? "").trim() || undefined,
    monthlyLimit: monthlyLimitRaw ? Number(monthlyLimitRaw) : undefined,
  });
}

async function countActiveOfKind(userId: string, kind: "renda" | "gasto", exceptId?: string) {
  return prisma.category.count({
    where: {
      userId,
      archived: false,
      ...(exceptId ? { id: { not: exceptId } } : {}),
      group: kind === "renda" ? "renda" : { not: "renda" },
    },
  });
}

async function assertUniqueName(userId: string, name: string, exceptId?: string) {
  const clash = await prisma.category.findFirst({
    where: { userId, name, ...(exceptId ? { id: { not: exceptId } } : {}) },
  });
  if (clash) {
    throw new DomainError("Já existe uma categoria com esse nome (pode estar arquivada).", "name");
  }
}

export async function createCategory(input: unknown) {
  const user = await requireUser();
  const data = categoryInputSchema.parse(input);
  await assertUniqueName(user.id, data.name);
  const category = await prisma.category.create({ data: { ...data, userId: user.id } });
  if (data.monthlyLimit && !isIncomeCategoryGroup(data.group)) {
    await prisma.budget.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        month: budgetMonthKey(new Date()),
        limitAmount: data.monthlyLimit,
      },
    });
  }
  revalidateCategoryPaths();
  return category;
}

export async function createCategoryFromForm(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revise os campos e tente de novo.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  try {
    await createCategory(parsed.data);
  } catch (err) {
    if (err instanceof DomainError) {
      return { error: err.message, fieldErrors: err.field ? { [err.field]: err.message } : undefined };
    }
    if (err instanceof z.ZodError) {
      return {
        error: err.issues[0]?.message ?? "Revise os campos e tente de novo.",
        fieldErrors: fieldErrorsFromZod(err),
      };
    }
    logAppError("categories.create", err);
    return { error: "Não foi possível criar a categoria. Tente de novo em instantes." };
  }
  return { success: true };
}

export async function updateCategoryFromForm(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Categoria não encontrada." };
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revise os campos e tente de novo.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  try {
    const user = await requireUser();
    const existing = await prisma.category.findFirst({ where: { id, userId: user.id } });
    if (!existing) throw new DomainError("Categoria não encontrada.");
    if (existing.archived) throw new DomainError("Reative a categoria antes de editar.");
    await assertUniqueName(user.id, parsed.data.name, id);
    const oldKind = categoryKind(existing.group);
    const newKind = categoryKind(parsed.data.group);
    if (oldKind !== newKind) {
      const remaining = await countActiveOfKind(user.id, oldKind, id);
      if (remaining < 1) {
        throw new DomainError(
          oldKind === "renda"
            ? "Deixe pelo menos uma categoria de renda ativa."
            : "Deixe pelo menos uma categoria de gasto ativa.",
        );
      }
    }
    await prisma.category.update({
      where: { id },
      data: {
        name: parsed.data.name,
        group: parsed.data.group,
        icon: parsed.data.icon ?? null,
      },
    });
    revalidateCategoryPaths();
  } catch (err) {
    if (err instanceof DomainError) {
      return { error: err.message, fieldErrors: err.field ? { [err.field]: err.message } : undefined };
    }
    logAppError("categories.update", err);
    return { error: "Não foi possível salvar a categoria. Tente de novo em instantes." };
  }
  return { success: true };
}

export async function archiveCategoryFromForm(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Categoria não encontrada." };
  try {
    const user = await requireUser();
    const existing = await prisma.category.findFirst({ where: { id, userId: user.id } });
    if (!existing) throw new DomainError("Categoria não encontrada.");
    if (existing.archived) return { success: true };
    const kind = categoryKind(existing.group);
    const activeCount = await countActiveOfKind(user.id, kind);
    assertCanArchiveCategory(kind, activeCount);
    await prisma.category.update({ where: { id }, data: { archived: true } });
    revalidateCategoryPaths();
  } catch (err) {
    if (err instanceof DomainError) return { error: err.message };
    logAppError("categories.archive", err);
    return { error: "Não foi possível arquivar a categoria. Tente de novo em instantes." };
  }
  return { success: true };
}

export async function restoreCategoryFromForm(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Categoria não encontrada." };
  try {
    const user = await requireUser();
    const existing = await prisma.category.findFirst({ where: { id, userId: user.id } });
    if (!existing) throw new DomainError("Categoria não encontrada.");
    if (!existing.archived) return { success: true };
    await prisma.category.update({ where: { id }, data: { archived: false } });
    revalidateCategoryPaths();
  } catch (err) {
    if (err instanceof DomainError) return { error: err.message };
    logAppError("categories.restore", err);
    return { error: "Não foi possível reativar a categoria. Tente de novo em instantes." };
  }
  return { success: true };
}
