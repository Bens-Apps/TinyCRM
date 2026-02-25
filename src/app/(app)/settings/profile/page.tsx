import { requireAuth } from "@/lib/auth-helpers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const user = await requireAuth();

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "?";

  return (
    <div>
      <h2 className="text-lg font-semibold">Profile</h2>
      <p className="mb-4 text-sm text-muted-foreground">Your account information.</p>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user.name ?? "—"}</p>
              <p className="text-sm text-muted-foreground">{user.email ?? "—"}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Signed in via Google OAuth. To update your name or photo, update your Google account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
