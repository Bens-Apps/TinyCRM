import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getAccountScopes, hasCalendarScope, hasGmailScope } from "@/lib/google-auth";
import { GoogleCalendarConnect } from "@/components/settings/google-calendar-connect";
import { GmailIntegrationCard } from "@/components/settings/gmail-integration-card";
import { CalendarSelection } from "@/components/settings/calendar-selection";

export default async function IntegrationsPage() {
  const user = await requireAuth();

  const [dbUser, scopes, calendars] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id! },
      select: { calendarConnected: true },
    }),
    getAccountScopes(user.id!),
    prisma.userCalendar.findMany({
      where: { userId: user.id! },
      orderBy: { name: "asc" },
    }),
  ]);

  const calendarConnected = dbUser?.calendarConnected ?? false;
  const calendarScopeGranted = hasCalendarScope(scopes);
  const gmailConnected = hasGmailScope(scopes);

  return (
    <div>
      <h2 className="text-lg font-semibold">Integrations</h2>
      <p className="mb-4 text-sm text-muted-foreground">Connect external services.</p>

      <div className="space-y-4 max-w-lg">
        <GoogleCalendarConnect connected={calendarConnected} />

        {calendarConnected && calendars.length > 0 && (
          <CalendarSelection calendars={calendars} />
        )}

        <GmailIntegrationCard connected={gmailConnected} />
      </div>
    </div>
  );
}
