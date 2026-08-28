import { Check } from "lucide-react";
import { upsertBudgetFromForm } from "@/actions/budgets";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { fieldControlClass } from "@/components/ui/control";
import { getBudgetAlertLevel } from "@/lib/budgeting";
import { BUDGET_ALERT_COPY } from "@/lib/copy";
import { formatCurrency } from "@/lib/format";

type CeilingCategory = {
  id: string;
  name: string;
  icon: string | null;
  spent: number;
  limit: number | null;
};

export function CategoryCeilingList({ month, categories }: { month: string; categories: CeilingCategory[] }) {
  return (
    <Card>
      <CardTitle>Tetos por categoria de gasto</CardTitle>
      <div className="flex flex-col gap-5">
        {categories.map((category) => {
          const alertLevel = category.limit ? getBudgetAlertLevel(category.spent, category.limit) : "dentro_do_limite";
          return (
            <div key={category.id} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate font-medium">
                  {category.icon} {category.name}
                </span>
                <span className="shrink-0 tabular-nums text-sm text-foreground-muted">
                  {formatCurrency(category.spent)}
                  {category.limit ? ` / ${formatCurrency(category.limit)}` : ""}
                </span>
              </div>
              {category.limit ? (
                <ProgressBar ratio={category.spent / category.limit} tone={alertLevel} />
              ) : (
                <p className="text-xs text-foreground-muted">Sem teto definido.</p>
              )}
              {category.limit && alertLevel !== "dentro_do_limite" && (
                <p className="text-xs text-foreground-muted">
                  {alertLevel === "alerta_80"
                    ? BUDGET_ALERT_COPY.at80(category.name)
                    : BUDGET_ALERT_COPY.at100(category.name)}
                </p>
              )}
              <form action={upsertBudgetFromForm} className="mt-1 flex items-center gap-2">
                <input type="hidden" name="categoryId" value={category.id} />
                <input type="hidden" name="month" value={month} />
                <input
                  name="limitAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  defaultValue={category.limit ?? undefined}
                  placeholder="Definir teto"
                  aria-label={`Teto de ${category.name}`}
                  className={`${fieldControlClass()} w-32 shrink-0 py-2 text-sm`}
                />
                <Button type="submit" variant="subtle" className="px-3 py-2 text-xs">
                  <Check size={14} /> Salvar
                </Button>
              </form>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
