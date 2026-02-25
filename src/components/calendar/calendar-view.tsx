"use client";

import { useState } from "react";
import useSWR from "swr";
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfDay, endOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayView } from "./day-view";
import { WeekView } from "./week-view";
import { EmptyState } from "@/components/shared/empty-state";
import type { CalendarEvent } from "@/types/google-calendar";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface CalendarViewProps {
  connected: boolean;
}

export function CalendarView({ connected }: CalendarViewProps) {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week">("day");

  const timeMin = view === "day"
    ? startOfDay(date).toISOString()
    : startOfWeek(date).toISOString();
  const timeMax = view === "day"
    ? endOfDay(date).toISOString()
    : endOfWeek(date).toISOString();

  const { data: events = [] } = useSWR<CalendarEvent[]>(
    connected ? `/api/google/calendar?timeMin=${timeMin}&timeMax=${timeMax}` : null,
    fetcher,
    { refreshInterval: 60000 }
  );

  function navigate(dir: "prev" | "next" | "today") {
    if (dir === "today") return setDate(new Date());
    const delta = view === "day" ? 1 : 7;
    setDate(dir === "next" ? addDays(date, delta) : subDays(date, delta));
  }

  if (!connected) {
    return (
      <EmptyState
        icon={<CalendarDays className="h-12 w-12" />}
        title="Google Calendar not connected"
        description="Connect your Google Calendar in Settings to see your events here."
        action={
          <Button asChild>
            <a href="/settings/integrations">Go to Settings</a>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => navigate("today")}>Today</Button>
          <Button variant="outline" size="icon" onClick={() => navigate("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="ml-2 text-lg font-semibold">
            {format(date, view === "day" ? "EEEE, MMMM d, yyyy" : "'Week of' MMMM d, yyyy")}
          </h2>
        </div>
        <div className="flex gap-1">
          <Button
            variant={view === "day" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("day")}
          >
            Day
          </Button>
          <Button
            variant={view === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("week")}
          >
            Week
          </Button>
        </div>
      </div>

      {view === "day" ? (
        <DayView events={events} date={date} />
      ) : (
        <WeekView events={events} date={date} />
      )}
    </div>
  );
}
