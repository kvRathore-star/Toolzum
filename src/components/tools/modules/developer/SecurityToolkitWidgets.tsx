"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { DualPanel } from '../shared/DualPanel';
import { CalcActions } from '../shared/CalcActions';

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
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">OAuth Client Setup</h2>
        <DualPanel
          input={<>
        <div className="flex flex-wrap gap-2">
          {Object.keys(PROVIDERS).map(p => (
            <button key={p} onClick={() => setProvider(p)}
              className={'px-3 py-1 text-xs font-bold rounded-lg transition-all ' + (provider === p ? 'bg-[var(--accent-ink)] text-white shadow-sm' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]')}>{p}</button>
          ))}
        </div>
        <div className="space-y-3">
          <div>
            <label htmlFor="lbl-securitytoolkitwidgets-client-id" className="text-xs text-[var(--text-secondary)] mb-1 block">Client ID</label>
            <input id="lbl-securitytoolkitwidgets-client-id" aria-label="Client ID" type="text" value={clientId} onChange={e => setClientId(e.target.value)} placeholder="your-client-id"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
          <div>
            <label htmlFor="lbl-securitytoolkitwidgets-redirect-uri" className="text-xs text-[var(--text-secondary)] mb-1 block">Redirect URI</label>
            <input id="lbl-securitytoolkitwidgets-redirect-uri" aria-label="Redirect URI" type="text" value={redirectUri} onChange={e => setRedirectUri(e.target.value)} placeholder="https://yourapp.com/callback"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
          <div>
            <label htmlFor="lbl-securitytoolkitwidgets-scope" className="text-xs text-[var(--text-secondary)] mb-1 block">Scope</label>
            <input id="lbl-securitytoolkitwidgets-scope" aria-label="Scope" type="text" value={scope} onChange={e => setScope(e.target.value)} placeholder="openid profile email"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
        </div>
        <button onClick={generateUrl} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Generate Auth URL</button>
          </>}
          output={<>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-3 max-h-32 overflow-y-auto text-emerald-600 dark:text-emerald-400 break-all whitespace-pre-wrap min-h-24">{authUrl || <span className="text-[var(--text-muted)]">Result appears here</span>}</pre>
          </>}
          actions={<CalcActions result={authUrl} downloadData={authUrl} downloadFilename='oauth-url.txt' />}
        />
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
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">PKCE Verifier</h2>
        <DualPanel
          input={<>
        <div className="space-y-3">
          <div>
            <label htmlFor="lbl-securitytoolkitwidgets-code-verifier" className="text-xs text-[var(--text-secondary)] mb-1 block">code_verifier</label>
            <textarea id="lbl-securitytoolkitwidgets-code-verifier" aria-label="code_verifier" rows={2} value={verifier} onChange={e => setVerifier(e.target.value)} placeholder="Paste or generate..."
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label htmlFor="lbl-securitytoolkitwidgets-code-challenge-s256" className="text-xs text-[var(--text-secondary)] mb-1 block">code_challenge (S256)</label>
            <input id="lbl-securitytoolkitwidgets-code-challenge-s256" aria-label="code_challenge (S256)" type="text" value={challenge} onChange={e => setChallenge(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={generate} className="flex-1 bg-[var(--bg-elevated)] hover:bg-[var(--bg-overlay)] text-[var(--text-primary)] font-bold py-2 rounded-lg text-sm">Generate</button>
          <button onClick={verify} className="flex-1 bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Verify Pair</button>
        </div>
          </>}
          output={<>
            <p className="text-sm text-[var(--text-secondary)] min-h-24">{result || <span className="text-[var(--text-muted)]">Result appears here</span>}</p>
          </>}
          actions={<CalcActions result={result} downloadData={result} downloadFilename='pkce-result.txt' />}
        />
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
  const scopes = SCOPE_DB[activeProvider] ?? [];

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

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(SCOPE_DB).map(function(p) {
          return (
            <button key={p} onClick={() => { setActiveProvider(p); setSelectedScopes({}); setOutput(''); }}
              className={'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ' + (activeProvider === p ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]')}>{p}</button>
          );
        })}
        <button onClick={() => { const defaults: Record<string, boolean> = {}; (SCOPE_DB[activeProvider] || []).forEach(function(s) { defaults[s.label] = true; }); setSelectedScopes(defaults); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--accent-ink)] text-white rounded-lg">Select All</button>
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">OAuth Scope Builder — {activeProvider}</h2>

        <DualPanel
          input={<>
        <div className="space-y-1">
          {scopes.map(function(s) {
            return (
              <label key={s.label} className="flex items-start gap-3 text-sm py-2 px-3 rounded-lg hover:bg-[var(--bg-surface)] cursor-pointer">
                <input type="checkbox" checked={!!selectedScopes[s.label]} onChange={() => toggleScope(s.label)} className="mt-1 rounded" />
                <div>
                  <span className="font-mono text-xs text-[var(--accent)]">{s.label}</span>
                  <p className="text-xs text-[var(--text-muted)]">{s.desc}</p>
                </div>
              </label>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button onClick={() => setFormat('space')} className={'flex-1 py-2 rounded-lg text-sm font-bold transition-all ' + (format === 'space' ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-elevated)] hover:bg-[var(--bg-overlay)] text-[var(--text-primary)]')}>Space-separated</button>
          <button onClick={() => setFormat('json')} className={'flex-1 py-2 rounded-lg text-sm font-bold transition-all ' + (format === 'json' ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-elevated)] hover:bg-[var(--bg-overlay)] text-[var(--text-primary)]')}>JSON array</button>
        </div>

        <button onClick={build} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Build Scope String</button>
          </>}
          output={<>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap min-h-24">{output || <span className="text-[var(--text-muted)]">Result appears here</span>}</pre>
          </>}
          actions={<CalcActions result={output} downloadData={output} downloadFilename='oauth-scopes.txt' />}
        />
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

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setState(PRESETS.valid!)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Valid state</button>
        <button onClick={() => setState(PRESETS.invalid!)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Invalid base64</button>
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">OAuth State Validator</h2>
        <DualPanel
          input={<>
        <div>
          <label htmlFor="lbl-securitytoolkitwidgets-state-parameter" className="text-xs text-[var(--text-secondary)] mb-1 block">State parameter</label>
          <input id="lbl-securitytoolkitwidgets-state-parameter" aria-label="State parameter" type="text" value={state} onChange={e => setState(e.target.value)} placeholder="Paste state parameter"
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-mono" />
        </div>
        <button onClick={validate} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Validate State</button>
          </>}
          output={<>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap min-h-24">{output || <span className="text-[var(--text-muted)]">Result appears here</span>}</pre>
          </>}
          actions={<CalcActions result={output} downloadData={output} downloadFilename='oauth-state-validation.txt' />}
        />
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
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">PBKDF2 Hash Generator</h2>
        <DualPanel
          input={<>
        <textarea aria-label="PBKDF2 Hash Generator" rows={3} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={generate} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Generate Hash</button>
          </>}
          output={<>
            <div className="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-3">
              <span className="text-xs font-bold text-[var(--text-secondary)]">Hash Output</span>
              <pre className="text-xs font-mono text-emerald-600 dark:text-emerald-400 break-all mt-1">{output || <span className="text-[var(--text-muted)]">Result appears here</span>}</pre>
            </div>
          </>}
          actions={<CalcActions result={output} downloadData={output} downloadFilename='pbkdf2-hash.txt' />}
        />
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
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Cookie Parser &amp; Analyzer</h2>
        <DualPanel
          input={<>
        <textarea aria-label="Cookie Parser &amp; Analyzer" rows={3} value={input} onChange={e => setInput(e.target.value)} placeholder="Set-Cookie header value..."
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <div className="flex gap-2">
          <button onClick={() => { setMode('parse'); parse(); }}
            className={'flex-1 py-2 rounded-lg text-sm font-bold transition-all ' + (mode === 'parse' ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-elevated)] hover:bg-[var(--bg-overlay)] text-[var(--text-primary)]')}>Parse Cookie</button>
          <button onClick={() => { setMode('analyze'); analyze(); }}
            className={'flex-1 py-2 rounded-lg text-sm font-bold transition-all ' + (mode === 'analyze' ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-elevated)] hover:bg-[var(--bg-overlay)] text-[var(--text-primary)]')}>Analyze Security</button>
        </div>
          </>}
          output={<>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap min-h-24">{result || <span className="text-[var(--text-muted)]">Result appears here</span>}</pre>
          </>}
          actions={<CalcActions result={result} downloadData={result} downloadFilename='cookie-result.txt' />}
        />
      </div>
    </div>
  );
}
