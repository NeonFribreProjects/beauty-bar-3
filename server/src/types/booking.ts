// Add specific type for time slots parameters
interface TimeSlotGenerationParams {
  openTime: string;
  closeTime: string;
  serviceDuration: number;
  breakTime: number;
  existingBookings: Booking[];
  categoryId: string;
  date: string;
}

// Use the interface in the function
export const generateTimeSlots = async (params: TimeSlotGenerationParams): Promise<TimeSlot[]> => {
  const { openTime, closeTime, serviceDuration, breakTime, existingBookings } = params;
  
  const slots = [];
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);

  let currentTime = new Date();
  currentTime.setHours(openHour, openMinute, 0, 0);

  const endTime = new Date();
  endTime.setHours(closeHour, closeMinute, 0, 0);

  while (currentTime < endTime) {
    const startTimeStr = currentTime.toTimeString().slice(0, 5);
    const slotEndTime = new Date(currentTime.getTime() + serviceDuration * 60000);
    const endTimeStr = slotEndTime.toTimeString().slice(0, 5);

    const isAvailable = !existingBookings.some(booking => 
      (startTimeStr >= booking.startTime && startTimeStr < booking.endTime) ||
      (endTimeStr > booking.startTime && endTimeStr <= booking.endTime)
    );

    slots.push({
      startTime: startTimeStr,
      endTime: endTimeStr,
      available: isAvailable
    });

    currentTime = new Date(currentTime.getTime() + (serviceDuration + breakTime) * 60000);
  }

  return slots;
};

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Booking {
  startTime: string;
  endTime: string;
} 