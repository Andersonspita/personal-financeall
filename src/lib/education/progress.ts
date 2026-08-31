export function courseProgress(lessons: { completedAt: Date | null }[]): {
  total: number;
  done: number;
  ratio: number;
} {
  const total = lessons.length;
  const done = lessons.filter((lesson) => lesson.completedAt).length;
  return { total, done, ratio: total === 0 ? 0 : done / total };
}

export function adjacentLessons<T extends { slug: string }>(
  lessons: T[],
  currentSlug: string,
): { prev: T | null; next: T | null; index: number; total: number } {
  const index = lessons.findIndex((lesson) => lesson.slug === currentSlug);
  return {
    prev: index > 0 ? lessons[index - 1]! : null,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1]! : null,
    index,
    total: lessons.length,
  };
}
