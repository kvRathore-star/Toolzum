"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";

const STORAGE_KEYS = {
  count: "th_free_uses",
  fingerprint: "th_fp",
  signedInCount: "th_free_signed",
  resetDate: "th_reset",
};

export const ANON_LIMIT = 2;
export const SIGNED_IN_EXTRA = 3;
const TOTAL_FREE = ANON_LIMIT + SIGNED_IN_EXTRA;

function getFingerprint(): string {
  if (typeof window === "undefined") return "ssr";
  const raw = [
    navigator.userAgent,
    screen.width,
    screen.height,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join("|");
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const chr = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString(36);
}

function getResetMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}`;
}

function isNewMonth(stored: string | null): boolean {
  return stored !== getResetMonth();
}

function readCount(key: string): number {
  try {
    const v = localStorage.getItem(key);
    return v ? parseInt(v, 10) || 0 : 0;
  } catch (e) {
    console.error("[toolhub]", e);
    return 0;
  }
}

function writeCount(key: string, value: number) {
  try {
    localStorage.setItem(key, String(value));
  } catch (e) {
    console.error("[toolhub]", e);
  }
}

function detectTampering(): boolean {
  try {
    const fp = localStorage.getItem(STORAGE_KEYS.fingerprint);
    return fp !== null && fp !== getFingerprint();
  } catch (e) {
    console.error("[toolhub]", e);
    return false;
  }
}

export function useFreeUsage() {
  const { data: session } = useSession();
  const isSignedIn = !!session?.user;
  const [remaining, setRemaining] = useState(TOTAL_FREE);

  const sync = useCallback(() => {
    try {
      if (isNewMonth(localStorage.getItem(STORAGE_KEYS.resetDate))) {
        localStorage.setItem(STORAGE_KEYS.resetDate, getResetMonth());
        writeCount(STORAGE_KEYS.count, 0);
        writeCount(STORAGE_KEYS.signedInCount, 0);
        localStorage.setItem(STORAGE_KEYS.fingerprint, getFingerprint());
      }

      if (detectTampering()) {
        writeCount(STORAGE_KEYS.count, ANON_LIMIT);
        writeCount(STORAGE_KEYS.signedInCount, SIGNED_IN_EXTRA);
        localStorage.setItem(STORAGE_KEYS.fingerprint, getFingerprint());
      }

      const anonUsed = readCount(STORAGE_KEYS.count);
      const signedUsed = readCount(STORAGE_KEYS.signedInCount);
      const totalUsed = isSignedIn ? anonUsed + signedUsed : anonUsed;
      setRemaining(Math.max(0, TOTAL_FREE - totalUsed));
    } catch (e) {
      console.error("[toolhub]", e);
      setRemaining(0);
    }
  }, [isSignedIn]);

  useEffect(() => {
    sync();
  }, [sync]);

  // Multi-tab sync: listen for storage changes from other tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.count || e.key === STORAGE_KEYS.signedInCount) {
        sync();
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [sync]);

  const recordUse = useCallback(() => {
    try {
      if (isNewMonth(localStorage.getItem(STORAGE_KEYS.resetDate))) {
        localStorage.setItem(STORAGE_KEYS.resetDate, getResetMonth());
        writeCount(STORAGE_KEYS.count, 0);
        writeCount(STORAGE_KEYS.signedInCount, 0);
      }

      const anonUsed = readCount(STORAGE_KEYS.count);
      if (anonUsed < ANON_LIMIT) {
        writeCount(STORAGE_KEYS.count, anonUsed + 1);
      } else if (isSignedIn) {
        const signedUsed = readCount(STORAGE_KEYS.signedInCount);
        if (signedUsed < SIGNED_IN_EXTRA) {
          writeCount(STORAGE_KEYS.signedInCount, signedUsed + 1);
        }
      }

      localStorage.setItem(STORAGE_KEYS.fingerprint, getFingerprint());
      sync();
    } catch (e) {
      console.error("[toolhub]", e);
    }
  }, [isSignedIn, sync]);

  const canUse = remaining > 0;
  const showSignInPrompt = remaining === 0 && !isSignedIn;
  const showProPrompt = remaining === 0 && isSignedIn;

  return { remaining, canUse, recordUse, showSignInPrompt, showProPrompt, isSignedIn };
}
