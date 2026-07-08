"use client";

import { useSession } from "@/lib/auth-client";

export const ANON_LIMIT = 999; // unlimited client-side (server enforces daily)
export const SIGNED_IN_EXTRA = 999; // unlimited client-side

export const ANON_MAX_SIZE_MB = 10;
export const SIGNED_MAX_SIZE_MB = 25;
export const PRO_MAX_SIZE_MB = 2000;

export const ANON_MAX_BATCH = 1;
export const SIGNED_MAX_BATCH = 10;
export const PRO_MAX_BATCH = 500;

export function useFreeUsage(_category?: string) {
  const { data: session } = useSession();
  const isSignedIn = !!session?.user;
  const isPro = isSignedIn && (session?.user as Record<string, unknown>)?.plan === 'pro';

  const freeMaxSizeMB = isPro ? PRO_MAX_SIZE_MB : isSignedIn ? SIGNED_MAX_SIZE_MB : ANON_MAX_SIZE_MB;
  const freeMaxBatch = isPro ? PRO_MAX_BATCH : isSignedIn ? SIGNED_MAX_BATCH : ANON_MAX_BATCH;

  return {
    remaining: 999,
    canUse: true,
    recordUse: () => {},
    showSignInPrompt: false,
    showProPrompt: false,
    isSignedIn,
    freeMaxSizeMB,
    freeMaxBatch,
  };
}
