import type { ContentListItem } from "@/lib/education/service";
import { profileTriggerToContentTag } from "@/lib/profile/constants";

/**
 * Ordena recomendações: emoção observada nos gastos tem prioridade; se não houver histórico,
 * usa o gatilho declarado no perfil (cold start do RF10).
 */
export function rankRecommendedContent(
  library: ContentListItem[],
  options: {
    topObservedEmotion?: string | null;
    declaredTrigger?: string | null;
    limit?: number;
  },
): ContentListItem[] {
  const limit = options.limit ?? 3;
  const notCompleted = library.filter((c) => !c.completedAt);
  if (notCompleted.length === 0) return [];

  const primaryTag =
    options.topObservedEmotion && options.topObservedEmotion.length > 0
      ? options.topObservedEmotion
      : profileTriggerToContentTag(options.declaredTrigger as never);

  if (!primaryTag) return notCompleted.slice(0, limit);

  const matching = notCompleted.filter((c) => c.tag === primaryTag);
  const rest = notCompleted.filter((c) => c.tag !== primaryTag);
  return [...matching, ...rest].slice(0, limit);
}
