"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, PiggyBank, Clock, HeartHandshake, LifeBuoy, LogOut, GraduationCap, Settings } from "lucide-react";
import { clsx } from "clsx";
import { logoutAction } from "@/actions/auth";

const ITEMS = [
  { href: "/", label: "Início", icon: LayoutDashboard },
  { href: "/transacoes", label: "Lançamentos", icon: Receipt },
  { href: "/orcamentos", label: "Orçamentos", icon: PiggyBank },
  { href: "/desejos", label: "Desejos", icon: Clock },
  { href: "/correlacao", label: "Emoções", icon: HeartHandshake },
] as const;

export function Nav({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur md:hidden"
      >
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium",
                active ? "text-primary" : "text-foreground-muted",
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/panico"
          className={clsx(
            "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-semibold",
            pathname === "/panico" ? "text-critical" : "text-warm",
          )}
        >
          <LifeBuoy size={20} strokeWidth={2.2} />
          Pânico
        </Link>
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
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
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
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
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
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold",
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
                "rounded-lg p-1.5 hover:bg-surface-muted hover:text-foreground",
                pathname === "/configuracoes" ? "text-primary" : "text-foreground-muted",
              )}
            >
              <Settings size={16} />
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                title="Sair"
                className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-muted hover:text-foreground"
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
