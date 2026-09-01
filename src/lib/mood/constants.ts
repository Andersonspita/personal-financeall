import type { Emotion } from "@/lib/emotions";
import { EMOTION_EMOJI, EMOTION_LABELS } from "@/lib/emotions";

/** Humores do check-in diário — sem "necessidade_real", que é específico de compra. */
export const DAILY_MOOD_OPTIONS = [
  "ansioso",
  "entediado",
  "estressado",
  "triste",
  "feliz",
  "neutro",
] as const satisfies readonly Emotion[];

export type DailyMood = (typeof DAILY_MOOD_OPTIONS)[number];

export const DAILY_MOOD_LABELS: Record<DailyMood, string> = {
  ansioso: EMOTION_LABELS.ansioso,
  entediado: EMOTION_LABELS.entediado,
  estressado: EMOTION_LABELS.estressado,
  triste: EMOTION_LABELS.triste,
  feliz: EMOTION_LABELS.feliz,
  neutro: EMOTION_LABELS.neutro,
};

export const DAILY_MOOD_EMOJI: Record<DailyMood, string> = {
  ansioso: EMOTION_EMOJI.ansioso,
  entediado: EMOTION_EMOJI.entediado,
  estressado: EMOTION_EMOJI.estressado,
  triste: EMOTION_EMOJI.triste,
  feliz: EMOTION_EMOJI.feliz,
  neutro: EMOTION_EMOJI.neutro,
};
