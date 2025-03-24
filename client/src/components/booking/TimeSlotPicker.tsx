import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { TimeSlot } from '../../types/booking';

interface TimeSlotPickerProps {
  serviceId: string;
  date: string;
  onSelect: (slot: TimeSlot) => void;
}

export function TimeSlotPicker({ serviceId, date, onSelect }: TimeSlotPickerProps) {
  const query = useQuery<TimeSlot[]>({
    queryKey: ['timeSlots', serviceId, date],
    queryFn: () => api.getAvailableTimeSlots(serviceId, date),
    enabled: Boolean(serviceId && date),
    staleTime: 1000 * 60 * 5
  });

  const timeSlots = query.data ?? [];
  const isLoading = query.isLoading;

  // ... rest of component
} 