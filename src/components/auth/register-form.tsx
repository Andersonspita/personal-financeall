"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthFormState } from "@/actions/auth";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Nome
        <input
          name="name"
          type="text"
          required
          autoComplete="name"
          className="rounded-lg border border-border bg-surface px-3 py-2.5 text-base"
        />
      </label>
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
          minLength={8}
          autoComplete="new-password"
          className="rounded-lg border border-border bg-surface px-3 py-2.5 text-base"
        />
        <span className="text-xs text-foreground-muted">Pelo menos 8 caracteres.</span>
      </label>

      {state.error && <p className="text-sm text-critical">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="text-center text-sm text-foreground-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-primary">
          Entrar
        </Link>
      </p>
    </form>
  );
}
