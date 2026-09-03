import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { decryptSensitive } from "@/lib/crypto";
import { PageHeader } from "@/components/ui/page-header";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { ensureDefaultIncomeCategories } from "@/lib/onboarding";
import type { Emotion } from "@/lib/emotions";
import { toLocalDatetimeValue } from "@/lib/datetime-local";
import { logAppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  await ensureDefaultIncomeCategories(user.id);
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId: user.id },
    include: { emotionLog: true },
  });

  if (!transaction) notFound();

  const [accounts, categories] = await Promise.all([
    prisma.account.findMany({ where: { userId: user.id, archived: false }, orderBy: { createdAt: "asc" } }),
    prisma.category.findMany({
      where: {
        userId: user.id,
        OR: [{ archived: false }, ...(transaction.categoryId ? [{ id: transaction.categoryId }] : [])],
      },
      orderBy: { name: "asc" },
    }),
  ]);

  let note = "";
  let noteUnavailable = false;
  if (transaction.emotionLog?.noteEncrypted) {
    try {
      note = decryptSensitive(transaction.emotionLog.noteEncrypted);
    } catch (err) {
      logAppError("emotion.note.decrypt", err, { transactionId: transaction.id });
      noteUnavailable = true;
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex flex-col gap-4">
      <Link href="/transacoes" className="flex items-center gap-1 text-sm text-foreground-muted">
        <ArrowLeft size={16} /> Voltar
      </Link>
      <PageHeader title="Editar lançamento" />
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
          noteUnavailable,
        }}
      />
    </div>
  );
}
