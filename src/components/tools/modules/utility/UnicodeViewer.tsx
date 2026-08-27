"use client";

import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

function toUnicode(ch: string): string {
  const code = ch.codePointAt(0)!;
  return `U+${code.toString(16).toUpperCase().padStart(4, '0')}`;
}

function toHtmlEntity(ch: string): string {
  const code = ch.codePointAt(0)!;
  return `&#${code};`;
}

function toPercent(ch: string): string {
  const utf8 = new TextEncoder().encode(ch);
  return Array.from(utf8).map(b => `%${b.toString(16).toUpperCase().padStart(2, '0')}`).join('');
}

export default function UnicodeViewer() {
  const [input, setInput] = useState('');

  const chars = useMemo(() => [...input], [input]);

  const allCodePoints = useMemo(() => chars.map(toUnicode).join(' '), [chars]);
  const allHtmlEntities = useMemo(() => chars.map(toHtmlEntity).join(' '), [chars]);
  const allPercentEncoded = useMemo(() => chars.map(toPercent).join(''), [chars]);

  const charData = useMemo(
    () => chars.map((ch, i) => ({
      id: i,
      char: ch,
      codePoint: toUnicode(ch),
      htmlEntity: toHtmlEntity(ch),
      percent: toPercent(ch),
    })),
    [chars]
  );

  const copy = async (val: string, label: string) => {
    try {
      await clipboardWrite(val);
      toast.success(`${label} copied!`);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type or paste any text here..."
        className="w-full h-[120px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono focus:border-[#7c3aed] transition-colors"
      />

      <div className="grid gap-4">
        {/* Code Points */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Code Points (U+XXXX)</h3>
            <button
              onClick={() => copy(allCodePoints, 'Code points')}
              className="text-[10px] text-[var(--text-muted)] hover:text-[#7c3aed] font-medium px-2 py-0.5 rounded border border-[var(--border-subtle)] transition-colors"
            >
              Copy
            </button>
          </div>
          <p className="text-sm text-[var(--text-primary)] font-mono break-all min-h-[1.25rem]">
            {allCodePoints || <span className="text-[var(--text-muted)]">—</span>}
          </p>
        </div>

        {/* HTML Entities */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">HTML Entities (&#XXXX;)</h3>
            <button
              onClick={() => copy(allHtmlEntities, 'HTML entities')}
              className="text-[10px] text-[var(--text-muted)] hover:text-[#7c3aed] font-medium px-2 py-0.5 rounded border border-[var(--border-subtle)] transition-colors"
            >
              Copy
            </button>
          </div>
          <p className="text-sm text-[var(--text-primary)] font-mono break-all min-h-[1.25rem]">
            {allHtmlEntities || <span className="text-[var(--text-muted)]">—</span>}
          </p>
        </div>

        {/* Percent-encoded */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Percent-encoded (%XX)</h3>
            <button
              onClick={() => copy(allPercentEncoded, 'Percent-encoded')}
              className="text-[10px] text-[var(--text-muted)] hover:text-[#7c3aed] font-medium px-2 py-0.5 rounded border border-[var(--border-subtle)] transition-colors"
            >
              Copy
            </button>
          </div>
          <p className="text-sm text-[var(--text-primary)] font-mono break-all min-h-[1.25rem]">
            {allPercentEncoded || <span className="text-[var(--text-muted)]">—</span>}
          </p>
        </div>
      </div>

      {chars.length > 0 && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-3 overflow-x-auto">
          <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Character Breakdown</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-left">
                <th className="pb-2 pr-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Char</th>
                <th className="pb-2 pr-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Code Point</th>
                <th className="pb-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">HTML Entity</th>
              </tr>
            </thead>
            <tbody>
              {charData.map(({ id, char, codePoint, htmlEntity, percent }) => (
                <tr key={id} className="border-b border-[var(--border-subtle)]/50 last:border-0">
                  <td className="py-2 pr-4 text-[var(--text-primary)] text-lg font-mono">{char}</td>
                  <td className="py-2 pr-4 text-[var(--text-primary)] font-mono text-xs">{codePoint}</td>
                  <td className="py-2 text-[var(--text-primary)] font-mono text-xs">{htmlEntity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
