import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { TransactionForm } from "@/components/transactions/transaction-form";

export const dynamic = "force-dynamic";

export default async function NewTransactionPage() {
  const user = await requireUser();
  const [accounts, categories] = await Promise.all([
    prisma.account.findMany({ where: { userId: user.id, archived: false }, orderBy: { createdAt: "asc" } }),
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/transacoes" className="flex items-center gap-1 text-sm text-foreground-muted">
        <ArrowLeft size={16} /> Voltar
      </Link>
      <h1 className="text-xl font-semibold">Novo lançamento</h1>
      <TransactionForm accounts={accounts} categories={categories} />
    </div>
  );
}
