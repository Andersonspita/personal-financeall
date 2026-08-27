"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { createTransaction } from "@/actions/transactions";
import { EmotionPicker } from "@/components/transactions/emotion-picker";
import type { Emotion } from "@/lib/emotions";
import { VULNERABILITY_LEVEL_COPY } from "@/lib/copy";
import type { VulnerabilityLevel } from "@/lib/vulnerability";

interface Option {
  id: string;
  name: string;
  icon?: string | null;
}

export function TransactionForm({ accounts, categories }: { accounts: Option[]; categories: Option[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<"despesa" | "receita">("despesa");
  const [essential, setEssential] = useState(true);
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isImpulse: boolean; nudge: string | null; level: VulnerabilityLevel } | null>(
    null,
  );

  function handleSubmit(formData: FormData) {
    setError(null);
    const payload = {
      accountId: String(formData.get("accountId") || ""),
      categoryId: (formData.get("categoryId") as string) || undefined,
      type,
      amount: Number(formData.get("amount")),
      essential,
      description: (formData.get("description") as string) || undefined,
      occurredAt: new Date(String(formData.get("occurredAt"))),
      emotion:
        type === "despesa" && emotion
          ? { emotion, note: note.trim() ? note.trim() : undefined }
          : undefined,
    };

    startTransition(async () => {
      try {
        const result = await createTransaction(payload);
        setFeedback({ isImpulse: result.isImpulse, nudge: result.nudge?.message ?? null, level: result.vulnerabilityLevel as VulnerabilityLevel });
        setTimeout(() => router.push("/transacoes"), result.isImpulse || result.nudge ? 1800 : 0);
      } catch {
        setError("Não foi possível salvar o lançamento. Confira os campos e tente novamente.");
      }
    });
  }

  const [nowLocal] = useState(() =>
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
  );

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex rounded-xl border border-border p-1">
        {(["despesa", "receita"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={clsx(
              "flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-colors",
              type === t ? "bg-primary text-white" : "text-foreground-muted",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Valor
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          placeholder="0,00"
          className="rounded-lg border border-border bg-surface px-3 py-2.5 text-base"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Descrição
        <input
          name="description"
          type="text"
          maxLength={200}
          placeholder="Ex: mercado da semana"
          className="rounded-lg border border-border bg-surface px-3 py-2.5 text-base"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Conta
        <select name="accountId" required className="rounded-lg border border-border bg-surface px-3 py-2.5 text-base">
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Categoria
        <select name="categoryId" className="rounded-lg border border-border bg-surface px-3 py-2.5 text-base">
          <option value="">Sem categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Data e hora
        <input
          name="occurredAt"
          type="datetime-local"
          required
          defaultValue={nowLocal}
          className="rounded-lg border border-border bg-surface px-3 py-2.5 text-base"
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
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            />
          )}
        </div>
      )}

      {error && <p className="text-sm text-critical">{error}</p>}

      {feedback && (
        <div className="rounded-lg bg-calm-soft p-3 text-sm text-calm">
          {feedback.isImpulse && (
            <p>Sinalizamos esse lançamento como possível compra por impulso — você pode revisar em Lançamentos.</p>
          )}
          {feedback.nudge && <p className="mt-1">{feedback.nudge}</p>}
          {!feedback.isImpulse && !feedback.nudge && <p>{VULNERABILITY_LEVEL_COPY[feedback.level]}</p>}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Salvar lançamento"}
      </button>
    </form>
  );
}
