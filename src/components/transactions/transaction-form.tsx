"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { createTransaction, updateTransaction } from "@/actions/transactions";
import { EmotionPicker } from "@/components/transactions/emotion-picker";
import type { Emotion } from "@/lib/emotions";
import { VULNERABILITY_LEVEL_COPY } from "@/lib/copy";
import type { VulnerabilityLevel } from "@/lib/vulnerability";
import { filterCategoriesByLaunchType } from "@/lib/budgeting";
import { transactionInputSchema } from "@/lib/validation";
import { fieldErrorsFromZod } from "@/lib/errors";
import { toLocalDatetimeValue } from "@/lib/datetime-local";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { fieldControlClass } from "@/components/ui/control";

interface AccountOption {
  id: string;
  name: string;
}

interface CategoryOption {
  id: string;
  name: string;
  icon?: string | null;
  group: string;
}

export interface TransactionFormInitial {
  id: string;
  type: "receita" | "despesa";
  amount: number;
  description: string;
  accountId: string;
  categoryId: string;
  occurredAt: string;
  essential: boolean;
  emotion: Emotion | null;
  note: string;
  noteUnavailable?: boolean;
}

export function TransactionForm({
  accounts,
  categories,
  initial,
}: {
  accounts: AccountOption[];
  categories: CategoryOption[];
  initial?: TransactionFormInitial;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<"despesa" | "receita">(initial?.type ?? "despesa");
  const [essential, setEssential] = useState(initial?.essential ?? true);
  const [emotion, setEmotion] = useState<Emotion | null>(initial?.emotion ?? null);
  const [note, setNote] = useState(initial?.note ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{
    isImpulse: boolean;
    nudge: string | null;
    level: VulnerabilityLevel;
  } | null>(null);

  const [nowLocal] = useState(() => toLocalDatetimeValue(new Date()));

  function handleSubmit(formData: FormData) {
    setFormError(null);
    setFieldErrors({});

    const payload = {
      accountId: String(formData.get("accountId") || ""),
      categoryId: String(formData.get("categoryId") || "") || undefined,
      type,
      amount: Number(formData.get("amount")),
      essential: type === "despesa" ? essential : true,
      description: String(formData.get("description") || "") || undefined,
      occurredAt: new Date(String(formData.get("occurredAt"))),
      emotion:
        type === "despesa" && emotion
          ? { emotion, note: note.trim() ? note.trim() : undefined }
          : undefined,
    };

    const parsed = transactionInputSchema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      setFormError(parsed.error.issues[0]?.message ?? "Revise os campos e tente de novo.");
      return;
    }

    startTransition(async () => {
      const result = initial
        ? await updateTransaction(initial.id, parsed.data)
        : await createTransaction(parsed.data);

      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setFormError(result.error);
        return;
      }

      setFeedback({
        isImpulse: result.isImpulse,
        nudge: result.nudge?.message ?? null,
        level: result.vulnerabilityLevel as VulnerabilityLevel,
      });
      setTimeout(() => router.push("/transacoes"), result.isImpulse || result.nudge ? 1800 : 0);
    });
  }

  const visibleCategories = filterCategoriesByLaunchType(categories, type);
  const defaultCategoryId =
    initial && type === initial.type
      ? initial.categoryId
      : type === "receita"
        ? (visibleCategories.find((category) => category.name === "Salário")?.id ?? "")
        : "";

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      <div className="flex rounded-xl border border-border p-1">
        {(["despesa", "receita"] as const).map((launchType) => (
          <button
            key={launchType}
            type="button"
            onClick={() => setType(launchType)}
            className={clsx(
              "flex-1 rounded-xl py-2 text-sm font-medium capitalize transition-colors duration-200",
              type === launchType ? "bg-primary text-white" : "text-foreground-muted",
            )}
          >
            {launchType}
          </button>
        ))}
      </div>

      <Field label="Valor" htmlFor="amount" error={fieldErrors.amount}>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          defaultValue={initial?.amount}
          placeholder="0,00"
          aria-invalid={Boolean(fieldErrors.amount)}
          aria-describedby={fieldErrors.amount ? "amount-error" : undefined}
          className={fieldControlClass(Boolean(fieldErrors.amount))}
        />
      </Field>

      <Field label="Descrição" htmlFor="description" error={fieldErrors.description}>
        <input
          id="description"
          name="description"
          type="text"
          maxLength={200}
          defaultValue={initial?.description}
          placeholder={type === "receita" ? "Ex: salário do mês" : "Ex: mercado da semana"}
          className={fieldControlClass(Boolean(fieldErrors.description))}
        />
      </Field>

      <Field label="Conta" htmlFor="accountId" error={fieldErrors.accountId}>
        <Select
          id="accountId"
          name="accountId"
          required
          defaultValue={initial?.accountId}
          invalid={Boolean(fieldErrors.accountId)}
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>
        <p className="mt-1.5 text-xs text-foreground-muted">
          <Link href="/configuracoes#contas" className="font-medium text-primary">
            Gerenciar contas
          </Link>
        </p>
      </Field>

      <Field
        label={`Categoria ${type === "receita" ? "(renda)" : "(gasto)"}`}
        htmlFor="categoryId"
        error={fieldErrors.categoryId}
        hint={
          type === "receita"
            ? "Só categorias de renda (salário, freelance…). Crie outras em Orçamentos, grupo Renda."
            : "Só categorias de gasto. Salário e outras entradas ficam em Receita."
        }
      >
        <Select
          key={type}
          id="categoryId"
          name="categoryId"
          defaultValue={defaultCategoryId}
          invalid={Boolean(fieldErrors.categoryId)}
        >
          <option value="">Sem categoria</option>
          {visibleCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Data e hora" htmlFor="occurredAt" error={fieldErrors.occurredAt}>
        <input
          id="occurredAt"
          name="occurredAt"
          type="datetime-local"
          required
          defaultValue={initial?.occurredAt ?? nowLocal}
          aria-invalid={Boolean(fieldErrors.occurredAt)}
          className={fieldControlClass(Boolean(fieldErrors.occurredAt))}
        />
      </Field>

      {type === "despesa" && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={essential} onChange={(e) => setEssential(e.target.checked)} />
          Despesa essencial (fixa)
        </label>
      )}

      {type === "despesa" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Como você estava se sentindo? (opcional)</p>
          <EmotionPicker value={emotion} onChange={setEmotion} />
          {initial?.noteUnavailable && (
            <p className="text-xs text-foreground-muted">
              Não foi possível ler o comentário privado anterior. Você pode escrever um novo.
            </p>
          )}
          {emotion && (
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Quer registrar mais alguma coisa sobre esse momento? (privado, só seu)"
              className={`${fieldControlClass()} text-sm`}
            />
          )}
        </div>
      )}

      {formError && Object.keys(fieldErrors).length === 0 && (
        <p className="text-sm text-critical" role="alert">
          {formError}
        </p>
      )}

      {feedback && (
        <div className="rounded-xl bg-calm-soft p-4 text-sm text-calm animate-[fadeIn_200ms_ease-out]">
          {feedback.isImpulse && (
            <p>Sinalizamos esse lançamento como possível compra por impulso — você pode revisar em Lançamentos.</p>
          )}
          {feedback.nudge && <p className="mt-1">{feedback.nudge}</p>}
          {!feedback.isImpulse && !feedback.nudge && <p>{VULNERABILITY_LEVEL_COPY[feedback.level]}</p>}
        </div>
      )}

      <Button type="submit" pending={isPending}>
        {isPending ? "Salvando..." : initial ? "Salvar alterações" : "Salvar lançamento"}
      </Button>
    </form>
  );
}
