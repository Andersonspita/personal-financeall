"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { categoryInputSchema } from "@/lib/validation";
import { budgetMonthKey, isIncomeCategoryGroup } from "@/lib/budgeting";
import { fieldErrorsFromZod, logAppError, type FormActionState } from "@/lib/errors";

export async function createCategory(input: unknown) {
  const user = await requireUser();
  const data = categoryInputSchema.parse(input);
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
  revalidatePath("/orcamentos");
  revalidatePath("/transacoes");
  revalidatePath("/");
  return category;
}

export async function createCategoryFromForm(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const monthlyLimitRaw = String(formData.get("monthlyLimit") ?? "").trim();
  const parsed = categoryInputSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    group: String(formData.get("group") ?? ""),
    icon: String(formData.get("icon") ?? "").trim() || undefined,
    monthlyLimit: monthlyLimitRaw ? Number(monthlyLimitRaw) : undefined,
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revise os campos e tente de novo.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  try {
    await createCategory(parsed.data);
  } catch (err) {
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
