"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Copy, Clock, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Preset {
  label: string;
  apply: () => void;
}

interface AccentStyle { ring: string; bg: string; text: string; border: string; btn: string; btnHover: string; activeBg: string; activeText: string; activeBorder: string; resultBg: string; resultBorder: string }

const accentMap: Record<string, AccentStyle> = {
  indigo: { ring: 'focus:ring-indigo-500', bg: 'bg-indigo-500/10', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-500/20', btn: 'from-indigo-600 to-blue-600', btnHover: 'hover:from-indigo-500 hover:to-blue-500', activeBg: 'bg-indigo-500/20', activeText: 'text-indigo-700 dark:text-indigo-400', activeBorder: 'border-indigo-500/30', resultBg: 'bg-indigo-500/10', resultBorder: 'border-indigo-500/20' },
  blue: { ring: 'focus:ring-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-500/20', btn: 'from-blue-600 to-cyan-600', btnHover: 'hover:from-blue-500 hover:to-cyan-500', activeBg: 'bg-blue-500/20', activeText: 'text-blue-700 dark:text-blue-400', activeBorder: 'border-blue-500/30', resultBg: 'bg-blue-500/10', resultBorder: 'border-blue-500/20' },
  emerald: { ring: 'focus:ring-emerald-500', bg: 'bg-emerald-700/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-500/20', btn: 'from-emerald-600 to-teal-600', btnHover: 'hover:from-emerald-500 hover:to-teal-500', activeBg: 'bg-emerald-700/20', activeText: 'text-emerald-700 dark:text-emerald-400', activeBorder: 'border-emerald-500/30', resultBg: 'bg-emerald-700/10', resultBorder: 'border-emerald-500/20' },
  violet: { ring: 'focus:ring-violet-500', bg: 'bg-violet-500/10', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-500/20', btn: 'from-violet-600 to-purple-600', btnHover: 'hover:from-violet-500 hover:to-purple-500', activeBg: 'bg-violet-500/20', activeText: 'text-violet-700 dark:text-violet-400', activeBorder: 'border-violet-500/30', resultBg: 'bg-violet-500/10', resultBorder: 'border-violet-500/20' },
  amber: { ring: 'focus:ring-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-500/20', btn: 'from-amber-600 to-orange-600', btnHover: 'hover:from-amber-500 hover:to-orange-500', activeBg: 'bg-amber-500/20', activeText: 'text-amber-700 dark:text-amber-400', activeBorder: 'border-amber-500/30', resultBg: 'bg-amber-500/10', resultBorder: 'border-amber-500/20' },
  rose: { ring: 'focus:ring-rose-500', bg: 'bg-rose-500/10', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-500/20', btn: 'from-rose-600 to-pink-600', btnHover: 'hover:from-rose-500 hover:to-pink-500', activeBg: 'bg-rose-500/20', activeText: 'text-rose-700 dark:text-rose-400', activeBorder: 'border-rose-500/30', resultBg: 'bg-rose-500/10', resultBorder: 'border-rose-500/20' },
  cyan: { ring: 'focus:ring-cyan-500', bg: 'bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-500/20', btn: 'from-cyan-600 to-sky-600', btnHover: 'hover:from-cyan-500 hover:to-sky-500', activeBg: 'bg-cyan-500/20', activeText: 'text-cyan-700 dark:text-cyan-400', activeBorder: 'border-cyan-500/30', resultBg: 'bg-cyan-500/10', resultBorder: 'border-cyan-500/20' },
  orange: { ring: 'focus:ring-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-500/20', btn: 'from-orange-600 to-red-600', btnHover: 'hover:from-orange-500 hover:to-red-500', activeBg: 'bg-orange-500/20', activeText: 'text-orange-700 dark:text-orange-400', activeBorder: 'border-orange-500/30', resultBg: 'bg-orange-500/10', resultBorder: 'border-orange-500/20' },
  teal: { ring: 'focus:ring-teal-500', bg: 'bg-teal-500/10', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-500/20', btn: 'from-teal-600 to-emerald-600', btnHover: 'hover:from-teal-500 hover:to-emerald-500', activeBg: 'bg-teal-500/20', activeText: 'text-teal-700 dark:text-teal-400', activeBorder: 'border-teal-500/30', resultBg: 'bg-teal-500/10', resultBorder: 'border-teal-500/20' },
  pink: { ring: 'focus:ring-pink-500', bg: 'bg-pink-500/10', text: 'text-pink-700 dark:text-pink-400', border: 'border-pink-500/20', btn: 'from-pink-600 to-rose-600', btnHover: 'hover:from-pink-500 hover:to-rose-500', activeBg: 'bg-pink-500/20', activeText: 'text-pink-700 dark:text-pink-400', activeBorder: 'border-pink-500/30', resultBg: 'bg-pink-500/10', resultBorder: 'border-pink-500/20' },
  lime: { ring: 'focus:ring-lime-500', bg: 'bg-lime-500/10', text: 'text-lime-700 dark:text-lime-400', border: 'border-lime-500/20', btn: 'from-lime-600 to-green-600', btnHover: 'hover:from-lime-500 hover:to-green-500', activeBg: 'bg-lime-500/20', activeText: 'text-lime-700 dark:text-lime-400', activeBorder: 'border-lime-500/30', resultBg: 'bg-lime-500/10', resultBorder: 'border-lime-500/20' },
  sky: { ring: 'focus:ring-sky-500', bg: 'bg-sky-500/10', text: 'text-sky-700 dark:text-sky-400', border: 'border-sky-500/20', btn: 'from-sky-600 to-blue-600', btnHover: 'hover:from-sky-500 hover:to-blue-500', activeBg: 'bg-sky-500/20', activeText: 'text-sky-700 dark:text-sky-400', activeBorder: 'border-sky-500/30', resultBg: 'bg-sky-500/10', resultBorder: 'border-sky-500/20' },
  fuchsia: { ring: 'focus:ring-fuchsia-500', bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-700 dark:text-fuchsia-400', border: 'border-fuchsia-500/20', btn: 'from-fuchsia-600 to-purple-600', btnHover: 'hover:from-fuchsia-500 hover:to-purple-500', activeBg: 'bg-fuchsia-500/20', activeText: 'text-fuchsia-700 dark:text-fuchsia-400', activeBorder: 'border-fuchsia-500/30', resultBg: 'bg-fuchsia-500/10', resultBorder: 'border-fuchsia-500/20' },
  purple: { ring: 'focus:ring-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-500/20', btn: 'from-purple-600 to-violet-600', btnHover: 'hover:from-purple-500 hover:to-violet-500', activeBg: 'bg-purple-500/20', activeText: 'text-purple-700 dark:text-purple-400', activeBorder: 'border-purple-500/30', resultBg: 'bg-purple-500/10', resultBorder: 'border-purple-500/20' },
  red: { ring: 'focus:ring-red-500', bg: 'bg-red-500/10', text: 'text-red-700 dark:text-red-400', border: 'border-red-500/20', btn: 'from-red-600 to-orange-600', btnHover: 'hover:from-red-500 hover:to-orange-500', activeBg: 'bg-red-500/20', activeText: 'text-red-700 dark:text-red-400', activeBorder: 'border-red-500/30', resultBg: 'bg-red-500/10', resultBorder: 'border-red-500/20' },
  green: { ring: 'focus:ring-green-500', bg: 'bg-green-500/10', text: 'text-green-700 dark:text-green-400', border: 'border-green-500/20', btn: 'from-green-600 to-emerald-600', btnHover: 'hover:from-green-500 hover:to-emerald-500', activeBg: 'bg-green-500/20', activeText: 'text-green-700 dark:text-green-400', activeBorder: 'border-green-500/30', resultBg: 'bg-green-500/10', resultBorder: 'border-green-500/20' },
};

interface CalculatorShellProps {
  title: string;
  children: React.ReactNode;
  result: string;
  error?: string;
  onCalculate: () => void;
  calculateLabel?: string;
  presets?: Preset[];
  downloadData?: string;
  downloadFilename?: string;
  accent?: string;
}

export function CalculatorShell({ title, children, result, error, onCalculate, calculateLabel = 'Calculate', presets, downloadData, downloadFilename, accent = 'indigo' }: CalculatorShellProps) {
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const a = accentMap[accent] || accentMap.indigo;

  const prevResultRef = useRef(result);
  useEffect(() => {
    if (result && result !== prevResultRef.current) {
      setHistory(prev => [...prev, result]);
    }
    prevResultRef.current = result;
  }, [result]);

  const copyResult = useCallback(() => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast.success('Result copied');
    }
  }, [result]);

  const handleDownload = useCallback(() => {
    if (!downloadData) return;
    const blob = new Blob([downloadData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFilename || 'download.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File downloaded');
  }, [downloadData, downloadFilename]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && shellRef.current?.contains(e.target as Node)) {
        e.preventDefault();
        onCalculate();
      }
    };
    const shell = shellRef.current;
    shell?.addEventListener('keydown', handler);
    return () => shell?.removeEventListener('keydown', handler);
  }, [onCalculate]);

  return (
    <div className="max-w-2xl mx-auto" ref={shellRef}>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{title}</h1>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${showHistory ? a.activeBg + ' ' + a.activeText : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            <Clock size={14} />
            History {history.length > 0 && `(${history.length})`}
            {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showHistory && history.length > 0 && (
          <div className="mx-6 mb-3 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] max-h-40 overflow-y-auto">
            {history.map((entry, i) => (
              <div key={i} className="px-4 py-2 border-b border-[var(--border-subtle)] last:border-0 text-sm text-[var(--text-secondary)] font-mono">
                {entry}
              </div>
            ))}
          </div>
        )}

        <div className="px-6 pb-6 space-y-4">
          {presets && presets.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => { setActivePreset(p.label); p.apply(); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    activePreset === p.label
                      ? a.activeBg + ' ' + a.activeText + ' ' + a.activeBorder
                      : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)] ' + a.border
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {children}

          <div className="flex gap-3">
            <button
              onClick={onCalculate}
              className={`flex-1 bg-gradient-to-r ${a.btn} ${a.btnHover} text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-lg`}
            >
              {calculateLabel}
            </button>
            {downloadData && (
              <button
                onClick={handleDownload}
                className="px-4 py-3.5 rounded-xl bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-all active:scale-95"
                title="Download CSV"
              >
                <Download size={20} />
              </button>
            )}
          </div>

          {(result || error) && (
            <div className={`p-5 rounded-2xl text-sm font-mono whitespace-pre flex items-start justify-between gap-4 ${error ? 'bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400' : a.resultBg + ' border ' + a.resultBorder + ' ' + a.text}`}>
              <span className="flex-1">{error || result}</span>
              {result && (
                <div className="flex items-center gap-1 shrink-0">
                  {downloadData && (
                    <button onClick={handleDownload} className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors" title="Download">
                      <Download size={16} />
                    </button>
                  )}
                  <button onClick={copyResult} className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors" title="Copy result">
                    <Copy size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
