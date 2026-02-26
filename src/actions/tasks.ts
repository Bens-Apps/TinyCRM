"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity-logger";
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from "@/lib/validations/task";
import type { ActionResult } from "@/types";
import type { Task } from "@prisma/client";

export async function createTask(formData: FormData): Promise<ActionResult<Task>> {
  const user = await requireAuth();
  const raw = Object.fromEntries(formData);
  const parsed = createTaskSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const task = await prisma.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status ?? "TODO",
      priority: parsed.data.priority ?? "NONE",
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      scheduledDate: parsed.data.scheduledDate ? new Date(parsed.data.scheduledDate) : null,
      projectId: parsed.data.projectId || null,
      areaId: parsed.data.areaId || null,
      contactId: parsed.data.contactId || null,
      tags: parsed.data.tags || null,
      userId: user.id!,
    },
  });

  await logActivity({
    userId: user.id!,
    entityType: "Task",
    entityId: task.id,
    entityName: task.title,
    action: "created",
    description: `Created task "${task.title}"`,
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (task.contactId) revalidatePath(`/crm/${task.contactId}`);
  return { success: true, data: task };
}

export async function updateTask(formData: FormData): Promise<ActionResult<Task>> {
  const user = await requireAuth();
  const raw = Object.fromEntries(formData);
  const parsed = updateTaskSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { id, ...data } = parsed.data;
  const task = await prisma.task.update({
    where: { id, userId: user.id! },
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
      projectId: data.projectId || null,
      areaId: data.areaId || null,
      contactId: data.contactId || null,
      tags: data.tags || null,
    },
  });

  await logActivity({
    userId: user.id!,
    entityType: "Task",
    entityId: task.id,
    entityName: task.title,
    action: "updated",
    description: `Updated task "${task.title}"`,
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (task.contactId) revalidatePath(`/crm/${task.contactId}`);
  return { success: true, data: task };
}

export async function updateTaskStatus(id: string, status: string): Promise<ActionResult<Task>> {
  const user = await requireAuth();
  const parsed = updateTaskStatusSchema.safeParse({ id, status });

  if (!parsed.success) {
    return { success: false, error: "Invalid status" };
  }

  const task = await prisma.task.update({
    where: { id, userId: user.id! },
    data: {
      status: parsed.data.status,
      completedAt: parsed.data.status === "DONE" ? new Date() : null,
    },
  });

  const actionType = parsed.data.status === "DONE" ? "completed" as const : "status_changed" as const;
  await logActivity({
    userId: user.id!,
    entityType: "Task",
    entityId: task.id,
    entityName: task.title,
    action: actionType,
    description: `${actionType === "completed" ? "Completed" : "Changed status of"} task "${task.title}" to ${parsed.data.status}`,
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (task.contactId) revalidatePath(`/crm/${task.contactId}`);
  return { success: true, data: task };
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  const task = await prisma.task.findUnique({ where: { id, userId: user.id! } });
  if (!task) return { success: false, error: "Task not found" };

  await prisma.task.delete({ where: { id } });

  await logActivity({
    userId: user.id!,
    entityType: "Task",
    entityId: id,
    entityName: task.title,
    action: "deleted",
    description: `Deleted task "${task.title}"`,
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (task.contactId) revalidatePath(`/crm/${task.contactId}`);
  return { success: true, data: undefined };
}
