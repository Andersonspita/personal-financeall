"use client";

import { useState } from "react";
import { LifeBuoy } from "lucide-react";
import { startPanicSession, completePanicSession } from "@/actions/panic";
import { PANIC_ACTIVITIES } from "@/lib/copy";
import { Card } from "@/components/ui/card";

type Step = "start" | "choose" | "doing" | "done";

export function PanicFlow() {
  const [step, setStep] = useState<Step>("start");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);

  async function handleStart() {
    const session = await startPanicSession({});
    setSessionId(session.id);
    setStep("choose");
  }

  function handleChoose(id: string) {
    setActivityId(id);
    setStep("doing");
  }

  async function handleOutcome(outcome: "evitou_compra" | "comprou_mesmo") {
    if (sessionId) await completePanicSession(sessionId, outcome, activityId ?? undefined);
    setStep("done");
  }

  if (step === "start") {
    return (
      <Card className="flex flex-col items-center gap-4 text-center">
        <LifeBuoy size={40} className="text-warm" />
        <p className="text-lg font-medium">Sentindo vontade de comprar algo agora?</p>
        <p className="text-sm text-foreground-muted">
          Vamos dar um tempinho antes de decidir. Não tem problema estar aqui — é exatamente para isso que esse botão
          existe.
        </p>
        <button onClick={handleStart} className="rounded-full bg-warm px-6 py-3 text-sm font-semibold text-white">
          Me ajuda a pausar
        </button>
      </Card>
    );
  }

  if (step === "choose") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-foreground-muted">Escolha algo rápido para fazer agora:</p>
        {PANIC_ACTIVITIES.map((a) => (
          <button
            key={a.id}
            onClick={() => handleChoose(a.id)}
            className="rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-muted"
          >
            <p className="font-medium">{a.title}</p>
            <p className="text-sm text-foreground-muted">{a.description}</p>
          </button>
        ))}
      </div>
    );
  }

  if (step === "doing") {
    const activity = PANIC_ACTIVITIES.find((a) => a.id === activityId);
    return (
      <Card className="flex flex-col items-center gap-4 text-center">
        <p className="text-lg font-medium">{activity?.title}</p>
        <p className="text-sm text-foreground-muted">{activity?.description}</p>
        <p className="text-sm text-foreground-muted">Sem pressa. Quando terminar, volte aqui.</p>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <button
            onClick={() => handleOutcome("evitou_compra")}
            className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white sm:w-auto"
          >
            Consegui esperar
          </button>
          <button
            onClick={() => handleOutcome("comprou_mesmo")}
            className="w-full rounded-full border border-border px-4 py-2.5 text-sm font-medium sm:w-auto"
          >
            Comprei mesmo assim
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col items-center gap-3 text-center">
      <p className="text-lg font-medium">Obrigado por passar por aqui.</p>
      <p className="text-sm text-foreground-muted">
        Não importa qual foi o resultado — o simples fato de ter parado para pensar já é um cuidado com você mesmo(a).
      </p>
      <button
        onClick={() => {
          setStep("start");
          setSessionId(null);
          setActivityId(null);
        }}
        className="text-sm font-medium text-primary underline underline-offset-2"
      >
        Voltar ao início
      </button>
    </Card>
  );
}
