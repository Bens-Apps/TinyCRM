import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export async function getGoogleOAuth2Client(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account?.access_token) return null;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  oauth2Client.on("tokens", async (tokens) => {
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: tokens.access_token ?? account.access_token,
        expires_at: tokens.expiry_date
          ? Math.floor(tokens.expiry_date / 1000)
          : account.expires_at,
        refresh_token: tokens.refresh_token ?? account.refresh_token,
      },
    });
  });

  return oauth2Client;
}

export function hasRequiredScopes(
  grantedScope: string | null | undefined,
  requiredScopes: string[]
): boolean {
  if (!grantedScope) return false;
  const granted = new Set(grantedScope.split(" "));
  return requiredScopes.every((s) => granted.has(s));
}

export function hasCalendarScope(scope: string | null | undefined): boolean {
  return hasRequiredScopes(scope, [
    "https://www.googleapis.com/auth/calendar.readonly",
  ]);
}

export function hasGmailScope(scope: string | null | undefined): boolean {
  return hasRequiredScopes(scope, [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
  ]);
}

export async function getAccountScopes(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
    select: { scope: true },
  });
  return account?.scope ?? null;
}
