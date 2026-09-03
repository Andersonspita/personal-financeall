import { Sprout } from "lucide-react";
import { clsx } from "clsx";

export function BrandMark({
  size = "md",
  withTagline = false,
  className,
}: {
  size?: "sm" | "md";
  withTagline?: boolean;
  className?: string;
}) {
  const compact = size === "sm";
  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <span
        className={clsx(
          "flex shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary shadow-soft",
          compact ? "size-9" : "size-10",
        )}
        aria-hidden
      >
        <Sprout size={compact ? 18 : 22} strokeWidth={2.2} />
      </span>
      <div className="min-w-0">
        <p className={clsx("font-bold tracking-tight text-primary", compact ? "text-base" : "text-lg")}>
          Desafoga!
        </p>
        {withTagline ? (
          <p className="text-[11px] font-medium leading-4 tracking-[0.03em] text-foreground-muted">
            Finanças com autocompaixão
          </p>
        ) : null}
      </div>
    </div>
  );
}
