"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction, type AuthFormState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { fieldControlClass } from "@/components/ui/control";

const initialState: AuthFormState = {};

export function RequestResetForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="E-mail" htmlFor="email" error={state.fieldErrors?.email}>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          className={fieldControlClass(Boolean(state.fieldErrors?.email))}
        />
      </Field>

      {state.success && state.error && (
        <p className="text-sm text-calm" role="status">
          {state.error}
        </p>
      )}
      {state.error && !state.success && !state.fieldErrors && (
        <p className="text-sm text-critical" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" pending={isPending}>
        {isPending ? "Enviando..." : "Enviar link"}
      </Button>

      <p className="text-center text-sm text-foreground-muted">
        <Link href="/login" className="font-medium text-primary">
          Voltar ao login
        </Link>
      </p>
    </form>
  );
}
