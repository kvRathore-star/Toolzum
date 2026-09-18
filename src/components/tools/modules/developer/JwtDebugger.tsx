"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function JwtDebugger() {
  const [input, setInput] = useState('');
  const [header, setHeader] = useState('');
  const [payload, setPayload] = useState('');
  const [error, setError] = useState('');

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
      <textarea aria-label="Paste JWT token (header.payload.signature)..." value={input} onChange={e => { setInput(e.target.value); decode(e.target.value); }} placeholder="Paste JWT token (header.payload.signature)..." className="w-full h-[100px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono focus:border-[var(--accent)] transition-colors break-all" />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {header && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Header</h4>
            <div className="relative">
              <textarea aria-label="Header" value={header} readOnly className="w-full h-[200px] bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono" />
              <button onClick={() => { clipboardWrite(header); toast.success('Copied!'); }} className="absolute top-2 right-2 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-subtle)] transition-colors">Copy</button>
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Payload</h4>
            <div className="relative">
              <textarea aria-label="Payload" value={payload} readOnly className="w-full h-[200px] bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono" />
              <button onClick={() => { clipboardWrite(payload); toast.success('Copied!'); }} className="absolute top-2 right-2 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-subtle)] transition-colors">Copy</button>
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
    </div>
  );
}
