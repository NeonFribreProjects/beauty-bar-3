import { format } from 'date-fns-tz';

export const config = {
  businessTimezone: 'America/Toronto',
  formatForDB: (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: 'UTC' }),
  formatForClient: (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm:ssXXX", { 
    timeZone: 'America/Toronto' 
  })
}; 