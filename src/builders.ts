import type { DayKey, MonthKey, WeekKey, YearKey } from './types';

const pad = (n: number) => String(n).padStart(2, '0') as `${number}`;

/**
 * Creates a DayKey from year, month, and day components.
 *
 * @param year - The year (e.g., 2024)
 * @param month - The month (1-12)
 * @param day - The day of the month (1-31)
 * @returns A DayKey in format "YYYY-MM-DD"
 *
 * @example
 * toDayKey(2024, 1, 15);  // "2024-01-15"
 * toDayKey(2024, 12, 5);  // "2024-12-05"
 */
export function toDayKey(year: number, month: number, day: number): DayKey {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/**
 * Creates a WeekKey from year and week number components.
 *
 * @param year - The week year (e.g., 2024)
 * @param week - The week number (1-53)
 * @returns A WeekKey in format "YYYY-Www"
 *
 * @example
 * toWeekKey(2024, 3);   // "2024-W03"
 * toWeekKey(2024, 52);  // "2024-W52"
 */
export function toWeekKey(year: number, week: number): WeekKey {
  return `${year}-W${pad(week)}`;
}

/**
 * Creates a MonthKey from year and month components.
 *
 * @param year - The year (e.g., 2024)
 * @param month - The month (1-12)
 * @returns A MonthKey in format "YYYY-MM"
 *
 * @example
 * toMonthKey(2024, 1);   // "2024-01"
 * toMonthKey(2024, 12);  // "2024-12"
 */
export function toMonthKey(year: number, month: number): MonthKey {
  return `${year}-${pad(month)}`;
}

/**
 * Creates a YearKey from a year component.
 *
 * @param year - The year (e.g., 2024)
 * @returns A YearKey in format "YYYY"
 *
 * @example
 * toYearKey(2024);  // "2024"
 */
export function toYearKey(year: number): YearKey {
  return `${year}`;
}
