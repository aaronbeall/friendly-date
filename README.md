# friendly-dates

Type-safe ISO-derived date keys for TypeScript with utilities for parsing, formatting, and converting between day, week, month, and year keys.

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
formatFriendlyDate('2024-W03');      // "January 14-20, 2024" (week range)
formatFriendlyDate('2024');          // "2024"

// Date ranges
formatFriendlyDate('2024-01-15', '2024-01-20'); // "January 15-20, 2024"
formatFriendlyDate('2024-01', '2024-03');       // "January – March 2024"
formatFriendlyDate('2024-W01', '2024-W03');     // Week range formatted as days
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

- `formatFriendlyDate(date: DateKey): string`
- `formatFriendlyDate(start: DateKey, end: DateKey): string`

### Comparisons

- `isCurrentDay(dateKey: DateKey): boolean`
- `isCurrentWeek(dateKey: DateKey): boolean`
- `isCurrentMonth(dateKey: DateKey): boolean`
- `isCurrentYear(dateKey: DateKey): boolean`
- `isCurrentPeriod(dateKey: DateKey, period?: DateKeyType): boolean`

## License

MIT
