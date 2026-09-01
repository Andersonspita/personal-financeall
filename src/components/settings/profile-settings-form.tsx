"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileFormState } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import {
  COOLDOWN_OPTIONS,
  INCOME_RHYTHMS,
  INCOME_RHYTHM_LABELS,
  PRIMARY_GOALS,
  PRIMARY_GOAL_LABELS,
  PROFILE_TRIGGERS,
  PROFILE_TRIGGER_LABELS,
  SUPPORT_STYLES,
  SUPPORT_STYLE_LABELS,
} from "@/lib/profile/constants";

const initialState: ProfileFormState = {};

type ProfileValues = {
  primaryGoal: string | null;
  typicalTrigger: string | null;
  cooldownHours: number | null;
  incomeRhythm: string | null;
  supportStyle: string | null;
};

const DEFAULTS = {
  primaryGoal: "entender_gastos",
  typicalTrigger: "nao_sei",
  cooldownHours: 48,
  incomeRhythm: "salario_mensal",
  supportStyle: "suave",
} as const;

export function ProfileSettingsForm({ profile }: { profile: ProfileValues | null }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);
  const values = {
    primaryGoal: profile?.primaryGoal ?? DEFAULTS.primaryGoal,
    typicalTrigger: profile?.typicalTrigger ?? DEFAULTS.typicalTrigger,
    cooldownHours: String(profile?.cooldownHours ?? DEFAULTS.cooldownHours),
    incomeRhythm: profile?.incomeRhythm ?? DEFAULTS.incomeRhythm,
    supportStyle: profile?.supportStyle ?? DEFAULTS.supportStyle,
  };

  return (
    <Card>
      <CardTitle>Seu jeito</CardTitle>
      <p className="mb-4 text-sm text-foreground-muted">
        O que você declarou no começo — ou pode ajustar quando quiser. Isso não vira nota de comportamento;
        só personaliza pausas, dicas e cursos.
      </p>

      <form action={formAction} className="flex flex-col gap-4">
        <Field label="Foco principal" htmlFor="profile-primaryGoal">
          <Select id="profile-primaryGoal" name="primaryGoal" defaultValue={values.primaryGoal}>
            {PRIMARY_GOALS.map((value) => (
              <option key={value} value={value}>
                {PRIMARY_GOAL_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Gatilho mais comum" htmlFor="profile-typicalTrigger">
          <Select
            id="profile-typicalTrigger"
            name="typicalTrigger"
            defaultValue={values.typicalTrigger}
          >
            {PROFILE_TRIGGERS.map((value) => (
              <option key={value} value={value}>
                {PROFILE_TRIGGER_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Pausa padrão na trava" htmlFor="profile-cooldownHours">
          <Select
            id="profile-cooldownHours"
            name="cooldownHours"
            defaultValue={values.cooldownHours}
          >
            {COOLDOWN_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value} horas
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Como entra o dinheiro" htmlFor="profile-incomeRhythm">
          <Select
            id="profile-incomeRhythm"
            name="incomeRhythm"
            defaultValue={values.incomeRhythm}
          >
            {INCOME_RHYTHMS.map((value) => (
              <option key={value} value={value}>
                {INCOME_RHYTHM_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Tom de apoio" htmlFor="profile-supportStyle">
          <Select
            id="profile-supportStyle"
            name="supportStyle"
            defaultValue={values.supportStyle}
          >
            {SUPPORT_STYLES.map((value) => (
              <option key={value} value={value}>
                {SUPPORT_STYLE_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>

        {state.error && !state.fieldErrors && (
          <p className="text-sm text-critical" role="alert">
            {state.error}
          </p>
        )}
        {state.success && <p className="text-sm text-primary">Perfil atualizado.</p>}

        <Button type="submit" pending={isPending}>
          {isPending ? "Salvando..." : "Salvar preferências"}
        </Button>
      </form>
    </Card>
  );
}
