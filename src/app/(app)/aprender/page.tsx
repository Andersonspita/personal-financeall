import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getContentLibrary, getRecommendedContent, type ContentListItem } from "@/lib/education/service";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { tagEmoji, tagLabel } from "@/lib/education/tags";

export const dynamic = "force-dynamic";

function ContentRow({ item }: { item: ContentListItem }) {
  return (
    <Link
      href={`/aprender/${item.slug}`}
      className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-muted"
    >
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <Badge tone="calm">
            {tagEmoji(item.tag)} {tagLabel(item.tag)}
          </Badge>
          {item.completedAt && (
            <span className="flex items-center gap-1 text-xs text-primary">
              <CheckCircle2 size={13} /> concluído
            </span>
          )}
        </div>
        <p className="font-medium">{item.title}</p>
        <p className="mt-0.5 text-sm text-foreground-muted">{item.summary}</p>
      </div>
      <span className="flex shrink-0 items-center gap-1 text-xs text-foreground-muted">
        <Clock size={13} /> {item.estimatedMinutes} min
      </span>
    </Link>
  );
}

export default async function EducationPage() {
  const user = await requireUser();
  const [library, recommended] = await Promise.all([
    getContentLibrary(user.id),
    getRecommendedContent(user.id),
  ]);

  const recommendedSlugs = new Set(recommended.map((r) => r.slug));
  const rest = library.filter((item) => !recommendedSlugs.has(item.slug));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Aprender</h1>
        <p className="text-sm text-foreground-muted">
          Dicas curtas sobre a relação entre emoções e dinheiro. Sem cobrança — no seu tempo.
        </p>
      </div>

      {recommended.length > 0 && (
        <Card>
          <CardTitle>Para você agora</CardTitle>
          <div className="flex flex-col gap-2">
            {recommended.map((item) => (
              <ContentRow key={item.id} item={item} />
            ))}
          </div>
        </Card>
      )}

      <Card>
        <CardTitle>Biblioteca completa</CardTitle>
        <div className="flex flex-col gap-2">
          {rest.map((item) => (
            <ContentRow key={item.id} item={item} />
          ))}
        </div>
      </Card>
    </div>
  );
}
