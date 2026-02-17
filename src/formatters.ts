import { endOfWeek, format, isValid, startOfWeek } from 'date-fns';
import type { DateKey } from './types';
import { isDayKey, isMonthKey, isWeekKey, isYearKey } from './guards';
import { parseDateKey } from './converters';
import { formatDateAsKey } from './converters';

export function formatFriendlyDate(date: DateKey): string;
export function formatFriendlyDate(start: DateKey, end: DateKey): string;
export function formatFriendlyDate(start: DateKey, end?: DateKey): string {
  if (!start) return '';

  if (end && end !== start) {
    if (isWeekKey(start) && isWeekKey(end)) {
      const startDate = startOfWeek(parseDateKey(start));
      const endDate = endOfWeek(parseDateKey(end));
      const startDayKey = formatDateAsKey(startDate, 'day');
      const endDayKey = formatDateAsKey(endDate, 'day');
      return formatFriendlyDate(startDayKey, endDayKey);
    }

    if (isDayKey(start) && isDayKey(end)) {
      const startDate = parseDateKey(start);
      const endDate = parseDateKey(end);
      if (isValid(startDate) && isValid(endDate)) {
        if (startDate.getFullYear() === endDate.getFullYear()) {
          if (startDate.getMonth() === endDate.getMonth()) {
            return `${format(startDate, 'MMMM d')}-${format(endDate, 'd, yyyy')}`;
          } else {
            return `${format(startDate, 'MMMM d')} – ${format(endDate, 'MMMM d, yyyy')}`;
          }
        } else {
          return `${format(startDate, 'MMMM d, yyyy')} – ${format(endDate, 'MMMM d, yyyy')}`;
        }
      }
    }

    if (isMonthKey(start) && isMonthKey(end)) {
      const startDate = parseDateKey(start);
      const endDate = parseDateKey(end);
      if (isValid(startDate) && isValid(endDate)) {
        if (startDate.getFullYear() === endDate.getFullYear()) {
          return `${format(startDate, 'MMMM')} – ${format(endDate, 'MMMM yyyy')}`;
        } else {
          return `${format(startDate, 'MMMM yyyy')} – ${format(endDate, 'MMMM yyyy')}`;
        }
      }
    }

    return `${formatFriendlyDate(start)} – ${formatFriendlyDate(end)}`;
  }

  if (isWeekKey(start)) {
    const weekStart = startOfWeek(parseDateKey(start));
    const weekEnd = endOfWeek(parseDateKey(start));
    const startDayKey = formatDateAsKey(weekStart, 'day');
    const endDayKey = formatDateAsKey(weekEnd, 'day');
    return formatFriendlyDate(startDayKey, endDayKey);
  }

  if (isMonthKey(start)) {
    const parsed = parseDateKey(start);
    if (isValid(parsed)) return format(parsed, 'MMMM yyyy');
  }

  if (isDayKey(start)) {
    const parsed = parseDateKey(start);
    if (isValid(parsed)) return format(parsed, 'MMMM d, yyyy');
  }

  if (isYearKey(start)) {
    const parsed = parseDateKey(start);
    if (isValid(parsed)) return format(parsed, 'yyyy');
  }

  return start;
}
