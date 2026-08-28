"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAccountFromForm } from "@/actions/accounts";
import { ACCOUNT_TYPES, ACCOUNT_TYPE_LABEL } from "@/lib/accounts";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { fieldControlClass } from "@/components/ui/control";
import type { FormActionState } from "@/lib/errors";

const initialState: FormActionState = {};

export function NewMoneyAccountForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createAccountFromForm, initialState);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <Field label="Nome" htmlFor="new-account-name" error={state.fieldErrors?.name}>
        <input
          id="new-account-name"
          name="name"
          required
          maxLength={80}
          placeholder="Ex: Nubank, carteira, cartão"
          aria-invalid={Boolean(state.fieldErrors?.name)}
          aria-describedby={state.fieldErrors?.name ? "new-account-name-error" : undefined}
          className={fieldControlClass(Boolean(state.fieldErrors?.name))}
        />
      </Field>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
        <Field label="Tipo" htmlFor="new-account-type" error={state.fieldErrors?.type}>
          <Select id="new-account-type" name="type" required invalid={Boolean(state.fieldErrors?.type)}>
            {ACCOUNT_TYPES.map((type) => (
              <option key={type} value={type}>
                {ACCOUNT_TYPE_LABEL[type]}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Saldo inicial"
          htmlFor="new-account-balance"
          error={state.fieldErrors?.initialBalance}
          hint="Entra no saldo do Início. Pode ser zero."
        >
          <input
            id="new-account-balance"
            name="initialBalance"
            type="number"
            step="0.01"
            placeholder="0,00"
            aria-invalid={Boolean(state.fieldErrors?.initialBalance)}
            className={fieldControlClass(Boolean(state.fieldErrors?.initialBalance))}
          />
        </Field>
      </div>
      {state.error && !state.fieldErrors && (
        <p className="text-sm text-critical" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" pending={isPending}>
        {isPending ? "Criando..." : "Criar conta"}
      </Button>
    </form>
  );
}
