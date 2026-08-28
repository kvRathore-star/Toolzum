"use client";
import { useState } from 'react';
import { Clock } from 'lucide-react';
import { CalculatorShell } from '../shared/CalculatorShell';

const labelCls = "text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider";
const inputCls = "w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2";

export function EtaCalculator() {
  const [dist, setDist] = useState('100');
  const [speed, setSpeed] = useState('60');
  const [unit, setUnit] = useState<'km' | 'mi'>('km');
  const [start, setStart] = useState('');
  const [result, setResult] = useState('');

  const calculate = () => {
    const d = parseFloat(dist);
    const s = parseFloat(speed);
    if (isNaN(d) || isNaN(s) || s <= 0) {
      setResult('');
      return;
    }
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
    setResult(out);
  };

  return (
    <CalculatorShell
      title="ETA Calculator"
      icon={<Clock className="w-5 h-5" />}
      result={result}
      onCalculate={calculate}
      calculateLabel="Calculate ETA"
      resultLabel="Estimated Travel Time"
      accent="cyan"
      downloadData={result}
      downloadFilename="eta-calculation.txt"
      presets={[
        { label: 'Highway (100km/h)', apply: () => { setDist('100'); setSpeed('100'); setUnit('km'); } },
        { label: 'City (50km/h)', apply: () => { setDist('20'); setSpeed('50'); setUnit('km'); } },
        { label: 'Walking (5km/h)', apply: () => { setDist('5'); setSpeed('5'); setUnit('km'); } },
        { label: 'Flight (800km/h)', apply: () => { setDist('800'); setSpeed('800'); setUnit('km'); } },
      ]}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Distance ({unit === 'km' ? 'km' : 'mi'})</label>
            <input
              value={dist}
              onChange={e => setDist(e.target.value)}
              type="number"
              className={`${inputCls} font-mono mt-1.5`}
            />
          </div>
          <div>
            <label className={labelCls}>Speed ({unit === 'km' ? 'km/h' : 'mph'})</label>
            <input
              value={speed}
              onChange={e => setSpeed(e.target.value)}
              type="number"
              className={`${inputCls} font-mono mt-1.5`}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Units</label>
          <div className="flex bg-[var(--bg-surface)] rounded-xl p-1 mt-1.5">
            <button
              onClick={() => setUnit('km')}
              className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                unit === 'km'
                  ? 'bg-[var(--bg-elevated)] text-cyan-600 dark:text-cyan-400 shadow-sm'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              km/h
            </button>
            <button
              onClick={() => setUnit('mi')}
              className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                unit === 'mi'
                  ? 'bg-[var(--bg-elevated)] text-cyan-600 dark:text-cyan-400 shadow-sm'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              mph
            </button>
          </div>
        </div>

        <div>
          <label className={labelCls}>Start Time (optional, HH:MM)</label>
          <input
            value={start}
            onChange={e => setStart(e.target.value)}
            placeholder="e.g. 14:30"
            className={`${inputCls} font-mono mt-1.5`}
          />
        </div>
      </div>
    </CalculatorShell>
  );
}
