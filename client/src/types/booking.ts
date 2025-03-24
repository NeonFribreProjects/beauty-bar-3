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
  appointmentStart: Date;
  appointmentEnd: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  service?: {
    name: string;
    category?: {
      name: string;
    };
  };
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
  categoryId: string;
  description?: string;
} 