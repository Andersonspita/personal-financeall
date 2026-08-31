import { describe, expect, it } from "vitest";
import { COURSES } from "./courses";
import { COURSE_VIDEOS, LESSON_VIDEOS, videoForLesson, youtubeEmbedUrl } from "./videos";

const YOUTUBE_ID = /^[\w-]{11}$/;

describe("vídeos dos cursos", () => {
  it("todo curso tem um vídeo com ID válido", () => {
    for (const course of COURSES) {
      const clip = COURSE_VIDEOS[course.slug];
      expect(clip, course.slug).toBeDefined();
      expect(clip!.id).toMatch(YOUTUBE_ID);
    }
  });

  it("IDs de aula são IDs de YouTube", () => {
    for (const [slug, clip] of Object.entries(LESSON_VIDEOS)) {
      expect(clip.id, slug).toMatch(YOUTUBE_ID);
    }
  });

  it("aula sem vídeo próprio usa o do curso", () => {
    const clip = videoForLesson("tedio-e-consumo", "emocoes-e-compras");
    expect(clip?.id).toBe(COURSE_VIDEOS["emocoes-e-compras"]!.id);
  });

  it("monta URL de embed sem cookies de rastreio", () => {
    expect(youtubeEmbedUrl("KSC58wt4Tbc")).toBe("https://www.youtube-nocookie.com/embed/KSC58wt4Tbc");
  });
});
