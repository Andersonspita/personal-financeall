"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { encryptSensitive } from "@/lib/crypto";
import { transactionInputSchema } from "@/lib/validation";
import {
  anomalyWindowAround,
  evaluateTransactionForAnomalies,
  type AnomalyCandidateTransaction,
} from "@/lib/rules/anomaly-detection";
import { recordVulnerabilityAssessment } from "@/lib/insights";
import { maybeGenerateNudge } from "@/lib/nudges";
import { syncBudgetAlertsForCategory } from "@/lib/budget-alerts";
import { categoryLaunchTypeError } from "@/lib/budgeting";
import { DomainError, fieldErrorsFromZod, logAppError } from "@/lib/errors";

export type SaveTransactionSuccess = {
  ok: true;
  isImpulse: boolean;
  nudge: { id: string; message: string } | null;
  vulnerabilityLevel: string;
};

export type SaveTransactionFailure = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string>;
};

export type SaveTransactionResult = SaveTransactionSuccess | SaveTransactionFailure;

function saveTransactionFailure(err: unknown): SaveTransactionFailure {
  if (err instanceof z.ZodError) {
    return {
      ok: false,
      error: err.issues[0]?.message ?? "Revise os campos e tente de novo.",
      fieldErrors: fieldErrorsFromZod(err),
    };
  }
  if (err instanceof DomainError) {
    return {
      ok: false,
      error: err.message,
      fieldErrors: err.field ? { [err.field]: err.message } : undefined,
    };
  }
  logAppError("transactions.save", err);
  return { ok: false, error: "Não foi possível salvar o lançamento. Tente de novo em instantes." };
}

async function loadNearbyAnomalyCandidates(
  userId: string,
  occurredAt: Date,
  excludeTransactionId?: string,
): Promise<AnomalyCandidateTransaction[]> {
  const { from, to } = anomalyWindowAround(occurredAt);
  const nearbyRaw = await prisma.transaction.findMany({
    where: {
      userId,
      occurredAt: { gte: from, lte: to },
      ...(excludeTransactionId ? { id: { not: excludeTransactionId } } : {}),
    },
    select: { type: true, essential: true, occurredAt: true },
  });
  return nearbyRaw.map((row) => ({
    type: row.type as "receita" | "despesa",
    essential: row.essential,
    occurredAt: row.occurredAt,
  }));
}

/** Conta e categoria precisam ser do usuário autenticado (evita gravar com IDs de outra conta). */
async function assertOwnedAccountAndCategory(
  userId: string,
  accountId: string,
  categoryId: string | undefined,
  launchType: "receita" | "despesa",
  options?: { allowArchivedCategoryId?: string | null },
) {
  const account = await prisma.account.findFirst({ where: { id: accountId, userId } });
  if (!account) throw new DomainError("Conta não encontrada.", "accountId");
  if (!categoryId) return;
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) throw new DomainError("Categoria não encontrada.", "categoryId");
  if (category.archived && category.id !== options?.allowArchivedCategoryId) {
    throw new DomainError("Essa categoria está arquivada. Reative-a em Orçamentos ou escolha outra.", "categoryId");
  }
  const mismatch = categoryLaunchTypeError(launchType, category.group);
  if (mismatch) throw new DomainError(mismatch, "categoryId");
}

function revalidateAfterSave(transactionId?: string) {
  revalidatePath("/");
  revalidatePath("/transacoes");
  revalidatePath("/correlacao");
  revalidatePath("/orcamentos");
  if (transactionId) revalidatePath(`/transacoes/${transactionId}/editar`);
}

export async function createTransaction(input: unknown): Promise<SaveTransactionResult> {
  try {
    const user = await requireUser();
    const payload = transactionInputSchema.parse(input);

    await assertOwnedAccountAndCategory(user.id, payload.accountId, payload.categoryId, payload.type);

    const nearby = await loadNearbyAnomalyCandidates(user.id, payload.occurredAt);
    const current: AnomalyCandidateTransaction = {
      type: payload.type,
      essential: payload.essential,
      occurredAt: payload.occurredAt,
    };
    const { isImpulse } = evaluateTransactionForAnomalies(current, [...nearby, current]);

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: payload.accountId,
        categoryId: payload.categoryId,
        type: payload.type,
        amount: payload.amount,
        essential: payload.essential,
        description: payload.description,
        occurredAt: payload.occurredAt,
        isImpulse,
      },
    });

    if (payload.emotion) {
      await prisma.emotionLog.create({
        data: {
          transactionId: transaction.id,
          emotion: payload.emotion.emotion,
          intensity: payload.emotion.intensity,
          noteEncrypted: payload.emotion.note ? encryptSensitive(payload.emotion.note) : undefined,
        },
      });
    }

    const [emotionNudge, budgetNudge, { assessment }] = await Promise.all([
      maybeGenerateNudge(user.id, transaction.id),
      syncBudgetAlertsForCategory(user.id, payload.categoryId, payload.occurredAt),
      recordVulnerabilityAssessment(user.id),
    ]);

    revalidateAfterSave();
    return {
      ok: true,
      isImpulse,
      nudge: budgetNudge ?? emotionNudge,
      vulnerabilityLevel: assessment.level,
    };
  } catch (err) {
    return saveTransactionFailure(err);
  }
}

export async function updateTransaction(transactionId: string, input: unknown): Promise<SaveTransactionResult> {
  try {
    const user = await requireUser();
    const payload = transactionInputSchema.parse(input);

    const existing = await prisma.transaction.findFirst({
      where: { id: transactionId, userId: user.id },
      include: { emotionLog: true },
    });
    if (!existing) throw new DomainError("Lançamento não encontrado.");

    await assertOwnedAccountAndCategory(user.id, payload.accountId, payload.categoryId, payload.type, {
      allowArchivedCategoryId: existing.categoryId,
    });

    const nearby = await loadNearbyAnomalyCandidates(user.id, payload.occurredAt, transactionId);
    const current: AnomalyCandidateTransaction = {
      type: payload.type,
      essential: payload.essential,
      occurredAt: payload.occurredAt,
    };
    const { isImpulse } = evaluateTransactionForAnomalies(current, [...nearby, current]);

    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        accountId: payload.accountId,
        categoryId: payload.categoryId ?? null,
        type: payload.type,
        amount: payload.amount,
        essential: payload.essential,
        description: payload.description,
        occurredAt: payload.occurredAt,
        isImpulse,
      },
    });

    if (payload.type === "receita" || !payload.emotion) {
      if (existing.emotionLog) {
        await prisma.emotionLog.delete({ where: { transactionId } });
      }
    } else if (payload.emotion) {
      const noteEncrypted = payload.emotion.note ? encryptSensitive(payload.emotion.note) : null;
      await prisma.emotionLog.upsert({
        where: { transactionId },
        create: {
          transactionId,
          emotion: payload.emotion.emotion,
          intensity: payload.emotion.intensity,
          noteEncrypted: noteEncrypted ?? undefined,
        },
        update: {
          emotion: payload.emotion.emotion,
          intensity: payload.emotion.intensity,
          noteEncrypted,
        },
      });
    }

    const [emotionNudge, budgetNudge, { assessment }] = await Promise.all([
      maybeGenerateNudge(user.id, transactionId),
      syncBudgetAlertsForCategory(user.id, payload.categoryId, payload.occurredAt),
      recordVulnerabilityAssessment(user.id),
    ]);

    revalidateAfterSave(transactionId);
    return {
      ok: true,
      isImpulse,
      nudge: budgetNudge ?? emotionNudge,
      vulnerabilityLevel: assessment.level,
    };
  } catch (err) {
    return saveTransactionFailure(err);
  }
}

export async function dismissImpulseFlag(transactionId: string): Promise<void> {
  const user = await requireUser();
  // Não-punitivo (RNF03): o usuário pode sempre dizer "isso não foi impulso" e o sistema aceita.
  await prisma.transaction.updateMany({
    where: { id: transactionId, userId: user.id },
    data: { isImpulse: false },
  });
  revalidatePath("/transacoes");
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  const user = await requireUser();
  await prisma.transaction.deleteMany({ where: { id: transactionId, userId: user.id } });
  revalidatePath("/");
  revalidatePath("/transacoes");
  revalidatePath("/orcamentos");
}
