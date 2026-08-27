import { describe, expect, it } from "vitest";
import { getBudgetAlertLevel, projectEndOfMonthBalance } from "./budgeting";

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
