import { z } from "zod";
import {
  COOLDOWN_OPTIONS,
  INCOME_RHYTHMS,
  PRIMARY_GOALS,
  PROFILE_TRIGGERS,
  SUPPORT_STYLES,
} from "@/lib/profile/constants";

export const behavioralProfileInputSchema = z.object({
  primaryGoal: z.enum(PRIMARY_GOALS, { error: "Escolha um foco" }),
  typicalTrigger: z.enum(PROFILE_TRIGGERS, { error: "Escolha uma opção" }),
  cooldownHours: z.coerce
    .number()
    .int()
    .refine((v) => (COOLDOWN_OPTIONS as readonly number[]).includes(v), {
      message: "Escolha 24, 48 ou 72 horas",
    }),
  incomeRhythm: z.enum(INCOME_RHYTHMS, { error: "Escolha como entra o dinheiro" }),
  supportStyle: z.enum(SUPPORT_STYLES, { error: "Escolha como prefere ser apoiado(a)" }),
});

export type BehavioralProfileInput = z.infer<typeof behavioralProfileInputSchema>;
