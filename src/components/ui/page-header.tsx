import type { ReactNode } from "react";
import { clsx } from "clsx";

export function PageHeader({
  title,
  subtitle,
  trailing,
  className,
}: {
  title: string;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <header className={clsx("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h1 className="text-[1.7rem] font-semibold leading-tight tracking-tight text-foreground">{title}</h1>
        {subtitle ? <div className="mt-1 text-sm text-foreground-muted">{subtitle}</div> : null}
      </div>
      {trailing ? <div className="shrink-0 pt-0.5">{trailing}</div> : null}
    </header>
  );
}
