"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Compass, Pause, Play } from "lucide-react";
import type { LessonVideo } from "@/lib/education/videos";

function slideIndexForProgress(progress: number, slideCount: number): number {
  if (slideCount <= 1) return 0;
  const clamped = Math.min(Math.max(progress, 0), 0.999);
  return Math.min(slideCount - 1, Math.floor(clamped * slideCount));
}

export function LessonVideoPlayer({ video }: { video: LessonVideo }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [audioError, setAudioError] = useState(false);

  const slides = video.script.slides;
  const slide = slides[slideIndex] ?? slides[0]!;

  const syncSlide = useCallback(
    (current: number, total: number) => {
      if (total <= 0) return;
      setSlideIndex(slideIndexForProgress(current / total, slides.length));
    },
    [slides.length],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setProgress(audio.currentTime);
      syncSlide(audio.currentTime, audio.duration || duration);
    };
    const onLoaded = () => {
      setDuration(audio.duration);
      setAudioError(false);
    };
    const onEnded = () => {
      setPlaying(false);
      setSlideIndex(slides.length - 1);
    };
    const onError = () => setAudioError(true);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [duration, slides.length, syncSlide]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || audioError) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setAudioError(true);
    }
  };

  const onSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(value)) return;
    audio.currentTime = value;
    setProgress(value);
    syncSlide(value, audio.duration || duration);
  };

  const progressRatio = duration > 0 ? progress / duration : 0;

  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="relative aspect-video bg-gradient-to-br from-primary-soft via-surface to-calm-soft">
        <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-7">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground-muted">
            <Compass className="size-4 text-primary" aria-hidden />
            <span>Bússola Financeira</span>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-3">
            <h3 className="text-balance text-xl font-semibold leading-snug text-foreground sm:text-2xl">
              {slide.title}
            </h3>
            <ul className="flex flex-col gap-2">
              {slide.lines.map((line) => (
                <li key={line} className="text-pretty text-sm leading-relaxed text-foreground-muted sm:text-base">
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            {slides.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === slideIndex ? "w-6 bg-primary" : "w-1.5 bg-border"
                }`}
                aria-hidden
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void togglePlay()}
          disabled={audioError}
          className="absolute bottom-4 right-4 flex size-11 items-center justify-center rounded-full bg-primary text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={playing ? "Pausar vídeo-aula" : "Reproduzir vídeo-aula"}
        >
          {playing ? <Pause className="size-5" /> : <Play className="size-5 translate-x-0.5" />}
        </button>
      </div>

      <div className="border-t border-border px-3 py-2">
        <div className="mb-2 flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={progress}
            onChange={(event) => onSeek(Number(event.target.value))}
            className="h-1.5 w-full cursor-pointer accent-primary"
            aria-label="Progresso da vídeo-aula"
            disabled={audioError || duration <= 0}
          />
        </div>
        <figcaption className="text-xs text-foreground-muted">
          {video.title}. Vídeo-aula produzida pela Bússola (narração sintética e roteiro próprio).
          {audioError ? " Áudio indisponível no momento — leia o texto da aula abaixo." : null}
        </figcaption>
      </div>

      <audio ref={audioRef} src={video.audioSrc} preload="metadata" className="hidden">
        <track kind="captions" />
      </audio>
    </figure>
  );
}
