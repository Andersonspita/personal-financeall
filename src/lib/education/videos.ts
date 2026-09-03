import {
  COURSE_VIDEO_SCRIPTS,
  LESSON_VIDEO_SCRIPTS,
  type LessonVideoScript,
} from "@/lib/education/video-scripts";

export type { LessonVideoScript, VideoSlide } from "@/lib/education/video-scripts";

/** Vídeo-aula próprio do Desafoga (narração TTS + slides). Sem conteúdo de terceiros. */
export type LessonVideo = {
  slug: string;
  title: string;
  script: LessonVideoScript;
  /** Áudio gerado em public/audio/education/{slug}.mp3 */
  audioSrc: string;
};

const AUDIO_BASE = "/audio/education";

function toLessonVideo(slug: string, script: LessonVideoScript): LessonVideo {
  return {
    slug,
    title: script.title,
    script,
    audioSrc: `${AUDIO_BASE}/${slug}.mp3`,
  };
}

export const COURSE_VIDEOS: Record<string, LessonVideo> = Object.fromEntries(
  Object.entries(COURSE_VIDEO_SCRIPTS).map(([slug, script]) => [slug, toLessonVideo(slug, script)]),
);

/** Aulas com roteiro próprio; as demais herdam o vídeo do curso na UI. */
export const LESSON_VIDEOS: Record<string, LessonVideo> = Object.fromEntries(
  Object.entries(LESSON_VIDEO_SCRIPTS).map(([slug, script]) => [slug, toLessonVideo(slug, script)]),
);

export function videoForLesson(lessonSlug: string, courseSlug?: string | null): LessonVideo | null {
  return LESSON_VIDEOS[lessonSlug] ?? (courseSlug ? COURSE_VIDEOS[courseSlug] : undefined) ?? null;
}

export function videoForCourse(courseSlug: string): LessonVideo | null {
  return COURSE_VIDEOS[courseSlug] ?? null;
}
