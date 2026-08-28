import type { ReactNode } from "react";
import { clsx } from "clsx";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("min-w-0 overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={clsx("mb-4 text-sm font-semibold text-foreground-muted", className)}>{children}</h2>;
}
