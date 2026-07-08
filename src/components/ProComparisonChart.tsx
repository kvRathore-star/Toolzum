"use client";
import React from 'react';
import { Crown, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';

interface ComparisonRow {
  feature: string;
  free: string | boolean;
  pro: string | boolean;
  highlight?: boolean;
}

export function ProComparisonChart({ toolName, category }: { toolName?: string; category?: string }) {
  const { data: session } = useSession();
  const isPro = (session?.user as Record<string, unknown>)?.plan === 'pro';

  const rows: ComparisonRow[] = [
    { feature: 'Max file size', free: '10MB', pro: '2GB', highlight: true },
    { feature: 'Batch processing', free: '1 / 10 files', pro: '500 files', highlight: true },
    { feature: 'Processing speed', free: 'Standard (1 thread)', pro: 'Parallel (6 threads)', highlight: true },
    { feature: 'ZIP batch download', free: false, pro: true, highlight: true },
    { feature: 'Watermark-free export', free: false, pro: true },
    { feature: 'Workflow presets', free: false, pro: 'Unlimited' },
    { feature: 'AI-powered tools', free: 'Limited', pro: 'Full access' },
    { feature: 'Priority support', free: false, pro: true },
  ];

  if (isPro) {
    return (
      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-[var(--radius-xl)] text-center">
        <Crown className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">You are on the Pro plan — enjoying all features.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200">Unlock Pro for {toolName || 'this tool'}</h3>
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-400">See exactly what you are missing on the Free plan.</p>
      </div>
      <div className="divide-y divide-[var(--border-subtle)]">
        {rows.map((row, i) => (
          <div key={i} className={`grid grid-cols-3 gap-2 px-4 py-2.5 text-xs ${row.highlight ? 'bg-amber-50/50 dark:bg-amber-950/10' : ''}`}>
            <span className="text-[var(--text-primary)] font-medium col-span-1">{row.feature}</span>
            <span className="text-[var(--text-muted)] flex items-center gap-1">
              {typeof row.free === 'boolean' ? (row.free ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-red-400" />) : row.free}
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              {typeof row.pro === 'boolean' ? <Check className="w-3 h-3" /> : row.pro}
            </span>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-[var(--border-subtle)]">
        <Link
          href="/pricing"
          className="block w-full text-center py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold rounded-[var(--radius-lg)] transition-all shadow-sm"
        >
          Upgrade to Pro — ${category === 'ai' ? '19.99' : '14.99'}/mo
        </Link>
      </div>
    </div>
  );
}
