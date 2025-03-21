import { addDays, startOfWeek } from 'date-fns';

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
] as const;

// Convert frontend index (0-6) to backend index (0-6)
export const toBackendDayIndex = (frontendIndex: number): number => {
  return frontendIndex % 7;
};

// Convert backend index (0-6) to frontend index (0-6)
export const toFrontendDayIndex = (backendIndex: number): number => {
  return backendIndex % 7;
};

// Validate day index
export const isValidDayIndex = (index: number): boolean => {
  return index >= 0 && index <= 6;
};

// Get day name from index
export const getDayName = (index: number): string => {
  return DAYS_OF_WEEK[toFrontendDayIndex(index)];
}; 