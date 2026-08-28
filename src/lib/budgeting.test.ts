import { describe, expect, it } from "vitest";
import {
  getBudgetAlertLevel,
  projectEndOfMonthBalance,
  filterCategoriesByLaunchType,
  budgetMonthKey,
  nextBudgetAlertStamps,
} from "./budgeting";

describe("getBudgetAlertLevel", () => {
  it("dentro do limite abaixo de 80%", () => {
    expect(getBudgetAlertLevel(79, 100)).toBe("dentro_do_limite");
  });

  it("alerta exatamente em 80%", () => {
    expect(getBudgetAlertLevel(80, 100)).toBe("alerta_80");
  });

  it("estourado ao atingir 100%", () => {
    expect(getBudgetAlertLevel(100, 100)).toBe("estourado");
  });

  it("estourado ao ultrapassar 100%", () => {
    expect(getBudgetAlertLevel(150, 100)).toBe("estourado");
  });

  it("nunca estoura com limite zero ou negativo", () => {
    expect(getBudgetAlertLevel(50, 0)).toBe("dentro_do_limite");
  });
});

describe("budgetMonthKey", () => {
  it("formata YYYY-MM no fuso local", () => {
    expect(budgetMonthKey(new Date(2026, 7, 28))).toBe("2026-08");
  });
});

describe("nextBudgetAlertStamps", () => {
  const now = new Date("2026-08-28T12:00:00");

  it("não dispara abaixo de 80%", () => {
    const result = nextBudgetAlertStamps({
      spent: 79,
      limitAmount: 100,
      alert80SentAt: null,
      alert100SentAt: null,
      now,
    });
    expect(result.newlyFired).toEqual([]);
    expect(result.alert80SentAt).toBeNull();
    expect(result.alert100SentAt).toBeNull();
  });

  it("grava 80% na primeira vez", () => {
    const result = nextBudgetAlertStamps({
      spent: 80,
      limitAmount: 100,
      alert80SentAt: null,
      alert100SentAt: null,
      now,
    });
    expect(result.newlyFired).toEqual(["alerta_80"]);
    expect(result.alert80SentAt).toBe(now);
    expect(result.alert100SentAt).toBeNull();
  });

  it("não regrava 80% no mesmo mês", () => {
    const already = new Date("2026-08-10T09:00:00");
    const result = nextBudgetAlertStamps({
      spent: 90,
      limitAmount: 100,
      alert80SentAt: already,
      alert100SentAt: null,
      now,
    });
    expect(result.newlyFired).toEqual([]);
    expect(result.alert80SentAt).toBe(already);
  });

  it("ao saltar o teto, grava 80% e 100%", () => {
    const result = nextBudgetAlertStamps({
      spent: 110,
      limitAmount: 100,
      alert80SentAt: null,
      alert100SentAt: null,
      now,
    });
    expect(result.newlyFired).toEqual(["alerta_80", "estourado"]);
    expect(result.alert80SentAt).toBe(now);
    expect(result.alert100SentAt).toBe(now);
  });

  it("com 80% já gravado, só dispara 100%", () => {
    const already80 = new Date("2026-08-15T09:00:00");
    const result = nextBudgetAlertStamps({
      spent: 100,
      limitAmount: 100,
      alert80SentAt: already80,
      alert100SentAt: null,
      now,
    });
    expect(result.newlyFired).toEqual(["estourado"]);
    expect(result.alert80SentAt).toBe(already80);
    expect(result.alert100SentAt).toBe(now);
  });
});

describe("filterCategoriesByLaunchType", () => {
  const cats = [
    { name: "Moradia", group: "essencial" },
    { name: "Salário", group: "renda" },
    { name: "Lazer", group: "variavel" },
  ];

  it("na receita mostra só categorias de renda", () => {
    expect(filterCategoriesByLaunchType(cats, "receita").map((c) => c.name)).toEqual(["Salário"]);
  });

  it("na despesa omite categorias de renda", () => {
    expect(filterCategoriesByLaunchType(cats, "despesa").map((c) => c.name)).toEqual(["Moradia", "Lazer"]);
  });
});

describe("projectEndOfMonthBalance", () => {
  it("soma renda futura e subtrai gasto médio projetado", () => {
    const result = projectEndOfMonthBalance({
      currentBalance: 1000,
      incomeRemainingThisMonth: 500,
      averageDailyExpense: 50,
      daysRemainingInMonth: 10,
    });
    expect(result).toBe(1000 + 500 - 50 * 10);
  });
});
