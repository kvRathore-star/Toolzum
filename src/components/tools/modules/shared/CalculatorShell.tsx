"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Copy, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CalculatorShellProps {
  title: string;
  children: React.ReactNode;
  result: string;
  error?: string;
  onCalculate: () => void;
}

export function CalculatorShell({ title, children, result, error, onCalculate }: CalculatorShellProps) {
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
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
          {children}

          <button
            onClick={onCalculate}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-lg"
          >
            Calculate
          </button>

          {(result || error) && (
            <div className={`p-5 rounded-2xl text-sm font-mono whitespace-pre flex items-start justify-between gap-4 ${error ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-indigo-500/10 border border-indigo-500/20 text-[var(--accent)]'}`}>
              <span>{error || result}</span>
              {result && (
                <button onClick={copyResult} className="shrink-0 p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors" title="Copy result">
                  <Copy size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


