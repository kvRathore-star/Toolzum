"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

const CONSENT_KEY = 'th_gdpr_consent';

export function GdprConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- show banner only after reading consent from localStorage
      if (!stored) setVisible(true);
    } catch { /* noop */ }
  }, []);

  const accept = () => {
    try { localStorage.setItem(CONSENT_KEY, 'accepted'); } catch { /* noop */ }
    setVisible(false);
  };

  const decline = () => {
    try { localStorage.setItem(CONSENT_KEY, 'declined'); } catch { /* noop */ }
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') decline();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible]);

  if (!visible) return null;

  return (
    <div role="region" aria-label="Cookie consent" className="fixed bottom-0 left-0 right-0 z-[9999] bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] shadow-2xl">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="w-5 h-5 text-[var(--text-muted)] shrink-0 mt-0.5" />
          <div id="gdpr-title" className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            We use only essential cookies and privacy-preserving analytics (no personal data collected).
            By using Toolzum, you agree to our{' '}
            <Link href="/privacy-policy" className="text-[var(--accent)] underline underline-offset-2 hover:no-underline">Privacy Policy</Link>,{' '}
            <Link href="/cookies" className="text-[var(--accent)] underline underline-offset-2 hover:no-underline">Cookie Policy</Link>, and{' '}
            <Link href="/terms" className="text-[var(--accent)] underline underline-offset-2 hover:no-underline">Terms of Service</Link>.
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] hover:bg-[var(--bg-overlay)] transition-all cursor-pointer"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-xs font-bold text-white bg-[var(--accent-ink)] hover:opacity-90 rounded-[var(--radius-lg)] transition-all cursor-pointer"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
