"use client";

import React, { useState, useEffect } from 'react';
import { TRANSFORM_CONFIG } from './textTransformConfig';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { getErrorMessage } from '@/utils/error';

const FORMAT_SLUGS = [
  "yaml-json-converter",
  "json-to-yaml-converter",
  "ini-json-converter",
  "json-to-ini-converter",
  "toml-converter",
  "json-to-toml-converter",
  "json-to-code",
];

const LABELS: Record<string, string> = {
  "yaml-json-converter": "YAML → JSON",
  "json-to-yaml-converter": "JSON → YAML",
  "ini-json-converter": "INI → JSON",
  "json-to-ini-converter": "JSON → INI",
  "toml-converter": "TOML → JSON",
  "json-to-toml-converter": "JSON → TOML",
  "json-to-code": "JSON → TypeScript",
};

export default function FormatSerializerHub({ slug: defaultSlug }: { slug: string; description?: string }) {
  const [mode, setMode] = useState(defaultSlug);
  const config = TRANSFORM_CONFIG[mode];
  const [input, setInput] = useState(config?.inputPlaceholder || '');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => { document.title = `${config?.name || 'Converter'} – Free Online Tool`; }, [mode, config?.name]);

  if (!config) return <div className="text-red-500">Unknown transform: {mode}</div>;

  const handleConvert = () => {
    try {
      const result = config.convert(input);
      setOutput(result);
    } catch (e: unknown) {
      setOutput(`Error: ${getErrorMessage(e)}`);
    }
  };

  const handleCopy = () => {
    clipboardWrite(output);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-1.5">
        {FORMAT_SLUGS.map(s => (
          <button key={s} onClick={() => { setMode(s); setInput(TRANSFORM_CONFIG[s]?.inputPlaceholder || ''); setOutput(''); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === s
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white border border-[var(--border-subtle)]'
            }`}>
            {LABELS[s]}
          </button>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">{config.name}</h2>
        <p className="text-xs text-[var(--text-secondary)]">{config.description}</p>
        <textarea rows={6} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-y min-h-[80px]" />
        <button onClick={handleConvert}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm transition-all active:scale-[0.98]">
          Convert
        </button>
        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">{config.outputLabel}</span>
              <button onClick={handleCopy} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
