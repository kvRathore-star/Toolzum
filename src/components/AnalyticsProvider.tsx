"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { mayCollectTelemetry } from '@/lib/consent';

export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // #26: an explicit Decline in the consent banner disables first-party telemetry.
    if (!mayCollectTelemetry()) return;
    // Zero-Knowledge Cookieless Telemetry Dispatcher
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    const payload = {
      path: url,
      timestamp: new Date().toISOString(),
      clientType: navigator.userAgent.includes('Capacitor') ? 'Android Native' : 'Web Browser',
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      // Strictly NO IP, NO cookies, NO geographical trackers
    };

    // Dispatch to a real API endpoint instead of console log
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(err => console.error('Failed to log telemetry', err));
  }, [pathname, searchParams]);

  return null;
}
