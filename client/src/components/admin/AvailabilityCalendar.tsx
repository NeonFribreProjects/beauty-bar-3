import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { TimeField } from '@/components/ui/time-field';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TimeSlot {
  start: string;
  end: string;
}

export function AvailabilityCalendar({ category }: { category: string }) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = React.useState<Date>();
  const [currentSlot, setCurrentSlot] = React.useState<TimeSlot>({
    start: '',
    end: ''
  });
  const [pendingSlots, setPendingSlots] = React.useState<TimeSlot[]>([]);

  const { data: blockedDates = [] } = useQuery({
    queryKey: ['blocked-dates', category],
    queryFn: () => api.getBlockedDates(category)
  });

  const blockDate = useMutation({
    mutationFn: (data: {
      date: string;
      startTime?: string;
      endTime?: string;
    }) => api.blockDate(category, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['blocked-dates', category]);
      toast({ title: "Success", description: "Date blocked successfully" });
      resetForm();
    }
  });

  const unblockDate = useMutation({
    mutationFn: (id: string) => api.deleteBlockedDate(category, id),
    onSuccess: () => {
      queryClient.invalidateQueries(['blocked-dates', category]);
      toast({ title: "Success", description: "Date unblocked successfully" });
    }
  });

  const blockEntireDay = useMutation({
    mutationFn: (date: string) => api.blockDate(category, { date }),
    onSuccess: () => {
      queryClient.invalidateQueries(['blocked-dates', category]);
      toast({ title: "Success", description: "Day blocked successfully" });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to block day",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setSelectedDate(undefined);
    setCurrentSlot({ start: '', end: '' });
    setPendingSlots([]);
  };

  const isFullDayBlocked = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return blockedDates.some(block => 
      block.date === dateStr && !block.startTime && !block.endTime
    );
  };

  const hasBlockedTimeSlots = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return blockedDates.some(block => 
      block.date === dateStr && block.startTime && block.endTime
    );
  };

  const getBlockedTimesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return blockedDates.filter(block => 
      block.date === dateStr && block.startTime && block.endTime
    );
  };

  const validateTimeSlot = (newSlot: TimeSlot): string | null => {
    // Check if end time is after start time
    if (newSlot.start && newSlot.end) {
      const start = parseTime(newSlot.start);
      const end = parseTime(newSlot.end);
      if (end <= start) {
        return "End time must be after start time";
      }
    }

    // Check for overlaps with existing blocked times
    const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
    const existingBlocks = blockedDates.filter(block => 
      block.date === dateStr && block.startTime && block.endTime
    );

    const hasOverlap = [...existingBlocks, ...pendingSlots].some(block => {
      const blockStart = parseTime(block.startTime || block.start);
      const blockEnd = parseTime(block.endTime || block.end);
      const newStart = parseTime(newSlot.start);
      const newEnd = parseTime(newSlot.end);
      return newStart < blockEnd && blockStart < newEnd;
    });

    if (hasOverlap) {
      return "Time slot overlaps with existing blocked times";
    }

    return null;
  };

  const addTimeSlot = () => {
    const error = validateTimeSlot(currentSlot);
    if (error) {
      toast({
        title: "Invalid Time Slot",
        description: error,
        variant: "destructive"
      });
      return;
    }

    setPendingSlots(prev => [...prev, currentSlot]);
    setCurrentSlot({ start: '', end: '' });
  };

  const saveBlockedTimes = async () => {
    if (!selectedDate) return;

    try {
      await Promise.all(
        pendingSlots.map(slot =>
          blockDate.mutateAsync({
            date: format(selectedDate, 'yyyy-MM-dd'),
            startTime: slot.start,
            endTime: slot.end
          })
        )
      );

      setPendingSlots([]);
      toast({
        title: "Success",
        description: "Time slots blocked successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to block time slots",
        variant: "destructive"
      });
    }
  };

  const handleBlockEntireDay = async () => {
    if (!selectedDate) return;

    // If there are existing time slots, show confirmation
    const existingSlots = getBlockedTimesForDate(selectedDate);
    if (existingSlots.length > 0) {
      const confirmed = window.confirm(
        "This will remove all existing blocked time slots for this day. Continue?"
      );
      if (!confirmed) return;

      // Delete existing time slots first
      try {
        await Promise.all(
          existingSlots.map(slot => unblockDate.mutateAsync(slot.id))
        );
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to remove existing time slots",
          variant: "destructive"
        });
        return;
      }
    }

    // Block the entire day
    blockEntireDay.mutate(format(selectedDate, 'yyyy-MM-dd'));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div className="order-1 sm:order-none">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={{
            'fully-blocked': isFullDayBlocked,
            'partially-blocked': hasBlockedTimeSlots
          }}
          modifiersStyles={{
            'fully-blocked': { 
              backgroundColor: 'rgb(239 68 68)',
              color: 'white',
              fontWeight: 'bold'
            },
            'partially-blocked': { 
              backgroundColor: 'rgb(249 115 22)',
              color: 'white'
            }
          }}
          className="rounded-md border w-full"
        />
        <div className="mt-4 flex flex-wrap gap-4 text-sm justify-center sm:justify-start">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-red-500" />
            <span>Fully Blocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-orange-500" />
            <span>Has Blocked Times</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6 order-2 sm:order-none">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Block Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDate && (
              <>
                {isFullDayBlocked(selectedDate) ? (
                  <div className="text-center p-4 bg-red-50 rounded-md">
                    <p className="text-red-600">This day is entirely blocked</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 border-b pb-4">
                      <span className="font-medium">Block Entire Day</span>
                      <Button
                        variant="destructive"
                        onClick={handleBlockEntireDay}
                        className="w-full sm:w-auto"
                      >
                        Block Day
                      </Button>
                    </div>

                    <div className="pt-4">
                      <h4 className="font-medium mb-4">Block Time Slots</h4>
                      <div className="space-y-4">
                        <TimeField
                          label="Start Time"
                          value={currentSlot.start}
                          onChange={time => setCurrentSlot(prev => ({ ...prev, start: time }))}
                          disabled={isFullDayBlocked(selectedDate)}
                        />
                        <TimeField
                          label="End Time"
                          value={currentSlot.end}
                          onChange={time => setCurrentSlot(prev => ({ ...prev, end: time }))}
                          disabled={isFullDayBlocked(selectedDate)}
                        />
                        <Button
                          onClick={addTimeSlot}
                          disabled={!selectedDate || !currentSlot.start || !currentSlot.end || isFullDayBlocked(selectedDate)}
                          className="w-full sm:w-auto"
                        >
                          Add Time Slot
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {pendingSlots.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Pending Time Slots:</h4>
                {pendingSlots.map((slot, index) => (
                  <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="text-sm">{slot.start} - {slot.end}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setPendingSlots(prev => prev.filter((_, i) => i !== index))}
                      className="w-full sm:w-auto"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  className="w-full mt-4"
                  onClick={saveBlockedTimes}
                >
                  Save All Time Slots
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                Blocked Times for {format(selectedDate, 'MMM dd, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isFullDayBlocked(selectedDate) ? (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span>Entire Day Blocked</span>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const block = blockedDates.find(b => 
                        b.date === format(selectedDate, 'yyyy-MM-dd') && 
                        !b.startTime && 
                        !b.endTime
                      );
                      if (block) unblockDate.mutate(block.id);
                    }}
                    className="w-full sm:w-auto"
                  >
                    Unblock Day
                  </Button>
                </div>
              ) : (
                getBlockedTimesForDate(selectedDate).map(block => (
                  <div key={block.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span>{block.startTime} - {block.endTime}</span>
                    <Button
                      variant="destructive"
                      onClick={() => unblockDate.mutate(block.id)}
                      className="w-full sm:w-auto"
                    >
                      Unblock
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
} 