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

/** Chave `YYYY-MM` no fuso local, alinhada ao campo `Budget.month`. */
export function budgetMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export type BudgetAlertStampResult = {
  alert80SentAt: Date | null;
  alert100SentAt: Date | null;
  newlyFired: Array<"alerta_80" | "estourado">;
};

/**
 * Decide quais timestamps de alerta gravar. Cada limiar dispara no máximo uma vez por teto/mês:
 * se o gasto salta de 70% para 110%, registra 80% e 100%. Não apaga o que já foi gravado.
 */
export function nextBudgetAlertStamps(input: {
  spent: number;
  limitAmount: number;
  alert80SentAt: Date | null;
  alert100SentAt: Date | null;
  now?: Date;
}): BudgetAlertStampResult {
  const now = input.now ?? new Date();
  const level = getBudgetAlertLevel(input.spent, input.limitAmount);
  let alert80SentAt = input.alert80SentAt;
  let alert100SentAt = input.alert100SentAt;
  const newlyFired: Array<"alerta_80" | "estourado"> = [];

  if ((level === "alerta_80" || level === "estourado") && !alert80SentAt) {
    alert80SentAt = now;
    newlyFired.push("alerta_80");
  }
  if (level === "estourado" && !alert100SentAt) {
    alert100SentAt = now;
    newlyFired.push("estourado");
  }

  return { alert80SentAt, alert100SentAt, newlyFired };
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

export const CATEGORY_GROUP_LABEL: Record<CategoryGroup, string> = {
  essencial: "Essencial",
  variavel: "Variável",
  poupanca: "Poupança",
  renda: "Renda",
};

/** No lançamento, receita só vê categorias de renda; despesa só vê categorias de gasto. */
export function filterCategoriesByLaunchType<T extends { group: string }>(
  categories: T[],
  type: "receita" | "despesa",
): T[] {
  return categories.filter((c) =>
    type === "receita" ? isIncomeCategoryGroup(c.group) : !isIncomeCategoryGroup(c.group),
  );
}

export function categoryLaunchTypeError(type: "receita" | "despesa", group: string): string | null {
  if (type === "receita" && !isIncomeCategoryGroup(group)) {
    return "Categoria de gasto não pode ser usada em receita.";
  }
  if (type === "despesa" && isIncomeCategoryGroup(group)) {
    return "Categoria de renda não pode ser usada em despesa.";
  }
  return null;
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
