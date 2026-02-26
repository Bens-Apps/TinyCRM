import { prisma } from "@/lib/prisma";

export async function getJournalEntries(userId: string, contactId?: string) {
  const entries = await prisma.journalEntry.findMany({
    where: {
      userId,
      ...(contactId ? { contactId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return entries.map(e => ({
    ...e,
    contact: e.contact ? { id: e.contact.id, name: `${e.contact.firstName} ${e.contact.lastName}`.trim() } : null,
  }));
}

export async function getJournalEntry(userId: string, id: string) {
  const entry = await prisma.journalEntry.findUnique({
    where: { id, userId },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!entry) return null;

  return {
    ...entry,
    contact: entry.contact ? { id: entry.contact.id, name: `${entry.contact.firstName} ${entry.contact.lastName}`.trim() } : null,
  };
}
