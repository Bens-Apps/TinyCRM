"use client";

import { formatDistanceToNow } from "date-fns";
import { Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GmailMessage } from "@/types/gmail";

interface EmailListItemProps {
  message: GmailMessage;
  onClick: () => void;
}

export function EmailListItem({ message, onClick }: EmailListItemProps) {
  const fromName = message.from.includes("<")
    ? message.from.split("<")[0].replace(/"/g, "").trim()
    : message.from;

  let timeAgo = "";
  try {
    timeAgo = formatDistanceToNow(new Date(parseInt(message.internalDate)), {
      addSuffix: true,
    });
  } catch {
    timeAgo = "";
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-4 border-b px-5 py-3.5 text-left transition-colors hover:bg-muted/60",
        message.isUnread && "bg-primary/[0.03]"
      )}
    >
      <div className="flex items-center gap-3 w-44 shrink-0">
        {message.isUnread ? (
          <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
        ) : (
          <div className="h-2 w-2 shrink-0" />
        )}
        <span className={cn(
          "truncate text-sm",
          message.isUnread ? "font-semibold text-foreground" : "text-muted-foreground"
        )}>
          {fromName}
        </span>
      </div>
      <div className="min-w-0 flex-1 flex items-baseline gap-2">
        <span className={cn(
          "shrink-0 text-sm",
          message.isUnread ? "font-semibold text-foreground" : "text-foreground"
        )}>
          {message.subject || "(no subject)"}
        </span>
        <span className="truncate text-sm text-muted-foreground/70">
          — {message.snippet}
        </span>
      </div>
      <div className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
        {timeAgo}
      </div>
    </button>
  );
}
