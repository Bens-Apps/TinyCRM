"use client";

import { useState, useRef, useEffect } from "react";
import { parseISO, format, isSameDay, startOfWeek, addDays } from "date-fns";
import { EventDetailDialog } from "./event-detail-dialog";
import type { CalendarEvent } from "@/types/google-calendar";

interface WeekViewProps {
  events: CalendarEvent[];
  date: Date;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM
const HOUR_HEIGHT = 48; // px per hour slot

export function WeekView({ events, date }: WeekViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const weekStart = startOfWeek(date);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = HOUR_HEIGHT * 2; // scroll to 8am
    }
  }, []);

  function getDayEvents(day: Date) {
    return events.filter((e) => {
      const start = e.start.dateTime ? parseISO(e.start.dateTime) : e.start.date ? new Date(e.start.date) : null;
      return start && isSameDay(start, day);
    });
  }

  function getAllDayEvents(day: Date) {
    return events.filter((e) => {
      if (e.start.dateTime) return false; // timed event
      const start = e.start.date ? new Date(e.start.date) : null;
      return start && isSameDay(start, day);
    });
  }

  function getTimedEvents(day: Date) {
    return events.filter((e) => {
      if (!e.start.dateTime) return false;
      return isSameDay(parseISO(e.start.dateTime), day);
    });
  }

  function getEventPosition(event: CalendarEvent) {
    if (!event.start.dateTime) return { top: 0, height: HOUR_HEIGHT };
    const start = parseISO(event.start.dateTime);
    const startMinutes = (start.getHours() - 6) * 60 + start.getMinutes();
    const top = (startMinutes / 60) * HOUR_HEIGHT;

    let height = HOUR_HEIGHT * 0.5; // default 30min
    if (event.end.dateTime) {
      const end = parseISO(event.end.dateTime);
      const durationMinutes = (end.getTime() - start.getTime()) / 60000;
      height = Math.max((durationMinutes / 60) * HOUR_HEIGHT, 20);
    }
    return { top, height };
  }

  return (
    <>
      {/* Day headers */}
      <div className="flex border-b border-border">
        <div className="w-14 shrink-0" />
        {days.map((day) => {
          const isToday = isSameDay(day, new Date());
          return (
            <div key={day.toISOString()} className="flex-1 py-1.5 text-center border-l border-border">
              <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
              <div className={`text-sm font-medium ${isToday ? "inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground" : ""}`}>
                {format(day, "d")}
              </div>
            </div>
          );
        })}
      </div>

      {/* All-day events row */}
      {days.some((day) => getAllDayEvents(day).length > 0) && (
        <div className="flex border-b border-border">
          <div className="w-14 shrink-0 py-1 pr-2 text-right text-[10px] text-muted-foreground">
            All day
          </div>
          {days.map((day) => {
            const allDay = getAllDayEvents(day);
            return (
              <div key={day.toISOString()} className="flex-1 border-l border-border p-0.5 space-y-0.5">
                {allDay.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="w-full rounded bg-muted/60 px-1 py-0.5 text-left text-[10px] font-medium truncate hover:bg-muted cursor-pointer border-l-2"
                    style={{ borderLeftColor: event.calendarColor ?? "hsl(var(--primary))" }}
                  >
                    {event.summary}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="overflow-y-auto" style={{ height: "calc(100vh - 240px)" }}>
        <div className="relative flex" style={{ height: HOURS.length * HOUR_HEIGHT }}>
          {/* Hour labels */}
          <div className="w-14 shrink-0 relative">
            {HOURS.map((hour, i) => (
              <div
                key={hour}
                className="absolute right-2 text-right text-xs text-muted-foreground"
                style={{ top: i * HOUR_HEIGHT - 6 }}
              >
                {format(new Date().setHours(hour, 0), "h a")}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const timed = getTimedEvents(day);
            return (
              <div key={day.toISOString()} className="flex-1 relative border-l border-border">
                {/* Hour gridlines */}
                {HOURS.map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full border-t border-border/50"
                    style={{ top: i * HOUR_HEIGHT }}
                  />
                ))}

                {/* Events */}
                {timed.map((event) => {
                  const { top, height } = getEventPosition(event);
                  const borderColor = event.calendarColor ?? "hsl(var(--primary))";
                  const startTime = event.start.dateTime
                    ? format(parseISO(event.start.dateTime), "h:mm")
                    : "";

                  return (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="absolute left-0.5 right-0.5 overflow-hidden rounded border-l-2 bg-muted/80 px-1 py-0.5 text-left hover:bg-muted cursor-pointer z-10"
                      style={{ top, height: Math.max(height, 20), borderLeftColor: borderColor }}
                    >
                      <p className="text-[10px] font-medium leading-tight truncate">{event.summary}</p>
                      {height >= 28 && (
                        <p className="text-[9px] text-muted-foreground">{startTime}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <EventDetailDialog
        event={selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      />
    </>
  );
}
