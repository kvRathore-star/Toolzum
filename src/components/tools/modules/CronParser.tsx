"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function CronParser() {
  const [expression, setExpression] = useState('*/5 * * * *');
  const [result, setResult] = useState<{ label: string; value: string }[]>([]);

  const parse = (expr: string) => {
    if (!expr.trim()) { setResult([]); return; }
    const parts = expr.trim().split(/\s+/);
    if (parts.length < 5) { setResult([{ label: 'Error', value: 'Expected at least 5 fields (minute hour day month weekday)' }]); return; }

    const labels = ['Minute', 'Hour', 'Day of Month', 'Month', 'Day of Week'];
    const descriptions = parts.map((p, i) => {
      if (p === '*') return { label: labels[i], value: `Every ${labels[i].toLowerCase()}` };
      if (p.startsWith('*/')) return { label: labels[i], value: `Every ${p.slice(2)} ${labels[i].toLowerCase()}(s)` };
      if (p.includes(',')) return { label: labels[i], value: `At ${p}` };
      if (p.includes('-')) return { label: labels[i], value: `Every minute between ${p}` };
      return { label: labels[i], value: `At ${p}` };
    });

    const h = parts[1], m = parts[0], w = parts[4];
    let readable = '';
    if (m === '*' && h === '*' && w === '*') readable = 'Every minute';
    else if (m === '0' && h === '*' && w === '*') readable = 'Every hour';
    else if (m === '0' && h === '0' && w === '*') readable = 'Daily at midnight';
    else if (m === '0' && h === '9' && w === '1') readable = 'Every Monday at 9:00 AM';
    else if (m === '0' && h === '0' && w === '0') readable = 'Every Sunday at midnight';
    else readable = descriptions.map(d => d.value).join(', ');

    setResult([
      ...descriptions,
      { label: 'Readable', value: readable.charAt(0).toUpperCase() + readable.slice(1) },
    ]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <input value={expression} onChange={e => { setExpression(e.target.value); parse(e.target.value); }} placeholder="cron expression (e.g. */5 * * * *)" className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none font-mono focus:border-blue-500 transition-colors" />
      </div>
      {result.length > 0 && (
        <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          {result.map((r, i) => (
            <div key={i} className={`flex items-center gap-4 px-5 py-3 ${i % 2 === 0 ? 'bg-white dark:bg-black/20' : ''} ${r.label === 'Readable' ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}>
              <span className="w-[130px] shrink-0 text-xs font-medium text-zinc-500">{r.label}</span>
              <span className={`text-xs font-mono break-all ${r.label === 'Readable' ? 'text-blue-700 dark:text-blue-300 font-semibold' : 'text-zinc-800 dark:text-zinc-200'}`}>{r.value}</span>
              <button onClick={() => { clipboardWrite(r.value); toast.success('Copied!'); }} className="ml-auto text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 shrink-0">Copy</button>
            </div>
          ))}
        </div>
      )}
      <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
        <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Common Examples</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            ['* * * * *', 'Every minute'],
            ['*/5 * * * *', 'Every 5 minutes'],
            ['0 * * * *', 'Every hour'],
            ['0 */2 * * *', 'Every 2 hours'],
            ['0 9 * * *', 'Daily at 9 AM'],
            ['0 9 * * 1-5', 'Weekdays at 9 AM'],
            ['0 0 * * *', 'Midnight daily'],
            ['0 0 * * 0', 'Sunday midnight'],
            ['0 0 1 * *', 'First day of month'],
            ['*/30 9-17 * * *', 'Every 30 min, 9-5'],
          ].map(([expr, desc]) => (
            <button key={expr} onClick={() => { setExpression(expr); parse(expr); }} className="flex items-center gap-2 text-xs text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <code className="font-mono text-blue-600 dark:text-blue-400 shrink-0">{expr}</code>
              <span className="text-zinc-500 truncate">{desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
