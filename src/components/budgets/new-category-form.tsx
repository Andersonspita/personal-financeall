"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCategoryFromForm } from "@/actions/categories";
import { CATEGORY_GROUPS, CATEGORY_GROUP_LABEL } from "@/lib/budgeting";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { fieldControlClass } from "@/components/ui/control";
import type { FormActionState } from "@/lib/errors";

const initialState: FormActionState = {};

export function NewCategoryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createCategoryFromForm, initialState);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="flex min-w-0 items-start gap-2">
        <div className="flex w-16 shrink-0 flex-col gap-1.5">
          <span className="text-sm">Ícone</span>
          <input
            name="icon"
            maxLength={4}
            placeholder="🏷️"
            aria-label="Ícone"
            className={`${fieldControlClass()} px-2 text-center`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <Field label="Nome" htmlFor="category-name" error={state.fieldErrors?.name}>
            <input
              id="category-name"
              name="name"
              required
              placeholder="Nome da categoria"
              aria-invalid={Boolean(state.fieldErrors?.name)}
              aria-describedby={state.fieldErrors?.name ? "category-name-error" : undefined}
              className={fieldControlClass(Boolean(state.fieldErrors?.name))}
            />
          </Field>
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
        <Field label="Grupo" htmlFor="category-group" error={state.fieldErrors?.group}>
          <Select id="category-group" name="group" required invalid={Boolean(state.fieldErrors?.group)}>
            {CATEGORY_GROUPS.map((group) => (
              <option key={group} value={group}>
                {CATEGORY_GROUP_LABEL[group]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Teto mensal" htmlFor="category-limit" error={state.fieldErrors?.monthlyLimit} hint="Opcional, só para gasto">
          <input
            id="category-limit"
            name="monthlyLimit"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Teto mensal"
            aria-invalid={Boolean(state.fieldErrors?.monthlyLimit)}
            className={fieldControlClass(Boolean(state.fieldErrors?.monthlyLimit))}
          />
        </Field>
      </div>
      <p className="text-xs text-foreground-muted">
        Grupo <strong>Renda</strong> = entradas. Essencial, variável e poupança = gastos (50-30-20). Teto mensal só
        faz sentido para gasto.
      </p>
      {state.error && !state.fieldErrors && <p className="text-sm text-critical" role="alert">{state.error}</p>}
      <Button type="submit" pending={isPending}>
        {isPending ? "Criando..." : "Criar categoria"}
      </Button>
    </form>
  );
}
