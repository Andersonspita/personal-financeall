import type { ReactNode } from "react";
import { clsx } from "clsx";

/** Pílulas de estado emocional/orçamento: pastel + texto escuro, nunca alarme. */
const TONES = {
  primary: "bg-primary-soft text-primary",
  warm: "bg-warm-soft text-warm",
  critical: "bg-critical-soft text-critical",
  calm: "bg-calm-soft text-calm",
  neutral: "bg-surface-muted text-foreground-muted",
} as const;

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium leading-4 tracking-[0.02em]",
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}
