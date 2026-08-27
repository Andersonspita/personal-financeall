import { differenceInCalendarDays, endOfMonth, format, startOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getBudgetAlertLevel, projectEndOfMonthBalance } from "@/lib/budgeting";
import { computeCurrentVulnerability } from "@/lib/insights";

export async function getDashboardData(userId: string) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const month = format(now, "yyyy-MM");

  const [accounts, transactionsThisMonth, totalReceitas, totalDespesas, budgets, vulnerability] = await Promise.all([
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

  // Série diária acumulada (real até hoje, projetada linearmente depois) para o gráfico de fluxo de caixa.
  const daysInMonth = differenceInCalendarDays(monthEnd, monthStart) + 1;
  const dailyNet = new Array(daysInMonth).fill(0);
  for (const t of transactionsThisMonth) {
    const dayIndex = differenceInCalendarDays(t.occurredAt, monthStart);
    if (dayIndex < 0 || dayIndex >= daysInMonth) continue;
    dailyNet[dayIndex] += t.type === "receita" ? t.amount : -t.amount;
  }

  const todayIndex = differenceInCalendarDays(now, monthStart);
  const startBalance = saldoDisponivel - dailyNet.slice(0, todayIndex + 1).reduce((s, v) => s + v, 0);
  let running = startBalance;
  const chartData: { day: number; saldoReal: number | null; saldoProjetado: number | null }[] = [];
  for (let index = 0; index < daysInMonth; index++) {
    if (index <= todayIndex) {
      running += dailyNet[index];
      chartData.push({
        day: index + 1,
        saldoReal: Math.round(running),
        saldoProjetado: index === todayIndex ? Math.round(running) : null,
      });
    } else {
      running += -averageDailyExpense;
      chartData.push({ day: index + 1, saldoReal: null, saldoProjetado: Math.round(running) });
    }
  }

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
  };
}
