import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { buttonClass, type ButtonVariant } from "@/components/ui/control";

export function Button({
  variant = "primary",
  className,
  pending = false,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; pending?: boolean }) {
  return (
    <button className={buttonClass(variant, className)} disabled={disabled || pending} {...props}>
      {pending && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
