// Detector de anomalias e frequência (RF04). Lógica pura e determinística — sem I/O — para
// ser fácil de testar isoladamente (ver anomaly-detection.test.ts) e reutilizar tanto na
// criação de um lançamento quanto em reprocessamentos em lote.

export const FREQUENCY_WINDOW_HOURS = 24;
export const FREQUENCY_ANOMALY_THRESHOLD = 3; // "mais de 3 compras" => 4ª compra dispara o alerta
export const LATE_NIGHT_START_HOUR = 0;
export const LATE_NIGHT_END_HOUR = 6; // [0h, 6h) é considerado madrugada

export interface AnomalyCandidateTransaction {
  type: "receita" | "despesa";
  essential: boolean;
  occurredAt: Date;
}

export interface AnomalyResult {
  isImpulse: boolean;
  reasons: Array<"frequencia_24h" | "compra_madrugada">;
  nonEssentialCountIn24h: number;
}

function hoursBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60);
}

/** Conta quantas despesas não essenciais ocorreram na janela de 24h ao redor de `reference` (inclusive). */
export function countNonEssentialWithinWindow(
  transactions: AnomalyCandidateTransaction[],
  reference: Date,
  windowHours: number = FREQUENCY_WINDOW_HOURS,
): number {
  return transactions.filter(
    (t) => t.type === "despesa" && !t.essential && hoursBetween(t.occurredAt, reference) <= windowHours,
  ).length;
}

/** Madrugada = fuso local do horário armazenado em `occurredAt`. */
export function isLateNightPurchase(occurredAt: Date): boolean {
  const hour = occurredAt.getHours();
  return hour >= LATE_NIGHT_START_HOUR && hour < LATE_NIGHT_END_HOUR;
}

/**
 * Avalia se um lançamento (já incluído em `transactionsIncludingCurrent`) deve ser sinalizado
 * como possível compra por impulso. O sinalizador é informativo, não punitivo: o usuário pode
 * sempre revisar e descartar (RNF03).
 */
export function evaluateTransactionForAnomalies(
  current: AnomalyCandidateTransaction,
  transactionsIncludingCurrent: AnomalyCandidateTransaction[],
): AnomalyResult {
  const nonEssentialCountIn24h = countNonEssentialWithinWindow(transactionsIncludingCurrent, current.occurredAt);
  const reasons: AnomalyResult["reasons"] = [];

  if (current.type === "despesa" && !current.essential && nonEssentialCountIn24h > FREQUENCY_ANOMALY_THRESHOLD) {
    reasons.push("frequencia_24h");
  }
  if (current.type === "despesa" && isLateNightPurchase(current.occurredAt)) {
    reasons.push("compra_madrugada");
  }

  return { isImpulse: reasons.length > 0, reasons, nonEssentialCountIn24h };
}
