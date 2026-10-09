"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'guerrillamailblock.com', 'sharklasers.com', 'guerrillamail.info',
  'grr.la', 'dispostable.com', '10minutemail.com', 'temp-mail.org',
  'fakeinbox.com', 'maildrop.cc', 'mailnesia.com', 'trashmail.com',
];

function normalizeEmail(email: string): { normalized: string; changes: string[] } {
  const original = email.trim();
  const changes: string[] = [];
  const result = original.toLowerCase();

  if (result !== original.toLowerCase()) {
    changes.push('Lowercased');
  }
  if (original !== original.toLowerCase()) {
    changes.push('Lowercased');
  }

  const atIdx = result.indexOf('@');
  if (atIdx === -1) return { normalized: result, changes };

  let local = result.slice(0, atIdx);
  const domain = result.slice(atIdx);

  // Gmail dot removal
  if (domain === '@gmail.com' || domain === '@googlemail.com') {
    const withoutDots = local.replace(/\./g, '');
    if (withoutDots !== local) {
      changes.push('Removed dots (Gmail)');
      local = withoutDots;
    }
  }

  // + alias handling
  const plusIdx = local.indexOf('+');
  if (plusIdx > 0) {
    local = local.slice(0, plusIdx);
    changes.push('Removed +alias');
  }

  // Googlemail → gmail
  let finalDomain = domain;
  if (domain === '@googlemail.com') {
    finalDomain = '@gmail.com';
    changes.push('googlemail → gmail');
  }

  return { normalized: local + finalDomain, changes };
}

function validateEmail(email: string): { valid: boolean; reason: string } {
  const trimmed = email.trim();
  if (!trimmed) return { valid: false, reason: 'Empty' };
  const parts = trimmed.split('@');
  if (parts.length !== 2) return { valid: false, reason: 'No @ symbol' };
  const [local, domain] = parts;
  if (!local) return { valid: false, reason: 'Empty local part' };
  if (!domain || !domain.includes('.')) return { valid: false, reason: 'Invalid domain' };
  if (local.length > 64) return { valid: false, reason: 'Local part too long (max 64)' };
  if (domain.length > 253) return { valid: false, reason: 'Domain too long (max 253)' };
  if (/^[.\-_]/.test(local) || /[.\-_]$/.test(local)) return { valid: false, reason: 'Local part starts/ends with special char' };
  if (/\.{2,}/.test(local)) return { valid: false, reason: 'Consecutive dots in local part' };
  return { valid: true, reason: 'Valid format' };
}

function isDisposable(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.includes(domain ?? "");
}

export default function EmailNormalizer() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [results, setResults] = useState<{ original: string; normalized: string; valid: boolean; disposable: boolean; changes: string[] }[]>([]);

  const PRESETS: Record<string, string> = {
    gmail: 'John.Doe@gmail.com\nj.o.h.n.d.o.e@gmail.com\njohn.doe+newsletter@gmail.com\njohndoe@googlemail.com',
    yahoo: 'TestUser@yahoo.com\nmyemail+test@yahoo.com\nOldAddress@hotmail.com',
    corporate: 'admin@company.co.uk\ninfo@example.org\nsupport@internal.dev\nsales@startup.io',
  };

  const normalizeAll = () => {
    const emails = input.split('\n').filter(e => e.trim());
    const res = emails.map(email => {
      const { normalized, changes } = normalizeEmail(email);
      const { valid } = validateEmail(email);
      const disposable = isDisposable(email);
      return { original: email.trim(), normalized, valid, disposable, changes };
    });
    setResults(res);

    let report = 'Email Normalization Report\n';
    report += '========================\n\n';
    report += 'Processed: ' + res.length + ' email(s)\n';
    report += 'Valid: ' + res.filter(r => r.valid).length + '\n';
    report += 'Disposable: ' + res.filter(r => r.disposable).length + '\n\n';

    res.forEach((r, i) => {
      report += (i + 1) + '. ' + r.original + '\n';
      report += '   → ' + r.normalized + '\n';
      report += '   Valid: ' + (r.valid ? '✓' : '✗') + '  Disposable: ' + (r.disposable ? 'Yes' : 'No') + '\n';
      if (r.changes.length) report += '   Changes: ' + r.changes.join(', ') + '\n';
      report += '\n';
    });

    setOutput(report);
  };

  const copyOutput = () => {
    if (!output) return;
    clipboardWrite(output).then(ok => { if (ok) toast.success('Report copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); });
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-normalization.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  const copyAllNormalized = () => {
    if (results.length === 0) return;
    const all = results.map(r => r.normalized).join('\n');
    clipboardWrite(all).then(ok => { if (ok) toast.success('All normalized emails copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setInput(PRESETS.gmail!)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Gmail with dots</button>
        <button onClick={() => setInput(PRESETS.yahoo!)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Yahoo</button>
        <button onClick={() => setInput(PRESETS.corporate!)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Corporate</button>
      </div>

      <div className="">
        <label htmlFor="lbl-emailnormalizer-email-input-one-per-line" className="text-[11px] font-bold text-[var(--text-muted)] uppercase mb-2 block">Email Input (one per line)</label>
        <textarea id="lbl-emailnormalizer-email-input-one-per-line" aria-label="Email Input (one per line)" value={input} onChange={e => setInput(e.target.value)} placeholder="Enter emails, one per line..."
          className="w-full h-[200px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono" />
        <button onClick={normalizeAll} className="w-full mt-3 px-5 py-3 bg-gradient-to-r from-[var(--accent-ink)] to-[var(--accent-ink)] hover:from-[var(--accent-ink)] hover:to-[var(--accent-ink)] text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">
          Normalize & Validate
        </button>
      </div>

      {results.length > 0 && (
        <div className="">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Results ({results.length} processed)</span>
            <div className="flex gap-2">
              <button onClick={copyAllNormalized} className="text-[10px] text-[var(--accent)] hover:underline font-medium">Copy All Normalized</button>
              <button onClick={copyOutput} className="text-[10px] text-[var(--accent)] hover:underline font-medium">Copy Report</button>
              <button onClick={downloadOutput} className="text-[10px] text-[var(--accent)] hover:underline font-medium">Download</button>
            </div>
          </div>
          <div className="space-y-1">
            {results.map((r, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 text-sm font-mono py-2 border-b border-[var(--border-subtle)] last:border-0 items-center">
                <div className="col-span-4">
                  <span className="text-[var(--text-secondary)] break-all text-xs">{r.original}</span>
                </div>
                <div className="col-span-1 text-center">
                  <span className="text-[var(--text-muted)]">→</span>
                </div>
                <div className="col-span-4">
                  <span className={'break-all text-xs ' + (r.normalized !== r.original ? 'text-emerald-500 font-bold' : 'text-[var(--text-primary)]')}>{r.normalized}</span>
                </div>
                <div className="col-span-3 flex gap-1 justify-end">
                  {!r.valid && <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Invalid</span>}
                  {r.disposable && <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">Disposable</span>}
                  {r.changes.length > 0 && <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-[var(--accent)]/10 text-[var(--accent)] dark:bg-[var(--accent)]/10 dark:text-[var(--accent)]">Changed</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {output && (
        <div className="">
          <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-64 overflow-y-auto">{output}</pre>
        </div>
      )}
    </div>
  );
}
