"use client";

import { format, parseISO } from "date-fns";
import { Clock, MapPin, Video, ExternalLink, CalendarDays } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CalendarEvent } from "@/types/google-calendar";

interface EventDetailDialogProps {
  event: CalendarEvent | null;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailDialog({ event, onOpenChange }: EventDetailDialogProps) {
  if (!event) return null;

  const startTime = event.start.dateTime
    ? format(parseISO(event.start.dateTime), "EEEE, MMMM d · h:mm a")
    : "All day";
  const endTime = event.end.dateTime
    ? format(parseISO(event.end.dateTime), "h:mm a")
    : "";

  const meetLink =
    event.hangoutLink ??
    event.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")?.uri;

  return (
    <Dialog open={!!event} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-start gap-3">
            {event.calendarColor && (
              <div
                className="mt-1 h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: event.calendarColor }}
              />
            )}
            <div className="min-w-0">
              <DialogTitle className="leading-snug">{event.summary}</DialogTitle>
              {event.calendarName && (
                <p className="mt-0.5 text-xs text-muted-foreground">{event.calendarName}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 px-6 py-4">
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>
              {startTime}
              {endTime && ` – ${endTime}`}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {meetLink && (
            <div className="flex items-center gap-3 text-sm">
              <Video className="h-4 w-4 text-muted-foreground shrink-0" />
              <a
                href={meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Join video call
              </a>
            </div>
          )}

          {event.description && (
            <div className="rounded-lg border bg-muted/30 p-3 mt-1">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </div>
          )}
        </div>

        {event.htmlLink && (
          <div className="border-t px-6 py-3 flex justify-end">
            <Button variant="outline" size="sm" asChild>
              <a href={event.htmlLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-3.5 w-3.5" /> Open in Google Calendar
              </a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
