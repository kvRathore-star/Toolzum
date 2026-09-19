"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import type { JsonValue } from '@/lib/json';
import { Input, parseJSON } from './_shared';
import { clipboardWrite } from "@/lib/clipboard";


export default function MergePatchGenerator() {
  const [orig, setOrig] = useState('{"name":"John","age":30,"city":"NYC"}');
  const [modified, setModified] = useState('{"name":"John","age":31,"city":"LA"}');
  const [out, setOut] = useState('');
  const jsonPresets = [
    { label: 'Default', o: '{"name":"John","age":30,"city":"NYC"}', m: '{"name":"John","age":31,"city":"LA"}' },
    { label: 'Add Field', o: '{"name":"John","age":30}', m: '{"name":"John","age":30,"email":"john@test.com"}' },
    { label: 'Remove Field', o: '{"name":"John","age":30,"city":"NYC"}', m: '{"name":"John","age":30}' },
  ];
  const handle = (a?: string, b?: string) => {
    const o = a !== undefined ? a : orig;
    const m = b !== undefined ? b : modified;
    if (a !== undefined) setOrig(o);
    if (b !== undefined) setModified(m);
    const objA = parseJSON(o);
    const objB = parseJSON(m);
    if (!objA || !objB) return;
    const patch: Record<string, JsonValue> = {};
    const recA = objA as Record<string, JsonValue>;
    const recB = objB as Record<string, JsonValue>;
    const allKeys = new Set([...Object.keys(objA), ...Object.keys(objB)]);
    allKeys.forEach(k => {
      if (!(k in recA)) patch[k] = recB[k]!;
      else if (!(k in recB)) patch[k] = null;
      else if (JSON.stringify(recA[k]) !== JSON.stringify(recB[k])) patch[k] = recB[k]!;
    });
    setOut(JSON.stringify(patch, null, 2));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {jsonPresets.map(p => <button key={p.label} onClick={() => handle(p.o, p.m)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.label}</button>)}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Merge Patch Generator</h2>
      <Input label="Original JSON" rows={3} value={orig} onChange={v => { setOrig(v); setOut(''); }} placeholder="Original JSON..." />
      <Input label="Modified JSON" rows={3} value={modified} onChange={v => { setModified(v); setOut(''); }} placeholder="Modified JSON..." />
      <button onClick={() => handle()} className="px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-medium transition-colors">Generate Patch</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-violet-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Merge Patch (RFC 7396)</span>
            <div className="flex gap-2">
                <button onClick={() => { clipboardWrite(out).then(ok => ok && toast.success('Copied!')); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Copy</button>
                <button onClick={() => { const blob = new Blob([out], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='output.json'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Download</button>
              </div>
          </div>
          <pre className="text-xs font-mono text-[var(--text-primary)] bg-[var(--bg-overlay)] p-2 rounded-lg overflow-x-auto max-h-40">{out}</pre>
        </div>
      )}
    
      </div>
    </>
  );
}

