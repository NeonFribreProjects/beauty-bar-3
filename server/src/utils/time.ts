import { PrismaClient } from '@prisma/client';
import type { TimeSlot } from '../types';

const prisma = new PrismaClient();

interface BlockedDate {
  id: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  reason: string;
  affectedServices: string[];
}

export const generateTimeSlots = async (
  startTime: string,
  endTime: string,
  duration: number,
  breakTime: number,
  existingBookings: any[],
  categoryId: string,
  date: string
) => {
  // Ensure date is handled in UTC
  const slotDate = new Date(date);
  slotDate.setUTCHours(0, 0, 0, 0);

  // Convert times to minutes since midnight
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  const slots = [];
  let currentMinutes = startMinutes;

  while (currentMinutes + duration <= endMinutes) {
    const timeString = minutesToTime(currentMinutes);
    const isBooked = existingBookings.some(booking => booking.time === timeString);
    
    if (!isBooked) {
      slots.push({
        time: timeString,
        available: true
      });
    }
    
    currentMinutes += duration + breakTime;
  }

  return slots;
};

// Helper functions
const timeToMinutes = (time: string): number => {
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