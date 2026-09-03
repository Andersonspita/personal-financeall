import type { ReactNode } from "react";
import { BrandMark } from "@/components/ui/brand-mark";

export function AuthShell({ children, subtitle }: { children: ReactNode; subtitle: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <BrandMark withTagline />
        <p className="max-w-xs text-sm text-foreground-muted">{subtitle}</p>
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-border/80 bg-surface p-6 shadow-lifted">
        {children}
      </div>
    </div>
  );
}
