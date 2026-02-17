import type { DayKey, MonthKey, WeekKey, YearKey } from './types';

const padNumber = (n: number) => String(n).padStart(2, '0') as `${number}`;

export function toDayKey(year: number, month: number, day: number): DayKey {
  return `${year}-${padNumber(month)}-${padNumber(day)}`;
}

export function toWeekKey(year: number, week: number): WeekKey {
  return `${year}-W${padNumber(week)}`;
}

export function toMonthKey(year: number, month: number): MonthKey {
  return `${year}-${padNumber(month)}`;
}

export function toYearKey(year: number): YearKey {
  return `${year}`;
}
