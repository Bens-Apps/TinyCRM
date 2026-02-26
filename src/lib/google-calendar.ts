import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { getGoogleOAuth2Client } from "@/lib/google-auth";
import type { CalendarEvent } from "@/types/google-calendar";

export async function getGoogleCalendarClient(userId: string) {
  const oauth2Client = await getGoogleOAuth2Client(userId);
  if (!oauth2Client) return null;
  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function listUserCalendars(userId: string) {
  const calendar = await getGoogleCalendarClient(userId);
  if (!calendar) return [];

  try {
    const response = await calendar.calendarList.list();
    return (response.data.items ?? []).map((cal) => ({
      id: cal.id!,
      summary: cal.summary ?? "Untitled",
      backgroundColor: cal.backgroundColor ?? "#4285f4",
      primary: cal.primary ?? false,
    }));
  } catch {
    return [];
  }
}

export async function getCalendarEvents(
  userId: string,
  timeMin: string,
  timeMax: string
): Promise<CalendarEvent[]> {
  const calendar = await getGoogleCalendarClient(userId);
  if (!calendar) return [];

  // Get user's selected calendars
  const userCalendars = await prisma.userCalendar.findMany({
    where: { userId, enabled: true },
  });

  // If no calendars configured, fall back to primary
  const calendarIds =
    userCalendars.length > 0
      ? userCalendars.map((c) => c.calendarId)
      : ["primary"];

  try {
    const results = await Promise.all(
      calendarIds.map(async (calendarId) => {
        try {
          const response = await calendar.events.list({
            calendarId,
            timeMin,
            timeMax,
            singleEvents: true,
            orderBy: "startTime",
            maxResults: 100,
          });

          const calendarMeta = userCalendars.find(
            (c) => c.calendarId === calendarId
          );

          return (response.data.items ?? []).map((event) => ({
            ...event,
            calendarColor: calendarMeta?.color ?? "#4285f4",
            calendarName: calendarMeta?.name ?? "Primary",
          })) as CalendarEvent[];
        } catch {
          return [] as CalendarEvent[];
        }
      })
    );

    return results
      .flat()
      .sort((a, b) => {
        const aTime = a.start.dateTime ?? a.start.date ?? "";
        const bTime = b.start.dateTime ?? b.start.date ?? "";
        return aTime.localeCompare(bTime);
      });
  } catch {
    return [];
  }
}
