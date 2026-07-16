"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Gauge, Zap, Loader2 } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type BenchType = 'integer' | 'float' | 'array' | 'string' | 'mixed';

const BENCH_LABELS: Record<BenchType, string> = {
  integer: 'Integer Math',
  float: 'Floating Point',
  array: 'Array Sorting',
  string: 'String Ops',
  mixed: 'Mixed Workload',
};

const THRESHOLDS = [
  { min: 0, label: 'Slow', pct: 10, color: 'bg-red-500' },
  { min: 1000, label: 'Below Average', pct: 25, color: 'bg-orange-500' },
  { min: 5000, label: 'Average', pct: 50, color: 'bg-yellow-500' },
  { min: 15000, label: 'Fast', pct: 75, color: 'bg-lime-500' },
  { min: 30000, label: 'Very Fast', pct: 90, color: 'bg-green-500' },
  { min: 60000, label: 'Extreme', pct: 99, color: 'bg-emerald-500' },
];

function runBench(type: BenchType, duration: number): number {
  const start = performance.now();
  let ops = 0;
  const end = start + duration * 1000;
  while (performance.now() < end) {
    if (type === 'integer') {
      let x = 0;
      for (let i = 0; i < 1000; i++) { x += i; x *= 2; x -= 1; x = Math.floor(x / 2); }
    } else if (type === 'float') {
      let x = 0;
      for (let i = 0; i < 1000; i++) { x += Math.sin(i) * Math.cos(i) + Math.sqrt(i); }
    } else if (type === 'array') {
      const arr = Array.from({length: 100}, () => Math.random());
      arr.sort((a, b) => a - b);
    } else if (type === 'string') {
      let s = '';
      for (let i = 0; i < 100; i++) { s += 'hello world ' + i; s = s.replace(/o/g, '0'); }
    } else {
      for (let i = 0; i < 100; i++) { Math.sin(i); Math.cos(i); Math.sqrt(i); }
    }
    ops++;
  }
  return Math.round(ops / duration);
}

function getRanking(score: number): { label: string; pct: number; color: string } {
  for (let i = THRESHOLDS.length - 1; i >= 0; i--) {
    if (score >= THRESHOLDS[i].min) return THRESHOLDS[i];
  }
  return THRESHOLDS[0];
}

export default function BenchmarkBuilder() {
  const [benchType, setBenchType] = useState<BenchType>('mixed');
  const [duration, setDuration] = useState(2);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<{ type: BenchType; score: number; date: string }[]>([]);
  const [currentScore, setCurrentScore] = useState<number | null>(null);

  const run = useCallback(async () => {
    setRunning(true);
    setCurrentScore(null);
    await new Promise(r => setTimeout(r, 50));
    const score = runBench(benchType, duration);
    setCurrentScore(score);
    setResults(prev => [{ type: benchType, score, date: new Date().toLocaleTimeString() }, ...prev].slice(0, 20));
    setRunning(false);
    toast.success('Benchmark complete!');
  }, [benchType, duration]);

  const ranking = currentScore !== null ? getRanking(currentScore) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(BENCH_LABELS) as BenchType[]).map(t => (
            <button key={t} onClick={() => setBenchType(t)} disabled={running} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${benchType === t ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200 dark:border-blue-800' : 'text-zinc-500 border border-transparent'}`}>
              {BENCH_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Duration: {duration}s</label>
            <input type="range" min={1} max={5} step={0.5} value={duration} onChange={e => setDuration(parseFloat(e.target.value))} disabled={running} className="w-full" />
          </div>
          <button onClick={run} disabled={running} className={`bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${running ? 'opacity-70 cursor-not-allowed' : ''}`}>
            {running ? <><Loader2 className="w-4 h-4 animate-spin" /> Running...</> : <><Zap className="w-4 h-4" /> Run Benchmark</>}
          </button>
        </div>

        {currentScore !== null && ranking && (
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase block">Score</span>
                <span className="text-3xl font-bold font-mono text-blue-600 dark:text-blue-400">{currentScore.toLocaleString()}</span>
                <span className="text-xs text-zinc-400 ml-1">ops/s</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block">Ranking</span>
                <span className="text-lg font-bold" style={{ color: ranking.color === 'bg-red-500' ? '#ef4444' : ranking.color === 'bg-orange-500' ? '#f97316' : ranking.color === 'bg-yellow-500' ? '#eab308' : ranking.color === 'bg-lime-500' ? '#84cc16' : ranking.color === 'bg-green-500' ? '#22c55e' : '#10b981' }}>
                  {ranking.label}
                </span>
                <span className="text-xs text-zinc-400 ml-1">(faster than ~{ranking.pct}%)</span>
              </div>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-3 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${ranking.color}`} style={{ width: `${ranking.pct}%` }} />
            </div>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">History</span>
            <button onClick={() => { setResults([]); setCurrentScore(null); toast.success('Cleared!'); }} className="text-[10px] text-zinc-400 hover:underline">Clear</button>
          </div>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 px-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-[11px]">
                <span className="text-zinc-400">{BENCH_LABELS[r.type]}</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">{r.score.toLocaleString()} ops/s</span>
                <span className="text-zinc-400 text-[10px]">{r.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
