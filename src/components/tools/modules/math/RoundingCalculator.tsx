"use client";
import { useState } from 'react';
import { ac, borderClass } from '../miscToolColors';
import { labelClass, selClass } from '../MiscToolsShared';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function RoundingCalculator() {
  const clr = ac('RoundingCalculator');
  const [num, setNum] = useState('3.14159');
  const [places, setPlaces] = useState('2');
  const [mode, setMode] = useState('half-up');
  const n = Number(num);
  const p = Number(places);
  const hasInput = num !== '' && !isNaN(n) && !isNaN(p);

  const getRounded = (mode: string) => {
    const factor = 10 ** p;
    switch (mode) {
      case 'half-up': return Math.round(n * factor) / factor;
      case 'half-even': {
        const floor = Math.floor(n * factor) / factor;
        const ceil = Math.ceil(n * factor) / factor;
        const diffFloor = n - floor;
        const diffCeil = ceil - n;
        if (diffFloor < diffCeil) return floor;
        if (diffCeil < diffFloor) return ceil;
        const floorScaled = Math.floor(n * factor);
        return (floorScaled % 2 === 0 ? floorScaled : floorScaled) / factor;
      }
      case 'floor': return Math.floor(n * factor) / factor;
      case 'ceil': return Math.ceil(n * factor) / factor;
      case 'truncate': return Math.trunc(n * factor) / factor;
      default: return n;
    }
  };

  const result = hasInput ? getRounded(mode) : 0;
  const digit = (() => {
    if (!hasInput) return null;
    const str = Math.abs(n).toString();
    const dotIdx = str.indexOf('.');
    if (dotIdx === -1) return null;
    const idx = dotIdx + 1 + p;
    return idx < str.length ? Number(str[idx]) : null;
  })();

  const presets = [
    { label: 'π → 2dp', apply: () => { setNum(Math.PI.toString()); setPlaces('2'); } },
    { label: 'e → 3dp', apply: () => { setNum(Math.E.toString()); setPlaces('3'); } },
    { label: '-3.14159 → 2dp', apply: () => { setNum('-3.14159'); setPlaces('2'); } },
    { label: '123.456 → 0dp', apply: () => { setNum('123.456'); setPlaces('0'); } },
    { label: '0.00456 → 2sf', apply: () => { setNum('0.00456'); setPlaces('2'); setMode('half-up'); } },
  ];

  const resultText = hasInput ? `${n} → ${result} (${mode.replace('-', ' ')})` : 'Enter a number to round';

  const modeLabels: Record<string, string> = {
    'half-up': 'Round Half Up',
    'half-even': "Banker's Rounding",
    'floor': 'Floor (↓)',
    'ceil': 'Ceil (↑)',
    'truncate': 'Truncate',
  };

  const modeDescriptions: Record<string, string> = {
    'half-up': 'Rounds away from zero at midpoint (≥ 5 rounds up)',
    'half-even': 'Rounds to nearest even at midpoint (banker\'s rounding)',
    'floor': 'Always rounds toward −∞',
    'ceil': 'Always rounds toward +∞',
    'truncate': 'Drops decimals without rounding (toward zero)',
  };

  return (
    <CalculatorShell category="Math" title="Rounding Calculator" result={resultText} auto presets={presets} accent="amber" customResult={
      !hasInput ? (
        <div className="text-sm text-[var(--text-muted)] text-center">Enter a number to round</div>
      ) : (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">{modeLabels[mode]}</div>
          <div className="text-4xl font-bold text-amber-700 dark:text-amber-300 font-mono">{n} → {result}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">{modeDescriptions[mode]}</div>
        </div>

        {digit !== null && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Rounding Decision</div>
            <div className="font-mono text-sm text-[var(--text-primary)] space-y-1">
              <div>Digit at position {p + 1}: <span className="font-bold text-amber-600 dark:text-amber-400">{digit}</span></div>
              {mode === 'half-up' && <div>{digit >= 5 ? `≥ 5 → round up` : `< 5 → round down`}</div>}
              {mode === 'half-even' && <div>{digit > 5 ? `> 5 → round up` : digit < 5 ? `< 5 → round down` : `= 5 → round to even (${result * (10 ** p) % 2 === 0 ? 'even' : 'odd'})`}</div>}
              {mode === 'floor' && <div>Floor: always rounds toward −∞ (e.g. −3.7 → −4)</div>}
              {mode === 'ceil' && <div>Ceil: always rounds toward +∞ (e.g. −3.7 → −3)</div>}
              {mode === 'truncate' && <div>Truncate: drops decimals without rounding (toward zero)</div>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map(dp => (
            <div key={dp} className="bg-[var(--bg-surface)] rounded-xl p-2 text-center">
              <div className="text-xs text-[var(--text-secondary)]">{dp} dp</div>
              <div className="text-sm font-mono font-bold text-[var(--text-primary)]">{Number(num).toFixed(dp)}</div>
            </div>
          ))}
        </div>
      </div>
      )
    }>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Value</label>
            <input aria-label="Value" type="number" step="any" value={num} onChange={e => setNum(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-amber-500/50" />
          </div>
          <div>
            <label className={labelClass}>Decimal places</label>
            <input aria-label="Decimal places" type="number" min={0} max={15} value={places} onChange={e => setPlaces(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-amber-500/50" />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {['half-up', 'half-even', 'floor', 'ceil', 'truncate'].map(key => (
            <button key={key} onClick={() => setMode(key)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors font-medium ${mode === key ? 'bg-amber-500 text-white border-amber-500' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-zinc-300 dark:border-zinc-700 hover:border-amber-500'}`}>
              {modeLabels[key]}
            </button>
          ))}
        </div>
      </div>
    </CalculatorShell>
  );
}
