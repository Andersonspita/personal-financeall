"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { registerUser, authenticateUser, AuthError } from "@/lib/auth/service";
import { createSession, destroySession } from "@/lib/auth/session";

export interface AuthFormState {
  error?: string;
}

function messageFromError(err: unknown): string {
  if (err instanceof AuthError) return err.message;
  if (err instanceof z.ZodError) return err.issues[0]?.message ?? "Dados inválidos.";
  return "Algo deu errado. Tente novamente em instantes.";
}

export async function registerAction(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  let user;
  try {
    user = await registerUser({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
  } catch (err) {
    return { error: messageFromError(err) };
  }
  await createSession(user.id, user.email);
  redirect("/");
}

export async function loginAction(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  let user;
  try {
    user = await authenticateUser({
      email: formData.get("email"),
      password: formData.get("password"),
    });
  } catch (err) {
    return { error: messageFromError(err) };
  }
  await createSession(user.id, user.email);
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
