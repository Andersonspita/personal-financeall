"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { categoryInputSchema } from "@/lib/validation";
import { budgetMonthKey, isIncomeCategoryGroup } from "@/lib/budgeting";

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

export async function createCategoryFromForm(formData: FormData) {
  const monthlyLimit = formData.get("monthlyLimit");
  await createCategory({
    name: String(formData.get("name")),
    group: String(formData.get("group")),
    icon: (formData.get("icon") as string) || undefined,
    monthlyLimit: monthlyLimit ? Number(monthlyLimit) : undefined,
  });
}
