"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { getFingerprint } from "@/utils/freeUsageGuard";
import { proSlugs } from "@/registry/tools-constants";

const PRO_SLUG_SET = new Set(proSlugs);
const PRO_REMAINING = 999;

interface CheckResponse {
  allowed: boolean;
  remaining: number;
  /** Server-resolved plan ('pro' | 'free' | null for anon). Pro users always
   *  resolve to plan 'pro' with remaining 999, so the badge hides for them. */
  plan: string | null;
}

function isCurrentToolPro(): boolean {
  if (typeof window === "undefined") return false;
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts.length >= 2 ? PRO_SLUG_SET.has(parts[1]!) : false;
}

async function fetchQuota(): Promise<CheckResponse | null> {
  try {
    const isPro = isCurrentToolPro();
    const url = isPro ? "/api/downloads/check?isPro=1" : "/api/downloads/check";
    const res = await fetch(url, {
      headers: { "x-download-fingerprint": getFingerprint() },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<CheckResponse>;
    if (typeof data.remaining !== "number") return null;
    return {
      allowed: data.allowed !== false,
      remaining: data.remaining,
      plan: typeof data.plan === "string" ? data.plan : null,
    };
  } catch {
    return null;
  }
}

export function DownloadQuotaBadge() {
  const [quota, setQuota] = useState<CheckResponse | null>(null);
  const [isProTool, setIsProTool] = useState(false);

  const refresh = useCallback(async () => {
    const proTool = isCurrentToolPro();
    setIsProTool(proTool);
    const value = await fetchQuota();
    if (value !== null) setQuota(value);
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

  if (quota === null || quota.plan === "pro" || quota.remaining >= PRO_REMAINING) return null;

  const { remaining, plan } = quota;
  const isZero = remaining === 0;

  // Anonymous users get limit 0 on Pro tools — that's "sign in", not "used up".
  // Anon on free tools gets a concrete signup upside (3→5/day, 30 AI credits,
  // 10-file batch) so the value of a free account is visible pre-paywall.
  const isAnon = plan === null;
  const label = isProTool
    ? isZero && isAnon
      ? "Sign in to use Pro tools"
      : isZero
        ? "Pro downloads used up today"
        : `${remaining} Pro ${remaining === 1 ? "download" : "downloads"} left — Upgrade for unlimited`
    : isZero && isAnon
      ? "3/3 free used — sign in for more"
      : isZero
        ? "Free downloads used up today"
        : isAnon
          ? `${remaining} of 3 free left — sign in for more`
          : `${remaining} free ${remaining === 1 ? "download" : "downloads"} left today`;

  return (
    <>
      <span className="w-[1px] h-3 bg-[var(--border-subtle)]" />
      {isAnon && !isProTool ? (
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide bg-[var(--bg-overlay)] border border-[var(--border-subtle)] px-3 sm:px-4 py-2 rounded-full text-[var(--text-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
          aria-label={`${label}. Sign in free.`}
        >
          <Download
            className={`w-3.5 h-3.5 ${isZero ? "text-[var(--danger)]" : "text-[var(--accent)]"}`}
          />
          {label}
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)] tracking-wide bg-[var(--bg-overlay)] border border-[var(--border-subtle)] px-3 sm:px-4 py-2 rounded-full">
          <Download
            className={`w-3.5 h-3.5 ${isZero ? "text-[var(--danger)]" : "text-[var(--accent)]"}`}
          />
          {label}
        </span>
      )}
    </>
  );
}
