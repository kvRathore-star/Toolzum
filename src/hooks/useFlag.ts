"use client";

import { useEffect, useState } from "react";

/**
 * Client view of the flag service (#41/49). Server enforcement is what
 * matters (endpoints 503 when killed); this only keeps the UI honest.
 * Unknown flags fall back to local defaults — a flags outage never
 * breaks the page, it just shows the default affordances.
 */

export const FLAG_DEFAULTS: Record<string, boolean> = {
  ai_generation: true,
  ai_image_gemini: false,
};

const CACHE_KEY = "tzum_flags";
const CACHE_TTL_MS = 5 * 60 * 1000;

let inflight: Promise<Record<string, boolean>> | null = null;

async function fetchFlags(): Promise<Record<string, boolean>> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { at, flags } = JSON.parse(cached) as {
        at: number;
        flags: Record<string, boolean>;
      };
      if (Date.now() - at < CACHE_TTL_MS) return { ...FLAG_DEFAULTS, ...flags };
    }
  } catch {
    /* uncached */
  }
  if (!inflight) {
    inflight = fetch("/api/flags")
      .then((r) => (r.ok ? r.json() : { flags: {} }))
      .then(
        (d) =>
          ({ ...FLAG_DEFAULTS, ...((d as { flags?: Record<string, boolean> }).flags ?? {}) }) as Record<
            string,
            boolean
          >,
      )
      .catch(() => ({ ...FLAG_DEFAULTS }) as Record<string, boolean>)
      .finally(() => {
        inflight = null;
      });
  }
  const flags = await inflight;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), flags }));
  } catch {
    /* cache best-effort */
  }
  return flags;
}

/** Live flag value (defaults until fetched). Revalidates on mount. */
export function useFlag(key: string): boolean {
  const [enabled, setEnabled] = useState<boolean>(FLAG_DEFAULTS[key] ?? true);
  useEffect(() => {
    let cancelled = false;
    fetchFlags().then((flags) => {
      if (!cancelled) setEnabled(flags[key] ?? FLAG_DEFAULTS[key] ?? true);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);
  return enabled;
}
