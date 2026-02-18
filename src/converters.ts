import { format, getWeek, getWeekYear, parse, parseISO, startOfWeek } from 'date-fns';
import type { DateKey, DateKeyType, DayKey, MonthKey, WeekKey, YearKey } from './types';
import { isDayKey, isMonthKey, isWeekKey, isYearKey } from './guards';
import { toDayKey, toMonthKey, toWeekKey, toYearKey } from './builders';

/**
 * Converts a Date object to a DayKey.
 * 
 * @param date - The date to convert
 * @returns A DayKey in format "YYYY-MM-DD"
 * 
 * @example
 * dateToDayKey(new Date(2024, 0, 15));  // "2024-01-15"
 */
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

/**
 * Converts a Date object to a MonthKey.
 * 
 * @param date - The date to convert
 * @returns A MonthKey in format "YYYY-MM"
 * 
 * @example
 * dateToMonthKey(new Date(2024, 0, 15));  // "2024-01"
 */
export function dateToMonthKey(date: Date): MonthKey {
  return toMonthKey(date.getFullYear(), date.getMonth() + 1);
}

/**
 * Converts a Date object to a YearKey.
 * 
 * @param date - The date to convert
 * @returns A YearKey in format "YYYY"
 * 
 * @example
 * dateToYearKey(new Date(2024, 0, 15));  // "2024"
 */
export function dateToYearKey(date: Date): YearKey {
  return toYearKey(date.getFullYear());
}

/**
 * Converts a date key from one resolution to another.
 * 
 * @param dateKey - The date key to convert
 * @param targetType - The target resolution ('day', 'week', 'month', or 'year')
 * @returns A date key of the target type
 * 
 * @example
 * convertDateKey('2024-01-15', 'week');   // "2024-W03"
 * convertDateKey('2024-01-15', 'month');  // "2024-01"
 * convertDateKey('2024-01-15', 'year');   // "2024"
 */
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

/**
 * Parses a date key into a Date object representing the start of that period.
 * 
 * @param key - The date key to parse
 * @returns A Date object representing the start of the period
 * 
 * @example
 * parseDateKey('2024-01-15');  // Date object for Jan 15, 2024
 * parseDateKey('2024-01');     // Date object for Jan 1, 2024 (start of month)
 * parseDateKey('2024-W03');    // Date object for start of week 3
 * parseDateKey('2024');        // Date object for Jan 1, 2024 (start of year)
 */
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

/**
 * Parses a DayKey into its component parts.
 * 
 * @param dayKey - The day key to parse
 * @returns Object with year, month (1-12), and day components
 * 
 * @example
 * parseDayKey('2024-01-15');  // { year: 2024, month: 1, day: 15 }
 */
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

/**
 * Parses a MonthKey into its component parts.
 * 
 * @param monthKey - The month key to parse
 * @returns Object with year and month (1-12) components
 * 
 * @example
 * parseMonthKey('2024-01');  // { year: 2024, month: 1 }
 */
export function parseMonthKey(monthKey: MonthKey): { year: number; month: number } {
  const [yearStr, monthStr] = monthKey.split('-');
  return { year: parseInt(yearStr, 10), month: parseInt(monthStr, 10) };
}

/**
 * Parses a YearKey into a year number.
 * 
 * @param yearKey - The year key to parse
 * @returns The year as a number
 * 
 * @example
 * parseYearKey('2024');  // 2024
 */
export function parseYearKey(yearKey: YearKey) {
  return parseInt(yearKey, 10);
}

/**
 * Parses any date key into its component parts.
 * 
 * @param dateKey - The date key to parse
 * @returns Object with year and optional month, day, or week components depending on key type
 * 
 * @example
 * parseDateKeyToParts('2024-01-15');  // { year: 2024, month: 1, day: 15 }
 * parseDateKeyToParts('2024-W03');    // { year: 2024, week: 3 }
 * parseDateKeyToParts('2024-01');     // { year: 2024, month: 1 }
 * parseDateKeyToParts('2024');        // { year: 2024 }
 */
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

/**
 * Formats a Date object as a date key of the specified type.
 * 
 * @param date - The date to format
 * @param type - The type of date key to create ('day', 'week', 'month', or 'year')
 * @returns A date key of the specified type
 * 
 * @example
 * const date = new Date(2024, 0, 15);
 * formatDateAsKey(date, 'day');    // "2024-01-15"
 * formatDateAsKey(date, 'week');   // "2024-W03"
 * formatDateAsKey(date, 'month');  // "2024-01"
 * formatDateAsKey(date, 'year');   // "2024"
 */
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

/**
 * Determines the type of a date key.
 * 
 * @param key - The date key to check
 * @returns The type of the date key ('day', 'week', 'month', or 'year')
 * 
 * @example
 * getDateKeyType('2024-01-15');  // 'day'
 * getDateKeyType('2024-W03');    // 'week'
 * getDateKeyType('2024-01');     // 'month'
 * getDateKeyType('2024');        // 'year'
 */
export function getDateKeyType(key: DateKey): DateKeyType {
  if (isDayKey(key)) return 'day';
  if (isWeekKey(key)) return 'week';
  if (isMonthKey(key)) return 'month';
  if (isYearKey(key)) return 'year';
  throw new Error(`Invalid DateKey: ${key}`);
}
