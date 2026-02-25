import { prisma } from "@/lib/prisma";

export async function getProjects(userId: string, filters?: { status?: string; areaId?: string }) {
  return prisma.project.findMany({
    where: {
      userId,
      ...(filters?.status ? { status: filters.status as never } : {}),
      ...(filters?.areaId ? { areaId: filters.areaId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      area: { select: { id: true, name: true, color: true } },
      _count: { select: { tasks: true } },
    },
  });
}

export async function getProject(userId: string, id: string) {
  return prisma.project.findUnique({
    where: { id, userId },
    include: {
      area: { select: { id: true, name: true, color: true } },
      tasks: {
        orderBy: [{ status: "asc" }, { sortOrder: "asc" }],
        include: {
          contact: { select: { id: true, name: true } },
        },
      },
    },
  });
}
