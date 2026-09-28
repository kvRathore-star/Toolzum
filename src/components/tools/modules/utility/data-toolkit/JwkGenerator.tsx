"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";


export default function JwkGenerator() {
  const [bits, setBits] = useState('256');
  const [out, setOut] = useState('');
  const bitPresets = ['128', '256'];
  const handle = (b?: string) => {
    const bs = b !== undefined ? b : bits;
    if (b !== undefined) setBits(bs);
    const keyBytes = parseInt(bs, 10) / 8;
    const randBytes = Array.from({ length: keyBytes }, () => Math.floor(Math.random() * 256));
    const b64url = btoa(String.fromCharCode(...randBytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const jwk = {
      kty: 'oct',
      k: b64url,
      alg: parseInt(bs, 10) >= 256 ? 'A256GCM' : 'A128GCM',
      use: 'enc',
      kid: crypto.randomUUID().slice(0, 8),
    };
    setOut(JSON.stringify(jwk, null, 2));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {bitPresets.map(b => <button key={b} onClick={() => handle(b)} className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${bits === b ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/20'}`}>{b} bits</button>)}
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">JWK Generator</h2>
      <button onClick={() => handle()} className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-medium transition-colors">Generate JWK</button>
      {out && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-yellow-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Symmetric JWK ({bits}-bit)</span>
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

