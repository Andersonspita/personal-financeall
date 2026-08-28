"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction, type AuthFormState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { fieldControlClass } from "@/components/ui/control";

const initialState: AuthFormState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <Field
        label="Nova senha"
        htmlFor="password"
        error={state.fieldErrors?.password}
        hint="Pelo menos 8 caracteres."
      >
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          className={fieldControlClass(Boolean(state.fieldErrors?.password))}
        />
      </Field>

      {state.error && !state.fieldErrors && (
        <p className="text-sm text-critical" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" pending={isPending}>
        {isPending ? "Salvando..." : "Definir senha e entrar"}
      </Button>

      <p className="text-center text-sm text-foreground-muted">
        <Link href="/recuperar-senha" className="font-medium text-primary">
          Pedir um link novo
        </Link>
      </p>
    </form>
  );
}
