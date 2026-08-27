// Regras do teto de orçamento por categoria (RF02): alerta em 80% e 100% do limite.
// Também classifica categorias no espírito 50-30-20 (essencial / variável / poupança) para o
// dashboard de fluxo de caixa (RF03).

export type BudgetAlertLevel = "dentro_do_limite" | "alerta_80" | "estourado";

export function getBudgetAlertLevel(spent: number, limitAmount: number): BudgetAlertLevel {
  if (limitAmount <= 0) return "dentro_do_limite";
  const ratio = spent / limitAmount;
  if (ratio >= 1) return "estourado";
  if (ratio >= 0.8) return "alerta_80";
  return "dentro_do_limite";
}

export const BUDGET_GROUPS = ["essencial", "variavel", "poupanca"] as const;
export type BudgetGroup = (typeof BUDGET_GROUPS)[number];

/** `renda` é para receitas (salário, freelance). Não entra no 50-30-20 nem nos tetos de gasto. */
export const INCOME_CATEGORY_GROUP = "renda";
export const CATEGORY_GROUPS = ["essencial", "variavel", "poupanca", "renda"] as const;
export type CategoryGroup = (typeof CATEGORY_GROUPS)[number];

export function isIncomeCategoryGroup(group: string): boolean {
  return group === INCOME_CATEGORY_GROUP;
}

/** No lançamento, receita só vê categorias de renda; despesa só vê categorias de gasto. */
export function filterCategoriesByLaunchType<T extends { group: string }>(
  categories: T[],
  type: "receita" | "despesa",
): T[] {
  return categories.filter((c) =>
    type === "receita" ? isIncomeCategoryGroup(c.group) : !isIncomeCategoryGroup(c.group),
  );
}

// Metas de referência do modelo 50-30-20 (percentual da renda líquida).
export const CATEGORY_GROUP_TARGET_RATIO: Record<BudgetGroup, number> = {
  essencial: 0.5,
  variavel: 0.3,
  poupanca: 0.2,
};

export interface CashFlowProjectionInput {
  currentBalance: number;
  incomeRemainingThisMonth: number;
  averageDailyExpense: number;
  daysRemainingInMonth: number;
}

/** Projeção simples e linear de saldo até o fim do mês (RF03). */
export function projectEndOfMonthBalance(input: CashFlowProjectionInput): number {
  const projectedExpenses = input.averageDailyExpense * input.daysRemainingInMonth;
  return input.currentBalance + input.incomeRemainingThisMonth - projectedExpenses;
}
