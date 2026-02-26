"use client";

import { useState, useRef, useEffect } from "react";
import { parseISO, format, isSameDay } from "date-fns";
import { EventCard } from "./event-card";
import { EventDetailDialog } from "./event-detail-dialog";
import type { CalendarEvent } from "@/types/google-calendar";

interface DayViewProps {
  events: CalendarEvent[];
  date: Date;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM

export function DayView({ events, date }: DayViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const dayEvents = events.filter((e) => {
    const start = e.start.dateTime ? parseISO(e.start.dateTime) : null;
    return start && isSameDay(start, date);
  });

  // Scroll to ~8am on mount
  useEffect(() => {
    if (scrollRef.current) {
      const hourHeight = scrollRef.current.scrollHeight / HOURS.length;
      scrollRef.current.scrollTop = hourHeight * 2; // 2 hours past 6am = 8am
    }
  }, []);

  function getEventHour(event: CalendarEvent): number {
    if (!event.start.dateTime) return 8;
    return parseISO(event.start.dateTime).getHours();
  }

  return (
    <>
      <div ref={scrollRef} className="overflow-y-auto" style={{ height: "calc(100vh - 180px)" }}>
        {HOURS.map((hour) => {
          const hourEvents = dayEvents.filter((e) => getEventHour(e) === hour);
          return (
            <div key={hour} className="flex min-h-[44px] border-b border-border">
              <div className="w-14 flex-shrink-0 py-1 pr-2 text-right text-xs text-muted-foreground">
                {format(new Date().setHours(hour, 0), "h a")}
              </div>
              <div className="flex-1 py-0.5 pl-2">
                <div className="space-y-0.5">
                  {hourEvents.map((event) => (
                    <div key={event.id} onClick={() => setSelectedEvent(event)} className="cursor-pointer">
                      <EventCard event={event} compact />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <EventDetailDialog
        event={selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      />
    </>
  );
}
