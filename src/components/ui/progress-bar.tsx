import { clsx } from "clsx";
import type { BudgetAlertLevel } from "@/lib/budgeting";

const TONE: Record<BudgetAlertLevel, string> = {
  dentro_do_limite: "bg-primary",
  alerta_80: "bg-warm",
  estourado: "bg-critical",
};

export function ProgressBar({ ratio, tone }: { ratio: number; tone: BudgetAlertLevel }) {
  const width = Math.min(100, Math.max(0, ratio * 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
      <div className={clsx("h-full rounded-full transition-all duration-500", TONE[tone])} style={{ width: `${width}%` }} />
    </div>
  );
}
