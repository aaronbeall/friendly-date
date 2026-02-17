import { describe, it, expect } from 'vitest';
import {
  isDayKey,
  isWeekKey,
  isMonthKey,
  isYearKey,
  toDayKey,
  toWeekKey,
  toMonthKey,
  toYearKey,
  dateToDayKey,
  dateToWeekKey,
  dateToMonthKey,
  dateToYearKey,
  parseDateKey,
  parseDayKey,
  parseWeekKey,
  parseMonthKey,
  parseYearKey,
  convertDateKey,
  formatFriendlyDate,
  isCurrentDay,
  formatDateAsKey,
} from './index';

describe('Type Guards', () => {
  it('should identify day keys', () => {
    expect(isDayKey('2024-01-15')).toBe(true);
    expect(isDayKey('2024-01')).toBe(false);
    expect(isDayKey('2024-W03')).toBe(false);
    expect(isDayKey('2024')).toBe(false);
  });

  it('should identify week keys', () => {
    expect(isWeekKey('2024-W03')).toBe(true);
    expect(isWeekKey('2024-01-15')).toBe(false);
    expect(isWeekKey('2024-01')).toBe(false);
    expect(isWeekKey('2024')).toBe(false);
  });

  it('should identify month keys', () => {
    expect(isMonthKey('2024-01')).toBe(true);
    expect(isMonthKey('2024-01-15')).toBe(false);
    expect(isMonthKey('2024-W03')).toBe(false);
    expect(isMonthKey('2024')).toBe(false);
  });

  it('should identify year keys', () => {
    expect(isYearKey('2024')).toBe(true);
    expect(isYearKey('2024-01')).toBe(false);
    expect(isYearKey('2024-W03')).toBe(false);
    expect(isYearKey('2024-01-15')).toBe(false);
  });
});

describe('Builders', () => {
  it('should build day keys', () => {
    expect(toDayKey(2024, 1, 15)).toBe('2024-01-15');
    expect(toDayKey(2024, 12, 31)).toBe('2024-12-31');
  });

  it('should build week keys', () => {
    expect(toWeekKey(2024, 3)).toBe('2024-W03');
    expect(toWeekKey(2024, 52)).toBe('2024-W52');
  });

  it('should build month keys', () => {
    expect(toMonthKey(2024, 1)).toBe('2024-01');
    expect(toMonthKey(2024, 12)).toBe('2024-12');
  });

  it('should build year keys', () => {
    expect(toYearKey(2024)).toBe('2024');
  });
});

describe('Date Converters', () => {
  const testDate = new Date('2024-01-15T12:00:00Z');

  it('should convert date to day key', () => {
    expect(dateToDayKey(testDate)).toBe('2024-01-15');
  });

  it('should convert date to week key', () => {
    const weekKey = dateToWeekKey(testDate);
    expect(isWeekKey(weekKey)).toBe(true);
  });

  it('should convert date to month key', () => {
    expect(dateToMonthKey(testDate)).toBe('2024-01');
  });

  it('should convert date to year key', () => {
    expect(dateToYearKey(testDate)).toBe('2024');
  });
});

describe('Parsers', () => {
  it('should parse day key', () => {
    const result = parseDayKey('2024-01-15');
    expect(result).toEqual({ year: 2024, month: 1, day: 15 });
  });

  it('should parse week key', () => {
    const result = parseWeekKey('2024-W03');
    expect(result).toEqual({ year: 2024, week: 3 });
  });

  it('should parse month key', () => {
    const result = parseMonthKey('2024-01');
    expect(result).toEqual({ year: 2024, month: 1 });
  });

  it('should parse year key', () => {
    const result = parseYearKey('2024');
    expect(result).toBe(2024);
  });

  it('should parse date key to Date object', () => {
    const date = parseDateKey('2024-01-15');
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(15);
  });
});

describe('Date Key Conversion', () => {
  it('should convert day key to other types', () => {
    const dayKey = '2024-01-15';
    expect(isMonthKey(convertDateKey(dayKey, 'month'))).toBe(true);
    expect(isYearKey(convertDateKey(dayKey, 'year'))).toBe(true);
  });

  it('should convert month key to year key', () => {
    const monthKey = '2024-01';
    const yearKey = convertDateKey(monthKey, 'year');
    expect(yearKey).toBe('2024');
  });
});

describe('Friendly Formatting', () => {
  it('should format day keys', () => {
    const result = formatFriendlyDate('2024-01-15');
    expect(result).toContain('January');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('should format month keys', () => {
    const result = formatFriendlyDate('2024-01');
    expect(result).toBe('January 2024');
  });

  it('should format year keys', () => {
    const result = formatFriendlyDate('2024');
    expect(result).toBe('2024');
  });

  it('should format day ranges in same month', () => {
    const result = formatFriendlyDate('2024-01-15', '2024-01-20');
    expect(result).toContain('January');
    expect(result).toContain('15');
    expect(result).toContain('20');
  });
});

describe('Current Period Checks', () => {
  it('should check if today is current day', () => {
    const today = formatDateAsKey(new Date(), 'day');
    expect(isCurrentDay(today)).toBe(true);
  });

  it('should check if yesterday is not current day', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = formatDateAsKey(yesterday, 'day');
    expect(isCurrentDay(yesterdayKey)).toBe(false);
  });
});
