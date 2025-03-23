import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TimeSlot } from '@/types/booking';

interface TimeSlotPickerProps {
  serviceId: string;
  date: Date;
  onSelect: (slot: TimeSlot) => void;
}

export function TimeSlotPicker({ serviceId, date, onSelect }: TimeSlotPickerProps) {
  const { data: timeSlots = [], isLoading, error } = useQuery({
    queryKey: ['timeSlots', serviceId, date],
    queryFn: () => api.getAvailableTimeSlots(
      serviceId,
      date.toISOString().split('T')[0] // Format as YYYY-MM-DD
    ),
    enabled: Boolean(serviceId && date),
    staleTime: 1000 * 60 * 5,
  });

  // ... rest of the component
} 