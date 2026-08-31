import { prisma } from "@/lib/prisma";
import { getEmotionSpendMatrix } from "@/lib/insights";
import { ensureEducationalCatalog } from "@/lib/education/catalog";
import { adjacentLessons, courseProgress } from "@/lib/education/progress";

export interface ContentListItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  tag: string;
  estimatedMinutes: number;
  completedAt: Date | null;
}

export type CourseListItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  tag: string;
  estimatedMinutes: number;
  lessonCount: number;
  completedLessons: number;
  progressRatio: number;
};

async function withCatalog() {
  await ensureEducationalCatalog();
}

function toListItem(c: {
  id: string;
  slug: string;
  title: string;
  summary: string;
  tag: string;
  estimatedMinutes: number;
  progress: { completedAt: Date | null }[];
}): ContentListItem {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    summary: c.summary,
    tag: c.tag,
    estimatedMinutes: c.estimatedMinutes,
    completedAt: c.progress[0]?.completedAt ?? null,
  };
}

/** Lista toda a biblioteca, com o progresso de leitura deste usuário (RF07 estendido). */
export async function getContentLibrary(userId: string): Promise<ContentListItem[]> {
  await withCatalog();
  const content = await prisma.educationalContent.findMany({
    orderBy: { order: "asc" },
    include: { progress: { where: { userId } } },
  });
  return content.map(toListItem);
}

export async function getCourses(userId: string): Promise<CourseListItem[]> {
  await withCatalog();
  const courses = await prisma.course.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { lessonOrder: "asc" },
        include: { progress: { where: { userId } } },
      },
    },
  });

  return courses.map((course) => {
    const progress = courseProgress(
      course.lessons.map((lesson) => ({ completedAt: lesson.progress[0]?.completedAt ?? null })),
    );
    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      summary: course.summary,
      tag: course.tag,
      estimatedMinutes: course.lessons.reduce((sum, lesson) => sum + lesson.estimatedMinutes, 0),
      lessonCount: progress.total,
      completedLessons: progress.done,
      progressRatio: progress.ratio,
    };
  });
}

export async function getCourseBySlug(userId: string, slug: string) {
  await withCatalog();
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      lessons: {
        orderBy: { lessonOrder: "asc" },
        include: { progress: { where: { userId } } },
      },
    },
  });
  if (!course) return null;

  const lessons = course.lessons.map((lesson) => ({
    ...toListItem(lesson),
    lessonOrder: lesson.lessonOrder,
  }));
  const progress = courseProgress(lessons);

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    tag: course.tag,
    lessons,
    estimatedMinutes: lessons.reduce((sum, lesson) => sum + lesson.estimatedMinutes, 0),
    progress,
  };
}

export async function getContentBySlug(userId: string, slug: string) {
  await withCatalog();
  const content = await prisma.educationalContent.findUnique({
    where: { slug },
    include: {
      progress: { where: { userId } },
      course: {
        include: {
          lessons: {
            orderBy: { lessonOrder: "asc" },
            include: { progress: { where: { userId } } },
          },
        },
      },
    },
  });
  if (!content) return null;

  const courseLessons = content.course?.lessons.map((lesson) => ({
    slug: lesson.slug,
    title: lesson.title,
  }));
  const neighbors = courseLessons ? adjacentLessons(courseLessons, content.slug) : null;

  return {
    id: content.id,
    slug: content.slug,
    title: content.title,
    summary: content.summary,
    body: content.body,
    tag: content.tag,
    estimatedMinutes: content.estimatedMinutes,
    completedAt: content.progress[0]?.completedAt ?? null,
    course: content.course
      ? {
          slug: content.course.slug,
          title: content.course.title,
          neighbors,
        }
      : null,
  };
}

/**
 * Recomenda conteúdo com base na emoção que mais aparece nos gastos recentes (mesmo cálculo da
 * Matriz Emoção × Gasto, RF05) — prioriza o que ainda não foi concluído.
 */
export async function getRecommendedContent(userId: string, limit = 3): Promise<ContentListItem[]> {
  const matrix = await getEmotionSpendMatrix(userId, 30);
  const topEmotion = matrix.find((m) => m.count > 0)?.emotion;

  const library = await getContentLibrary(userId);
  const notCompleted = library.filter((c) => !c.completedAt);

  if (!topEmotion) return notCompleted.slice(0, limit);

  const matching = notCompleted.filter((c) => c.tag === topEmotion);
  const rest = notCompleted.filter((c) => c.tag !== topEmotion);
  return [...matching, ...rest].slice(0, limit);
}
