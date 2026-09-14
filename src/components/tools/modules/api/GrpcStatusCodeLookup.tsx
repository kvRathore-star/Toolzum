"use client";
import { useState } from 'react';

export default function GrpcStatusCodeLookup() {
  const [code, setCode] = useState('4');
  const [result, setResult] = useState('');
  const codes: Record<string, { name: string; desc: string }> = {
    '0': { name: 'OK', desc: 'The operation completed successfully' },
    '1': { name: 'CANCELLED', desc: 'The operation was cancelled' },
    '2': { name: 'UNKNOWN', desc: 'Unknown error' },
    '3': { name: 'INVALID_ARGUMENT', desc: 'Client specified an invalid argument' },
    '4': { name: 'DEADLINE_EXCEEDED', desc: 'Deadline expired before operation completed' },
    '5': { name: 'NOT_FOUND', desc: 'Some requested entity was not found' },
    '6': { name: 'ALREADY_EXISTS', desc: 'Entity already exists' },
    '7': { name: 'PERMISSION_DENIED', desc: 'Caller does not have permission' },
    '8': { name: 'RESOURCE_EXHAUSTED', desc: 'Resource exhausted (rate limit)' },
    '9': { name: 'FAILED_PRECONDITION', desc: 'System not in required state' },
    '10': { name: 'ABORTED', desc: 'Operation aborted' },
    '11': { name: 'OUT_OF_RANGE', desc: 'Operation was attempted past valid range' },
    '12': { name: 'UNIMPLEMENTED', desc: 'Operation not implemented' },
    '13': { name: 'INTERNAL', desc: 'Internal errors' },
    '14': { name: 'UNAVAILABLE', desc: 'Service is currently unavailable' },
    '15': { name: 'DATA_LOSS', desc: 'Unrecoverable data loss or corruption' },
    '16': { name: 'UNAUTHENTICATED', desc: 'Request not authenticated' },
  };
  const presets = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];
  const info = codes[code] || null;
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">gRPC Status Code Lookup</h2>
        <div className="flex flex-wrap gap-1">
          {presets.map(c => (
            <button key={c} onClick={() => setCode(c)}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${code === c ? 'bg-stone-600 text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-zinc-900'}`}>{c}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label htmlFor="lbl-grpcstatuscodelookup-code" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status code</label>
            <input id="lbl-grpcstatuscodelookup-code" aria-label="Status code" type="number" value={code} onChange={e => setCode(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div className="flex items-end">
            <button onClick={() => setResult(codes[code]?.name || '')} className="w-full bg-stone-600 hover:bg-stone-500 text-white font-bold py-2 rounded-lg text-xs transition-all">Lookup</button>
          </div>
        </div>
        {info && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
            <p className="text-lg font-black text-stone-600 dark:text-stone-300">{info.name}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{info.desc}</p>
          </div>
        )}
      </div>
    </div>
  );
}
