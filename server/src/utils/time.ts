import { PrismaClient } from '@prisma/client';
import type { TimeSlot } from '../types';
import { DateTime } from 'luxon';

const prisma = new PrismaClient();

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
  existingBookings: any[]
): TimeSlot[] => {
  try {
    const slots: TimeSlot[] = [];
    
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    
    let currentTime = start;
    while (currentTime + duration <= end) {
      const timeString = minutesToTime(currentTime);
      const endTimeString = minutesToTime(currentTime + duration);
      
      const isBooked = existingBookings.some(booking => 
        booking.startTime === timeString
      );
      
      if (!isBooked) {
        slots.push({
          startTime: timeString,
          endTime: endTimeString,
          available: true
        });
      }
      
      currentTime += duration + breakTime;
    }

    return slots;
  } catch (error) {
    console.error('Error generating time slots:', error);
    return [];
  }
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