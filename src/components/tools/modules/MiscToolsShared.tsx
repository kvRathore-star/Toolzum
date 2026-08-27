"use client";
import React, { useState, useCallback } from 'react';
import { clipboardWrite } from "@/lib/clipboard";

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full bg-[var(--bg-overlay)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
      {children}
    </div>
  );
}

export function Input({ label, value, onChange, placeholder, type = "text", rows, min, max, step }: {
  label: string; value: string | number; onChange: (v: any) => void; placeholder?: string; type?: string; rows?: number; min?: number; max?: number; step?: string;
}) {
  const cls = "w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50";
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      {rows ? (
        <textarea className={cls + " resize-y"} rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className={cls} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} min={min} max={max} step={step} />
      )}
    </div>
  );
}

export function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = useCallback(async () => {
    await clipboardWrite(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);
  return (
    <button onClick={handle} className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors ml-2 shrink-0">
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

export const labelClass = "block text-sm font-medium text-[var(--text-secondary)] mb-1.5";
export const selClass = "w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50";
