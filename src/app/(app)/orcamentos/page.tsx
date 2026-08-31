import { format, startOfMonth, endOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { Card, CardTitle } from "@/components/ui/card";
import { BUDGET_GROUPS, type BudgetGroup } from "@/lib/budgeting";
import { ensureDefaultIncomeCategories } from "@/lib/onboarding";
import { ensureCurrentMonthBudgets } from "@/lib/budget-alerts";
import { BudgetDistributionCard } from "@/components/budgets/distribution-card";
import { CategoryManager } from "@/components/budgets/category-manager";
import { NewCategoryForm } from "@/components/budgets/new-category-form";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const user = await requireUser();
  await ensureDefaultIncomeCategories(user.id);
  await ensureCurrentMonthBudgets(user.id);
  const now = new Date();
  const month = format(now, "yyyy-MM");
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [categories, spentByCategory, income, budgets] = await Promise.all([
    prisma.category.findMany({
      where: { userId: user.id },
      orderBy: [{ archived: "asc" }, { name: "asc" }],
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId: user.id, type: "despesa", occurredAt: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId: user.id, type: "receita", occurredAt: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.budget.findMany({ where: { userId: user.id, month } }),
  ]);

  const spentMap = new Map(spentByCategory.map((row) => [row.categoryId, row._sum.amount ?? 0]));
  const budgetMap = new Map(budgets.map((budget) => [budget.categoryId, budget.limitAmount]));
  const totalIncome = income._sum.amount ?? 0;

  const groupTotals: Record<BudgetGroup, number> = { essencial: 0, variavel: 0, poupanca: 0 };
  for (const category of categories) {
    if (!(BUDGET_GROUPS as readonly string[]).includes(category.group)) continue;
    groupTotals[category.group as BudgetGroup] += spentMap.get(category.id) ?? 0;
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold">Orçamentos</h1>

      <BudgetDistributionCard groupTotals={groupTotals} totalIncome={totalIncome} />

      <CategoryManager
        month={month}
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          group: category.group,
          icon: category.icon,
          archived: category.archived,
          spent: spentMap.get(category.id) ?? 0,
          limit: budgetMap.get(category.id) ?? category.monthlyLimit ?? null,
        }))}
      />

      <Card>
        <CardTitle>Nova categoria</CardTitle>
        <NewCategoryForm />
      </Card>
    </div>
  );
}
