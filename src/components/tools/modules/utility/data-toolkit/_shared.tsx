"use client";
import React from 'react';
import { toast } from 'react-hot-toast';
import type { JsonValue } from '@/lib/json';

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

export function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 1) return { headers: [], rows: [] };
  const headers = lines[0]!.split(',').map(h => h.trim());
  const rows = lines.slice(1).map(l => l.split(',').map(c => c.trim()));
  return { headers, rows };
}

export function formatCSV(headers: string[], rows: string[][]): string {
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}


export function parseJSON(s: string): JsonValue | null {
  try { return JSON.parse(s) as JsonValue; } catch { toast.error('Invalid JSON'); return null; }
}

export const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Eve', 'Charlie', 'Diana', 'Frank', 'Grace', 'Henry'];
export const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
export const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com', 'test.org'];
