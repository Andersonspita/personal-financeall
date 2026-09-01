/** Slide exibido no player; visual 100% da Bússola (sem imagens de terceiros). */
export type VideoSlide = {
  title: string;
  lines: string[];
};

/** Roteiro de vídeo-aula: narração TTS + slides sincronizados. */
export type LessonVideoScript = {
  title: string;
  slides: VideoSlide[];
  /** Texto lido pela voz sintética (pt-BR). */
  narration: string;
};

const brand = "Bússola Financeira";

function script(slug: string, data: LessonVideoScript): [string, LessonVideoScript] {
  return [slug, data];
}

/** Introduções curtas exibidas na página de cada curso. */
export const COURSE_VIDEO_SCRIPTS: Record<string, LessonVideoScript> = Object.fromEntries([
  script("emocoes-e-compras", {
    title: "Emoções e compras",
    slides: [
      {
        title: "Emoções e compras",
        lines: ["Como ansiedade, tédio, estresse e tristeza aparecem na hora de gastar."],
      },
      {
        title: "Sem julgamento",
        lines: ["Entender o padrão já cria espaço para pausar antes de comprar."],
      },
      {
        title: "Neste curso",
        lines: ["Quatro aulas curtas, no seu ritmo.", "Produzido pela Bússola Financeira."],
      },
    ],
    narration: `Bem-vindo ao curso Emoções e compras, da ${brand}. Aqui você vai entender como ansiedade, tédio, estresse e tristeza costumam aparecer na hora de gastar — sem julgamento e sem cobrança. O objetivo não é parar de comprar, e sim reconhecer o padrão e criar um pequeno intervalo entre o impulso e a decisão. São quatro aulas curtas, no seu tempo.`,
  }),
  script("ferramentas-da-bussola", {
    title: "Ferramentas da Bússola",
    slides: [
      {
        title: "Ferramentas da Bússola",
        lines: ["Trava de resfriamento, score de vulnerabilidade e pausa de 10 segundos."],
      },
      {
        title: "Apoio, não cobrança",
        lines: ["Cada ferramenta existe para avisar e apoiar — nunca para culpar."],
      },
      {
        title: "Neste curso",
        lines: ["Três aulas práticas sobre o que o app oferece.", "Produzido pela Bússola Financeira."],
      },
    ],
    narration: `Este é o curso Ferramentas da Bússola. Você vai conhecer a Trava de Resfriamento, o Score de Vulnerabilidade e a pausa de dez segundos — recursos do app pensados para apoiar, não para cobrar. Nada aqui é uma nota de comportamento: são ferramentas para você usar quando fizer sentido. Três aulas curtas, produzidas pela ${brand}.`,
  }),
  script("dinheiro-no-dia-a-dia", {
    title: "Dinheiro no dia a dia",
    slides: [
      {
        title: "Dinheiro no dia a dia",
        lines: ["50-30-20, reserva de emergência e ciclo de compensação emocional."],
      },
      {
        title: "Linguagem calma",
        lines: ["Ponto de partida, não regra rígida.", "Ajustar com gentileza quando a vida muda."],
      },
      {
        title: "Neste curso",
        lines: ["Três aulas para organizar o presente e o futuro.", "Produzido pela Bússola Financeira."],
      },
    ],
    narration: `Bem-vindo ao curso Dinheiro no dia a dia, da ${brand}. Vamos falar do método 50-30-20, de como começar uma reserva de emergência e de como sair do ciclo emoção, compra, culpa — sempre em linguagem calma. Os números são um ponto de partida, não uma meta perfeita todo mês. Três aulas curtas, no seu ritmo.`,
  }),
]);

/** Roteiro completo por aula (slug = EducationalContent.slug). */
export const LESSON_VIDEO_SCRIPTS: Record<string, LessonVideoScript> = Object.fromEntries([
  script("ansiedade-e-compras", {
    title: "Por que compramos quando estamos ansiosos",
    slides: [
      {
        title: "Ansiedade e compras",
        lines: ["A ansiedade pede alívio rápido.", "Comprar dá sensação imediata de controle."],
      },
      {
        title: "Alívio curto",
        lines: ["O alívio passa em minutos.", "A causa da ansiedade continua lá."],
      },
      {
        title: "Nomear o que sente",
        lines: ['"Estou ansioso agora, e isso pede uma ação rápida."', "Só isso já abre espaço para pausar."],
      },
      {
        title: "Trava de Resfriamento",
        lines: ["Use a Trava de Resfriamento do app nesse intervalo.", "Sem força de vontade — com gentileza."],
      },
    ],
    narration: `Por que compramos quando estamos ansiosos? A ansiedade é uma sensação de alerta sem alvo claro. Comprar algo, mesmo pequeno, dá ao cérebro uma sensação imediata de controle. Por um instante, decidir comprar substitui a incerteza. O problema é que esse alívio dura pouco, porque não resolve a causa — só distrai por alguns minutos. Depois vem a conta, literal e emocional. Não é falta de força de vontade. É um padrão: ansiedade pede alívio rápido, e compra é um dos mais acessíveis hoje. Da próxima vez, experimente nomear o que sente antes de decidir: estou ansioso agora, e isso pede uma ação rápida. Só isso já cria espaço entre o gatilho e a resposta — e é aí que a Trava de Resfriamento da ${brand} pode ajudar.`,
  }),
  script("tedio-e-consumo", {
    title: "Tédio e consumo",
    slides: [
      {
        title: "Tédio e consumo",
        lines: ["O cérebro não gosta de tempo vazio.", "Comprar gera estímulo e expectativa."],
      },
      {
        title: "Não é sobre o produto",
        lines: ["Compras por tédio buscam algo acontecendo.", "Muita gente nem lembra depois por que comprou."],
      },
      {
        title: "Uma pergunta útil",
        lines: ["Eu quero este item?", "Ou só queria que algo acontecesse agora?"],
      },
      {
        title: "Outros estímulos",
        lines: ["Caminhada, ligação, podcast, tarefa pequena.", "O tédio passa — a questão é o que ele custa."],
      },
    ],
    narration: `Tédio e consumo: o vazio que a compra tenta preencher. O tédio incomoda mais do que parece. O cérebro humano não gosta de tempo vazio e busca estímulo. Rolar vitrines, encher o carrinho, esperar a entrega — tudo gera pequenos picos de expectativa. Por isso compras por tédio raramente têm a ver com precisar do produto. Têm a ver com precisar de estímulo. Antes de finalizar, pergunte: eu quero este item, ou só queria que algo acontecesse agora? Se for a segunda opção, troque a compra por outro estímulo mais leve: uma caminhada, uma ligação, um podcast. O tédio passa de qualquer jeito — a pergunta é o que ele custa até passar.`,
  }),
  script("compras-por-estresse", {
    title: "Compras por estresse",
    slides: [
      {
        title: "Estresse e compras",
        lines: ["Sob estresse, o planejamento fica em segundo plano.", "O alívio imediato assume o controle."],
      },
      {
        title: "Não é falta de disciplina",
        lines: ["É biologia — igual comer mal ou dormir tarde em semanas difíceis."],
      },
      {
        title: "O padrão",
        lines: ["Compras à noite, depois de dias corridos.", "Documentado — não é falha de caráter."],
      },
      {
        title: "Um intervalo pequeno",
        lines: ["Água, respiração, adiar para amanhã.", "Quando o corpo sai do modo alerta."],
      },
    ],
    narration: `Compras por estresse: o alívio que dura pouco. Quando estamos estressados, a parte do cérebro que planeja fica menos ativa, e a que busca alívio imediato assume. Isso não é falta de disciplina — é biologia. Comprar entrega alívio por alguns minutos: a sensação de fazer algo por si. O estresse continua depois, agora com um gasto fora do plano. Se várias compras vieram em dias corridos ou à noite, isso é um padrão documentado, não uma falha de caráter. A saída mais realista não é nunca comprar sob estresse, e sim criar um intervalo: um copo d'água, dois minutos de respiração, ou adiar a compra para amanhã, quando o corpo já não está em alerta.`,
  }),
  script("tristeza-e-consumo", {
    title: "Tristeza e consumo",
    slides: [
      {
        title: "Tristeza e consumo",
        lines: ["Comprar pode ser uma tentativa de se cuidar.", "Não há nada errado em querer se cuidar."],
      },
      {
        title: "O que você busca?",
        lines: ["Companhia, descanso, reconhecimento, uma pequena vitória."],
      },
      {
        title: "A compra sozinha",
        lines: ["Dá vitória por um momento.", "Raramente traz companhia ou descanso de verdade."],
      },
      {
        title: "Apoio quando precisar",
        lines: ["Conversar com alguém também é cuidado.", "O app sugere canais quando o padrão persiste."],
      },
    ],
    narration: `Tristeza e consumo: o que buscamos quando compramos para nos sentir melhor. Comprar quando estamos tristes costuma ser tentar se cuidar — dar algo bom em um momento pesado. Não há nada errado em querer isso. A questão é que compra é só uma das formas, e nem sempre a mais eficaz. Pergunte com gentileza: o que busco agora — companhia, descanso, reconhecimento, uma pequena vitória? Um item novo pode dar vitória por um instante, mas raramente entrega companhia ou descanso de verdade. Se a tristeza for recorrente ou difícil de carregar sozinho, vale conversar com alguém — amigo, profissional ou canais de apoio que a ${brand} sugere quando identifica padrões mais consistentes.`,
  }),
  script("como-funciona-a-trava-de-resfriamento", {
    title: "Trava de Resfriamento",
    slides: [
      {
        title: "Urgência passageira",
        lines: ["A urgência antes de comprar por impulso costuma durar horas, não dias."],
      },
      {
        title: "Separar desejo e decisão",
        lines: ["A trava separa querer ter algo de comprar agora."],
      },
      {
        title: "24 a 72 horas",
        lines: ["Registrar o desejo e esperar.", "Não é proibir — é adiar a decisão."],
      },
      {
        title: "Depois do prazo",
        lines: ["Ainda quero? Provavelmente necessidade real.", "Esqueci? Economizou sem força de vontade."],
      },
    ],
    narration: `Como funciona a Trava de Resfriamento. A maior parte da urgência antes de uma compra por impulso não dura muito — geralmente horas, no máximo um dia. Lojas online são feitas para você decidir nesse pico, antes de passar. A Trava de Resfriamento separa duas coisas que costumam vir juntas: o desejo de ter algo, e a decisão de comprar agora. Ao registrar um item de desejo e esperar de vinte e quatro a setenta e duas horas, você não proíbe a compra — só adia para quando a urgência já passou. Aí sobra a pergunta real: ainda quero isso? Se sim, ótimo — provavelmente é necessidade real. Se nem lembrava mais, você economizou sem esforço de força de vontade.`,
  }),
  script("entendendo-o-score-de-vulnerabilidade", {
    title: "Score de Vulnerabilidade",
    slides: [
      {
        title: "O que o score olha",
        lines: ["Compras sinalizadas como possível impulso.", "Gastos de madrugada e emoções recentes."],
      },
      {
        title: "Termômetro, não prova",
        lines: ["Não avalia se você é bom ou ruim com dinheiro.", "Resume padrões dos últimos dias."],
      },
      {
        title: "Nível mais alto",
        lines: ["Vale pausar, usar o Botão de Pânico ou rever dicas.", "Não significa que algo já deu errado."],
      },
      {
        title: "Apoio externo",
        lines: ["Vários dias seguidos em nível alto?", "O app sugere canais — sem culpa, com cuidado."],
      },
    ],
    narration: `Entendendo o Score de Vulnerabilidade sem julgamento. O score olha os últimos dias e resume três coisas: quantas compras foram sinalizadas como possível impulso, quantas aconteceram de madrugada, e quanto dos gastos recentes estão ligados a emoções como ansiedade, tédio, estresse ou tristeza. Ele não avalia se você é boa ou ruim com dinheiro — isso não faz sentido. É mais termômetro que prova escolar. Um nível mais alto não significa que algo de errado já aconteceu. Significa que vale pausar, usar o Botão de Pânico, ou revisitar as dicas. Se o nível se mantiver alto por várias verificações, a ${brand} sugere canais de apoio — não porque você falhou, mas porque apoio externo costuma ajudar nesse tipo de padrão.`,
  }),
  script("pausa-de-10-segundos", {
    title: "Pausa de 10 segundos",
    slides: [
      {
        title: "10 segundos bastam",
        lines: ["O impulso vem de reação automática.", "Uma pausa consciente ativa a reflexão."],
      },
      {
        title: "Antes de finalizar",
        lines: ["Pare dez segundos.", "O que estou sentindo agora?"],
      },
      {
        title: "Duas perguntas",
        lines: ["Precisava disso antes de ver o anúncio?", "Ainda vou querer amanhã?"],
      },
      {
        title: "Hábito com o tempo",
        lines: ["Não é nunca comprar por impulso.", "É a decisão passar por você primeiro."],
      },
    ],
    narration: `O poder da pausa de dez segundos antes de comprar. Não precisa de técnica complexa — às vezes dez segundos já mudam a decisão. O impulso costuma vir de reação rápida e automática; qualquer pausa consciente ativa uma parte mais reflexiva do cérebro. Antes de finalizar uma compra não planejada, pare dez segundos e responda: o que estou sentindo agora? Precisava disso antes de ver este anúncio? Ainda vou querer amanhã? Não é sobre nunca comprar por impulso — é garantir que a decisão passou por você. Com o tempo, essa pausa vira hábito, e o hábito sustenta uma relação mais tranquila com o dinheiro.`,
  }),
  script("metodo-50-30-20-explicado", {
    title: "Método 50-30-20",
    slides: [
      {
        title: "Três fatias da renda",
        lines: ["50% essenciais: moradia, comida, transporte, saúde."],
      },
      {
        title: "30% para prazer",
        lines: ["Lazer, delivery, assinaturas — de propósito.", "Cortar tudo costuma gerar impulso depois."],
      },
      {
        title: "20% para o futuro",
        lines: ["Reserva, investimentos, quitar dívidas.", "Reduz ansiedade financeira no longo prazo."],
      },
      {
        title: "Ponto de partida",
        lines: ["Aluguel subiu? Não é fracasso.", "É informação para ajustar com calma."],
      },
    ],
    narration: `O método 50-30-20 explicado com calma. Divide a renda líquida em três fatias, como ponto de partida — não regra rígida. Cinquenta por cento para essenciais: moradia, alimentação, transporte, saúde. Trinta por cento para o variável e o prazer: lazer, delivery, assinaturas. Essa fatia existe de propósito — cortar cem por cento do prazer raramente é sustentável e costuma terminar em compras por impulso depois. Vinte por cento para o futuro: reserva de emergência, investimentos, quitação de dívidas. É a fatia mais fácil de esquecer quando a vida corre, e uma das mais importantes para reduzir ansiedade financeira. Se um mês os essenciais passam de cinquenta por cento porque o aluguel subiu, isso não é fracasso — é informação para ajustar o resto com calma.`,
  }),
  script("construindo-reserva-de-emergencia", {
    title: "Reserva de emergência",
    slides: [
      {
        title: "Começar pequeno",
        lines: ["Não precisa de seis meses de uma vez.", "O efeito vem de a reserva existir."],
      },
      {
        title: "Uma ou duas semanas",
        lines: ["Já muda o tipo de decisão em um imprevisto.", "De dívida desesperada para despesa chata."],
      },
      {
        title: "Categoria própria",
        lines: ['Use "Reserva de Emergência" no app.', "Qualquer valor é progresso real."],
      },
      {
        title: "Repetição",
        lines: ["Reservas crescem por repetição.", "Não por um depósito heroico único."],
      },
    ],
    narration: `Construindo uma reserva de emergência, um passo de cada vez. Muita gente adia porque imagina precisar juntar seis meses de despesas de uma vez — parece impossível, então nem começa. Mas o efeito mais importante não vem do valor final: vem de ela existir. Mesmo uma reserva pequena, de uma ou duas semanas de despesas, já muda o tipo de decisão em um imprevisto. Sem reserva, um imprevisto vira dívida ou compra por desespero. Com reserva, mesmo pequena, vira despesa chata mas administrável. Comece com uma categoria própria — a ${brand} sugere Reserva de Emergência — e trate qualquer valor, mesmo pequeno, como progresso real. Reservas crescem por repetição, não por um único depósito heroico.`,
  }),
  script("saindo-do-ciclo-de-compensacao-emocional", {
    title: "Ciclo de compensação",
    slides: [
      {
        title: "O ciclo",
        lines: ["Emoção difícil → compra → alívio curto → culpa → nova emoção difícil."],
      },
      {
        title: "Onde interromper",
        lines: ["Não na culpa, nem na compra.", "Quando a emoção aparece, antes da decisão."],
      },
      {
        title: "Ferramentas do app",
        lines: ["Botão de Pânico e Matriz Emoção × Gasto.", "Te encontram nesse momento."],
      },
      {
        title: "Progresso gradual",
        lines: ["O ciclo raramente rompe de uma vez.", "Cada pausa um pouco mais cedo já conta."],
      },
    ],
    narration: `Saindo do ciclo de compensação emocional. Um padrão comum: emoção difícil, compra, alívio rápido, culpa ou preocupação com o gasto, e essa culpa vira mais uma emoção difícil — alimentando o próximo ciclo. O ponto mais eficaz para interromper não é na culpa, nem na compra prestes a acontecer — é quando a emoção difícil aparece e ainda não virou decisão de comprar. É aí que o Botão de Pânico e a Matriz de Emoção por Gasto da ${brand} tentam te encontrar. Perceber o padrão em si já é progresso, mesmo que a compra aconteça de novo algumas vezes. Ciclos assim raramente se rompem de uma vez — enfraquecem aos poucos, cada vez que a pausa acontece um pouco mais cedo.`,
  }),
]);
