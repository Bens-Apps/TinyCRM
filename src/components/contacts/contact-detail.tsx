"use client";

import { useState } from "react";
import { ArrowLeft, Mail, Phone, Building2, Globe, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RelationshipBadge } from "./relationship-badge";
import { ContactForm } from "./contact-form";
import { JournalForm } from "@/components/journal/journal-form";
import { JournalEntryCard } from "@/components/journal/journal-entry-card";
import { TaskStatusToggle } from "@/components/tasks/task-status-toggle";
import { TaskPriorityBadge } from "@/components/tasks/task-status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { deleteContact } from "@/actions/contacts";
import { toast } from "sonner";
import type { Contact, RelationshipType, JournalEntry, Task } from "@prisma/client";

type FullContact = Contact & {
  relationshipType: RelationshipType | null;
  journalEntries: JournalEntry[];
  tasks: (Task & { project: { id: string; name: string } | null })[];
};

interface ContactDetailProps {
  contact: FullContact;
  relationshipTypes: { id: string; name: string; color: string | null }[];
}

export function ContactDetail({ contact, relationshipTypes }: ContactDetailProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [journalFormOpen, setJournalFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const tags = contact.tags?.split(",").filter(Boolean) ?? [];

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteContact(contact.id);
    if (result.success) {
      toast.success("Contact deleted");
      router.push("/crm");
    } else {
      toast.error(result.error);
      setDeleting(false);
    }
  }

  return (
    <>
      <Link href="/crm" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Contacts
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{contact.name}</h1>
            {contact.relationshipType && (
              <RelationshipBadge name={contact.relationshipType.name} color={contact.relationshipType.color} />
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {contact.company && (
              <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {contact.company}</span>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-primary">
                <Mail className="h-4 w-4" /> {contact.email}
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:text-primary">
                <Phone className="h-4 w-4" /> {contact.phone}
              </a>
            )}
            {contact.linkedinUrl && (
              <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                <Globe className="h-4 w-4" /> LinkedIn
              </a>
            )}
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag.trim()}</Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {contact.notes && (
        <div className="mb-6 rounded-lg border p-4">
          <MarkdownRenderer content={contact.notes} />
        </div>
      )}

      <Tabs defaultValue="journal">
        <TabsList>
          <TabsTrigger value="journal">Journal ({contact.journalEntries.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({contact.tasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="journal" className="mt-4">
          <div className="mb-4">
            <Button onClick={() => setJournalFormOpen(true)} size="sm">Add Journal Entry</Button>
          </div>
          {contact.journalEntries.length === 0 ? (
            <EmptyState title="No journal entries" description="Write a note about this contact." />
          ) : (
            <div className="space-y-3">
              {contact.journalEntries.map((entry) => (
                <JournalEntryCard key={entry.id} entry={{ ...entry, contact: { id: contact.id, name: contact.name } }} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          {contact.tasks.length === 0 ? (
            <EmptyState title="No tasks" description="Tasks linked to this contact will appear here." />
          ) : (
            <div className="space-y-2">
              {contact.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <TaskStatusToggle taskId={task.id} status={task.status} />
                    <span className={task.status === "DONE" ? "line-through text-muted-foreground" : ""}>{task.title}</span>
                  </div>
                  <div className="flex gap-2">
                    <TaskPriorityBadge priority={task.priority} />
                    {task.project && <Badge variant="outline">{task.project.name}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ContactForm open={editOpen} onOpenChange={setEditOpen} contact={contact} relationshipTypes={relationshipTypes} />
      <JournalForm open={journalFormOpen} onOpenChange={setJournalFormOpen} contactId={contact.id} contacts={[]} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Contact"
        description={`Are you sure you want to delete "${contact.name}"? Journal entries will be unlinked.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
