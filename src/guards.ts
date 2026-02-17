import type { DateKey, DayKey, MonthKey, WeekKey, YearKey } from './types';

export function isDayKey(key: DateKey): key is DayKey {
  return /^\d{4}-\d{2}-\d{2}$/.test(key);
}

export function isWeekKey(key: DateKey): key is WeekKey {
  return /^\d{4}-W\d{2}$/.test(key);
}

export function isMonthKey(key: DateKey): key is MonthKey {
  return /^\d{4}-\d{2}$/.test(key);
}

export function isYearKey(key: DateKey): key is YearKey {
  return /^\d{4}$/.test(key);
}
