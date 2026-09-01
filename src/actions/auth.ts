"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  registerUser,
  authenticateUser,
  requestPasswordReset,
  resetPasswordWithToken,
  AuthError,
} from "@/lib/auth/service";
import { createSession, destroySession } from "@/lib/auth/session";
import { getOnboardingStatus } from "@/lib/profile/service";
import { fieldErrorsFromZod, logAppError, type FormActionState } from "@/lib/errors";
import { appBaseUrl } from "@/lib/auth/config";

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

async function requestOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  return appBaseUrl(host ? `${proto}://${host}` : undefined);
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
  redirect("/onboarding");
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
  const status = await getOnboardingStatus(user.id);
  redirect(status === "pending" ? "/onboarding" : "/");
}

export async function requestPasswordResetAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    const origin = await requestOrigin();
    const result = await requestPasswordReset({ email: formData.get("email") }, origin);
    return { success: true, error: result.message };
  } catch (err) {
    return stateFromError(err);
  }
}

export async function resetPasswordAction(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  let user;
  try {
    user = await resetPasswordWithToken({
      token: formData.get("token"),
      password: formData.get("password"),
    });
  } catch (err) {
    return stateFromError(err);
  }
  await createSession(user.id, user.email);
  const status = await getOnboardingStatus(user.id);
  redirect(status === "pending" ? "/onboarding" : "/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
