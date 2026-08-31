import { prisma } from "@/lib/prisma";
import { EDUCATIONAL_CONTENT } from "@/lib/education/content";
import { COURSES } from "@/lib/education/courses";

let catalogSync: Promise<void> | null = null;

/** Garante cursos e aulas no banco (VPS e contas novas), sem criar usuário demo. */
export async function ensureEducationalCatalog(): Promise<void> {
  if (!catalogSync) {
    catalogSync = syncEducationalCatalog().catch((err) => {
      catalogSync = null;
      throw err;
    });
  }
  return catalogSync;
}

async function syncEducationalCatalog(): Promise<void> {
  for (const course of COURSES) {
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        title: course.title,
        summary: course.summary,
        tag: course.tag,
        order: course.order,
      },
      create: {
        slug: course.slug,
        title: course.title,
        summary: course.summary,
        tag: course.tag,
        order: course.order,
      },
    });
  }

  const courses = await prisma.course.findMany({ select: { id: true, slug: true } });
  const courseIdBySlug = new Map(courses.map((course) => [course.slug, course.id]));
  const lessonPlace = new Map<string, { courseId: string; lessonOrder: number }>();
  for (const course of COURSES) {
    const courseId = courseIdBySlug.get(course.slug);
    if (!courseId) continue;
    course.lessonSlugs.forEach((slug, index) => {
      lessonPlace.set(slug, { courseId, lessonOrder: index + 1 });
    });
  }

  for (const lesson of EDUCATIONAL_CONTENT) {
    const place = lessonPlace.get(lesson.slug);
    await prisma.educationalContent.upsert({
      where: { slug: lesson.slug },
      update: {
        title: lesson.title,
        summary: lesson.summary,
        body: lesson.body,
        tag: lesson.tag,
        estimatedMinutes: lesson.estimatedMinutes,
        order: lesson.order,
        lessonOrder: place?.lessonOrder ?? 0,
        courseId: place?.courseId ?? null,
      },
      create: {
        slug: lesson.slug,
        title: lesson.title,
        summary: lesson.summary,
        body: lesson.body,
        tag: lesson.tag,
        estimatedMinutes: lesson.estimatedMinutes,
        order: lesson.order,
        lessonOrder: place?.lessonOrder ?? 0,
        courseId: place?.courseId ?? null,
      },
    });
  }
}
