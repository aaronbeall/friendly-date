import type { DateKey, DateKeyType } from './types';
import { convertDateKey, formatDateAsKey, getDateKeyType } from './converters';

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

export function isCurrentDay(dateKey: DateKey): boolean {
  return convertDateKey(dateKey, 'day') === formatDateAsKey(new Date(), 'day');
}

export function isCurrentWeek(dateKey: DateKey): boolean {
  return convertDateKey(dateKey, 'week') === formatDateAsKey(new Date(), 'week');
}

export function isCurrentMonth(dateKey: DateKey): boolean {
  return convertDateKey(dateKey, 'month') === formatDateAsKey(new Date(), 'month');
}

export function isCurrentYear(dateKey: DateKey): boolean {
  return convertDateKey(dateKey, 'year') === formatDateAsKey(new Date(), 'year');
}
