"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { getAiReflectionQuestion } from "@/actions/ai";

export function ReflectionQuestionButton({ wishlistItemId, aiEnabled }: { wishlistItemId: string; aiEnabled: boolean }) {
  const [question, setQuestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!aiEnabled) return null;

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const text = await getAiReflectionQuestion(wishlistItemId);
        setQuestion(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível gerar a pergunta agora.");
      }
    });
  }

  return (
    <div className="mt-2">
      {!question && (
        <button
          onClick={handleClick}
          disabled={isPending}
          className="flex items-center gap-1.5 text-xs font-medium text-primary disabled:opacity-60"
        >
          <Sparkles size={13} /> {isPending ? "Pensando..." : "Pedir uma pergunta de reflexão"}
        </button>
      )}
      {question && <p className="rounded-lg bg-calm-soft p-2.5 text-sm italic text-calm">{question}</p>}
      {error && <p className="text-xs text-foreground-muted">{error}</p>}
    </div>
  );
}
