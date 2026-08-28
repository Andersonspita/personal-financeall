"use client";

import { useTransition } from "react";
import { dismissNudge } from "@/actions/nudges";
import { Card, CardTitle } from "@/components/ui/card";

export function NudgeBanner({ id, message }: { id: string; message: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Card className="bg-calm-soft">
      <CardTitle className="mb-2">Um recado para agora</CardTitle>
      <p className="text-sm">{message}</p>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => dismissNudge(id))}
        className="mt-3 text-xs font-medium text-primary underline underline-offset-2 disabled:opacity-60"
      >
        {pending ? "Ok..." : "Entendi"}
      </button>
    </Card>
  );
}
