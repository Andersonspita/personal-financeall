"use client";

import { useTransition } from "react";
import { dismissNudge } from "@/actions/nudges";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function NudgeBanner({ id, message }: { id: string; message: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Card className="bg-calm-soft">
      <CardTitle className="mb-2">Um recado para agora</CardTitle>
      <p className="text-sm">{message}</p>
      <Button
        type="button"
        variant="subtle"
        disabled={pending}
        onClick={() => startTransition(() => dismissNudge(id))}
        className="mt-4"
      >
        {pending ? "Ok..." : "Entendi"}
      </Button>
    </Card>
  );
}
