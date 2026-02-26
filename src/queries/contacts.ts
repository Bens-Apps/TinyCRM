import { prisma } from "@/lib/prisma";

export async function getContacts(userId: string, filters?: { search?: string; relationshipTypeId?: string }) {
  return prisma.contact.findMany({
    where: {
      userId,
      ...(filters?.relationshipTypeId ? { relationshipTypeId: filters.relationshipTypeId } : {}),
      ...(filters?.search
        ? {
            OR: [
              { firstName: { contains: filters.search, mode: "insensitive" as const } },
              { lastName: { contains: filters.search, mode: "insensitive" as const } },
              { email: { contains: filters.search, mode: "insensitive" as const } },
              { company: { contains: filters.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: {
      relationshipType: { select: { id: true, name: true, color: true } },
    },
  });
}

export async function getContact(userId: string, id: string) {
  return prisma.contact.findUnique({
    where: { id, userId },
    include: {
      relationshipType: true,
      journalEntries: { orderBy: { createdAt: "desc" } },
      tasks: {
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        include: {
          project: { select: { id: true, name: true } },
        },
      },
    },
  });
}
