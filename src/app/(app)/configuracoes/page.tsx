import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { isAiConfigured } from "@/lib/ai/client";
import { Card, CardTitle } from "@/components/ui/card";
import { AiToggle } from "@/components/settings/ai-toggle";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const authUser = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: authUser.id } });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Configurações</h1>

      <Card>
        <CardTitle>Conta</CardTitle>
        <p className="text-sm">{user.name}</p>
        <p className="text-sm text-foreground-muted">{user.email}</p>
      </Card>

      <Card>
        <CardTitle>Assistente de IA</CardTitle>
        {isAiConfigured() ? (
          <AiToggle initialEnabled={user.aiAssistantEnabled} />
        ) : (
          <p className="text-sm text-foreground-muted">
            O assistente de IA ainda não foi configurado neste servidor (falta a chave de API).
          </p>
        )}
        <p className="mt-3 text-xs text-foreground-muted">
          Esse assistente é de apoio, não substitui acompanhamento profissional. Em momentos mais difíceis, o
          app sempre vai sugerir canais de apoio reais.
        </p>
      </Card>
    </div>
  );
}
