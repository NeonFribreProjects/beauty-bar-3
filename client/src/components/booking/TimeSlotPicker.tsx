import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { api } from '../../lib/api';

export function TimeSlotPicker({ serviceId, date, onSelect }: TimeSlotPickerProps) {
  const { data: timeSlots = [], isLoading, error } = useQuery({
    queryKey: ['timeSlots', serviceId, date],
    queryFn: () => api.getAvailableTimeSlots(serviceId, date),
    enabled: Boolean(serviceId && date),
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
  });

  // ... rest of the component
} 