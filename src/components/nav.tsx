"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Receipt,
  PiggyBank,
  Clock,
  HeartHandshake,
  LogOut,
  GraduationCap,
  Settings,
  Plus,
  LayoutGrid,
  Sprout,
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
  { href: "/desejos", label: "Trava de Resfriamento", icon: Clock },
  { href: "/correlacao", label: "Emoção × Gasto", icon: HeartHandshake },
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
        "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 text-[11px] font-medium leading-tight tracking-[0.02em]",
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

/** Item da navegação lateral: cápsula sálvia quando ativo, hover tonal quando não. */
function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
  dot,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
  dot?: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium tracking-[0.01em] transition-colors duration-200",
        active
          ? "bg-primary-soft font-semibold text-primary"
          : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
      )}
    >
      <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
      <span className="min-w-0 truncate">{label}</span>
      {dot ? <span className="ml-auto size-2 shrink-0 rounded-full bg-accent" aria-hidden /> : null}
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
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-surface/90 shadow-[0_-8px_24px_rgba(30,41,59,0.05)] backdrop-blur-xl md:hidden"
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
              className="absolute left-1/2 top-0 z-10 flex size-[3.35rem] -translate-x-1/2 -translate-y-[1.15rem] items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_8px_20px_rgba(45,106,79,0.35)] transition active:scale-95"
              aria-label="Novo lançamento"
            >
              <Plus size={26} strokeWidth={2.4} />
            </Link>
          ) : null}
        </div>
      </nav>

      <nav
        aria-label="Navegação principal"
        className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col justify-between border-r border-border/70 bg-surface p-4 md:flex"
      >
        <div className="flex min-h-0 flex-col gap-4">
          <BrandMark withTagline className="px-2 py-1" />

          <Link
            href="/transacoes/novo"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold tracking-[0.01em] text-on-primary shadow-soft transition-colors duration-200 hover:bg-accent active:scale-[0.98]"
          >
            <Plus size={18} /> Novo lançamento
          </Link>

          <div className="flex flex-col gap-1.5 overflow-y-auto">
            {SIDEBAR_ITEMS.map((item) => (
              <SidebarLink key={item.href} {...item} active={isActive(pathname, item.href)} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/70 pt-4">
          {/* Lembrete de rodapé: reforça o tom não-julgador do produto a cada tela. */}
          <div className="flex items-start gap-2.5 rounded-xl bg-primary-soft/60 p-3">
            <Sprout size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
            <p className="text-[11px] font-medium leading-4 tracking-[0.02em] text-foreground-muted">
              Cada gasto tem sua história. Acolha suas escolhas.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <SidebarLink
              href="/configuracoes"
              label="Configurações"
              icon={Settings}
              active={pathname === "/configuracoes"}
            />
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium tracking-[0.01em] text-foreground-muted transition-colors duration-200 hover:bg-surface-muted hover:text-foreground"
              >
                <LogOut size={18} strokeWidth={1.8} />
                Encerrar sessão
              </button>
            </form>
          </div>

          <p className="truncate px-4 text-[11px] tracking-[0.02em] text-foreground-muted/80" title={userName}>
            {userName}
          </p>
        </div>
      </nav>
    </>
  );
}
