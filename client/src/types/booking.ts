export interface BusinessHours {
  id: string;
  dayOfWeek: number;  // 0-6 (Sunday-Saturday)
  openTime: string;   // "09:00"
  closeTime: string;  // "17:00"
  isOpen: boolean;
}

export interface ServiceAvailability {
  id: string;
  serviceId: string;
  duration: number;     // in minutes
  breakTime: number;    // buffer time between appointments
  maxBookingsPerDay: number;
  daysAvailable: number[];  // [1,2,3,4,5] for Mon-Fri
}

export interface BlockedDate {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  reason: string;
  isRecurring: boolean;
  recurringDay?: number;
  affectedServices: string[];
}

export interface Booking {
  id: string;
  serviceId: string;
  service: Service;
  customerId: string;
  date: string;        // "2024-03-20"
  startTime: string;   // "14:30"
  endTime: string;     // "15:30"
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  discount?: string;
  category: {
    id: string;
    name: string;
  };
} 