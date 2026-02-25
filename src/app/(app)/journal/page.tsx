import { requireAuth } from "@/lib/auth-helpers";
import { getJournalEntries } from "@/queries/journal";
import { prisma } from "@/lib/prisma";
import { JournalList } from "@/components/journal/journal-list";

export default async function JournalPage() {
  const user = await requireAuth();

  const [entries, contacts] = await Promise.all([
    getJournalEntries(user.id!),
    prisma.contact.findMany({
      where: { userId: user.id! },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="p-6">
      <JournalList entries={entries} contacts={contacts} />
    </div>
  );
}
