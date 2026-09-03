import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getOnboardingStatus } from "@/lib/profile/service";

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const status = await getOnboardingStatus(user.id);
  if (status !== "pending") redirect("/");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <p className="mb-6 text-center text-sm text-foreground-muted">
        Olá, {user.name.split(" ")[0]} — vamos personalizar o seu Desafoga.
      </p>
      {children}
    </div>
  );
}
