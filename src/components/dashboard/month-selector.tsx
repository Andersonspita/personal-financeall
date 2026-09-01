"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { shiftDashboardMonthKey } from "@/lib/dashboard-month";

export function MonthSelector({
  monthKey,
  label,
  isCurrent,
}: {
  monthKey: string;
  label: string;
  isCurrent: boolean;
}) {
  const router = useRouter();
  const prev = shiftDashboardMonthKey(monthKey, -1);
  const next = shiftDashboardMonthKey(monthKey, 1);

  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-surface px-3 py-2">
      <button
        type="button"
        aria-label="Mês anterior"
        onClick={() => router.push(`/?month=${prev}`)}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-foreground-muted hover:bg-surface-muted"
      >
        <ChevronLeft size={18} />
      </button>
      <div className="min-w-0 text-center">
        <p className="truncate text-sm font-medium capitalize">{label}</p>
        {!isCurrent && (
          <Link href="/" className="text-xs text-primary">
            Voltar ao mês atual
          </Link>
        )}
      </div>
      <button
        type="button"
        aria-label="Próximo mês"
        onClick={() => router.push(`/?month=${next}`)}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-foreground-muted hover:bg-surface-muted"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
