export const CATEGORIES = ['Featured', 'Eyelash', 'Waxing', 'Foot Care', 'Hand Care'];

export const DAYS_OF_WEEK = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 0
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

// Convert JavaScript's Sunday-based (0-6) to our Monday-based (1-7) system
export function convertJSDayToAppDay(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}

// Convert our Monday-based (1-7) to JavaScript's Sunday-based (0-6) system
export function convertAppDayToJSDay(appDay: number): number {
  return appDay === 7 ? 0 : appDay;
}

// Helper function to convert between display order and storage order
export function displayToStorageDay(displayIndex: number): number {
  // Convert from Monday-first (0-6) to Sunday-first (0-6)
  return (displayIndex + 1) % 7;
}

export function storageToDayDisplay(storageIndex: number): number {
  // Convert from Sunday-first (0-6) to Monday-first (0-6)
  return (storageIndex + 6) % 7;
} 