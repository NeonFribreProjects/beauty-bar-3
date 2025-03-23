import { DateTime } from 'luxon';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

interface CalendarWrapperProps {
  availability: Array<{
    startTime: string;
    endTime: string;
  }>;
}

export const CalendarWrapper = ({ availability }: CalendarWrapperProps) => {
  const convertToTorontoTime = (isoString: string) => 
    DateTime.fromISO(isoString, { zone: 'utc' })
      .setZone('America/Toronto')
      .toJSDate();

  const events = availability.map(avail => ({
    start: convertToTorontoTime(avail.startTime),
    end: convertToTorontoTime(avail.endTime),
    title: 'Available'
  }));

  return (
    <FullCalendar
      events={events}
      timeZone="America/Toronto"
      plugins={[dayGridPlugin, timeGridPlugin]}
      initialView="timeGridWeek"
    />
  );
}; 