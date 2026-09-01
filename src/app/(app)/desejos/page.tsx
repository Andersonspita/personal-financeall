import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { getDefaultCooldownHours } from "@/lib/profile/service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PendingWishCard } from "@/components/wishlist/pending-item-card";
import { WishlistItemForm } from "@/components/wishlist/wishlist-item-form";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const user = await requireUser();
  const [items, categories, dbUser, defaultCooldownHours] = await Promise.all([
    prisma.wishlistItem.findMany({ where: { userId: user.id }, include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ where: { userId: user.id, archived: false }, orderBy: { name: "asc" } }),
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { aiAssistantEnabled: true } }),
    getDefaultCooldownHours(user.id),
  ]);

  const pending = items.filter((item) => item.status === "pendente");
  const resolved = items.filter((item) => item.status !== "pendente");

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold">Trava de resfriamento</h1>
      <p className="text-sm text-foreground-muted">
        Antes de comprar algo por impulso, registre aqui e espere o prazo passar. Se ainda fizer sentido depois, é
        provavelmente uma necessidade real — não uma urgência do momento.
      </p>

      <WishlistItemForm
        defaultCooldownHours={defaultCooldownHours}
        categories={categories
          .filter((category) => category.group !== "renda")
          .map((category) => ({ id: category.id, name: category.name, icon: category.icon }))}
      />

      <div className="flex flex-col gap-2">
        {pending.length === 0 && (
          <Card>
            <p className="text-sm text-foreground-muted">Nenhum item aguardando no momento.</p>
          </Card>
        )}
        {pending.map((item) => (
          <PendingWishCard
            key={item.id}
            id={item.id}
            name={item.name}
            amount={item.amount}
            availableAt={item.availableAt.toISOString()}
            aiEnabled={dbUser.aiAssistantEnabled}
          />
        ))}
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
