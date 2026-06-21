"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { ThumbsUp, ThumbsDown, X } from "lucide-react";

const SURVEY_KEY = "th_survey_shown";

export function PostDownloadSurvey() {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handler = () => {
      if (localStorage.getItem(SURVEY_KEY)) return;
      timerRef.current = setTimeout(() => setVisible(true), 2000);
    };
    window.addEventListener("toolhub:download-completed", handler);
    return () => {
      window.removeEventListener("toolhub:download-completed", handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(SURVEY_KEY, "1"); } catch (e) { console.error("[toolhub]", e); }
  };

  const respond = (helpful: boolean) => {
    try {
      const responses = JSON.parse(localStorage.getItem("th_survey_responses") || "[]");
      responses.push({ helpful, timestamp: Date.now() });
      localStorage.setItem("th_survey_responses", JSON.stringify(responses));
      localStorage.setItem(SURVEY_KEY, "1");
    } catch (e) { console.error("[toolhub]", e); }
    toast.success(helpful ? "Thanks for your feedback!" : "We'll work on improving.");
    setVisible(false);
  };

  const emailCapture = (email: string) => {
    try {
      const emails = JSON.parse(localStorage.getItem("th_email_captures") || "[]");
      emails.push({ email, timestamp: Date.now() });
      localStorage.setItem("th_email_captures", JSON.stringify(emails));
      localStorage.setItem(SURVEY_KEY, "1");
    } catch (e) { console.error("[toolhub]", e); }
    toast.success("We'll keep you posted!");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] w-[90vw] max-w-sm">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] shadow-xl p-4">
        <button
          onClick={dismiss}
          className="absolute top-2 right-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          aria-label="Dismiss"
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors"
          >
            <ThumbsDown className="w-3.5 h-3.5" /> No
          </button>
        </div>

        <details className="group">
          <summary className="text-[11px] text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-primary)] transition-colors [&::-webkit-details-marker]:hidden">
            Get notified about new tools
          </summary>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.target as HTMLFormElement).elements.namedItem("email") as HTMLInputElement;
              if (input.value) emailCapture(input.value);
            }}
            className="flex gap-2 mt-2"
          >
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent)] text-white hover:brightness-110 transition-all"
            >
              Subscribe
            </button>
          </form>
        </details>
      </div>
    </div>
  );
}
