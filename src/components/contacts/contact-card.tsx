import Link from "next/link";
import { Mail, Phone, Building2 } from "lucide-react";
import { RelationshipBadge } from "./relationship-badge";

interface ContactCardProps {
  contact: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    relationshipType: { id: string; name: string; color: string | null } | null;
  };
}

export function ContactCard({ contact }: ContactCardProps) {
  return (
    <Link
      href={`/crm/${contact.id}`}
      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{contact.name}</span>
          {contact.relationshipType && (
            <RelationshipBadge name={contact.relationshipType.name} color={contact.relationshipType.color} />
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {contact.company && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" /> {contact.company}
            </span>
          )}
          {contact.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> {contact.email}
            </span>
          )}
          {contact.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" /> {contact.phone}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
