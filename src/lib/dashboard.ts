import { differenceInCalendarDays, endOfMonth, format, startOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getBudgetAlertLevel, projectEndOfMonthBalance } from "@/lib/budgeting";
import { accumulateDailyNet, buildCashFlowChartSeries, openingBalanceBeforeSeries } from "@/lib/cash-flow";
import { computeCurrentVulnerability } from "@/lib/insights";
import { ensureCurrentMonthBudgets } from "@/lib/budget-alerts";

export async function getDashboardData(userId: string) {
  await ensureCurrentMonthBudgets(userId);
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const month = format(now, "yyyy-MM");

  const [accounts, transactionsThisMonth, totalReceitas, totalDespesas, budgets, vulnerability, openNudge] =
    await Promise.all([
    prisma.account.findMany({ where: { userId, archived: false }, orderBy: { createdAt: "asc" } }),
    prisma.transaction.findMany({
      where: { userId, occurredAt: { gte: monthStart, lte: monthEnd } },
      include: { category: true, emotionLog: true },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.transaction.aggregate({ where: { userId, type: "receita" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId, type: "despesa" }, _sum: { amount: true } }),
    prisma.budget.findMany({ where: { userId, month }, include: { category: true } }),
    computeCurrentVulnerability(userId),
    prisma.nudge.findFirst({
      where: { userId, dismissedAt: null },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const initialBalanceSum = accounts.reduce((sum, a) => sum + a.initialBalance, 0);
  const saldoDisponivel = initialBalanceSum + (totalReceitas._sum.amount ?? 0) - (totalDespesas._sum.amount ?? 0);

  const despesasFixas = transactionsThisMonth
    .filter((t) => t.type === "despesa" && t.essential)
    .reduce((sum, t) => sum + t.amount, 0);
  const despesasVariaveis = transactionsThisMonth
    .filter((t) => t.type === "despesa" && !t.essential)
    .reduce((sum, t) => sum + t.amount, 0);
  const receitasMes = transactionsThisMonth
    .filter((t) => t.type === "receita")
    .reduce((sum, t) => sum + t.amount, 0);

  const daysElapsed = Math.max(1, differenceInCalendarDays(now, monthStart) + 1);
  const daysRemaining = Math.max(0, differenceInCalendarDays(monthEnd, now));
  const averageDailyExpense = (despesasFixas + despesasVariaveis) / daysElapsed;
  const projectedEndBalance = projectEndOfMonthBalance({
    currentBalance: saldoDisponivel,
    incomeRemainingThisMonth: 0,
    averageDailyExpense,
    daysRemainingInMonth: daysRemaining,
  });

  const budgetsWithSpent = budgets.map((b) => {
    const spent = transactionsThisMonth
      .filter((t) => t.categoryId === b.categoryId && t.type === "despesa")
      .reduce((sum, t) => sum + t.amount, 0);
    return { ...b, spent, alertLevel: getBudgetAlertLevel(spent, b.limitAmount) };
  });

  const daysInMonth = differenceInCalendarDays(monthEnd, monthStart) + 1;
  const dailyNet = accumulateDailyNet({
    daysInMonth,
    monthStart,
    movements: transactionsThisMonth.map((row) => ({
      occurredAt: row.occurredAt,
      type: row.type as "receita" | "despesa",
      amount: row.amount,
    })),
  });
  const todayIndex = differenceInCalendarDays(now, monthStart);
  const chartData = buildCashFlowChartSeries({
    dailyNet,
    todayIndex,
    monthStartBalance: openingBalanceBeforeSeries(saldoDisponivel, dailyNet, todayIndex),
    averageDailyExpense,
  });

  return {
    accounts,
    saldoDisponivel,
    despesasFixas,
    despesasVariaveis,
    receitasMes,
    projectedEndBalance,
    budgetsWithSpent,
    chartData,
    vulnerability,
    recentTransactions: transactionsThisMonth.slice(0, 6),
    openNudge,
  };
}
