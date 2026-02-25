import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

interface LogActivityParams {
  userId: string;
  entityType: "Contact" | "Task" | "Project" | "Area" | "JournalEntry" | "RelationshipType";
  entityId: string;
  entityName: string;
  action: "created" | "updated" | "deleted" | "completed" | "status_changed";
  description?: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(params: LogActivityParams) {
  await prisma.activityLog.create({
    data: {
      userId: params.userId,
      entityType: params.entityType,
      entityId: params.entityId,
      entityName: params.entityName,
      action: params.action,
      description: params.description,
      metadata: (params.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
    },
  });
}
