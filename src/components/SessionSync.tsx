"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { setSignedIn } from "@/lib/session-state";

/**
 * Publishes the better-auth session (httpOnly — unreadable by JS directly)
 * into session-state so non-React utils and event-driven components can
 * know whether the visitor is signed in. Must stay mounted app-wide.
 */
export function SessionSync() {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    // Wait for the initial probe to resolve — flipping to false first and
    // then true would fire a spurious auth-changed event on every load.
    if (isPending) return;
    setSignedIn(!!session?.user);
  }, [session?.user, isPending]);

  return null;
}
