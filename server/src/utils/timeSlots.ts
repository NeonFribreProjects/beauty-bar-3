import { Prisma } from '@prisma/client'
import { TimeSlot, Booking } from '../types/booking'

export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  duration: number,
  breakTime: number,
  existingBookings: Booking[]
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);

  let currentTime = new Date();
  currentTime.setHours(openHour, openMinute, 0, 0);

  const endTime = new Date();
  endTime.setHours(closeHour, closeMinute, 0, 0);

  while (currentTime < endTime) {
    const startTimeStr = currentTime.toTimeString().slice(0, 5);
    
    // Add duration to get end time
    const slotEndTime = new Date(currentTime.getTime() + duration * 60000);
    const endTimeStr = slotEndTime.toTimeString().slice(0, 5);

    // Check if slot overlaps with any existing booking
    const isAvailable = !existingBookings.some(booking => {
      const bookingStart = booking.startTime;
      const bookingEnd = booking.endTime;
      return (
        (startTimeStr >= bookingStart && startTimeStr < bookingEnd) ||
        (endTimeStr > bookingStart && endTimeStr <= bookingEnd)
      );
    });

    slots.push({
      startTime: startTimeStr,
      endTime: endTimeStr,
      available: isAvailable
    });

    // Add duration + break time for next slot
    currentTime = new Date(currentTime.getTime() + (duration + breakTime) * 60000);
  }

  return slots;
} 