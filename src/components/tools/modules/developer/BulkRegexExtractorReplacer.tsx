"use client";
import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';

export default function BulkRegexExtractorReplacer() {
  return (
    <BulkToolShell
      toolSlug="bulk-regex-extractor-replacer"
      title="Bulk Regex Extractor & Replacer"
      description="Extract or replace text patterns across multiple files using regular expressions."
      accept=".txt,.csv,.md,.json,.html,.xml,.log,.js,.ts,.css"
      processFile={async (file, config) => {
        const cfg = config as Record<string, string>;
        const pattern = cfg.pattern;
        const replacement = cfg.replacement || '';
        const mode = cfg.mode || 'extract';
        if (!pattern) throw new Error('Regex pattern is required');
        const regex = new RegExp(pattern, cfg.flags || 'g');
        const text = await file.text();
        let output: string;
        if (mode === 'extract') {
          const matches = [...text.matchAll(regex)].map(m => m[0]);
          output = matches.join('\n');
        } else {
          output = text.replace(regex, replacement);
        }
        return { name: file.name.replace(/\.[^.]+$/, mode === 'extract' ? '-extracted.txt' : '-replaced.txt'), blob: new Blob([output], { type: 'text/plain' }) };
      }}
      configFields={
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Mode</label>
            <select name="mode" defaultValue="extract" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
              <option value="extract">Extract Matches</option>
              <option value="replace">Replace Matches</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Regex Pattern</label>
            <input name="pattern" type="text" placeholder="e.g., \d{10}" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm font-mono text-[var(--text-primary)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Replacement (replace mode only)</label>
            <input name="replacement" type="text" placeholder="$1" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm font-mono text-[var(--text-primary)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Flags</label>
            <input name="flags" type="text" defaultValue="g" placeholder="g, i, gi" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm font-mono text-[var(--text-primary)]" />
          </div>
        </div>
      }
      defaultConfig={{ mode: 'extract', pattern: '', replacement: '', flags: 'g' }}
    />
  );
}
