"use client";

import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { AlertCircle, CalendarClock, Clock, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskStatusToggle } from "@/components/tasks/task-status-toggle";
import { TaskPriorityBadge } from "@/components/tasks/task-status-badge";
import type { Task, JournalEntry } from "@prisma/client";

type DashboardTask = Task & {
  project: { id: string; name: string } | null;
  contact: { id: string; firstName: string; lastName: string } | null;
};

type DashboardJournal = JournalEntry & {
  contact: { id: string; firstName: string; lastName: string } | null;
};

interface DashboardViewProps {
  overdueTasks: DashboardTask[];
  todayTasks: DashboardTask[];
  upcomingTasks: DashboardTask[];
  recentJournal: DashboardJournal[];
}

export function DashboardView({
  overdueTasks,
  todayTasks,
  upcomingTasks,
  recentJournal,
}: DashboardViewProps) {
  const hasNoTasks = overdueTasks.length === 0 && todayTasks.length === 0 && upcomingTasks.length === 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left column — Tasks */}
      <div className="space-y-6">
        {overdueTasks.length > 0 && (
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-red-600">
                <AlertCircle className="h-4 w-4" />
                Overdue ({overdueTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {overdueTasks.map((task) => (
                <TaskRow key={task.id} task={task} showOverdue />
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Today ({todayTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            {todayTasks.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nothing scheduled for today.
              </p>
            ) : (
              todayTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              Upcoming ({upcomingTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            {upcomingTasks.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No upcoming tasks this week.
              </p>
            ) : (
              upcomingTasks.map((task) => (
                <TaskRow key={task.id} task={task} showDate />
              ))
            )}
          </CardContent>
        </Card>

        {hasNoTasks && (
          <p className="text-center text-sm text-muted-foreground">
            No tasks with due dates.{" "}
            <Link href="/tasks" className="text-primary hover:underline">
              Go to Tasks
            </Link>{" "}
            to create some.
          </p>
        )}
      </div>

      {/* Right column — Recent Notes */}
      <div>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                Recent Notes
              </CardTitle>
              <Link href="/journal" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {recentJournal.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No journal entries yet.
              </p>
            ) : (
              recentJournal.map((entry) => (
                <JournalRow key={entry.id} entry={entry} />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TaskRow({
  task,
  showDate,
  showOverdue,
}: {
  task: DashboardTask;
  showDate?: boolean;
  showOverdue?: boolean;
}) {
  const dueDate = task.dueDate ?? task.scheduledDate;

  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50">
      <TaskStatusToggle taskId={task.id} status={task.status} />
      <div className="min-w-0 flex-1">
        <span className="text-sm">{task.title}</span>
        {task.contact && (
          <Link
            href={`/crm/${task.contact.id}`}
            className="ml-2 text-xs text-primary hover:underline"
          >
            {task.contact.firstName} {task.contact.lastName}
          </Link>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {showDate && dueDate && (
          <span className="text-xs text-muted-foreground">
            {format(dueDate, "EEE, MMM d")}
          </span>
        )}
        {showOverdue && dueDate && (
          <span className="text-xs text-red-500">
            {formatDistanceToNow(dueDate, { addSuffix: true })}
          </span>
        )}
        <TaskPriorityBadge priority={task.priority} />
        {task.project && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {task.project.name}
          </Badge>
        )}
      </div>
    </div>
  );
}

function JournalRow({ entry }: { entry: DashboardJournal }) {
  const snippet = entry.content.length > 120
    ? entry.content.slice(0, 120) + "..."
    : entry.content;

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-muted-foreground">
          {format(entry.createdAt, "MMM d, yyyy")}
        </span>
        {entry.contact && (
          <Link
            href={`/crm/${entry.contact.id}`}
            className="text-xs text-primary hover:underline"
          >
            {entry.contact.firstName} {entry.contact.lastName}
          </Link>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{snippet}</p>
    </div>
  );
}
