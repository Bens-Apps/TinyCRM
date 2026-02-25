import { Suspense } from "react";
import { requireAuth } from "@/lib/auth-helpers";
import { getContacts } from "@/queries/contacts";
import { prisma } from "@/lib/prisma";
import { ContactList } from "@/components/contacts/contact-list";

export default async function CRMPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireAuth();
  const params = await searchParams;

  const [contacts, relationshipTypes] = await Promise.all([
    getContacts(user.id!, {
      search: params.search,
      relationshipTypeId: params.relationshipTypeId,
    }),
    prisma.relationshipType.findMany({
      where: { userId: user.id! },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, color: true },
    }),
  ]);

  return (
    <div className="p-6">
      <Suspense>
        <ContactList contacts={contacts} relationshipTypes={relationshipTypes} />
      </Suspense>
    </div>
  );
}
