"use client";

import { useState, useEffect } from 'react';

/**
 * Server-truth Pro flag for client-side gating (daily caps, upload caps).
 * Resolves via /api/check-plan so Pass holders and admin grants count —
 * the raw session plan misses those. Defaults to false (free caps apply)
 * until the check answers; failures keep free caps, never block.
 */
export function useProStatus(): boolean {
  const [isPro, setIsPro] = useState(false);
  useEffect(() => {
    let live = true;
    fetch('/api/check-plan')
      .then(r => (r.ok ? r.json() : null))
      .then((d: unknown) => {
        if (!live || !d || typeof d !== 'object') return;
        if ((d as { plan?: string }).plan === 'pro') setIsPro(true);
      })
      .catch(() => {});
    return () => { live = false; };
  }, []);
  return isPro;
}
