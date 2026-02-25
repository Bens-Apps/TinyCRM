"use client";

import { parseISO, format, isSameDay } from "date-fns";
import { EventCard } from "./event-card";
import type { CalendarEvent } from "@/types/google-calendar";

interface DayViewProps {
  events: CalendarEvent[];
  date: Date;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

export function DayView({ events, date }: DayViewProps) {
  const dayEvents = events.filter((e) => {
    const start = e.start.dateTime ? parseISO(e.start.dateTime) : null;
    return start && isSameDay(start, date);
  });

  function getEventHour(event: CalendarEvent): number {
    if (!event.start.dateTime) return 8;
    return parseISO(event.start.dateTime).getHours();
  }

  return (
    <div className="relative">
      {HOURS.map((hour) => {
        const hourEvents = dayEvents.filter((e) => getEventHour(e) === hour);
        return (
          <div key={hour} className="flex min-h-[60px] border-b border-border">
            <div className="w-16 flex-shrink-0 py-1 pr-2 text-right text-xs text-muted-foreground">
              {format(new Date().setHours(hour, 0), "h a")}
            </div>
            <div className="flex-1 py-1 pl-2">
              <div className="space-y-1">
                {hourEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
