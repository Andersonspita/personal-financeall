import { z } from "zod";
import { DAILY_MOOD_OPTIONS } from "@/lib/mood/constants";

export const dailyMoodInputSchema = z.object({
  mood: z.enum(DAILY_MOOD_OPTIONS, { error: "Escolha como você está" }),
  note: z.string().max(500, "Anotação muito longa").optional(),
});

export type DailyMoodInput = z.infer<typeof dailyMoodInputSchema>;
