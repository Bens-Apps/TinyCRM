"use client";

import { format, isPast, isToday } from "date-fns";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TaskStatusToggle } from "./task-status-toggle";
import { TaskPriorityBadge } from "./task-status-badge";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: Date | null;
    scheduledDate: Date | null;
    tags: string | null;
    project: { id: string; name: string } | null;
    area: { id: string; name: string; color: string | null } | null;
    contact: { id: string; name: string } | null;
  };
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const isOverdue = task.dueDate && isPast(task.dueDate) && !isToday(task.dueDate) && task.status !== "DONE";
  const tags = task.tags?.split(",").filter(Boolean) ?? [];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
        task.status === "DONE" && "opacity-60"
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <TaskStatusToggle taskId={task.id} status={task.status} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("font-medium", task.status === "DONE" && "line-through")}>
            {task.title}
          </span>
          <TaskPriorityBadge priority={task.priority} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {task.project && <span>{task.project.name}</span>}
          {task.project && task.area && <span>-</span>}
          {task.area && (
            <span className="flex items-center gap-1">
              {task.area.color && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: task.area.color }} />}
              {task.area.name}
            </span>
          )}
          {task.contact && <Badge variant="outline" className="text-xs">{task.contact.name}</Badge>}
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag.trim()}</Badge>
          ))}
        </div>
      </div>
      {task.dueDate && (
        <span className={cn(
          "flex items-center gap-1 whitespace-nowrap text-xs",
          isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"
        )}>
          <CalendarDays className="h-3.5 w-3.5" />
          {isOverdue && "Overdue: "}
          {format(task.dueDate, "MMM d")}
        </span>
      )}
    </div>
  );
}
