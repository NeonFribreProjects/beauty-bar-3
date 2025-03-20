export interface AdminAvailability {
  id: string;
  categoryId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxBookings: number;
  breakTime: number;
}

export interface TimeSlot {
  start: string;
  end: string;
} 