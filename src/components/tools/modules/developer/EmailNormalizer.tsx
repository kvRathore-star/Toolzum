"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

function normalizeEmail(email: string): string {
  const e = email.trim().toLowerCase();
  const atIdx = e.indexOf('@');
  if (atIdx === -1) return e;
  let local = e.slice(0, atIdx);
  const domain = e.slice(atIdx);
  local = local.split('+')[0];
  if (domain === '@gmail.com' || domain === '@googlemail.com') local = local.replace(/\./g, '');
  return local + domain;
}

export default function EmailNormalizer() {
  const [input, setInput] = useState('');

  const copy = (txt: string, label: string) => { clipboardWrite(txt); toast.success(`${label} copied!`); };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter emails, one per line..." className="w-full h-[200px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono" />
      {input.trim() && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5">
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase mb-3">Normalized ({input.trim().split('\n').filter(Boolean).length} processed)</div>
          <div className="space-y-1">
            {input.trim().split('\n').filter(Boolean).map((e, i) => {
              const norm = normalizeEmail(e);
              return (
                <div key={i} className="grid grid-cols-2 gap-4 text-sm font-mono py-1.5 border-b border-[var(--border-subtle)] last:border-0">
                  <span className="text-[var(--text-secondary)] break-all">{e.trim()}</span>
                  <span className="text-emerald-500 break-all flex items-center gap-2">
                    {norm}
                    <button onClick={() => copy(norm, 'Email')} className="text-[10px] text-[var(--accent)] hover:underline ml-auto">Copy</button>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
