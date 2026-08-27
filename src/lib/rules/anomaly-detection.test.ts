import { describe, expect, it } from "vitest";
import {
  countNonEssentialWithinWindow,
  evaluateTransactionForAnomalies,
  isLateNightPurchase,
  type AnomalyCandidateTransaction,
} from "./anomaly-detection";

function txn(hoursAgo: number, overrides: Partial<AnomalyCandidateTransaction> = {}): AnomalyCandidateTransaction {
  const now = new Date("2026-08-20T12:00:00");
  return {
    type: "despesa",
    essential: false,
    occurredAt: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000),
    ...overrides,
  };
}

describe("countNonEssentialWithinWindow", () => {
  it("ignora despesas essenciais e receitas", () => {
    const reference = new Date("2026-08-20T12:00:00");
    const transactions = [
      txn(1),
      txn(2, { essential: true }),
      txn(3, { type: "receita" }),
    ];
    expect(countNonEssentialWithinWindow(transactions, reference)).toBe(1);
  });

  it("ignora transações fora da janela de 24h", () => {
    const reference = new Date("2026-08-20T12:00:00");
    const transactions = [txn(1), txn(23.9), txn(24.1), txn(48)];
    expect(countNonEssentialWithinWindow(transactions, reference)).toBe(2);
  });
});

describe("isLateNightPurchase", () => {
  it.each([
    ["2026-08-20T00:00:00", true],
    ["2026-08-20T03:30:00", true],
    ["2026-08-20T05:59:00", true],
    ["2026-08-20T06:00:00", false],
    ["2026-08-20T14:00:00", false],
    ["2026-08-20T23:59:00", false],
  ])("%s -> %s", (iso, expected) => {
    expect(isLateNightPurchase(new Date(iso))).toBe(expected);
  });
});

describe("evaluateTransactionForAnomalies", () => {
  it("não sinaliza quando há poucas compras não essenciais no dia", () => {
    const current = txn(0);
    const history = [current, txn(1), txn(2)];
    const result = evaluateTransactionForAnomalies(current, history);
    expect(result.isImpulse).toBe(false);
    expect(result.reasons).toEqual([]);
  });

  it("sinaliza frequência quando ultrapassa o limiar (mais de 3 em 24h)", () => {
    const current = txn(0);
    const history = [current, txn(1), txn(2), txn(3)];
    const result = evaluateTransactionForAnomalies(current, history);
    expect(result.nonEssentialCountIn24h).toBe(4);
    expect(result.isImpulse).toBe(true);
    expect(result.reasons).toContain("frequencia_24h");
  });

  it("sinaliza compra de madrugada mesmo sem anomalia de frequência", () => {
    const current: AnomalyCandidateTransaction = {
      type: "despesa",
      essential: false,
      occurredAt: new Date("2026-08-20T03:00:00"),
    };
    const result = evaluateTransactionForAnomalies(current, [current]);
    expect(result.isImpulse).toBe(true);
    expect(result.reasons).toEqual(["compra_madrugada"]);
  });

  it("nunca sinaliza despesas essenciais por frequência", () => {
    const current = txn(0, { essential: true });
    const history = [current, txn(1, { essential: true }), txn(2, { essential: true }), txn(3, { essential: true })];
    const result = evaluateTransactionForAnomalies(current, history);
    expect(result.reasons).not.toContain("frequencia_24h");
  });

  it("ignora receitas", () => {
    const current: AnomalyCandidateTransaction = {
      type: "receita",
      essential: false,
      occurredAt: new Date("2026-08-20T03:00:00"),
    };
    const result = evaluateTransactionForAnomalies(current, [current]);
    expect(result.isImpulse).toBe(false);
  });
});
