import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dismissImpulseFlag, deleteTransaction } from "@/actions/transactions";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { EMOTION_EMOJI, EMOTION_LABELS, type Emotion } from "@/lib/emotions";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const user = await requireUser();
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true, account: true, emotionLog: true },
    orderBy: { occurredAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Lançamentos</h1>
        <Link
          href="/transacoes/novo"
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          <Plus size={16} /> Novo
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {transactions.length === 0 && (
          <Card>
            <p className="text-sm text-foreground-muted">Nenhum lançamento ainda.</p>
          </Card>
        )}
        {transactions.map((t) => (
          <Card key={t.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{t.description || t.category?.name || "Lançamento"}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-foreground-muted">
                {formatDateTime(t.occurredAt)} · {t.account.name}
                {t.category && <> · {t.category.name}</>}
                {t.emotionLog && (
                  <span title={EMOTION_LABELS[t.emotionLog.emotion as Emotion]}>
                    {EMOTION_EMOJI[t.emotionLog.emotion as Emotion]}
                  </span>
                )}
              </p>
              {t.isImpulse && (
                <form action={dismissImpulseFlag.bind(null, t.id)} className="mt-1.5 inline-flex items-center gap-2">
                  <Badge tone="warm">possível impulso</Badge>
                  <button type="submit" className="text-xs font-medium text-primary underline underline-offset-2">
                    não foi impulso
                  </button>
                </form>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <span className={`tabular-nums text-sm font-semibold ${t.type === "receita" ? "text-primary" : ""}`}>
                {t.type === "receita" ? "+" : "-"} {formatCurrency(t.amount)}
              </span>
              <form action={deleteTransaction.bind(null, t.id)}>
                <button type="submit" className="text-xs text-foreground-muted underline underline-offset-2">
                  excluir
                </button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
