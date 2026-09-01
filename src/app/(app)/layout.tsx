import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LifeBuoy } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getOnboardingStatus } from "@/lib/profile/service";
import { Nav } from "@/components/nav";
import { BrandMark } from "@/components/ui/brand-mark";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const onboardingStatus = await getOnboardingStatus(user.id);
  if (onboardingStatus === "pending") redirect("/onboarding");

  return (
    <>
      <Nav userName={user.name} />
      <header
        className="sticky top-0 z-30 flex items-center justify-between border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl md:hidden"
        style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))", paddingBottom: "0.5rem" }}
      >
        <BrandMark size="sm" />
        <Link
          href="/panico"
          className="flex size-10 items-center justify-center rounded-full bg-warm-soft text-warm transition active:scale-95"
          aria-label="Botão de pânico"
        >
          <LifeBuoy size={20} strokeWidth={2.2} />
        </Link>
      </header>
      <main className="min-h-screen pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-8 md:pl-60">
        <div className="mx-auto w-full min-w-0 max-w-2xl px-4 py-5 md:max-w-4xl md:px-8 md:py-7">{children}</div>
      </main>
    </>
  );
}
