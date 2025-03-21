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

// Add this new function for consistent day handling
export function adjustDayOfWeek(date: string | Date): number {
  const dayOfWeek = new Date(date).getDay();
  // JavaScript uses 0-6 (Sun-Sat), we'll keep this consistent
  return dayOfWeek;
}

export const generateTimeSlots = async (
  openTime: string,
  closeTime: string,
  serviceDuration: number,
  breakTime: number,
  existingBookings: any[],
  categoryId: string,
  date: string
) => {
  // Use the new adjustDayOfWeek function
  const dayOfWeek = adjustDayOfWeek(date);
  
  const adminAvailability = await prisma.adminAvailability.findUnique({
    where: {
      categoryId_dayOfWeek: {
        categoryId,
        dayOfWeek
      }
    }
  });

  // If admin isn't available that day, return no slots
  if (!adminAvailability?.isAvailable) {
    return [];
  }

  // 2. Use admin's working hours
  const actualOpenTime = adminAvailability.startTime;
  const actualCloseTime = adminAvailability.endTime;

  // 3. Check for blocked dates
  const blockedDate = await prisma.blockedDate.findFirst({
    where: {
      date: date,
      categoryId: categoryId
    }
  });

  if (blockedDate && !blockedDate.startTime && !blockedDate.endTime) {
    return [];
  }

  // 4. Generate slots based on service duration
  const slots: TimeSlot[] = [];
  let currentTime = parseTime(actualOpenTime);
  const endTime = parseTime(actualCloseTime);

  while (currentTime + serviceDuration <= endTime) {
    const slotStart = formatTime(currentTime);
    const slotEnd = formatTime(currentTime + serviceDuration);

    const isBlocked = blockedDate && 
      blockedDate.startTime && 
      blockedDate.endTime &&
      isTimeOverlapping(slotStart, slotEnd, blockedDate.startTime, blockedDate.endTime);
    
    const hasBooking = existingBookings.some(booking =>
      isTimeOverlapping(slotStart, slotEnd, booking.startTime, booking.endTime)
    );

    if (!isBlocked && !hasBooking) {
      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        available: true
      });
    }

    // Increment by service duration plus break time
    currentTime += serviceDuration + breakTime;
  }

  return slots;
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