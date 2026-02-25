"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity-logger";
import {
  createRelationshipTypeSchema,
  updateRelationshipTypeSchema,
  reorderRelationshipTypesSchema,
} from "@/lib/validations/settings";
import type { ActionResult } from "@/types";
import type { RelationshipType } from "@prisma/client";

export async function createRelationshipType(formData: FormData): Promise<ActionResult<RelationshipType>> {
  const user = await requireAuth();
  const raw = Object.fromEntries(formData);
  const parsed = createRelationshipTypeSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: "Validation failed" };
  }

  const maxOrder = await prisma.relationshipType.aggregate({
    where: { userId: user.id! },
    _max: { sortOrder: true },
  });

  const rt = await prisma.relationshipType.create({
    data: {
      ...parsed.data,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      userId: user.id!,
    },
  });

  await logActivity({
    userId: user.id!,
    entityType: "RelationshipType",
    entityId: rt.id,
    entityName: rt.name,
    action: "created",
    description: `Created relationship type "${rt.name}"`,
  });

  revalidatePath("/settings/relationship-types");
  return { success: true, data: rt };
}

export async function updateRelationshipType(formData: FormData): Promise<ActionResult<RelationshipType>> {
  const user = await requireAuth();
  const raw = Object.fromEntries(formData);
  const parsed = updateRelationshipTypeSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: "Validation failed" };
  }

  const { id, ...data } = parsed.data;
  const rt = await prisma.relationshipType.update({
    where: { id, userId: user.id! },
    data,
  });

  revalidatePath("/settings/relationship-types");
  return { success: true, data: rt };
}

export async function deleteRelationshipType(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  const rt = await prisma.relationshipType.findUnique({ where: { id, userId: user.id! } });
  if (!rt) return { success: false, error: "Not found" };

  await prisma.relationshipType.delete({ where: { id } });

  revalidatePath("/settings/relationship-types");
  return { success: true, data: undefined };
}

export async function reorderRelationshipTypes(orderedIds: string[]): Promise<ActionResult> {
  const user = await requireAuth();
  const parsed = reorderRelationshipTypesSchema.safeParse({ orderedIds });

  if (!parsed.success) {
    return { success: false, error: "Invalid data" };
  }

  await prisma.$transaction(
    parsed.data.orderedIds.map((id, index) =>
      prisma.relationshipType.update({
        where: { id, userId: user.id! },
        data: { sortOrder: index },
      })
    )
  );

  revalidatePath("/settings/relationship-types");
  return { success: true, data: undefined };
}
