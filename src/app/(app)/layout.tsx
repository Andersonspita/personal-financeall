import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LifeBuoy, Sprout } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getOnboardingStatus } from "@/lib/profile/service";
import { Nav } from "@/components/nav";
import { BrandMark } from "@/components/ui/brand-mark";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const onboardingStatus = await getOnboardingStatus(user.id);
  if (onboardingStatus === "pending") redirect("/onboarding");

  return (
    <>
      <Nav userName={user.name} />

      {/* Cabeçalho mobile: marca + acesso imediato à pausa. */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl md:hidden"
        style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))", paddingBottom: "0.5rem" }}
      >
        <BrandMark size="sm" />
        <Link
          href="/panico"
          className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary transition active:scale-95"
          aria-label="Pausa consciente"
        >
          <LifeBuoy size={20} strokeWidth={2.2} />
        </Link>
      </header>

      <div className="md:pl-64">
        {/* Barra superior do desktop: lembrete acolhedor à esquerda, pausa e perfil à direita. */}
        <header className="sticky top-0 z-30 hidden border-b border-border/70 bg-surface shadow-soft md:block">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-8 py-3">
            <p className="flex min-w-0 items-center gap-2 text-sm text-foreground-muted">
              <Sprout size={16} className="shrink-0 text-primary" aria-hidden />
              <span className="truncate">O dinheiro serve à sua vida, não o contrário.</span>
            </p>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href="/panico"
                className="inline-flex items-center gap-2 rounded-xl border border-primary/15 bg-primary-soft px-4 py-2.5 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-primary hover:text-on-primary"
              >
                <LifeBuoy size={16} strokeWidth={2.2} />
                Pausa consciente
              </Link>
              <span className="h-6 w-px bg-border" aria-hidden />
              <Link
                href="/configuracoes"
                className="group flex items-center gap-2.5 rounded-xl px-1.5 py-1 transition-colors hover:bg-surface-muted"
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary"
                  aria-hidden
                >
                  {initials(user.name)}
                </span>
                <span className="hidden max-w-[10rem] text-left lg:block">
                  <span className="block truncate text-xs font-semibold text-foreground">{user.name}</span>
                  <span className="block text-[11px] tracking-[0.03em] text-foreground-muted">Jornada consciente</span>
                </span>
              </Link>
            </div>
          </div>
        </header>

        <main className="min-h-screen pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-10">
          <div className="mx-auto w-full min-w-0 max-w-2xl px-4 py-5 md:max-w-6xl md:px-8 md:py-8">{children}</div>
        </main>
      </div>
    </>
  );
}
