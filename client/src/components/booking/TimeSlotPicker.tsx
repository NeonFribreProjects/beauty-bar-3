import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { api } from '../../lib/api';
import { getAdjustedDayOfWeek, isAvailableDay } from '@/utils/date';

export function TimeSlotPicker({ serviceId, date, onSelect }: TimeSlotPickerProps) {
  const { data: availability } = useQuery({
    queryKey: ['availability', serviceId],
    queryFn: () => api.getAvailability(serviceId)
  });

  const dayOfWeek = getAdjustedDayOfWeek(date);
  const isAvailable = availability ? isAvailableDay(dayOfWeek, availability) : false;

  // ... rest of the component
} 