import { format, parseISO } from 'date-fns';

export const formatDateForAPI = (date: Date): string => {
  // Always send date in YYYY-MM-DD format, using local timezone
  return format(date, 'yyyy-MM-dd');
};

export const parseAPIDate = (dateStr: string): Date => {
  // Parse dates from API assuming they're in YYYY-MM-DD format
  return parseISO(dateStr);
}; 