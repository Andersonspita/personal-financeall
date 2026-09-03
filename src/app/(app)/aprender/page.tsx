import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getCourses, getRecommendedContent, type ContentListItem } from "@/lib/education/service";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { tagEmoji, tagLabel } from "@/lib/education/tags";

export const dynamic = "force-dynamic";

function LessonRow({ item }: { item: ContentListItem }) {
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
              <CheckCircle2 size={13} /> concluída
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
  const [courses, recommended] = await Promise.all([getCourses(user.id), getRecommendedContent(user.id)]);

  return (
    <div className="mx-auto w-full max-w-4xl flex flex-col gap-4">
      <PageHeader
        title="Aprender"
        subtitle="Cursos curtos sobre emoção e dinheiro, com vídeo-aula do Desafoga. Sem prova, sem prazo — no seu tempo."
      />

      {recommended.length > 0 && (
        <Card>
          <CardTitle>Para você agora</CardTitle>
          <div className="flex flex-col gap-2">
            {recommended.map((item) => (
              <LessonRow key={item.id} item={item} />
            ))}
          </div>
        </Card>
      )}

      <Card>
        <CardTitle>Cursos</CardTitle>
        <div className="flex flex-col gap-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/aprender/cursos/${course.slug}`}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-muted"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1">
                    <Badge tone="calm">
                      {tagEmoji(course.tag)} {tagLabel(course.tag)}
                    </Badge>
                  </div>
                  <p className="font-medium">{course.title}</p>
                  <p className="mt-0.5 text-sm text-foreground-muted">{course.summary}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-xs text-foreground-muted">
                  <Clock size={13} /> {course.estimatedMinutes} min
                </span>
              </div>
              <ProgressBar ratio={course.progressRatio} tone="dentro_do_limite" />
              <p className="text-xs text-foreground-muted">
                {course.completedLessons} de {course.lessonCount} aulas
                {course.completedLessons === course.lessonCount && course.lessonCount > 0 ? " · concluído" : ""}
              </p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
