import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Service } from '@/types/booking';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const formatDurationCompact = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes 
      ? `${hours} h ${remainingMinutes} mins`
      : `${hours} h`;
  };

  return (
    <Link to={`/booking/${service.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h3 className="font-semibold">{service.name}</h3>
            <div className="text-sm text-gray-500">
              {formatDurationCompact(parseInt(service.duration))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <span className="text-lg font-semibold">${service.price}</span>
          {service.discount && (
            <Badge variant="secondary">{service.discount}</Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
} 