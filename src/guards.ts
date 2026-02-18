import type { DateKey, DayKey, MonthKey, WeekKey, YearKey } from './types';

/**
 * Type guard to check if a date key is a DayKey.
 * 
 * @param key - The date key to check
 * @returns True if the key is a DayKey (format: "YYYY-MM-DD")
 * 
 * @example
 * isDayKey('2024-01-15');  // true
 * isDayKey('2024-01');     // false
 */
export function isDayKey(key: DateKey): key is DayKey {
  return /^\d{4}-\d{2}-\d{2}$/.test(key);
}

/**
 * Type guard to check if a date key is a WeekKey.
 * 
 * @param key - The date key to check
 * @returns True if the key is a WeekKey (format: "YYYY-Www")
 * 
 * @example
 * isWeekKey('2024-W03');  // true
 * isWeekKey('2024-01');   // false
 */
export function isWeekKey(key: DateKey): key is WeekKey {
  return /^\d{4}-W\d{2}$/.test(key);
}

/**
 * Type guard to check if a date key is a MonthKey.
 * 
 * @param key - The date key to check
 * @returns True if the key is a MonthKey (format: "YYYY-MM")
 * 
 * @example
 * isMonthKey('2024-01');     // true
 * isMonthKey('2024-01-15');  // false
 */
export function isMonthKey(key: DateKey): key is MonthKey {
  return /^\d{4}-\d{2}$/.test(key);
}

/**
 * Type guard to check if a date key is a YearKey.
 * 
 * @param key - The date key to check
 * @returns True if the key is a YearKey (format: "YYYY")
 * 
 * @example
 * isYearKey('2024');     // true
 * isYearKey('2024-01');  // false
 */
export function isYearKey(key: DateKey): key is YearKey {
  return /^\d{4}$/.test(key);
}
