import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

// RNF02: exportação financeira nunca inclui EmotionLog (emoção, intensidade ou nota) —
// esse relatório é para uso externo (contador, planilha pessoal) e não deve carregar dados
// de saúde mental. Quem quiser os próprios dados emocionais deve acessá-los na tela de correlação.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      type: true,
      amount: true,
      essential: true,
      description: true,
      occurredAt: true,
      account: { select: { name: true } },
      category: { select: { name: true, group: true } },
    },
    orderBy: { occurredAt: "desc" },
  });

  const rows = transactions.map((t) => ({
    id: t.id,
    data: t.occurredAt.toISOString(),
    tipo: t.type,
    valor: t.amount,
    essencial: t.essential,
    conta: t.account.name,
    categoria: t.category?.name ?? "",
    grupo: t.category?.group ?? "",
    descricao: t.description ?? "",
  }));

  return NextResponse.json(
    { generatedAt: new Date().toISOString(), transactions: rows },
    { headers: { "Content-Disposition": "attachment; filename=extrato-financeiro.json" } },
  );
}
