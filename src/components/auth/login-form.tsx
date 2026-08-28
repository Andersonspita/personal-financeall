"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthFormState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { fieldControlClass } from "@/components/ui/control";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

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
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          className={fieldControlClass(Boolean(state.fieldErrors?.email))}
        />
      </Field>
      <Field label="Senha" htmlFor="password" error={state.fieldErrors?.password}>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
          className={fieldControlClass(Boolean(state.fieldErrors?.password))}
        />
      </Field>

      {state.error && !state.fieldErrors && (
        <p className="text-sm text-critical" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" pending={isPending}>
        {isPending ? "Entrando..." : "Entrar"}
      </Button>

      <p className="text-center text-sm text-foreground-muted">
        Ainda não tem conta?{" "}
        <Link href="/registrar" className="font-medium text-primary">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
