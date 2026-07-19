"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Shield, Key, Lock, Scan, ExternalLink } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'jwt' | 'oauth' | 'crypto' | 'ssl';

export default function SecurityToolkit() {
  const [tab, setTab] = useState<Tab>('jwt');
  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${tab === v ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        <TabBtn v="jwt" label="JWT Tools" icon={Shield} />
        <TabBtn v="oauth" label="OAuth Tools" icon={Key} />
        <TabBtn v="crypto" label="Crypto Tools" icon={Lock} />
        <TabBtn v="ssl" label="SSL &amp; SAML" icon={Scan} />
      </div>
      {tab === 'jwt' && <JwtTools />}
      {tab === 'oauth' && <OauthTools />}
      {tab === 'crypto' && <CryptoTools />}
      {tab === 'ssl' && <SslTools />}
    </div>
  );
}

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
    <h5 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{title}</h5>
    {children}
  </div>
);

const CalcBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={onClick} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all active:scale-[0.98]">{label}</button>
);

const LinkCard = ({ title, slug, desc }: { title: string; slug: string; desc: string }) => (
  <Link href={`/developer/${slug}`} className="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
    <div className="flex items-center gap-1">
      <h5 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline">{title}</h5>
      <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
    </div>
    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
  </Link>
);

const Inp = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div className="flex items-center gap-1.5">
    <label className="text-[10px] text-zinc-500 shrink-0">{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
  </div>
);

function JwtTools() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <LinkCard title="JWT Debugger" slug="jwt-debugger" desc="Decode, inspect, and debug JWT tokens. View header, payload, signature, and expiration details." />
      <LinkCard title="JWT Inspector" slug="jwt-inspector" desc="Advanced JWT analysis with signature verification, claim validation, and security issue detection." />
    </div>
  );
}

function OauthTools() {
  const [provider, setProvider] = useState('Google');
  const [clientId, setClientId] = useState('your-client-id');
  const [redirectUri, setRedirectUri] = useState('https://yourapp.com/callback');
  const [scope, setScope] = useState('openid profile email');
  const [authUrl, setAuthUrl] = useState('');
  const [pkceVerifier, setPkceVerifier] = useState('');
  const [pkceChallenge, setPkceChallenge] = useState('');
  const [stateIn, setStateIn] = useState('');
  const [stateVerifyOut, setStateVerifyOut] = useState('');
  const [scopeIn, setScopeIn] = useState('openid,profile,email,offline_access');
  const [scopeOut, setScopeOut] = useState('');

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

  const pkceVerify = async () => {
    if (!pkceVerifier || !pkceChallenge) { toast.error('Paste or generate both values first'); return; }
    try {
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pkceVerifier));
      const computed = btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      const match = computed === pkceChallenge;
      toast.success(match ? 'PKCE pair verified ✓' : 'PKCE pair mismatch ✗');
    } catch {
      toast.error('Verification failed — check your inputs');
    }
  };

  const stateValidate = () => {
    if (!stateIn) { toast.error('Enter state parameter to verify'); return; }
    const parts = stateIn.split(':');
    const valid = parts.length >= 2 || stateIn.length >= 16;
    const age = parts.length >= 2 ? `${(Date.now() - Number(parts[0])) / 1000}s ago` : 'unknown';
    setStateVerifyOut(valid
      ? `✓ State format valid (length: ${stateIn.length}, age: ${age})\nTip: Always store state in session and compare on callback.`
      : `✗ State too short or malformed (min 16 chars recommended)`);
  };

  const scopeBuild = () => {
    const scopes = scopeIn.split(',').map(s => s.trim()).filter(Boolean);
    const str = scopes.join(' ');
    const lines = [`Scopes: ${scopes.length}`, `Joined string: ${str}`, `URL encoded: ${encodeURIComponent(str)}`, '', 'Breakdown:'];
    scopes.forEach(s => lines.push(`  • ${s}`));
    setScopeOut(lines.join('\n'));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <LinkCard title="OAuth PKCE Generator" slug="oauth-pkce-generator" desc="Generate PKCE code_verifier and code_challenge (S256) pairs for secure OAuth flows." />
      <Card title="OAuth Client Setup">
        <div className="flex flex-wrap gap-1">
          {Object.keys(PROVIDERS).map(p => (
            <button key={p} onClick={() => setProvider(p)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all ${provider === p ? 'bg-blue-600 text-white shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>{p}</button>
          ))}
        </div>
        <Inp label="ID" value={clientId} onChange={setClientId} placeholder="client-id" />
        <Inp label="URI" value={redirectUri} onChange={setRedirectUri} placeholder="https://..." />
        <Inp label="Scope" value={scope} onChange={setScope} placeholder="openid profile" />
        <CalcBtn onClick={generateUrl} label="Generate Auth URL" />
        {authUrl && <pre className="text-[10px] font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 max-h-24 overflow-y-auto text-emerald-600 dark:text-emerald-400 break-all whitespace-pre-wrap">{authUrl}</pre>}
      </Card>

      <Card title="PKCE Verifier">
        <textarea value={pkceVerifier} onChange={e => setPkceVerifier(e.target.value)}
          className="w-full h-10 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Paste verifier..." />
        <Inp label="Challenge" value={pkceChallenge} onChange={setPkceChallenge} />
        <CalcBtn onClick={pkceVerify} label="Verify Pair" />
      </Card>

      <Card title="OAuth Scope Builder">
        <Inp label="Scopes" value={scopeIn} onChange={setScopeIn} placeholder="openid,profile,email" />
        <CalcBtn onClick={scopeBuild} label="Build Scope String" />
      </Card>

      <Card title="OAuth State Validator">
        <Inp label="State" value={stateIn} onChange={setStateIn} placeholder="Paste state param" />
        <CalcBtn onClick={stateValidate} label="Validate State" />
      </Card>

      <LinkCard title="OAuth Token Validator" slug="jwt-debugger" desc="Decode, inspect, and validate OAuth access tokens — verify signature, expiry, and claims using JWT Debugger." />
      {stateVerifyOut && (
        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{stateVerifyOut}</pre>
        </div>
      )}
      {scopeOut && (
        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{scopeOut}</pre>
        </div>
      )}
    </div>
  );
}

function CryptoTools() {
  const [hashInput, setHashInput] = useState('Hello, World!');
  const [hashOutput, setHashOutput] = useState('');
  const [cookieIn, setCookieIn] = useState('session_id=abc123; Secure; HttpOnly; SameSite=Lax');
  const [cookieOut, setCookieOut] = useState('');

  const bcryptHash = async () => {
    if (!hashInput.trim()) { toast.error('Enter text'); return; }
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(hashInput), { name: 'PBKDF2' }, false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 10000, hash: 'SHA-256' }, key, 256);
    const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
    const saltB64 = btoa(String.fromCharCode(...salt));
    setHashOutput(`$2a$10$${saltB64}$${hashHex.slice(0, 53)}`);
    toast.success('PBKDF2 hash generated (bcrypt-simulated)');
  };

  const cookieParse = () => {
    const pairs = cookieIn.split(';').map(s => s.trim());
    const parsed: Record<string, string> = {};
    pairs.forEach(p => {
      const eq = p.indexOf('=');
      if (eq > 0) parsed[p.slice(0, eq).trim()] = p.slice(eq + 1).trim();
      else if (p.toLowerCase() === 'secure') parsed['__Secure'] = 'true';
      else if (p.toLowerCase() === 'httponly') parsed['__HttpOnly'] = 'true';
      else if (p.toLowerCase().startsWith('samesite')) parsed['__SameSite'] = p.split('=')[1]?.trim() || 'true';
    });
    setCookieOut(JSON.stringify(parsed, null, 2));
  };

  const cookieAnalyze = () => {
    const c = cookieIn.toLowerCase();
    const flags: string[] = [];
    if (c.includes('secure')) flags.push('✓ Secure flag set');
    else flags.push('✗ Missing Secure (sent over HTTP)');
    if (c.includes('httponly')) flags.push('✓ HttpOnly flag set');
    else flags.push('✗ Missing HttpOnly (accessible via JS)');
    if (c.includes('samesite')) {
      if (c.includes('samesite=strict')) flags.push('✓ SameSite=Strict');
      else if (c.includes('samesite=lax')) flags.push('✓ SameSite=Lax');
      else if (c.includes('samesite=none')) flags.push('⚠️ SameSite=None (requires Secure)');
    } else flags.push('✗ Missing SameSite attribute');
    const hasExpires = c.includes('expires=') || c.includes('max-age=');
    flags.push(hasExpires ? '✓ Has expiry' : '✗ No expiry (session cookie)');
    const parts = cookieIn.split(';').map(s => s.trim());
    const nameVal = parts[0] || '';
    const eq = nameVal.indexOf('=');
    const name = eq > 0 ? nameVal.slice(0, eq).trim() : '';
    flags.push(`Name length: ${name.length} chars${name.length > 0 && name.length < 3 ? ' (too short)' : ''}`);
    setCookieOut(flags.join('\n'));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <LinkCard title="MD5 & Hash Generator" slug="md5-hash-generator" desc="Compute MD5, SHA-1, SHA-256, and SHA-512 hashes from text or file input." />

      <Card title="PBKDF2 Hash">
        <textarea value={hashInput} onChange={e => setHashInput(e.target.value)}
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={bcryptHash} label="Generate Hash" />
      </Card>

      <LinkCard title="AES Encrypt" slug="aes-encrypt" desc="Encrypt and decrypt data with AES-256-GCM. More secure than the inline AES-128-CBC implementation." />
      <LinkCard title="Content Security Policy Generator" slug="content-security-policy-generator" desc="Build CSP headers with nonce generation, directive configuration, and policy validation." />
      <Card title="Cookie Parser">
        <textarea value={cookieIn} onChange={e => setCookieIn(e.target.value)}
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Set-Cookie header..." />
        <CalcBtn onClick={cookieParse} label="Parse Cookie" />
      </Card>

      <Card title="Cookie Security Analyzer">
        <textarea value={cookieIn} onChange={e => setCookieIn(e.target.value)}
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Set-Cookie header..." />
        <CalcBtn onClick={cookieAnalyze} label="Analyze Security" />
      </Card>

      {hashOutput && (
        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">Hash Output</span>
            <button onClick={() => { clipboardWrite(hashOutput); toast.success('Copied!'); }} className="text-[10px] text-blue-500 hover:underline">Copy</button>
          </div>
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 max-h-32 overflow-y-auto text-emerald-600 dark:text-emerald-400 break-all">{hashOutput}</pre>
        </div>
      )}
      {cookieOut && (
        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{cookieOut}</pre>
        </div>
      )}
    </div>
  );
}

function SslTools() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <LinkCard title="SSL/TLS Checker" slug="ssl-tls-checker" desc="Full SSL certificate inspection including chain validation, expiry dates, cipher suites, and protocol support." />
      <LinkCard title="SAML Decoder" slug="saml-decoder" desc="Decode SAML assertions and extract issuer, subject, conditions, authentication context, and attributes." />
    </div>
  );
}
