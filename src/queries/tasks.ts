import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, endOfWeek, startOfWeek, addWeeks, addDays } from "date-fns";

interface TaskFilters {
  status?: string;
  priority?: string;
  areaId?: string;
  projectId?: string;
  tab?: "all" | "today" | "this-week" | "next-week" | "overdue";
}

export async function getTasks(userId: string, filters?: TaskFilters) {
  const now = new Date();
  const where: Record<string, unknown> = { userId };

  if (filters?.status) where.status = filters.status;
  if (filters?.priority) where.priority = filters.priority;
  if (filters?.areaId) where.areaId = filters.areaId;
  if (filters?.projectId) where.projectId = filters.projectId;

  if (filters?.tab === "today") {
    where.OR = [
      { scheduledDate: { gte: startOfDay(now), lte: endOfDay(now) } },
      { dueDate: { gte: startOfDay(now), lte: endOfDay(now) } },
    ];
  } else if (filters?.tab === "this-week") {
    where.OR = [
      { scheduledDate: { gte: startOfWeek(now), lte: endOfWeek(now) } },
      { dueDate: { gte: startOfWeek(now), lte: endOfWeek(now) } },
    ];
  } else if (filters?.tab === "next-week") {
    const nextWeekStart = startOfWeek(addWeeks(now, 1));
    const nextWeekEnd = endOfWeek(addWeeks(now, 1));
    where.OR = [
      { scheduledDate: { gte: nextWeekStart, lte: nextWeekEnd } },
      { dueDate: { gte: nextWeekStart, lte: nextWeekEnd } },
    ];
  } else if (filters?.tab === "overdue") {
    where.dueDate = { lt: startOfDay(now) };
    where.status = { not: "DONE" };
  }

  return prisma.task.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      project: { select: { id: true, name: true } },
      area: { select: { id: true, name: true, color: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function getTodayTasks(userId: string) {
  const now = new Date();
  return prisma.task.findMany({
    where: {
      userId,
      status: { not: "DONE" },
      OR: [
        { scheduledDate: { gte: startOfDay(now), lte: endOfDay(now) } },
        { dueDate: { gte: startOfDay(now), lte: endOfDay(now) } },
      ],
    },
    orderBy: { sortOrder: "asc" },
    include: {
      project: { select: { id: true, name: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function getOverdueTasks(userId: string) {
  const now = new Date();
  return prisma.task.findMany({
    where: {
      userId,
      status: { not: "DONE" },
      dueDate: { lt: startOfDay(now) },
    },
    orderBy: { dueDate: "asc" },
    include: {
      project: { select: { id: true, name: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function getUpcomingTasks(userId: string) {
  const now = new Date();
  return prisma.task.findMany({
    where: {
      userId,
      status: { not: "DONE" },
      OR: [
        { dueDate: { gt: endOfDay(now), lte: endOfDay(addDays(now, 7)) } },
        { scheduledDate: { gt: endOfDay(now), lte: endOfDay(addDays(now, 7)) } },
      ],
    },
    orderBy: { dueDate: "asc" },
    include: {
      project: { select: { id: true, name: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}
