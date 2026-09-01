import "server-only";
import { differenceInCalendarDays } from "date-fns";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getBudgetAlertLevel } from "@/lib/budgeting";
import { accumulateDailyNet, buildRealCashFlowChartSeries } from "@/lib/cash-flow";
import { resolveDashboardMonth, type DashboardMonth } from "@/lib/dashboard-month";
import { computeCurrentVulnerability, getEmotionSpendMatrixForRange } from "@/lib/insights";
import { ensureCurrentMonthBudgets } from "@/lib/budget-alerts";
import { buildMoodTimeline } from "@/lib/mood/timeline";
import { getMoodLogsForMonth } from "@/lib/mood/service";
import { EMOTION_EMOJI, EMOTION_LABELS, type Emotion } from "@/lib/emotions";

type MonthTransaction = Prisma.TransactionGetPayload<{
  include: { category: true; emotionLog: true };
}>;

type MonthBudget = Prisma.BudgetGetPayload<{ include: { category: true } }>;

async function getBalanceBefore(userId: string, before: Date): Promise<number> {
  const [accounts, movements] = await Promise.all([
    prisma.account.findMany({ where: { userId }, select: { initialBalance: true } }),
    prisma.transaction.findMany({
      where: { userId, occurredAt: { lt: before } },
      select: { type: true, amount: true },
    }),
  ]);

  const initial = accounts.reduce((sum: number, account) => sum + account.initialBalance, 0);
  const net = movements.reduce(
    (sum: number, movement) => sum + (movement.type === "receita" ? movement.amount : -movement.amount),
    0,
  );
  return initial + net;
}

export async function getDashboardData(userId: string, monthParam?: string | null) {
  const period = resolveDashboardMonth(monthParam);
  if (period.isCurrent) await ensureCurrentMonthBudgets(userId);

  const month = period.key;
  const daysInMonth = differenceInCalendarDays(period.end, period.start) + 1;

  const [
    accounts,
    transactionsInMonth,
    allTimeReceitas,
    allTimeDespesas,
    budgets,
    vulnerability,
    openNudge,
    emotionMatrix,
    moodLogs,
  ] = await Promise.all([
    prisma.account.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.transaction.findMany({
      where: { userId, occurredAt: { gte: period.start, lte: period.end } },
      include: { category: true, emotionLog: true },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.transaction.aggregate({ where: { userId, type: "receita" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId, type: "despesa" }, _sum: { amount: true } }),
    prisma.budget.findMany({ where: { userId, month }, include: { category: true } }),
    computeCurrentVulnerability(userId),
    period.isCurrent
      ? prisma.nudge.findFirst({
          where: { userId, dismissedAt: null },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve(null),
    getEmotionSpendMatrixForRange(userId, period.start, period.end),
    getMoodLogsForMonth(userId, month),
  ]);

  const txs: MonthTransaction[] = transactionsInMonth;
  const monthBudgets: MonthBudget[] = budgets;

  const saldoDisponivel =
    accounts.reduce((sum: number, account) => sum + account.initialBalance, 0) +
    (allTimeReceitas._sum.amount ?? 0) -
    (allTimeDespesas._sum.amount ?? 0);

  const despesasFixas = txs
    .filter((transaction) => transaction.type === "despesa" && transaction.essential)
    .reduce((sum: number, transaction) => sum + transaction.amount, 0);
  const despesasVariaveis = txs
    .filter((transaction) => transaction.type === "despesa" && !transaction.essential)
    .reduce((sum: number, transaction) => sum + transaction.amount, 0);
  const receitasMes = txs
    .filter((transaction) => transaction.type === "receita")
    .reduce((sum: number, transaction) => sum + transaction.amount, 0);
  const despesasMes = despesasFixas + despesasVariaveis;
  const resultadoMes = receitasMes - despesasMes;

  const monthStartBalance = await getBalanceBefore(userId, period.start);
  const dailyNet = accumulateDailyNet({
    daysInMonth,
    monthStart: period.start,
    movements: txs.map((row) => ({
      occurredAt: row.occurredAt,
      type: row.type as "receita" | "despesa",
      amount: row.amount,
    })),
  });

  const chartData = buildRealCashFlowChartSeries({
    dailyNet,
    monthStartBalance,
    lastDayIndex: period.todayIndex,
  });
  const saldoFimMes = chartData.at(-1)?.saldo ?? monthStartBalance;

  const budgetsWithSpent = monthBudgets
    .filter((budget) => !budget.category.archived)
    .map((budget) => {
      const spent = txs
        .filter((transaction) => transaction.categoryId === budget.categoryId && transaction.type === "despesa")
        .reduce((sum: number, transaction) => sum + transaction.amount, 0);
      return { ...budget, spent, alertLevel: getBudgetAlertLevel(spent, budget.limitAmount) };
    });

  const emotionChartData = emotionMatrix
    .filter((row) => row.count > 0)
    .map((row) => {
      const emotion = row.emotion as Emotion;
      return {
        emotion,
        label: `${EMOTION_EMOJI[emotion]} ${EMOTION_LABELS[emotion]}`,
        total: row.total,
        count: row.count,
      };
    });

  const moodTimeline = buildMoodTimeline(month, moodLogs, daysInMonth);

  return {
    period,
    accounts,
    saldoDisponivel,
    saldoFimMes,
    resultadoMes,
    despesasFixas,
    despesasVariaveis,
    receitasMes,
    despesasMes,
    budgetsWithSpent,
    chartData,
    emotionChartData,
    moodTimeline,
    vulnerability,
    recentTransactions: txs.slice(0, 6),
    openNudge,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
export type { DashboardMonth };
