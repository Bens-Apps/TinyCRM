"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

export function SearchInput({
  placeholder = "Search...",
  value: externalValue,
  onChange,
  debounceMs = 300,
}: SearchInputProps) {
  const [internal, setInternal] = useState(externalValue ?? "");

  useEffect(() => {
    if (externalValue !== undefined) setInternal(externalValue);
  }, [externalValue]);

  useEffect(() => {
    const timer = setTimeout(() => onChange(internal), debounceMs);
    return () => clearTimeout(timer);
  }, [internal, debounceMs, onChange]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={internal}
        onChange={(e) => setInternal(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
