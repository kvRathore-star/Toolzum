"use client";

import React from 'react';
import Link from 'next/link';
import { Crown, Lock, Sparkles, Zap, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToolPaywallProps {
  isLocked: boolean;
  showSignInPrompt: boolean;
  proToolCount: number;
  toolCount: number;
  title: string;
  children: React.ReactNode;
}

export function ToolPaywall({ isLocked, showSignInPrompt, proToolCount, title, children }: ToolPaywallProps) {
  if (!isLocked) return <>{children}</>;

  // Anonymous visitors hit the sign-in variant: free accounts get 2 Pro
  // downloads/day, so Sign in (not Upgrade) is the primary CTA. The
  // upgrade-first variant below is the fallback for unknown plans.
  const signInFirst = showSignInPrompt;

  return (
    <div className="relative overflow-hidden">
      <div className={isLocked ? "blur-md pointer-events-none select-none opacity-40 transition-all duration-300" : "transition-all duration-300"}>
        {children}
      </div>

      {isLocked && (
        <div className="absolute inset-0 z-50 flex items-start sm:items-center justify-center p-6 overflow-y-auto">
          <div className="absolute inset-0 bg-black/40" />
          <div className={`relative w-full max-w-md my-auto max-h-full overflow-y-auto overflow-x-hidden bg-[var(--bg-overlay)] border-2 border-[var(--accent)] rounded-[var(--radius-2xl)] text-center shadow-2xl ${signInFirst ? "p-6" : "p-8"}`}>
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-[var(--accent-ink)]/10 blur-2xl rounded-full pointer-events-none" />

            <div className={`bg-[var(--accent-ink)]/15 rounded-full flex items-center justify-center mx-auto border border-[var(--accent)]/30 ${signInFirst ? "w-11 h-11 mb-4" : "w-14 h-14 mb-6"}`}>
              <Lock className={`text-[var(--accent)] ${signInFirst ? "w-5 h-5" : "w-6 h-6"}`} />
            </div>
            <h3 className={`font-bold text-white mb-2 ${signInFirst ? "text-xl" : "text-2xl"}`}>{signInFirst ? "Sign in to use this Pro tool" : "Pro Feature"}</h3>
            <p className={`text-sm text-[var(--text-secondary)] ${signInFirst ? "mb-5" : "mb-6"}`}>
              {signInFirst ? (
                <><strong>{title}</strong> is premium. Sign in free for 2 Pro downloads per day, or upgrade for unlimited access plus {proToolCount} other professional-grade tools.</>
              ) : (
                <><strong>{title}</strong> is a premium Pro tool. Upgrade to unlock it plus {proToolCount} other professional-grade tools.</>
              )}
            </p>

            {!signInFirst && (
            <div className="grid grid-cols-2 gap-2 mb-6 text-left">
              <div className="p-2.5 rounded-[var(--radius-md)] bg-zinc-800/50 border border-zinc-700/50">
                <Upload className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 mb-1" />
                <div className="text-[11px] font-medium text-white">Up to 2GB</div>
                <div className="text-[10px] text-zinc-400">file size limit</div>
              </div>
              <div className="p-2.5 rounded-[var(--radius-md)] bg-zinc-800/50 border border-zinc-700/50">
                <Zap className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 mb-1" />
                <div className="text-[11px] font-medium text-white">Bulk Batch</div>
                <div className="text-[10px] text-zinc-400">up to 500 files</div>
              </div>
              <div className="p-2.5 rounded-[var(--radius-md)] bg-zinc-800/50 border border-zinc-700/50">
                <Sparkles className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400 mb-1" />
                <div className="text-[11px] font-medium text-white">AI Engine</div>
                <div className="text-[10px] text-zinc-400">OCR & generation</div>
              </div>
              <div className="p-2.5 rounded-[var(--radius-md)] bg-zinc-800/50 border border-zinc-700/50">
                <Crown className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 mb-1" />
                <div className="text-[11px] font-medium text-white">White-label</div>
                <div className="text-[10px] text-zinc-400">no watermarks</div>
              </div>
            </div>
            )}

            <div className="space-y-3">
              {signInFirst ? (
                <>
                  <Link href="/sign-in" className="block w-full">
                    <Button variant="primary" className="w-full py-5 text-base" size="lg">
                      Sign in free — 2 Pro downloads/day
                    </Button>
                  </Link>
                  <Link href="/pricing" className="block w-full text-center text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline transition-colors">
                    Or upgrade to Pro for unlimited
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/pricing" className="block w-full">
                    <Button variant="primary" className="w-full py-5 text-base" size="lg">
                      Upgrade to Pro <Crown className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                  <div className="text-xs text-[var(--text-muted)] pt-1 text-center">
                    Already subscribed?{' '}
                    <Link href="/dashboard" className="text-[var(--accent)] hover:underline font-semibold">
                      Log in to unlock
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
