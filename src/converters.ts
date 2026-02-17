import { format, getWeek, getWeekYear, parse, parseISO, startOfWeek } from 'date-fns';
import type { DateKey, DateKeyType, DayKey, MonthKey, WeekKey, YearKey } from './types';
import { isDayKey, isMonthKey, isWeekKey, isYearKey } from './guards';
import { toDayKey, toMonthKey, toWeekKey, toYearKey } from './builders';

export function dateToDayKey(date: Date): DayKey {
  return toDayKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

/**
 * Converts a Date to a WeekKey.
 * 
 * Uses locale-based week numbering (Sunday-Saturday by default) with week years.
 * A "week year" is the year that a week belongs to, which may differ from the
 * calendar year for dates near year boundaries.
 * 
 * Example: December 31, 2023 (Sunday) starts a week containing January 1-6, 2024.
 * This week belongs to 2024, so it returns "2024-W01" (not "2023-W01").
 * 
 * @param date - The date to convert
 * @returns A WeekKey in format YYYY-Www (e.g., "2024-W01")
 */
export function dateToWeekKey(date: Date): WeekKey {
  return toWeekKey(getWeekYear(date), getWeek(date));
}

export function dateToMonthKey(date: Date): MonthKey {
  return toMonthKey(date.getFullYear(), date.getMonth() + 1);
}

export function dateToYearKey(date: Date): YearKey {
  return toYearKey(date.getFullYear());
}

export function convertDateKey(dateKey: DateKey, targetType: 'day'): DayKey;
export function convertDateKey(dateKey: DateKey, targetType: 'week'): WeekKey;
export function convertDateKey(dateKey: DateKey, targetType: 'month'): MonthKey;
export function convertDateKey(dateKey: DateKey, targetType: 'year'): YearKey;
export function convertDateKey(dateKey: DateKey, targetType: DateKeyType): DateKey;
export function convertDateKey(dateKey: DateKey, targetType: DateKeyType): DateKey {
  const date = parseDateKey(dateKey);
  return formatDateAsKey(date, targetType);
}

/**
 * Converts a WeekKey to an ISO date string representing the start of that week.
 * 
 * Week keys use the format YYYY-Www where:
 * - YYYY is the week year (not necessarily the calendar year)
 * - ww is the locale-based week number (1-53)
 * 
 * The week year is determined by which year the majority of the week's days fall in.
 * Weeks start on Sunday by default (locale-dependent).
 * 
 * @param week - The week key to convert (e.g., "2024-W01")
 * @returns ISO date string of the week's start date (e.g., "2023-12-31")
 */
function parseWeekKeyToDate(week: WeekKey): string {
  // YYYY = week year, ww = locale week number
  const date = parse(week, "YYYY-'W'ww", new Date(), { useAdditionalWeekYearTokens: true });
  const weekStart = startOfWeek(date); // Defaults to Sunday
  return format(weekStart, 'yyyy-MM-dd');
}

export function parseDateKey(key: DateKey): Date {
  if (isDayKey(key)) {
    return parseISO(key);
  }
  if (isWeekKey(key)) {
    return parseISO(parseWeekKeyToDate(key));
  }
  if (isMonthKey(key)) {
    return parseISO(`${key}-01`);
  }
  if (isYearKey(key)) {
    return parseISO(`${key}-01-01`);
  }
  throw new Error(`Invalid DateKey: ${key}`);
}

export function parseDayKey(dayKey: DayKey): { year: number; month: number; day: number } {
  const [yearStr, monthStr, dayStr] = dayKey.split('-');
  return { year: parseInt(yearStr, 10), month: parseInt(monthStr, 10), day: parseInt(dayStr, 10) };
}

/**
 * Parses a WeekKey into its component parts.
 * 
 * Note: The year returned is the week year, which may differ from the calendar
 * year for weeks that span year boundaries.
 * 
 * @param weekKey - The week key to parse (e.g., "2024-W01")
 * @returns Object with week year and week number
 */
export function parseWeekKey(weekKey: WeekKey): { year: number; week: number } {
  const [yearStr, weekStr] = weekKey.split('-W');
  return { year: parseInt(yearStr, 10), week: parseInt(weekStr, 10) };
}

export function parseMonthKey(monthKey: MonthKey): { year: number; month: number } {
  const [yearStr, monthStr] = monthKey.split('-');
  return { year: parseInt(yearStr, 10), month: parseInt(monthStr, 10) };
}

export function parseYearKey(yearKey: YearKey) {
  return parseInt(yearKey, 10);
}

export function parseDateKeyToParts(dateKey: DateKey): { year: number; month?: number; day?: number; week?: number } {
  if (isDayKey(dateKey)) {
    const { year, month, day } = parseDayKey(dateKey);
    return { year, month, day };
  }
  if (isWeekKey(dateKey)) {
    const { year, week } = parseWeekKey(dateKey);
    return { year, week };
  }
  if (isMonthKey(dateKey)) {
    const { year, month } = parseMonthKey(dateKey);
    return { year, month };
  }
  if (isYearKey(dateKey)) {
    const year = parseYearKey(dateKey);
    return { year };
  }
  throw new Error(`Invalid DateKey: ${dateKey}`);
}

export function formatDateAsKey(date: Date, type: 'day'): DayKey;
export function formatDateAsKey(date: Date, type: 'week'): WeekKey;
export function formatDateAsKey(date: Date, type: 'month'): MonthKey;
export function formatDateAsKey(date: Date, type: 'year'): YearKey;
export function formatDateAsKey(date: Date, type: DateKeyType): DateKey;
export function formatDateAsKey(date: Date, type: DateKeyType): DateKey {
  switch (type) {
    case 'day':
      return format(date, 'yyyy-MM-dd') as DayKey;
    case 'week':
      // YYYY = week year (not calendar year), ww = locale week number
      return format(date, "YYYY-'W'ww", { useAdditionalWeekYearTokens: true }) as WeekKey;
    case 'month':
      return format(date, 'yyyy-MM') as MonthKey;
    case 'year':
      return format(date, 'yyyy') as YearKey;
    default:
      throw new Error('Invalid key type');
  }
}

export function getDateKeyType(key: DateKey): DateKeyType {
  if (isDayKey(key)) return 'day';
  if (isWeekKey(key)) return 'week';
  if (isMonthKey(key)) return 'month';
  if (isYearKey(key)) return 'year';
  throw new Error(`Invalid DateKey: ${key}`);
}
