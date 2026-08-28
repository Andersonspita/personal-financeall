"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthFormState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { fieldControlClass } from "@/components/ui/control";
import { GoogleSignInButton } from "@/components/auth/google-button";

const initialState: AuthFormState = {};

const GOOGLE_ERROR_COPY: Record<string, string> = {
  google: "Não foi possível entrar com o Google. Tente de novo.",
  "google-denied": "Você cancelou o acesso com o Google.",
  "google-off": "O login com Google ainda não está configurado neste servidor.",
};

export function LoginForm({ googleEnabled, oauthError }: { googleEnabled: boolean; oauthError?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const oauthMessage = oauthError ? GOOGLE_ERROR_COPY[oauthError] ?? GOOGLE_ERROR_COPY.google : null;

  return (
    <div className="flex flex-col gap-4">
      {googleEnabled && (
        <>
          <GoogleSignInButton />
          <p className="text-center text-xs text-foreground-muted">ou entre com e-mail</p>
        </>
      )}

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

        {oauthMessage && (
          <p className="text-sm text-critical" role="alert">
            {oauthMessage}
          </p>
        )}

        {state.error && !state.fieldErrors && (
          <p className="text-sm text-critical" role="alert">
            {state.error}
          </p>
        )}

        <Button type="submit" pending={isPending}>
          {isPending ? "Entrando..." : "Entrar"}
        </Button>

        <p className="text-center text-sm">
          <Link href="/recuperar-senha" className="font-medium text-primary">
            Esqueci a senha
          </Link>
        </p>

        <p className="text-center text-sm text-foreground-muted">
          Ainda não tem conta?{" "}
          <Link href="/registrar" className="font-medium text-primary">
            Criar conta
          </Link>
        </p>
      </form>
    </div>
  );
}
