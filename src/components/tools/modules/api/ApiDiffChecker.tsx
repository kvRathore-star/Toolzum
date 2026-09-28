"use client";
import { useState } from 'react';

export default function ApiDiffChecker() {
  const [oldSpec, setOldSpec] = useState('');
  const [newSpec, setNewSpec] = useState('');
  const [result, setResult] = useState<{ added: string[]; removed: string[]; common: number } | null>(null);
  const calc = () => {
    try {
      const old = JSON.parse(oldSpec || '{}');
      const fresh = JSON.parse(newSpec || '{}');
      const oldPaths = Object.keys(old.paths || {});
      const newPaths = Object.keys(fresh.paths || {});
      setResult({
        added: newPaths.filter(p => !oldPaths.includes(p)),
        removed: oldPaths.filter(p => !newPaths.includes(p)),
        common: oldPaths.filter(p => newPaths.includes(p)).length,
      });
    } catch { setResult(null); }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Diff Checker</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lbl-apidiffchecker-old-spec" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Old Spec</label>
            <textarea id="lbl-apidiffchecker-old-spec" aria-label="Old Spec" value={oldSpec} onChange={e => setOldSpec(e.target.value)} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" placeholder='{"paths":{"/users":{"get":{}}}}' />
          </div>
          <div>
            <label htmlFor="lbl-apidiffchecker-new-spec" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">New Spec</label>
            <textarea id="lbl-apidiffchecker-new-spec" aria-label="New Spec" value={newSpec} onChange={e => setNewSpec(e.target.value)} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" placeholder='{"paths":{"/users":{"get":{}},"/posts":{"get":{}}}}' />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Compare Specs</button>
        {result && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase">Added</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">+{result.added.length}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">Removed</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">-{result.removed.length}</p>
              </div>
              <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-[var(--accent)] uppercase">Common</p>
                <p className="text-lg font-bold text-[var(--accent)]">{result.common}</p>
              </div>
            </div>
            {result.added.length > 0 && <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Added Endpoints</p>
              {result.added.map(p => <p key={p} className="text-xs font-mono text-green-500">+ {p}</p>)}
            </div>}
            {result.removed.length > 0 && <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Removed Endpoints</p>
              {result.removed.map(p => <p key={p} className="text-xs font-mono text-red-700 dark:text-red-400">- {p}</p>)}
            </div>}
          </div>
        )}
      </div>
    </div>
  );
}
