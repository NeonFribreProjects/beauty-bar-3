import { DateTime } from 'luxon';
import type { TimeSlot } from '../types';

interface BlockedDate {
  id: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  reason: string;
  affectedServices: string[];
}

export const generateTimeSlots = (
  startTime: string,
  endTime: string,
  duration: number,
  breakTime: number,
  existingBookings: any[],
  date: string
): TimeSlot[] => {
  const bizZone = 'America/Toronto';
  const slots: TimeSlot[] = [];
  
  // Convert date to DateTime in business timezone
  const dt = DateTime.fromISO(date, { zone: bizZone });
  if (!dt.isValid) {
    throw new Error('Invalid date format');
  }
  
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  
  let currentTime = start;
  while (currentTime + duration <= end) {
    const slotStart = dt.set({
      hour: Math.floor(currentTime / 60),
      minute: currentTime % 60
    });

    const slotEnd = slotStart.plus({ minutes: duration });

    // Check if slot is booked
    const isBooked = existingBookings.some(booking => {
      const bookingStart = DateTime.fromJSDate(booking.appointmentStart, { zone: bizZone });
      return bookingStart.equals(slotStart);
    });

    if (!isBooked) {
      slots.push({
        startTime: slotStart.toFormat('HH:mm'),
        endTime: slotEnd.toFormat('HH:mm'),
        available: true
      });
    }
    
    currentTime += duration + breakTime;
  }

  return slots;
};

// Helper functions
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

function isTimeOverlapping(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = parseTime(start1);
  const e1 = parseTime(end1);
  const s2 = parseTime(start2);
  const e2 = parseTime(end2);
  return s1 < e2 && s2 < e1;
}

function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
} 