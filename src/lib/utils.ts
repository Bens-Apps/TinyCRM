import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return format(d, "MMM d, yyyy");
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

export function formatRelativeDate(date: Date | string): string {
  const d = new Date(date);
  if (isToday(d)) return `Today at ${format(d, "h:mm a")}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, "h:mm a")}`;
  return formatDateTime(d);
}

export function formatTimeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function groupByDate<T extends { createdAt: Date }>(
  items: T[]
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const d = new Date(item.createdAt);
    let label: string;
    if (isToday(d)) label = "Today";
    else if (isYesterday(d)) label = "Yesterday";
    else label = format(d, "MMMM d, yyyy");

    const group = groups.get(label) ?? [];
    group.push(item);
    groups.set(label, group);
  }
  return groups;
}
