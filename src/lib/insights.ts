import { prisma } from "@/lib/prisma";
import { EMOTIONS, IMPULSE_PRONE_EMOTIONS, type Emotion } from "@/lib/emotions";
import { assessVulnerability, type VulnerabilityAssessment } from "@/lib/rules/vulnerability-score";

const VULNERABILITY_WINDOW_DAYS = 7;

/** Quantas avaliações seguidas em nível "crítico" disparam o encaminhamento de apoio (RF09). */
export const CRITICAL_STREAK_THRESHOLD = 3;

/** Matriz de correlação Emoção × Gasto (RF05): soma e contagem de despesas por emoção. */
export async function getEmotionSpendMatrix(userId: string, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  return getEmotionSpendMatrixForRange(userId, since, new Date());
}

export async function getEmotionSpendMatrixForRange(userId: string, start: Date, end: Date) {
  const logs = await prisma.emotionLog.findMany({
    where: { transaction: { userId, type: "despesa", occurredAt: { gte: start, lte: end } } },
    include: { transaction: true },
  });

  const totals = new Map<Emotion, { total: number; count: number }>();
  for (const emotion of EMOTIONS) totals.set(emotion, { total: 0, count: 0 });

  for (const log of logs) {
    const entry = totals.get(log.emotion as Emotion);
    if (!entry) continue;
    entry.total += log.transaction.amount;
    entry.count += 1;
  }

  return EMOTIONS.map((emotion) => ({ emotion, ...totals.get(emotion)! })).sort((a, b) => b.total - a.total);
}

/** Coleta os sinais dos últimos `VULNERABILITY_WINDOW_DAYS` dias e calcula o score/nível (RF09). */
export async function computeCurrentVulnerability(userId: string): Promise<VulnerabilityAssessment> {
  const since = new Date();
  since.setDate(since.getDate() - VULNERABILITY_WINDOW_DAYS);

  const nonEssentialExpenses = await prisma.transaction.findMany({
    where: { userId, type: "despesa", essential: false, occurredAt: { gte: since } },
    include: { emotionLog: true },
  });

  const impulseTransactionCount = nonEssentialExpenses.filter((t) => t.isImpulse).length;
  const lateNightCount = nonEssentialExpenses.filter((t) => {
    const hour = t.occurredAt.getHours();
    return hour >= 0 && hour < 6;
  }).length;
  const withEmotion = nonEssentialExpenses.filter((t) => t.emotionLog);
  const impulseProneCount = withEmotion.filter((t) =>
    IMPULSE_PRONE_EMOTIONS.includes(t.emotionLog!.emotion as Emotion),
  ).length;
  const impulseProneEmotionRatio = withEmotion.length > 0 ? impulseProneCount / withEmotion.length : 0;

  return assessVulnerability({
    impulseTransactionCount,
    lateNightCount,
    totalNonEssentialCount: nonEssentialExpenses.length,
    impulseProneEmotionRatio,
  });
}

/** Persiste a avaliação atual e retorna também há quantas verificações consecutivas o nível está "crítico" (RF09). */
export async function recordVulnerabilityAssessment(userId: string) {
  const assessment = await computeCurrentVulnerability(userId);

  await prisma.vulnerabilityScore.create({
    data: {
      userId,
      score: assessment.score,
      level: assessment.level,
      factors: JSON.stringify(assessment.signals),
    },
  });

  const recent = await prisma.vulnerabilityScore.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 10,
  });

  let consecutiveCritical = 0;
  for (const entry of recent) {
    if (entry.level !== "critico") break;
    consecutiveCritical += 1;
  }

  return { assessment, consecutiveCritical };
}

/** Lê (sem gravar) quantas das últimas avaliações consecutivas vieram como "crítico" (RF09). */
export async function getConsecutiveCriticalStreak(userId: string, limit = 10): Promise<number> {
  const recent = await prisma.vulnerabilityScore.findMany({ where: { userId }, orderBy: { date: "desc" }, take: limit });
  let streak = 0;
  for (const entry of recent) {
    if (entry.level !== "critico") break;
    streak += 1;
  }
  return streak;
}
