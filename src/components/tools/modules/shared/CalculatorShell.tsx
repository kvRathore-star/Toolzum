"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Copy, Clock, ChevronDown, ChevronUp, Download, RotateCcw } from 'lucide-react';
import { getCategoryTheme } from '@/lib/categoryTheme';
import { clipboardWrite } from '@/lib/clipboard';
import { toast } from 'react-hot-toast';

interface Preset {
  label: string;
  apply: () => void;
}

interface ResultStat {
  label: string;
  value: string;
  color?: string;
}

interface AccentStyle { ring: string; bg: string; text: string; border: string; btn: string; btnHover: string; activeBg: string; activeText: string; activeBorder: string; resultBg: string; resultBorder: string; icon: string; }

const accentMap: Record<string, AccentStyle> = {
  indigo: { ring: 'focus:ring-indigo-500', bg: 'bg-indigo-500/10', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-500/20', btn: 'from-indigo-600 to-blue-600', btnHover: 'hover:from-indigo-500 hover:to-blue-500', activeBg: 'bg-indigo-500/20', activeText: 'text-indigo-700 dark:text-indigo-400', activeBorder: 'border-indigo-500/30', resultBg: 'bg-indigo-500/10', resultBorder: 'border-indigo-500/20', icon: 'text-indigo-500' },
  blue: { ring: 'focus:ring-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-500/20', btn: 'from-blue-600 to-cyan-600', btnHover: 'hover:from-blue-500 hover:to-cyan-500', activeBg: 'bg-blue-500/20', activeText: 'text-blue-700 dark:text-blue-400', activeBorder: 'border-blue-500/30', resultBg: 'bg-blue-500/10', resultBorder: 'border-blue-500/20', icon: 'text-blue-500' },
  emerald: { ring: 'focus:ring-emerald-500', bg: 'bg-emerald-700/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-500/20', btn: 'from-emerald-600 to-teal-600', btnHover: 'hover:from-emerald-500 hover:to-teal-500', activeBg: 'bg-emerald-700/20', activeText: 'text-emerald-700 dark:text-emerald-400', activeBorder: 'border-emerald-500/30', resultBg: 'bg-emerald-700/10', resultBorder: 'border-emerald-500/20', icon: 'text-emerald-500' },
  violet: { ring: 'focus:ring-violet-500', bg: 'bg-violet-500/10', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-500/20', btn: 'from-violet-600 to-purple-600', btnHover: 'hover:from-violet-500 hover:to-purple-500', activeBg: 'bg-violet-500/20', activeText: 'text-violet-700 dark:text-violet-400', activeBorder: 'border-violet-500/30', resultBg: 'bg-violet-500/10', resultBorder: 'border-violet-500/20', icon: 'text-violet-500' },
  amber: { ring: 'focus:ring-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-500/20', btn: 'from-amber-600 to-orange-600', btnHover: 'hover:from-amber-500 hover:to-orange-500', activeBg: 'bg-amber-500/20', activeText: 'text-amber-700 dark:text-amber-400', activeBorder: 'border-amber-500/30', resultBg: 'bg-amber-500/10', resultBorder: 'border-amber-500/20', icon: 'text-amber-500' },
  rose: { ring: 'focus:ring-rose-500', bg: 'bg-rose-500/10', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-500/20', btn: 'from-rose-600 to-pink-600', btnHover: 'hover:from-rose-500 hover:to-pink-500', activeBg: 'bg-rose-500/20', activeText: 'text-rose-700 dark:text-rose-400', activeBorder: 'border-rose-500/30', resultBg: 'bg-rose-500/10', resultBorder: 'border-rose-500/20', icon: 'text-rose-500' },
  cyan: { ring: 'focus:ring-cyan-500', bg: 'bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-500/20', btn: 'from-cyan-600 to-sky-600', btnHover: 'hover:from-cyan-500 hover:to-sky-500', activeBg: 'bg-cyan-500/20', activeText: 'text-cyan-700 dark:text-cyan-400', activeBorder: 'border-cyan-500/30', resultBg: 'bg-cyan-500/10', resultBorder: 'border-cyan-500/20', icon: 'text-cyan-500' },
  orange: { ring: 'focus:ring-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-500/20', btn: 'from-orange-600 to-red-600', btnHover: 'hover:from-orange-500 hover:to-red-500', activeBg: 'bg-orange-500/20', activeText: 'text-orange-700 dark:text-orange-400', activeBorder: 'border-orange-500/30', resultBg: 'bg-orange-500/10', resultBorder: 'border-orange-500/20', icon: 'text-orange-500' },
  teal: { ring: 'focus:ring-teal-500', bg: 'bg-teal-500/10', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-500/20', btn: 'from-teal-600 to-emerald-600', btnHover: 'hover:from-teal-500 hover:to-emerald-500', activeBg: 'bg-teal-500/20', activeText: 'text-teal-700 dark:text-teal-400', activeBorder: 'border-teal-500/30', resultBg: 'bg-teal-500/10', resultBorder: 'border-teal-500/20', icon: 'text-teal-500' },
  pink: { ring: 'focus:ring-pink-500', bg: 'bg-pink-500/10', text: 'text-pink-700 dark:text-pink-400', border: 'border-pink-500/20', btn: 'from-pink-600 to-rose-600', btnHover: 'hover:from-pink-500 hover:to-rose-500', activeBg: 'bg-pink-500/20', activeText: 'text-pink-700 dark:text-pink-400', activeBorder: 'border-pink-500/30', resultBg: 'bg-pink-500/10', resultBorder: 'border-pink-500/20', icon: 'text-pink-500' },
  lime: { ring: 'focus:ring-lime-500', bg: 'bg-lime-500/10', text: 'text-lime-700 dark:text-lime-400', border: 'border-lime-500/20', btn: 'from-lime-600 to-green-600', btnHover: 'hover:from-lime-500 hover:to-green-500', activeBg: 'bg-lime-500/20', activeText: 'text-lime-700 dark:text-lime-400', activeBorder: 'border-lime-500/30', resultBg: 'bg-lime-500/10', resultBorder: 'border-lime-500/20', icon: 'text-lime-500' },
  sky: { ring: 'focus:ring-sky-500', bg: 'bg-sky-500/10', text: 'text-sky-700 dark:text-sky-400', border: 'border-sky-500/20', btn: 'from-sky-600 to-blue-600', btnHover: 'hover:from-sky-500 hover:to-blue-500', activeBg: 'bg-sky-500/20', activeText: 'text-sky-700 dark:text-sky-400', activeBorder: 'border-sky-500/30', resultBg: 'bg-sky-500/10', resultBorder: 'border-sky-500/20', icon: 'text-sky-500' },
  fuchsia: { ring: 'focus:ring-fuchsia-500', bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-700 dark:text-fuchsia-400', border: 'border-fuchsia-500/20', btn: 'from-fuchsia-600 to-purple-600', btnHover: 'hover:from-fuchsia-500 hover:to-purple-500', activeBg: 'bg-fuchsia-500/20', activeText: 'text-fuchsia-700 dark:text-fuchsia-400', activeBorder: 'border-fuchsia-500/30', resultBg: 'bg-fuchsia-500/10', resultBorder: 'border-fuchsia-500/20', icon: 'text-fuchsia-500' },
  purple: { ring: 'focus:ring-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-500/20', btn: 'from-purple-600 to-violet-600', btnHover: 'hover:from-purple-500 hover:to-violet-500', activeBg: 'bg-purple-500/20', activeText: 'text-purple-700 dark:text-purple-400', activeBorder: 'border-purple-500/30', resultBg: 'bg-purple-500/10', resultBorder: 'border-purple-500/20', icon: 'text-purple-500' },
  red: { ring: 'focus:ring-red-500', bg: 'bg-red-500/10', text: 'text-red-700 dark:text-red-400', border: 'border-red-500/20', btn: 'from-red-600 to-orange-600', btnHover: 'hover:from-red-500 hover:to-orange-500', activeBg: 'bg-red-500/20', activeText: 'text-red-700 dark:text-red-400', activeBorder: 'border-red-500/30', resultBg: 'bg-red-500/10', resultBorder: 'border-red-500/20', icon: 'text-red-500' },
  green: { ring: 'focus:ring-green-500', bg: 'bg-green-500/10', text: 'text-green-700 dark:text-green-400', border: 'border-green-500/20', btn: 'from-green-600 to-emerald-600', btnHover: 'hover:from-green-500 hover:to-emerald-500', activeBg: 'bg-green-500/20', activeText: 'text-green-700 dark:text-green-400', activeBorder: 'border-green-500/30', resultBg: 'bg-green-500/10', resultBorder: 'border-green-500/20', icon: 'text-green-500' },
};

interface CalculatorShellProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  result: string;
  error?: string;
  onCalculate?: () => void;
  calculateLabel?: string;
  auto?: boolean;
  presets?: Preset[];
  resultStats?: ResultStat[];
  resultLabel?: string;
  downloadData?: string;
  downloadFilename?: string;
  accent?: string;
  category?: string;
  customResult?: React.ReactNode;
}

export function CalculatorShell({
  title,
  icon,
  children,
  result,
  error,
  onCalculate,
  calculateLabel = 'Calculate',
  auto = false,
  presets,
  resultStats,
  resultLabel,
  downloadData,
  downloadFilename,
  accent = 'indigo',
  category,
  customResult,
}: CalculatorShellProps) {
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const a = accentMap[accent] || accentMap.indigo!;
  const resolvedIcon = icon ?? (category ? React.createElement(getCategoryTheme(category).icon, { size: 20 }) : null);

  const prevResultRef = useRef(result);
  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (result && result !== prevResultRef.current) {
      if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
      const captured = result;
      historyTimerRef.current = setTimeout(() => {
        setHistory(prev => [...prev, captured]);
      }, 500);
    }
    prevResultRef.current = result;
    return () => { if (historyTimerRef.current) clearTimeout(historyTimerRef.current); };
  }, [result]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && showHistory) {
      setShowHistory(false);
      shellRef.current?.querySelector<HTMLButtonElement>('[aria-label*="history"]')?.focus();
    }
  }, [showHistory]);

  const copyResult = useCallback(async () => {
    if (!result) return;
    if (await clipboardWrite(result)) {
      toast.success('Result copied');
    } else {
      toast.error('Copy failed — select the result text manually');
    }
  }, [result]);

  const handleDownload = useCallback(() => {
    if (!downloadData) return;
    const blob = new Blob([downloadData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url;
    el.download = downloadFilename || 'download.csv';
    el.click();
    URL.revokeObjectURL(url);
    toast.success('File downloaded');
  }, [downloadData, downloadFilename]);

  useEffect(() => {
    if (auto || !onCalculate) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && shellRef.current?.contains(e.target as Node)) {
        e.preventDefault();
        onCalculate();
      }
    };
    const shell = shellRef.current;
    shell?.addEventListener('keydown', handler);
    return () => shell?.removeEventListener('keydown', handler);
  }, [onCalculate, auto]);

  const hasResult = result || error || customResult;

  return (
    <div ref={shellRef} onKeyDown={handleKeyDown} role="group" aria-label={title}>
      {/* Header with icon + title + history toggle */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-6">
        <div className="flex items-center gap-2">
          {resolvedIcon && <span className={a.icon}>{resolvedIcon}</span>}
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          aria-expanded={showHistory}
          aria-label={showHistory ? 'Hide calculation history' : 'Show calculation history'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${showHistory ? a.activeBg + ' ' + a.activeText : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          <Clock size={14} />
          History {history.length > 0 && `(${history.length})`}
          {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* History panel */}
      {showHistory && history.length > 0 && (
        <div className="mb-6 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] max-h-40 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-subtle)]">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">History</span>
            <button onClick={() => setHistory([])} className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"><RotateCcw size={12} /> Clear</button>
          </div>
          {history.map((entry, i) => (
            <div key={i} className="px-4 py-2 border-b border-[var(--border-subtle)] last:border-0 text-sm text-[var(--text-secondary)] font-mono">
              {entry}
            </div>
          ))}
        </div>
      )}

      {/* Presets */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => { setActivePreset(p.label); p.apply(); }}
              aria-pressed={activePreset === p.label}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                activePreset === p.label
                  ? a.activeBg + ' ' + a.activeText + ' ' + a.activeBorder
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Two-column layout: Inputs left, Result right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Inputs + Calculate button */}
        <div className="space-y-4">
          {children}

          {!auto && onCalculate && (
            <button
              onClick={onCalculate}
              className={`w-full bg-gradient-to-r ${a.btn} ${a.btnHover} text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
            >
              {calculateLabel}
            </button>
          )}
        </div>

        {/* Right: Result panel */}
        {hasResult && (
          <div aria-live="polite" className={`rounded-2xl p-6 border flex flex-col justify-between ${error ? 'bg-red-500/10 border-red-500/20' : a.resultBg + ' ' + a.resultBorder}`}>
            {/* Stats row (if provided) */}
            {resultStats && resultStats.length > 0 && (
              <div className="space-y-3 mb-4">
                <div className={`grid grid-cols-${Math.min(resultStats.length, 3)} gap-4`}>
                  {resultStats.map((stat, i) => (
                    <div key={i}>
                      <span className="text-xs text-[var(--text-muted)]">{stat.label}</span>
                      <p className={`text-lg font-bold ${stat.color || 'text-[var(--text-secondary)] dark:text-white'}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action icons */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {resultLabel && (
                  <span className="text-xs text-[var(--text-muted)]">{resultLabel}</span>
                )}
                {error ? (
                  <p className="text-sm font-mono text-red-700 dark:text-red-400 mt-1">{error}</p>
                ) : customResult ? (
                  <div className="mt-1">{customResult}</div>
                ) : result ? (
                  <>
                    <p className={`text-xl font-bold ${a.icon} mt-1`}>{result}</p>
                    <div className="flex items-center gap-1 mt-3">
                      {downloadData && (
                        <button onClick={handleDownload} aria-label="Download result" className={`p-1.5 bg-[var(--bg-surface)] hover:${a.bg} text-[var(--text-muted)] hover:${a.icon} rounded-lg transition-colors`}>
                          <Download size={14} />
                        </button>
                      )}
                      <button onClick={copyResult} aria-label="Copy result" className={`p-1.5 bg-[var(--bg-surface)] hover:${a.bg} text-[var(--text-muted)] hover:${a.icon} rounded-lg transition-colors`}>
                        <Copy size={14} />
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
