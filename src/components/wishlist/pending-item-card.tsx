"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/wishlist/countdown";
import { confirmWishlistItem, discardWishlistItem } from "@/actions/wishlist";
import { ReflectionQuestionButton } from "@/components/ai/reflection-question-button";
import { formatCurrency } from "@/lib/format";

export function PendingWishCard({
  id,
  name,
  amount,
  availableAt,
  aiEnabled,
}: {
  id: string;
  name: string;
  amount: number;
  availableAt: string;
  aiEnabled: boolean;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const target = new Date(availableAt).getTime();
    function tick() {
      setReady(Date.now() >= target);
    }
    tick();
    const interval = setInterval(tick, 30_000);
    return () => clearInterval(interval);
  }, [availableAt]);

  return (
    <Card>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{name}</p>
          <p className="text-sm text-foreground-muted">{formatCurrency(amount)}</p>
        </div>
        <Badge tone={ready ? "primary" : "calm"}>
          <Countdown availableAt={availableAt} />
        </Badge>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <form action={confirmWishlistItem.bind(null, id)} className="w-full sm:w-auto">
          <Button type="submit" disabled={!ready} className="w-full sm:w-auto">
            Confirmar necessidade real
          </Button>
        </form>
        <form action={discardWishlistItem.bind(null, id)} className="w-full sm:w-auto">
          <Button type="submit" variant="secondary" className="w-full sm:w-auto">
            Deixar pra lá
          </Button>
        </form>
      </div>
      <ReflectionQuestionButton wishlistItemId={id} aiEnabled={aiEnabled} />
    </Card>
  );
}
