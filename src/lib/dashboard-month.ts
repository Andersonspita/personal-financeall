import { addMonths, endOfMonth, format, parse, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/;

export type DashboardMonth = {
  key: string;
  label: string;
  start: Date;
  end: Date;
  isCurrent: boolean;
  todayIndex: number | null;
};

export function resolveDashboardMonth(monthParam?: string | null, now = new Date()): DashboardMonth {
  const currentKey = format(now, "yyyy-MM");
  const key =
    monthParam && MONTH_KEY_PATTERN.test(monthParam) && !Number.isNaN(parse(monthParam, "yyyy-MM", now).getTime())
      ? monthParam
      : currentKey;

  const anchor = parse(`${key}-01`, "yyyy-MM-dd", now);
  const start = startOfMonth(anchor);
  const end = endOfMonth(anchor);
  const isCurrent = key === currentKey;
  const todayIndex = isCurrent ? now.getDate() - 1 : null;

  return {
    key,
    label: format(start, "MMMM 'de' yyyy", { locale: ptBR }),
    start,
    end,
    isCurrent,
    todayIndex,
  };
}

export function shiftDashboardMonthKey(key: string, delta: number): string {
  const anchor = parse(`${key}-01`, "yyyy-MM-dd", new Date());
  const shifted = delta < 0 ? subMonths(anchor, Math.abs(delta)) : addMonths(anchor, delta);
  return format(shifted, "yyyy-MM");
}
