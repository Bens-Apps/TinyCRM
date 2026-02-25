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
import { createArea, updateArea } from "@/actions/areas";
import type { Area } from "@prisma/client";
import { toast } from "sonner";

interface AreaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  area?: Area | null;
}

const COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
  "#ef4444", "#f59e0b", "#10b981", "#06b6d4",
  "#3b82f6", "#6b7280",
];

export function AreaForm({ open, onOpenChange, area }: AreaFormProps) {
  const isEditing = !!area;

  async function handleSubmit(_prev: unknown, formData: FormData) {
    if (area) formData.set("id", area.id);
    const result = await (isEditing ? updateArea(formData) : createArea(formData));
    if (result.success) {
      toast.success(isEditing ? "Area updated" : "Area created");
      onOpenChange(false);
    } else {
      toast.error(result.error);
    }
    return result;
  }

  const [, action, pending] = useActionState(handleSubmit, null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Area" : "New Area"}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={area?.name ?? ""} required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={area?.description ?? ""} rows={3} />
          </div>
          <div>
            <Label>Color</Label>
            <div className="mt-1.5 flex gap-2">
              {COLORS.map((c) => (
                <label key={c} className="cursor-pointer">
                  <input type="radio" name="color" value={c} defaultChecked={area?.color === c || (!area && c === COLORS[0])} className="peer sr-only" />
                  <div
                    className="h-7 w-7 rounded-full border-2 border-transparent peer-checked:border-foreground"
                    style={{ backgroundColor: c }}
                  />
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
