import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonClass, iconActionClass } from "@/components/ui/control";
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
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Lançamentos</h1>
        <Link href="/transacoes/novo" className={buttonClass("primary", "px-4 py-2")}>
          <Plus size={16} /> Novo
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {transactions.length === 0 && (
          <Card>
            <p className="text-sm text-foreground-muted">Nenhum lançamento ainda.</p>
          </Card>
        )}
        {transactions.map((t) => (
          <Card key={t.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-medium">{t.description || t.category?.name || "Lançamento"}</p>
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-foreground-muted/80">
                {formatDateTime(t.occurredAt)} · {t.account.name}
                {t.category && <> · {t.category.name}</>}
                {t.emotionLog && (
                  <span title={EMOTION_LABELS[t.emotionLog.emotion as Emotion]}>
                    {EMOTION_EMOJI[t.emotionLog.emotion as Emotion]}
                  </span>
                )}
              </p>
              {t.isImpulse && (
                <form action={dismissImpulseFlag.bind(null, t.id)} className="mt-2 inline-flex items-center gap-2">
                  <Badge tone="warm">possível impulso</Badge>
                  <Button type="submit" variant="subtle" className="text-xs">
                    não foi impulso
                  </Button>
                </form>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <span className={`tabular-nums text-base font-semibold ${t.type === "receita" ? "text-primary" : ""}`}>
                {t.type === "receita" ? "+" : "-"} {formatCurrency(t.amount)}
              </span>
              <div className="flex items-center gap-1">
                <Link
                  href={`/transacoes/${t.id}/editar`}
                  className={iconActionClass}
                  aria-label="Editar lançamento"
                  title="Editar"
                >
                  <Pencil size={16} />
                </Link>
                <form action={deleteTransaction.bind(null, t.id)}>
                  <button type="submit" className={iconActionClass} aria-label="Excluir lançamento" title="Excluir">
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
