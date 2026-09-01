import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { isAiConfigured } from "@/lib/ai/client";
import { Card, CardTitle } from "@/components/ui/card";
import { AiToggle } from "@/components/settings/ai-toggle";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { NewMoneyAccountForm } from "@/components/settings/money-account-forms";
import { MoneyAccountList } from "@/components/settings/money-account-list";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const authUser = await requireUser();
  const [user, accounts, profile] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: authUser.id } }),
    prisma.account.findMany({ where: { userId: authUser.id }, orderBy: [{ archived: "asc" }, { createdAt: "asc" }] }),
    prisma.behavioralProfile.findUnique({ where: { userId: authUser.id } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Configurações</h1>

      <Card>
        <CardTitle>Perfil</CardTitle>
        <p className="text-sm">{user.name}</p>
        <p className="text-sm text-foreground-muted">{user.email}</p>
        <p className="mt-2 text-xs text-foreground-muted">
          {user.googleId && user.passwordHash
            ? "Você entra com e-mail e senha ou com o Google."
            : user.googleId
              ? "Você entra com o Google. Em Esqueci a senha dá para criar uma senha também."
              : "Você entra com e-mail e senha."}
        </p>
      </Card>

      <ProfileSettingsForm profile={profile} />

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

      <Card id="contas">
        <CardTitle>Contas de dinheiro</CardTitle>
        <p className="mb-4 text-sm text-foreground-muted">
          São os destinos dos lançamentos (corrente, carteira, cartão…). Arquivar some da lista de novos
          lançamentos; o histórico permanece. O saldo inicial continua no Início.
        </p>
        <MoneyAccountList
          accounts={accounts.map((account) => ({
            id: account.id,
            name: account.name,
            type: account.type,
            initialBalance: account.initialBalance,
            archived: account.archived,
          }))}
        />
      </Card>

      <Card>
        <CardTitle>Nova conta</CardTitle>
        <NewMoneyAccountForm />
      </Card>
    </div>
  );
}
