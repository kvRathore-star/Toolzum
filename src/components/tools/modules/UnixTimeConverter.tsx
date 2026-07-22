"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { Clock } from 'lucide-react';

export default function UnixTimeConverter() {
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000).toString());
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 16));

  const ts = parseInt(timestamp);
  const isValidTs = !isNaN(ts) && ts > 0;
  const tsDate = isValidTs ? new Date(ts * 1000) : null;

  const updateFromTs = (val: string) => {
    setTimestamp(val);
    const n = parseInt(val);
    if (!isNaN(n) && n > 0) setDateStr(new Date(n * 1000).toISOString().slice(0, 16));
  };

  const updateFromDate = (val: string) => {
    setDateStr(val);
    const d = new Date(val);
    if (!isNaN(d.getTime())) setTimestamp(Math.floor(d.getTime() / 1000).toString());
  };

  const now = () => { const s = Math.floor(Date.now() / 1000).toString(); setTimestamp(s); setDateStr(new Date().toISOString().slice(0, 16)); };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <button onClick={now} className="flex items-center gap-2 text-xs text-blue-500 hover:text-blue-600 transition-colors"><Clock className="w-3.5 h-3.5" /> Insert Current Time</button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Unix Timestamp (seconds)</label>
          <input type="number" value={timestamp} onChange={e => updateFromTs(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none font-mono focus:border-[var(--accent)] transition-colors" />
          {tsDate && (
            <div className="bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-3 space-y-1.5">
              {[
                { label: 'UTC', value: tsDate.toUTCString() },
                { label: 'ISO 8601', value: tsDate.toISOString() },
                { label: 'Locale', value: tsDate.toLocaleString() },
                { label: 'Date', value: tsDate.toLocaleDateString() },
                { label: 'Time', value: tsDate.toLocaleTimeString() },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] w-12 shrink-0">{r.label}</span>
                  <code className="text-xs font-mono text-zinc-800 dark:text-zinc-200 break-all">{r.value}</code>
                  <button onClick={() => { clipboardWrite(r.value); toast.success('Copied!'); }} className="ml-auto text-[10px] text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 shrink-0">Copy</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Date & Time</label>
          <input type="datetime-local" value={dateStr} onChange={e => updateFromDate(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none font-mono focus:border-[var(--accent)] transition-colors" />
          {isValidTs && (
            <div className="bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-3 space-y-1.5">
              {[
                { label: 'Milliseconds', value: (ts * 1000).toString() },
                { label: 'Seconds (copy)', value: ts.toString() },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] w-20 shrink-0">{r.label}</span>
                  <code className="text-xs font-mono text-zinc-800 dark:text-zinc-200">{r.value}</code>
                  <button onClick={() => { clipboardWrite(r.value); toast.success('Copied!'); }} className="ml-auto text-[10px] text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 shrink-0">Copy</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
