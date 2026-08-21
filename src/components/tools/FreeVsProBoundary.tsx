"use client";

import { Info, Lock, Zap } from 'lucide-react';

interface FreeVsProBoundaryProps {
  feature: string;
  freeLimit?: string;
  proLimit?: string;
  isPro?: boolean;
  onUpgrade?: () => void;
  onSignIn?: () => void;
  type?: 'size' | 'batch' | 'features';
}

export function FreeVsProBoundary({
  feature,
  freeLimit = "10 MB",
  proLimit = "2 GB",
  isPro = false,
  onUpgrade,
  onSignIn,
  type = 'size',
}: FreeVsProBoundaryProps) {
  if (isPro) return null;

  const icons = {
    size: <Info className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />,
    batch: <Zap className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />,
    features: <Lock className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />,
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-[var(--radius-xl)] p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icons[type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {feature}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Free: {freeLimit} &middot; Pro: {proLimit}
          </p>
          <div className="flex gap-2 mt-3">
            {onSignIn && (
              <button
                onClick={onSignIn}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors"
              >
                Sign in for more
              </button>
            )}
            {onUpgrade && (
              <button
                onClick={onUpgrade}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
