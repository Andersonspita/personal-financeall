import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  BUDGET_GROUPS,
  CATEGORY_GROUP_LABEL,
  CATEGORY_GROUP_TARGET_RATIO,
  getBudgetAlertLevel,
  type BudgetGroup,
} from "@/lib/budgeting";
import { formatCurrency } from "@/lib/format";

export function BudgetDistributionCard({
  groupTotals,
  totalIncome,
}: {
  groupTotals: Record<BudgetGroup, number>;
  totalIncome: number;
}) {
  return (
    <Card>
      <CardTitle>Distribuição 50-30-20</CardTitle>
      <div className="flex flex-col gap-5">
        {BUDGET_GROUPS.map((group) => {
          const spent = groupTotals[group];
          const ratio = totalIncome > 0 ? spent / totalIncome : 0;
          const target = CATEGORY_GROUP_TARGET_RATIO[group];
          return (
            <div key={group} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate font-medium">
                  {CATEGORY_GROUP_LABEL[group]}{" "}
                  <span className="font-normal text-foreground-muted">(meta {target * 100}%)</span>
                </span>
                <span className="shrink-0 tabular-nums text-sm text-foreground-muted">
                  {formatCurrency(spent)} · {(ratio * 100).toFixed(0)}%
                </span>
              </div>
              <ProgressBar ratio={ratio / target} tone={getBudgetAlertLevel(ratio, target)} />
            </div>
          );
        })}
        {totalIncome === 0 && (
          <p className="text-xs text-foreground-muted">
            Lance uma receita este mês para calcular os percentuais em relação à renda.
          </p>
        )}
      </div>
    </Card>
  );
}
