import { z } from "zod";
import { EMOTIONS } from "@/lib/emotions";
import { CATEGORY_GROUPS } from "@/lib/budgeting";

const moneyAmount = z
  .number({ error: "Informe um valor numérico" })
  .finite("Informe um valor numérico")
  .positive("O valor precisa ser maior que zero");

export const accountInputSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da conta").max(80, "Nome muito longo"),
  type: z.enum(["corrente", "poupanca", "cartao_credito", "dinheiro", "investimento"], {
    error: "Escolha um tipo de conta",
  }),
  initialBalance: z.number({ error: "Informe um saldo inicial numérico" }).finite().default(0),
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da categoria").max(60, "Nome muito longo"),
  group: z.enum(CATEGORY_GROUPS, { error: "Escolha um grupo" }),
  icon: z.string().max(10, "Ícone muito longo").optional(),
  color: z.string().max(20).optional(),
  monthlyLimit: z
    .number({ error: "Informe um teto numérico" })
    .finite("Informe um teto numérico")
    .positive("O teto precisa ser maior que zero")
    .optional(),
});

export const emotionLogInputSchema = z.object({
  emotion: z.enum(EMOTIONS, { error: "Escolha um estado emocional" }),
  intensity: z.number().int().min(1).max(5).optional(),
  note: z.string().max(500, "O comentário pode ter no máximo 500 caracteres").optional(),
});

export const transactionInputSchema = z.object({
  accountId: z.string().min(1, "Escolha uma conta"),
  categoryId: z.string().min(1).optional(),
  type: z.enum(["receita", "despesa"], { error: "Escolha receita ou despesa" }),
  amount: moneyAmount,
  essential: z.boolean().default(true),
  description: z.string().max(200, "A descrição pode ter no máximo 200 caracteres").optional(),
  occurredAt: z.coerce.date({ error: "Informe uma data válida" }),
  emotion: emotionLogInputSchema.optional(),
});

export const budgetInputSchema = z.object({
  categoryId: z.string().min(1, "Escolha uma categoria"),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use o formato AAAA-MM"),
  limitAmount: moneyAmount,
});

export const wishlistItemInputSchema = z.object({
  name: z.string().trim().min(1, "Diga o que você quer comprar").max(120, "Nome muito longo"),
  amount: moneyAmount,
  categoryId: z.string().min(1).optional(),
  cooldownHours: z
    .number({ error: "Escolha o tempo de espera" })
    .int("Escolha 24, 48 ou 72 horas")
    .min(24, "O mínimo de espera é 24 horas")
    .max(72, "O máximo de espera é 72 horas")
    .default(48),
});

export const panicSessionInputSchema = z.object({
  activityId: z.string().min(1).optional(),
});
