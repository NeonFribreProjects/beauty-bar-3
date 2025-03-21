export const CATEGORIES = ['Featured', 'Eyelash', 'Waxing', 'Foot Care', 'Hand Care'];

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday', 
  'Tuesday', 
  'Wednesday', 
  'Thursday', 
  'Friday', 
  'Saturday'
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const getDayIndex = (date: Date): number => {
  return date.getDay();
};

export const validateDayIndex = (index: number): boolean => {
  return index >= 0 && index <= 6;
};

export const normalizeDayIndex = (index: number): number => {
  return ((index % 7) + 7) % 7;
}; 