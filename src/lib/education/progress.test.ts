import { describe, expect, it } from "vitest";
import { COURSES } from "./courses";
import { EDUCATIONAL_CONTENT } from "./content";
import { adjacentLessons, courseProgress } from "./progress";

describe("courseProgress", () => {
  it("conta aulas concluídas e o ratio", () => {
    expect(
      courseProgress([{ completedAt: new Date() }, { completedAt: null }, { completedAt: new Date() }]),
    ).toEqual({ total: 3, done: 2, ratio: 2 / 3 });
  });

  it("trata curso vazio", () => {
    expect(courseProgress([])).toEqual({ total: 0, done: 0, ratio: 0 });
  });
});

describe("adjacentLessons", () => {
  const lessons = [{ slug: "a" }, { slug: "b" }, { slug: "c" }];

  it("devolve anterior e próxima no meio", () => {
    expect(adjacentLessons(lessons, "b")).toEqual({
      prev: { slug: "a" },
      next: { slug: "c" },
      index: 1,
      total: 3,
    });
  });

  it("não inventa anterior na primeira aula", () => {
    expect(adjacentLessons(lessons, "a").prev).toBeNull();
    expect(adjacentLessons(lessons, "c").next).toBeNull();
  });
});

describe("COURSES", () => {
  it("aponta só para aulas que existem no catálogo", () => {
    const slugs = new Set(EDUCATIONAL_CONTENT.map((lesson) => lesson.slug));
    for (const course of COURSES) {
      expect(course.lessonSlugs.length).toBeGreaterThan(0);
      for (const slug of course.lessonSlugs) {
        expect(slugs.has(slug)).toBe(true);
      }
    }
  });
});
