"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { accountInputSchema } from "@/lib/validation";

export async function createAccount(input: unknown) {
  const user = await requireUser();
  const data = accountInputSchema.parse(input);
  const account = await prisma.account.create({ data: { ...data, userId: user.id } });
  revalidatePath("/");
  revalidatePath("/transacoes");
  return account;
}
