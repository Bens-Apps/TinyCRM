"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toggleCalendar, refreshCalendarList } from "@/actions/settings";
import { toast } from "sonner";

interface UserCalendar {
  id: string;
  calendarId: string;
  name: string;
  color: string;
  enabled: boolean;
}

interface CalendarSelectionProps {
  calendars: UserCalendar[];
}

export function CalendarSelection({ calendars }: CalendarSelectionProps) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState(calendars);

  async function handleToggle(calendarId: string, enabled: boolean) {
    setOptimistic((prev) =>
      prev.map((c) => (c.calendarId === calendarId ? { ...c, enabled } : c))
    );
    startTransition(async () => {
      const result = await toggleCalendar(calendarId, enabled);
      if (!result.success) toast.error(result.error);
    });
  }

  async function handleRefresh() {
    startTransition(async () => {
      const result = await refreshCalendarList();
      if (result.success) toast.success("Calendar list refreshed");
      else toast.error(result.error);
    });
  }

  if (calendars.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base">Calendar Selection</CardTitle>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Choose which calendars to display.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleRefresh}
          disabled={isPending}
          title="Refresh calendar list"
        >
          <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {optimistic.map((cal) => (
          <div
            key={cal.calendarId}
            className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: cal.color }}
              />
              <span className="text-sm">{cal.name}</span>
            </div>
            <Switch
              checked={cal.enabled}
              onCheckedChange={(checked: boolean) =>
                handleToggle(cal.calendarId, checked)
              }
              disabled={isPending}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
