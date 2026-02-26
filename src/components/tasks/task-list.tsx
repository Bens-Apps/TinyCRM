"use client";

import { useState } from "react";
import { Plus, CheckSquare, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./task-card";
import { TaskForm } from "./task-form";
import { TaskFilters } from "./task-filters";
import { EmptyState } from "@/components/shared/empty-state";
import type { Area, Project } from "@prisma/client";

type TaskWithRelations = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  scheduledDate: Date | null;
  tags: string | null;
  project: { id: string; name: string } | null;
  area: { id: string; name: string; color: string | null } | null;
  contact: { id: string; firstName: string; lastName: string } | null;
};

interface TaskListProps {
  tasks: TaskWithRelations[];
  areas: Pick<Area, "id" | "name">[];
  projects: Pick<Project, "id" | "name" | "areaId">[];
  contacts: { id: string; name: string }[];
  groupBy: string;
}

function groupTasks(tasks: TaskWithRelations[], groupBy: string): Map<string, TaskWithRelations[]> {
  const groups = new Map<string, TaskWithRelations[]>();

  for (const task of tasks) {
    let key: string;
    switch (groupBy) {
      case "priority":
        key = task.priority;
        break;
      case "area":
        key = task.area?.name ?? "No Area";
        break;
      case "project":
        key = task.project?.name ?? "No Project";
        break;
      default:
        key = task.status;
    }
    const group = groups.get(key) ?? [];
    group.push(task);
    groups.set(key, group);
  }

  return groups;
}

function TaskGroup({ label, tasks, defaultOpen = true }: {
  label: string;
  tasks: TaskWithRelations[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="mb-2 flex w-full items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        {label.replace("_", " ")} ({tasks.length})
      </button>
      {open && (
        <div className="space-y-1 pl-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TaskList({ tasks, areas, projects, contacts, groupBy }: TaskListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const groups = groupTasks(tasks, groupBy);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      <TaskFilters areas={areas} projects={projects} />

      <div className="mt-6">
        {tasks.length === 0 ? (
          <EmptyState
            icon={<CheckSquare className="h-12 w-12" />}
            title="No tasks found"
            description="Create a task to get started, or adjust your filters."
            action={
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create a task
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            {Array.from(groups.entries()).map(([label, groupTasks]) => (
              <TaskGroup key={label} label={label} tasks={groupTasks} />
            ))}
          </div>
        )}
      </div>

      <TaskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        areas={areas}
        projects={projects}
        contacts={contacts}
      />
    </>
  );
}
