import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  TODO: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
  BLOCKED: "bg-red-100 text-red-700",
};

const PRIORITY_STYLES: Record<string, string> = {
  URGENT: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-blue-100 text-blue-700",
  NONE: "",
};

export function TaskStatusBadge({ status }: { status: string }) {
  return (
    <Badge className={cn(STATUS_STYLES[status])} variant="secondary">
      {status.replace("_", " ")}
    </Badge>
  );
}

export function TaskPriorityBadge({ priority }: { priority: string }) {
  if (priority === "NONE") return null;
  return (
    <Badge className={cn(PRIORITY_STYLES[priority])} variant="secondary">
      {priority}
    </Badge>
  );
}
