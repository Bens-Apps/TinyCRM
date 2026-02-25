"use client";

import { parseISO, format, isSameDay, startOfWeek, addDays } from "date-fns";
import { EventCard } from "./event-card";
import type { CalendarEvent } from "@/types/google-calendar";

interface WeekViewProps {
  events: CalendarEvent[];
  date: Date;
}

export function WeekView({ events, date }: WeekViewProps) {
  const weekStart = startOfWeek(date);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function getDayEvents(day: Date) {
    return events.filter((e) => {
      const start = e.start.dateTime ? parseISO(e.start.dateTime) : e.start.date ? new Date(e.start.date) : null;
      return start && isSameDay(start, day);
    });
  }

  return (
    <div className="grid grid-cols-7 gap-px bg-border">
      {days.map((day) => {
        const dayEvents = getDayEvents(day);
        const isToday = isSameDay(day, new Date());

        return (
          <div key={day.toISOString()} className="min-h-[200px] bg-card p-2">
            <div className="mb-2 text-center">
              <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
              <div className={`text-sm font-medium ${isToday ? "flex h-7 w-7 mx-auto items-center justify-center rounded-full bg-primary text-primary-foreground" : ""}`}>
                {format(day, "d")}
              </div>
            </div>
            <div className="space-y-1">
              {dayEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
