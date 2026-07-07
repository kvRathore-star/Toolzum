"use client";
import React, { useState, useEffect } from 'react';
import { Crown, Zap, X } from 'lucide-react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';

const COUNT_KEY = 'th_tool_use_count';

export function PostProcessUpgrade({ toolName }: { toolName: string }) {
  const [visible, setVisible] = useState(false);
  const { data: session } = useSession();
  const isPro = (session?.user as Record<string, unknown>)?.plan === 'pro';

  useEffect(() => {
    if (isPro) return;
    try {
      const raw = localStorage.getItem(COUNT_KEY);
      const count = raw ? parseInt(raw, 10) + 1 : 1;
      localStorage.setItem(COUNT_KEY, String(count));
      if (count >= 3) setVisible(true);
    } catch { /* noop */ }
  }, [isPro]);

  if (!visible) return null;
  if (isPro) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-right duration-300">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/50 rounded-[var(--radius-2xl)] shadow-2xl p-5 relative">
        <button onClick={() => setVisible(false)} className="absolute top-3 right-3 text-amber-400 hover:text-amber-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-900 dark:text-amber-100">You have used {toolName} a few times!</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">Pro users process files 10× faster with no limits.</p>
          </div>
        </div>
        <div className="space-y-1.5 mb-4 text-xs text-amber-700 dark:text-amber-300">
          <div className="flex items-center gap-2"><Zap className="w-3 h-3" /> 6× parallel processing vs 1 thread</div>
          <div className="flex items-center gap-2"><Crown className="w-3 h-3" /> 2GB files, 500 batch, ZIP download</div>
        </div>
        <Link
          href="/pricing"
          className="block w-full text-center py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold rounded-[var(--radius-lg)] transition-all shadow-sm"
        >
          Try Pro Free for 7 Days
        </Link>
      </div>
    </div>
  );
}
