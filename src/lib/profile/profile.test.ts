import { describe, expect, it } from "vitest";
import { behavioralProfileInputSchema } from "@/lib/profile/schemas";
import { profileTriggerToContentTag } from "@/lib/profile/constants";
import { rankRecommendedContent } from "@/lib/profile/recommendation";
import type { ContentListItem } from "@/lib/education/service";

const library: ContentListItem[] = [
  {
    id: "1",
    slug: "ansiedade",
    title: "Ansiedade",
    summary: "",
    tag: "ansioso",
    estimatedMinutes: 5,
    completedAt: null,
  },
  {
    id: "2",
    slug: "tedio",
    title: "Tédio",
    summary: "",
    tag: "entediado",
    estimatedMinutes: 5,
    completedAt: null,
  },
  {
    id: "3",
    slug: "orcamento",
    title: "Orçamento",
    summary: "",
    tag: "orcamento",
    estimatedMinutes: 5,
    completedAt: null,
  },
];

describe("behavioralProfileInputSchema", () => {
  const valid = {
    primaryGoal: "menos_impulso" as const,
    typicalTrigger: "ansioso" as const,
    cooldownHours: 48,
    incomeRhythm: "irregular" as const,
    supportStyle: "suave" as const,
  };

  it("aceita perfil completo válido", () => {
    expect(behavioralProfileInputSchema.parse(valid).cooldownHours).toBe(48);
  });

  it("rejeita cooldown fora de 24–72", () => {
    expect(behavioralProfileInputSchema.safeParse({ ...valid, cooldownHours: 12 }).success).toBe(false);
  });

  it("rejeita gatilho inválido", () => {
    expect(behavioralProfileInputSchema.safeParse({ ...valid, typicalTrigger: "raiva" }).success).toBe(false);
  });
});

describe("profileTriggerToContentTag", () => {
  it("mapeia emoções para tag de conteúdo", () => {
    expect(profileTriggerToContentTag("ansioso")).toBe("ansioso");
    expect(profileTriggerToContentTag("necessidade_real")).toBe("autoconhecimento");
    expect(profileTriggerToContentTag("nao_sei")).toBeNull();
  });
});

describe("rankRecommendedContent", () => {
  it("prioriza emoção observada nos gastos", () => {
    const result = rankRecommendedContent(library, { topObservedEmotion: "entediado", limit: 2 });
    expect(result[0]?.tag).toBe("entediado");
  });

  it("usa gatilho declarado quando não há histórico", () => {
    const result = rankRecommendedContent(library, { declaredTrigger: "ansioso", limit: 2 });
    expect(result[0]?.tag).toBe("ansioso");
  });

  it("não deixa emoção observada ser substituída pelo perfil", () => {
    const result = rankRecommendedContent(library, {
      topObservedEmotion: "entediado",
      declaredTrigger: "ansioso",
      limit: 2,
    });
    expect(result[0]?.tag).toBe("entediado");
  });

  it("retorna primeiros não concluídos sem tag", () => {
    const result = rankRecommendedContent(library, { limit: 2 });
    expect(result).toHaveLength(2);
    expect(result[0]?.slug).toBe("ansiedade");
  });
});
