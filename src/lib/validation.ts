import { z } from "zod";
import { EMOTIONS } from "@/lib/emotions";
import { CATEGORY_GROUPS } from "@/lib/budgeting";

export const accountInputSchema = z.object({
  name: z.string().min(1).max(80),
  type: z.enum(["corrente", "poupanca", "cartao_credito", "dinheiro", "investimento"]),
  initialBalance: z.number().finite().default(0),
});

export const categoryInputSchema = z.object({
  name: z.string().min(1).max(60),
  group: z.enum(CATEGORY_GROUPS),
  icon: z.string().max(10).optional(),
  color: z.string().max(20).optional(),
  monthlyLimit: z.number().positive().optional(),
});

export const emotionLogInputSchema = z.object({
  emotion: z.enum(EMOTIONS),
  intensity: z.number().int().min(1).max(5).optional(),
  note: z.string().max(500).optional(),
});

export const transactionInputSchema = z.object({
  accountId: z.string().min(1),
  categoryId: z.string().min(1).optional(),
  type: z.enum(["receita", "despesa"]),
  amount: z.number().positive(),
  essential: z.boolean().default(true),
  description: z.string().max(200).optional(),
  occurredAt: z.coerce.date(),
  emotion: emotionLogInputSchema.optional(),
});

export const budgetInputSchema = z.object({
  categoryId: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Use o formato AAAA-MM"),
  limitAmount: z.number().positive(),
});

export const wishlistItemInputSchema = z.object({
  name: z.string().min(1).max(120),
  amount: z.number().positive(),
  categoryId: z.string().min(1).optional(),
  cooldownHours: z.number().int().min(24).max(72).default(48),
});

export const panicSessionInputSchema = z.object({
  activityId: z.string().min(1).optional(),
});
