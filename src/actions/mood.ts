"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { upsertDailyMood } from "@/lib/mood/service";
import { fieldErrorsFromZod, logAppError, type FormActionState } from "@/lib/errors";

export type MoodFormState = FormActionState;

function stateFromError(err: unknown): MoodFormState {
  if (err instanceof z.ZodError) {
    return {
      error: err.issues[0]?.message ?? "Revise os campos e tente de novo.",
      fieldErrors: fieldErrorsFromZod(err),
    };
  }
  logAppError("mood.form", err);
  return { error: "Algo deu errado. Tente novamente em instantes." };
}

export async function saveDailyMoodAction(_prevState: MoodFormState, formData: FormData): Promise<MoodFormState> {
  const user = await requireUser();
  try {
    await upsertDailyMood(user.id, {
      mood: formData.get("mood"),
      note: formData.get("note") || undefined,
    });
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return stateFromError(err);
  }
}
