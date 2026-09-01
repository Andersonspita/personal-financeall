"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { completeOnboarding, skipOnboarding, updateBehavioralProfile } from "@/lib/profile/service";
import { fieldErrorsFromZod, logAppError, type FormActionState } from "@/lib/errors";

export type ProfileFormState = FormActionState;

function stateFromError(err: unknown): ProfileFormState {
  if (err instanceof z.ZodError) {
    return {
      error: err.issues[0]?.message ?? "Revise os campos e tente de novo.",
      fieldErrors: fieldErrorsFromZod(err),
    };
  }
  logAppError("profile.form", err);
  return { error: "Algo deu errado. Tente novamente em instantes." };
}

export async function skipOnboardingAction(): Promise<void> {
  const user = await requireUser();
  await skipOnboarding(user.id);
  redirect("/");
}

export async function completeOnboardingAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await requireUser();
  try {
    await completeOnboarding(user.id, {
      primaryGoal: formData.get("primaryGoal"),
      typicalTrigger: formData.get("typicalTrigger"),
      cooldownHours: formData.get("cooldownHours"),
      incomeRhythm: formData.get("incomeRhythm"),
      supportStyle: formData.get("supportStyle"),
    });
  } catch (err) {
    return stateFromError(err);
  }
  redirect("/");
}

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await requireUser();
  try {
    await updateBehavioralProfile(user.id, {
      primaryGoal: formData.get("primaryGoal"),
      typicalTrigger: formData.get("typicalTrigger"),
      cooldownHours: formData.get("cooldownHours"),
      incomeRhythm: formData.get("incomeRhythm"),
      supportStyle: formData.get("supportStyle"),
    });
    return { success: true };
  } catch (err) {
    return stateFromError(err);
  }
}
