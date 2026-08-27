"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export function EtaCalculator() {
  const [dist, setDist] = useState('100');
  const [speed, setSpeed] = useState('60');
  const [unit, setUnit] = useState<'km' | 'mi'>('km');
  const [start, setStart] = useState('');

  const result = useMemo(() => {
    const d = parseFloat(dist);
    const s = parseFloat(speed);
    if (isNaN(d) || isNaN(s) || s <= 0) return '';
    const hours = d / s;
    const hh = Math.floor(hours);
    const mm = Math.round((hours - hh) * 60);
    let out = `${hh}h ${mm}m`;
    if (start) {
      const [sh, sm] = start.split(':').map(Number);
      const startMin = sh * 60 + sm;
      const totalMin = startMin + hh * 60 + mm;
      const ah = Math.floor(totalMin / 60) % 24;
      const am = totalMin % 60;
      out += ` (arrival ~${String(ah).padStart(2, '0')}:${String(am).padStart(2, '0')})`;
    }
    return out;
  }, [dist, speed, start]);

  const copy = (txt: string) => { clipboardWrite(txt); toast.success('Copied!'); };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">ETA Calculator</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Estimate travel time from distance and speed — with optional arrival time.</p>
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Distance ({unit === 'km' ? 'km' : 'mi'})</label>
            <input value={dist} onChange={e => setDist(e.target.value)} type="number" className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none font-mono" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Speed ({unit === 'km' ? 'km/h' : 'mph'})</label>
            <input value={speed} onChange={e => setSpeed(e.target.value)} type="number" className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none font-mono" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[var(--bg-surface)] rounded-xl p-1">
            <button onClick={() => setUnit('km')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${unit === 'km' ? 'bg-[var(--bg-elevated)] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-[var(--text-secondary)]'}`}>km/h</button>
            <button onClick={() => setUnit('mi')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${unit === 'mi' ? 'bg-[var(--bg-elevated)] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-[var(--text-secondary)]'}`}>mph</button>
          </div>
          <div className="flex-1" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Start Time (optional, HH:MM)</label>
            <input value={start} onChange={e => setStart(e.target.value)} placeholder="e.g. 14:30" className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none font-mono" />
        </div>
        {result && (
          <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-2xl p-5 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">{result}</p>
            <button onClick={() => copy(result)} className="mt-2 text-[10px] text-[var(--accent)] hover:underline">Copy</button>
          </div>
        )}
      </div>
    </div>
  );
}
