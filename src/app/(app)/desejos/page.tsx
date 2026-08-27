import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Countdown } from "@/components/wishlist/countdown";
import { createWishlistItemFromForm, confirmWishlistItem, discardWishlistItem } from "@/actions/wishlist";
import { ReflectionQuestionButton } from "@/components/ai/reflection-question-button";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const user = await requireUser();
  const [items, categories, dbUser] = await Promise.all([
    prisma.wishlistItem.findMany({ where: { userId: user.id }, include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { aiAssistantEnabled: true } }),
  ]);

  const pending = items.filter((i) => i.status === "pendente");
  const resolved = items.filter((i) => i.status !== "pendente");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Trava de resfriamento</h1>
      <p className="text-sm text-foreground-muted">
        Antes de comprar algo por impulso, registre aqui e espere o prazo passar. Se ainda fizer sentido depois, é
        provavelmente uma necessidade real — não uma urgência do momento.
      </p>

      <Card>
        <CardTitle>Novo item de desejo</CardTitle>
        <form action={createWishlistItemFromForm} className="flex flex-col gap-3">
          <input
            name="name"
            required
            placeholder="O que você quer comprar?"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="Valor estimado"
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            />
            <select name="categoryId" className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm">
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            Tempo de espera
            <select
              name="cooldownHours"
              defaultValue={48}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            >
              <option value={24}>24 horas</option>
              <option value={48}>48 horas</option>
              <option value={72}>72 horas</option>
            </select>
          </label>
          <button type="submit" className="rounded-full bg-primary py-2.5 text-sm font-semibold text-white">
            Colocar em espera
          </button>
        </form>
      </Card>

      <div className="flex flex-col gap-2">
        {pending.length === 0 && (
          <Card>
            <p className="text-sm text-foreground-muted">Nenhum item aguardando no momento.</p>
          </Card>
        )}
        {pending.map((item) => {
          // Server Component: precisa do horário real da requisição para decidir se a espera já
          // terminou; não há como derivar isso de forma "pura" sem perder o propósito da tela.
          // eslint-disable-next-line react-hooks/purity
          const available = item.availableAt.getTime() <= Date.now();
          return (
            <Card key={item.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-foreground-muted">{formatCurrency(item.amount)}</p>
                </div>
                <Badge tone={available ? "primary" : "calm"}>
                  <Countdown availableAt={item.availableAt.toISOString()} />
                </Badge>
              </div>
              <div className="mt-3 flex gap-2">
                <form action={confirmWishlistItem.bind(null, item.id)}>
                  <button
                    type="submit"
                    disabled={!available}
                    className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
                  >
                    Confirmar necessidade real
                  </button>
                </form>
                <form action={discardWishlistItem.bind(null, item.id)}>
                  <button type="submit" className="rounded-full border border-border px-4 py-2 text-xs font-medium">
                    Deixar pra lá
                  </button>
                </form>
              </div>
              <ReflectionQuestionButton wishlistItemId={item.id} aiEnabled={dbUser.aiAssistantEnabled} />
            </Card>
          );
        })}
      </div>

      {resolved.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-foreground-muted">Histórico ({resolved.length})</summary>
          <div className="mt-2 flex flex-col gap-2">
            {resolved.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2">
                <span>{item.name}</span>
                <Badge tone={item.status === "confirmado" ? "primary" : "neutral"}>{item.status}</Badge>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
