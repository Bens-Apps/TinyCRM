import { prisma } from "@/lib/prisma";

export async function getJournalEntries(userId: string, contactId?: string) {
  return prisma.journalEntry.findMany({
    where: {
      userId,
      ...(contactId ? { contactId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      contact: { select: { id: true, name: true } },
    },
  });
}

export async function getJournalEntry(userId: string, id: string) {
  return prisma.journalEntry.findUnique({
    where: { id, userId },
    include: {
      contact: { select: { id: true, name: true } },
    },
  });
}
