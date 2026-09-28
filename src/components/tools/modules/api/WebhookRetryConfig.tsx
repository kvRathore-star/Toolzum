"use client";
import { useState } from 'react';

export default function WebhookRetryConfig() {
  const [maxRetries, setMaxRetries] = useState('3');
  const [baseDelay, setBaseDelay] = useState('1000');
  const [result, setResult] = useState<{ name: string; delays: string; total: number }[]>([]);
  const calc = () => {
    const max = parseInt(maxRetries);
    const delay = parseInt(baseDelay);
    const strategies = [
      { name: 'Fixed', delays: Array.from({ length: max }, () => delay) },
      { name: 'Linear', delays: Array.from({ length: max }, (_, i) => delay * (i + 1)) },
      { name: 'Exponential', delays: Array.from({ length: max }, (_, i) => delay * Math.pow(2, i)) },
      { name: 'Exponential + Jitter', delays: Array.from({ length: max }, (_, i) => Math.round(delay * Math.pow(2, i) * (0.5 + Math.random() * 0.5))) },
    ];
    setResult(strategies.map(s => ({
      name: s.name,
      delays: s.delays.join(' → '),
      total: s.delays.reduce((a, b) => a + b, 0),
    })));
  };
  const maxTotal = result.length ? Math.max(...result.map(r => r.total)) : 1;
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Webhook Retry Config</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lbl-webhookretryconfig-max-retries" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Max Retries</label>
            <input id="lbl-webhookretryconfig-max-retries" aria-label="Max Retries" type="number" value={maxRetries} onChange={e => setMaxRetries(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <label htmlFor="lbl-webhookretryconfig-base-delay-ms" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Base Delay (ms)</label>
            <input id="lbl-webhookretryconfig-base-delay-ms" aria-label="Base Delay (ms)" type="number" value={baseDelay} onChange={e => setBaseDelay(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Calculate</button>
        {result.length > 0 && (
          <div className="space-y-3">
            {result.map(r => (
              <div key={r.name} className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)]">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-bold">{r.name}</p>
                  <p className="text-xs font-bold text-amber-500">{(r.total / 1000).toFixed(1)}s</p>
                </div>
                <p className="text-[10px] font-mono text-[var(--text-muted)] mb-1.5">{r.delays}</p>
                <div className="h-1.5 bg-[var(--bg-overlay)] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(r.total / maxTotal) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
