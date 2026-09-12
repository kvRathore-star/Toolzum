"use client";
import React, { useState } from 'react';
import { FileText, Crown, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useIsIndia } from '@/hooks/useIsIndia';
import { useSession } from '@/lib/auth-client';
import { getSignedInStatus } from '@/utils/freeUsageGuard';

export function BulkDropPaywall() {
  const [files, setFiles] = useState<File[]>([]);
  const [showModal, setShowModal] = useState(false);
  const isIndia = useIsIndia();
  const { data: session } = useSession();
  const isPro = (session?.user as Record<string, unknown> | undefined)?.plan === 'pro';

  React.useEffect(() => {
    if (isPro) return; // Pro handles 500-file batches — never upsell Pro users.
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.files;
      if (items && items.length > 1) {
        const fileList = Array.from(items);
        // Cap-aware: guests 1, signed-in 10 (matches check-plan.ts). Pasting
        // within the free batch is fine — don't push Pro, just confirm.
        const cap = getSignedInStatus() ? 10 : 1;
        if (fileList.length <= cap) {
          e.preventDefault();
          toast.success(`${fileList.length} files ready — drop them into the tool (up to ${cap}/batch free)`);
          return;
        }
        e.preventDefault();
        setFiles(fileList);
        setShowModal(true);
      }
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [isPro]);

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <FileText className="w-6 h-6 text-amber-500" />
              </div>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Bulk Processing Detected</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              You dropped <strong>{files.length} files</strong>. Free batches run up to 10 files (guests: 1 file at a time) — sign in free or drop fewer files.
            </p>
            <p className="text-xs text-[var(--text-muted)] mb-5">
              Pro processes up to <strong>500 files in parallel</strong>.
            </p>
            <div className="space-y-2.5">
              <Link
                href="/pricing"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-[var(--radius-lg)] transition-all text-sm"
              >
                <Crown className="w-4 h-4" /> Upgrade to Pro — {files.length <= 1 ? (isIndia ? '₹249/mo' : '$14.99/mo') : 'Batch 500 files'}
              </Link>
              <button
                onClick={() => {
                  setShowModal(false);
                  toast.success('Drop individual files one at a time');
                }}
                className="w-full text-center text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline transition-colors"
              >
                Continue with 1 file at a time
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
