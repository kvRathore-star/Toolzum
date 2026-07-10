"use client";
import React, { useState } from 'react';
import { Share2, Link as LinkIcon, Check } from 'lucide-react';

const SITE_URL = 'https://toolzum.com';

const platforms = [
  { name: 'X (Twitter)', emoji: '𝕏', color: 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100' },
  { name: 'LinkedIn', emoji: 'in', color: 'hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:text-blue-600' },
  { name: 'Facebook', emoji: 'f', color: 'hover:bg-indigo-100 dark:hover:bg-indigo-950/30 hover:text-indigo-600' },
  { name: 'WhatsApp', emoji: 'WA', color: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/30 hover:text-emerald-600' },
];

interface ShareToolProps {
  title: string;
  slug: string;
  category: string;
}

export function ShareTool({ title, slug, category }: ShareToolProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const url = `${SITE_URL}/${category.toLowerCase()}/${slug}`;
  const text = `Check out ${title} on Toolzum — 100% free, runs in your browser, no uploads needed.`;

  const shareUrl = (platform: string) => {
    const hrefs: Record<string, string> = {
      'X (Twitter)': `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      LinkedIn: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      WhatsApp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    };
    return hrefs[platform] || '#';
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        title="Share this tool"
      >
        <Share2 className="w-3.5 h-3.5" /> Share
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] shadow-xl p-2 min-w-[180px] space-y-0.5">
            {platforms.map(p => (
              <a
                key={p.name}
                href={shareUrl(p.name)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--text-secondary)] rounded-[var(--radius-md)] transition-colors ${p.color}`}
              >
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[10px] font-bold font-mono">{p.emoji}</span>
                Share on {p.name}
              </a>
            ))}
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-[var(--radius-md)] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <LinkIcon className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
