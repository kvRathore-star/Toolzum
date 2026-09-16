'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';
import { mayCollectTelemetry } from '@/lib/consent';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

let initialized = false;

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lastPath = useRef(pathname);

  useEffect(() => {
    if (!POSTHOG_KEY || initialized) return;
    // #26: an explicit Decline in the consent banner disables PostHog.
    if (!mayCollectTelemetry()) return;
    initialized = true;

    posthog.init(POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: false,
      loaded: (ph) => {
        if (process.env.NODE_ENV === 'development') ph.opt_out_capturing();
      },
    });
  }, []);

  useEffect(() => {
    if (!POSTHOG_KEY || !initialized) return;
    posthog.capture('$pageview');
  }, [pathname]);

  return <>{children}</>;
}
