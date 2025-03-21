export const CATEGORIES = ['Featured', 'Eyelash', 'Waxing', 'Foot Care', 'Hand Care'];

export const DAYS_OF_WEEK = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
  SATURDAY: 5,
  SUNDAY: 6
} as const;

export const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[keyof typeof DAYS_OF_WEEK];

// Helper function to convert between display order and storage order
export function displayToStorageDay(displayIndex: number): number {
  // Convert from Monday-first (0-6) to Sunday-first (0-6)
  return (displayIndex + 1) % 7;
}

export function storageToDayDisplay(storageIndex: number): number {
  // Convert from Sunday-first (0-6) to Monday-first (0-6)
  return (storageIndex + 6) % 7;
} 