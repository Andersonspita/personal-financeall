import { describe, expect, it } from "vitest";
import { resolveDashboardMonth, shiftDashboardMonthKey } from "@/lib/dashboard-month";
import { buildMoodTimeline } from "@/lib/mood/timeline";
import { dailyMoodInputSchema } from "@/lib/mood/schemas";

describe("resolveDashboardMonth", () => {
  const now = new Date(2026, 8, 15);

  it("usa o mês atual quando o parâmetro é inválido", () => {
    const period = resolveDashboardMonth("foo", now);
    expect(period.key).toBe("2026-09");
    expect(period.isCurrent).toBe(true);
    expect(period.todayIndex).toBe(14);
  });

  it("resolve mês histórico", () => {
    const period = resolveDashboardMonth("2026-07", now);
    expect(period.key).toBe("2026-07");
    expect(period.isCurrent).toBe(false);
    expect(period.todayIndex).toBeNull();
  });
});

describe("shiftDashboardMonthKey", () => {
  it("avança e retrocede meses", () => {
    expect(shiftDashboardMonthKey("2026-01", -1)).toBe("2025-12");
    expect(shiftDashboardMonthKey("2026-12", 1)).toBe("2027-01");
  });
});

describe("dailyMoodInputSchema", () => {
  it("aceita humor válido", () => {
    expect(dailyMoodInputSchema.parse({ mood: "feliz" }).mood).toBe("feliz");
  });

  it("rejeita necessidade_real no check-in", () => {
    expect(dailyMoodInputSchema.safeParse({ mood: "necessidade_real" }).success).toBe(false);
  });
});

describe("buildMoodTimeline", () => {
  it("mapeia logs por dia do mês", () => {
    const timeline = buildMoodTimeline(
      "2026-09",
      [{ date: "2026-09-02", mood: "ansioso" }],
      3,
    );
    expect(timeline[1]).toEqual({ day: 2, date: "2026-09-02", mood: "ansioso" });
    expect(timeline[0]?.mood).toBeNull();
  });
});
