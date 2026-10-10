"use client";
import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function CronParser() {
  const [expression, setExpression] = useState('*/5 * * * *');
  const [result, setResult] = useState<{ label: string; value: string }[]>([]);
  // Next-run search brute-forces up to 525600 minute-steps (a full year for
  // impossible dates like Feb 30). Debounced off the keystroke so typing
  // never freezes; a single run of a few hundred ms is fine.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queueParse = (v: string) => {
    setExpression(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => parse(v), 250);
  };

  const FIELD_BOUNDS: [number, number][] = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 7]];
  const numOk = (n: number, i: number): boolean => Number.isInteger(n) && n >= FIELD_BOUNDS[i]![0] && n <= FIELD_BOUNDS[i]![1];
  const describePart = (part: string, i: number, label: string): { value: string; error?: string } => {
    const [lo, hi] = FIELD_BOUNDS[i]!;
    if (part === '*') return { value: `Every ${label.toLowerCase()}` };
    const stepM = part.match(/^\*\/(\d+)$/);
    if (stepM) { const st = parseInt(stepM[1]!); if (!(st >= 1 && st <= hi)) return { value: part, error: `${label} step ${st} out of range (${lo}-${hi})` }; return { value: `Every ${st} ${label.toLowerCase()}(s)` }; }
    const rangeM = part.match(/^(\d+)-(\d+)(?:\/(\d+))?$/);
    if (rangeM) { const a = parseInt(rangeM[1]!); const b = parseInt(rangeM[2]!); const st = rangeM[3] ? parseInt(rangeM[3]!) : 1; if (!numOk(a, i) || !numOk(b, i)) return { value: part, error: `${label} range ${a}-${b} out of bounds (${lo}-${hi})` }; if (a > b) return { value: part, error: `${label} range start ${a} is after end ${b}` }; return { value: `${label} from ${a} to ${b}${rangeM[3] ? ` every ${st}` : ''}` }; }
    if (part.includes(',')) { for (const v of part.split(',')) { const rm = v.match(/^(\d+)-(\d+)$/); if (rm) { if (!numOk(parseInt(rm[1]!), i) || !numOk(parseInt(rm[2]!), i)) return { value: part, error: `${label} list entry ${v} out of bounds (${lo}-${hi})` }; } else if (!/^\d+$/.test(v) || !numOk(parseInt(v), i)) return { value: part, error: `${label} value ${v} out of bounds (${lo}-${hi})` }; } return { value: `At ${part}` }; }
    if (!/^\d+$/.test(part) || !numOk(parseInt(part), i)) return { value: part, error: `${label} value ${part} out of bounds (${lo}-${hi})` };
    return { value: `At ${part}` };
  };
  const fieldMatches = (field: string, v: number, i: number): boolean => {
    const lo = FIELD_BOUNDS[i]![0];
    const norm = (n: number): number => (i === 4 && n === 7 ? 0 : n);
    for (const alt of field.split(',')) {
      if (alt === '*') return true;
      const sm = alt.match(/^\*\/(\d+)$/);
      if (sm) { const st = parseInt(sm[1]!); if (st >= 1 && (v - lo) % st === 0) return true; continue; }
      const rm = alt.match(/^(\d+)-(\d+)(?:\/(\d+))?$/);
      if (rm) { const a = norm(parseInt(rm[1]!)); const b = norm(parseInt(rm[2]!)); const st = rm[3] ? parseInt(rm[3]!) : 1; const vv = norm(v); if (vv >= a && vv <= b && (vv - a) % st === 0) return true; continue; }
      if (/^\d+$/.test(alt) && norm(parseInt(alt)) === norm(v)) return true;
    }
    return false;
  };
  const nextCronRuns = (fields: string[], count = 3): string[] => {
    const out: string[] = [];
    const d = new Date(); d.setSeconds(0, 0); d.setMinutes(d.getMinutes() + 1);
    const domR = fields[2] !== '*'; const dowR = fields[4] !== '*';
    for (let t = 0; t < 525600 && out.length < count; t++) {
      const vals = [d.getMinutes(), d.getHours(), d.getDate(), d.getMonth() + 1, d.getDay()];
      let ok = fieldMatches(fields[0]!, vals[0]!, 0) && fieldMatches(fields[1]!, vals[1]!, 1) && fieldMatches(fields[3]!, vals[3]!, 3);
      if (ok) { const domOk = fieldMatches(fields[2]!, vals[2]!, 2); const dowOk = fieldMatches(fields[4]!, vals[4]!, 4); ok = domR && dowR ? (domOk || dowOk) : (domOk && dowOk); }
      if (ok) out.push(new Date(d).toLocaleString());
      d.setMinutes(d.getMinutes() + 1);
    }
    return out;
  };
  const parse = (expr: string) => {
    if (!expr.trim()) { setResult([]); return; }
    const parts = expr.trim().split(/\s+/);
    if (parts.length < 5) { setResult([{ label: 'Error', value: 'Expected at least 5 fields (minute hour day month weekday)' }]); return; }

    const labels = ['Minute', 'Hour', 'Day of Month', 'Month', 'Day of Week'];
    const fields = parts.slice(0, 5);
    const described = fields.map((p, i) => ({ label: labels[i] ?? "", ...describePart(p!, i, labels[i]!) }));
    const descriptions = described.map((d) => ({ label: d.label, value: d.value }));
    const errors = described.filter((d) => d.error).map((d) => ({ label: 'Error', value: `${d.label}: ${d.error}` }));
    if (errors.length > 0) { setResult([...errors, ...descriptions]); return; }

    const h = parts[1], m = parts[0], w = parts[4];
    let readable = '';
    if (m === '*' && h === '*' && w === '*') readable = 'Every minute';
    else if (m === '0' && h === '*' && w === '*') readable = 'Every hour';
    else if (m === '0' && h === '0' && w === '*') readable = 'Daily at midnight';
    else if (m === '0' && h === '9' && w === '1') readable = 'Every Monday at 9:00 AM';
    else if (m === '0' && h === '0' && w === '0') readable = 'Every Sunday at midnight';
    else readable = descriptions.map(d => d.value).join(', ');

    const upcoming = nextCronRuns(fields as string[], 3);
    setResult([
      ...descriptions,
      { label: 'Readable', value: readable.charAt(0).toUpperCase() + readable.slice(1) },
      ...upcoming.map((t, i) => ({ label: `Next run ${i + 1}`, value: t })),
    ]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
                    <input value={expression} onChange={e => queueParse(e.target.value)} aria-label="Cron expression" placeholder="cron expression (e.g. */5 * * * *)" className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 font-mono focus:border-[var(--accent)] transition-colors" />
      </div>
      {result.length > 0 && (
        <div className="bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          {result.map((r, i) => (
            <div key={i} className={`flex items-center gap-4 px-5 py-3 ${i % 2 === 0 ? 'bg-white dark:bg-black/20' : ''} ${r.label === 'Readable' ? 'bg-[var(--accent)]/10 dark:bg-[var(--accent)]/10' : ''}`}>
              <span className="w-[130px] shrink-0 text-xs font-medium text-[var(--text-secondary)]">{r.label}</span>
              <span className={`text-xs font-mono break-all ${r.label === 'Readable' ? 'text-[var(--accent)] font-semibold' : 'text-[var(--text-primary)]'}`}>{r.value}</span>
              <button onClick={() => { clipboardWrite(r.value).then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="ml-auto text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0">Copy</button>
            </div>
          ))}
        </div>
      )}
      <div className="bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-4">
        <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Common Examples</h4>
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
            <button key={expr} onClick={() => { setExpression(expr!); parse(expr!); }} className="flex items-center gap-2 text-xs text-left bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 hover:border-[var(--accent)] transition-colors">
              <code className="font-mono text-[var(--accent)] shrink-0">{expr}</code>
              <span className="text-[var(--text-secondary)] truncate">{desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
