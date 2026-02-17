import { endOfWeek, isValid, startOfWeek } from 'date-fns';
import type { DateKey } from './types';
import { isDayKey, isMonthKey, isWeekKey, isYearKey } from './guards';
import { parseDateKey } from './converters';
import { formatDateAsKey } from './converters';

export interface FormatFriendlyDateOptions {
  omitCurrent?: boolean | 'year' | 'month';
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
}

function createFormatter(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat('en-US', options);
}

function getFormatterOptions(dateStyle: 'full' | 'long' | 'medium' | 'short' = 'long'): Intl.DateTimeFormatOptions {
  return { dateStyle };
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
        const formatter = createFormatter(getFormatterOptions(dateStyle));
        return formatter.formatRange(startDate, endDate);
      }
    }

    if (isMonthKey(start) && isMonthKey(end)) {
      const startDate = parseDateKey(start);
      const endDate = parseDateKey(end);
      if (isValid(startDate) && isValid(endDate)) {
        const formatter = createFormatter(getFormatterOptions(dateStyle));
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
      const effectiveOmit = omitCurrent ? 'year' : omitCurrent;
      const omitYear = shouldOmitYear(parsed, effectiveOmit);
      const formatterOptions = omitYear
        ? { month: 'long' } as Intl.DateTimeFormatOptions
        : getFormatterOptions(dateStyle);
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
        formatterOptions = { month: 'long', day: 'numeric' };
      } else {
        formatterOptions = getFormatterOptions(dateStyle);
      }

      const formatter = createFormatter(formatterOptions);
      return formatter.format(parsed);
    }
  }

  if (isYearKey(start)) {
    const parsed = parseDateKey(start);
    if (isValid(parsed)) {
      const formatter = createFormatter(getFormatterOptions(dateStyle));
      return formatter.format(parsed);
    }
  }

  return start;
}
