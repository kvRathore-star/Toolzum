"use client";
import React, { useState } from 'react';
import { Hash, Settings2, RefreshCw, Copy, CheckCircle2 } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

export default function RandomNumberGenerator() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const generateNumbers = () => {
    if (min >= max) {
      setError('Minimum value must be less than maximum value.');
      return;
    }
    
    const range = max - min + 1;
    if (!allowDuplicates && count > range) {
      setError(`Cannot generate ${count} unique numbers in a range of ${range}.`);
      return;
    }
    
    setError('');
    setIsGenerating(true);
    
    // Simulate thinking/rolling for animation
    setTimeout(() => {
      const newResults: number[] = [];
      const used = new Set<number>();
      
      while (newResults.length < count) {
        const num = Math.floor(Math.random() * range) + min;
        if (allowDuplicates || !used.has(num)) {
          newResults.push(num);
          if (!allowDuplicates) used.add(num);
        }
      }
      
      setResults(newResults);
      setIsGenerating(false);
      setCopied(false);
    }, 400);
  };

  const copyToClipboard = () => {
    if (results.length === 0) return;
    clipboardWrite(results.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        <div className="border-b border-[var(--border-subtle)] p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Hash className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Random Number Generator</h2>
              <p className="text-sm text-[var(--text-secondary)]">Generate random numbers securely</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Settings Sidebar */}
          <div className="md:col-span-5 p-6 border-b md:border-b-0 md:border-r border-[var(--border-subtle)] bg-[var(--bg-overlay)]/50 dark:bg-[var(--bg-overlay)] space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-4 h-4 text-[var(--text-secondary)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Configuration</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-primary)]">Min</label>
                <input
                  type="number"
                  value={min}
                  onChange={(e) => setMin(parseInt(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-primary)]">Max</label>
                <input
                  type="number"
                  value={max}
                  onChange={(e) => setMax(parseInt(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-primary)]">Count</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className="w-full bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all"
              />
            </div>
            
            <label className="flex items-center gap-3 p-3 bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl cursor-pointer hover:border-orange-500/50 transition-colors">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={allowDuplicates}
                  onChange={(e) => setAllowDuplicates(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-10 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </div>
              <span className="text-sm font-medium text-[var(--text-primary)]">Allow Duplicates</span>
            </label>
            
            {error && (
              <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-500/10 p-3 rounded-lg">
                {error}
              </p>
            )}
            
            <button
              onClick={generateNumbers}
              disabled={isGenerating}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isGenerating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Generate
                </>
              )}
            </button>
          </div>

          {/* Results Area */}
          <div className="md:col-span-7 p-6 flex flex-col min-h-[300px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Results</h3>
              {results.length > 0 && (
                <button
                  onClick={copyToClipboard}
                  className="text-sm text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy All'}
                </button>
              )}
            </div>
            
            <div className="flex-1 bg-[var(--bg-overlay)]/50 rounded-xl border border-[var(--border-subtle)] p-6 flex flex-col">
              {results.length === 0 && !isGenerating ? (
                <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)]">
                  <Hash className="w-12 h-12 mb-3 opacity-20" />
                  <p>Click Generate to create random numbers</p>
                </div>
              ) : (
                <div className={`flex flex-wrap gap-3 content-start transition-opacity duration-300 ${isGenerating ? 'opacity-50' : 'opacity-100'}`}>
                  {results.map((num, i) => (
                    <div 
                      key={i} 
                      className="px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg text-lg font-bold text-[var(--text-primary)] shadow-sm animate-in zoom-in duration-300"
                      style={{ animationDelay: `${Math.min(i * 30, 500)}ms` }}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}