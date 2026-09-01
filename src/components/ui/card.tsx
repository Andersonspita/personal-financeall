import type { ReactNode } from "react";
import { clsx } from "clsx";

export function Card({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <div
      id={id}
      className={clsx(
        "min-w-0 overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(41,37,36,0.05)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={clsx("mb-3 text-[13px] font-semibold uppercase tracking-wide text-foreground-muted", className)}>{children}</h2>;
}
