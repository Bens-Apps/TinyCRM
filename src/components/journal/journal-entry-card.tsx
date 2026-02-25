"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteJournalEntry } from "@/actions/journal";
import { toast } from "sonner";
import type { JournalEntry } from "@prisma/client";

type EntryWithContact = JournalEntry & {
  contact: { id: string; name: string } | null;
};

interface JournalEntryCardProps {
  entry: EntryWithContact;
  onEdit?: () => void;
}

export function JournalEntryCard({ entry, onEdit }: JournalEntryCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteJournalEntry(entry.id);
    if (result.success) toast.success("Entry deleted");
    else toast.error(result.error);
    setDeleting(false);
    setDeleteOpen(false);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {format(entry.createdAt, "MMM d, yyyy 'at' h:mm a")}
              </span>
              {entry.contact && (
                <Badge variant="outline">{entry.contact.name}</Badge>
              )}
            </div>
            {entry.title && (
              <h3 className="mt-1 font-semibold">{entry.title}</h3>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <MarkdownRenderer content={entry.content} />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Journal Entry"
        description="Are you sure you want to delete this journal entry?"
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
