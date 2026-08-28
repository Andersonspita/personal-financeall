import { format, startOfMonth, endOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getBudgetAlertLevel, CATEGORY_GROUP_TARGET_RATIO, CATEGORY_GROUPS, BUDGET_GROUPS, type CategoryGroup, type BudgetGroup } from "@/lib/budgeting";
import { upsertBudgetFromForm } from "@/actions/budgets";
import { createCategoryFromForm } from "@/actions/categories";
import { formatCurrency } from "@/lib/format";
import { BUDGET_ALERT_COPY } from "@/lib/copy";
import { ensureDefaultIncomeCategories } from "@/lib/onboarding";
import { ensureCurrentMonthBudgets } from "@/lib/budget-alerts";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { controlClass } from "@/components/ui/control";
import { Check } from "lucide-react";

export const dynamic = "force-dynamic";

const GROUP_LABEL: Record<CategoryGroup, string> = {
  essencial: "Essencial",
  variavel: "Variável",
  poupanca: "Poupança",
  renda: "Renda",
};

export default async function BudgetsPage() {
  const user = await requireUser();
  await ensureDefaultIncomeCategories(user.id);
  await ensureCurrentMonthBudgets(user.id);
  const now = new Date();
  const month = format(now, "yyyy-MM");
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [categories, spentByCategory, income, budgets] = await Promise.all([
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId: user.id, type: "despesa", occurredAt: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId: user.id, type: "receita", occurredAt: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.budget.findMany({ where: { userId: user.id, month } }),
  ]);

  const spentMap = new Map(spentByCategory.map((s) => [s.categoryId, s._sum.amount ?? 0]));
  const budgetMap = new Map(budgets.map((b) => [b.categoryId, b.limitAmount]));
  const totalIncome = income._sum.amount ?? 0;

  const groupTotals: Record<BudgetGroup, number> = { essencial: 0, variavel: 0, poupanca: 0 };
  for (const c of categories) {
    if (!(BUDGET_GROUPS as readonly string[]).includes(c.group)) continue;
    groupTotals[c.group as BudgetGroup] += spentMap.get(c.id) ?? 0;
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold">Orçamentos</h1>

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
                    {GROUP_LABEL[group]}{" "}
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

      <Card>
        <CardTitle>Categorias de renda</CardTitle>
        <p className="mb-3 text-sm text-foreground-muted">
          Usadas só em lançamentos do tipo receita (salário, freelance, 13º). Não entram nos tetos nem no 50-30-20.
        </p>
        <ul className="flex flex-col gap-2 text-sm">
          {categories
            .filter((c) => c.group === "renda")
            .map((c) => (
              <li key={c.id}>
                {c.icon} {c.name}
              </li>
            ))}
        </ul>
      </Card>

      <Card>
        <CardTitle>Tetos por categoria de gasto</CardTitle>
        <div className="flex flex-col gap-5">
          {categories
            .filter((c) => c.group !== "renda")
            .map((c) => {
            const spent = spentMap.get(c.id) ?? 0;
            const limit = budgetMap.get(c.id) ?? c.monthlyLimit ?? null;
            const alertLevel = limit ? getBudgetAlertLevel(spent, limit) : "dentro_do_limite";
            return (
              <div key={c.id} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate font-medium">
                    {c.icon} {c.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-sm text-foreground-muted">
                    {formatCurrency(spent)}
                    {limit ? ` / ${formatCurrency(limit)}` : ""}
                  </span>
                </div>
                {limit ? (
                  <ProgressBar ratio={spent / limit} tone={alertLevel} />
                ) : (
                  <p className="text-xs text-foreground-muted">Sem teto definido.</p>
                )}
                {limit && alertLevel !== "dentro_do_limite" && (
                  <p className="text-xs text-foreground-muted">
                    {alertLevel === "alerta_80" ? BUDGET_ALERT_COPY.at80(c.name) : BUDGET_ALERT_COPY.at100(c.name)}
                  </p>
                )}
                <form action={upsertBudgetFromForm} className="mt-1 flex items-center gap-2">
                  <input type="hidden" name="categoryId" value={c.id} />
                  <input type="hidden" name="month" value={month} />
                  <input
                    name="limitAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    defaultValue={limit ?? undefined}
                    placeholder="Definir teto"
                    className={`${controlClass} w-32 shrink-0 py-2 text-sm`}
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

      <Card>
        <CardTitle>Nova categoria</CardTitle>
        <form action={createCategoryFromForm} className="flex flex-col gap-4">
          <div className="flex min-w-0 gap-2">
            <input
              name="icon"
              maxLength={4}
              placeholder="🏷️"
              className={`${controlClass} w-16 shrink-0 px-2 text-center`}
            />
            <input
              name="name"
              required
              placeholder="Nome da categoria"
              className={controlClass}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <Select name="group" required>
              {CATEGORY_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {GROUP_LABEL[g]}
                </option>
              ))}
            </Select>
            <input
              name="monthlyLimit"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Teto mensal (opcional)"
              className={controlClass}
            />
          </div>
          <p className="text-xs text-foreground-muted">
            Grupo <strong>Renda</strong> = entradas. Essencial, variável e poupança = gastos (50-30-20). Teto mensal só
            faz sentido para gasto.
          </p>
          <Button type="submit">Criar categoria</Button>
        </form>
      </Card>
    </div>
  );
}
