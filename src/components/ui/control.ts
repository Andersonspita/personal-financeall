import { clsx } from "clsx";

/** Campos de formulário: mesmo raio e fundo dos selects, para o app não misturar “quadrado” com “redondo”. */
export const controlClass =
  "w-full min-w-0 rounded-xl border border-border bg-surface-muted/55 px-3 py-2.5 text-base text-foreground outline-none transition-[border-color,box-shadow] duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20";

export function fieldControlClass(invalid?: boolean) {
  return clsx(controlClass, invalid && "border-critical focus:border-critical focus:ring-critical/20");
}

export type ButtonVariant = "primary" | "secondary" | "subtle" | "warm";

export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return clsx(
    "inline-flex items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition-[color,background-color,transform,opacity] duration-200 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100",
    variant === "primary" && "bg-primary px-4 py-2.5 text-white",
    variant === "secondary" && "border border-border bg-surface px-4 py-2.5 text-foreground",
    variant === "subtle" && "bg-primary-soft px-3 py-2 text-primary",
    variant === "warm" && "bg-warm px-4 py-2.5 text-white",
    className,
  );
}

export const iconActionClass =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-foreground-muted transition-colors hover:bg-border hover:text-foreground";
