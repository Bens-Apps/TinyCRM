"use client";

import { useState } from "react";
import useSWR from "swr";
import { Reply, Loader2, Paperclip, Download, ChevronDown, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmailBodyRenderer } from "./email-body-renderer";
import { ComposeDialog } from "./compose-dialog";
import type { GmailThread, GmailMessageFull } from "@/types/gmail";
import { formatDistanceToNow } from "date-fns";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function parseEmailAddressClient(raw: string): { name: string; email: string } {
  const match = raw.match(/^(.+?)\s*<(.+?)>$/);
  if (match) {
    return { name: match[1].replace(/"/g, "").trim(), email: match[2] };
  }
  return { name: raw, email: raw };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface ThreadViewProps {
  threadId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThreadView({ threadId, open, onOpenChange }: ThreadViewProps) {
  const { data: thread, isLoading } = useSWR<GmailThread>(
    threadId ? `/api/google/gmail/threads/${threadId}` : null,
    fetcher
  );
  const [replyTo, setReplyTo] = useState<GmailMessageFull | null>(null);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !thread ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Could not load this conversation.
            </div>
          ) : (
            <>
              <DialogHeader className="border-b px-6 py-4">
                <DialogTitle className="pr-8 text-lg leading-snug">
                  {thread.subject}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  {thread.messages.length} message{thread.messages.length > 1 ? "s" : ""}
                </p>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {[...thread.messages].reverse().map((msg, i) => (
                  <MessageCard
                    key={msg.id}
                    message={msg}
                    defaultExpanded={i === 0}
                    onReply={() => setReplyTo(msg)}
                  />
                ))}
              </div>

              <div className="border-t px-6 py-3 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => {
                    const last = thread.messages[thread.messages.length - 1];
                    setReplyTo(last);
                  }}
                >
                  <Reply className="mr-2 h-4 w-4" /> Reply
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {replyTo && (
        <ComposeDialog
          open={!!replyTo}
          onOpenChange={(o) => !o && setReplyTo(null)}
          replyTo={{
            to: replyTo.from,
            subject: replyTo.subject.startsWith("Re:") ? replyTo.subject : `Re: ${replyTo.subject}`,
            threadId: replyTo.threadId,
            inReplyTo: replyTo.messageId,
          }}
        />
      )}
    </>
  );
}

function MessageCard({
  message,
  defaultExpanded,
  onReply,
}: {
  message: GmailMessageFull;
  defaultExpanded: boolean;
  onReply: () => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const from = parseEmailAddressClient(message.from);

  let timeAgo = "";
  try {
    timeAgo = formatDistanceToNow(new Date(parseInt(message.internalDate)), {
      addSuffix: true,
    });
  } catch {
    timeAgo = "";
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30 rounded-xl"
      >
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
            {getInitials(from.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{from.name}</span>
            <span className="text-xs text-muted-foreground truncate">&lt;{from.email}&gt;</span>
          </div>
          {!expanded && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {message.snippet}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {message.attachments?.length > 0 && (
            <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo}</span>
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t px-4 py-3 space-y-3">
          <EmailBodyRenderer html={message.htmlBody} text={message.textBody} />

          {message.attachments?.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Paperclip className="h-3.5 w-3.5" />
                {message.attachments.length} attachment{message.attachments.length > 1 ? "s" : ""}
              </div>
              <div className="flex flex-wrap gap-2">
                {message.attachments.map((att) => (
                  <a
                    key={att.attachmentId}
                    href={`/api/google/gmail/${att.messageId}/attachments/${att.attachmentId}?filename=${encodeURIComponent(att.filename)}&mimeType=${encodeURIComponent(att.mimeType)}`}
                    download={att.filename}
                    className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs hover:bg-muted transition-colors"
                  >
                    <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate max-w-[200px] font-medium">{att.filename}</span>
                    <span className="text-muted-foreground">
                      {formatFileSize(att.size)}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
