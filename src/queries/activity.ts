import { prisma } from "@/lib/prisma";

interface ActivityFilters {
  entityType?: string;
  limit?: number;
  cursor?: string;
}

export async function getActivityLog(userId: string, filters?: ActivityFilters) {
  return prisma.activityLog.findMany({
    where: {
      userId,
      ...(filters?.entityType ? { entityType: filters.entityType } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: filters?.limit ?? 50,
    ...(filters?.cursor
      ? { cursor: { id: filters.cursor }, skip: 1 }
      : {}),
  });
}

export async function getEntityActivity(userId: string, entityType: string, entityId: string) {
  return prisma.activityLog.findMany({
    where: { userId, entityType, entityId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
