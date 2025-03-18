import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { XIcon, CheckIcon } from 'lucide-react';

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
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-semibold">Manage Availability</h2>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto p-2 border rounded-md"
        >
          {CATEGORIES.filter(cat => cat !== 'Featured').map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {availability?.map((slot, index) => (
          <div
            key={index}
            className="flex flex-col p-4 border rounded-lg bg-gray-50"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3">
              <span className="font-medium">{slot.time}</span>
              <Badge variant={slot.available ? 'success' : 'destructive'}>
                {slot.available ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
            
            <div className="flex flex-col gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAvailabilityToggle(slot.time)}
                className={cn(
                  "w-full justify-center",
                  slot.available 
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-green-50 text-green-600 hover:bg-green-100"
                )}
              >
                {slot.available ? (
                  <>
                    <XIcon className="w-4 h-4 mr-2" />
                    Mark Unavailable
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Mark Available
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6 border-t pt-6">
        <Button
          variant="outline"
          onClick={handleMarkAllAvailable}
          className="w-full sm:w-auto justify-center bg-green-50 text-green-600 hover:bg-green-100"
        >
          <CheckIcon className="w-4 h-4 mr-2" />
          Mark All Available
        </Button>
        <Button
          variant="outline"
          onClick={handleMarkAllUnavailable}
          className="w-full sm:w-auto justify-center bg-red-50 text-red-600 hover:bg-red-100"
        >
          <XIcon className="w-4 h-4 mr-2" />
          Mark All Unavailable
        </Button>
      </div>

      <Toaster />
    </div>
  );
} 