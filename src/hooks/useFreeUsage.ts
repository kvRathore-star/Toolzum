"use client";

import { useSession } from "@/lib/auth-client";

export function useFreeUsage(_category?: string) {
  const { data: session } = useSession();
  const isSignedIn = !!session?.user;

  return {
    remaining: 999,
    canUse: true,
    recordUse: () => {},
    showSignInPrompt: false,
    showProPrompt: false,
    isSignedIn,
  };
}
