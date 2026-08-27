"use client";

import { useState, useTransition } from "react";
import { updateAiAssistantSetting } from "@/actions/ai";

export function AiToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setEnabled(next);
    startTransition(async () => {
      await updateAiAssistantSetting(next);
    });
  }

  return (
    <label className="flex items-center justify-between gap-4">
      <span className="text-sm">
        <span className="font-medium">Assistente de IA</span>
        <span className="mt-0.5 block text-xs text-foreground-muted">
          Envia números agregados (score, contagens) ou o nome de um item de desejo à OpenAI para gerar
          explicações e perguntas de reflexão. Nunca envia notas emocionais em texto livre.
        </span>
      </span>
      <input
        type="checkbox"
        checked={enabled}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.checked)}
        className="h-5 w-9 shrink-0 accent-primary"
      />
    </label>
  );
}
