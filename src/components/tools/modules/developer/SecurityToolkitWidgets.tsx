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
    const url = base + '?client_id=' + encodeURIComponent(clientId) + '&redirect_uri=' + encodeURIComponent(redirectUri || 'https://yourapp.com/callback') + '&scope=' + encodeURIComponent(scope) + '&response_type=code&state=' + state;
    setAuthUrl(url + '\n\nState: ' + state);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">OAuth Client Setup</h2>
        <div className="flex flex-wrap gap-2">
          {Object.keys(PROVIDERS).map(p => (
            <button key={p} onClick={() => setProvider(p)}
              className={'px-3 py-1 text-xs font-bold rounded-lg transition-all ' + (provider === p ? 'bg-blue-600 text-white shadow-sm' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)]')}>{p}</button>
          ))}
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">Client ID</label>
            <input type="text" value={clientId} onChange={e => setClientId(e.target.value)} placeholder="your-client-id"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">Redirect URI</label>
            <input type="text" value={redirectUri} onChange={e => setRedirectUri(e.target.value)} placeholder="https://yourapp.com/callback"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">Scope</label>
            <input type="text" value={scope} onChange={e => setScope(e.target.value)} placeholder="openid profile email"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
        </div>
        <button onClick={generateUrl} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate Auth URL</button>
        {authUrl && (
          <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 max-h-32 overflow-y-auto text-emerald-600 dark:text-emerald-400 break-all whitespace-pre-wrap">{authUrl}</pre>
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
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">PKCE Verifier</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">code_verifier</label>
            <textarea rows={2} value={verifier} onChange={e => setVerifier(e.target.value)} placeholder="Paste or generate..."
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">code_challenge (S256)</label>
            <input type="text" value={challenge} onChange={e => setChallenge(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={generate} className="flex-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-[var(--text-primary)] font-bold py-2 rounded-lg text-sm">Generate</button>
          <button onClick={verify} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Verify Pair</button>
        </div>
        {result && <p className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">{result}</p>}
      </div>
    </div>
  );
}

export function OAuthScopeBuilder() {
  const [selectedScopes, setSelectedScopes] = useState<Record<string, boolean>>({
    'openid': true, 'profile': true, 'email': true,
  });
  const [output, setOutput] = useState('');
  const [format, setFormat] = useState<'space' | 'json'>('space');

  const SCOPE_DB: Record<string, { label: string; desc: string }[]> = {
    Google: [
      { label: 'openid', desc: 'OpenID Connect identity' },
      { label: 'profile', desc: 'User profile information' },
      { label: 'email', desc: 'User email address' },
      { label: 'offline_access', desc: 'Refresh token for long-lived access' },
      { label: 'https://www.googleapis.com/auth/drive', desc: 'Full Google Drive access' },
      { label: 'https://www.googleapis.com/auth/calendar', desc: 'Google Calendar access' },
    ],
    GitHub: [
      { label: 'repo', desc: 'Full repository access' },
      { label: 'repo:status', desc: 'Commit status access' },
      { label: 'read:org', desc: 'Read organization membership' },
      { label: 'write:org', desc: 'Manage organization membership' },
      { label: 'admin:repo_hook', desc: 'Manage repository hooks' },
      { label: 'user', desc: 'User profile and email' },
      { label: 'user:email', desc: 'Read user email' },
      { label: 'gist', desc: 'Create and manage gists' },
    ],
    Facebook: [
      { label: 'public_profile', desc: 'Default public profile info' },
      { label: 'email', desc: 'User email address' },
      { label: 'user_friends', desc: 'User friends list' },
      { label: 'user_birthday', desc: 'User birthday' },
      { label: 'user_photos', desc: 'User photos' },
      { label: 'pages_manage_posts', desc: 'Manage page posts' },
    ],
  };

  const [activeProvider, setActiveProvider] = useState('Google');
  const scopes = SCOPE_DB[activeProvider];

  const toggleScope = (label: string) => {
    setSelectedScopes(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const build = () => {
    const active = Object.entries(selectedScopes).filter(function(e) { return e[1]; }).map(function(e) { return e[0]; });
    if (active.length === 0) { toast.error('Select at least one scope'); return; }
    let result = '';
    if (format === 'space') {
      result = 'Space-separated:\n' + active.join(' ') + '\n\nURL-encoded:\n' + encodeURIComponent(active.join(' ')) + '\n\nBreakdown:\n' + active.map(function(s) { return '  - ' + s; }).join('\n');
    } else {
      result = JSON.stringify(active, null, 2);
    }
    setOutput(result);
  };

  const copyOutput = () => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Scopes copied!');
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'oauth-scopes.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(SCOPE_DB).map(function(p) {
          return (
            <button key={p} onClick={() => { setActiveProvider(p); setSelectedScopes({}); setOutput(''); }}
              className={'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ' + (activeProvider === p ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)]')}>{p}</button>
          );
        })}
        <button onClick={() => { const defaults: Record<string, boolean> = {}; (SCOPE_DB[activeProvider] || []).forEach(function(s) { defaults[s.label] = true; }); setSelectedScopes(defaults); }} className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg">Select All</button>
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">OAuth Scope Builder — {activeProvider}</h2>

        <div className="space-y-1">
          {scopes.map(function(s) {
            return (
              <label key={s.label} className="flex items-start gap-3 text-sm py-2 px-3 rounded-lg hover:bg-[var(--bg-surface)] cursor-pointer">
                <input type="checkbox" checked={!!selectedScopes[s.label]} onChange={() => toggleScope(s.label)} className="mt-1 rounded" />
                <div>
                  <span className="font-mono text-xs text-blue-600 dark:text-blue-400">{s.label}</span>
                  <p className="text-xs text-[var(--text-muted)]">{s.desc}</p>
                </div>
              </label>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button onClick={() => setFormat('space')} className={'flex-1 py-2 rounded-lg text-sm font-bold transition-all ' + (format === 'space' ? 'bg-blue-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-[var(--text-primary)]')}>Space-separated</button>
          <button onClick={() => setFormat('json')} className={'flex-1 py-2 rounded-lg text-sm font-bold transition-all ' + (format === 'json' ? 'bg-blue-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-[var(--text-primary)]')}>JSON array</button>
        </div>

        <button onClick={build} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Build Scope String</button>

        {output && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <button onClick={copyOutput} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg hover:text-[var(--text-primary)] transition-colors">Copy</button>
              <button onClick={downloadOutput} className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">Download</button>
            </div>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export function OAuthStateValidator() {
  const [state, setState] = useState('');
  const [output, setOutput] = useState('');

  const PRESETS: Record<string, string> = {
    valid: 'eyJzdGF0dXMiOiJvcmlnaW5hbCIsInRpbWVzdGFtcCI6MTcwMDAwMDAwMCwibm9uY2UiOiJhYmMxMjMifQ==',
    invalid: 'not-a-valid-base64!!!',
  };

  const validate = () => {
    if (!state) { toast.error('Enter state parameter'); return; }

    const results: string[] = [];
    results.push('OAuth State Validation Report');
    results.push('=============================\n');

    // Base64 decode attempt
    results.push('Base64 Decode:');
    try {
      const decoded = atob(state.replace(/-/g, '+').replace(/_/g, '/'));
      results.push('  Decoded: ' + decoded);
      try {
        const json = JSON.parse(decoded);
        results.push('  JSON: ' + JSON.stringify(json, null, 2));
        if (json.timestamp) {
          const age = Math.floor((Date.now() / 1000) - json.timestamp);
          results.push('  Age: ' + age + ' seconds');
          if (age > 3600) results.push('  ⚠ State is older than 1 hour — possible replay attack');
        }
      } catch {
        results.push('  Not valid JSON');
      }
    } catch {
      results.push('  ✗ Invalid base64 encoding');
    }

    results.push('\nSecurity Checks:');
    if (state.length < 16) results.push('  ✗ State too short (' + state.length + ' chars) — min 16 recommended');
    else results.push('  ✓ Adequate length (' + state.length + ' chars)');

    if (!/^[A-Za-z0-9+/=_-]+$/.test(state)) results.push('  ⚠ Contains unexpected characters');
    else results.push('  ✓ Valid character set');

    if (state === state.toLowerCase() && /^[a-f0-9]+$/.test(state)) results.push('  ✓ Appears to be hex-encoded (good for UUIDs)');
    else if (/^[A-Za-z0-9+/=]+$/.test(state)) results.push('  ✓ Appears to be base64-encoded');

    results.push('\nRecommendations:');
    results.push('  1. Always store state in session/cookie before redirect');
    results.push('  2. Validate state matches on callback');
    results.push('  3. Use PKCE (code_verifier + code_challenge) for public clients');
    results.push('  4. State should be at least 16 chars, cryptographically random');
    results.push('  5. Consider using JWT with expiry for stateless validation');

    setOutput(results.join('\n'));
  };

  const copyOutput = () => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Report copied!');
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'oauth-state-validation.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setState(PRESETS.valid)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Valid state</button>
        <button onClick={() => setState(PRESETS.invalid)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Invalid base64</button>
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">OAuth State Validator</h2>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">State parameter</label>
          <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="Paste state parameter"
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-mono" />
        </div>
        <button onClick={validate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Validate State</button>

        {output && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <button onClick={copyOutput} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg hover:text-[var(--text-primary)] transition-colors">Copy</button>
              <button onClick={downloadOutput} className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">Download</button>
            </div>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{output}</pre>
          </div>
        )}
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
    setOutput('$2a$10$' + saltB64 + '$' + hashHex.slice(0, 53));
    toast.success('PBKDF2 hash generated');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">PBKDF2 Hash Generator</h2>
        <textarea rows={3} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={generate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate Hash</button>
        {output && (
          <div className="bg-[var(--bg-surface)] rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-600 dark:text-[var(--text-muted)]">Hash Output</span>
              <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="text-[10px] text-blue-700 dark:text-blue-400 hover:underline">Copy</button>
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
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Cookie Parser &amp; Analyzer</h2>
        <textarea rows={3} value={input} onChange={e => setInput(e.target.value)} placeholder="Set-Cookie header value..."
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <div className="flex gap-2">
          <button onClick={() => { setMode('parse'); parse(); }}
            className={'flex-1 py-2 rounded-lg text-sm font-bold transition-all ' + (mode === 'parse' ? 'bg-blue-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-[var(--text-primary)]')}>Parse Cookie</button>
          <button onClick={() => { setMode('analyze'); analyze(); }}
            className={'flex-1 py-2 rounded-lg text-sm font-bold transition-all ' + (mode === 'analyze' ? 'bg-blue-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-[var(--text-primary)]')}>Analyze Security</button>
        </div>
        {result && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{result}</pre>}
      </div>
    </div>
  );
}
