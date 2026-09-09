"use client";

import React, { useState, useCallback } from 'react';

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
      {children}
    </div>
  );
}

export function Input({ label, value, onChange, placeholder, type = "text", rows }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; rows?: number;
}) {
  const id = React.useId();
  const cls = "w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50";
  return (
    <div className="mb-3">
      <label htmlFor={id} className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      {rows ? (
        <textarea id={id} className={cls} rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input id={id} className={cls} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

export function Output({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => {});
  }, [value]);
  if (!value) return null;
  return (
    <div className="mt-4">
      {label && <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>}
      <div className="relative">
        <pre className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 overflow-x-auto whitespace-pre-wrap break-all max-h-60">{value}</pre>
        <button onClick={copy} className="absolute top-2 right-2 px-3 py-1 text-xs bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
      </div>
    </div>
  );
}
