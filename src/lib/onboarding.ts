import { prisma } from "@/lib/prisma";
import { budgetMonthKey, isIncomeCategoryGroup } from "@/lib/budgeting";

// Conjunto inicial de categorias oferecido a toda conta nova, para que a primeira tela de
// lançamento já tenha opções sensatas em vez de aparecer vazia. O usuário pode editar/remover
// livremente depois — isso é só um ponto de partida, não uma imposição.
export const DEFAULT_CATEGORIES = [
  { name: "Moradia", group: "essencial", icon: "🏠" },
  { name: "Alimentação", group: "essencial", icon: "🛒" },
  { name: "Transporte", group: "essencial", icon: "🚌" },
  { name: "Saúde", group: "essencial", icon: "💊" },
  { name: "Delivery", group: "variavel", icon: "🍔", monthlyLimit: 300 },
  { name: "Vestuário", group: "variavel", icon: "👕", monthlyLimit: 200 },
  { name: "Lazer", group: "variavel", icon: "🎮", monthlyLimit: 250 },
  { name: "Assinaturas", group: "variavel", icon: "📺", monthlyLimit: 100 },
  { name: "Reserva de Emergência", group: "poupanca", icon: "🛟" },
  { name: "Investimentos", group: "poupanca", icon: "📈" },
  { name: "Salário", group: "renda", icon: "💰" },
] as const;

export async function createDefaultDataForUser(userId: string) {
  await prisma.account.create({
    data: { userId, name: "Conta Principal", type: "corrente", initialBalance: 0 },
  });
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId })),
  });

  const month = budgetMonthKey(new Date());
  const categories = await prisma.category.findMany({ where: { userId } });
  const withLimit = categories.filter(
    (c) => c.monthlyLimit && c.monthlyLimit > 0 && !isIncomeCategoryGroup(c.group),
  );
  if (withLimit.length > 0) {
    await prisma.budget.createMany({
      data: withLimit.map((c) => ({
        userId,
        categoryId: c.id,
        month,
        limitAmount: c.monthlyLimit!,
      })),
      skipDuplicates: true,
    });
  }
}

/** Contas já criadas antes da categoria Salário passam a tê-la na primeira tela que precisa. */
export async function ensureDefaultIncomeCategories(userId: string) {
  const existing = await prisma.category.findFirst({ where: { userId, name: "Salário" } });
  if (existing) return existing;
  return prisma.category.create({
    data: { userId, name: "Salário", group: "renda", icon: "💰" },
  });
}
