import type { ReactNode } from "react";
import { clsx } from "clsx";

export function PageHeader({
  title,
  subtitle,
  trailing,
  eyebrow,
  className,
}: {
  title: string;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  /** Pílula de contexto acima do título (ex.: "Espaço de acolhimento"). */
  eyebrow?: ReactNode;
  className?: string;
}) {
  return (
    <header className={clsx("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="text-2xl font-semibold leading-8 tracking-tight text-foreground md:text-[2rem] md:leading-10">
          {title}
        </h1>
        {subtitle ? <div className="mt-1.5 max-w-2xl text-base leading-6 text-foreground-muted">{subtitle}</div> : null}
      </div>
      {trailing ? <div className="shrink-0 pt-0.5">{trailing}</div> : null}
    </header>
  );
}
