"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "@/lib/auth-client";

const STORAGE_KEY = "toolzum_onboarded";
export const REPLAY_TOUR_EVENT = "toolzum:replay-tour";

export interface TourStep {
  /** CSS selector for the anchor element. Omitted → centered card. */
  anchor?: string;
  title: string;
  body: string;
}

const SITE_STEPS: TourStep[] = [
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

interface OnboardingTourProps {
  steps?: TourStep[];
  /** localStorage flag — one show per device per key. */
  storageKey?: string;
  /** aria-label prefix: "… tour, step N of M". */
  label?: string;
  /** Mirror "seen" to /api/account/tour for signed-in users (site tour only). */
  syncAccount?: boolean;
  /** Footer replay event; null → no replay entry point. */
  replayEvent?: string | null;
  /**
   * Hold until the site tour is done (its flag set OR its dialog gone) so
   * two tours never stack when a first visit lands straight on a tool page.
   * The dialog check covers private mode, where the flag write throws but
   * the dialog still closes. Site instance: off — it IS the site tour.
   */
  deferUntilSiteTour?: boolean;
}

/**
 * First-visit tooltip tour. Shows once (localStorage flag), dismissible
 * via Next/Skip/Escape, never blocks. Steps 1–2 anchor to header
 * elements; step 3 is a centered card. Copy approved as product voice —
 * keep the "most tools" qualifier honest for cloud-AI tools.
 *
 * Parameterized: the PDF editor mounts its own instance (own steps, own
 * flag, localStorage-only — no account sync, no replay event). Defaults
 * are the site tour, behavior unchanged.
 */
export function OnboardingTour({
  steps = SITE_STEPS,
  storageKey = STORAGE_KEY,
  label = "Welcome tour",
  syncAccount = true,
  replayEvent = REPLAY_TOUR_EVENT,
  deferUntilSiteTour = false,
}: OnboardingTourProps = {}) {
  const [step, setStep] = useState<number | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const { data: session, isPending } = useSession();
  const isSignedIn = !!session?.user;

  const persistSeen = useCallback(
    async (seen: boolean) => {
      try {
        if (seen) localStorage.setItem(storageKey, "1");
        else localStorage.removeItem(storageKey);
      } catch {
        /* private mode — server flag still applies for signed users */
      }
      if (isSignedIn && syncAccount) {
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
    [isSignedIn, syncAccount, storageKey],
  );

  useEffect(() => {
    if (isPending) return;
    let cancelled = false;
    let poll: ReturnType<typeof setInterval> | null = null;
    const flagSet = () => {
      try {
        return !!localStorage.getItem(storageKey);
      } catch {
        return false;
      }
    };
    const siteTourDone = () => {
      try {
        if (localStorage.getItem(STORAGE_KEY)) return true;
      } catch {
        /* private mode — fall through to the dialog check */
      }
      return !document.querySelector('[aria-label^="Welcome tour"]');
    };
    (async () => {
      if (flagSet()) return;
      // First success before first tour: the tour waits for the user's
      // first completed download (th_last_download, set by the download
      // gate) instead of stacking on the cookie banner at first paint.
      // Users who never complete a task never need the tour.
      const firstSuccess = () => {
        try {
          return !!localStorage.getItem("th_last_download");
        } catch {
          return false;
        }
      };
      if (isSignedIn && syncAccount) {
        try {
          const res = await fetch("/api/account/tour");
          if (res.ok) {
            const data = (await res.json()) as { seen?: boolean };
            if (data.seen) {
              try {
                localStorage.setItem(storageKey, "1");
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
      if (cancelled) return;
      // Site tour only (tool tours keep instant behavior — their user is
      // already mid-task): wait for the first completed download.
      if (!deferUntilSiteTour && !firstSuccess()) {
        // No completed task yet: poll cheaply for the first download, then
        // show once. Same no-stack discipline as the site-tour deferral.
        poll = setInterval(() => {
          if (cancelled) return;
          if (!firstSuccess()) return;
          clearInterval(poll!);
          poll = null;
          if (!flagSet()) setStep(0);
        }, 1000);
        return;
      }
      if (deferUntilSiteTour && !siteTourDone()) {
        // Poll cheaply until the site tour finishes (flag set or dialog
        // closed) — a second dialog must never stack on the first.
        poll = setInterval(() => {
          if (cancelled || !siteTourDone()) return;
          clearInterval(poll!);
          poll = null;
          if (!flagSet()) setStep(0);
        }, 500);
        return;
      }
      // Intentional: show tour exactly once on first mount.
      setStep(0);
    })();
    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
    };
  }, [isPending, isSignedIn, syncAccount, storageKey, deferUntilSiteTour]);

  // Footer "Replay tour" entry point — resets both flags and restarts.
  useEffect(() => {
    if (replayEvent === null) return;
    const onReplay = () => {
      void persistSeen(false).finally(() => setStep(0));
    };
    window.addEventListener(replayEvent, onReplay);
    return () => window.removeEventListener(replayEvent, onReplay);
  }, [replayEvent, persistSeen]);

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
      const anchor = steps[step]!.anchor
        ? document.querySelector(steps[step]!.anchor as string)
        : null;
      // Hidden anchors (e.g. `header nav` is display:none on mobile) still
      // query-match but report a zero rect — treat them as missing so the
      // card centers instead of pinning to the top-left corner.
      const r = anchor instanceof HTMLElement ? anchor.getBoundingClientRect() : null;
      if (!anchor || !r || (r.width === 0 && r.height === 0)) {
        setPos(null);
        return;
      }
      setPos({
        // Fixed positioning = viewport coords: NO scroll offsets here
        // (adding scrollY/scrollX pushed the card off-screen on scrolled pages).
        top: Math.min(r.bottom + 12, window.innerHeight - 180),
        left: Math.max(16, Math.min(r.left, window.innerWidth - 336)),
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
  }, [step, dismiss, steps]);

  if (step === null) return null;
  const current = steps[step];
  const last = step === steps.length - 1;

  return (
    <div
      role="dialog"
      aria-label={`${label}, step ${step + 1} of ${steps.length}`}
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
            {step + 1} / {steps.length}
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
