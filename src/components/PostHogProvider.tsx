'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';
import { mayCollectTelemetry, onConsentChange } from '@/lib/consent';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

let initialized = false;

function syncConsent() {
  // Runs on mount and on every banner choice. Covers the mount-before-
  // choice race (providers mount before the visitor chooses) and the
  // Accept → reset → Decline path (opt-out must revoke, not just stop).
  if (!mayCollectTelemetry()) {
    if (initialized) posthog.opt_out_capturing();
    return;
  }
  if (!initialized) {
    if (!POSTHOG_KEY) return;
    initialized = true;
    posthog.init(POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: false,
      loaded: (ph) => {
        if (process.env.NODE_ENV === 'development') ph.opt_out_capturing();
      },
    });
  } else {
    posthog.opt_in_capturing();
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lastPath = useRef(pathname);

  useEffect(() => {
    syncConsent();
    return onConsentChange(syncConsent);
  }, []);

  useEffect(() => {
    if (!POSTHOG_KEY || !initialized || !mayCollectTelemetry()) return;
    posthog.capture('$pageview');
  }, [pathname]);

  return <>{children}</>;
}
