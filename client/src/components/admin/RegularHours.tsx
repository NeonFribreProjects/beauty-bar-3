import React from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { TimeField } from '@/components/ui/time-field';
import { api } from "@/lib/api";
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { DAYS_OF_WEEK, type DayOfWeek } from '@/lib/constants';

interface DayAvailability {
  dayOfWeek: DayOfWeek;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  maxBookings: number;
  breakTime: number;
}

interface RegularHoursProps {
  category: string;
}

export function RegularHours({ category }: RegularHoursProps) {
  const queryClient = useQueryClient();
  const [localAvailability, setLocalAvailability] = React.useState<DayAvailability[]>([]);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Load initial data
  const { data: serverAvailability, isLoading } = useQuery({
    queryKey: ['availability', category],
    queryFn: () => api.getAvailability(category)
  });

  // Initialize local state when server data changes
  React.useEffect(() => {
    if (serverAvailability) {
      const initialAvailability = DAYS_OF_WEEK.map((_, index) => {
        // Use the actual day number as stored in the database
        const dayNumber = index; // This now correctly maps to the DB's 0-6 Sunday-Saturday format
        const existing = serverAvailability.find(d => d.dayOfWeek === dayNumber);
        
        return {
          dayOfWeek: dayNumber as DayOfWeek,
          isAvailable: existing?.isAvailable ?? (dayNumber > 0 && dayNumber < 6), // Mon-Fri default to true
          startTime: existing?.startTime ?? "09:00",
          endTime: existing?.endTime ?? "17:00",
          maxBookings: existing?.maxBookings ?? 8,
          breakTime: existing?.breakTime ?? 15
        };
      });
      setLocalAvailability(initialAvailability);
    }
  }, [serverAvailability]);

  const updateAvailability = useMutation({
    mutationFn: async (updates: DayAvailability[]) => {
      // Only update days that have changed
      const promises = updates
        .filter(update => {
          const current = serverAvailability?.find(s => s.dayOfWeek === update.dayOfWeek);
          return !current || JSON.stringify(current) !== JSON.stringify(update);
        })
        .map(update => api.updateAvailability(category, update));
      
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['availability', category]);
      toast({ 
        title: "Success",
        description: `Regular hours updated for ${category}`
      });
      setHasChanges(false);
    },
    onError: () => {
      toast({ 
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive"
      });
    }
  });

  const handleDayUpdate = (dayIndex: number, updates: Partial<DayAvailability>) => {
    setLocalAvailability(prev => prev.map(day => 
      day.dayOfWeek === dayIndex 
        ? { ...day, ...updates }
        : day
    ));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateAvailability.mutate(localAvailability);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium">{category} Regular Hours</h3>
          <p className="text-sm text-muted-foreground">
            Set your regular working hours for {category} services
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={updateAvailability.isPending}>
            {updateAvailability.isPending ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {localAvailability.map((day, index) => (
          <Card key={DAYS_OF_WEEK[index]}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{DAYS_OF_WEEK[index]}</CardTitle>
                <Switch 
                  checked={day.isAvailable} 
                  onCheckedChange={(checked) => 
                    handleDayUpdate(index, { isAvailable: checked })
                  }
                />
              </div>
              {day.isAvailable && (
                <CardDescription>
                  Available {day.startTime} - {day.endTime}
                </CardDescription>
              )}
            </CardHeader>
            {day.isAvailable && (
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <TimeField
                    label="Start Time"
                    value={day.startTime}
                    onChange={(time) => handleDayUpdate(index, { startTime: time })}
                  />
                  <TimeField
                    label="End Time"
                    value={day.endTime}
                    onChange={(time) => handleDayUpdate(index, { endTime: time })}
                  />
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
} 