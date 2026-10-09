"use client";

import React, { useState } from 'react';
import { CalculatorShell } from '../../shared/CalculatorShell';
import { Section, Input } from './_shared';
import { clipboardWrite } from "@/lib/clipboard";
import { toast } from 'react-hot-toast';


export function JwtInspector() {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState<Record<string, any> | null>(null);
  const [payload, setPayload] = useState<Record<string, any> | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const jwtPresets = [
    { label: 'HS256 (expired)', apply: () => setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c') },
    { label: 'RS256 (valid)', apply: () => setToken('eyJhbGciOiJSUzI1NiIsImtpZCI6ImFiYzEyMyJ9.eyJpc3MiOiJ0b29semFtLmNvbSIsInN1YiI6InVzZXIxMjMiLCJhdWQiOlsidG9vbHpsdW0iLCJhcGkiXSwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.dGVzdHNpZw') },
    { label: 'Clear', apply: () => { setToken(''); setHeader(null); setPayload(null); setIssues([]); setIsValid(null); } },
  ];

  const inspect = (t?: string) => {
    const tk = t !== undefined ? t : token;
    if (t !== undefined) setToken(tk);
    try {
      const parts = tk.split('.');
      if (parts.length !== 3) { setHeader(null); setPayload(null); setIssues(['Invalid JWT format — expected 3 parts']); setIsValid(false); return; }
      const h = JSON.parse(atob(parts[0]!.replace(/-/g, '+').replace(/_/g, '/')));
      const p = JSON.parse(atob(parts[1]!.replace(/-/g, '+').replace(/_/g, '/')));
      setHeader(h);
      setPayload(p);
      const now = Math.floor(Date.now() / 1000);
      const iss: string[] = [];
      if (p.exp && p.exp < now) iss.push('⚠ EXPIRED');
      else if (p.exp) iss.push(`✓ Valid until ${new Date(p.exp * 1000).toISOString()}`);
      else iss.push('⚠ No exp claim');
      if (p.iss) iss.push(`✓ Issuer: ${p.iss}`);
      else iss.push('⚠ No iss claim');
      iss.push(`✓ Algorithm: ${h.alg || 'none'}`);
      if (h.typ) iss.push(`✓ Type: ${h.typ}`);
      if (h.kid) iss.push(`✓ Key ID: ${h.kid}`);
      if (p.sub) iss.push(`✓ Subject: ${p.sub}`);
      if (p.aud) iss.push(`✓ Audience: ${Array.isArray(p.aud) ? p.aud.join(', ') : p.aud}`);
      if (p.iat) iss.push(`✓ Issued: ${new Date(p.iat * 1000).toISOString()}`);
      if (p.nbf && p.nbf > now) iss.push('⚠ Not yet valid');
      if (p.jti) iss.push(`✓ JWT ID: ${p.jti}`);
      setIssues(iss);
      setIsValid(true);
    } catch { setHeader(null); setPayload(null); setIssues(['Error: Could not parse token — invalid base64 or JSON']); setIsValid(false); }
  };

  const [copiedH, setCopiedH] = useState(false);
  const [copiedP, setCopiedP] = useState(false);
  const copyH = () => { if (header) { clipboardWrite(JSON.stringify(header, null, 2)).then(ok => { if (ok) { setCopiedH(true); setTimeout(() => setCopiedH(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } }); } };
  const copyP = () => { if (payload) { clipboardWrite(JSON.stringify(payload, null, 2)).then(ok => { if (ok) { setCopiedP(true); setTimeout(() => setCopiedP(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } }); } };

  const resultText = isValid ? `✓ Well-formed JWT (${header?.alg || 'unknown'}, ${payload?.sub ? `sub: ${payload.sub}` : 'no subject'}) — structure only, signature not verified` : (issues[0] || 'Enter JWT to inspect');

  const customResult = isValid !== null ? (
    <div className="space-y-3">
      <div className={`p-4 rounded-xl border-l-4 ${isValid ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-400'}`}>
        <div className="flex items-center gap-2 font-semibold">{isValid ? '✓ Well-formed JWT (signature not verified)' : '✗ Invalid JWT'}</div>
        {issues.length > 0 && (
          <div className="mt-2 space-y-1">
            {issues.map((iss, i) => (
              <div key={i} className={`text-xs px-2 py-1 rounded ${iss.startsWith('✓') ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : iss.startsWith('⚠') ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>{iss}</div>
            ))}
          </div>
        )}
      </div>

      {header && (
        <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-violet-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Header</span>
            <button onClick={copyH} className="px-2 py-0.5 text-xs bg-violet-500 hover:bg-violet-600 text-white rounded transition-colors">{copiedH ? 'Copied!' : 'Copy'}</button>
          </div>
          <pre className="text-xs font-mono text-[var(--text-primary)] bg-[var(--bg-overlay)] p-2 rounded-lg overflow-x-auto">{JSON.stringify(header, null, 2)}</pre>
        </div>
      )}

      {payload && (
        <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-[var(--accent)]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Payload</span>
            <button onClick={copyP} className="px-2 py-0.5 text-xs bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white rounded transition-colors">{copiedP ? 'Copied!' : 'Copy'}</button>
          </div>
          <pre className="text-xs font-mono text-[var(--text-primary)] bg-[var(--bg-overlay)] p-2 rounded-lg overflow-x-auto">{JSON.stringify(payload, null, 2)}</pre>
        </div>
      )}

      {(header || payload) && (
        <div className="flex gap-2">
          <button onClick={copyH} className="px-3 py-1.5 text-xs bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] rounded-lg transition-colors">{copiedH ? 'Copied!' : 'Copy Header'}</button>
          <button onClick={copyP} className="px-3 py-1.5 text-xs bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] rounded-lg transition-colors">{copiedP ? 'Copied!' : 'Copy Payload'}</button>
        </div>
      )}
    </div>
  ) : undefined;

  return (
    <CalculatorShell category="Developer" title="JWT Inspector" result={resultText} customResult={customResult} onCalculate={inspect} presets={jwtPresets} accent="violet" downloadData={header && payload ? JSON.stringify({ header, payload }, null, 2) : ''} downloadFilename="jwt.json">
      <div className="space-y-4">
        <label htmlFor="lbl-authtools-jwt-token" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">JWT Token</label>
        <textarea id="lbl-authtools-jwt-token" aria-label="JWT Token" value={token} onChange={e => { setToken(e.target.value); setHeader(null); setPayload(null); setIssues([]); setIsValid(null); }} rows={3} placeholder="eyJhbGciOiJIUzI1NiIs..."
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-violet-500/50 resize-y" />
      </div>
    </CalculatorShell>
  );
}


export function CsrfTokenGenerator() {
  const [length, setLength] = useState('32');
  const [token, setToken] = useState('');
  const lenPresets = ['16', '32', '64', '128'];
  const gen = (l?: string) => {
    const len = parseInt(l !== undefined ? l : length) || 32;
    if (l !== undefined) setLength(l);
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    setToken(Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (token) { clipboardWrite(token).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } }); } };
  return (
    <Section title="CSRF Token Generator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {lenPresets.map(l => <button key={l} onClick={() => gen(l)} className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${length === l ? 'bg-rose-500 text-white border-rose-500' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-rose-500/20'}`}>{l} bytes</button>)}
      </div>
      <button onClick={() => gen()} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors">Generate Token</button>
      {token && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-rose-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-[var(--text-secondary)] dark:text-[var(--text-muted)]">CSRF Token (hex) — {token.length / 2} bytes</span>
            <button onClick={copy} className="px-2.5 py-1 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <div className="bg-[var(--bg-overlay)] rounded-lg p-3 font-mono text-sm break-all text-[var(--text-primary)]">{token}</div>
        </div>
      )}
    </Section>
  );
}


export function Oauth2Debugger() {
  const [flow, setFlow] = useState('authorization_code');
  const [clientId, setClientId] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [result, setResult] = useState('');
  const flowPresets = [
    { label: 'Auth Code + PKCE', v: 'authorization_code' },
    { label: 'Client Credentials', v: 'client_credentials' },
  ];
  const debug = () => {
    const cid = clientId || 'your-client-id';
    const ru = redirectUri || 'https://example.com/callback';
    const state = Array.from(new Uint8Array(16)).map(b => b.toString(16).padStart(2, '0')).join('');
    const codeVerifier = Array.from(new Uint8Array(32)).map(b => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'[b % 66]).join('');
    if (flow === 'authorization_code') {
      setResult(`OAuth2 Authorization Code Flow + PKCE

├─ Step 1: Authorization Request
│  GET ${ru}?response_type=code
│  &client_id=${cid}
│  &redirect_uri=${encodeURIComponent(ru)}
│  &state=${state}
│  &code_challenge=${codeVerifier}_challenge
│  &code_challenge_method=S256
│
├─ Step 2: Token Exchange (POST /token)
│  grant_type=authorization_code
│  code=AUTH_CODE
│  redirect_uri=${ru}
│  client_id=${cid}
│  code_verifier=${codeVerifier}
│
└─ Step 3: Response
   {
     "access_token": "eyJhbGci...",
     "token_type": "Bearer",
     "expires_in": 3600,
     "refresh_token": "rt_abc123..."
   }`);
    } else {
      setResult(`OAuth2 Client Credentials Flow

├─ Request (POST /token)
│  grant_type=client_credentials
│  client_id=${cid}
│  client_secret=****
│  scope=read write
│
└─ Response
   {
     "access_token": "eyJhbGci...",
     "token_type": "Bearer",
     "expires_in": 3600
   }`);
    }
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (result) { clipboardWrite(result).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } }); } };
  return (
    <Section title="OAuth2 Debugger">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {flowPresets.map(p => <button key={p.label} onClick={() => setFlow(p.v)} className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${flow === p.v ? 'bg-[var(--accent-ink)] text-white border-[var(--accent)]' : 'bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 border-[var(--accent)]/20'}`}>{p.label}</button>)}
      </div>
      <Input label="Client ID" value={clientId} onChange={setClientId} placeholder="your-client-id" />
      <Input label="Redirect URI" value={redirectUri} onChange={setRedirectUri} placeholder="https://example.com/callback" />
      <button onClick={debug} className="px-5 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white rounded-xl text-sm font-medium transition-colors">Debug Flow</button>
      {result && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-[var(--accent)]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-[var(--text-secondary)] dark:text-[var(--text-muted)]">Flow Debug Output</span>
            <button onClick={copy} className="px-2.5 py-1 text-xs bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm font-mono text-[var(--text-primary)] bg-[var(--bg-overlay)] p-3 rounded-lg">{result}</pre>
        </div>
      )}
    </Section>
  );
}


export function SamlDecoder() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState('');
  const [fields, setFields] = useState<{ issuer: string; destination: string; status: string; type: string; hasSaml: boolean } | null>(null);
  const decode = () => {
    try {
      const text = (input || '').replace(/\s/g, '');
      let xml = '';
      try { xml = atob(text); } catch { xml = text; }
      setDecoded(xml);
      setFields({
        issuer: xml.match(/Issuer[^>]*>([^<]+)/)?.[1] || 'Not found',
        destination: xml.match(/Destination="([^"]+)"/)?.[1] || 'Not found',
        status: xml.match(/StatusCode[^>]*Value="([^"]+)"/)?.[1] || 'Not found',
        type: xml.includes('Response') ? 'Response' : 'Request',
        hasSaml: xml.toLowerCase().includes('saml'),
      });
    } catch { setDecoded(''); setFields(null); }
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (decoded) { clipboardWrite(decoded).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } }); } };
  return (
    <Section title="SAML Decoder">
      <Input label="Base64 SAML Request/Response" rows={4} value={input} onChange={v => { setInput(v); setDecoded(''); setFields(null); }} placeholder="Paste base64 SAML data..." />
      <button onClick={decode} className="px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-medium transition-colors">Decode</button>
      {fields && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-violet-400">
              <span className="text-xs text-[var(--text-muted)]">Type</span>
              <p className="font-mono text-sm text-[var(--text-primary)]">{fields.type}</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-violet-400">
              <span className="text-xs text-[var(--text-muted)]">SAML Namespace</span>
              <p className={`font-mono text-sm ${fields.hasSaml ? 'text-green-600' : 'text-red-600'}`}>{fields.hasSaml ? '✓ Detected' : '✗ Not found'}</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-[var(--accent)]">
              <span className="text-xs text-[var(--text-muted)]">Issuer</span>
              <p className="font-mono text-sm text-[var(--text-primary)] truncate">{fields.issuer}</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-[var(--accent)]">
              <span className="text-xs text-[var(--text-muted)]">Destination</span>
              <p className="font-mono text-sm text-[var(--text-primary)] truncate">{fields.destination}</p>
            </div>
          </div>
          <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-amber-400">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-[var(--text-muted)]">Status</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${fields.status === 'urn:oasis:names:tc:SAML:2.0:status:Success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700'}`}>{fields.status}</span>
          </div>
          <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-violet-400">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-[var(--text-muted)]">Decoded XML</span>
              <button onClick={copy} className="px-2 py-0.5 text-xs bg-violet-500 hover:bg-violet-600 text-white rounded transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
            </div>
            <pre className="text-xs font-mono text-[var(--text-primary)] bg-[var(--bg-overlay)] p-2 rounded-lg overflow-x-auto max-h-48">{decoded.substring(0, 3000)}</pre>
          </div>
        </div>
      )}
    </Section>
  );
}

