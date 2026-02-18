import { endOfWeek, isValid, startOfWeek } from 'date-fns';
import type { DateKey } from './types';
import { isDayKey, isMonthKey, isWeekKey, isYearKey } from './guards';
import { parseDateKey } from './converters';
import { formatDateAsKey } from './converters';

export interface FormatFriendlyDateOptions {
  /**
   * Omits the year and/or month from the formatted date if it matches the current year and/or month.
   *
   * - `year`: Omit the current year.
   * - `month`: Omit the current month.
   * - `true`: Omits current year and month based on the date resolution (e.g., day keys omit year and month, month keys omit year).
   * - `false`: Do not omit the current year and month (default).
   *
   * @default false
   */
  omitCurrent?: boolean | 'year' | 'month';
  /**
   * The date style to use for formatting.
   *
   * - `full`: Full date (e.g., "Monday, January 15, 2024").
   * - `long`: Long date (e.g., "January 15, 2024").
   * - `medium`: Medium date (e.g., "Jan 15, 2024").
   * - `short`: Short date (e.g., "1/15/2024").
   *
   * @default 'long'
   */
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
}

function createFormatter(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat('en-US', options);
}

function getMonthFormat(dateStyle: 'full' | 'long' | 'medium' | 'short'): 'long' | 'short' | 'numeric' {
  switch (dateStyle) {
    case 'full':
    case 'long':
      return 'long';
    case 'medium':
      return 'short';
    case 'short':
      return 'numeric';
  }
}

function shouldOmitYear(date: Date, omitCurrent: boolean | 'year' | 'month'): boolean {
  if (!omitCurrent) return false;
  const now = new Date();
  return date.getFullYear() === now.getFullYear();
}

function shouldOmitMonth(date: Date, omitCurrent: boolean | 'year' | 'month'): boolean {
  if (omitCurrent !== 'month') return false;
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

/**
 * Formats a date key or date range into a human-friendly, internationalized string.
 * 
 * This function provides intelligent formatting that:
 * - Automatically handles different date resolutions (day, week, month, year)
 * - Eliminates redundant information in date ranges (e.g., "June 1 – 15, 2024" instead of "June 1, 2024 – June 15, 2024")
 * - Supports omitting current year/month for more concise output
 * - Respects the chosen date style across all formatting scenarios
 * 
 * @param start - The date key to format, or the start of a date range
 * @param endOrOptions - Either the end date key for a range, or formatting options for a single date
 * @param optionsArg - Formatting options when formatting a date range
 * 
 * @returns A formatted, human-friendly date string
 * 
 * @example
 * // Single dates
 * formatFriendlyDate('2024-01-15');  // "January 15, 2024"
 * formatFriendlyDate('2024-01');     // "January 2024"
 * formatFriendlyDate('2024-W03');    // "January 14 – 20, 2024" (expands to week range)
 * formatFriendlyDate('2024');        // "2024"
 * 
 * @example
 * // Date ranges with smart redundancy elimination
 * formatFriendlyDate('2024-01-15', '2024-01-20');  // "January 15 – 20, 2024"
 * formatFriendlyDate('2024-01', '2024-03');        // "January – March 2024"
 * formatFriendlyDate('2024-01-15', '2024-02-20');  // "January 15 – February 20, 2024"
 * 
 * @example
 * // With omitCurrent option
 * formatFriendlyDate('2026-06-15', { omitCurrent: 'year' });  // "June 15" (omits current year)
 * formatFriendlyDate('2026-06', { omitCurrent: true });       // "June" (omits current year for month keys)
 * 
 * @example
 * // With different date styles
 * formatFriendlyDate('2024-06-15', { dateStyle: 'full' });    // "Saturday, June 15, 2024"
 * formatFriendlyDate('2024-06-15', { dateStyle: 'long' });    // "June 15, 2024" (default)
 * formatFriendlyDate('2024-06-15', { dateStyle: 'medium' });  // "Jun 15, 2024"
 * formatFriendlyDate('2024-06-15', { dateStyle: 'short' });   // "6/15/24"
 * 
 * @example
 * // Combining options
 * formatFriendlyDate('2026-06-15', { omitCurrent: 'year', dateStyle: 'medium' });  // "Jun 15"
 */
export function formatFriendlyDate(date: DateKey, options?: FormatFriendlyDateOptions): string;
export function formatFriendlyDate(start: DateKey, end: DateKey, options?: FormatFriendlyDateOptions): string;
export function formatFriendlyDate(start: DateKey, endOrOptions?: DateKey | FormatFriendlyDateOptions, optionsArg?: FormatFriendlyDateOptions): string {
  let end: DateKey | undefined;
  let options: FormatFriendlyDateOptions;

  if (typeof endOrOptions === 'object') {
    end = undefined;
    options = endOrOptions || {};
  } else {
    end = endOrOptions;
    options = optionsArg || {};
  }

  const { omitCurrent = false, dateStyle = 'long' } = options;
  if (!start) return '';

  if (end && end !== start) {
    if (isWeekKey(start) && isWeekKey(end)) {
      const startDate = startOfWeek(parseDateKey(start));
      const endDate = endOfWeek(parseDateKey(end));
      const startDayKey = formatDateAsKey(startDate, 'day');
      const endDayKey = formatDateAsKey(endDate, 'day');
      return formatFriendlyDate(startDayKey, endDayKey, options);
    }

    if (isDayKey(start) && isDayKey(end)) {
      const startDate = parseDateKey(start);
      const endDate = parseDateKey(end);
      if (isValid(startDate) && isValid(endDate)) {
        const formatter = createFormatter({ dateStyle });
        return formatter.formatRange(startDate, endDate);
      }
    }

    if (isMonthKey(start) && isMonthKey(end)) {
      const startDate = parseDateKey(start);
      const endDate = parseDateKey(end);
      if (isValid(startDate) && isValid(endDate)) {
        const monthFormat = getMonthFormat(dateStyle);
        const formatter = createFormatter({ month: monthFormat, year: 'numeric' });
        return formatter.formatRange(startDate, endDate);
      }
    }

    return `${formatFriendlyDate(start, options)} – ${formatFriendlyDate(end, options)}`;
  }

  if (isWeekKey(start)) {
    const weekStart = startOfWeek(parseDateKey(start));
    const weekEnd = endOfWeek(parseDateKey(start));
    const startDayKey = formatDateAsKey(weekStart, 'day');
    const endDayKey = formatDateAsKey(weekEnd, 'day');
    return formatFriendlyDate(startDayKey, endDayKey, options);
  }

  if (isMonthKey(start)) {
    const parsed = parseDateKey(start);
    if (isValid(parsed)) {
      const effectiveOmit = omitCurrent === true ? 'year' : omitCurrent;
      const omitYear = shouldOmitYear(parsed, effectiveOmit);
      const monthFormat = getMonthFormat(dateStyle);
      const formatterOptions = omitYear
        ? { month: monthFormat } as Intl.DateTimeFormatOptions
        : { month: monthFormat, year: 'numeric' } as Intl.DateTimeFormatOptions;
      const formatter = createFormatter(formatterOptions);
      return formatter.format(parsed);
    }
  }

  if (isDayKey(start)) {
    const parsed = parseDateKey(start);
    if (isValid(parsed)) {
      const effectiveOmit = omitCurrent ? 'month' : omitCurrent;
      const omitMonth = shouldOmitMonth(parsed, effectiveOmit);
      const omitYear = shouldOmitYear(parsed, effectiveOmit);

      let formatterOptions: Intl.DateTimeFormatOptions;
      if (omitMonth) {
        formatterOptions = { day: 'numeric' };
      } else if (omitYear) {
        formatterOptions = { month: getMonthFormat(dateStyle), day: 'numeric' };
      } else {
        formatterOptions = { dateStyle };
      }

      const formatter = createFormatter(formatterOptions);
      return formatter.format(parsed);
    }
  }

  if (isYearKey(start)) {
    const parsed = parseDateKey(start);
    if (isValid(parsed)) {
      const formatter = createFormatter({ year: 'numeric' });
      return formatter.format(parsed);
    }
  }

  return start;
}
