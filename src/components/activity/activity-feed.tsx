"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Activity } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActivityItem } from "./activity-item";
import { EmptyState } from "@/components/shared/empty-state";
import { groupByDate } from "@/lib/utils";
import type { ActivityLog } from "@prisma/client";

interface ActivityFeedProps {
  logs: ActivityLog[];
}

export function ActivityFeed({ logs }: ActivityFeedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set("entityType", value);
    else params.delete("entityType");
    router.push(`/activity?${params.toString()}`);
  }

  const groups = groupByDate(logs);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity</h1>
          <p className="text-sm text-muted-foreground">Everything that happened in your workspace.</p>
        </div>
        <Select value={searchParams.get("entityType") ?? ""} onValueChange={handleFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Contact">Contacts</SelectItem>
            <SelectItem value="Task">Tasks</SelectItem>
            <SelectItem value="Project">Projects</SelectItem>
            <SelectItem value="Area">Areas</SelectItem>
            <SelectItem value="JournalEntry">Journal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={<Activity className="h-12 w-12" />}
          title="No activity yet"
          description="Your actions across TinyCRM will show up here."
        />
      ) : (
        <div className="space-y-6">
          {Array.from(groups.entries()).map(([label, items]) => (
            <div key={label}>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{label}</h3>
              <div className="divide-y">
                {items.map((log) => (
                  <ActivityItem key={log.id} log={log as ActivityLog} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
