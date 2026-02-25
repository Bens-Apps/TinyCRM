"use client";

import { Circle, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { updateTaskStatus } from "@/actions/tasks";
import { cn } from "@/lib/utils";

interface TaskStatusToggleProps {
  taskId: string;
  status: string;
}

const STATUS_ICON: Record<string, { icon: typeof Circle; color: string; next: string }> = {
  TODO: { icon: Circle, color: "text-muted-foreground hover:text-primary", next: "DONE" },
  IN_PROGRESS: { icon: Clock, color: "text-blue-500 hover:text-green-500", next: "DONE" },
  DONE: { icon: CheckCircle2, color: "text-green-500 hover:text-muted-foreground", next: "TODO" },
  BLOCKED: { icon: AlertCircle, color: "text-red-500 hover:text-muted-foreground", next: "TODO" },
};

export function TaskStatusToggle({ taskId, status }: TaskStatusToggleProps) {
  const config = STATUS_ICON[status] ?? STATUS_ICON.TODO;
  const Icon = config.icon;

  return (
    <button
      onClick={async (e) => {
        e.preventDefault();
        await updateTaskStatus(taskId, config.next);
      }}
      className={cn("transition-colors", config.color)}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
