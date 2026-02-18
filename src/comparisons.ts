import type { DateKey, DateKeyType } from './types';
import { convertDateKey, formatDateAsKey, getDateKeyType } from './converters';

/**
 * Checks if a date key represents the current period.
 * 
 * @param dateKey - The date key to check
 * @param period - Optional period type to check against. If not provided, uses the date key's own type
 * @returns True if the date key represents the current period
 * 
 * @example
 * isCurrentPeriod('2026-02-17');  // true (if today is Feb 17, 2026)
 * isCurrentPeriod('2026-02-17', 'week');  // true (if this week)
 * isCurrentPeriod('2026-02', 'month');  // true (if this month)
 */
export function isCurrentPeriod(dateKey: DateKey, period?: DateKeyType): boolean {
  switch (period ?? getDateKeyType(dateKey)) {
    case 'day':
      return isCurrentDay(dateKey);
    case 'week':
      return isCurrentWeek(dateKey);
    case 'month':
      return isCurrentMonth(dateKey);
    case 'year':
      return isCurrentYear(dateKey);
    default:
      return false;
  }
}

/**
 * Checks if a date key represents today.
 * 
 * @param dateKey - The date key to check
 * @returns True if the date key represents today
 * 
 * @example
 * isCurrentDay('2026-02-17');  // true (if today is Feb 17, 2026)
 * isCurrentDay('2026-02-16');  // false
 */
export function isCurrentDay(dateKey: DateKey): boolean {
  return convertDateKey(dateKey, 'day') === formatDateAsKey(new Date(), 'day');
}

/**
 * Checks if a date key falls within the current week.
 * 
 * @param dateKey - The date key to check
 * @returns True if the date key falls within the current week
 * 
 * @example
 * isCurrentWeek('2026-02-17');  // true (if this week)
 * isCurrentWeek('2026-W08');    // true (if this is week 8)
 */
export function isCurrentWeek(dateKey: DateKey): boolean {
  return convertDateKey(dateKey, 'week') === formatDateAsKey(new Date(), 'week');
}

/**
 * Checks if a date key falls within the current month.
 * 
 * @param dateKey - The date key to check
 * @returns True if the date key falls within the current month
 * 
 * @example
 * isCurrentMonth('2026-02-17');  // true (if this month is Feb 2026)
 * isCurrentMonth('2026-02');     // true (if this month is Feb 2026)
 */
export function isCurrentMonth(dateKey: DateKey): boolean {
  return convertDateKey(dateKey, 'month') === formatDateAsKey(new Date(), 'month');
}

/**
 * Checks if a date key falls within the current year.
 * 
 * @param dateKey - The date key to check
 * @returns True if the date key falls within the current year
 * 
 * @example
 * isCurrentYear('2026-02-17');  // true (if this year is 2026)
 * isCurrentYear('2026');        // true (if this year is 2026)
 */
export function isCurrentYear(dateKey: DateKey): boolean {
  return convertDateKey(dateKey, 'year') === formatDateAsKey(new Date(), 'year');
}
