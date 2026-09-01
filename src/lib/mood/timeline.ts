import type { DailyMood } from "@/lib/mood/constants";

export type MoodTimelinePoint = {
  day: number;
  mood: DailyMood | null;
  date: string;
};

export function buildMoodTimeline(monthKey: string, logs: { date: string; mood: string }[], daysInMonth: number): MoodTimelinePoint[] {
  const byDate = new Map(logs.map((log) => [log.date, log.mood as DailyMood]));
  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = `${monthKey}-${String(day).padStart(2, "0")}`;
    return { day, date, mood: byDate.get(date) ?? null };
  });
}
