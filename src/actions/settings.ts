"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import type { ActionResult } from "@/types";

export async function connectGoogleCalendar(): Promise<ActionResult> {
  const user = await requireAuth();

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
