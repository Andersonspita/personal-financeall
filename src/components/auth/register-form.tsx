"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthFormState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { fieldControlClass } from "@/components/ui/control";
import { GoogleSignInButton } from "@/components/auth/google-button";

const initialState: AuthFormState = {};

export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <div className="flex flex-col gap-4">
      {googleEnabled && (
        <>
          <GoogleSignInButton />
          <p className="text-center text-xs text-foreground-muted">ou crie com e-mail</p>
        </>
      )}

      <form action={formAction} className="flex flex-col gap-4">
      <Field label="Nome" htmlFor="name" error={state.fieldErrors?.name}>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          aria-invalid={Boolean(state.fieldErrors?.name)}
          aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
          className={fieldControlClass(Boolean(state.fieldErrors?.name))}
        />
      </Field>
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
      <Field
        label="Senha"
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
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
          className={fieldControlClass(Boolean(state.fieldErrors?.password))}
        />
      </Field>

      {state.error && !state.fieldErrors && <p className="text-sm text-critical" role="alert">{state.error}</p>}

      <Button type="submit" pending={isPending}>
        {isPending ? "Criando conta..." : "Criar conta"}
      </Button>

      <p className="text-center text-sm text-foreground-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-primary">
          Entrar
        </Link>
      </p>
      </form>
    </div>
  );
}
