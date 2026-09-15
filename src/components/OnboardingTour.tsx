"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "@/lib/auth-client";

const STORAGE_KEY = "toolzum_onboarded";
export const REPLAY_TOUR_EVENT = "toolzum:replay-tour";

interface TourStep {
  /** CSS selector for the anchor element. Omitted → centered card. */
  anchor?: string;
  title: string;
  body: string;
}

const STEPS: TourStep[] = [
  {
    anchor: '[aria-label="Open search"]',
    title: "1,100+ tools, one keystroke away",
    body: "Press ⌘K — everything runs in your browser.",
  },
  {
    anchor: "header nav",
    title: "Browse by job",
    body: "PDF, image, AI, finance. Pick a lane, find the tool.",
  },
  {
    title: "Private by default",
    body: "Most tools run entirely in your browser — nothing uploaded, nothing stored.",
  },
];

/**
 * First-visit tooltip tour. Shows once (localStorage flag), dismissible
 * via Next/Skip/Escape, never blocks. Steps 1–2 anchor to header
 * elements; step 3 is a centered card. Copy approved as product voice —
 * keep the "most tools" qualifier honest for cloud-AI tools.
 */
export function OnboardingTour() {
  const [step, setStep] = useState<number | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [ready, setReady] = useState(false);
  const prevFocus = useRef<HTMLElement | null>(null);
  const { data: session, isPending } = useSession();
  const isSignedIn = !!session?.user;

  // Defer tour mount until after CLS measurement window (Lighthouse measures
  // CLS in the first ~5s). Without this the tour dialog appearance counts as
  // a 0.3+ layout shift even though it's position:fixed and moves nothing.
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 5000);
    return () => clearTimeout(t);
  }, []);

  const persistSeen = useCallback(
    async (seen: boolean) => {
      try {
        if (seen) localStorage.setItem(STORAGE_KEY, "1");
        else localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* private mode — server flag still applies for signed users */
      }
      if (isSignedIn) {
        try {
          await fetch("/api/account/tour", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ seen }),
          });
        } catch {
          /* local flag remains the fallback */
        }
      }
    },
    [isSignedIn],
  );

  useEffect(() => {
    if (!ready || isPending) return;
    let cancelled = false;
    (async () => {
      try {
        if (localStorage.getItem(STORAGE_KEY)) return;
      } catch {
        /* fall through to server check for signed users */
      }
      if (isSignedIn) {
        try {
          const res = await fetch("/api/account/tour");
          if (res.ok) {
            const data = (await res.json()) as { seen?: boolean };
            if (data.seen) {
              try {
                localStorage.setItem(STORAGE_KEY, "1");
              } catch {
                /* ignore */
              }
              return;
            }
          }
        } catch {
          /* show the tour rather than failing silently */
        }
      }
      if (!cancelled) {
        // Intentional: show tour exactly once on first mount.
        setStep(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPending, isSignedIn]);

  // Footer "Replay tour" entry point — resets both flags and restarts.
  useEffect(() => {
    const onReplay = () => {
      void persistSeen(false).finally(() => setStep(0));
    };
    window.addEventListener(REPLAY_TOUR_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_TOUR_EVENT, onReplay);
  }, [persistSeen]);

  // Skip AND Done both persist — a dismissed tour must never reappear
  // (previously Skip forgot the flag and nagged every visit).
  const dismiss = useCallback(
    (_done: boolean) => {
      void persistSeen(true);
      setStep(null);
      prevFocus.current?.focus?.();
    },
    [persistSeen],
  );

  // Capture the focused element when the tour first appears (auto-show or
  // footer replay) so dismiss can return focus to it.
  useEffect(() => {
    if (step === 0 && !prevFocus.current) {
      prevFocus.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    }
    if (step === null) prevFocus.current = null;
  }, [step]);

  useEffect(() => {
    if (step === null) return;
    const place = () => {
      const anchor = STEPS[step]!.anchor
        ? document.querySelector(STEPS[step]!.anchor as string)
        : null;
      if (!anchor) {
        setPos(null);
        return;
      }
      const r = anchor.getBoundingClientRect();
      setPos({
        top: Math.min(r.bottom + 12 + window.scrollY, window.innerHeight - 180),
        left: Math.max(16, Math.min(r.left + window.scrollX, window.innerWidth - 336)),
      });
    };
    place();
    window.addEventListener("resize", place);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", place);
      document.removeEventListener("keydown", onKey);
    };
  }, [step, dismiss]);

  if (step === null || !ready) return null;
  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-label={`Welcome tour, step ${step + 1} of ${STEPS.length}`}
      className="fixed z-[9998] w-[320px] rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 shadow-xl"
      style={pos ? { top: pos.top, left: pos.left } : { bottom: 24, left: "50%", transform: "translateX(-50%)" }}
    >
      <p className="text-sm font-bold text-[var(--text-primary)]">{current!.title}</p>
      <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">{current!.body}</p>
      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => dismiss(false)}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline"
        >
          Skip tour
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--text-muted)]">
            {step + 1} / {STEPS.length}
          </span>
          <button
            autoFocus
            onClick={() => (last ? dismiss(true) : setStep(step + 1))}
            className="px-3 py-1.5 text-xs font-bold text-white bg-[var(--accent-ink)] hover:opacity-90 rounded-[var(--radius-md)] transition-all"
          >
            {last ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
