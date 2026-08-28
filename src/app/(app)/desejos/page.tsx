import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Countdown } from "@/components/wishlist/countdown";
import { createWishlistItemFromForm, confirmWishlistItem, discardWishlistItem } from "@/actions/wishlist";
import { ReflectionQuestionButton } from "@/components/ai/reflection-question-button";
import { formatCurrency } from "@/lib/format";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { controlClass } from "@/components/ui/control";

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
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold">Trava de resfriamento</h1>
      <p className="text-sm text-foreground-muted">
        Antes de comprar algo por impulso, registre aqui e espere o prazo passar. Se ainda fizer sentido depois, é
        provavelmente uma necessidade real — não uma urgência do momento.
      </p>

      <Card>
        <CardTitle>Novo item de desejo</CardTitle>
        <form action={createWishlistItemFromForm} className="flex flex-col gap-4">
          <input
            name="name"
            required
            placeholder="O que você quer comprar?"
            className={controlClass}
          />
          <label className="flex min-w-0 flex-col gap-1.5 text-sm">
            Valor estimado
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0,00"
              className={controlClass}
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-sm">
            Categoria
            <Select name="categoryId">
              <option value="">Sem categoria</option>
              {categories
                .filter((c) => c.group !== "renda")
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
            </Select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Tempo de espera
            <Select name="cooldownHours" defaultValue="48">
              <option value="24">24 horas</option>
              <option value="48">48 horas</option>
              <option value="72">72 horas</option>
            </Select>
          </label>
          <Button type="submit">Colocar em espera</Button>
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
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="text-sm text-foreground-muted">{formatCurrency(item.amount)}</p>
                </div>
                <Badge tone={available ? "primary" : "calm"}>
                  <Countdown availableAt={item.availableAt.toISOString()} />
                </Badge>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <form action={confirmWishlistItem.bind(null, item.id)} className="w-full sm:w-auto">
                  <Button type="submit" disabled={!available} className="w-full sm:w-auto">
                    Confirmar necessidade real
                  </Button>
                </form>
                <form action={discardWishlistItem.bind(null, item.id)} className="w-full sm:w-auto">
                  <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                    Deixar pra lá
                  </Button>
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
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2">
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
