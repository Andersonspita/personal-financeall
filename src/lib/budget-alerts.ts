import { endOfMonth, startOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { BUDGET_ALERT_COPY } from "@/lib/copy";
import { budgetMonthKey, isIncomeCategoryGroup, nextBudgetAlertStamps } from "@/lib/budgeting";

export type BudgetAlertNudge = { id: string; message: string };

/**
 * Garante um `Budget` no mês corrente para cada categoria de gasto que já tem `monthlyLimit`.
 * Contas antigas e a virada de mês passam a ter teto visível no dashboard sem o usuário re-salvar.
 */
export async function ensureCurrentMonthBudgets(userId: string) {
  const month = budgetMonthKey(new Date());
  const [categories, existing] = await Promise.all([
    prisma.category.findMany({
      where: { userId, monthlyLimit: { not: null } },
    }),
    prisma.budget.findMany({ where: { userId, month }, select: { categoryId: true } }),
  ]);
  const have = new Set(existing.map((b) => b.categoryId));
  const missing = categories.filter(
    (c) => c.monthlyLimit && c.monthlyLimit > 0 && !isIncomeCategoryGroup(c.group) && !have.has(c.id),
  );
  if (missing.length === 0) return;
  await prisma.budget.createMany({
    data: missing.map((c) => ({
      userId,
      categoryId: c.id,
      month,
      limitAmount: c.monthlyLimit!,
    })),
  });
}

/**
 * Recalcula o gasto do mês, grava `alert80SentAt` / `alert100SentAt` na primeira vez que o teto
 * cruza 80% ou 100%, e cria um nudge in-app (sem push/e-mail) com o texto não-punitivo.
 */
export async function syncBudgetAlertsForCategory(
  userId: string,
  categoryId: string | null | undefined,
  at: Date = new Date(),
): Promise<BudgetAlertNudge | null> {
  if (!categoryId) return null;

  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category || isIncomeCategoryGroup(category.group)) return null;

  const month = budgetMonthKey(at);
  let budget = await prisma.budget.findUnique({
    where: { categoryId_month: { categoryId, month } },
  });

  if (!budget && category.monthlyLimit && category.monthlyLimit > 0) {
    budget = await prisma.budget.create({
      data: { userId, categoryId, month, limitAmount: category.monthlyLimit },
    });
  }
  if (!budget) return null;

  const spentAgg = await prisma.transaction.aggregate({
    where: {
      userId,
      categoryId,
      type: "despesa",
      occurredAt: { gte: startOfMonth(at), lte: endOfMonth(at) },
    },
    _sum: { amount: true },
  });
  const spent = spentAgg._sum.amount ?? 0;
  const { alert80SentAt, alert100SentAt, newlyFired } = nextBudgetAlertStamps({
    spent,
    limitAmount: budget.limitAmount,
    alert80SentAt: budget.alert80SentAt,
    alert100SentAt: budget.alert100SentAt,
  });

  if (newlyFired.length === 0) return null;

  await prisma.budget.update({
    where: { id: budget.id },
    data: { alert80SentAt, alert100SentAt },
  });

  const highest = newlyFired.includes("estourado") ? "estourado" : "alerta_80";
  const triggerRule =
    highest === "estourado" ? `teto_100:${categoryId}:${month}` : `teto_80:${categoryId}:${month}`;
  const message =
    highest === "estourado" ? BUDGET_ALERT_COPY.at100(category.name) : BUDGET_ALERT_COPY.at80(category.name);

  const existingNudge = await prisma.nudge.findFirst({
    where: { userId, triggerRule, dismissedAt: null },
  });
  if (existingNudge) return { id: existingNudge.id, message: existingNudge.message };

  const nudge = await prisma.nudge.create({
    data: { userId, message, triggerRule, category: category.name },
  });
  return { id: nudge.id, message: nudge.message };
}
