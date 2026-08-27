"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { encryptSensitive } from "@/lib/crypto";
import { transactionInputSchema } from "@/lib/validation";
import { evaluateTransactionForAnomalies, type AnomalyCandidateTransaction } from "@/lib/rules/anomaly-detection";
import { recordVulnerabilityAssessment } from "@/lib/insights";
import { maybeGenerateNudge } from "@/lib/nudges";

export interface CreateTransactionResult {
  isImpulse: boolean;
  nudge: { id: string; message: string } | null;
  vulnerabilityLevel: string;
}

export async function createTransaction(input: unknown): Promise<CreateTransactionResult> {
  const user = await requireUser();
  const data = transactionInputSchema.parse(input);

  // Garante que a conta (e a categoria, se houver) realmente pertencem a quem está lançando —
  // sem isso, um accountId de outro usuário poderia ser usado para gravar dados fora do lugar.
  const account = await prisma.account.findFirst({ where: { id: data.accountId, userId: user.id } });
  if (!account) throw new Error("Conta não encontrada.");
  if (data.categoryId) {
    const category = await prisma.category.findFirst({ where: { id: data.categoryId, userId: user.id } });
    if (!category) throw new Error("Categoria não encontrada.");
  }

  // Janela de +/-24h ao redor do lançamento para o detector de frequência (RF04) funcionar
  // mesmo com lançamentos retroativos, não só em tempo real.
  const windowStart = new Date(data.occurredAt.getTime() - 24 * 60 * 60 * 1000);
  const windowEnd = new Date(data.occurredAt.getTime() + 24 * 60 * 60 * 1000);
  const nearbyRaw = await prisma.transaction.findMany({
    where: { userId: user.id, occurredAt: { gte: windowStart, lte: windowEnd } },
    select: { type: true, essential: true, occurredAt: true },
  });
  const nearby: AnomalyCandidateTransaction[] = nearbyRaw.map((t) => ({
    type: t.type as "receita" | "despesa",
    essential: t.essential,
    occurredAt: t.occurredAt,
  }));

  const current: AnomalyCandidateTransaction = {
    type: data.type,
    essential: data.essential,
    occurredAt: data.occurredAt,
  };
  const { isImpulse } = evaluateTransactionForAnomalies(current, [...nearby, current]);

  const transaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: data.accountId,
      categoryId: data.categoryId,
      type: data.type,
      amount: data.amount,
      essential: data.essential,
      description: data.description,
      occurredAt: data.occurredAt,
      isImpulse,
    },
  });

  if (data.emotion) {
    await prisma.emotionLog.create({
      data: {
        transactionId: transaction.id,
        emotion: data.emotion.emotion,
        intensity: data.emotion.intensity,
        noteEncrypted: data.emotion.note ? encryptSensitive(data.emotion.note) : undefined,
      },
    });
  }

  const [nudge, { assessment }] = await Promise.all([
    maybeGenerateNudge(user.id, transaction.id),
    recordVulnerabilityAssessment(user.id),
  ]);

  revalidatePath("/");
  revalidatePath("/transacoes");
  revalidatePath("/correlacao");

  return { isImpulse, nudge, vulnerabilityLevel: assessment.level };
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
}
