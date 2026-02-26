import { requireAuth } from "@/lib/auth-helpers";
import { getAccountScopes, hasGmailScope } from "@/lib/google-auth";
import { InboxView } from "@/components/inbox/inbox-view";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function InboxPage() {
  const user = await requireAuth();
  const scopes = await getAccountScopes(user.id!);
  const gmailConnected = hasGmailScope(scopes);

  if (!gmailConnected) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Connect Gmail</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign out and sign back in to grant Gmail permissions, then enable Gmail in Settings.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/settings/integrations">
                Go to Settings <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-6">
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Inbox</h1>
      <InboxView />
    </div>
  );
}
