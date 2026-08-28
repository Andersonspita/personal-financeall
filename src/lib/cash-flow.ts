import { differenceInCalendarDays } from "date-fns";

export type CashFlowChartPoint = {
  day: number;
  saldoReal: number | null;
  saldoProjetado: number | null;
};

export type DailyCashMovement = {
  occurredAt: Date;
  type: "receita" | "despesa";
  amount: number;
};

/** Soma líquida por dia do mês. Lançamentos fora do intervalo são ignorados. */
export function accumulateDailyNet(input: {
  daysInMonth: number;
  monthStart: Date;
  movements: DailyCashMovement[];
}): number[] {
  const dailyNet = Array.from({ length: Math.max(0, input.daysInMonth) }, () => 0);
  for (const movement of input.movements) {
    const dayIndex = differenceInCalendarDays(movement.occurredAt, input.monthStart);
    if (dayIndex < 0 || dayIndex >= dailyNet.length) continue;
    dailyNet[dayIndex] += movement.type === "receita" ? movement.amount : -movement.amount;
  }
  return dailyNet;
}

/** Saldo imediatamente antes do dia 0 da série (para o gráfico partir do valor correto). */
export function openingBalanceBeforeSeries(
  currentBalance: number,
  dailyNet: number[],
  todayIndex: number,
): number {
  const lastRealized = Math.min(Math.max(todayIndex, -1), dailyNet.length - 1);
  const realized = dailyNet.slice(0, lastRealized + 1).reduce((sum, net) => sum + net, 0);
  return currentBalance - realized;
}

/**
 * Série do gráfico: saldo real até hoje (inclusive) e projeção linear do gasto médio depois.
 * `todayIndex` é 0-based e é limitado ao intervalo do mês.
 */
export function buildCashFlowChartSeries(input: {
  dailyNet: number[];
  todayIndex: number;
  monthStartBalance: number;
  averageDailyExpense: number;
}): CashFlowChartPoint[] {
  const daysInMonth = input.dailyNet.length;
  if (daysInMonth === 0) return [];

  const todayIndex = Math.min(Math.max(input.todayIndex, 0), daysInMonth - 1);
  let running = input.monthStartBalance;
  const points: CashFlowChartPoint[] = [];

  for (let index = 0; index < daysInMonth; index++) {
    if (index <= todayIndex) {
      running += input.dailyNet[index] ?? 0;
      const rounded = Math.round(running);
      points.push({
        day: index + 1,
        saldoReal: rounded,
        saldoProjetado: index === todayIndex ? rounded : null,
      });
    } else {
      running += -input.averageDailyExpense;
      points.push({ day: index + 1, saldoReal: null, saldoProjetado: Math.round(running) });
    }
  }

  return points;
}
