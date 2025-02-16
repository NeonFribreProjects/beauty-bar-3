import { BusinessHours, BlockedDate, ServiceAvailability, Booking, TimeSlot, Service } from "@/types/booking";

const API_BASE_URL = "/api"; // Update with your actual API URL

export const api = {
  // Business Hours
  getBusinessHours: async (): Promise<BusinessHours[]> => {
    const response = await fetch(`${API_BASE_URL}/business-hours`);
    return response.json();
  },

  updateBusinessHours: async (hours: BusinessHours[]): Promise<BusinessHours[]> => {
    const response = await fetch(`${API_BASE_URL}/business-hours`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hours)
    });
    return response.json();
  },

  // Blocked Dates
  getBlockedDates: async (): Promise<BlockedDate[]> => {
    const response = await fetch(`${API_BASE_URL}/blocked-dates`);
    return response.json();
  },

  updateBlockedDates: async (dates: BlockedDate[]): Promise<BlockedDate[]> => {
    const response = await fetch(`${API_BASE_URL}/blocked-dates`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dates)
    });
    return response.json();
  },

  // Service Availability
  getServiceAvailability: async (serviceId: string): Promise<ServiceAvailability> => {
    const response = await fetch(`${API_BASE_URL}/services/${serviceId}/availability`);
    return response.json();
  },

  // Bookings
  createBooking: async (booking: Omit<Booking, 'id'>): Promise<Booking> => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
    return response.json();
  },

  getAvailableTimeSlots: async (serviceId: string, date: string): Promise<TimeSlot[]> => {
    const response = await fetch(
      `${API_BASE_URL}/services/${serviceId}/time-slots?date=${date}`
    );
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

  // Admin Bookings
  getBookings: async (date?: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('Not authenticated');

    const url = date 
      ? `${API_BASE_URL}/bookings?date=${date}`
      : `${API_BASE_URL}/bookings`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  updateBookingStatus: async (bookingId: string, status: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update booking');
    return response.json();
  },

  // Admin Profile
  getAdminProfile: async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/admin/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  updateAdminProfile: async (data: { name?: string; password?: string }) => {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/admin/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  // Service Management
  getServices: async (): Promise<Service[]> => {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/services`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch services');
    return response.json();
  },

  createService: async (service: Omit<Service, 'id'>): Promise<Service> => {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(service)
    });
    if (!response.ok) throw new Error('Failed to create service');
    return response.json();
  },

  updateService: async (id: string, service: Partial<Service>): Promise<Service> => {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(service)
    });
    if (!response.ok) throw new Error('Failed to update service');
    return response.json();
  },

  deleteService: async (id: string): Promise<void> => {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete service');
  }
}; 