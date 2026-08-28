import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { iconActionClass } from "@/components/ui/control";
import { dismissImpulseFlag, deleteTransaction } from "@/actions/transactions";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { EMOTION_EMOJI, EMOTION_LABELS, type Emotion } from "@/lib/emotions";

export type TransactionListItem = {
  id: string;
  description: string | null;
  amount: number;
  type: string;
  occurredAt: Date;
  isImpulse: boolean;
  accountName: string;
  categoryName: string | null;
  emotion: string | null;
};

export function TransactionRow({ transaction }: { transaction: TransactionListItem }) {
  const emotion = transaction.emotion as Emotion | null;

  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-base font-medium">
          {transaction.description || transaction.categoryName || "Lançamento"}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-foreground-muted/80">
          {formatDateTime(transaction.occurredAt)} · {transaction.accountName}
          {transaction.categoryName && <> · {transaction.categoryName}</>}
          {emotion && (
            <span title={EMOTION_LABELS[emotion]}>{EMOTION_EMOJI[emotion]}</span>
          )}
        </p>
        {transaction.isImpulse && (
          <form action={dismissImpulseFlag.bind(null, transaction.id)} className="mt-2 inline-flex items-center gap-2">
            <Badge tone="warm">possível impulso</Badge>
            <Button type="submit" variant="subtle" className="text-xs">
              não foi impulso
            </Button>
          </form>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className={`tabular-nums text-base font-semibold ${transaction.type === "receita" ? "text-primary" : ""}`}>
          {transaction.type === "receita" ? "+" : "-"} {formatCurrency(transaction.amount)}
        </span>
        <div className="flex items-center gap-1">
          <Link
            href={`/transacoes/${transaction.id}/editar`}
            className={iconActionClass}
            aria-label="Editar lançamento"
            title="Editar"
          >
            <Pencil size={16} />
          </Link>
          <form action={deleteTransaction.bind(null, transaction.id)}>
            <button type="submit" className={iconActionClass} aria-label="Excluir lançamento" title="Excluir">
              <Trash2 size={16} />
            </button>
          </form>
        </div>
      </div>
    </Card>
  );
}
