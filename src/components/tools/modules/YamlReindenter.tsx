"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

function formatYaml(input: string): string {
  const lines = input.split('\n');
  const out: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) { out.push(line); continue; }
    const indent = line.search(/\S/);
    const arrMatch = trimmed.match(/^-\s+(.+)$/);
    if (arrMatch) {
      out.push('  '.repeat(indent / 2) + '- ' + arrMatch[1]);
    } else {
      const kvMatch = trimmed.match(/^([a-zA-Z0-9_\-]+):\s*(.*)$/);
      if (kvMatch) {
        const val = kvMatch[2].trim();
        out.push('  '.repeat(indent / 2) + kvMatch[1] + ': ' + val);
      } else {
        out.push('  '.repeat(indent / 2) + trimmed);
      }
    }
  }
  return out.join('\n');
}

export default function YamlReindenter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;
    try { setOutput(formatYaml(input)); } catch { setOutput(''); }
  }, [input]);

  const copy = (txt: string, label: string) => { clipboardWrite(txt); toast.success(`${label} copied!`); };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea value={input} onChange={e => { setInput(e.target.value); setTimeout(() => handleFormat(), 0); }} placeholder="Paste YAML here..." className="w-full h-[400px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono" />
        <div className="relative">
          <textarea value={output} readOnly placeholder="Formatted YAML..." className="w-full h-[400px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono" />
          {output && <button onClick={() => copy(output, 'YAML')} className="absolute top-3 right-3 text-[11px] text-[var(--accent)] hover:underline bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)]">Copy</button>}
        </div>
      </div>
    </div>
  );
}
