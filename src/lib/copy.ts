// Central de textos de UI ligados a comportamento financeiro (RNF03: comunicação não-violenta,
// sem termos acusatórios ou punitivos). Qualquer texto exibido perto de gastos, alertas de
// orçamento ou score de vulnerabilidade deve vir daqui, não ser inventado ad-hoc na tela.

export const BUDGET_ALERT_COPY = {
  at80: (category: string) =>
    `Você já usou 80% do teto de "${category}" este mês. Sem problema — é um bom momento para dar uma olhada antes de continuar.`,
  at100: (category: string) =>
    `O teto de "${category}" foi atingido. Isso não é uma falha, é uma informação: talvez valha a pena revisar o plano para o resto do mês.`,
} as const;

export const VULNERABILITY_LEVEL_COPY = {
  baixo: "Seus padrões de gasto parecem estáveis por aqui.",
  medio: "Notamos algumas oscilações. Que tal reservar um minuto para o feed de dicas?",
  alto: "Os últimos dias tiveram vários gastos ligados a emoções difíceis. Você não está sozinho(a) nisso — vale dar uma pausa.",
  critico:
    "Identificamos um padrão consistente de gastos por impulso. Isso acontece com muita gente, e existe apoio profissional para isso quando fizer sentido para você.",
} as const;

export const SUPPORT_CHANNELS = [
  {
    name: "CVV — Centro de Valorização da Vida",
    description: "Apoio emocional 24h, gratuito e sigiloso.",
    contact: "188 (ligação gratuita) / cvv.org.br",
  },
  {
    name: "Devedores Anônimos (D.A.)",
    description: "Grupos de apoio entre pares para compulsão financeira e endividamento.",
    contact: "devedoresanonimosbrasil.org.br",
  },
  {
    name: "Clínicas-escola de Psicologia",
    description: "Atendimento psicológico com valores acessíveis em universidades da sua região.",
    contact: "Busque pela universidade + \"clínica-escola de psicologia\"",
  },
] as const;

// Microatividades gratuitas oferecidas no Botão de Pânico / Desvio de Foco (RF08).
export const PANIC_ACTIVITIES = [
  {
    id: "respiracao",
    title: "Respiração guiada (2 min)",
    description: "Inspire em 4 tempos, segure por 4, expire em 6. Repita por 2 minutos.",
    durationMinutes: 2,
  },
  {
    id: "caminhada",
    title: "Caminhada de 10 minutos",
    description: "Saia do ambiente onde você pensou na compra. Caminhe sem o celular, se possível.",
    durationMinutes: 10,
  },
  {
    id: "gratidao",
    title: "Lista de gratidão",
    description: "Escreva 3 coisas boas que já aconteceram hoje, por menores que pareçam.",
    durationMinutes: 3,
  },
  {
    id: "leitura",
    title: "Artigo curto",
    description: "Leia algo leve e sem relação com compras por 5 minutos antes de decidir qualquer coisa.",
    durationMinutes: 5,
  },
] as const;
