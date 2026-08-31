import { DomainError } from "@/lib/errors";
import { isIncomeCategoryGroup } from "@/lib/budgeting";

export type CategoryKind = "renda" | "gasto";

export function categoryKind(group: string): CategoryKind {
  return isIncomeCategoryGroup(group) ? "renda" : "gasto";
}

/** Receita e despesa sempre precisam de pelo menos uma categoria ativa do tipo certo. */
export function assertCanArchiveCategory(kind: CategoryKind, activeCount: number): void {
  if (activeCount <= 1) {
    throw new DomainError(
      kind === "renda"
        ? "Deixe pelo menos uma categoria de renda para as receitas."
        : "Deixe pelo menos uma categoria de gasto para as despesas.",
    );
  }
}
