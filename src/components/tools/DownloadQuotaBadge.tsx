"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Download } from "lucide-react";
import { getFingerprint } from "@/utils/freeUsageGuard";
import { proSlugs } from "@/registry/tools-constants";

const PRO_SLUG_SET = new Set(proSlugs);
const PRO_REMAINING = 999;

interface CheckResponse {
  allowed: boolean;
  remaining: number;
}

function isCurrentToolPro(): boolean {
  if (typeof window === "undefined") return false;
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts.length >= 2 ? PRO_SLUG_SET.has(parts[1]) : false;
}

async function fetchRemaining(): Promise<number | null> {
  try {
    const isPro = isCurrentToolPro();
    const url = isPro ? "/api/downloads/check?isPro=1" : "/api/downloads/check";
    const res = await fetch(url, {
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
  const [isProTool, setIsProTool] = useState(false);

  const refresh = useCallback(async () => {
    const proTool = isCurrentToolPro();
    setIsProTool(proTool);
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

  const label = isProTool
    ? isZero
      ? "Pro downloads used up today"
      : `${remaining} Pro ${remaining === 1 ? "download" : "downloads"} left — Upgrade for unlimited`
    : isZero
      ? "Free downloads used up today"
      : `${remaining} free ${remaining === 1 ? "download" : "downloads"} left today`;

  return (
    <>
      <span className="w-[1px] h-3 bg-[var(--border-subtle)]" />
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)] tracking-wide bg-[var(--bg-overlay)] border border-[var(--border-subtle)] px-3 sm:px-4 py-2 rounded-full">
        <Download
          className={`w-3.5 h-3.5 ${isZero ? "text-[var(--danger)]" : "text-[var(--accent)]"}`}
        />
        {label}
      </span>
    </>
  );
}
