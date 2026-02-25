"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity-logger";
import { createAreaSchema, updateAreaSchema } from "@/lib/validations/area";
import type { ActionResult } from "@/types";
import type { Area } from "@prisma/client";

export async function createArea(formData: FormData): Promise<ActionResult<Area>> {
  const user = await requireAuth();
  const raw = Object.fromEntries(formData);
  const parsed = createAreaSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const area = await prisma.area.create({
    data: { ...parsed.data, userId: user.id! },
  });

  await logActivity({
    userId: user.id!,
    entityType: "Area",
    entityId: area.id,
    entityName: area.name,
    action: "created",
    description: `Created area "${area.name}"`,
  });

  revalidatePath("/areas");
  return { success: true, data: area };
}

export async function updateArea(formData: FormData): Promise<ActionResult<Area>> {
  const user = await requireAuth();
  const raw = Object.fromEntries(formData);
  const parsed = updateAreaSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { id, ...data } = parsed.data;
  const area = await prisma.area.update({
    where: { id, userId: user.id! },
    data,
  });

  await logActivity({
    userId: user.id!,
    entityType: "Area",
    entityId: area.id,
    entityName: area.name,
    action: "updated",
    description: `Updated area "${area.name}"`,
  });

  revalidatePath("/areas");
  return { success: true, data: area };
}

export async function deleteArea(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  const area = await prisma.area.findUnique({ where: { id, userId: user.id! } });
  if (!area) return { success: false, error: "Area not found" };

  await prisma.area.delete({ where: { id } });

  await logActivity({
    userId: user.id!,
    entityType: "Area",
    entityId: id,
    entityName: area.name,
    action: "deleted",
    description: `Deleted area "${area.name}"`,
  });

  revalidatePath("/areas");
  return { success: true, data: undefined };
}
