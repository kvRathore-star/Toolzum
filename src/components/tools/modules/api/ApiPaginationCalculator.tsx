"use client";
import { useState } from 'react';

export default function ApiPaginationCalculator() {
  const [total, setTotal] = useState('100');
  const [perPage, setPerPage] = useState('10');
  const [page, setPage] = useState('3');
  const [result, setResult] = useState<{ totalPages: number; offset: number; start: number; end: number; hasNext: boolean; hasPrev: boolean } | null>(null);
  const calc = () => {
    const t = parseInt(total);
    const pp = parseInt(perPage);
    const p = parseInt(page);
    const totalPages = Math.ceil(t / pp);
    const offset = (p - 1) * pp;
    setResult({
      totalPages,
      offset,
      start: offset + 1,
      end: Math.min(offset + pp, t),
      hasNext: p < totalPages,
      hasPrev: p > 1,
    });
  };
  const pageArr = result ? Array.from({ length: result.totalPages }, (_, i) => i + 1) : [];
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Pagination Calculator</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Total Items</label>
            <input type="number" value={total} onChange={e => { setTotal(e.target.value); setResult(null); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Per Page</label>
            <input type="number" value={perPage} onChange={e => { setPerPage(e.target.value); setResult(null); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Current Page</label>
            <input type="number" value={page} onChange={e => { setPage(e.target.value); setResult(null); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Calculate</button>
        {result && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Pages</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{result.totalPages}</p>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Offset</p>
                <p className="text-xl font-bold text-emerald-500">{result.offset}</p>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Has Next</p>
                <p className={`text-lg font-bold ${result.hasNext ? 'text-green-500' : 'text-red-700 dark:text-red-400'}`}>{result.hasNext ? '✓' : '✗'}</p>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Has Prev</p>
                <p className={`text-lg font-bold ${result.hasPrev ? 'text-green-500' : 'text-red-700 dark:text-red-400'}`}>{result.hasPrev ? '✓' : '✗'}</p>
              </div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)]">
              <p className="text-xs text-[var(--text-secondary)] mb-2">Items on page: <span className="font-bold">{result.start} - {result.end}</span></p>
              <div className="flex gap-1 flex-wrap">
                {pageArr.map(p => (
                  <span key={p} onClick={() => { setPage(String(p)); calc(); }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${p === parseInt(page) ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-[var(--text-secondary)] hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
