"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity-logger";
import { createProjectSchema, updateProjectSchema } from "@/lib/validations/project";
import type { ActionResult } from "@/types";
import type { Project } from "@prisma/client";

export async function createProject(formData: FormData): Promise<ActionResult<Project>> {
  const user = await requireAuth();
  const raw = Object.fromEntries(formData);
  const parsed = createProjectSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const project = await prisma.project.create({
    data: {
      ...parsed.data,
      areaId: parsed.data.areaId || null,
      userId: user.id!,
    },
  });

  await logActivity({
    userId: user.id!,
    entityType: "Project",
    entityId: project.id,
    entityName: project.name,
    action: "created",
    description: `Created project "${project.name}"`,
  });

  revalidatePath("/projects");
  return { success: true, data: project };
}

export async function updateProject(formData: FormData): Promise<ActionResult<Project>> {
  const user = await requireAuth();
  const raw = Object.fromEntries(formData);
  const parsed = updateProjectSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { id, ...data } = parsed.data;
  const project = await prisma.project.update({
    where: { id, userId: user.id! },
    data: {
      ...data,
      areaId: data.areaId || null,
    },
  });

  await logActivity({
    userId: user.id!,
    entityType: "Project",
    entityId: project.id,
    entityName: project.name,
    action: "updated",
    description: `Updated project "${project.name}"`,
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return { success: true, data: project };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  const project = await prisma.project.findUnique({ where: { id, userId: user.id! } });
  if (!project) return { success: false, error: "Project not found" };

  await prisma.project.delete({ where: { id } });

  await logActivity({
    userId: user.id!,
    entityType: "Project",
    entityId: id,
    entityName: project.name,
    action: "deleted",
    description: `Deleted project "${project.name}"`,
  });

  revalidatePath("/projects");
  return { success: true, data: undefined };
}
