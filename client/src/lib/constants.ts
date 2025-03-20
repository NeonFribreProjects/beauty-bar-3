export const CATEGORIES = ['Featured', 'Eyelash', 'Waxing', 'Foot Care', 'Hand Care'];

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const isDayOfWeek = (day: number): day is DayOfWeek => 
  day >= 0 && day <= 6; 