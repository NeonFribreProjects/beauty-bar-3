import { format } from 'date-fns-tz';

export const businessTimezone = 'America/Toronto';

export const formatForDB = (date: Date): string => 
  format(date, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: 'UTC' });

export const formatForClient = (date: Date): string => 
  format(date, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: businessTimezone });

export const isSameBusinessDay = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1).toLocaleString('en-US', { timeZone: businessTimezone });
  const d2 = new Date(date2).toLocaleString('en-US', { timeZone: businessTimezone });
  return d1.split(',')[0] === d2.split(',')[0];
}; 