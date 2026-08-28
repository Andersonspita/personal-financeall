import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { fieldControlClass } from "@/components/ui/control";

export function Select({
  className,
  invalid,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <div className="relative min-w-0 w-full">
      <select
        aria-invalid={invalid || undefined}
        className={clsx(fieldControlClass(invalid), "cursor-pointer appearance-none pr-10", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted"
      />
    </div>
  );
}
