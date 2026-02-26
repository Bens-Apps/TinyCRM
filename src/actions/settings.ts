"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { getAccountScopes, hasCalendarScope, hasGmailScope } from "@/lib/google-auth";
import { listUserCalendars } from "@/lib/google-calendar";
import type { ActionResult } from "@/types";

export async function connectGoogleCalendar(): Promise<ActionResult> {
  const user = await requireAuth();
  const scopes = await getAccountScopes(user.id!);

  if (!hasCalendarScope(scopes)) {
    return { success: false, error: "Calendar permissions not granted. Please sign out and sign back in to authorize." };
  }

  // Populate user's calendars from Google
  const calendars = await listUserCalendars(user.id!);
  if (calendars.length > 0) {
    await Promise.all(
      calendars.map((cal) =>
        prisma.userCalendar.upsert({
          where: { userId_calendarId: { userId: user.id!, calendarId: cal.id } },
          create: {
            userId: user.id!,
            calendarId: cal.id,
            name: cal.summary,
            color: cal.backgroundColor,
            enabled: cal.primary,
          },
          update: {
            name: cal.summary,
            color: cal.backgroundColor,
          },
        })
      )
    );
  }

  await prisma.user.update({
    where: { id: user.id! },
    data: { calendarConnected: true },
  });

  revalidatePath("/settings/integrations");
  revalidatePath("/calendar");
  return { success: true, data: undefined };
}

export async function disconnectGoogleCalendar(): Promise<ActionResult> {
  const user = await requireAuth();

  await prisma.user.update({
    where: { id: user.id! },
    data: { calendarConnected: false },
  });

  revalidatePath("/settings/integrations");
  revalidatePath("/calendar");
  return { success: true, data: undefined };
}

export async function toggleCalendar(
  calendarId: string,
  enabled: boolean
): Promise<ActionResult> {
  const user = await requireAuth();

  await prisma.userCalendar.updateMany({
    where: { userId: user.id!, calendarId },
    data: { enabled },
  });

  revalidatePath("/calendar");
  revalidatePath("/settings/integrations");
  return { success: true, data: undefined };
}

export async function refreshCalendarList(): Promise<ActionResult> {
  const user = await requireAuth();

  const calendars = await listUserCalendars(user.id!);
  if (calendars.length === 0) {
    return { success: false, error: "Could not fetch calendars. Check your connection." };
  }

  await Promise.all(
    calendars.map((cal) =>
      prisma.userCalendar.upsert({
        where: { userId_calendarId: { userId: user.id!, calendarId: cal.id } },
        create: {
          userId: user.id!,
          calendarId: cal.id,
          name: cal.summary,
          color: cal.backgroundColor,
          enabled: cal.primary,
        },
        update: {
          name: cal.summary,
          color: cal.backgroundColor,
        },
      })
    )
  );

  revalidatePath("/settings/integrations");
  return { success: true, data: undefined };
}
