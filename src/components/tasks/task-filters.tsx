"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "this-week", label: "This Week" },
  { value: "next-week", label: "Next Week" },
  { value: "overdue", label: "Overdue" },
];

interface TaskFiltersProps {
  areas: { id: string; name: string }[];
  projects: { id: string; name: string }[];
}

export function TaskFilters({ areas, projects }: TaskFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get("tab") ?? "all";
  const groupBy = searchParams.get("groupBy") ?? "status";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/tasks?${params.toString()}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {TABS.map((tab) => (
          <Button
            key={tab.value}
            variant={currentTab === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => updateParam("tab", tab.value)}
            className={cn(currentTab === tab.value && "pointer-events-none")}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={searchParams.get("status") ?? ""} onValueChange={(v) => updateParam("status", v)}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="TODO">Todo</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
            <SelectItem value="BLOCKED">Blocked</SelectItem>
          </SelectContent>
        </Select>

        <Select value={searchParams.get("priority") ?? ""} onValueChange={(v) => updateParam("priority", v)}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="NONE">None</SelectItem>
          </SelectContent>
        </Select>

        {areas.length > 0 && (
          <Select value={searchParams.get("areaId") ?? ""} onValueChange={(v) => updateParam("areaId", v)}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Area" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              {areas.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {projects.length > 0 && (
          <Select value={searchParams.get("projectId") ?? ""} onValueChange={(v) => updateParam("projectId", v)}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Project" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Group by:</span>
          <Select value={groupBy} onValueChange={(v) => updateParam("groupBy", v)}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="area">Area</SelectItem>
              <SelectItem value="project">Project</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
