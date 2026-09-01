import { Compass } from "lucide-react";
import { clsx } from "clsx";

export function BrandMark({ size = "md", className }: { size?: "sm" | "md"; className?: string }) {
  const compact = size === "sm";
  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <span
        className={clsx(
          "flex items-center justify-center rounded-2xl bg-primary text-white",
          compact ? "size-8" : "size-11",
        )}
        aria-hidden
      >
        <Compass size={compact ? 16 : 22} strokeWidth={2.2} />
      </span>
      <span className={clsx("font-semibold tracking-tight text-foreground", compact ? "text-sm" : "text-lg")}>
        Bússola
      </span>
    </div>
  );
}
