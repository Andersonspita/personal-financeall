"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { registerUser, authenticateUser, AuthError } from "@/lib/auth/service";
import { createSession, destroySession } from "@/lib/auth/session";
import { fieldErrorsFromZod, logAppError, type FormActionState } from "@/lib/errors";

export type AuthFormState = FormActionState;

function stateFromError(err: unknown): AuthFormState {
  if (err instanceof AuthError) return { error: err.message };
  if (err instanceof z.ZodError) {
    return {
      error: err.issues[0]?.message ?? "Revise os campos e tente de novo.",
      fieldErrors: fieldErrorsFromZod(err),
    };
  }
  logAppError("auth.form", err);
  return { error: "Algo deu errado. Tente novamente em instantes." };
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
    return stateFromError(err);
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
    return stateFromError(err);
  }
  await createSession(user.id, user.email);
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
