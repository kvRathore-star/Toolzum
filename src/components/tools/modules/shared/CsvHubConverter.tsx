"use client";

import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { getErrorMessage } from '@/utils/error';
import { MODES, parseCsv, CSV_HUB_TABS } from './CsvOutputConverter';

const HUB_TABS = CSV_HUB_TABS;

function slugToMode(slug: string): string {
  for (const t of HUB_TABS) {
    if (t.slug === slug) return t.slug;
  }
  return 'csv-to-markdown';
}

export default function CsvHubConverter({ slug }: { slug: string }) {
  const [activeSlug, setActiveSlug] = useState(slugToMode(slug));
  const [input, setInput] = useState('name,price,stock\nWidget,29.99,100\nGadget,49.99,50\nDoohickey,19.99,200');
  const [output, setOutput] = useState('');

  const mode = MODES[activeSlug]!;

  const handleConvert = useCallback(() => {
    try {
      const { headers, rows } = parseCsv(input);
      setOutput(mode.transform(headers, rows));
    } catch (e: unknown) {
      setOutput(`Error: ${getErrorMessage(e)}`);
    }
  }, [input, mode]);

  const handleCopy = useCallback(() => {
    clipboardWrite(output);
    toast.success('Copied!');
  }, [output]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">{mode.name}</h2>
        <p className="text-xs text-[var(--text-secondary)]">{mode.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {HUB_TABS.map(tab => (
            <button
              key={tab.slug}
              onClick={() => setActiveSlug(tab.slug)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeSlug === tab.slug
                  ? 'bg-[var(--accent-ink)] text-white shadow-sm'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <textarea
          rows={6}
          value={input}
          onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] resize-y min-h-[80px]"
        />
        <button
          onClick={handleConvert}
          className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-2 rounded-lg text-sm transition-all active:scale-[0.98]"
        >
          Convert
        </button>
        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">{mode.outputLabel}</span>
              <button
                onClick={handleCopy}
                className="text-xs text-[var(--accent)] hover:underline font-medium"
              >
                Copy
              </button>
            </div>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-96 overflow-y-auto">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
