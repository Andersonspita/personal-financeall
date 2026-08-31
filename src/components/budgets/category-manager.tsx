"use client";

import { useActionState, type ReactNode } from "react";
import { Check } from "lucide-react";
import {
  archiveCategoryFromForm,
  restoreCategoryFromForm,
  updateCategoryFromForm,
} from "@/actions/categories";
import { upsertBudgetFromForm } from "@/actions/budgets";
import { CATEGORY_GROUPS, CATEGORY_GROUP_LABEL, getBudgetAlertLevel } from "@/lib/budgeting";
import { BUDGET_ALERT_COPY } from "@/lib/copy";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { fieldControlClass } from "@/components/ui/control";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { FormActionState } from "@/lib/errors";

export type ManagedCategory = {
  id: string;
  name: string;
  group: string;
  icon: string | null;
  archived: boolean;
  spent: number;
  limit: number | null;
};

const idle: FormActionState = {};

function CategoryFields({
  category,
  saveState,
}: {
  category: ManagedCategory;
  saveState: FormActionState;
}) {
  return (
    <>
      <input type="hidden" name="id" value={category.id} />
      <div className="flex min-w-0 items-start gap-2">
        <div className="flex w-16 shrink-0 flex-col gap-1.5">
          <span className="text-sm">Ícone</span>
          <input
            name="icon"
            maxLength={4}
            defaultValue={category.icon ?? ""}
            aria-label={`Ícone de ${category.name}`}
            className={`${fieldControlClass()} px-2 text-center`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <Field label="Nome" htmlFor={`category-name-${category.id}`} error={saveState.fieldErrors?.name}>
            <input
              id={`category-name-${category.id}`}
              name="name"
              required
              maxLength={60}
              defaultValue={category.name}
              aria-invalid={Boolean(saveState.fieldErrors?.name)}
              className={fieldControlClass(Boolean(saveState.fieldErrors?.name))}
            />
          </Field>
        </div>
      </div>
      <Field label="Grupo" htmlFor={`category-group-${category.id}`} error={saveState.fieldErrors?.group}>
        <Select
          id={`category-group-${category.id}`}
          name="group"
          required
          defaultValue={category.group}
          invalid={Boolean(saveState.fieldErrors?.group)}
        >
          {CATEGORY_GROUPS.map((group) => (
            <option key={group} value={group}>
              {CATEGORY_GROUP_LABEL[group]}
            </option>
          ))}
        </Select>
      </Field>
    </>
  );
}

function ArchiveControls({
  category,
  canArchive,
  lastKindLabel,
}: {
  category: ManagedCategory;
  canArchive: boolean;
  lastKindLabel: string;
}) {
  const [archiveState, archiveAction, archivePending] = useActionState(archiveCategoryFromForm, idle);

  if (!canArchive) {
    return (
      <p className="text-xs text-foreground-muted">
        Esta é a única categoria de {lastKindLabel} ativa — os lançamentos precisam dela.
      </p>
    );
  }

  return (
    <form action={archiveAction}>
      <input type="hidden" name="id" value={category.id} />
      {archiveState.error && (
        <p className="mb-2 text-sm text-critical" role="alert">
          {archiveState.error}
        </p>
      )}
      <Button type="submit" variant="secondary" pending={archivePending} className="text-xs">
        {archivePending ? "Arquivando..." : "Arquivar"}
      </Button>
    </form>
  );
}

function ActiveCategoryEditor({
  category,
  canArchive,
  lastKindLabel,
  children,
}: {
  category: ManagedCategory;
  canArchive: boolean;
  lastKindLabel: string;
  children?: ReactNode;
}) {
  const [saveState, saveAction, savePending] = useActionState(updateCategoryFromForm, idle);

  return (
    <li className="flex flex-col gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0">
      <form action={saveAction} className="flex flex-col gap-3">
        <CategoryFields category={category} saveState={saveState} />
        {saveState.error && !saveState.fieldErrors && (
          <p className="text-sm text-critical" role="alert">
            {saveState.error}
          </p>
        )}
        {saveState.success && (
          <p className="text-sm text-primary" role="status">
            Alterações salvas.
          </p>
        )}
        <Button type="submit" variant="subtle" pending={savePending} className="self-start">
          {savePending ? "Salvando..." : "Salvar categoria"}
        </Button>
      </form>
      {children}
      <ArchiveControls category={category} canArchive={canArchive} lastKindLabel={lastKindLabel} />
    </li>
  );
}

function ExpenseTeto({ category, month }: { category: ManagedCategory; month: string }) {
  const alertLevel = category.limit ? getBudgetAlertLevel(category.spent, category.limit) : "dentro_do_limite";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs text-foreground-muted">Gasto no mês</span>
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
}

function ArchivedCategoryRow({ category }: { category: ManagedCategory }) {
  const [state, formAction, isPending] = useActionState(restoreCategoryFromForm, idle);
  const groupLabel =
    CATEGORY_GROUP_LABEL[category.group as keyof typeof CATEGORY_GROUP_LABEL] ?? category.group;

  return (
    <li className="flex flex-col gap-2 border-t border-border pt-3 first:border-t-0 first:pt-0">
      <div>
        <p className="font-medium">
          {category.icon} {category.name}
        </p>
        <p className="text-xs text-foreground-muted">{groupLabel}</p>
      </div>
      {state.error && (
        <p className="text-sm text-critical" role="alert">
          {state.error}
        </p>
      )}
      <form action={formAction}>
        <input type="hidden" name="id" value={category.id} />
        <Button type="submit" variant="secondary" pending={isPending} className="text-xs">
          {isPending ? "Reativando..." : "Reativar"}
        </Button>
      </form>
    </li>
  );
}

export function CategoryManager({ month, categories }: { month: string; categories: ManagedCategory[] }) {
  const income = categories.filter((category) => !category.archived && category.group === "renda");
  const expenses = categories.filter((category) => !category.archived && category.group !== "renda");
  const archived = categories.filter((category) => category.archived);
  const canArchiveIncome = income.length > 1;
  const canArchiveExpense = expenses.length > 1;

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardTitle>Categorias de renda</CardTitle>
        <p className="mb-3 text-sm text-foreground-muted">
          Usadas só em lançamentos do tipo receita (salário, freelance, 13º). Não entram nos tetos nem no 50-30-20.
        </p>
        <ul className="flex flex-col gap-4">
          {income.map((category) => (
            <ActiveCategoryEditor
              key={category.id}
              category={category}
              canArchive={canArchiveIncome}
              lastKindLabel="renda"
            />
          ))}
        </ul>
      </Card>

      <Card>
        <CardTitle>Tetos por categoria de gasto</CardTitle>
        <p className="mb-3 text-sm text-foreground-muted">
          Edite nome, ícone e grupo, ou defina o teto do mês. Arquivar some da lista de lançamentos novos; o histórico
          continua.
        </p>
        <ul className="flex flex-col gap-4">
          {expenses.map((category) => (
            <ActiveCategoryEditor
              key={category.id}
              category={category}
              canArchive={canArchiveExpense}
              lastKindLabel="gasto"
            >
              <ExpenseTeto category={category} month={month} />
            </ActiveCategoryEditor>
          ))}
        </ul>
      </Card>

      {archived.length > 0 && (
        <Card>
          <CardTitle>Arquivadas</CardTitle>
          <p className="mb-3 text-sm text-foreground-muted">
            Não aparecem em lançamentos novos nem na trava de resfriamento. Reative para usar de novo.
          </p>
          <ul className="flex flex-col gap-3">
            {archived.map((category) => (
              <ArchivedCategoryRow key={category.id} category={category} />
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
