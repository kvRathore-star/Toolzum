"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Download } from "lucide-react";
import { getFingerprint } from "@/utils/freeUsageGuard";

const PRO_REMAINING = 999;

interface CheckResponse {
  allowed: boolean;
  remaining: number;
}

async function fetchRemaining(): Promise<number | null> {
  try {
    const res = await fetch("/api/downloads/check", {
      headers: { "x-download-fingerprint": getFingerprint() },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as CheckResponse;
    return data.remaining;
  } catch {
    return null;
  }
}

export function DownloadQuotaBadge() {
  const [remaining, setRemaining] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    const value = await fetchRemaining();
    if (value !== null) setRemaining(value);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => refresh(), 0);
    const onDownload = () => refresh();
    window.addEventListener("toolzum:download-completed", onDownload);
    window.addEventListener("toolzum:download-blocked", onDownload);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("toolzum:download-completed", onDownload);
      window.removeEventListener("toolzum:download-blocked", onDownload);
    };
  }, [refresh]);

  if (remaining === null || remaining >= PRO_REMAINING) return null;

  const isZero = remaining === 0;

  return (
    <>
      <span className="w-[1px] h-3 bg-[var(--border-subtle)]" />
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)] tracking-wide bg-[var(--bg-overlay)] border border-[var(--border-subtle)] px-3 sm:px-4 py-2 rounded-full">
        <Download
          className={`w-3.5 h-3.5 ${isZero ? "text-[var(--danger)]" : "text-[var(--accent)]"}`}
        />
        {isZero
          ? "Free downloads used up today"
          : `${remaining} free ${remaining === 1 ? "download" : "downloads"} left today`}
      </span>
    </>
  );
}
