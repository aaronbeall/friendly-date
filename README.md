# `friendly-dates`

A type-safe date handling library that preserves temporal resolution through ISO-compatible string keys, with built-in internationalized formatting.

## What Problem Does This Solve?

### 1. Resolution-Aware Date Representation

Instead of using `Date` objects or timestamps that lose information about intended granularity, this library uses typed string keys that encode both the date value AND its resolution:

- `DayKey`: `"2024-11-25"` - A specific day
- `MonthKey`: `"2024-11"` - An entire month  
- `WeekKey`: `"2024-W47"` - A locale-based week (Sunday-Saturday by default)
- `YearKey`: `"2024"` - An entire year
- `DateKey`: `YearKey | MonthKey | WeekKey | DayKey`

The key concept is to no longer see ambiguous `string` or `number` or `Date` in your data model, but instead specific 
`DayKey` or `MonthKey` or `WeekKey` or `YearKey` or `DateKey` which forces you to handle resolution explicitly.

This prevents bugs from accidentally treating a month-level date as a day-level date, while keeping storage simple (just ISO derived strings).

### 2. Smart, Context-Aware Date Formatting

Provides human-friendly formatting that:

- **Intelligently handles date ranges** - Omits redundant year/month info (e.g., `"June 1 – 15, 2024"` instead of `"June 1, 2024 – June 15, 2024"`)
- **Supports "omit current" logic** - Shows just `"June 17"` for today instead of `"June 17, 2026"`
- **Leverages native `Intl.DateTimeFormat`** - Proper internationalization support
- **Works seamlessly with typed date keys** - No manual resolution handling needed

**In essence:** A thin, type-safe layer over ISO date strings that makes it easy to work with dates at different resolutions while providing excellent formatting out of the box.

The library is particularly useful for applications that display dates in various contexts (calendars, date pickers, reports, analytics) where you need to maintain clarity about whether you're working with a specific day, a whole month, or a year.

## Features

- **Type-safe date keys**: `YearKey`, `MonthKey`, `WeekKey`, `DayKey` with template literal types
- **Type guards**: `isDayKey()`, `isWeekKey()`, `isMonthKey()`, `isYearKey()`
- **Builders**: Create date keys from numbers with `toDayKey()`, `toWeekKey()`, etc.
- **Converters**: Convert between `Date` objects and date keys
- **Formatters**: Human-friendly date formatting with `formatFriendlyDate()`
- **Comparisons**: Check if a date key represents the current period
- **Full TypeScript support**: Overloaded functions with proper return type inference

## Installation

```bash
npm install friendly-dates date-fns
```

Note: `date-fns` is a peer dependency and must be installed separately.

## Usage

### Type Definitions

```typescript
import type { YearKey, MonthKey, WeekKey, DayKey, DateKey } from 'friendly-dates';

// YearKey: `${number}` (e.g., "2024")
// MonthKey: `${number}-${number}` (e.g., "2024-01")
// WeekKey: `${number}-W${number}` (e.g., "2024-W01")
// DayKey: `${number}-${number}-${number}` (e.g., "2024-01-15")
// DateKey: YearKey | MonthKey | WeekKey | DayKey
```

### Type Guards

```typescript
import { isDayKey, isWeekKey, isMonthKey, isYearKey } from 'friendly-dates';

const key = '2024-01-15';
if (isDayKey(key)) {
  // TypeScript knows key is DayKey here
}
```

### Building Date Keys

```typescript
import { toDayKey, toWeekKey, toMonthKey, toYearKey } from 'friendly-dates';

const day = toDayKey(2024, 1, 15);      // "2024-01-15"
const week = toWeekKey(2024, 3);        // "2024-W03"
const month = toMonthKey(2024, 1);      // "2024-01"
const year = toYearKey(2024);           // "2024"
```

### Converting Dates

```typescript
import { dateToDayKey, dateToWeekKey, formatDateAsKey } from 'friendly-dates';

const date = new Date('2024-01-15');

const dayKey = dateToDayKey(date);      // "2024-01-15"
const weekKey = dateToWeekKey(date);    // "2024-W03"

// Or use the generic formatter with type inference
const monthKey = formatDateAsKey(date, 'month'); // MonthKey
```

#### Understanding Week Keys

Week keys use **locale-based week numbering** with **week years**:

- **Week boundaries**: Sunday-Saturday by default (locale-dependent)
- **Week year**: The year a week belongs to, which may differ from the calendar year
- **Week numbering**: Weeks are numbered 1-53 based on which year they primarily belong to

**Important:** A week that spans two calendar years belongs to the year containing the majority of its days.

**Example:**
```typescript
// December 31, 2023 is a Sunday that starts a week containing Jan 1-6, 2024
const dec31 = new Date('2023-12-31');
dateToWeekKey(dec31);  // "2024-W01" (not "2023-W01")

// This week belongs to 2024 because most of its days are in 2024
// The week runs: Dec 31 (Sun) - Jan 6 (Sat)
```

This ensures that week keys round-trip correctly:
```typescript
const weekKey = dateToWeekKey(new Date('2023-12-31')); // "2024-W01"
const parsed = parseDateKey(weekKey);                   // Returns Dec 31, 2023
dateToWeekKey(parsed);                                  // "2024-W01" ✓
```

### Parsing Date Keys

```typescript
import { parseDateKey, parseDayKey, parseDateKeyToParts } from 'friendly-dates';

// Parse to Date object (returns start of period)
const date = parseDateKey('2024-01-15');

// Parse to components
const { year, month, day } = parseDayKey('2024-01-15');

// Parse any date key to parts
const parts = parseDateKeyToParts('2024-W03'); // { year: 2024, week: 3 }
```

### Converting Between Date Key Types

```typescript
import { convertDateKey } from 'friendly-dates';

const dayKey = '2024-01-15';
const weekKey = convertDateKey(dayKey, 'week');   // "2024-W03"
const monthKey = convertDateKey(dayKey, 'month'); // "2024-01"
const yearKey = convertDateKey(dayKey, 'year');   // "2024"
```

### Friendly Formatting

```typescript
import { formatFriendlyDate } from 'friendly-dates';

// Single dates
formatFriendlyDate('2024-01-15');    // "January 15, 2024"
formatFriendlyDate('2024-01');       // "January 2024"
formatFriendlyDate('2024-W03');      // "January 14 – 20, 2024" (week range)
formatFriendlyDate('2024');          // "2024"

// Date ranges (smart redundancy elimination)
formatFriendlyDate('2024-01-15', '2024-01-20'); // "January 15 – 20, 2024"
formatFriendlyDate('2024-01', '2024-03');       // "January – March 2024"
formatFriendlyDate('2024-W01', '2024-W03');     // "January 14 – 20, 2024" (week range)

// With options
const now = new Date();
const today = dateToDayKey(now);

// Omit current context
formatFriendlyDate(today, { omitCurrent: true });              // "17" (just the day)
formatFriendlyDate('2026-06-15', { omitCurrent: 'year' });    // "June 15" (omit current year)

// Different date styles
formatFriendlyDate('2024-06-15', { dateStyle: 'full' });      // "Saturday, June 15, 2024"
formatFriendlyDate('2024-06-15', { dateStyle: 'long' });      // "June 15, 2024" (default)
formatFriendlyDate('2024-06-15', { dateStyle: 'medium' });    // "Jun 15, 2024"
formatFriendlyDate('2024-06-15', { dateStyle: 'short' });     // "6/15/24"
```

### Current Period Checks

```typescript
import { isCurrentDay, isCurrentWeek, isCurrentPeriod } from 'friendly-dates';

const today = dateToDayKey(new Date());

isCurrentDay(today);           // true
isCurrentWeek(today);          // true
isCurrentPeriod(today);        // true (checks based on key type)
isCurrentPeriod(today, 'week'); // true (checks specific period)
```

## API Reference

### Types

- `YearKey`: Template literal type for year keys (e.g., `"2024"`)
- `MonthKey`: Template literal type for month keys (e.g., `"2024-01"`)
- `WeekKey`: Template literal type for ISO week keys (e.g., `"2024-W03"`)
- `DayKey`: Template literal type for day keys (e.g., `"2024-01-15"`)
- `DateKey`: Union of all date key types
- `DateKeyType`: Literal type `'day' | 'week' | 'month' | 'year'`

### Type Guards

- `isDayKey(key: DateKey): key is DayKey`
- `isWeekKey(key: DateKey): key is WeekKey`
- `isMonthKey(key: DateKey): key is MonthKey`
- `isYearKey(key: DateKey): key is YearKey`

### Builders

- `toDayKey(year: number, month: number, day: number): DayKey`
- `toWeekKey(year: number, week: number): WeekKey`
- `toMonthKey(year: number, month: number): MonthKey`
- `toYearKey(year: number): YearKey`

### Converters

- `dateToDayKey(date: Date): DayKey`
- `dateToWeekKey(date: Date): WeekKey`
- `dateToMonthKey(date: Date): MonthKey`
- `dateToYearKey(date: Date): YearKey`
- `formatDateAsKey(date: Date, type: DateKeyType): DateKey` (overloaded for type inference)
- `parseDateKey(key: DateKey): Date`
- `parseDayKey(dayKey: DayKey): { year: number; month: number; day: number }`
- `parseWeekKey(weekKey: WeekKey): { year: number; week: number }`
- `parseMonthKey(monthKey: MonthKey): { year: number; month: number }`
- `parseYearKey(yearKey: YearKey): number`
- `parseDateKeyToParts(dateKey: DateKey): { year: number; month?: number; day?: number; week?: number }`
- `convertDateKey(dateKey: DateKey, targetType: DateKeyType): DateKey` (overloaded)
- `getDateKeyType(key: DateKey): DateKeyType`

### Formatters

- `formatFriendlyDate(date: DateKey, options?: FormatFriendlyDateOptions): string`
- `formatFriendlyDate(start: DateKey, end: DateKey, options?: FormatFriendlyDateOptions): string`

**Options:**
- `omitCurrent?: boolean | 'year' | 'month'` - Omit current year/month from output
  - `true`: Auto-detects based on date key type (month for days, year for months)
  - `'year'`: Omits year if it matches current year
  - `'month'`: Omits month & year if it matches current month
- `dateStyle?: 'full' | 'long' | 'medium' | 'short'` - Date formatting style (default: `'long'`)

### Comparisons

- `isCurrentDay(dateKey: DateKey): boolean`
- `isCurrentWeek(dateKey: DateKey): boolean`
- `isCurrentMonth(dateKey: DateKey): boolean`
- `isCurrentYear(dateKey: DateKey): boolean`
- `isCurrentPeriod(dateKey: DateKey, period?: DateKeyType): boolean`

## License

MIT
