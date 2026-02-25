import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { CalendarDays } from "lucide-react";
import { IntegrationCard } from "@/components/settings/integration-card";
import { GoogleCalendarConnect } from "@/components/settings/google-calendar-connect";

export default async function IntegrationsPage() {
  const user = await requireAuth();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id! },
    select: { calendarConnected: true },
  });

  const connected = dbUser?.calendarConnected ?? false;

  return (
    <div>
      <h2 className="text-lg font-semibold">Integrations</h2>
      <p className="mb-4 text-sm text-muted-foreground">Connect external services.</p>

      <div className="space-y-4 max-w-lg">
        <GoogleCalendarConnect connected={connected} />
      </div>
    </div>
  );
}
