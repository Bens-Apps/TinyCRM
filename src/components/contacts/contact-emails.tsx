"use client";

import { useState } from "react";
import useSWR from "swr";
import { Mail, Pencil, ChevronLeft, ChevronRight, Search, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComposeDialog } from "@/components/inbox/compose-dialog";
import { ThreadView } from "@/components/inbox/thread-view";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { GmailListResponse } from "@/types/gmail";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const PAGE_SIZES = [10, 25, 50] as const;

interface ContactEmailsProps {
  contactEmail: string | null;
  contactName: string;
}

export function ContactEmails({ contactEmail, contactName }: ContactEmailsProps) {
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageTokens, setPageTokens] = useState<string[]>([]);
  const [currentPageToken, setCurrentPageToken] = useState<string | undefined>();

  const query = contactEmail
    ? `category:primary (from:${contactEmail} OR to:${contactEmail})`
    : null;

  const { data, isLoading } = useSWR<GmailListResponse>(
    query
      ? `/api/google/gmail?q=${encodeURIComponent(query)}&maxResults=${pageSize}${currentPageToken ? `&pageToken=${currentPageToken}` : ""}`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (!contactEmail) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
        <Mail className="h-8 w-8" />
        <p className="text-sm">Add an email address to see email history.</p>
      </div>
    );
  }

  function handleNextPage() {
    if (data?.nextPageToken) {
      setPageTokens((prev) => [...prev, currentPageToken ?? ""]);
      setCurrentPageToken(data.nextPageToken);
    }
  }

  function handlePrevPage() {
    if (pageTokens.length > 0) {
      const prev = [...pageTokens];
      const token = prev.pop();
      setPageTokens(prev);
      setCurrentPageToken(token || undefined);
    }
  }

  const pageNumber = pageTokens.length + 1;

  return (
    <div>
      <div className="mb-4">
        <Button size="sm" onClick={() => setComposeOpen(true)}>
          <Pencil className="mr-2 h-4 w-4" /> Email {contactName}
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-xl border shadow-sm">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b px-5 py-3.5">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : !data?.messages?.length ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
          <Search className="h-8 w-8" />
          <p className="text-sm">No emails found with {contactEmail}</p>
        </div>
      ) : (
        <>
          <div className="overflow-y-auto rounded-xl border shadow-sm" style={{ maxHeight: "calc(100vh - 440px)" }}>
            {data.messages.map((msg) => {
              const isSent = !msg.from.toLowerCase().includes(contactEmail!.toLowerCase());
              let timeAgo = "";
              try {
                timeAgo = formatDistanceToNow(new Date(parseInt(msg.internalDate)), {
                  addSuffix: true,
                });
              } catch {
                timeAgo = "";
              }

              return (
                <button
                  key={msg.id}
                  onClick={() => setSelectedThreadId(msg.threadId)}
                  className={cn(
                    "flex w-full items-center gap-4 border-b px-5 py-3.5 text-left transition-colors hover:bg-muted/60",
                    msg.isUnread && "bg-primary/[0.03]"
                  )}
                >
                  <div className="flex items-center gap-2 w-20 shrink-0">
                    {isSent ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-blue-500" />
                    ) : (
                      <ArrowDownLeft className="h-3.5 w-3.5 text-green-500" />
                    )}
                    <span className="text-xs font-medium text-muted-foreground">
                      {isSent ? "Sent" : "Received"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 flex items-baseline gap-2">
                    <span className={cn(
                      "shrink-0 text-sm",
                      msg.isUnread ? "font-semibold text-foreground" : "text-foreground"
                    )}>
                      {msg.subject || "(no subject)"}
                    </span>
                    <span className="truncate text-sm text-muted-foreground/70">
                      — {msg.snippet}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                    {timeAgo}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Show</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(parseInt(v, 10));
                  setCurrentPageToken(undefined);
                  setPageTokens([]);
                }}
              >
                <SelectTrigger className="h-8 w-[72px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>per page</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="mr-1 text-sm text-muted-foreground">Page {pageNumber}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevPage} disabled={pageTokens.length === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextPage} disabled={!data?.nextPageToken}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <ThreadView
        threadId={selectedThreadId}
        open={!!selectedThreadId}
        onOpenChange={(open) => !open && setSelectedThreadId(null)}
      />

      <ComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        defaultTo={contactEmail}
      />
    </div>
  );
}
