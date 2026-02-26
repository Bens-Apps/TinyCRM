"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

interface ComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  replyTo?: {
    to: string;
    subject: string;
    threadId: string;
    inReplyTo: string;
  };
  defaultTo?: string;
}

export function ComposeDialog({
  open,
  onOpenChange,
  replyTo,
  defaultTo,
}: ComposeDialogProps) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setTo(replyTo?.to ?? defaultTo ?? "");
      setSubject(replyTo?.subject ?? "");
      setBody("");
    }
  }, [open, replyTo, defaultTo]);

  async function handleSend() {
    if (!to || !subject || !body) {
      toast.error("Please fill in all fields");
      return;
    }

    setSending(true);
    try {
      const emailMatch = to.match(/<(.+?)>/);
      const toEmail = emailMatch ? emailMatch[1] : to;

      const res = await fetch("/api/google/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: toEmail,
          subject,
          body,
          threadId: replyTo?.threadId,
          inReplyTo: replyTo?.inReplyTo,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send");
      }

      toast.success("Email sent");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{replyTo ? "Reply" : "Compose Email"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <Label htmlFor="compose-to" className="text-xs font-medium text-muted-foreground">
              To
            </Label>
            <Input
              id="compose-to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="compose-subject" className="text-xs font-medium text-muted-foreground">
              Subject
            </Label>
            <Input
              id="compose-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="compose-body" className="text-xs font-medium text-muted-foreground">
              Message
            </Label>
            <Textarea
              id="compose-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              rows={10}
              className="resize-none"
            />
          </div>
        </div>

        <div className="border-t px-6 py-3 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSend} disabled={sending}>
            {sending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
