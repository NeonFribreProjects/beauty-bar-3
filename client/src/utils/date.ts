import { DAYS_OF_WEEK } from '@/lib/constants';

export function getAdjustedDayOfWeek(date: Date): number {
  // JavaScript's getDay() returns 0-6 where 0 is Sunday
  return date.getDay();
}

export function convertToLocalDayIndex(dayIndex: number): number {
  // Ensure the day index is within 0-6 range
  return ((dayIndex % 7) + 7) % 7;
}

export function isAvailableDay(dayIndex: number, availability: AdminAvailability[]): boolean {
  const localDayIndex = convertToLocalDayIndex(dayIndex);
  const dayAvailability = availability.find(a => a.dayOfWeek === localDayIndex);
  return dayAvailability?.isAvailable ?? false;
} 