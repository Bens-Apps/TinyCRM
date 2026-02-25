"use client";

import { CalendarDays } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { connectGoogleCalendar, disconnectGoogleCalendar } from "@/actions/settings";
import { toast } from "sonner";

interface GoogleCalendarConnectProps {
  connected: boolean;
}

export function GoogleCalendarConnect({ connected }: GoogleCalendarConnectProps) {
  async function handleConnect() {
    const result = await connectGoogleCalendar();
    if (result.success) toast.success("Google Calendar connected");
    else toast.error(result.error);
  }

  async function handleDisconnect() {
    const result = await disconnectGoogleCalendar();
    if (result.success) toast.success("Google Calendar disconnected");
    else toast.error(result.error);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-base">Google Calendar</CardTitle>
          <p className="text-sm text-muted-foreground">View your calendar events alongside tasks.</p>
        </div>
        {connected ? (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">Connected</Badge>
            <Button variant="outline" size="sm" onClick={handleDisconnect}>Disconnect</Button>
          </div>
        ) : (
          <Button size="sm" onClick={handleConnect}>Connect</Button>
        )}
      </CardHeader>
    </Card>
  );
}
