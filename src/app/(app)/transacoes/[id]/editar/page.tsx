import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { decryptSensitive } from "@/lib/crypto";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { ensureDefaultIncomeCategories } from "@/lib/onboarding";
import type { Emotion } from "@/lib/emotions";

export const dynamic = "force-dynamic";

function toLocalDatetimeValue(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  await ensureDefaultIncomeCategories(user.id);
  const [transaction, accounts, categories] = await Promise.all([
    prisma.transaction.findFirst({
      where: { id, userId: user.id },
      include: { emotionLog: true },
    }),
    prisma.account.findMany({ where: { userId: user.id, archived: false }, orderBy: { createdAt: "asc" } }),
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
  ]);

  if (!transaction) notFound();

  let note = "";
  if (transaction.emotionLog?.noteEncrypted) {
    try {
      note = decryptSensitive(transaction.emotionLog.noteEncrypted);
    } catch {
      note = "";
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Link href="/transacoes" className="flex items-center gap-1 text-sm text-foreground-muted">
        <ArrowLeft size={16} /> Voltar
      </Link>
      <h1 className="text-xl font-semibold">Editar lançamento</h1>
      <TransactionForm
        accounts={accounts}
        categories={categories}
        initial={{
          id: transaction.id,
          type: transaction.type as "receita" | "despesa",
          amount: transaction.amount,
          description: transaction.description ?? "",
          accountId: transaction.accountId,
          categoryId: transaction.categoryId ?? "",
          occurredAt: toLocalDatetimeValue(transaction.occurredAt),
          essential: transaction.essential,
          emotion: (transaction.emotionLog?.emotion as Emotion | undefined) ?? null,
          note,
        }}
      />
    </div>
  );
}
