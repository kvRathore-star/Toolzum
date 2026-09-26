"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { ThumbsUp, ThumbsDown, X } from "lucide-react";
import { mayCollectTelemetry } from "@/lib/consent";

const SURVEY_KEY = "th_survey_shown";

export function PostDownloadSurvey() {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handler = () => {
      if (localStorage.getItem(SURVEY_KEY)) return;
      timerRef.current = setTimeout(() => setVisible(true), 2000);
    };
    window.addEventListener("toolzum:download-completed", handler);
    return () => {
      window.removeEventListener("toolzum:download-completed", handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(SURVEY_KEY, "1"); } catch (e) { console.error("[toolzum]", e); }
  };

  const respond = (helpful: boolean) => {
    const vote = helpful ? 'yes' : 'no';
    // Local first (instant, offline-safe), server second (best-effort —
    // a failed POST must never block or error the survey UX).
    try {
      const responses = JSON.parse(localStorage.getItem("th_survey_responses") || "[]");
      responses.push({ helpful, timestamp: Date.now() });
      localStorage.setItem("th_survey_responses", JSON.stringify(responses));
      localStorage.setItem(SURVEY_KEY, "1");
    } catch (e) { console.error("[toolzum]", e); }
    // Telemetry leg honors the GDPR choice: Decline keeps the vote local
    // only (localStorage above) — the network send is non-essential.
    if (mayCollectTelemetry()) {
      try {
        fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: window.location.pathname || '/', event: 'vote', vote }),
        }).catch(() => {});
      } catch { /* best-effort */ }
    }
    setVisible(false);
    if (helpful) {
      toast.success("Glad it helped!");
      return;
    }
    // "No" needs a real channel — prefill the contact form so the
    // complaint actually reaches us instead of dying in localStorage.
    const page = window.location.pathname || "this tool";
    window.location.href =
      `/contact?subject=general&message=${encodeURIComponent(`Feedback: ${page} wasn't helpful because… `)}`;
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] w-[90vw] max-w-sm">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] shadow-xl p-4">
        <button
          onClick={dismiss}
          className="absolute top-2 right-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          aria-label="Dismiss survey"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <p className="text-sm font-medium text-[var(--text-primary)] mb-3">
          Was this tool helpful?
        </p>
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => respond(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--success)]/10 text-[var(--success)] text-xs font-semibold hover:bg-[var(--success)]/20 transition-colors"
          >
            <ThumbsUp className="w-3.5 h-3.5" /> Yes
          </button>
          <button
            onClick={() => respond(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors"
          >
            <ThumbsDown className="w-3.5 h-3.5" /> No
          </button>
        </div>
      </div>
    </div>
  );
}
