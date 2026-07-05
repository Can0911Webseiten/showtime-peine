"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Keeps the owner dashboard reasonably live without a full realtime backend. */
export function AutoRefresh({ intervalMs = 25_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
