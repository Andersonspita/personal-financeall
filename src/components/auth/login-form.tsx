"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthFormState } from "@/actions/auth";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        E-mail
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-lg border border-border bg-surface px-3 py-2.5 text-base"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Senha
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-lg border border-border bg-surface px-3 py-2.5 text-base"
        />
      </label>

      {state.error && <p className="text-sm text-critical">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center text-sm text-foreground-muted">
        Ainda não tem conta?{" "}
        <Link href="/registrar" className="font-medium text-primary">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
