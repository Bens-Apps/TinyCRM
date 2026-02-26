"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity-logger";
import { createJournalSchema, updateJournalSchema } from "@/lib/validations/journal";
import type { ActionResult } from "@/types";
import type { JournalEntry } from "@prisma/client";

export async function createJournalEntry(formData: FormData): Promise<ActionResult<JournalEntry>> {
  const user = await requireAuth();
  const raw = Object.fromEntries(formData);
  const parsed = createJournalSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const entry = await prisma.journalEntry.create({
    data: {
      ...parsed.data,
      contactId: parsed.data.contactId || null,
      userId: user.id!,
    },
  });

  await logActivity({
    userId: user.id!,
    entityType: "JournalEntry",
    entityId: entry.id,
    entityName: entry.content.slice(0, 50),
    action: "created",
    description: `Created journal entry`,
  });

  revalidatePath("/journal");
  if (parsed.data.contactId) revalidatePath(`/crm/${parsed.data.contactId}`);
  return { success: true, data: entry };
}

export async function updateJournalEntry(formData: FormData): Promise<ActionResult<JournalEntry>> {
  const user = await requireAuth();
  const raw = Object.fromEntries(formData);
  const parsed = updateJournalSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { id, ...data } = parsed.data;
  const entry = await prisma.journalEntry.update({
    where: { id, userId: user.id! },
    data: {
      ...data,
      contactId: data.contactId || null,
    },
  });

  await logActivity({
    userId: user.id!,
    entityType: "JournalEntry",
    entityId: entry.id,
    entityName: entry.content.slice(0, 50),
    action: "updated",
    description: `Updated journal entry`,
  });

  revalidatePath("/journal");
  return { success: true, data: entry };
}

export async function deleteJournalEntry(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  const entry = await prisma.journalEntry.findUnique({ where: { id, userId: user.id! } });
  if (!entry) return { success: false, error: "Entry not found" };

  await prisma.journalEntry.delete({ where: { id } });

  await logActivity({
    userId: user.id!,
    entityType: "JournalEntry",
    entityId: id,
    entityName: entry.content.slice(0, 50),
    action: "deleted",
    description: `Deleted journal entry`,
  });

  revalidatePath("/journal");
  if (entry.contactId) revalidatePath(`/crm/${entry.contactId}`);
  return { success: true, data: undefined };
}
