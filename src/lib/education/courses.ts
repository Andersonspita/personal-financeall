export type CourseSeed = {
  slug: string;
  title: string;
  summary: string;
  tag: string;
  order: number;
  lessonSlugs: string[];
};

/** Três cursos curtos montados sobre as aulas já existentes da biblioteca. */
export const COURSES: CourseSeed[] = [
  {
    slug: "emocoes-e-compras",
    title: "Emoções e compras",
    summary:
      "Como ansiedade, tédio, estresse e tristeza aparecem na hora de gastar — e o que dá para fazer nesse intervalo.",
    tag: "autoconhecimento",
    order: 10,
    lessonSlugs: ["ansiedade-e-compras", "tedio-e-consumo", "compras-por-estresse", "tristeza-e-consumo"],
  },
  {
    slug: "ferramentas-da-bussola",
    title: "Ferramentas da Bússola",
    summary: "Trava de resfriamento, score e a pausa de 10 segundos — o que o app oferece, sem cobrança.",
    tag: "autoconhecimento",
    order: 20,
    lessonSlugs: [
      "como-funciona-a-trava-de-resfriamento",
      "entendendo-o-score-de-vulnerabilidade",
      "pausa-de-10-segundos",
    ],
  },
  {
    slug: "dinheiro-no-dia-a-dia",
    title: "Dinheiro no dia a dia",
    summary: "50-30-20, reserva de emergência e o ciclo de compensação, em linguagem calma.",
    tag: "orcamento",
    order: 30,
    lessonSlugs: [
      "metodo-50-30-20-explicado",
      "construindo-reserva-de-emergencia",
      "saindo-do-ciclo-de-compensacao-emocional",
    ],
  },
];
