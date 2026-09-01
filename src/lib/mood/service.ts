import "server-only";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { encryptSensitive, decryptSensitive } from "@/lib/crypto";
import { dailyMoodInputSchema } from "@/lib/mood/schemas";
import type { MoodTimelinePoint } from "@/lib/mood/timeline";

export function todayDateKey(now = new Date()): string {
  return format(now, "yyyy-MM-dd");
}

export async function getTodayMoodLog(userId: string, now = new Date()) {
  return prisma.dailyMoodLog.findUnique({
    where: { userId_date: { userId, date: todayDateKey(now) } },
  });
}

export async function getMoodLogsForMonth(userId: string, monthKey: string) {
  return prisma.dailyMoodLog.findMany({
    where: { userId, date: { startsWith: monthKey } },
    orderBy: { date: "asc" },
  });
}

export async function upsertDailyMood(userId: string, input: unknown, now = new Date()) {
  const data = dailyMoodInputSchema.parse(input);
  const date = todayDateKey(now);
  const note = data.note?.trim() ?? "";
  const noteEncrypted = note ? encryptSensitive(note) : null;

  return prisma.dailyMoodLog.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, mood: data.mood, noteEncrypted },
    update: { mood: data.mood, noteEncrypted },
  });
}

export async function decryptMoodNote(noteEncrypted: string | null): Promise<string | null> {
  if (!noteEncrypted) return null;
  try {
    return decryptSensitive(noteEncrypted);
  } catch {
    return null;
  }
}

export type { MoodTimelinePoint };
