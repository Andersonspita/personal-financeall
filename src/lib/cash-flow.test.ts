import { describe, expect, it } from "vitest";
import { accumulateDailyNet, buildCashFlowChartSeries, buildRealCashFlowChartSeries, openingBalanceBeforeSeries } from "./cash-flow";

describe("accumulateDailyNet", () => {
  const monthStart = new Date(2026, 7, 1);

  it("ignora lançamentos fora do mês", () => {
    const dailyNet = accumulateDailyNet({
      daysInMonth: 31,
      monthStart,
      movements: [
        { occurredAt: new Date(2026, 6, 31), type: "despesa", amount: 999 },
        { occurredAt: new Date(2026, 8, 1), type: "receita", amount: 999 },
        { occurredAt: new Date(2026, 7, 10), type: "despesa", amount: 40 },
      ],
    });
    expect(dailyNet[9]).toBe(-40);
    expect(dailyNet.reduce((sum, net) => sum + net, 0)).toBe(-40);
  });

  it("receita soma e despesa subtrai no mesmo dia", () => {
    const dailyNet = accumulateDailyNet({
      daysInMonth: 31,
      monthStart,
      movements: [
        { occurredAt: new Date(2026, 7, 1, 9), type: "receita", amount: 100 },
        { occurredAt: new Date(2026, 7, 1, 18), type: "despesa", amount: 30 },
      ],
    });
    expect(dailyNet[0]).toBe(70);
  });

  it("mês vazio gera zeros", () => {
    expect(accumulateDailyNet({ daysInMonth: 0, monthStart, movements: [] })).toEqual([]);
  });
});

describe("buildRealCashFlowChartSeries", () => {
  it("acumula saldo real dia a dia", () => {
    const points = buildRealCashFlowChartSeries({
      dailyNet: [50, -20, 10],
      monthStartBalance: 100,
    });
    expect(points).toEqual([
      { day: 1, saldo: 150 },
      { day: 2, saldo: 130 },
      { day: 3, saldo: 140 },
    ]);
  });

  it("para no último dia informado (mês atual)", () => {
    const points = buildRealCashFlowChartSeries({
      dailyNet: [50, 0, 0],
      monthStartBalance: 100,
      lastDayIndex: 0,
    });
    expect(points).toHaveLength(1);
    expect(points[0]?.saldo).toBe(150);
  });
});

describe("buildCashFlowChartSeries", () => {
  it("no primeiro dia do mês só projeta depois de hoje", () => {
    const points = buildCashFlowChartSeries({
      dailyNet: [50, 0, 0],
      todayIndex: 0,
      monthStartBalance: 100,
      averageDailyExpense: 10,
    });
    expect(points[0]).toEqual({ day: 1, saldoReal: 150, saldoProjetado: 150 });
    expect(points[1].saldoReal).toBeNull();
    expect(points[1].saldoProjetado).toBe(140);
    expect(points[2].saldoProjetado).toBe(130);
  });

  it("no último dia não projeta futuro", () => {
    const points = buildCashFlowChartSeries({
      dailyNet: [10, -5],
      todayIndex: 1,
      monthStartBalance: 100,
      averageDailyExpense: 99,
    });
    expect(points).toHaveLength(2);
    expect(points[1].saldoProjetado).toBe(points[1].saldoReal);
    expect(points.every((point) => point.saldoReal !== null)).toBe(true);
  });

  it("série vazia não quebra", () => {
    expect(
      buildCashFlowChartSeries({
        dailyNet: [],
        todayIndex: 0,
        monthStartBalance: 0,
        averageDailyExpense: 10,
      }),
    ).toEqual([]);
  });
});

describe("openingBalanceBeforeSeries", () => {
  it("desconta o realizado até hoje do saldo atual", () => {
    expect(openingBalanceBeforeSeries(200, [40, -10], 1)).toBe(170);
  });
});
