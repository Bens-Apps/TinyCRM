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
import { createContact, updateContact } from "@/actions/contacts";
import { toast } from "sonner";
import type { Contact } from "@prisma/client";

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
  relationshipTypes: { id: string; name: string; color: string | null }[];
}

export function ContactForm({ open, onOpenChange, contact, relationshipTypes }: ContactFormProps) {
  const isEditing = !!contact;

  async function handleSubmit(_prev: unknown, formData: FormData) {
    if (contact) formData.set("id", contact.id);
    const result = await (isEditing ? updateContact(formData) : createContact(formData));
    if (result.success) {
      toast.success(isEditing ? "Contact updated" : "Contact created");
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
          <DialogTitle>{isEditing ? "Edit Contact" : "New Contact"}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" defaultValue={contact?.firstName ?? ""} required />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" defaultValue={contact?.lastName ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={contact?.email ?? ""} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={contact?.phone ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" defaultValue={contact?.company ?? ""} />
            </div>
            <div>
              <Label>Relationship</Label>
              <Select name="relationshipTypeId" defaultValue={contact?.relationshipTypeId ?? ""}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {relationshipTypes.map((rt) => (
                    <SelectItem key={rt.id} value={rt.id}>
                      <span className="flex items-center gap-2">
                        {rt.color && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: rt.color }} />}
                        {rt.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input id="linkedinUrl" name="linkedinUrl" defaultValue={contact?.linkedinUrl ?? ""} placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" name="tags" defaultValue={contact?.tags ?? ""} placeholder="Comma-separated tags" />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={contact?.notes ?? ""} rows={3} />
          </div>
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
