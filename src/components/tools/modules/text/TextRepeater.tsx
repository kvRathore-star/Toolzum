"use client";

import React, { useMemo, useState } from 'react';
import { Repeat, Copy, Download, Eraser } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const SEPARATORS = [
  { label: 'None', value: '' },
  { label: 'Space', value: ' ' },
  { label: 'New Line', value: '\n' },
  { label: 'Comma', value: ', ' },
  { label: 'Pipe', value: ' | ' },
  { label: 'Dash', value: ' - ' },
  { label: 'Dot', value: '. ' },
  { label: 'Semicolon', value: '; ' },
];

export default function TextRepeater() {
  const [text, setText] = useState('');
  const [count, setCount] = useState(5);
  const [separator, setSeparator] = useState(SEPARATORS[1]!.value);
  const [addNumbering, setAddNumbering] = useState(false);

  const output = useMemo(() => {
    if (!text || count < 1) return '';
    const items = Array.from({ length: count }, (_, i) => {
      const prefix = addNumbering ? `${i + 1}. ` : '';
      return `${prefix}${text}`;
    });
    return items.join(separator);
  }, [text, count, separator, addNumbering]);

  const handleCopy = () => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Copied repeated text!');
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'repeated-text.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File downloaded!');
  };

  const handleClear = () => {
    setText('');
    setCount(5);
    setSeparator(SEPARATORS[1]!.value);
    setAddNumbering(false);
  };

  const totalChars = output.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
          <Repeat className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Text Repeater</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="lbl-textrepeater-text-to-repeat" className="text-xs text-[var(--text-muted)] font-bold uppercase">Text to Repeat</label>
              <textarea id="lbl-textrepeater-text-to-repeat" aria-label="Text to Repeat"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type or paste your text here..."
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-32 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="lbl-textrepeater-repeat-count" className="text-xs text-[var(--text-muted)] font-bold uppercase">Repeat Count</label>
                <input id="lbl-textrepeater-repeat-count" aria-label="Repeat Count"
                  type="number"
                  min={1}
                  max={10000}
                  value={count}
                  onChange={e => setCount(Math.max(1, Math.min(10000, parseInt(e.target.value) || 1)))}
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="lbl-textrepeater-separator" className="text-xs text-[var(--text-muted)] font-bold uppercase">Separator</label>
                <select id="lbl-textrepeater-separator" aria-label="Separator"
                  value={separator}
                  onChange={e => setSeparator(e.target.value)}
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                >
                  {SEPARATORS.map(s => (
                    <option key={s.label} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-muted)]">
              <input
                type="checkbox"
                checked={addNumbering}
                onChange={e => setAddNumbering(e.target.checked)}
                className="rounded text-[var(--accent)]"
              />
              Add numbering (1., 2., 3., ...)
            </label>
          </div>

          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Output</label>
                <span className="text-xs text-[var(--text-muted)]">{totalChars.toLocaleString()} chars</span>
              </div>
              <textarea aria-label="Repeated text"
                value={output}
                readOnly
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--accent)] font-mono text-sm h-32 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCopy} disabled={!output} className="flex-1 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 cursor-pointer">
                <Copy className="w-4 h-4" /> Copy All
              </button>
              <button onClick={handleDownload} disabled={!output} className="flex-1 bg-[var(--bg-overlay)] hover:bg-[var(--border-subtle)] disabled:opacity-50 text-[var(--text-primary)] font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 border border-[var(--border-subtle)] cursor-pointer">
                <Download className="w-4 h-4" /> Download
              </button>
              <button onClick={handleClear} aria-label="Clear text" className="px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm cursor-pointer">
                <Eraser className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
