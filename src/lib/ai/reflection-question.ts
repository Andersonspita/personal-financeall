import "server-only";
import { getAiClient, getAiModel } from "@/lib/ai/client";
import { AI_SYSTEM_GUARDRAILS } from "@/lib/ai/prompts";

export interface WishlistItemContext {
  name: string;
  amount: number;
  categoryName?: string | null;
}

/**
 * Gera UMA pergunta de reflexão para ajudar a decidir se o item de desejo é uma necessidade
 * real, no espírito da Trava de Resfriamento (RF06). Só recebe nome/valor/categoria do item —
 * nunca dados emocionais.
 */
export async function generateReflectionQuestion(item: WishlistItemContext): Promise<string> {
  const context = `Item: "${item.name}", valor estimado R$ ${item.amount.toFixed(2)}${item.categoryName ? `, categoria: ${item.categoryName}` : ""}.`;

  const response = await getAiClient().chat.completions.create({
    model: getAiModel(),
    max_tokens: 100,
    temperature: 0.8,
    messages: [
      { role: "system", content: AI_SYSTEM_GUARDRAILS },
      {
        role: "user",
        content: `Gere apenas UMA pergunta curta e gentil de reflexão (não uma lista, não uma explicação) para ajudar a pessoa a decidir se essa compra é uma necessidade real ou um impulso do momento. ${context}`,
      },
    ],
  });

  return response.choices[0]?.message?.content?.trim() || "Você ainda vai querer isso amanhã, sem a urgência de agora?";
}
