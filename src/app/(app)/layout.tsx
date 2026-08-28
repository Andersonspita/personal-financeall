import type { ReactNode } from "react";
import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { logoutAction } from "@/actions/auth";
import { Nav } from "@/components/nav";

// Camada autenticada do app: todo mundo aqui dentro já passou pelo middleware, mas chamamos
// requireUser() de novo para ter os dados do usuário (nome) disponíveis para a navegação —
// e como segunda camada de defesa caso este layout um dia seja usado fora do middleware atual.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <>
      <Nav userName={user.name} />
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
        <span className="text-sm font-medium text-foreground-muted">Olá, {user.name.split(" ")[0]}</span>
        <div className="flex items-center gap-3">
          <Link href="/configuracoes" className="flex items-center gap-1.5 text-xs font-medium text-foreground-muted">
            <Settings size={14} /> Config
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="flex items-center gap-1.5 text-xs font-medium text-foreground-muted">
              <LogOut size={14} /> Sair
            </button>
          </form>
        </div>
      </div>
      <main className="min-h-screen pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-8 md:pl-56">
        <div className="mx-auto w-full min-w-0 max-w-2xl px-4 py-6 md:max-w-4xl md:px-8">{children}</div>
      </main>
    </>
  );
}
