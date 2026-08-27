import { prisma } from "@/lib/prisma";
import { IMPULSE_PRONE_EMOTIONS, type Emotion } from "@/lib/emotions";

const NUDGE_LOOKBACK_DAYS = 14;
const NUDGE_TRIGGER_COUNT = 3;

/**
 * Feed de nudges financeiros (RF07): quando uma mesma categoria acumula compras recorrentes
 * ligadas a emoções propensas a impulso, sugerimos uma microdica contextual. Evita repetir o
 * mesmo aviso em sequência checando se já existe um nudge recente e não descartado para a regra.
 */
export async function maybeGenerateNudge(
  userId: string,
  transactionId: string,
): Promise<{ id: string; message: string } | null> {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
    include: { category: true, emotionLog: true },
  });

  if (!transaction?.category || !transaction.emotionLog) return null;
  if (!IMPULSE_PRONE_EMOTIONS.includes(transaction.emotionLog.emotion as Emotion)) return null;

  const since = new Date();
  since.setDate(since.getDate() - NUDGE_LOOKBACK_DAYS);

  const recentCount = await prisma.transaction.count({
    where: {
      userId,
      categoryId: transaction.categoryId,
      type: "despesa",
      occurredAt: { gte: since },
      emotionLog: { emotion: { in: IMPULSE_PRONE_EMOTIONS } },
    },
  });

  if (recentCount < NUDGE_TRIGGER_COUNT) return null;

  const triggerRule = `categoria_recorrente:${transaction.category.name}`;
  const alreadyNudged = await prisma.nudge.findFirst({
    where: { userId, triggerRule, dismissedAt: null },
  });
  if (alreadyNudged) return null;

  const message = `Nos últimos ${NUDGE_LOOKBACK_DAYS} dias, "${transaction.category.name}" apareceu ${recentCount} vezes ligado a momentos difíceis. Sem cobranças — só um convite para pensar em uma alternativa mais leve para esses momentos, se fizer sentido para você.`;

  const nudge = await prisma.nudge.create({
    data: { userId, message, triggerRule, category: transaction.category.name },
  });

  return { id: nudge.id, message: nudge.message };
}
