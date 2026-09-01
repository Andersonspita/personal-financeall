"use client";

import { DAILY_MOOD_EMOJI, type DailyMood } from "@/lib/mood/constants";

type Point = { day: number; mood: DailyMood | null; date: string };

export function MoodTimelineChart({ data }: { data: Point[] }) {
  const logged = data.filter((point) => point.mood);
  if (logged.length === 0) {
    return <p className="text-sm text-foreground-muted">Nenhum check-in neste mês ainda.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-10">
        {data.map((point) => (
          <div
            key={point.date}
            title={point.mood ? `Dia ${point.day}` : `Dia ${point.day} — sem registro`}
            className={`flex aspect-square items-center justify-center rounded-lg text-sm ${
              point.mood ? "bg-primary/10" : "bg-surface-muted text-foreground-muted/40"
            }`}
          >
            {point.mood ? DAILY_MOOD_EMOJI[point.mood] : <span className="text-[10px]">{point.day}</span>}
          </div>
        ))}
      </div>
      <p className="text-xs text-foreground-muted">{logged.length} dia(s) com check-in neste mês.</p>
    </div>
  );
}
