import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { buttonClass } from "@/components/ui/control";
import { TransactionRow } from "@/components/transactions/transaction-row";

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
      <PageHeader
        title="Lançamentos"
        subtitle="O que entrou e saiu"
        trailing={
          <Link href="/transacoes/novo" className={buttonClass("primary", "hidden px-4 py-2 md:inline-flex")}>
            <Plus size={16} /> Novo
          </Link>
        }
      />

      {transactions.length === 0 ? (
        <Card>
          <p className="text-sm text-foreground-muted">Nenhum lançamento ainda.</p>
          <p className="mt-1 text-sm text-foreground-muted">Toque no + para registrar a primeira movimentação.</p>
        </Card>
      ) : (
        <ul className="overflow-hidden rounded-3xl border border-border bg-surface">
          {transactions.map((transaction) => (
            <li key={transaction.id} className="border-b border-border last:border-b-0">
              <TransactionRow
                transaction={{
                  id: transaction.id,
                  description: transaction.description,
                  amount: transaction.amount,
                  type: transaction.type,
                  occurredAt: transaction.occurredAt,
                  isImpulse: transaction.isImpulse,
                  accountName: transaction.account.name,
                  categoryName: transaction.category?.name ?? null,
                  emotion: transaction.emotionLog?.emotion ?? null,
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
