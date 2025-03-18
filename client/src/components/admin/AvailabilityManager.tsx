import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select';
import { api } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";
import { Button } from '@/components/ui/button';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { RegularHours } from './RegularHours';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface AvailabilityForm {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxBookings: number;
  breakTime: number;
}

export function AvailabilityManager() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [view, setView] = useState<'regular' | 'blocks'>('regular');
  
  const { data: availability } = useQuery({
    queryKey: ['availability', selectedCategory],
    queryFn: () => api.getAvailability(selectedCategory)
  });

  const updateAvailability = useMutation({
    mutationFn: (data: AvailabilityForm) => 
      api.updateAvailability(selectedCategory, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['availability']);
      toast({ title: "Availability updated" });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Availability</h2>
        <div className="space-x-4">
          <Button
            variant={view === 'regular' ? 'default' : 'outline'}
            onClick={() => setView('regular')}
          >
            Regular Hours
          </Button>
          <Button
            variant={view === 'blocks' ? 'default' : 'outline'}
            onClick={() => setView('blocks')}
          >
            Block Times
          </Button>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {view === 'regular' ? (
        <RegularHours category={selectedCategory} />
      ) : (
        <AvailabilityCalendar category={selectedCategory} />
      )}
    </div>
  );
} 