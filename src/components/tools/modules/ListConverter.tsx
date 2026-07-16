"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { List } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Delimiter = 'comma' | 'newline' | 'pipe' | 'tab' | 'semicolon' | 'space';

const DELIMITER_MAP: Record<Delimiter, { char: string; label: string }> = {
  comma: { char: ',', label: 'Comma (,)' },
  newline: { char: '\n', label: 'Newline' },
  pipe: { char: '|', label: 'Pipe (|)' },
  tab: { char: '\t', label: 'Tab' },
  semicolon: { char: ';', label: 'Semicolon (;)' },
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
  // Check for newlines
  if (input.includes('\n')) return 'newline';
  return 'comma';
}

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

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste your list here..." className="w-full h-[200px] bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono" />
        
        {detected && (
          <div className="text-[11px] text-zinc-500 flex items-center gap-2">
            <span>Detected delimiter:</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">{DELIMITER_MAP[detected].label}</span>
            <span className="text-zinc-400 ml-auto">{items.length} item{items.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <span className="text-[10px] font-bold text-zinc-400 uppercase self-center mr-1">Options:</span>
          <label className="flex items-center gap-1.5 text-[11px] text-zinc-500"><input type="checkbox" checked={trimItems} onChange={e => setTrimItems(e.target.checked)} /> Trim</label>
          <label className="flex items-center gap-1.5 text-[11px] text-zinc-500"><input type="checkbox" checked={removeEmpty} onChange={e => setRemoveEmpty(e.target.checked)} /> Remove empty</label>
          <label className="flex items-center gap-1.5 text-[11px] text-zinc-500"><input type="checkbox" checked={sortAlpha} onChange={e => setSortAlpha(e.target.checked)} /> Sort A→Z</label>
          <label className="flex items-center gap-1.5 text-[11px] text-zinc-500"><input type="checkbox" checked={deduplicate} onChange={e => setDeduplicate(e.target.checked)} /> Deduplicate</label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-400 uppercase">Convert to:</span>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 flex-wrap">
            {(Object.keys(DELIMITER_MAP) as Delimiter[]).map(d => (
              <button key={d} onClick={() => setTargetDelimiter(d)} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${targetDelimiter === d ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500'}`}>
                {DELIMITER_MAP[d].label.replace(' (', '\n(')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {output && (
        <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Output ({items.length} items)</span>
            <button onClick={() => copy(output, 'List')} className="text-[10px] text-indigo-400 hover:underline">Copy All</button>
          </div>
          <textarea value={output} readOnly className="w-full h-[200px] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white outline-none resize-none font-mono" />
        </div>
      )}
    </div>
  );
}
