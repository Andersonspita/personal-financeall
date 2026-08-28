import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
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
        {transactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
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
        ))}
      </div>
    </div>
  );
}
