"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getSignedInStatus } from "@/lib/session-state";
import { getConsent } from "@/lib/consent";

const DISMISS_KEY = "toolzum:success-nudge-dismissed";

/**
 * Post-success signup nudge (funnel moment 2): after an anonymous user's
 * first completed download, offer the free account once — history plus the
 * one-time AI trial credits. Never before success, never twice, never over
 * the cookie banner (waits for consent) or the tour.
 */
export function SuccessSignupNudge() {
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* private mode — stays hidden this session */
    }
    setVisible(false);
  }, []);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return;
    }
    if (dismissed) return;
    const onDownload = () => {
      try {
        if (localStorage.getItem(DISMISS_KEY) === "1") return;
        if (getSignedInStatus()) return;
        if (getConsent() === null) return;
        setVisible(true);
      } catch {
        /* stay silent */
      }
    };
    window.addEventListener("toolzum:download-completed", onDownload);
    return () => window.removeEventListener("toolzum:download-completed", onDownload);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Free account offer"
      className="fixed bottom-4 right-4 z-[9990] w-[300px] rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 shadow-xl"
    >
      <p className="text-sm font-semibold text-[var(--text-primary)]">Nice work — that was free, no account needed.</p>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">
        A free account lets you try AI summarize and translate (5 free credits) and process up to 25 files at once.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Link
          href="/sign-in"
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent-ink)] text-white hover:bg-[var(--accent-hover)] transition-colors min-h-[32px] inline-flex items-center"
        >
          Sign in free
        </Link>
        <button
          onClick={dismiss}
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors min-h-[32px]"
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
