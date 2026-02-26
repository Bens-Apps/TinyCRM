"use client";

import { useState } from "react";
import useSWR from "swr";
import { Search, RefreshCw, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmailListItem } from "./email-list-item";
import { ThreadView } from "./thread-view";
import { ComposeDialog } from "./compose-dialog";
import type { GmailListResponse } from "@/types/gmail";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PAGE_SIZES = [10, 25, 50] as const;

export function InboxView() {
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState<number>(25);
  const [pageTokens, setPageTokens] = useState<string[]>([]);
  const [currentPageToken, setCurrentPageToken] = useState<string | undefined>();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const query = searchQuery
    ? `in:inbox category:primary ${searchQuery}`
    : "in:inbox category:primary";
  const url = `/api/google/gmail?q=${encodeURIComponent(query)}&maxResults=${pageSize}${currentPageToken ? `&pageToken=${currentPageToken}` : ""}`;

  const { data, isLoading, mutate } = useSWR<GmailListResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setCurrentPageToken(undefined);
    setPageTokens([]);
    setSearchQuery(search);
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

  function handlePageSizeChange(value: string) {
    setPageSize(parseInt(value, 10));
    setCurrentPageToken(undefined);
    setPageTokens([]);
  }

  const pageNumber = pageTokens.length + 1;

  return (
    <>
      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search emails..."
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => mutate()} title="Refresh">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setComposeOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Compose
          </Button>
        </div>
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-y-auto rounded-xl border shadow-sm" style={{ maxHeight: "calc(100vh - 260px)" }}>
        {isLoading && !data ? (
          <div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b px-5 py-4">
                <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : data?.messages?.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
            <Search className="h-8 w-8" />
            <p className="text-sm">No emails found</p>
          </div>
        ) : (
          <div>
            {data?.messages?.map((message) => (
              <EmailListItem
                key={message.id}
                message={message}
                onClick={() => setSelectedThreadId(message.threadId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Show</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
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
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrevPage}
            disabled={pageTokens.length === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextPage}
            disabled={!data?.nextPageToken}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Thread modal */}
      <ThreadView
        threadId={selectedThreadId}
        open={!!selectedThreadId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedThreadId(null);
            mutate();
          }
        }}
      />

      <ComposeDialog open={composeOpen} onOpenChange={setComposeOpen} />
    </>
  );
}
