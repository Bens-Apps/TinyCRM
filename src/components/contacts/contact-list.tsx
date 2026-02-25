"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContactCard } from "./contact-card";
import { ContactForm } from "./contact-form";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import type { Contact } from "@prisma/client";

type ContactWithRelation = Contact & {
  relationshipType: { id: string; name: string; color: string | null } | null;
};

interface ContactListProps {
  contacts: ContactWithRelation[];
  relationshipTypes: { id: string; name: string; color: string | null }[];
}

export function ContactList({ contacts, relationshipTypes }: ContactListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("search", value);
      else params.delete("search");
      router.push(`/crm?${params.toString()}`);
    },
    [router, searchParams]
  );

  function handleRelTypeFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set("relationshipTypeId", value);
    else params.delete("relationshipTypeId");
    router.push(`/crm?${params.toString()}`);
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Contact
        </Button>
      </div>

      <div className="mb-4 flex gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Search contacts..."
            value={searchParams.get("search") ?? ""}
            onChange={handleSearch}
          />
        </div>
        <Select
          value={searchParams.get("relationshipTypeId") ?? ""}
          onValueChange={handleRelTypeFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Relationship Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {relationshipTypes.map((rt) => (
              <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {contacts.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No contacts found"
          description="Start building your network by adding contacts."
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add a contact
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}

      <ContactForm
        open={formOpen}
        onOpenChange={setFormOpen}
        relationshipTypes={relationshipTypes}
      />
    </>
  );
}
