import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getCourseBySlug } from "@/lib/education/service";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { tagEmoji, tagLabel } from "@/lib/education/tags";
import { LessonVideoPlayer } from "@/components/education/lesson-video-player";
import { videoForCourse } from "@/lib/education/videos";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser();
  const course = await getCourseBySlug(user.id, slug);
  if (!course) notFound();
  const clip = videoForCourse(course.slug);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/aprender" className="flex items-center gap-1 text-sm text-foreground-muted">
        <ArrowLeft size={16} /> Aprender
      </Link>

      <div className="flex items-center gap-2">
        <Badge tone="calm">
          {tagEmoji(course.tag)} {tagLabel(course.tag)}
        </Badge>
        <span className="flex items-center gap-1 text-xs text-foreground-muted">
          <Clock size={13} /> {course.estimatedMinutes} min no total
        </span>
      </div>

      <PageHeader title={course.title} subtitle={course.summary} />

      {clip ? <LessonVideoPlayer video={clip} /> : null}

      <ProgressBar ratio={course.progress.ratio} tone="dentro_do_limite" />
      <p className="text-xs text-foreground-muted">
        {course.progress.done} de {course.progress.total} aulas
      </p>

      <ol className="flex flex-col gap-2">
        {course.lessons.map((lesson, index) => (
          <li key={lesson.id}>
            <Link
              href={`/aprender/${lesson.slug}`}
              className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-muted"
            >
              <div className="min-w-0">
                <p className="text-xs text-foreground-muted">Aula {index + 1}</p>
                <p className="font-medium">{lesson.title}</p>
                <p className="mt-0.5 text-sm text-foreground-muted">{lesson.summary}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-foreground-muted">
                <span className="flex items-center gap-1">
                  <Clock size={13} /> {lesson.estimatedMinutes} min
                </span>
                {lesson.completedAt && (
                  <span className="flex items-center gap-1 text-primary">
                    <CheckCircle2 size={13} /> concluída
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
