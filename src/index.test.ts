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

describe('Week Year Edge Cases', () => {
  it('should handle week spanning year boundary (Dec 31 2023 -> Jan 6 2024)', () => {
    // Dec 31, 2023 is a Sunday that starts a week containing Jan 1-6, 2024
    // This week belongs to 2024, so it should be 2024-W01
    const dec31 = new Date(2023, 11, 31); // December 31, 2023 (month is 0-indexed)
    const weekKey = dateToWeekKey(dec31);
    expect(weekKey).toBe('2024-W01');
    
    // Round-trip: parsing should return the same week start
    const parsed = parseDateKey(weekKey);
    expect(formatDateAsKey(parsed, 'day')).toBe('2023-12-31');
  });

  it('should handle Jan 1 2024 in week belonging to 2024', () => {
    // Jan 1, 2024 is a Monday in the week that started Dec 31, 2023
    const jan1 = new Date(2024, 0, 1); // January 1, 2024 (month is 0-indexed)
    const weekKey = dateToWeekKey(jan1);
    expect(weekKey).toBe('2024-W01');
  });

  it('should handle last week of 2023', () => {
    // Dec 30, 2023 is a Saturday in the last full week of 2023
    const dec30 = new Date(2023, 11, 30); // December 30, 2023 (month is 0-indexed)
    const weekKey = dateToWeekKey(dec30);
    expect(weekKey).toBe('2023-W52');
    
    // Round-trip test
    const parsed = parseDateKey(weekKey);
    const parsedWeekKey = dateToWeekKey(parsed);
    expect(parsedWeekKey).toBe('2023-W52');
  });

  it('should handle week 2 of 2024', () => {
    // Jan 7, 2024 is a Sunday starting week 2
    const jan7 = new Date(2024, 0, 7); // January 7, 2024 (month is 0-indexed)
    const weekKey = dateToWeekKey(jan7);
    expect(weekKey).toBe('2024-W02');
  });

  it('should round-trip correctly for various dates', () => {
    const testDates = [
      { date: new Date(2023, 11, 24), desc: 'Sunday, week 52 of 2023' },
      { date: new Date(2023, 11, 31), desc: 'Sunday, week 1 of 2024' },
      { date: new Date(2024, 0, 1), desc: 'Monday, week 1 of 2024' },
      { date: new Date(2024, 0, 7), desc: 'Sunday, week 2 of 2024' },
      { date: new Date(2024, 5, 15), desc: 'Middle of year' },
    ];

    testDates.forEach(({ date }) => {
      const weekKey = dateToWeekKey(date);
      const parsed = parseDateKey(weekKey);
      const roundTrip = dateToWeekKey(parsed);
      
      expect(roundTrip).toBe(weekKey);
    });
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

describe('Format Options - omitCurrent', () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  
  describe('Day keys with omitCurrent', () => {
    it('should omit month and year when omitCurrent is true for current month day', () => {
      const todayKey = formatDateAsKey(now, 'day');
      const result = formatFriendlyDate(todayKey, { omitCurrent: true });
      expect(result).toBe(currentDay.toString());
      expect(result).not.toContain(now.toLocaleString('en-US', { month: 'long' }));
      expect(result).not.toContain(currentYear.toString());
    });

    it('should omit only year when omitCurrent is true for current year but different month', () => {
      const differentMonth = currentMonth === 1 ? 2 : 1;
      const dayKey = toDayKey(currentYear, differentMonth, 15);
      const result = formatFriendlyDate(dayKey, { omitCurrent: true });
      expect(result).not.toContain(currentYear.toString());
      expect(result).toContain('15');
    });

    it('should show full date when omitCurrent is true for different year', () => {
      const dayKey = toDayKey(currentYear - 1, 6, 15);
      const result = formatFriendlyDate(dayKey, { omitCurrent: true });
      expect(result).toContain((currentYear - 1).toString());
      expect(result).toContain('June');
      expect(result).toContain('15');
    });

    it('should omit month and year when omitCurrent is "month" for current month day', () => {
      const todayKey = formatDateAsKey(now, 'day');
      const result = formatFriendlyDate(todayKey, { omitCurrent: 'month' });
      expect(result).toBe(currentDay.toString());
    });

    it('should omit only year when omitCurrent is "year" for current year', () => {
      const dayKey = toDayKey(currentYear, 6, 15);
      const result = formatFriendlyDate(dayKey, { omitCurrent: 'year' });
      expect(result).not.toContain(currentYear.toString());
      expect(result).toContain('June');
      expect(result).toContain('15');
    });

    it('should show full date when omitCurrent is "year" for different year', () => {
      const dayKey = toDayKey(currentYear - 1, 6, 15);
      const result = formatFriendlyDate(dayKey, { omitCurrent: 'year' });
      expect(result).toContain((currentYear - 1).toString());
    });
  });

  describe('Month keys with omitCurrent', () => {
    it('should omit year when omitCurrent is true for current year month', () => {
      const monthKey = formatDateAsKey(now, 'month');
      const result = formatFriendlyDate(monthKey, { omitCurrent: true });
      expect(result).not.toContain(currentYear.toString());
      expect(result).toContain(now.toLocaleString('en-US', { month: 'long' }));
    });

    it('should show full date when omitCurrent is true for different year', () => {
      const monthKey = toMonthKey(currentYear - 1, 6);
      const result = formatFriendlyDate(monthKey, { omitCurrent: true });
      expect(result).toContain((currentYear - 1).toString());
      expect(result).toContain('June');
    });

    it('should omit year when omitCurrent is "year" for current year', () => {
      const monthKey = toMonthKey(currentYear, 6);
      const result = formatFriendlyDate(monthKey, { omitCurrent: 'year' });
      expect(result).not.toContain(currentYear.toString());
      expect(result).toContain('June');
    });
  });

  describe('Week keys with omitCurrent', () => {
    it('should apply omitCurrent to expanded week range', () => {
      const weekKey = dateToWeekKey(now);
      const result = formatFriendlyDate(weekKey, { omitCurrent: true });
      expect(result).toBeTruthy();
    });
  });

  describe('Date ranges with omitCurrent', () => {
    it('should apply omitCurrent to both dates in range', () => {
      const start = toDayKey(currentYear, 6, 1);
      const end = toDayKey(currentYear, 6, 15);
      const result = formatFriendlyDate(start, end, { omitCurrent: 'year' });
      expect(result).toBeTruthy();
    });
  });
});

describe('Format Options - dateStyle', () => {
  it('should format day with short dateStyle', () => {
    const result = formatFriendlyDate('2024-06-15', { dateStyle: 'short' });
    expect(result).toBeTruthy();
    expect(result.length).toBeLessThan(20);
  });

  it('should format day with medium dateStyle', () => {
    const result = formatFriendlyDate('2024-06-15', { dateStyle: 'medium' });
    expect(result).toBeTruthy();
  });

  it('should format day with long dateStyle', () => {
    const result = formatFriendlyDate('2024-06-15', { dateStyle: 'long' });
    expect(result).toBeTruthy();
  });

  it('should format day with long dateStyle (default)', () => {
    const resultDefault = formatFriendlyDate('2024-06-15');
    const resultLong = formatFriendlyDate('2024-06-15', { dateStyle: 'long' });
    expect(resultDefault).toBe(resultLong);
  });

  it('should format day with full dateStyle including day of week', () => {
    const result = formatFriendlyDate('2024-06-15', { dateStyle: 'full' });
    expect(result).toContain('Saturday');
    expect(result).toContain('June');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('should format month with dateStyle', () => {
    const result = formatFriendlyDate('2024-06', { dateStyle: 'short' });
    expect(result).toBeTruthy();
  });

  it('should format date range with dateStyle', () => {
    const result = formatFriendlyDate('2024-06-01', '2024-06-15', { dateStyle: 'short' });
    expect(result).toBeTruthy();
  });
});

describe('Format Options - combined', () => {
  const now = new Date();
  const currentYear = now.getFullYear();

  describe('omitCurrent with different dateStyles for days', () => {
    it('should use long month format with dateStyle: long (default)', () => {
      const dayKey = toDayKey(currentYear, 6, 15);
      const result = formatFriendlyDate(dayKey, { omitCurrent: 'year', dateStyle: 'long' });
      expect(result).toBe('June 15'); // month: 'long'
    });

    it('should use short month format with dateStyle: medium', () => {
      const dayKey = toDayKey(currentYear, 6, 15);
      const result = formatFriendlyDate(dayKey, { omitCurrent: 'year', dateStyle: 'medium' });
      expect(result).toBe('Jun 15'); // month: 'short'
    });

    it('should use numeric month format with dateStyle: short', () => {
      const dayKey = toDayKey(currentYear, 6, 15);
      const result = formatFriendlyDate(dayKey, { omitCurrent: 'year', dateStyle: 'short' });
      expect(result).toBe('6/15'); // month: 'numeric'
    });

    it('should use long month format with dateStyle: full', () => {
      const dayKey = toDayKey(currentYear, 6, 15);
      const result = formatFriendlyDate(dayKey, { omitCurrent: 'year', dateStyle: 'full' });
      expect(result).toBe('June 15'); // month: 'long' (same as long for individual parts)
    });
  });

  describe('omitCurrent with different dateStyles for months', () => {
    it('should use long month format with dateStyle: long (default)', () => {
      const monthKey = toMonthKey(currentYear, 6);
      const result = formatFriendlyDate(monthKey, { omitCurrent: 'year', dateStyle: 'long' });
      expect(result).toBe('June');
    });

    it('should use short month format with dateStyle: medium', () => {
      const monthKey = toMonthKey(currentYear, 6);
      const result = formatFriendlyDate(monthKey, { omitCurrent: 'year', dateStyle: 'medium' });
      expect(result).toBe('Jun');
    });

    it('should use numeric month format with dateStyle: short', () => {
      const monthKey = toMonthKey(currentYear, 6);
      const result = formatFriendlyDate(monthKey, { omitCurrent: 'year', dateStyle: 'short' });
      expect(result).toBe('6');
    });
  });

  describe('omitCurrent: true with different dateStyles', () => {
    it('should omit month and show just day with dateStyle: long', () => {
      const today = dateToDayKey(now);
      const result = formatFriendlyDate(today, { omitCurrent: true, dateStyle: 'long' });
      expect(result).toBe(now.getDate().toString());
    });

    it('should omit month and show just day with dateStyle: short', () => {
      const today = dateToDayKey(now);
      const result = formatFriendlyDate(today, { omitCurrent: true, dateStyle: 'short' });
      expect(result).toBe(now.getDate().toString());
    });
  });

  describe('month ranges with different dateStyles', () => {
    it('should use long month format with dateStyle: long (default)', () => {
      const result = formatFriendlyDate('2024-01', '2024-03', { dateStyle: 'long' });
      // Verify it uses long month names
      expect(result).toContain('January');
      expect(result).toContain('March');
      expect(result).toContain('2024');
    });

    it('should use short month format with dateStyle: medium', () => {
      const result = formatFriendlyDate('2024-01', '2024-03', { dateStyle: 'medium' });
      // Verify it uses short month names
      expect(result).toContain('Jan');
      expect(result).toContain('Mar');
      expect(result).toContain('2024');
    });

    it('should use numeric month format with dateStyle: short', () => {
      const result = formatFriendlyDate('2024-01', '2024-03', { dateStyle: 'short' });
      // Verify it uses numeric months with year
      expect(result).toContain('1/2024');
      expect(result).toContain('3/2024');
    });
  });

  it('should work with date ranges and both options', () => {
    const start = toDayKey(currentYear, 6, 1);
    const end = toDayKey(currentYear, 6, 15);
    const result = formatFriendlyDate(start, end, { omitCurrent: 'year', dateStyle: 'medium' });
    expect(result).toBeTruthy();
  });
});
