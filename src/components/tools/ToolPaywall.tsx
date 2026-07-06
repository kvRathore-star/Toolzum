"use client";

import React from 'react';
import Link from 'next/link';
import { Crown, Lock, LogIn, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ANON_LIMIT, SIGNED_IN_EXTRA } from '@/hooks/useFreeUsage';

interface ToolPaywallProps {
  isLocked: boolean;
  isFreeTier: boolean;
  isProLocked: boolean;
  showSignInPrompt: boolean;
  proToolCount: number;
  toolCount: number;
  title: string;
  children: React.ReactNode;
}

export function ToolPaywall({ isLocked, isFreeTier, isProLocked, showSignInPrompt, proToolCount, toolCount, title, children }: ToolPaywallProps) {
  return (
    <div className="relative">
      <div className={isLocked ? "blur-md pointer-events-none select-none opacity-40 transition-all duration-300" : "transition-all duration-300"}>
        {children}
      </div>

      {isFreeTier && !isLocked && (
        <>
          <div
            className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none z-10"
            style={{ background: "linear-gradient(to bottom, transparent, var(--bg-elevated))" }}
          />
          <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center pb-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[10px] font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors"
            >
              <Crown className="w-3 h-3" />
              Upgrade to Pro for full access
            </Link>
          </div>
        </>
      )}

      {isLocked && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-md bg-[var(--bg-overlay)] border-2 border-[var(--accent)] rounded-[var(--radius-2xl)] p-8 text-center shadow-2xl overflow-hidden">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-[var(--accent)]/10 blur-2xl rounded-full pointer-events-none" />

            {isProLocked ? (
              <>
                <div className="w-14 h-14 bg-[var(--accent)]/15 rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--accent)]/30">
                  <Lock className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Pro Tool</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-6">
                  Unlock <strong>{title}</strong> and the full suite of {proToolCount} premium tools.
                </p>
                <div className="space-y-4">
                  <Link href="/pricing" className="block w-full">
                    <Button variant="primary" className="w-full py-6 text-base" size="lg">
                      Upgrade to Pro
                    </Button>
                  </Link>
                  <div className="text-xs text-[var(--text-muted)] pt-2">
                    Already subscribed?{' '}
                    <Link href="/dashboard" className="text-[var(--accent)] hover:underline font-semibold">
                      Log in to unlock
                    </Link>
                  </div>
                </div>
              </>
            ) : showSignInPrompt ? (
              <>
                <div className="w-14 h-14 bg-amber-500/15 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/30">
                  <LogIn className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Free Limit Reached</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  You've used {ANON_LIMIT} free tries this month.
                </p>
                <p className="text-sm text-[var(--text-secondary)] mb-6">
                  Sign in to get <strong className="text-[var(--accent)]">{SIGNED_IN_EXTRA} more free uses</strong>.
                </p>
                <div className="space-y-3">
                  <Link href="/sign-in" className="block w-full">
                    <Button variant="primary" className="w-full py-5 text-base" size="lg">
                      Sign In — Get {SIGNED_IN_EXTRA} More Free Uses <Sparkles className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="ghost" className="w-full text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]" size="sm">
                      Upgrade to Pro instead
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-[var(--accent)]/15 rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--accent)]/30">
                  <Zap className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Daily Limit Reached</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-6">
                  You've used all your free tries this month. Upgrade to Pro for unlimited access to all {toolCount} tools.
                </p>
                <div className="space-y-4">
                  <Link href="/pricing" className="block w-full">
                    <Button variant="primary" className="w-full py-6 text-base" size="lg">
                      Upgrade to Pro
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
