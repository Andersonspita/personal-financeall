import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getContentBySlug } from "@/lib/education/service";
import { markContentViewed, markContentCompleted } from "@/actions/education";
import { Badge } from "@/components/ui/badge";
import { tagEmoji, tagLabel } from "@/lib/education/tags";

export const dynamic = "force-dynamic";

export default async function EducationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser();
  const content = await getContentBySlug(user.id, slug);
  if (!content) notFound();

  await markContentViewed(content.id);

  const paragraphs = content.body.split("\n\n").filter(Boolean);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/aprender" className="flex items-center gap-1 text-sm text-foreground-muted">
        <ArrowLeft size={16} /> Voltar
      </Link>

      <div className="flex items-center gap-2">
        <Badge tone="calm">
          {tagEmoji(content.tag)} {tagLabel(content.tag)}
        </Badge>
        <span className="flex items-center gap-1 text-xs text-foreground-muted">
          <Clock size={13} /> {content.estimatedMinutes} min de leitura
        </span>
      </div>

      <h1 className="text-xl font-semibold">{content.title}</h1>

      <div className="flex flex-col gap-3 text-sm leading-relaxed text-foreground">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <form action={markContentCompleted.bind(null, content.id)}>
        <button
          type="submit"
          disabled={!!content.completedAt}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {content.completedAt ? "Concluído ✓" : "Marcar como concluído"}
        </button>
      </form>
    </div>
  );
}
