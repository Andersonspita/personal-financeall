import {
  INCOME_RHYTHM_LABELS,
  PRIMARY_GOAL_LABELS,
  PROFILE_TRIGGER_LABELS,
  SUPPORT_STYLE_LABELS,
  type IncomeRhythm,
  type PrimaryGoal,
  type ProfileTrigger,
  type SupportStyle,
} from "@/lib/profile/constants";

export const ONBOARDING_CONSENT =
  "Isso não é um diagnóstico — é só um ponto de partida. Você pode pular agora ou mudar depois em Configurações.";

export const ONBOARDING_STEPS = [
  {
    field: "primaryGoal" as const,
    title: "O que você quer cuidar primeiro?",
    subtitle: "Não existe resposta certa. Escolha o que faz mais sentido hoje.",
  },
  {
    field: "typicalTrigger" as const,
    title: "Antes de uma compra não planejada, o que costuma aparecer?",
    subtitle: "Ajuda a personalizar dicas e cursos antes de você ter histórico de lançamentos.",
  },
  {
    field: "cooldownHours" as const,
    title: "Quanto tempo de pausa combina com você?",
    subtitle: "Será o padrão na trava de resfriamento — você pode mudar em cada item.",
  },
  {
    field: "incomeRhythm" as const,
    title: "Como o dinheiro costuma entrar?",
    subtitle: "Só para calibrar projeções e lembretes, sem julgamento.",
  },
  {
    field: "supportStyle" as const,
    title: "Como você prefere que a Bússola fale com você?",
    subtitle: "Ajustamos o tom dos recados — nunca para te punir.",
  },
];

export function dashboardProfileHint(trigger: ProfileTrigger | null | undefined): string | null {
  if (!trigger || trigger === "nao_sei") return null;
  if (trigger === "necessidade_real") {
    return "Você disse que compras não planejadas costumam parecer urgentes na hora. Quando lançar despesas com emoção, a matriz começa a mostrar se esse padrão se repete.";
  }
  const label = PROFILE_TRIGGER_LABELS[trigger].toLowerCase();
  return `Você disse que compras não planejadas costumam vir com ${label}. Quando lançar despesas com emoção, a matriz começa a conferir isso com seus gastos reais.`;
}

export function formatProfileSummary(profile: {
  primaryGoal: string | null;
  typicalTrigger: string | null;
  cooldownHours: number | null;
  incomeRhythm: string | null;
  supportStyle: string | null;
}) {
  return {
    primaryGoal: profile.primaryGoal
      ? PRIMARY_GOAL_LABELS[profile.primaryGoal as PrimaryGoal]
      : "—",
    typicalTrigger: profile.typicalTrigger
      ? PROFILE_TRIGGER_LABELS[profile.typicalTrigger as ProfileTrigger]
      : "—",
    cooldownHours: profile.cooldownHours ? `${profile.cooldownHours} horas` : "48 horas (padrão)",
    incomeRhythm: profile.incomeRhythm
      ? INCOME_RHYTHM_LABELS[profile.incomeRhythm as IncomeRhythm]
      : "—",
    supportStyle: profile.supportStyle
      ? SUPPORT_STYLE_LABELS[profile.supportStyle as SupportStyle]
      : "—",
  };
}
