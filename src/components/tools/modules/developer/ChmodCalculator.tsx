"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

function toNumericPerm(s: string): string {
  const parts = s.split(',').map(p => p.trim());
  let num = 0;
  const categories = ['u', 'g', 'o'];
  for (let ci = 0; ci < 3; ci++) {
    const part = parts.find(p => p.startsWith(categories[ci]!)) || '';
    const perm = part.split('=')[1] || '';
    let val = 0;
    if (perm.includes('r')) val += 4;
    if (perm.includes('w')) val += 2;
    if (perm.includes('x')) val += 1;
    num = num * 10 + val;
  }
  return String(num);
}

function toSymbolicPerm(n: string): string {
  const nums = n.split('').map(Number);
  if (nums.length !== 3) return '';
  const perm = (v: number): string => {
    let s = '';
    if (v & 4) s += 'r'; else s += '-';
    if (v & 2) s += 'w'; else s += '-';
    if (v & 1) s += 'x'; else s += '-';
    return s;
  };
  return `u=${perm(nums[0]!)},g=${perm(nums[1]!)},o=${perm(nums[2]!)}`;
}

export default function ChmodCalculator() {
  const [input, setInput] = useState('755');
  const [symbolic, setSymbolic] = useState('u=rwx,g=rx,o=rx');
  const [numeric, setNumeric] = useState('755');

  const handleInput = useCallback((val: string) => {
    setInput(val);
    if (/^[0-7]{3}$/.test(val)) {
      setNumeric(val);
      setSymbolic(toSymbolicPerm(val));
    } else if (val.includes('=')) {
      const n = toNumericPerm(val);
      if (n.length === 3) {
        setNumeric(n);
        setSymbolic(toSymbolicPerm(n));
      }
    }
  }, []);

  const copy = (txt: string, label: string) => { clipboardWrite(txt); toast.success(`${label} copied!`); };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex gap-2 flex-wrap">
        {['644', '755', '777', '600', '700', '444', '400', '000'].map(p => (
          <button key={p} onClick={() => handleInput(p)} className="text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] px-3 py-1.5 rounded-lg hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-colors font-mono cursor-pointer">{p}</button>
        ))}
      </div>
      <input value={input} onChange={e => handleInput(e.target.value)} placeholder="e.g. 755 or u=rwx,g=rx,o=rx" aria-label="File permissions" className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 font-mono" />
      {/^[0-7]{3}$/.test(numeric) && (
        <div className="space-y-4">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Owner', val: parseInt(numeric[0]!) },
                { label: 'Group', val: parseInt(numeric[1]!) },
                { label: 'Others', val: parseInt(numeric[2]!) },
              ].map(({ label, val }) => (
                <div key={label} className="text-center">
                  <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">{label}</div>
                  <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">{val}</div>
                  <div className="text-sm font-mono text-[var(--text-secondary)]">
                    {val & 4 ? 'r' : '-'}{val & 2 ? 'w' : '-'}{val & 1 ? 'x' : '-'}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-1">
                    {val === 7 ? 'Read, Write, Exec' : val === 6 ? 'Read, Write' : val === 5 ? 'Read, Exec' : val === 4 ? 'Read Only' : val === 3 ? 'Write, Exec' : val === 2 ? 'Write Only' : val === 1 ? 'Execute Only' : 'No Access'}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            <span className="font-semibold">Symbolic:</span> <span className="font-mono text-[var(--text-primary)]">{symbolic}</span>
            <button onClick={() => copy(symbolic, 'Symbolic')} className="ml-2 text-[11px] text-[var(--accent)] hover:underline">Copy</button>
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            <span className="font-semibold">Numeric:</span> <span className="font-mono text-[var(--text-primary)]">{numeric}</span>
            <button onClick={() => copy(numeric, 'Numeric')} className="ml-2 text-[11px] text-[var(--accent)] hover:underline">Copy</button>
          </div>
        </div>
      )}
    </div>
  );
}
