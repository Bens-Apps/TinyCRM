import { Circle } from "lucide-react";
import type { Task } from "@prisma/client";

interface CalendarSidebarProps {
  tasks: (Task & { project: { id: string; name: string } | null })[];
}

export function CalendarSidebar({ tasks }: CalendarSidebarProps) {
  return (
    <div className="w-72 border-l border-border p-4">
      <h3 className="mb-3 text-sm font-semibold">Today&apos;s Tasks</h3>
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks scheduled for today.</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-2">
              <Circle className="mt-1 h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="text-sm">{task.title}</p>
                {task.project && (
                  <p className="text-xs text-muted-foreground">{task.project.name}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
