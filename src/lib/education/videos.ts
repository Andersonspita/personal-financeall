export type YoutubeClip = {
  id: string;
  title: string;
  author: string;
};

/** IDs públicos do YouTube, checados via oEmbed. Conteúdo de terceiros, não da Bússola. */
export const COURSE_VIDEOS: Record<string, YoutubeClip> = {
  "emocoes-e-compras": {
    id: "KSC58wt4Tbc",
    title: "Educação financeira — A mentalidade financeira",
    author: "PAE — Programa de Aprendizagem Eficiente",
  },
  "ferramentas-da-bussola": {
    id: "kdZiy5g4rKI",
    title: "Aprendendo a não se endividar",
    author: "Serasa Ensina",
  },
  "dinheiro-no-dia-a-dia": {
    id: "-RfLYjZ9J6E",
    title: "Regra 50-30-20: como dividir seu dinheiro",
    author: "Portal It's Money",
  },
};

export const LESSON_VIDEOS: Record<string, YoutubeClip> = {
  "ansiedade-e-compras": COURSE_VIDEOS["emocoes-e-compras"]!,
  "compras-por-estresse": {
    id: "OX-fI0_ouYo",
    title: "Como evitar compras compulsivas?",
    author: "Casule Saúde e Bem-estar",
  },
  "como-funciona-a-trava-de-resfriamento": COURSE_VIDEOS["emocoes-e-compras"]!,
  "entendendo-o-score-de-vulnerabilidade": COURSE_VIDEOS["ferramentas-da-bussola"]!,
  "metodo-50-30-20-explicado": COURSE_VIDEOS["dinheiro-no-dia-a-dia"]!,
  "construindo-reserva-de-emergencia": {
    id: "qGWGbYm218U",
    title: "BC te Explica: resiliência financeira e imprevistos",
    author: "Banco Central do Brasil",
  },
  "saindo-do-ciclo-de-compensacao-emocional": {
    id: "OX-fI0_ouYo",
    title: "Como evitar compras compulsivas?",
    author: "Casule Saúde e Bem-estar",
  },
};

export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;
}

export function videoForLesson(lessonSlug: string, courseSlug?: string | null): YoutubeClip | null {
  return LESSON_VIDEOS[lessonSlug] ?? (courseSlug ? COURSE_VIDEOS[courseSlug] : undefined) ?? null;
}

export function videoForCourse(courseSlug: string): YoutubeClip | null {
  return COURSE_VIDEOS[courseSlug] ?? null;
}
