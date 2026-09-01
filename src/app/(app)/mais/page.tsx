import Link from "next/link";
import {
  Clock,
  HeartHandshake,
  GraduationCap,
  LifeBuoy,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { logoutAction } from "@/actions/auth";
import { PageHeader } from "@/components/ui/page-header";

const ITEMS = [
  { href: "/desejos", icon: Clock, title: "Desejos", desc: "Trava de 24 a 72h antes de comprar" },
  { href: "/correlacao", icon: HeartHandshake, title: "Emoções", desc: "O que você sente quando gasta" },
  { href: "/aprender", icon: GraduationCap, title: "Aprender", desc: "Cursos curtos da Bússola" },
  { href: "/panico", icon: LifeBuoy, title: "Pânico", desc: "Uma pausa agora, sem julgamento", warm: true },
  { href: "/configuracoes", icon: Settings, title: "Configurações", desc: "Conta, contas de dinheiro, seu jeito" },
] as const;

export default async function MorePage() {
  const user = await requireUser();
  const firstName = user.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Mais" subtitle={`${firstName}, o que você precisa agora?`} />

      <ul className="overflow-hidden rounded-3xl border border-border bg-surface">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href} className="border-b border-border last:border-b-0">
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-surface-muted"
              >
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
                    "warm" in item && item.warm ? "bg-warm-soft text-warm" : "bg-primary-soft text-primary"
                  }`}
                >
                  <Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="truncate text-sm text-foreground-muted">{item.desc}</p>
                </div>
                <ChevronRight size={18} className="shrink-0 text-foreground-muted" />
              </Link>
            </li>
          );
        })}
      </ul>

      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3.5 text-sm font-medium text-foreground-muted transition active:bg-surface-muted"
        >
          <LogOut size={16} />
          Sair da conta
        </button>
      </form>
    </div>
  );
}
