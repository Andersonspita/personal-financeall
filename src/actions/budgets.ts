"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { budgetInputSchema } from "@/lib/validation";

export async function upsertBudget(input: unknown) {
  const user = await requireUser();
  const data = budgetInputSchema.parse(input);

  const category = await prisma.category.findFirst({ where: { id: data.categoryId, userId: user.id } });
  if (!category) throw new Error("Categoria não encontrada.");

  const budget = await prisma.budget.upsert({
    where: { categoryId_month: { categoryId: data.categoryId, month: data.month } },
    update: { limitAmount: data.limitAmount },
    create: { ...data, userId: user.id },
  });
  revalidatePath("/orcamentos");
  revalidatePath("/");
  return budget;
}

export async function upsertBudgetFromForm(formData: FormData) {
  await upsertBudget({
    categoryId: String(formData.get("categoryId")),
    month: String(formData.get("month")),
    limitAmount: Number(formData.get("limitAmount")),
  });
}
