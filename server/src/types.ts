export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Booking {
  startTime: string;
  endTime: string;
  date: string;
  status: string;
} 