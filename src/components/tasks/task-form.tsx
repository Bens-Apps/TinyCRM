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
import { createTask, updateTask } from "@/actions/tasks";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Task, Area, Project } from "@prisma/client";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  areas: Pick<Area, "id" | "name">[];
  projects: Pick<Project, "id" | "name" | "areaId">[];
  contacts: { id: string; name: string }[];
  contactId?: string;
}

function dateStr(d: Date | null | undefined): string {
  return d ? format(d, "yyyy-MM-dd") : "";
}

export function TaskForm({ open, onOpenChange, task, areas, projects, contacts, contactId }: TaskFormProps) {
  const isEditing = !!task;

  async function handleSubmit(_prev: unknown, formData: FormData) {
    if (task) formData.set("id", task.id);
    if (contactId && !formData.get("contactId")) formData.set("contactId", contactId);
    const result = await (isEditing ? updateTask(formData) : createTask(formData));
    if (result.success) {
      toast.success(isEditing ? "Task updated" : "Task created");
      onOpenChange(false);
    } else {
      toast.error(result.error);
    }
    return result;
  }

  const [, action, pending] = useActionState(handleSubmit, null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={task?.title ?? ""} required />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={task?.description ?? ""} rows={3} placeholder="Markdown supported..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select name="status" defaultValue={task?.status ?? "TODO"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">Todo</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select name="priority" defaultValue={task?.priority ?? "NONE"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" name="dueDate" type="date" defaultValue={dateStr(task?.dueDate)} />
            </div>
            <div>
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input id="scheduledDate" name="scheduledDate" type="date" defaultValue={dateStr(task?.scheduledDate)} />
            </div>
          </div>

          <div>
            <Label>Project</Label>
            <Select name="projectId" defaultValue={task?.projectId ?? ""}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Area</Label>
            <Select name="areaId" defaultValue={task?.areaId ?? ""}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                {areas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!contactId && (
            <div>
              <Label>Contact</Label>
              <Select name="contactId" defaultValue={task?.contactId ?? ""}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" name="tags" defaultValue={task?.tags ?? ""} placeholder="Comma-separated tags" />
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
