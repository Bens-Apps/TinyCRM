"use client";

import { Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GmailIntegrationCardProps {
  connected: boolean;
}

export function GmailIntegrationCard({ connected }: GmailIntegrationCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
          <Mail className="h-5 w-5 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base">Gmail</CardTitle>
          <p className="text-sm text-muted-foreground">
            View and send emails from your inbox.
          </p>
        </div>
        {connected ? (
          <Badge variant="secondary" className="bg-green-50 text-green-700 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Connected
          </Badge>
        ) : (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-amber-50 text-amber-700 gap-1">
              <AlertCircle className="h-3 w-3" />
              Not Connected
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.href = "/api/auth/signin/google"}
            >
              Re-authorize
            </Button>
          </div>
        )}
      </CardHeader>
    </Card>
  );
}
