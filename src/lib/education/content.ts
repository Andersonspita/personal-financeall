// Biblioteca de educação emocional-financeira (extensão do RF07). Conteúdo curado, com o mesmo
// tom não-punitivo do resto do app (RNF03): nada de "pare de gastar", sempre "aqui está o que
// costuma acontecer, e uma forma mais leve de lidar com isso".
//
// `tag` casa com as emoções de src/lib/emotions.ts quando o tema é um gatilho emocional
// específico, ou com um destes temas gerais: "orcamento", "poupanca", "compulsao", "autoconhecimento".
// Isso permite recomendar conteúdo com base na emoção que mais aparece nos gastos do usuário
// (ver src/lib/education/service.ts).

export interface EducationalContentSeed {
  slug: string;
  title: string;
  summary: string;
  body: string;
  tag: string;
  estimatedMinutes: number;
  order: number;
}

export const EDUCATIONAL_CONTENT: EducationalContentSeed[] = [
  {
    slug: "ansiedade-e-compras",
    title: "Por que compramos quando estamos ansiosos",
    summary: "A ansiedade busca alívio imediato — e comprar entrega isso em segundos. Entender o mecanismo já ajuda a pausar.",
    tag: "ansioso",
    estimatedMinutes: 3,
    order: 10,
    body: `A ansiedade é uma sensação de alerta sem um alvo claro: o corpo se prepara para algo, mas não sabe bem para quê. Comprar alguma coisa — mesmo pequena — dá ao cérebro uma sensação imediata de controle e resolução. Por um instante, a decisão de "clicar em comprar" substitui a incerteza que estava incomodando.

O problema é que esse alívio dura pouco, porque ele não resolve a causa da ansiedade — só distrai dela por alguns minutos. Depois vem a conta, literal e emocional.

Não é sobre força de vontade. É sobre reconhecer o padrão: ansiedade pede alívio rápido, e compra é um dos alívios rápidos mais acessíveis que existem hoje em dia, a um toque de distância.

Da próxima vez que sentir vontade de comprar algo em um momento de ansiedade, experimente nomear o que está sentindo antes de decidir: "estou ansioso(a) agora, e isso está pedindo uma ação rápida". Só isso já cria um pequeno espaço entre o gatilho e a resposta — e é nesse espaço que a Trava de Resfriamento do app pode ajudar.`,
  },
  {
    slug: "tedio-e-consumo",
    title: "Tédio e consumo: o vazio que a compra tenta preencher",
    summary: "Comprar por tédio é menos sobre o produto e mais sobre ter alguma coisa acontecendo. Vale procurar outros \"algo acontecendo\".",
    tag: "entediado",
    estimatedMinutes: 3,
    order: 20,
    body: `O tédio incomoda mais do que parece — o cérebro humano não gosta de tempo vazio, e vai atrás de qualquer estímulo disponível para preenchê-lo. Rolar uma vitrine online, adicionar coisas ao carrinho, esperar a entrega chegar: tudo isso gera pequenos picos de expectativa que combatem a monotonia.

Por isso compras feitas por tédio raramente têm a ver com precisar do produto. Elas têm a ver com precisar de estímulo. É por isso que muita gente nem lembra direito por que comprou aquilo depois.

Uma pergunta útil antes de finalizar uma compra em um momento assim: "eu quero esse item, ou eu só queria que alguma coisa acontecesse agora?" Se for a segunda opção, vale trocar a compra por outro estímulo mais barato: uma caminhada, uma ligação para alguém, um episódio de podcast, uma tarefa pequena que estava adiada. O tédio passa de qualquer jeito — a única pergunta é o que ele custa até passar.`,
  },
  {
    slug: "compras-por-estresse",
    title: "Compras por estresse: o alívio que dura pouco",
    summary: "Sob estresse, o cérebro prioriza alívio imediato sobre planejamento — e gastar é um dos alívios mais rápidos que existem.",
    tag: "estressado",
    estimatedMinutes: 3,
    order: 30,
    body: `Quando estamos estressados, a parte do cérebro responsável por planejar e pesar consequências fica menos ativa, e a parte que busca alívio imediato assume o controle. Isso não é falta de disciplina — é biologia. É o mesmo motivo pelo qual é mais difícil comer bem ou dormir cedo em semanas difíceis.

Comprar entrega esse alívio imediato: por alguns minutos, a sensação de estar fazendo algo por si mesmo(a) compete com o cansaço do dia. O problema é que o estresse continua lá depois — só que agora acompanhado de um gasto que talvez não estivesse nos planos.

Se você notar que várias compras recentes aconteceram em dias corridos ou à noite, depois de um dia difícil, isso não é uma falha de caráter — é um padrão bem documentado. A saída mais realista não é "nunca mais comprar sob estresse", e sim criar um intervalo pequeno entre o cansaço e a decisão: um copo d'água, dois minutos de respiração, ou simplesmente adiar a compra para o dia seguinte, quando o corpo já não está em modo de alerta.`,
  },
  {
    slug: "tristeza-e-consumo",
    title: "Tristeza e consumo: o que buscamos quando compramos para nos sentir melhor",
    summary: "Comprar para se sentir melhor busca companhia, cuidado ou uma pequena vitória — coisas que também existem fora da compra.",
    tag: "triste",
    estimatedMinutes: 3,
    order: 40,
    body: `Comprar quando estamos tristes costuma ser uma tentativa de se cuidar — de dar a si mesmo(a) algo bom em um momento em que tudo parece pesado. Não há nada de errado em querer se cuidar. A questão é que a compra é só uma das formas de fazer isso, e às vezes nem é a mais eficaz.

Vale se perguntar, com gentileza: "o que eu realmente estou buscando agora — companhia, descanso, reconhecimento, uma pequena vitória?" Um item novo pode dar uma sensação de vitória por um momento, mas raramente entrega companhia ou descanso de verdade.

Se a tristeza for recorrente ou estiver difícil de carregar sozinho(a), vale considerar conversar com alguém — um amigo, um profissional, ou um dos canais de apoio que o app sugere quando identifica um padrão mais consistente. Isso não é exagero: é o mesmo tipo de cuidado que a compra estava tentando (e não conseguindo, sozinha) oferecer.`,
  },
  {
    slug: "como-funciona-a-trava-de-resfriamento",
    title: "Como funciona a Trava de Resfriamento (e por que ela ajuda)",
    summary: "Esperar 24 a 72h antes de comprar não é sobre desconfiar de você — é sobre dar tempo para a urgência emocional passar.",
    tag: "autoconhecimento",
    estimatedMinutes: 2,
    order: 50,
    body: `A maior parte da urgência que sentimos antes de uma compra por impulso não dura muito tempo — geralmente algumas horas, no máximo um dia. O problema é que as lojas online são desenhadas para que a decisão de comprar aconteça exatamente nesse pico de urgência, antes que ele passe.

A Trava de Resfriamento existe para separar duas coisas que normalmente acontecem juntas: o desejo de ter algo, e a decisão de comprar agora. Ao registrar um item de desejo e esperar de 24 a 72 horas, você não está proibindo a compra — está só adiando a decisão para um momento em que a urgência já passou, e sobra só a pergunta real: "eu ainda quero isso?"

Se depois do prazo a resposta for sim, ótimo — é provavelmente uma necessidade real, e você compra com mais tranquilidade. Se a resposta for "nem lembrava mais disso", você acabou de economizar sem esforço nenhum de força de vontade.`,
  },
  {
    slug: "entendendo-o-score-de-vulnerabilidade",
    title: "Entendendo seu Score de Vulnerabilidade sem julgamento",
    summary: "O score não é uma nota de comportamento — é um termômetro de padrões recentes, pensado para avisar, não para culpar.",
    tag: "autoconhecimento",
    estimatedMinutes: 3,
    order: 60,
    body: `O Score de Vulnerabilidade olha para os últimos dias e resume três coisas: quantas compras foram sinalizadas como possível impulso, quantas aconteceram de madrugada, e quanto dos seus gastos recentes estão ligados a emoções como ansiedade, tédio, estresse ou tristeza.

Ele não avalia se você é uma pessoa "boa" ou "ruim" com dinheiro — isso nem faz sentido. Ele avalia se os últimos dias tiveram uma concentração de sinais que, juntos, costumam preceder períodos mais difíceis. É mais parecido com um termômetro do que com uma prova escolar.

Um nível mais alto não significa que algo de errado já aconteceu. Significa que vale a pena dar uma pausa, talvez usar o Botão de Pânico na próxima vontade de compra, ou revisitar o feed de dicas. E se o nível se mantiver alto por várias verificações seguidas, o app vai sugerir canais de apoio — não porque você "falhou", mas porque esse é exatamente o tipo de padrão em que apoio externo costuma ajudar mais rápido do que tentar resolver sozinho(a).`,
  },
  {
    slug: "metodo-50-30-20-explicado",
    title: "O método 50-30-20 explicado com calma",
    summary: "Uma forma simples de olhar para a renda: metade para o que é essencial, um terço para o que dá prazer, um quinto para o futuro.",
    tag: "orcamento",
    estimatedMinutes: 4,
    order: 70,
    body: `O método 50-30-20 divide a renda líquida (depois de impostos) em três fatias, como um ponto de partida — não uma regra rígida.

50% para essenciais: moradia, alimentação, transporte, saúde. As contas que existem independente do seu humor ou da sua vontade.

30% para o que é variável e dá prazer: lazer, delivery, roupas, assinaturas. Essa fatia existe de propósito — cortar 100% do prazer do orçamento raramente é sustentável, e costuma terminar em compras por impulso mais tarde, como uma compensação.

20% para o futuro: reserva de emergência, investimentos, quitação de dívidas. É a fatia mais fácil de esquecer quando a vida está corrida, e a mais importante para reduzir a ansiedade financeira a longo prazo.

Esses números são um ponto de partida, não uma meta perfeita a ser batida todo mês. Se um mês a fatia de essenciais passar de 50% porque o aluguel subiu, isso não é um fracasso — é uma informação para ajustar as outras fatias ou revisar despesas fixas, com calma.`,
  },
  {
    slug: "construindo-reserva-de-emergencia",
    title: "Construindo uma reserva de emergência, um passo de cada vez",
    summary: "Uma reserva pequena já reduz decisões por desespero. Não precisa ser grande no começo — precisa existir.",
    tag: "poupanca",
    estimatedMinutes: 3,
    order: 80,
    body: `Muita gente adia começar uma reserva de emergência porque imagina que precisa juntar seis meses de despesas de uma vez — e isso parece impossível, então nem começa. Mas o efeito mais importante de uma reserva não vem do valor final, vem de ela existir.

Mesmo uma reserva pequena — o equivalente a uma semana ou duas de despesas — já muda o tipo de decisão que você toma em uma emergência. Sem reserva, um imprevisto vira uma dívida ou uma compra por desespero. Com uma reserva, mesmo pequena, ele vira só uma despesa chata, mas administrável.

Um jeito realista de começar: separe uma categoria própria para isso (o app já sugere "Reserva de Emergência"), e trate qualquer valor — mesmo pequeno — como um progresso real, não como insuficiente. Reservas crescem por repetição, não por um único depósito heroico.`,
  },
  {
    slug: "saindo-do-ciclo-de-compensacao-emocional",
    title: "Saindo do ciclo de compensação emocional",
    summary: "Emoção difícil → compra → alívio curto → culpa → mais emoção difícil. Quebrar o ciclo começa em identificar em qual ponto você está.",
    tag: "compulsao",
    estimatedMinutes: 4,
    order: 90,
    body: `Um padrão comum em compras por impulso segue um ciclo: uma emoção difícil aparece, a compra oferece um alívio rápido, o alívio passa e vem a culpa ou a preocupação com o gasto, e essa culpa vira mais uma emoção difícil para lidar — o que pode alimentar o próximo ciclo.

O ponto mais eficaz para interromper esse ciclo não é na culpa (que já aconteceu) nem na compra (que está prestes a acontecer) — é um passo antes, no momento em que a emoção difícil aparece e ainda não virou uma decisão de compra. É exatamente aí que o Botão de Pânico e a Matriz de Emoção × Gasto deste app tentam te encontrar.

Um detalhe importante: perceber esse padrão em si mesmo(a) já é um progresso, mesmo que a compra aconteça de novo algumas vezes. Ciclos assim raramente se rompem de uma vez — eles se enfraquecem aos poucos, cada vez que a pausa acontece um pouco mais cedo. Se o ciclo estiver muito intenso ou frequente, vale conversar com um profissional: isso é exatamente o tipo de padrão que a Terapia Cognitivo-Comportamental costuma trabalhar bem.`,
  },
  {
    slug: "pausa-de-10-segundos",
    title: "O poder da pausa de 10 segundos antes de comprar",
    summary: "Você não precisa de uma técnica complexa — só de um intervalo pequeno e consistente entre o impulso e o clique.",
    tag: "autoconhecimento",
    estimatedMinutes: 2,
    order: 100,
    body: `Não é preciso uma estratégia elaborada para reduzir compras por impulso — às vezes um intervalo de 10 segundos já é suficiente para a decisão mudar. Isso acontece porque o impulso de comprar costuma vir de uma reação rápida e automática, e qualquer pausa consciente já ativa uma parte mais reflexiva do cérebro.

Antes de finalizar uma compra que não estava planejada, experimente parar por 10 segundos e responder, mentalmente ou em voz alta: o que estou sentindo agora? Eu precisava disso antes de ver esse anúncio ou essa vitrine? Eu ainda vou querer isso amanhã?

Não é sobre nunca comprar por impulso — é sobre garantir que a decisão passou, ainda que rapidamente, por você. Com o tempo, essa pausa de 10 segundos vira hábito, e o hábito é o que realmente sustenta uma relação mais tranquila com o dinheiro.`,
  },
];
