"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Input, parseCSV } from './_shared';

export default function FormatValidator() {
  const [input, setInput] = useState('name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com');
  const [issues, setIssues] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const csvPresets = [
    { label: 'Clean', v: 'name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com,Editor' },
    { label: 'Bad Cols', v: 'name,email,role\nJohn,john@example.com,Admin\nJane,jane@test.com' },
    { label: 'Empty', v: 'name,email\nJohn,\n,test@test.com' },
  ];
  const handle = (i?: string) => {
    const inp = i !== undefined ? i : input;
    if (i !== undefined) setInput(inp);
    const p = parseCSV(inp);
    if (!p.headers.length) { toast.error('Enter valid CSV'); return; }
    const iss: string[] = [];
    const colCount = p.headers.length;
    p.rows.forEach((r, rowIdx) => {
      if (r.length !== colCount) iss.push(`Row ${rowIdx + 2}: ${r.length} cols (expected ${colCount})`);
      r.forEach((c, colIdx) => { if (!c.trim()) iss.push(`Row ${rowIdx + 2}, Col "${p.headers[colIdx]}": empty cell`); });
    });
    setIssues(iss);
    setIsValid(iss.length === 0);
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {csvPresets.map(p => <button key={p.label} onClick={() => handle(p.v)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Format Validator</h2>
      <Input label="CSV Input" rows={4} value={input} onChange={v => { setInput(v); setIssues([]); setIsValid(null); }} placeholder="CSV input..." />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-medium transition-colors">Validate</button>
      {isValid !== null && (
        <div className="mt-4 space-y-2">
          {isValid ? (
            <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl border-l-4 border-green-400 text-sm font-medium">✓ Valid CSV — all rows well-formed</div>
          ) : (
            <>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl border-l-4 border-red-400 text-sm font-medium">✗ Found {issues.length} issue(s)</div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-yellow-400 space-y-1">
                {issues.map((iss, i) => <div key={i} className="text-xs text-red-600 dark:text-red-400">⚠ {iss}</div>)}
              </div>
            </>
          )}
        </div>
      )}
    
      </div>
    </>
  );
}

