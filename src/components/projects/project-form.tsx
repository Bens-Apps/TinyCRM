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
import { createProject, updateProject } from "@/actions/projects";
import { toast } from "sonner";
import type { Project, Area } from "@prisma/client";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  areas: Pick<Area, "id" | "name">[];
}

export function ProjectForm({ open, onOpenChange, project, areas }: ProjectFormProps) {
  const isEditing = !!project;

  async function handleSubmit(_prev: unknown, formData: FormData) {
    if (project) formData.set("id", project.id);
    const result = await (isEditing ? updateProject(formData) : createProject(formData));
    if (result.success) {
      toast.success(isEditing ? "Project updated" : "Project created");
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
          <DialogTitle>{isEditing ? "Edit Project" : "New Project"}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={project?.name ?? ""} required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={project?.description ?? ""} rows={3} />
          </div>
          <div>
            <Label>Area</Label>
            <Select name="areaId" defaultValue={project?.areaId ?? ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select an area (optional)" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isEditing && (
            <div>
              <Label>Status</Label>
              <Select name="status" defaultValue={project?.status ?? "ACTIVE"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
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
