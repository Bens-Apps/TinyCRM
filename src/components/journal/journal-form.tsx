"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createJournalEntry, updateJournalEntry } from "@/actions/journal";
import { toast } from "sonner";
import type { JournalEntry, Contact } from "@prisma/client";

interface JournalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: JournalEntry | null;
  contactId?: string;
  contacts: Pick<Contact, "id" | "name">[];
}

export function JournalForm({ open, onOpenChange, entry, contactId, contacts }: JournalFormProps) {
  const isEditing = !!entry;

  async function handleSubmit(_prev: unknown, formData: FormData) {
    if (entry) formData.set("id", entry.id);
    if (contactId && !formData.get("contactId")) formData.set("contactId", contactId);
    const result = await (isEditing ? updateJournalEntry(formData) : createJournalEntry(formData));
    if (result.success) {
      toast.success(isEditing ? "Entry updated" : "Entry created");
      onOpenChange(false);
    } else {
      toast.error(result.error);
    }
    return result;
  }

  const [, action, pending] = useActionState(handleSubmit, null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Entry" : "New Journal Entry"}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div>
            <Label htmlFor="title">Title (optional)</Label>
            <Input id="title" name="title" defaultValue={entry?.title ?? ""} />
          </div>
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={entry?.content ?? ""}
              rows={8}
              placeholder="Write your notes here... Markdown is supported."
              required
            />
          </div>
          {!contactId && contacts.length > 0 && (
            <div>
              <Label>Link to Contact</Label>
              <Select name="contactId" defaultValue={entry?.contactId ?? ""}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
