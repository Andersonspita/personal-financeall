// Vocabulário emocional usado nos lançamentos (RF01) e nos relatórios comportamentais (RF05).
// Mantido separado da modelagem financeira para reforçar o isolamento de dados sensíveis (RNF02).

export const EMOTIONS = [
  "ansioso",
  "entediado",
  "estressado",
  "triste",
  "feliz",
  "neutro",
  "necessidade_real",
] as const;

export type Emotion = (typeof EMOTIONS)[number];

export const EMOTION_LABELS: Record<Emotion, string> = {
  ansioso: "Ansioso(a)",
  entediado: "Entediado(a)",
  estressado: "Estressado(a)",
  triste: "Triste",
  feliz: "Feliz",
  neutro: "Neutro",
  necessidade_real: "Necessidade real",
};

export const EMOTION_EMOJI: Record<Emotion, string> = {
  ansioso: "😰",
  entediado: "🥱",
  estressado: "😤",
  triste: "😔",
  feliz: "😄",
  neutro: "😐",
  necessidade_real: "🎯",
};

// Emoções associadas a compras não planejadas, usadas pelo motor de correlação (RF05)
// e pelo motor de regras de anomalia (RF04). "necessidade_real" e "feliz" ficam de fora
// de propósito: não tratamos toda emoção como risco, só os gatilhos mais comuns de compra por impulso.
export const IMPULSE_PRONE_EMOTIONS: Emotion[] = [
  "ansioso",
  "entediado",
  "estressado",
  "triste",
];
