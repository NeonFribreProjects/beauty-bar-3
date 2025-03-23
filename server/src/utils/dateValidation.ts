import { DateTime } from 'luxon';
import { config } from '../config/timezone';

export const isSameBusinessDay = (date1: Date, date2: Date) => {
  const d1 = DateTime.fromJSDate(date1).setZone(config.businessTimezone).startOf('day');
  const d2 = DateTime.fromJSDate(date2).setZone(config.businessTimezone).startOf('day');
  return d1.equals(d2);
}; 