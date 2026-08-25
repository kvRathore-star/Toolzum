"use client";

import React, { useState, useEffect } from 'react';
import { TRANSFORM_CONFIG } from './textTransformConfig';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { getErrorMessage } from '@/utils/error';

export const MODES = ["html-to-text-converter", "text-to-html-converter"];

const LABELS: Record<string, string> = {
  "html-to-text-converter": "HTML → Text",
  "text-to-html-converter": "Text → HTML",
};

export default function HtmlTextHub({ slug: defaultSlug }: { slug: string; description?: string }) {
  const [mode, setMode] = useState(defaultSlug);
  const config = TRANSFORM_CONFIG[mode];
  const [input, setInput] = useState(config?.inputPlaceholder || '');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => { document.title = `${config?.name || 'Converter'} – Free Online Tool`; }, [mode, config?.name]);

  if (!config) return <div className="text-red-500">Unknown transform: {mode}</div>;

  const presets = [
    { label: 'Article', apply: () => { setInput('<h1>Hello World</h1>\n<p>This is a <strong>sample article</strong> with <em>formatted text</em>.</p>\n<ul>\n  <li>Item one</li>\n  <li>Item two</li>\n</ul>'); setOutput(''); } },
    { label: 'Code Block', apply: () => { setInput('<pre><code>const x = 42;\nconsole.log(x);</code></pre>'); setOutput(''); } },
    { label: 'Table', apply: () => { setInput('<table>\n  <tr><th>Name</th><th>Age</th></tr>\n  <tr><td>Alice</td><td>30</td></tr>\n  <tr><td>Bob</td><td>25</td></tr>\n</table>'); setOutput(''); } },
  ];

  const handleConvert = () => {
    try { setOutput(config.convert(input)); } catch (e: unknown) { setOutput(`Error: ${getErrorMessage(e)}`); }
  };

  const handleCopy = () => {
    clipboardWrite(output); setCopied(true); toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'html-to-text-converter' ? 'text.txt' : 'html.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex bg-white dark:bg-black p-1 rounded-xl border border-[var(--border-subtle)] w-fit">
        {MODES.map(s => (
          <button key={s} onClick={() => { setMode(s); setInput(TRANSFORM_CONFIG[s]?.inputPlaceholder || ''); setOutput(''); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === s ? 'bg-blue-600 text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white'
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
              <div className="flex gap-2">
                <button onClick={handleCopy} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={handleDownload} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Download
                </button>
              </div>
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
