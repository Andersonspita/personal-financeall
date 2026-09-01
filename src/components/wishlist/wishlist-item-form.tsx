"use client";

import { useActionState, useEffect, useRef } from "react";
import { createWishlistItemFromForm } from "@/actions/wishlist";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { fieldControlClass } from "@/components/ui/control";
import type { FormActionState } from "@/lib/errors";

const initialState: FormActionState = {};

type CategoryOption = { id: string; name: string; icon: string | null };

export function WishlistItemForm({
  categories,
  defaultCooldownHours = 48,
}: {
  categories: CategoryOption[];
  defaultCooldownHours?: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createWishlistItemFromForm, initialState);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <Card>
      <CardTitle>Novo item de desejo</CardTitle>
      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        <Field label="O que você quer comprar?" htmlFor="wish-name" error={state.fieldErrors?.name}>
          <input
            id="wish-name"
            name="name"
            required
            placeholder="O que você quer comprar?"
            aria-invalid={Boolean(state.fieldErrors?.name)}
            aria-describedby={state.fieldErrors?.name ? "wish-name-error" : undefined}
            className={fieldControlClass(Boolean(state.fieldErrors?.name))}
          />
        </Field>
        <Field label="Valor estimado" htmlFor="wish-amount" error={state.fieldErrors?.amount}>
          <input
            id="wish-amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0,00"
            aria-invalid={Boolean(state.fieldErrors?.amount)}
            className={fieldControlClass(Boolean(state.fieldErrors?.amount))}
          />
        </Field>
        <Field label="Categoria" htmlFor="wish-category">
          <Select id="wish-category" name="categoryId">
            <option value="">Sem categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tempo de espera" htmlFor="wish-cooldown" error={state.fieldErrors?.cooldownHours}>
          <Select id="wish-cooldown" name="cooldownHours" defaultValue={String(defaultCooldownHours)} invalid={Boolean(state.fieldErrors?.cooldownHours)}>
            <option value="24">24 horas</option>
            <option value="48">48 horas</option>
            <option value="72">72 horas</option>
          </Select>
        </Field>
        {state.error && !state.fieldErrors && <p className="text-sm text-critical" role="alert">{state.error}</p>}
        <Button type="submit" pending={isPending}>
          {isPending ? "Guardando..." : "Colocar em espera"}
        </Button>
      </form>
    </Card>
  );
}
