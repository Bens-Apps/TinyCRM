import { requireAuth } from "@/lib/auth-helpers";
import { getContact } from "@/queries/contacts";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ContactDetail } from "@/components/contacts/contact-detail";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const user = await requireAuth();
  const { contactId } = await params;

  const [contact, relationshipTypes] = await Promise.all([
    getContact(user.id!, contactId),
    prisma.relationshipType.findMany({
      where: { userId: user.id! },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, color: true },
    }),
  ]);

  if (!contact) notFound();

  return (
    <div className="p-6">
      <ContactDetail contact={contact} relationshipTypes={relationshipTypes} />
    </div>
  );
}
