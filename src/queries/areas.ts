import { prisma } from "@/lib/prisma";

export async function getAreas(userId: string) {
  return prisma.area.findMany({
    where: { userId },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { projects: true, tasks: true } },
    },
  });
}

export async function getArea(userId: string, id: string) {
  return prisma.area.findUnique({
    where: { id, userId },
    include: {
      projects: { orderBy: { createdAt: "desc" } },
      tasks: {
        where: { status: { not: "DONE" } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}
