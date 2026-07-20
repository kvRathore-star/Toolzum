"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export function OauthClientSetup() {
  const [provider, setProvider] = useState('Google');
  const [clientId, setClientId] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [scope, setScope] = useState('openid profile email');
  const [authUrl, setAuthUrl] = useState('');

  const PROVIDERS: Record<string, string> = {
    Google: 'https://accounts.google.com/o/oauth2/v2/auth',
    GitHub: 'https://github.com/login/oauth/authorize',
    Facebook: 'https://www.facebook.com/v18.0/dialog/oauth',
    Microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    LinkedIn: 'https://www.linkedin.com/oauth/v2/authorization',
  };

  const generateUrl = () => {
    if (!clientId) { toast.error('Enter Client ID'); return; }
    const base = PROVIDERS[provider] || PROVIDERS.Google;
    const state = crypto.randomUUID();
    const url = `${base}?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri || 'https://yourapp.com/callback')}&scope=${encodeURIComponent(scope)}&response_type=code&state=${state}`;
    setAuthUrl(url + '\n\nState: ' + state);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">OAuth Client Setup</h2>
        <div className="flex flex-wrap gap-2">
          {Object.keys(PROVIDERS).map(p => (
            <button key={p} onClick={() => setProvider(p)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${provider === p ? 'bg-blue-600 text-white shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>{p}</button>
          ))}
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Client ID</label>
            <input type="text" value={clientId} onChange={e => setClientId(e.target.value)} placeholder="your-client-id"
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Redirect URI</label>
            <input type="text" value={redirectUri} onChange={e => setRedirectUri(e.target.value)} placeholder="https://yourapp.com/callback"
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Scope</label>
            <input type="text" value={scope} onChange={e => setScope(e.target.value)} placeholder="openid profile email"
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
        </div>
        <button onClick={generateUrl} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate Auth URL</button>
        {authUrl && (
          <pre className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 max-h-32 overflow-y-auto text-emerald-600 dark:text-emerald-400 break-all whitespace-pre-wrap">{authUrl}</pre>
        )}
      </div>
    </div>
  );
}

export function PkceVerifier() {
  const [verifier, setVerifier] = useState('');
  const [challenge, setChallenge] = useState('');
  const [result, setResult] = useState('');

  const verify = async () => {
    if (!verifier || !challenge) { toast.error('Paste or generate both values first'); return; }
    try {
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
      const computed = btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const match = computed === challenge;
      setResult(match ? 'PKCE pair verified. The code_verifier correctly derives the code_challenge.' : 'PKCE pair mismatch. The verifier does not match the challenge.');
      toast.success(match ? 'PKCE pair verified' : 'PKCE pair mismatch');
    } catch {
      toast.error('Verification failed - check your inputs');
    }
  };

  const generate = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const v = btoa(String.fromCharCode(...array)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    setVerifier(v);
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(v)).then(hash => {
      setChallenge(btoa(String.fromCharCode(...new Uint8Array(hash))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''));
    });
    toast.success('PKCE pair generated');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">PKCE Verifier</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">code_verifier</label>
            <textarea rows={2} value={verifier} onChange={e => setVerifier(e.target.value)} placeholder="Paste or generate..."
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">code_challenge (S256)</label>
            <input type="text" value={challenge} onChange={e => setChallenge(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={generate} className="flex-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white font-bold py-2 rounded-lg text-sm">Generate</button>
          <button onClick={verify} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Verify Pair</button>
        </div>
        {result && <p className="text-sm text-zinc-600 dark:text-zinc-400">{result}</p>}
      </div>
    </div>
  );
}

export function OAuthScopeBuilder() {
  const [scopes, setScopes] = useState('openid,profile,email,offline_access');
  const [result, setResult] = useState('');

  const build = () => {
    const list = scopes.split(',').map(s => s.trim()).filter(Boolean);
    const str = list.join(' ');
    setResult(
      `Scopes: ${list.length}\nJoined string: ${str}\nURL encoded: ${encodeURIComponent(str)}\n\nBreakdown:\n${list.map(s => `  - ${s}`).join('\n')}`
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">OAuth Scope Builder</h2>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Scopes (comma-separated)</label>
          <input type="text" value={scopes} onChange={e => setScopes(e.target.value)} placeholder="openid,profile,email"
            className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono" />
        </div>
        <button onClick={build} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Build Scope String</button>
        {result && <pre className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{result}</pre>}
      </div>
    </div>
  );
}

export function OAuthStateValidator() {
  const [state, setState] = useState('');
  const [result, setResult] = useState('');

  const validate = () => {
    if (!state) { toast.error('Enter state parameter to verify'); return; }
    const parts = state.split(':');
    const valid = parts.length >= 2 || state.length >= 16;
    const age = parts.length >= 2 ? `${(Date.now() - Number(parts[0])) / 1000}s ago` : 'unknown';
    setResult(valid
      ? `State format valid (length: ${state.length}, age: ${age})\nTip: Always store state in session and compare on callback.`
      : `State too short or malformed (min 16 chars recommended)`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">OAuth State Validator</h2>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">State parameter</label>
          <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="Paste state parameter"
            className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono" />
        </div>
        <button onClick={validate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Validate State</button>
        {result && <pre className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{result}</pre>}
      </div>
    </div>
  );
}

export function Pbkdf2HashGenerator() {
  const [input, setInput] = useState('Hello, World!');
  const [output, setOutput] = useState('');

  const generate = async () => {
    if (!input.trim()) { toast.error('Enter text'); return; }
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(input), { name: 'PBKDF2' }, false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 10000, hash: 'SHA-256' }, key, 256);
    const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
    const saltB64 = btoa(String.fromCharCode(...salt));
    setOutput(`$2a$10$${saltB64}$${hashHex.slice(0, 53)}`);
    toast.success('PBKDF2 hash generated');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">PBKDF2 Hash Generator</h2>
        <textarea rows={3} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={generate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate Hash</button>
        {output && (
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Hash Output</span>
              <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="text-[10px] text-blue-500 hover:underline">Copy</button>
            </div>
            <pre className="text-xs font-mono text-emerald-600 dark:text-emerald-400 break-all">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export function CookieParser() {
  const [input, setInput] = useState('session_id=abc123; Secure; HttpOnly; SameSite=Lax');
  const [result, setResult] = useState('');
  const [mode, setMode] = useState<'parse' | 'analyze'>('parse');

  const parse = () => {
    const pairs = input.split(';').map(s => s.trim());
    const parsed: Record<string, string> = {};
    pairs.forEach(p => {
      const eq = p.indexOf('=');
      if (eq > 0) parsed[p.slice(0, eq).trim()] = p.slice(eq + 1).trim();
      else if (p.toLowerCase() === 'secure') parsed['__Secure'] = 'true';
      else if (p.toLowerCase() === 'httponly') parsed['__HttpOnly'] = 'true';
      else if (p.toLowerCase().startsWith('samesite')) parsed['__SameSite'] = p.split('=')[1]?.trim() || 'true';
    });
    setResult(JSON.stringify(parsed, null, 2));
  };

  const analyze = () => {
    const c = input.toLowerCase();
    const flags: string[] = [];
    if (c.includes('secure')) flags.push('Secure flag set');
    else flags.push('Missing Secure (sent over HTTP)');
    if (c.includes('httponly')) flags.push('HttpOnly flag set');
    else flags.push('Missing HttpOnly (accessible via JS)');
    if (c.includes('samesite')) {
      if (c.includes('samesite=strict')) flags.push('SameSite=Strict');
      else if (c.includes('samesite=lax')) flags.push('SameSite=Lax');
      else if (c.includes('samesite=none')) flags.push('SameSite=None (requires Secure)');
    } else flags.push('Missing SameSite attribute');
    const hasExpires = c.includes('expires=') || c.includes('max-age=');
    flags.push(hasExpires ? 'Has expiry' : 'No expiry (session cookie)');
    setResult(flags.join('\n'));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Cookie Parser &amp; Analyzer</h2>
        <textarea rows={3} value={input} onChange={e => setInput(e.target.value)} placeholder="Set-Cookie header value..."
          className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
        <div className="flex gap-2">
          <button onClick={() => { setMode('parse'); parse(); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'parse' ? 'bg-blue-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'}`}>Parse Cookie</button>
          <button onClick={() => { setMode('analyze'); analyze(); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'analyze' ? 'bg-blue-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'}`}>Analyze Security</button>
        </div>
        {result && <pre className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{result}</pre>}
      </div>
    </div>
  );
}
