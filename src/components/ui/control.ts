import { clsx } from "clsx";

/** Campos de formulário: raio de 12px, borda slate e anel de foco sálvia (sem outline duro). */
export const controlClass =
  "w-full min-w-0 rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-foreground-muted/70 focus:border-accent focus:ring-[3px] focus:ring-accent/20";

export function fieldControlClass(invalid?: boolean) {
  return clsx(controlClass, invalid && "border-critical focus:border-critical focus:ring-critical/20");
}

export type ButtonVariant = "primary" | "secondary" | "subtle" | "warm";

export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return clsx(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-[color,background-color,box-shadow,transform,opacity] duration-200 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100",
    variant === "primary" && "bg-primary px-6 py-3 text-on-primary shadow-soft hover:bg-accent",
    variant === "secondary" && "border border-border bg-surface px-6 py-3 text-foreground hover:bg-surface-muted",
    // "Reflexão consciente": ações secundárias em lavagem sálvia, sem peso de alerta.
    variant === "subtle" && "border border-primary/15 bg-primary-soft px-4 py-2.5 text-primary hover:bg-primary-soft/70",
    variant === "warm" && "bg-warm px-6 py-3 text-on-warm shadow-soft hover:opacity-95",
    className,
  );
}

export const iconActionClass =
  "inline-flex h-10 w-11 shrink-0 items-center justify-center rounded-xl text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground";
