import { DomainError } from "@/lib/errors";

export const ACCOUNT_TYPES = ["corrente", "poupanca", "cartao_credito", "dinheiro", "investimento"] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  corrente: "Conta corrente",
  poupanca: "Poupança",
  cartao_credito: "Cartão de crédito",
  dinheiro: "Dinheiro / carteira",
  investimento: "Investimento",
};

/** Não dá para arquivar a última conta ativa: o lançamento sempre precisa de um destino. */
export function assertCanArchiveAccount(activeCount: number): void {
  if (activeCount <= 1) {
    throw new DomainError("Deixe pelo menos uma conta ativa para os lançamentos.");
  }
}
