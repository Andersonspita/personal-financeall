import { EMOTION_EMOJI, EMOTION_LABELS, type Emotion } from "@/lib/emotions";

export const GENERAL_TAGS = ["orcamento", "poupanca", "compulsao", "autoconhecimento"] as const;
export type GeneralTag = (typeof GENERAL_TAGS)[number];

export const GENERAL_TAG_LABELS: Record<GeneralTag, string> = {
  orcamento: "Orçamento",
  poupanca: "Poupança",
  compulsao: "Compulsão",
  autoconhecimento: "Autoconhecimento",
};

export const GENERAL_TAG_EMOJI: Record<GeneralTag, string> = {
  orcamento: "📊",
  poupanca: "🛟",
  compulsao: "🔁",
  autoconhecimento: "🧭",
};

function isGeneralTag(tag: string): tag is GeneralTag {
  return (GENERAL_TAGS as readonly string[]).includes(tag);
}

export function tagLabel(tag: string): string {
  if (isGeneralTag(tag)) return GENERAL_TAG_LABELS[tag];
  return EMOTION_LABELS[tag as Emotion] ?? tag;
}

export function tagEmoji(tag: string): string {
  if (isGeneralTag(tag)) return GENERAL_TAG_EMOJI[tag];
  return EMOTION_EMOJI[tag as Emotion] ?? "💡";
}
