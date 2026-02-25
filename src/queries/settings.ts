import { prisma } from "@/lib/prisma";

export async function getRelationshipTypes(userId: string) {
  return prisma.relationshipType.findMany({
    where: { userId },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { contacts: true } },
    },
  });
}
