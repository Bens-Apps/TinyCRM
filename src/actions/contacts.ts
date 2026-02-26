"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity-logger";
import { createContactSchema, updateContactSchema } from "@/lib/validations/contact";
import type { ActionResult } from "@/types";
import type { Contact } from "@prisma/client";

export async function createContact(formData: FormData): Promise<ActionResult<Contact>> {
  const user = await requireAuth();
  const raw = Object.fromEntries(formData);
  const parsed = createContactSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const contact = await prisma.contact.create({
    data: {
      ...parsed.data,
      email: parsed.data.email || null,
      linkedinUrl: parsed.data.linkedinUrl || null,
      relationshipTypeId: parsed.data.relationshipTypeId || null,
      userId: user.id!,
    },
  });

  await logActivity({
    userId: user.id!,
    entityType: "Contact",
    entityId: contact.id,
    entityName: `${contact.firstName} ${contact.lastName}`.trim(),
    action: "created",
    description: `Created contact "${`${contact.firstName} ${contact.lastName}`.trim()}"`,
  });

  revalidatePath("/crm");
  return { success: true, data: contact };
}

export async function updateContact(formData: FormData): Promise<ActionResult<Contact>> {
  const user = await requireAuth();
  const raw = Object.fromEntries(formData);
  const parsed = updateContactSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { id, ...data } = parsed.data;
  const contact = await prisma.contact.update({
    where: { id, userId: user.id! },
    data: {
      ...data,
      email: data.email || null,
      linkedinUrl: data.linkedinUrl || null,
      relationshipTypeId: data.relationshipTypeId || null,
    },
  });

  await logActivity({
    userId: user.id!,
    entityType: "Contact",
    entityId: contact.id,
    entityName: `${contact.firstName} ${contact.lastName}`.trim(),
    action: "updated",
    description: `Updated contact "${`${contact.firstName} ${contact.lastName}`.trim()}"`,
  });

  revalidatePath("/crm");
  revalidatePath(`/crm/${id}`);
  return { success: true, data: contact };
}

export async function deleteContact(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  const contact = await prisma.contact.findUnique({ where: { id, userId: user.id! } });
  if (!contact) return { success: false, error: "Contact not found" };

  await prisma.contact.delete({ where: { id } });

  await logActivity({
    userId: user.id!,
    entityType: "Contact",
    entityId: id,
    entityName: `${contact.firstName} ${contact.lastName}`.trim(),
    action: "deleted",
    description: `Deleted contact "${`${contact.firstName} ${contact.lastName}`.trim()}"`,
  });

  revalidatePath("/crm");
  return { success: true, data: undefined };
}
