export interface AdminAvailability {
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  maxBookings: number;
  breakTime: number;
} 