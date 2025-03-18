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
import { Trash2 } from 'lucide-react';

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
      {/* Category Selection - Responsive */}
      <div className="mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto p-2 border rounded-md bg-white shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          {CATEGORIES.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Time Slots Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {availability?.map((slot, index) => (
          <div 
            key={index}
            className="flex flex-col p-4 border rounded-lg bg-gray-50"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{slot.time}</span>
              <Switch
                checked={slot.isAvailable}
                onCheckedChange={(checked) => updateAvailability.mutate({
                  dayOfWeek: slot.dayOfWeek,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  isAvailable: checked,
                  maxBookings: slot.maxBookings,
                  breakTime: slot.breakTime
                })}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="number"
                min="0"
                value={slot.maxBookings}
                onChange={(e) => updateAvailability.mutate({
                  dayOfWeek: slot.dayOfWeek,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  isAvailable: slot.isAvailable,
                  maxBookings: parseInt(e.target.value),
                  breakTime: slot.breakTime
                })}
                className="w-full"
                placeholder="Capacity"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateAvailability.mutate({
                  dayOfWeek: slot.dayOfWeek,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  isAvailable: slot.isAvailable,
                  maxBookings: slot.maxBookings,
                  breakTime: slot.breakTime
                })}
                className="w-full sm:w-auto text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons - Responsive */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex gap-3">
          <Input
            type="time"
            value={newSlotTime}
            onChange={(e) => setNewSlotTime(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleAddSlot}
            className="w-full sm:w-auto whitespace-nowrap"
          >
            Add Slot
          </Button>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 sm:flex-none"
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {updateAvailability.isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
} 