import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { encryptSensitive } from "../src/lib/crypto";
import { hashPassword } from "../src/lib/auth/password";
import { evaluateTransactionForAnomalies } from "../src/lib/rules/anomaly-detection";
import { ensureEducationalCatalog } from "../src/lib/education/catalog";

const DEMO_EMAIL = "demo@bussola.app";
const DEMO_PASSWORD = "demo12345";

function daysAgo(days: number, hour = 12): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function main() {
  await ensureEducationalCatalog();

  // Ordem de limpeza respeita as foreign keys. Apaga só os dados do usuário demo, não o banco todo.
  const existingDemo = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existingDemo) {
    await prisma.user.delete({ where: { id: existingDemo.id } }); // cascade cuida do resto
  }

  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const user = await prisma.user.create({
    data: { email: DEMO_EMAIL, passwordHash, name: "Usuário Demo" },
  });

  const contaCorrente = await prisma.account.create({
    data: { userId: user.id, name: "Conta Corrente", type: "corrente", initialBalance: 3200 },
  });
  const carteira = await prisma.account.create({
    data: { userId: user.id, name: "Carteira", type: "dinheiro", initialBalance: 150 },
  });

  const categories = await Promise.all(
    [
      { name: "Moradia", group: "essencial", icon: "🏠" },
      { name: "Alimentação", group: "essencial", icon: "🛒" },
      { name: "Transporte", group: "essencial", icon: "🚌" },
      { name: "Saúde", group: "essencial", icon: "💊" },
      { name: "Delivery", group: "variavel", icon: "🍔", monthlyLimit: 300 },
      { name: "Vestuário", group: "variavel", icon: "👕", monthlyLimit: 200 },
      { name: "Lazer", group: "variavel", icon: "🎮", monthlyLimit: 250 },
      { name: "Assinaturas", group: "variavel", icon: "📺", monthlyLimit: 100 },
      { name: "Reserva de Emergência", group: "poupanca", icon: "🛟" },
      { name: "Investimentos", group: "poupanca", icon: "📈" },
      { name: "Salário", group: "renda", icon: "💰" },
    ].map((c) => prisma.category.create({ data: { ...c, userId: user.id } })),
  );

  const byName = (name: string) => categories.find((c) => c.name === name)!;

  const currentMonth = new Date().toISOString().slice(0, 7);
  await Promise.all(
    categories
      .filter((c) => c.monthlyLimit)
      .map((c) =>
        prisma.budget.create({
          data: { userId: user.id, categoryId: c.id, month: currentMonth, limitAmount: c.monthlyLimit! },
        }),
      ),
  );

  // Lançamentos: mistura de despesas fixas normais e uma sequência de compras por impulso
  // (delivery + lazer) concentradas em poucas horas, para exercitar o detector de anomalias (RF04).
  type SeedTxn = {
    accountId: string;
    categoryId: string;
    type: "receita" | "despesa";
    amount: number;
    essential: boolean;
    description: string;
    occurredAt: Date;
    emotion?: { emotion: string; intensity?: number; note?: string };
  };

  const seedTransactions: SeedTxn[] = [
    {
      accountId: contaCorrente.id,
      categoryId: byName("Salário").id,
      type: "receita",
      amount: 4500,
      essential: true,
      description: "Salário",
      occurredAt: daysAgo(10, 8),
    },
    {
      accountId: contaCorrente.id,
      categoryId: byName("Moradia").id,
      type: "despesa",
      amount: 1400,
      essential: true,
      description: "Aluguel",
      occurredAt: daysAgo(9, 9),
    },
    {
      accountId: contaCorrente.id,
      categoryId: byName("Alimentação").id,
      type: "despesa",
      amount: 520,
      essential: true,
      description: "Mercado do mês",
      occurredAt: daysAgo(8, 18),
    },
    // Sequência de impulso: 4 compras não essenciais em menos de 24h, à noite/madrugada.
    {
      accountId: carteira.id,
      categoryId: byName("Delivery").id,
      type: "despesa",
      amount: 45,
      essential: false,
      description: "Delivery - lanche",
      occurredAt: daysAgo(2, 22),
      emotion: { emotion: "estressado", intensity: 4, note: "Dia pesado no trabalho." },
    },
    {
      accountId: carteira.id,
      categoryId: byName("Delivery").id,
      type: "despesa",
      amount: 38,
      essential: false,
      description: "Delivery - sobremesa",
      occurredAt: daysAgo(2, 23),
      emotion: { emotion: "ansioso", intensity: 3 },
    },
    {
      accountId: carteira.id,
      categoryId: byName("Lazer").id,
      type: "despesa",
      amount: 60,
      essential: false,
      description: "Compra em jogo",
      occurredAt: daysAgo(1, 1),
      emotion: { emotion: "entediado", intensity: 3, note: "Não conseguia dormir." },
    },
    {
      accountId: carteira.id,
      categoryId: byName("Vestuário").id,
      type: "despesa",
      amount: 189,
      essential: false,
      description: "Roupa online",
      occurredAt: daysAgo(1, 3),
      emotion: { emotion: "triste", intensity: 4 },
    },
    {
      accountId: contaCorrente.id,
      categoryId: byName("Transporte").id,
      type: "despesa",
      amount: 180,
      essential: true,
      description: "Combustível",
      occurredAt: daysAgo(1, 10),
    },
    {
      accountId: contaCorrente.id,
      categoryId: byName("Assinaturas").id,
      type: "despesa",
      amount: 89.9,
      essential: false,
      description: "Streaming + apps",
      occurredAt: daysAgo(0, 9),
      emotion: { emotion: "neutro" },
    },
  ];

  const history: { type: "receita" | "despesa"; essential: boolean; occurredAt: Date }[] = [];
  for (const t of seedTransactions) {
    history.push({ type: t.type, essential: t.essential, occurredAt: t.occurredAt });
    const { isImpulse } = evaluateTransactionForAnomalies(
      { type: t.type, essential: t.essential, occurredAt: t.occurredAt },
      history,
    );

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: t.accountId,
        categoryId: t.categoryId,
        type: t.type,
        amount: t.amount,
        essential: t.essential,
        description: t.description,
        occurredAt: t.occurredAt,
        isImpulse,
      },
    });

    if (t.emotion) {
      await prisma.emotionLog.create({
        data: {
          transactionId: transaction.id,
          emotion: t.emotion.emotion,
          intensity: t.emotion.intensity,
          noteEncrypted: t.emotion.note ? encryptSensitive(t.emotion.note) : undefined,
        },
      });
    }
  }

  await prisma.wishlistItem.create({
    data: {
      userId: user.id,
      name: "Fone de ouvido novo",
      amount: 349,
      categoryId: byName("Lazer").id,
      cooldownHours: 48,
      availableAt: daysAgo(-1, 20), // disponível daqui a 1 dia
    },
  });

  await prisma.nudge.create({
    data: {
      userId: user.id,
      message:
        "Notamos que boa parte dos gastos com Delivery aconteceu à noite, em dias corridos. Que tal deixar 2 marmitas prontas no congelador para essas semanas?",
      triggerRule: "delivery_noturno_recorrente",
      category: byName("Delivery").name,
    },
  });

  console.log(`Seed concluído. Login demo: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
