"use client";

import { useState } from "react";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JournalEntryCard } from "./journal-entry-card";
import { JournalForm } from "./journal-form";
import { EmptyState } from "@/components/shared/empty-state";
import type { JournalEntry } from "@prisma/client";

type EntryWithContact = JournalEntry & {
  contact: { id: string; name: string } | null;
};

interface JournalListProps {
  entries: EntryWithContact[];
  contacts: { id: string; name: string }[];
}

export function JournalList({ entries, contacts }: JournalListProps) {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
          <p className="text-sm text-muted-foreground">
            Notes, meeting logs, and reflections.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Entry
        </Button>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-12 w-12" />}
          title="No journal entries"
          description="Start writing to capture your thoughts and notes."
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Write your first entry
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      <JournalForm open={formOpen} onOpenChange={setFormOpen} contacts={contacts} />
    </>
  );
}
