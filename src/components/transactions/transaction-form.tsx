"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { createTransaction, updateTransaction } from "@/actions/transactions";
import { EmotionPicker } from "@/components/transactions/emotion-picker";
import type { Emotion } from "@/lib/emotions";
import { VULNERABILITY_LEVEL_COPY } from "@/lib/copy";
import type { VulnerabilityLevel } from "@/lib/vulnerability";
import { filterCategoriesByLaunchType } from "@/lib/budgeting";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { controlClass } from "@/components/ui/control";

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
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isImpulse: boolean; nudge: string | null; level: VulnerabilityLevel } | null>(
    null,
  );

  const [nowLocal] = useState(() =>
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
  );

  function handleSubmit(formData: FormData) {
    setError(null);
    const payload = {
      accountId: String(formData.get("accountId") || ""),
      categoryId: (formData.get("categoryId") as string) || undefined,
      type,
      amount: Number(formData.get("amount")),
      essential: type === "despesa" ? essential : true,
      description: (formData.get("description") as string) || undefined,
      occurredAt: new Date(String(formData.get("occurredAt"))),
      emotion:
        type === "despesa" && emotion
          ? { emotion, note: note.trim() ? note.trim() : undefined }
          : undefined,
    };

    startTransition(async () => {
      try {
        const result = initial
          ? await updateTransaction(initial.id, payload)
          : await createTransaction(payload);
        setFeedback({
          isImpulse: result.isImpulse,
          nudge: result.nudge?.message ?? null,
          level: result.vulnerabilityLevel as VulnerabilityLevel,
        });
        setTimeout(() => router.push("/transacoes"), result.isImpulse || result.nudge ? 1800 : 0);
      } catch {
        setError("Não foi possível salvar o lançamento. Confira os campos e tente novamente.");
      }
    });
  }

  const visibleCategories = filterCategoriesByLaunchType(categories, type);
  const defaultCategoryId =
    initial && type === initial.type
      ? initial.categoryId
      : type === "receita"
        ? (visibleCategories.find((c) => c.name === "Salário")?.id ?? "")
        : "";

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      <div className="flex rounded-xl border border-border p-1">
        {(["despesa", "receita"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={clsx(
              "flex-1 rounded-xl py-2 text-sm font-medium capitalize transition-colors",
              type === t ? "bg-primary text-white" : "text-foreground-muted",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        Valor
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          defaultValue={initial?.amount}
          placeholder="0,00"
          className={controlClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        Descrição
        <input
          name="description"
          type="text"
          maxLength={200}
          defaultValue={initial?.description}
          placeholder={type === "receita" ? "Ex: salário do mês" : "Ex: mercado da semana"}
          className={controlClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        Conta
        <Select name="accountId" required defaultValue={initial?.accountId}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        Categoria {type === "receita" ? "(renda)" : "(gasto)"}
        <Select key={type} name="categoryId" defaultValue={defaultCategoryId}>
          <option value="">Sem categoria</option>
          {visibleCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </Select>
        <span className="text-xs text-foreground-muted">
          {type === "receita"
            ? "Só categorias de renda (salário, freelance…). Crie outras em Orçamentos, grupo Renda."
            : "Só categorias de gasto. Salário e outras entradas ficam em Receita."}
        </span>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        Data e hora
        <input
          name="occurredAt"
          type="datetime-local"
          required
          defaultValue={initial?.occurredAt ?? nowLocal}
          className={controlClass}
        />
      </label>

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
          {emotion && (
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Quer registrar mais alguma coisa sobre esse momento? (privado, só seu)"
              className={`${controlClass} text-sm`}
            />
          )}
        </div>
      )}

      {error && <p className="text-sm text-critical">{error}</p>}

      {feedback && (
        <div className="rounded-xl bg-calm-soft p-4 text-sm text-calm">
          {feedback.isImpulse && (
            <p>Sinalizamos esse lançamento como possível compra por impulso — você pode revisar em Lançamentos.</p>
          )}
          {feedback.nudge && <p className="mt-1">{feedback.nudge}</p>}
          {!feedback.isImpulse && !feedback.nudge && <p>{VULNERABILITY_LEVEL_COPY[feedback.level]}</p>}
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : initial ? "Salvar alterações" : "Salvar lançamento"}
      </Button>
    </form>
  );
}
