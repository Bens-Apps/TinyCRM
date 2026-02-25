import { format } from "date-fns";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  ArrowRightLeft,
} from "lucide-react";
import type { ActivityLog } from "@prisma/client";

const ACTION_ICONS: Record<string, { icon: typeof Plus; color: string }> = {
  created: { icon: Plus, color: "text-green-600 bg-green-100" },
  updated: { icon: Pencil, color: "text-blue-600 bg-blue-100" },
  deleted: { icon: Trash2, color: "text-red-600 bg-red-100" },
  completed: { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-100" },
  status_changed: { icon: ArrowRightLeft, color: "text-amber-600 bg-amber-100" },
};

const ENTITY_LINKS: Record<string, string> = {
  Contact: "/crm",
  Task: "/tasks",
  Project: "/projects",
  Area: "/areas",
  JournalEntry: "/journal",
};

interface ActivityItemProps {
  log: ActivityLog;
}

export function ActivityItem({ log }: ActivityItemProps) {
  const config = ACTION_ICONS[log.action] ?? ACTION_ICONS.updated;
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 py-2">
      <div className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full ${config.color}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          {log.description ?? `${log.action} ${log.entityType.toLowerCase()} "${log.entityName}"`}
        </p>
        <span className="text-xs text-muted-foreground">
          {format(log.createdAt, "h:mm a")}
        </span>
      </div>
    </div>
  );
}
