import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { controlClass } from "@/components/ui/control";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative min-w-0 w-full">
      <select className={clsx(controlClass, "cursor-pointer appearance-none pr-10", className)} {...props}>
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
