// Vocabulário do perfil comportamental (RF10). Valores fechados validados em schemas.ts.

export const PRIMARY_GOALS = [
  "juntar",
  "sair_aperto",
  "entender_gastos",
  "menos_impulso",
] as const;

export type PrimaryGoal = (typeof PRIMARY_GOALS)[number];

export const PRIMARY_GOAL_LABELS: Record<PrimaryGoal, string> = {
  juntar: "Juntar dinheiro para um objetivo",
  sair_aperto: "Sair do aperto ou das dívidas",
  entender_gastos: "Entender para onde o dinheiro vai",
  menos_impulso: "Comprar menos por impulso",
};

export const PROFILE_TRIGGERS = [
  "ansioso",
  "entediado",
  "estressado",
  "triste",
  "feliz",
  "neutro",
  "necessidade_real",
  "nao_sei",
] as const;

export type ProfileTrigger = (typeof PROFILE_TRIGGERS)[number];

export const PROFILE_TRIGGER_LABELS: Record<ProfileTrigger, string> = {
  ansioso: "Ansiedade",
  entediado: "Tédio",
  estressado: "Estresse",
  triste: "Tristeza",
  feliz: "Euforia ou celebração",
  neutro: "Costumo nem perceber",
  necessidade_real: "Parece urgência real na hora",
  nao_sei: "Ainda não sei",
};

export const COOLDOWN_OPTIONS = [24, 48, 72] as const;

export type CooldownHours = (typeof COOLDOWN_OPTIONS)[number];

export const INCOME_RHYTHMS = ["salario_mensal", "irregular", "ambos"] as const;

export type IncomeRhythm = (typeof INCOME_RHYTHMS)[number];

export const INCOME_RHYTHM_LABELS: Record<IncomeRhythm, string> = {
  salario_mensal: "Salário ou renda fixa todo mês",
  irregular: "Renda que muda de mês para mês",
  ambos: "Um pouco dos dois",
};

export const SUPPORT_STYLES = ["suave", "firme", "conteudo"] as const;

export type SupportStyle = (typeof SUPPORT_STYLES)[number];

export const SUPPORT_STYLE_LABELS: Record<SupportStyle, string> = {
  suave: "Recados suaves e espaço para ir no meu ritmo",
  firme: "Lembretes mais diretos quando eu estiver perto do limite",
  conteudo: "Mais leituras e exercícios para refletir",
};

export const ONBOARDING_STATUSES = ["pending", "completed", "skipped"] as const;

export type OnboardingStatus = (typeof ONBOARDING_STATUSES)[number];

/** Mapeia gatilho declarado para tag de conteúdo educativo (cold start em Aprender). */
export function profileTriggerToContentTag(trigger: ProfileTrigger | null | undefined): string | null {
  if (!trigger || trigger === "nao_sei") return null;
  if (trigger === "necessidade_real") return "autoconhecimento";
  return trigger;
}
