import { describe, expect, it } from "vitest";
import { EDUCATIONAL_CONTENT } from "./content";
import { COURSES } from "./courses";
import { COURSE_VIDEO_SCRIPTS, LESSON_VIDEO_SCRIPTS } from "./video-scripts";
import { COURSE_VIDEOS, LESSON_VIDEOS, videoForCourse, videoForLesson } from "./videos";

describe("vídeos dos cursos", () => {
  it("todo curso tem roteiro e áudio próprio", () => {
    for (const course of COURSES) {
      const video = COURSE_VIDEOS[course.slug];
      expect(video, course.slug).toBeDefined();
      expect(video!.audioSrc).toBe(`/audio/education/${course.slug}.mp3`);
      expect(video!.script.slides.length).toBeGreaterThan(0);
      expect(video!.script.narration.length).toBeGreaterThan(40);
      expect(COURSE_VIDEO_SCRIPTS[course.slug]).toBeDefined();
    }
  });

  it("toda aula da biblioteca tem roteiro de vídeo", () => {
    for (const lesson of EDUCATIONAL_CONTENT) {
      expect(LESSON_VIDEO_SCRIPTS[lesson.slug], lesson.slug).toBeDefined();
      expect(LESSON_VIDEOS[lesson.slug]!.audioSrc).toBe(`/audio/education/${lesson.slug}.mp3`);
    }
  });

  it("aula sem vídeo próprio na UI usa o do curso", () => {
    const clip = videoForLesson("tedio-e-consumo", "emocoes-e-compras");
    expect(clip?.slug).toBe("tedio-e-consumo");
    expect(clip?.audioSrc).toBe("/audio/education/tedio-e-consumo.mp3");
  });

  it("curso inexistente retorna null", () => {
    expect(videoForCourse("nao-existe")).toBeNull();
    expect(videoForLesson("nao-existe")).toBeNull();
  });
});
