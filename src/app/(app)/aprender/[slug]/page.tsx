import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getContentBySlug } from "@/lib/education/service";
import { markContentViewed, markContentCompleted } from "@/actions/education";
import { Badge } from "@/components/ui/badge";
import { tagEmoji, tagLabel } from "@/lib/education/tags";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function EducationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser();
  const content = await getContentBySlug(user.id, slug);
  if (!content) notFound();

  await markContentViewed(content.id);

  const paragraphs = content.body.split("\n\n").filter(Boolean);
  const neighbors = content.course?.neighbors;
  const backHref = content.course ? `/aprender/cursos/${content.course.slug}` : "/aprender";
  const backLabel = content.course ? content.course.title : "Aprender";

  return (
    <div className="flex flex-col gap-4">
      <Link href={backHref} className="flex items-center gap-1 text-sm text-foreground-muted">
        <ArrowLeft size={16} /> {backLabel}
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="calm">
          {tagEmoji(content.tag)} {tagLabel(content.tag)}
        </Badge>
        <span className="flex items-center gap-1 text-xs text-foreground-muted">
          <Clock size={13} /> {content.estimatedMinutes} min de leitura
        </span>
        {neighbors && neighbors.index >= 0 && (
          <span className="text-xs text-foreground-muted">
            Aula {neighbors.index + 1} de {neighbors.total}
          </span>
        )}
      </div>

      <h1 className="text-xl font-semibold">{content.title}</h1>

      <div className="flex flex-col gap-3 text-sm leading-relaxed text-foreground">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <form action={markContentCompleted.bind(null, content.id)}>
        <Button type="submit" disabled={!!content.completedAt}>
          {content.completedAt ? "Concluída ✓" : "Marcar como concluída"}
        </Button>
      </form>

      {neighbors && (neighbors.prev || neighbors.next) && (
        <div className="flex items-stretch justify-between gap-3 border-t border-border pt-4">
          {neighbors.prev ? (
            <Link href={`/aprender/${neighbors.prev.slug}`} className="min-w-0 flex-1 text-sm text-foreground-muted">
              <span className="flex items-center gap-1 text-xs">
                <ArrowLeft size={14} /> Anterior
              </span>
              <span className="mt-0.5 block truncate font-medium text-foreground">{neighbors.prev.title}</span>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
          {neighbors.next ? (
            <Link href={`/aprender/${neighbors.next.slug}`} className="min-w-0 flex-1 text-right text-sm text-foreground-muted">
              <span className="flex items-center justify-end gap-1 text-xs">
                Próxima <ArrowRight size={14} />
              </span>
              <span className="mt-0.5 block truncate font-medium text-foreground">{neighbors.next.title}</span>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
        </div>
      )}
    </div>
  );
}
