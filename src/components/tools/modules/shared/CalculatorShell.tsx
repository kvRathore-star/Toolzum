"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Copy, Clock, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Preset {
  label: string;
  apply: () => void;
}

interface CalculatorShellProps {
  title: string;
  children: React.ReactNode;
  result: string;
  error?: string;
  onCalculate: () => void;
  presets?: Preset[];
  downloadData?: string;
  downloadFilename?: string;
}

export function CalculatorShell({ title, children, result, error, onCalculate, presets, downloadData, downloadFilename }: CalculatorShellProps) {
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);

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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${showHistory ? 'bg-indigo-500/20 text-indigo-400' : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
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
                      ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                      : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:border-indigo-500/30'
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
              className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-lg"
            >
              Calculate
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
            <div className={`p-5 rounded-2xl text-sm font-mono whitespace-pre flex items-start justify-between gap-4 ${error ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-indigo-500/10 border border-indigo-500/20 text-[var(--accent)]'}`}>
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


