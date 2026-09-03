import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { ensureDefaultIncomeCategories } from "@/lib/onboarding";

export const dynamic = "force-dynamic";

export default async function NewTransactionPage() {
  const user = await requireUser();
  await ensureDefaultIncomeCategories(user.id);
  const [accounts, categories] = await Promise.all([
    prisma.account.findMany({ where: { userId: user.id, archived: false }, orderBy: { createdAt: "asc" } }),
    prisma.category.findMany({ where: { userId: user.id, archived: false }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl flex flex-col gap-4">
      <Link href="/transacoes" className="flex items-center gap-1 text-sm text-foreground-muted">
        <ArrowLeft size={16} /> Voltar
      </Link>
      <PageHeader title="Novo lançamento" subtitle="Receita ou despesa, no seu tempo" />
      <TransactionForm accounts={accounts} categories={categories} />
    </div>
  );
}
