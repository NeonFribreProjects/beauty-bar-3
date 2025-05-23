import React from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { TimeField } from '@/components/ui/time-field';
import { api } from "@/lib/api";
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DayAvailability {
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  maxBookings: number;
  breakTime: number;
}

interface AdminAvailability {
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
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
        const existing = serverAvailability.find((d: AdminAvailability) => d.dayOfWeek === index);
        return {
          dayOfWeek: index,
          isAvailable: existing?.isAvailable ?? index < 5, // Mon-Fri default to true
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
          const current = serverAvailability?.find((s: AdminAvailability) => s.dayOfWeek === update.dayOfWeek);
          return !current || JSON.stringify(current) !== JSON.stringify(update);
        })
        .map(update => api.updateAvailability(category, update));
      
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', category] });
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

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const handleSaveAvailability = async (dayIndex: number, data: any) => {
    try {
      const dayName = dayNames[dayIndex];
      const response = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          dayOfWeek: dayName,
          categoryId: category
        })
      });
      // ... rest of save logic
    } catch (error) {
      console.error('Error saving availability:', error);
    }
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
                  onCheckedChange={(checked: boolean) => handleDayUpdate(index, { isAvailable: checked })}
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