"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Receipt,
  PiggyBank,
  Clock,
  HeartHandshake,
  LifeBuoy,
  LogOut,
  GraduationCap,
  Settings,
  Plus,
  LayoutGrid,
} from "lucide-react";
import { clsx } from "clsx";
import { logoutAction } from "@/actions/auth";
import { BrandMark } from "@/components/ui/brand-mark";

const TABS_LEFT = [
  { href: "/", label: "Início", icon: Home },
  { href: "/transacoes", label: "Lançar", icon: Receipt },
] as const;

const TABS_RIGHT = [
  { href: "/orcamentos", label: "Tetos", icon: PiggyBank },
  { href: "/mais", label: "Mais", icon: LayoutGrid },
] as const;

const SIDEBAR_ITEMS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/transacoes", label: "Lançamentos", icon: Receipt },
  { href: "/orcamentos", label: "Orçamentos", icon: PiggyBank },
  { href: "/desejos", label: "Desejos", icon: Clock },
  { href: "/correlacao", label: "Emoções", icon: HeartHandshake },
  { href: "/aprender", label: "Aprender", icon: GraduationCap },
] as const;

const MORE_PREFIXES = ["/mais", "/desejos", "/correlacao", "/aprender", "/configuracoes", "/panico"];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/mais") return MORE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return pathname === href || pathname.startsWith(`${href}/`);
}

function hideFab(pathname: string) {
  return (
    pathname === "/transacoes/novo" ||
    pathname.includes("/editar") ||
    pathname === "/panico"
  );
}

function TabLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 text-[11px] font-medium leading-tight",
        active ? "text-primary" : "text-foreground-muted",
      )}
    >
      <span
        className={clsx(
          "flex size-8 items-center justify-center rounded-full transition-colors",
          active && "bg-primary-soft",
        )}
      >
        <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
      </span>
      <span className="w-full truncate text-center">{label}</span>
    </Link>
  );
}

export function Nav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const showFab = !hideFab(pathname);

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-surface/90 shadow-[0_-8px_24px_rgba(41,37,36,0.06)] backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "max(0.55rem, env(safe-area-inset-bottom))" }}
      >
        <div className="relative flex items-end px-1 pt-1">
          {TABS_LEFT.map((item) => (
            <TabLink key={item.href} {...item} active={isActive(pathname, item.href)} />
          ))}
          <div className="w-16 shrink-0" aria-hidden />
          {TABS_RIGHT.map((item) => (
            <TabLink key={item.href} {...item} active={isActive(pathname, item.href)} />
          ))}
          {showFab ? (
            <Link
              href="/transacoes/novo"
              className="absolute left-1/2 top-0 z-10 flex size-[3.35rem] -translate-x-1/2 -translate-y-[1.15rem] items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_20px_rgba(63,111,94,0.38)] transition active:scale-95"
              aria-label="Novo lançamento"
            >
              <Plus size={26} strokeWidth={2.4} />
            </Link>
          ) : null}
        </div>
      </nav>

      <nav
        aria-label="Navegação principal"
        className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-surface p-4 md:flex"
      >
        <BrandMark className="mb-5 px-1" />
        <Link
          href="/transacoes/novo"
          className="mb-4 flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98]"
        >
          <Plus size={18} /> Novo lançamento
        </Link>
        <div className="flex flex-1 flex-col gap-0.5">
          {SIDEBAR_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-primary-soft text-primary" : "text-foreground-muted hover:bg-surface-muted",
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
        <Link
          href="/panico"
          className={clsx(
            "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold",
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
                "rounded-xl p-2 hover:bg-surface-muted hover:text-foreground",
                pathname === "/configuracoes" ? "text-primary" : "text-foreground-muted",
              )}
            >
              <Settings size={16} />
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                title="Sair"
                className="rounded-xl p-2 text-foreground-muted hover:bg-surface-muted hover:text-foreground"
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
