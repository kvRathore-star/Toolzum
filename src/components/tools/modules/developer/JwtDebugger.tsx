"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function JwtDebugger() {
  const [tab, setTab] = useState<'decode' | 'encode'>('decode');
  const [input, setInput] = useState('');
  const [header, setHeader] = useState('');
  const [payload, setPayload] = useState('');
  const [error, setError] = useState('');

  // Encode / sign state
  const [encHeader, setEncHeader] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
  const [encPayload, setEncPayload] = useState('{\n  "sub": "1234567890",\n  "name": "Jane Doe",\n  "iat": 1789840000\n}');
  const [encSecret, setEncSecret] = useState('');
  const [encAlg, setEncAlg] = useState<'HS256' | 'HS384' | 'HS512'>('HS256');
  const [encToken, setEncToken] = useState('');
  const [encError, setEncError] = useState('');
  const [signing, setSigning] = useState(false);

  const b64urlEncode = (bytes: Uint8Array): string => {
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const signJwt = async () => {
    setEncError('');
    let h: unknown;
    let p: unknown;
    try { h = JSON.parse(encHeader); } catch { setEncError('Header is not valid JSON'); return; }
    try { p = JSON.parse(encPayload); } catch { setEncError('Payload is not valid JSON'); return; }
    if (typeof h !== 'object' || h === null || typeof p !== 'object' || p === null) {
      setEncError('Header and payload must be JSON objects');
      return;
    }
    if (!encSecret) { setEncError('Enter a secret to sign with'); return; }
    setSigning(true);
    try {
      const headerObj = { ...(h as Record<string, unknown>), alg: encAlg };
      const hB = b64urlEncode(new TextEncoder().encode(JSON.stringify(headerObj)));
      const pB = b64urlEncode(new TextEncoder().encode(JSON.stringify(p)));
      const data = new TextEncoder().encode(`${hB}.${pB}`);
      const hashName = encAlg === 'HS384' ? 'SHA-384' : encAlg === 'HS512' ? 'SHA-512' : 'SHA-256';
      const key = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(encSecret),
        { name: 'HMAC', hash: hashName }, false, ['sign'],
      );
      const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, data));
      setEncToken(`${hB}.${pB}.${b64urlEncode(sig)}`);
      toast.success('Token signed!');
    } catch {
      setEncError('Signing failed');
    } finally {
      setSigning(false);
    }
  };

  // JWTs are base64url-encoded (- and _ instead of + and /). The old code
  // fed parts straight to atob(), which throws on real issuer tokens.
  const b64urlToJson = (part: string): unknown => {
    let b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    if (pad === 1) throw new Error('bad length');
    if (pad > 0) b64 += '='.repeat(4 - pad);
    return JSON.parse(atob(b64));
  };

  const decode = (token: string) => {
    setError('');
    if (!token.trim()) { setHeader(''); setPayload(''); return; }
    const parts = token.trim().split('.');
    if (parts.length !== 3) { setError('Invalid JWT — expected 3 parts (header.payload.signature)'); setHeader(''); setPayload(''); return; }
    try {
      const h = b64urlToJson(parts[0] ?? "");
      const p = b64urlToJson(parts[1] ?? "");
      setHeader(JSON.stringify(h, null, 2));
      setPayload(JSON.stringify(p, null, 2));
    } catch { setError('Invalid Base64URL encoding in JWT parts'); setHeader(''); setPayload(''); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex gap-2" role="tablist" aria-label="JWT mode">
        {([
          { key: 'decode' as const, label: 'Decode / Verify' },
          { key: 'encode' as const, label: 'Encode / Sign' },
        ]).map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all border ${
              tab === t.key
                ? 'bg-[var(--accent-ink)] text-white border-transparent'
                : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'decode' && (
      <>
      <textarea aria-label="Paste JWT token (header.payload.signature)..." value={input} onChange={e => { setInput(e.target.value); decode(e.target.value); }} placeholder="Paste JWT token (header.payload.signature)..." className="w-full h-[100px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono focus:border-[var(--accent)] transition-colors break-all" />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {header && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Header</h4>
            <div className="relative">
              <textarea aria-label="Header" value={header} readOnly className="w-full h-[200px] bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono" />
              <button onClick={() => { clipboardWrite(header).then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="absolute top-2 right-2 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-subtle)] transition-colors">Copy</button>
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Payload</h4>
            <div className="relative">
              <textarea aria-label="Payload" value={payload} readOnly className="w-full h-[200px] bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono" />
              <button onClick={() => { clipboardWrite(payload).then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="absolute top-2 right-2 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-subtle)] transition-colors">Copy</button>
            </div>
          </div>
        </div>
      )}
      {payload && (
        <div className="bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Token Info</h4>
          {(() => {
            try {
              const p = JSON.parse(payload);
              const claims: { label: string; value: string; color?: string }[] = [];
              if (p.iss) claims.push({ label: 'Issuer (iss)', value: p.iss });
              if (p.sub) claims.push({ label: 'Subject (sub)', value: p.sub });
              if (p.aud) claims.push({ label: 'Audience (aud)', value: Array.isArray(p.aud) ? p.aud.join(', ') : p.aud });
              if (p.exp) {
                const expDate = new Date(p.exp * 1000);
                const expired = Date.now() > p.exp * 1000;
                claims.push({ label: 'Expiration (exp)', value: expDate.toLocaleString(), color: expired ? 'text-red-500' : 'text-emerald-500' });
              }
              if (p.iat) claims.push({ label: 'Issued At (iat)', value: new Date(p.iat * 1000).toLocaleString() });
              if (p.nbf) claims.push({ label: 'Not Before (nbf)', value: new Date(p.nbf * 1000).toLocaleString() });
              if (p.jti) claims.push({ label: 'JWT ID (jti)', value: p.jti });
              return claims.map((c, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="w-[160px] font-medium text-[var(--text-secondary)] shrink-0">{c.label}</span>
                  <span className={`font-mono break-all ${c.color || 'text-[var(--text-primary)]'}`}>{c.value}</span>
                </div>
              ));
            } catch { return null; }
          })()}
        </div>
      )}
      </>)}

      {tab === 'encode' && (
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Algorithm</label>
          <select aria-label="Signing algorithm"
            value={encAlg}
            onChange={(e) => setEncAlg(e.target.value as 'HS256' | 'HS384' | 'HS512')}
            className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          >
            <option value="HS256">HS256</option>
            <option value="HS384">HS384</option>
            <option value="HS512">HS512</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Header (JSON)</h4>
            <textarea aria-label="Header JSON" value={encHeader} onChange={(e) => setEncHeader(e.target.value)} spellCheck={false} className="w-full h-[160px] bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Payload (JSON)</h4>
            <textarea aria-label="Payload JSON" value={encPayload} onChange={(e) => setEncPayload(e.target.value)} spellCheck={false} className="w-full h-[160px] bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono" />
          </div>
        </div>
        <div>
          <label htmlFor="jwt-sign-secret" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Secret</label>
          <input id="jwt-sign-secret"
            type="password"
            autoComplete="off"
            value={encSecret}
            onChange={(e) => setEncSecret(e.target.value)}
            placeholder="your-256-bit-secret"
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          />
        </div>
        <button onClick={signJwt} disabled={signing} className="w-full px-4 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.99]">
          {signing ? 'Signing…' : 'Sign Token'}
        </button>
        {encError && <p className="text-sm text-red-500">{encError}</p>}
        {encToken && (
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Signed Token</h4>
            <div className="relative">
              <textarea aria-label="Signed token" value={encToken} readOnly className="w-full h-[100px] bg-[var(--bg-overlay)]/50 border border-emerald-500/30 rounded-xl p-3 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono break-all" />
              <button onClick={() => { clipboardWrite(encToken).then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="absolute top-2 right-2 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-subtle)] transition-colors">Copy</button>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
