"use client";
import { useState } from 'react';

export default function WebhookSignatureVerifier() {
  const [payload, setPayload] = useState('{"event":"user.created","data":{"id":1}}');
  const [secret, setSecret] = useState('whsec_test_secret_key');
  const [signature, setSignature] = useState('');
  const [result, setResult] = useState<{ expected: string; match: boolean | null }>({ expected: '', match: null });
  const calc = async () => {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const msgData = encoder.encode(payload);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, msgData);
    const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
    const expectedSig = 'sha256=' + hex;
    setResult({ expected: expectedSig, match: signature ? signature === expectedSig : null });
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Webhook Signature Verifier</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Payload</label>
          <textarea value={payload} onChange={e => setPayload(e.target.value)} rows={2} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Signing Secret</label>
            <input type="text" value={secret} onChange={e => setSecret(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Signature</label>
            <input type="text" value={signature} onChange={e => setSignature(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Verify</button>
        {result.expected && (
          <div className="space-y-2">
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Expected Signature</p>
              <p className="text-xs font-mono break-all">{result.expected}</p>
            </div>
            {result.match !== null && (
              <div className={`p-3 rounded-xl text-sm font-bold ${result.match ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                {result.match ? '✓ Signature matches!' : '✗ Signature does not match'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
