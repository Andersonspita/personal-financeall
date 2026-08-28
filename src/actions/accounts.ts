"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { accountInputSchema } from "@/lib/validation";
import { assertCanArchiveAccount } from "@/lib/accounts";
import { DomainError, fieldErrorsFromZod, logAppError, type FormActionState } from "@/lib/errors";

function revalidateAccountPaths() {
  revalidatePath("/");
  revalidatePath("/transacoes");
  revalidatePath("/configuracoes");
}

function parseAccountForm(formData: FormData) {
  const initialRaw = String(formData.get("initialBalance") ?? "").trim();
  return accountInputSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    type: String(formData.get("type") ?? ""),
    initialBalance: initialRaw === "" ? 0 : Number(initialRaw),
  });
}

export async function createAccount(input: unknown) {
  const user = await requireUser();
  const data = accountInputSchema.parse(input);
  const account = await prisma.account.create({ data: { ...data, userId: user.id } });
  revalidateAccountPaths();
  return account;
}

export async function createAccountFromForm(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = parseAccountForm(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revise os campos e tente de novo.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  try {
    await createAccount(parsed.data);
  } catch (err) {
    logAppError("accounts.create", err);
    return { error: "Não foi possível criar a conta. Tente de novo em instantes." };
  }
  return { success: true };
}

export async function updateAccountFromForm(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Conta não encontrada." };
  const parsed = parseAccountForm(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revise os campos e tente de novo.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  try {
    const user = await requireUser();
    const existing = await prisma.account.findFirst({ where: { id, userId: user.id } });
    if (!existing) throw new DomainError("Conta não encontrada.");
    if (existing.archived) throw new DomainError("Reative a conta antes de editar.");
    await prisma.account.update({
      where: { id },
      data: parsed.data,
    });
    revalidateAccountPaths();
  } catch (err) {
    if (err instanceof DomainError) return { error: err.message };
    logAppError("accounts.update", err);
    return { error: "Não foi possível salvar a conta. Tente de novo em instantes." };
  }
  return { success: true };
}

export async function archiveAccountFromForm(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Conta não encontrada." };
  try {
    const user = await requireUser();
    const existing = await prisma.account.findFirst({ where: { id, userId: user.id } });
    if (!existing) throw new DomainError("Conta não encontrada.");
    if (existing.archived) return { success: true };
    const activeCount = await prisma.account.count({ where: { userId: user.id, archived: false } });
    assertCanArchiveAccount(activeCount);
    await prisma.account.update({ where: { id }, data: { archived: true } });
    revalidateAccountPaths();
  } catch (err) {
    if (err instanceof DomainError) return { error: err.message };
    logAppError("accounts.archive", err);
    return { error: "Não foi possível arquivar a conta. Tente de novo em instantes." };
  }
  return { success: true };
}

export async function restoreAccountFromForm(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Conta não encontrada." };
  try {
    const user = await requireUser();
    const existing = await prisma.account.findFirst({ where: { id, userId: user.id } });
    if (!existing) throw new DomainError("Conta não encontrada.");
    if (!existing.archived) return { success: true };
    await prisma.account.update({ where: { id }, data: { archived: false } });
    revalidateAccountPaths();
  } catch (err) {
    if (err instanceof DomainError) return { error: err.message };
    logAppError("accounts.restore", err);
    return { error: "Não foi possível reativar a conta. Tente de novo em instantes." };
  }
  return { success: true };
}
