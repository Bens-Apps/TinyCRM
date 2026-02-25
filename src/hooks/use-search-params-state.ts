"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useSearchParamsState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const getParam = useCallback(
    (key: string, defaultValue?: string) => {
      return searchParams.get(key) ?? defaultValue ?? "";
    },
    [searchParams]
  );

  return { setParam, getParam, searchParams };
}
