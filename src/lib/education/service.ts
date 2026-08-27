import { prisma } from "@/lib/prisma";
import { getEmotionSpendMatrix } from "@/lib/insights";

export interface ContentListItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  tag: string;
  estimatedMinutes: number;
  completedAt: Date | null;
}

/** Lista toda a biblioteca, com o progresso de leitura deste usuário (RF07 estendido). */
export async function getContentLibrary(userId: string): Promise<ContentListItem[]> {
  const content = await prisma.educationalContent.findMany({
    orderBy: { order: "asc" },
    include: { progress: { where: { userId } } },
  });

  return content.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    summary: c.summary,
    tag: c.tag,
    estimatedMinutes: c.estimatedMinutes,
    completedAt: c.progress[0]?.completedAt ?? null,
  }));
}

export async function getContentBySlug(userId: string, slug: string) {
  const content = await prisma.educationalContent.findUnique({
    where: { slug },
    include: { progress: { where: { userId } } },
  });
  if (!content) return null;

  return {
    id: content.id,
    slug: content.slug,
    title: content.title,
    summary: content.summary,
    body: content.body,
    tag: content.tag,
    estimatedMinutes: content.estimatedMinutes,
    completedAt: content.progress[0]?.completedAt ?? null,
  };
}

/**
 * Recomenda conteúdo com base na emoção que mais aparece nos gastos recentes (mesmo cálculo da
 * Matriz Emoção × Gasto, RF05) — prioriza o que ainda não foi concluído.
 */
export async function getRecommendedContent(userId: string, limit = 3): Promise<ContentListItem[]> {
  const matrix = await getEmotionSpendMatrix(userId, 30);
  const topEmotion = matrix.find((m) => m.count > 0)?.emotion;

  const library = await getContentLibrary(userId);
  const notCompleted = library.filter((c) => !c.completedAt);

  if (!topEmotion) return notCompleted.slice(0, limit);

  const matching = notCompleted.filter((c) => c.tag === topEmotion);
  const rest = notCompleted.filter((c) => c.tag !== topEmotion);
  return [...matching, ...rest].slice(0, limit);
}
