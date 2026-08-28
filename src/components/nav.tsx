"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, PiggyBank, Clock, HeartHandshake, LifeBuoy, LogOut, GraduationCap, Settings } from "lucide-react";
import { clsx } from "clsx";
import { logoutAction } from "@/actions/auth";

const ITEMS = [
  { href: "/", label: "Início", short: "Início", icon: LayoutDashboard },
  { href: "/transacoes", label: "Lançamentos", short: "Lançar", icon: Receipt },
  { href: "/orcamentos", label: "Orçamentos", icon: PiggyBank, short: "Tetos" },
  { href: "/desejos", label: "Desejos", short: "Desejos", icon: Clock },
  { href: "/correlacao", label: "Emoções", short: "Emoções", icon: HeartHandshake },
] as const;

export function Nav({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur md:hidden"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-stretch gap-1 px-2 pt-1.5">
          {ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-1.5 text-[10px] font-medium leading-tight",
                  active ? "text-primary" : "text-foreground-muted",
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                <span className="w-full truncate text-center">{item.short}</span>
              </Link>
            );
          })}
          <Link
            href="/panico"
            className={clsx(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-1.5 text-[10px] font-semibold leading-tight",
              pathname === "/panico" ? "text-critical" : "text-warm",
            )}
          >
            <LifeBuoy size={20} strokeWidth={2.2} />
            <span className="w-full truncate text-center">Pânico</span>
          </Link>
        </div>
      </nav>

      <nav
        aria-label="Navegação principal"
        className="fixed inset-y-0 left-0 hidden w-56 flex-col border-r border-border bg-surface p-4 md:flex"
      >
        <div className="mb-6 px-2 text-lg font-semibold text-primary">Bússola Financeira</div>
        <div className="flex flex-1 flex-col gap-1">
          {ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-primary-soft text-primary" : "text-foreground-muted hover:bg-surface-muted",
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/aprender"
            className={clsx(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              pathname.startsWith("/aprender") ? "bg-primary-soft text-primary" : "text-foreground-muted hover:bg-surface-muted",
            )}
          >
            <GraduationCap size={18} />
            Aprender
          </Link>
        </div>
        <Link
          href="/panico"
          className={clsx(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold",
            pathname === "/panico" ? "bg-critical-soft text-critical" : "text-warm hover:bg-warm-soft",
          )}
        >
          <LifeBuoy size={18} />
          Botão de Pânico
        </Link>

        <div className="mt-4 flex items-center justify-between border-t border-border px-1 pt-4">
          <span className="truncate text-sm text-foreground-muted">{userName}</span>
          <div className="flex items-center gap-1">
            <Link
              href="/configuracoes"
              title="Configurações"
              className={clsx(
                "rounded-xl p-1.5 hover:bg-surface-muted hover:text-foreground",
                pathname === "/configuracoes" ? "text-primary" : "text-foreground-muted",
              )}
            >
              <Settings size={16} />
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                title="Sair"
                className="rounded-xl p-1.5 text-foreground-muted hover:bg-surface-muted hover:text-foreground"
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
      </nav>
    </>
  );
}
