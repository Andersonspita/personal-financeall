"use client";

import { useActionState } from "react";
import { saveDailyMoodAction, type MoodFormState } from "@/actions/mood";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { fieldControlClass } from "@/components/ui/control";
import { DAILY_MOOD_EMOJI, DAILY_MOOD_LABELS, DAILY_MOOD_OPTIONS, type DailyMood } from "@/lib/mood/constants";

const initialState: MoodFormState = {};

export function DailyMoodCheckIn({
  initialMood,
  disabled,
}: {
  initialMood: DailyMood | null;
  disabled?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(saveDailyMoodAction, initialState);

  if (disabled) {
    return (
      <Card>
        <CardTitle>Como você acordou</CardTitle>
        <p className="text-sm text-foreground-muted">
          O check-in diário vale para o mês atual. Selecione o mês atual para registrar como está hoje.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>Como você acordou hoje?</CardTitle>
      <p className="mb-4 text-sm text-foreground-muted">
        Um minuto para registrar o humor — separado dos lançamentos. Você pode mudar ao longo do dia.
      </p>
      <form action={formAction} className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {DAILY_MOOD_OPTIONS.map((mood) => (
            <label
              key={mood}
              className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-border px-2 py-3 text-center has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="radio"
                name="mood"
                value={mood}
                defaultChecked={initialMood === mood}
                required
                className="sr-only"
              />
              <span className="text-xl" aria-hidden>
                {DAILY_MOOD_EMOJI[mood]}
              </span>
              <span className="text-[11px] leading-tight">{DAILY_MOOD_LABELS[mood]}</span>
            </label>
          ))}
        </div>

        <Field label="Anotação privada (opcional)" htmlFor="mood-note" error={state.fieldErrors?.note}>
          <textarea
            id="mood-note"
            name="note"
            rows={2}
            placeholder="O que está ocupando sua cabeça?"
            className={fieldControlClass(Boolean(state.fieldErrors?.note))}
          />
        </Field>

        {state.error && !state.fieldErrors && (
          <p className="text-sm text-critical" role="alert">
            {state.error}
          </p>
        )}
        {state.success && <p className="text-sm text-primary">Registrado para hoje. Obrigado por pausar um instante.</p>}

        <Button type="submit" pending={isPending}>
          {isPending ? "Salvando..." : initialMood ? "Atualizar de hoje" : "Registrar de hoje"}
        </Button>
      </form>
    </Card>
  );
}
