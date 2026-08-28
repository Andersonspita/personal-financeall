import { describe, expect, it } from "vitest";
import {
  accountInputSchema,
  budgetInputSchema,
  categoryInputSchema,
  transactionInputSchema,
  wishlistItemInputSchema,
} from "./validation";
import { fieldErrorsFromZod } from "./errors";
import { categoryLaunchTypeError } from "./budgeting";

describe("transactionInputSchema", () => {
  const valid = {
    accountId: "acc_1",
    type: "despesa" as const,
    amount: 12.5,
    occurredAt: new Date("2026-08-28T12:00:00"),
  };

  it("aceita um lançamento mínimo válido", () => {
    expect(transactionInputSchema.parse(valid).amount).toBe(12.5);
  });

  it("rejeita valor zero", () => {
    const parsed = transactionInputSchema.safeParse({ ...valid, amount: 0 });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(fieldErrorsFromZod(parsed.error).amount).toMatch(/maior que zero/i);
    }
  });

  it("rejeita valor negativo", () => {
    const parsed = transactionInputSchema.safeParse({ ...valid, amount: -10 });
    expect(parsed.success).toBe(false);
  });

  it("rejeita NaN e Infinity", () => {
    expect(transactionInputSchema.safeParse({ ...valid, amount: Number.NaN }).success).toBe(false);
    expect(transactionInputSchema.safeParse({ ...valid, amount: Number.POSITIVE_INFINITY }).success).toBe(false);
  });

  it("rejeita conta vazia", () => {
    const parsed = transactionInputSchema.safeParse({ ...valid, accountId: "" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(fieldErrorsFromZod(parsed.error).accountId).toMatch(/conta/i);
    }
  });

  it("rejeita data inválida", () => {
    const parsed = transactionInputSchema.safeParse({ ...valid, occurredAt: "não-é-data" });
    expect(parsed.success).toBe(false);
  });

  it("guarda descrição com markup como texto (React escapa na tela)", () => {
    const parsed = transactionInputSchema.parse({
      ...valid,
      description: "<script>alert(1)</script>",
    });
    expect(parsed.description).toBe("<script>alert(1)</script>");
  });

  it("rejeita descrição acima de 200 caracteres", () => {
    const parsed = transactionInputSchema.safeParse({ ...valid, description: "x".repeat(201) });
    expect(parsed.success).toBe(false);
  });
});

describe("validação + tipo de categoria (fluxo combinado)", () => {
  it("payload válido ainda falha se a categoria não combina com o tipo", () => {
    const parsed = transactionInputSchema.parse({
      accountId: "acc_1",
      categoryId: "cat_salario",
      type: "despesa",
      amount: 40,
      occurredAt: new Date("2026-08-28T12:00:00"),
    });
    expect(categoryLaunchTypeError(parsed.type, "renda")).toMatch(/renda/);
  });
});

describe("budgetInputSchema", () => {
  it("rejeita mês 13 e formato solto", () => {
    expect(budgetInputSchema.safeParse({ categoryId: "c1", month: "2026-13", limitAmount: 100 }).success).toBe(false);
    expect(budgetInputSchema.safeParse({ categoryId: "c1", month: "08-2026", limitAmount: 100 }).success).toBe(false);
  });

  it("aceita AAAA-MM válido", () => {
    expect(budgetInputSchema.parse({ categoryId: "c1", month: "2026-08", limitAmount: 100 }).month).toBe("2026-08");
  });
});

describe("wishlistItemInputSchema", () => {
  it("rejeita nome vazio e espera fora de 24–72h", () => {
    expect(
      wishlistItemInputSchema.safeParse({ name: "   ", amount: 50, cooldownHours: 48 }).success,
    ).toBe(false);
    expect(
      wishlistItemInputSchema.safeParse({ name: "Fone", amount: 50, cooldownHours: 23 }).success,
    ).toBe(false);
    expect(
      wishlistItemInputSchema.safeParse({ name: "Fone", amount: 50, cooldownHours: 73 }).success,
    ).toBe(false);
  });

  it("aceita 24, 48 e 72 horas", () => {
    expect(wishlistItemInputSchema.parse({ name: "Fone", amount: 50, cooldownHours: 24 }).cooldownHours).toBe(24);
    expect(wishlistItemInputSchema.parse({ name: "Fone", amount: 50, cooldownHours: 72 }).cooldownHours).toBe(72);
  });
});

describe("categoryInputSchema", () => {
  it("rejeita nome vazio e grupo inválido", () => {
    expect(categoryInputSchema.safeParse({ name: "", group: "essencial" }).success).toBe(false);
    expect(categoryInputSchema.safeParse({ name: "Lazer", group: "luxo" }).success).toBe(false);
  });
});

describe("accountInputSchema", () => {
  it("rejeita nome vazio", () => {
    expect(accountInputSchema.safeParse({ name: "", type: "corrente" }).success).toBe(false);
  });

  it("aceita conta corrente com saldo inicial omitido", () => {
    const parsed = accountInputSchema.parse({ name: "Nubank", type: "corrente" });
    expect(parsed.initialBalance).toBe(0);
  });

  it("rejeita tipo desconhecido", () => {
    const parsed = accountInputSchema.safeParse({ name: "Carteira", type: "paypal" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(fieldErrorsFromZod(parsed.error).type).toMatch(/tipo/i);
    }
  });
});
