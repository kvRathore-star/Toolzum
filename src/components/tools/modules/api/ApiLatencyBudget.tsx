"use client";
import { useState } from 'react';

export default function ApiLatencyBudget() {
  const [sla, setSla] = useState('99.9');
  const [totalTime, setTotalTime] = useState('2000');
  const [result, setResult] = useState<{ appBudget: number; dbBudget: number; extBudget: number; allowedDowntime: number } | null>(null);
  const presets = [
    { label: 'High SLA', sla: '99.99', time: '1000' },
    { label: 'Standard', sla: '99.9', time: '2000' },
    { label: 'Relaxed', sla: '99.5', time: '5000' },
  ];
  const calc = () => {
    const slaPct = parseFloat(sla) / 100;
    const totalMs = parseFloat(totalTime);
    const monthlySecs = 30 * 24 * 60 * 60;
    const allowedDowntimeSecs = monthlySecs * (1 - slaPct);
    setResult({
      appBudget: totalMs * 0.3,
      dbBudget: totalMs * 0.4,
      extBudget: totalMs * 0.3,
      allowedDowntime: allowedDowntimeSecs,
    });
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Latency Splitter</h2>
        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-700 dark:text-amber-400 text-xs">
          <strong>⚠ Simplified Calculator:</strong> This tool uses a fixed 30/40/30% split (Application/Database/External APIs) for demonstration. Real latency budgets require profiling your specific architecture, considering tail latencies, retries, and queueing delays.
        </div>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setSla(p.sla); setTotalTime(p.time); setResult(null); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-purple-400 text-[var(--text-secondary)] hover:text-purple-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">SLA (%)</label>
            <input aria-label="SLA (%)" type="number" value={sla} onChange={e => setSla(e.target.value)} step="0.01" className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Total Budget (ms)</label>
            <input aria-label="Total Budget (ms)" type="number" value={totalTime} onChange={e => setTotalTime(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Calculate Split</button>
        {result && (
          <div className="space-y-3">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-3">
              <span className="text-2xl">⏱</span>
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Monthly Allowed Downtime</p>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{result.allowedDowntime.toFixed(0)}s ({(result.allowedDowntime / 60).toFixed(1)} min)</p>
              </div>
            </div>
            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Fixed-Ratio Breakdown ({parseFloat(totalTime)}ms total)</div>
            <div className="space-y-2">
              {[
                { label: 'Application', value: result.appBudget, color: 'bg-blue-500', pct: 30 },
                { label: 'Database', value: result.dbBudget, color: 'bg-emerald-700', pct: 40 },
                { label: 'External APIs', value: result.extBudget, color: 'bg-purple-500', pct: 30 },
              ].map(item => (
                <div key={item.label} className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)]">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{item.label}</span>
                    <span className="font-bold">{item.value.toFixed(0)}ms ({item.pct}%)</span>
                  </div>
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
