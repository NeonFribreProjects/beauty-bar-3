import { BusinessHours, BlockedDate, ServiceAvailability, Booking, TimeSlot, Service } from "@/types/booking";
import type { AdminAvailability } from "@/types/admin";
import { DateTime } from "luxon";

declare global {
  interface ImportMeta {
    env: {
      DEV: boolean;
      // Add other env variables as needed
    };
  }
}

const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // Will be proxied in development
  : '/api'; // Update this for production

export const api = {
  // Business Hours
  getBusinessHours: async (): Promise<BusinessHours[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/business-hours`);
      if (!response.ok) {
        console.error(`API Error: ${response.status} - ${response.statusText}`);
        throw new Error('Failed to fetch business hours');
      }
      return response.json();
    } catch (error) {
      console.error('Business Hours Error:', error);
      throw error;
    }
  },

  // Service Availability
  getServiceAvailability: async (serviceId: string): Promise<ServiceAvailability> => {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${serviceId}/availability`);
      if (!response.ok) {
        console.error(`API Error: ${response.status} - ${response.statusText}`);
        throw new Error('Failed to fetch service availability');
      }
      return response.json();
    } catch (error) {
      console.error('Service Availability Error:', error);
      throw error;
    }
  },

  // Bookings
  createBooking: async (bookingData: {
    serviceId: string;
    date: string;
    startTime: string;
    endTime: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  }): Promise<Booking> => {
    // Convert date and times to DateTime
    const bizZone = 'America/Toronto';
    const startDateTime = DateTime.fromFormat(
      `${bookingData.date} ${bookingData.startTime}`,
      'yyyy-MM-dd HH:mm',
      { zone: bizZone }
    ).toUTC();

    const endDateTime = DateTime.fromFormat(
      `${bookingData.date} ${bookingData.endTime}`,
      'yyyy-MM-dd HH:mm',
      { zone: bizZone }
    ).toUTC();

    const response = await fetch('/api/availability/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...bookingData,
        appointmentStart: startDateTime.toJSDate(),
        appointmentEnd: endDateTime.toJSDate()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create booking');
    }
    
    return response.json();
  },

  getAvailableTimeSlots: async (serviceId: string, date: string) => {
    const response = await fetch(
      `${API_BASE_URL}/availability/services/${serviceId}/time-slots?date=${date}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch time slots');
    }
    
    return response.json();
  },

  // Admin Authentication
  adminLogin: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error('Invalid credentials');
    return response.json();
  },

  getBookings: async (): Promise<Booking[]> => {
    const response = await fetch(`${API_BASE_URL}/bookings`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch bookings');
    }
    return response.json();
  },

  updateBookingStatus: async (bookingId: string, status: string) => {
    const response = await fetch(`/api/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update booking');
    return response.json();
  },

  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  getServices: async () => {
    const response = await fetch(`${API_BASE_URL}/services`);
    if (!response.ok) throw new Error('Failed to fetch services');
    return response.json();
  },

  getService: async (id: string): Promise<Service> => {
    const response = await fetch(`${API_BASE_URL}/services/${id}`);
    if (!response.ok) throw new Error('Service not found');
    return response.json();
  },

  getAvailability: async (category: string) => {
    const response = await fetch(`${API_BASE_URL}/availability/${category}`);
    if (!response.ok) throw new Error('Failed to fetch availability');
    return response.json();
  },

  updateAvailability: async (category: string, data: AdminAvailability) => {
    const response = await fetch(`${API_BASE_URL}/availability/${category}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update availability');
    }
    
    return response.json();
  },

  getBlockedDates: async (category: string): Promise<BlockedDate[]> => {
    const response = await fetch(`${API_BASE_URL}/availability/blocked/${category}`);
    if (!response.ok) throw new Error('Failed to fetch blocked dates');
    return response.json();
  },

  blockDate: async (category: string, data: {
    date: string;
    startTime?: string;
    endTime?: string;
    isRecurring: boolean;
  }) => {
    const response = await fetch(`${API_BASE_URL}/availability/blocked/${category}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to block date');
    return response.json();
  },

  deleteBlockedDate: async (category: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/availability/blocked/${category}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to unblock date');
    return response.json();
  },

  getFeaturedServices: async () => {
    const response = await fetch(`${API_BASE_URL}/services/Featured`);
    if (!response.ok) {
      throw new Error('Failed to fetch featured services');
    }
    return response.json();
  }
}; 