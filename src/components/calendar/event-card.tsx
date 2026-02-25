import { format, parseISO } from "date-fns";
import { Video, MapPin } from "lucide-react";
import type { CalendarEvent } from "@/types/google-calendar";

interface EventCardProps {
  event: CalendarEvent;
}

export function EventCard({ event }: EventCardProps) {
  const startTime = event.start.dateTime
    ? format(parseISO(event.start.dateTime), "h:mm a")
    : "All day";
  const endTime = event.end.dateTime
    ? format(parseISO(event.end.dateTime), "h:mm a")
    : "";

  const meetLink =
    event.hangoutLink ??
    event.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")?.uri;

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{event.summary}</p>
          <p className="text-xs text-muted-foreground">
            {startTime}
            {endTime && ` - ${endTime}`}
          </p>
        </div>
      </div>
      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
        {meetLink && (
          <a
            href={meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            <Video className="h-3 w-3" /> Join
          </a>
        )}
        {event.location && (
          <span className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3" /> {event.location}
          </span>
        )}
      </div>
    </div>
  );
}
