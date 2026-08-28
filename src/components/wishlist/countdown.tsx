"use client";

import { useEffect, useState } from "react";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "Disponível agora";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `Disponível em ${hours}h ${minutes}min`;
  return `Disponível em ${minutes}min`;
}

export function Countdown({ availableAt }: { availableAt: string }) {
  const target = new Date(availableAt).getTime();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    function tick() {
      setRemaining(target - Date.now());
    }
    tick();
    const interval = setInterval(tick, 30_000);
    return () => clearInterval(interval);
  }, [target]);

  if (remaining === null) {
    return <span>Aguardando…</span>;
  }

  return <span>{formatRemaining(remaining)}</span>;
}
