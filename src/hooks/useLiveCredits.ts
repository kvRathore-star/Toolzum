"use client";

import { useEffect, useState } from "react";
import { FREE_CREDITS, PRO_CREDITS } from "@/lib/planTiers";

export interface LiveCredits {
  credits: number;
  plan: string;
  allowance: number;
}

/**
 * Live credit balance from D1. The `credits` field on the session snapshot
 * only refreshes on the rolling session window (up to 1 day), so it goes
 * stale after AI use — dashboard and account pages overlay this and fall
 * back to the session value when the fetch fails (offline, 401, 503).
 */
export function useLiveCredits(active: boolean): LiveCredits | null {
  const [live, setLive] = useState<LiveCredits | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/account/credits");
        if (!res.ok) return;
        const data = (await res.json()) as Partial<LiveCredits>;
        if (cancelled || typeof data.credits !== "number") return;
        setLive({
          credits: data.credits,
          plan: typeof data.plan === "string" ? data.plan : "free",
          allowance: typeof data.allowance === "number"
            ? data.allowance
            : data.plan === "pro" ? PRO_CREDITS : FREE_CREDITS,
        });
      } catch {
        // Session value remains the fallback — never blank the UI.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active]);

  return live;
}
