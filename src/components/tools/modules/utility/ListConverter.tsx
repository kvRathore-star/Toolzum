"use client";
import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { List } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';

type Delimiter = 'comma' | 'newline' | 'pipe' | 'tab' | 'semicolon' | 'space';

const DELIMITER_MAP: Record<Delimiter, { char: string; label: string }> = {
  comma: { char: ',', label: 'Comma' },
  newline: { char: '\n', label: 'Newline' },
  pipe: { char: '|', label: 'Pipe' },
  tab: { char: '\t', label: 'Tab' },
  semicolon: { char: ';', label: 'Semicolon' },
  space: { char: ' ', label: 'Space' },
};

function detectDelimiter(input: string): Delimiter {
  const counts: Record<string, number> = {};
  for (const d of Object.keys(DELIMITER_MAP) as Delimiter[]) {
    const char = DELIMITER_MAP[d].char;
    if (char === '\n') continue;
    counts[d] = (input.match(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0 && sorted[0][1] > 0) return sorted[0][0] as Delimiter;
  if (input.includes('\n')) return 'newline';
  return 'comma';
}

const inputCls = "w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 font-mono";

export default function ListConverter() {
  const [input, setInput] = useState('');
  const [targetDelimiter, setTargetDelimiter] = useState<Delimiter>('comma');
  const [trimItems, setTrimItems] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [sortAlpha, setSortAlpha] = useState(false);
  const [deduplicate, setDeduplicate] = useState(false);

  const detected = useMemo(() => input ? detectDelimiter(input) : null, [input]);

  const items = useMemo(() => {
    if (!input.trim()) return [];
    const delim = detected || 'comma';
    const char = DELIMITER_MAP[delim].char;
    let parts: string[];
    if (delim === 'newline') parts = input.split('\n');
    else parts = input.split(char);
    if (trimItems) parts = parts.map(p => p.trim());
    if (removeEmpty) parts = parts.filter(p => p.length > 0);
    if (deduplicate) parts = [...new Set(parts)];
    if (sortAlpha) parts = parts.sort((a, b) => a.localeCompare(b));
    return parts;
  }, [input, detected, trimItems, removeEmpty, deduplicate, sortAlpha]);

  const output = useMemo(() => {
    if (items.length === 0) return '';
    const char = DELIMITER_MAP[targetDelimiter].char;
    if (targetDelimiter === 'newline') return items.join('\n');
    return items.join(char + ' ');
  }, [items, targetDelimiter]);

  const copy = (txt: string, label: string) => { clipboardWrite(txt); toast.success(`${label} copied!`); };

  const presets = (Object.keys(DELIMITER_MAP) as Delimiter[]).map(d => ({
    label: DELIMITER_MAP[d].label,
    apply: () => setTargetDelimiter(d),
  }));

  const customResult = output ? (
    <div className="relative">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Output ({items.length} items)</span>
        <button onClick={() => copy(output, 'List')} className="text-xs text-[var(--accent)] hover:underline">Copy All</button>
      </div>
      <textarea
        value={output}
        readOnly
        className={`${inputCls} h-40 resize-none`}
      />
    </div>
  ) : null;

  const resultStats = detected ? [
    { label: 'Detected', value: DELIMITER_MAP[detected].label },
    { label: 'Items', value: String(items.length) },
    { label: 'Output', value: targetDelimiter === 'newline' ? 'Newline' : DELIMITER_MAP[targetDelimiter].label },
  ] : [];

  return (
    <CalculatorShell
      title="List Converter"
      icon={<List className="w-5 h-5" />}
      result=""
      onCalculate={() => {}}
      calculateLabel="Convert"
      resultStats={resultStats}
      resultLabel="Converted List"
      customResult={customResult}
      presets={presets}
      accent="teal"
    >
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Paste your list here..."
          className={`${inputCls} h-40 resize-none`}
        />

        {detected && (
          <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-2">
            <span>Detected delimiter:</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">{DELIMITER_MAP[detected].label}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <input type="checkbox" checked={trimItems} onChange={e => setTrimItems(e.target.checked)} className="rounded" /> Trim
          </label>
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <input type="checkbox" checked={removeEmpty} onChange={e => setRemoveEmpty(e.target.checked)} className="rounded" /> Remove empty
          </label>
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <input type="checkbox" checked={sortAlpha} onChange={e => setSortAlpha(e.target.checked)} className="rounded" /> Sort A→Z
          </label>
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <input type="checkbox" checked={deduplicate} onChange={e => setDeduplicate(e.target.checked)} className="rounded" /> Deduplicate
          </label>
        </div>
      </div>
    </CalculatorShell>
  );
}
