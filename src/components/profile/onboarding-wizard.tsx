"use client";

import { useActionState, useState } from "react";
import { completeOnboardingAction, skipOnboardingAction, type ProfileFormState } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { OptionCards } from "@/components/profile/option-cards";
import { ONBOARDING_CONSENT, ONBOARDING_STEPS } from "@/lib/profile/copy";
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

const STEP_OPTIONS = {
  primaryGoal: PRIMARY_GOALS.map((v) => ({ value: v, label: PRIMARY_GOAL_LABELS[v] })),
  typicalTrigger: PROFILE_TRIGGERS.map((v) => ({ value: v, label: PROFILE_TRIGGER_LABELS[v] })),
  cooldownHours: COOLDOWN_OPTIONS.map((v) => ({ value: String(v), label: `${v} horas` })),
  incomeRhythm: INCOME_RHYTHMS.map((v) => ({ value: v, label: INCOME_RHYTHM_LABELS[v] })),
  supportStyle: SUPPORT_STYLES.map((v) => ({ value: v, label: SUPPORT_STYLE_LABELS[v] })),
} as const;

const DEFAULTS = {
  primaryGoal: "entender_gastos",
  typicalTrigger: "nao_sei",
  cooldownHours: "48",
  incomeRhythm: "salario_mensal",
  supportStyle: "suave",
};

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(DEFAULTS);
  const [state, formAction, isPending] = useActionState(completeOnboardingAction, initialState);

  const current = ONBOARDING_STEPS[step];
  const field = current.field;
  const options = STEP_OPTIONS[field];
  const currentValue = answers[field];
  const isLast = step === ONBOARDING_STEPS.length - 1;

  function setAnswer(value: string) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }

  function goNext() {
    if (!isLast) setStep((s) => s + 1);
  }

  function goBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
          Passo {step + 1} de {ONBOARDING_STEPS.length}
        </p>
        <h1 className="mt-2 text-xl font-semibold text-primary">{current.title}</h1>
        <p className="mt-2 text-sm text-foreground-muted">{current.subtitle}</p>
        {step === 0 && <p className="mt-3 text-xs text-foreground-muted">{ONBOARDING_CONSENT}</p>}
      </div>

      <OptionCards name={field} options={[...options]} value={currentValue} onChange={setAnswer} />

      {state.error && !state.fieldErrors && (
        <p className="text-sm text-critical" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {isLast ? (
          <form action={formAction} className="flex flex-col gap-3">
            <input type="hidden" name="primaryGoal" value={answers.primaryGoal} />
            <input type="hidden" name="typicalTrigger" value={answers.typicalTrigger} />
            <input type="hidden" name="cooldownHours" value={answers.cooldownHours} />
            <input type="hidden" name="incomeRhythm" value={answers.incomeRhythm} />
            <input type="hidden" name="supportStyle" value={answers.supportStyle} />
            <Button type="submit" pending={isPending}>
              {isPending ? "Salvando..." : "Concluir"}
            </Button>
          </form>
        ) : (
          <Button type="button" onClick={goNext}>
            Continuar
          </Button>
        )}

        <div className="flex items-center justify-between gap-3">
          {step > 0 ? (
            <button type="button" onClick={goBack} className="text-sm font-medium text-foreground-muted">
              Voltar
            </button>
          ) : (
            <span />
          )}
          <form action={skipOnboardingAction}>
            <button type="submit" className="text-sm font-medium text-foreground-muted">
              Pular por agora
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
