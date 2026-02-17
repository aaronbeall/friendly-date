export type YearKey = `${number}`;
export type MonthKey = `${number}-${number}`;
export type WeekKey = `${number}-W${number}`;
export type DayKey = `${number}-${number}-${number}`;

export type DateKey = YearKey | MonthKey | WeekKey | DayKey;

export type DateKeyType = 'day' | 'week' | 'month' | 'year';
