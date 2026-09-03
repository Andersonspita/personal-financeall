import type { ReactNode } from "react";
import { clsx } from "clsx";

/**
 * Nível 1 de elevação do design system: superfície branca sobre o canvas, raio de 16px
 * e sombra ambiente (slate + musgo). `interactive` sobe para o nível 2 no hover.
 */
export function Card({
  children,
  className,
  id,
  interactive = false,
  tone = "plain",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  interactive?: boolean;
  tone?: "plain" | "sage";
}) {
  return (
    <div
      id={id}
      className={clsx(
        "min-w-0 overflow-hidden rounded-2xl border border-border/80 p-5 shadow-soft",
        tone === "sage" ? "bg-gradient-to-br from-surface to-primary-soft/40" : "bg-surface",
        interactive &&
          "transition-[box-shadow,transform] duration-[250ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-lifted",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={clsx("mb-3 text-lg font-semibold leading-7 tracking-tight text-foreground", className)}>
      {children}
    </h2>
  );
}

/** Linha de apoio logo abaixo do título do card — tom explicativo, nunca punitivo. */
export function CardSubtitle({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={clsx("-mt-2 mb-3 text-sm text-foreground-muted", className)}>{children}</p>;
}
