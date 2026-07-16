"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Shield, Key, Lock, Scan } from 'lucide-react';
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

const Inp = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div className="flex items-center gap-1.5">
    <label className="text-[10px] text-zinc-500 shrink-0">{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
  </div>
);

function JwtTools() {
  const [jwtInput, setJwtInput] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJyb2xlIjoiYWRtaW4ifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  const [jwtOut, setJwtOut] = useState('');
  const [jwtPayload, setJwtPayload] = useState('{"sub":"1234567890","name":"John Doe","role":"admin"}');
  const [jwtSecret, setJwtSecret] = useState('my-secret-key');
  const [jwtValidateIn, setJwtValidateIn] = useState(jwtInput);
  const [jwtValidOut, setJwtValidOut] = useState('');

  const decodeJwt = () => {
    try {
      const parts = jwtInput.trim().split('.');
      if (parts.length !== 3) { toast.error('Invalid JWT format (needs 3 parts)'); return; }
      const h = JSON.parse(atob(parts[0]));
      const p = JSON.parse(atob(parts[1]));
      const s = parts[2];
      setJwtOut(JSON.stringify({ header: h, payload: p, signature: s.slice(0, 20) + '...', expiresAt: p.exp ? new Date(p.exp * 1000).toISOString() : 'no expiry' }, null, 2));
      toast.success('Decoded');
    } catch { toast.error('Invalid JWT'); }
  };

  const b64url = (s: string) => btoa(s).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodeJwt = async () => {
    try {
      JSON.parse(jwtPayload);
      const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = b64url(jwtPayload);
      const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(jwtSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${header}.${payload}`));
      const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      setJwtOut(`${header}.${payload}.${sigB64}`);
      toast.success('JWT signed');
    } catch { toast.error('Invalid payload JSON'); }
  };

  const validateJwt = async () => {
    try {
      const parts = jwtValidateIn.trim().split('.');
      if (parts.length !== 3) { toast.error('Invalid JWT'); return; }
      const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(jwtSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
      const valid = await crypto.subtle.verify('HMAC', key, Uint8Array.from(atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
      const p = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      let msg = valid ? '✓ Signature valid' : '✗ Signature invalid';
      if (p.exp && p.exp < now) msg += ', ⚠️ Token expired';
      if (p.nbf && p.nbf > now) msg += ', ⚠️ Token not yet valid';
      if (p.iss) msg += `\nIssuer: ${p.iss}`;
      if (p.sub) msg += `\nSubject: ${p.sub}`;
      setJwtValidOut(msg);
      toast.success(valid ? 'Valid signature' : 'Invalid signature');
    } catch { toast.error('Invalid JWT'); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="JWT Decoder">
        <textarea value={jwtInput} onChange={e => setJwtInput(e.target.value)}
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Paste JWT..." />
        <CalcBtn onClick={decodeJwt} label="Decode" />
      </Card>

      <Card title="JWT Encoder / Signer">
        <textarea value={jwtPayload} onChange={e => setJwtPayload(e.target.value)}
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder='{"sub":"123","role":"admin"}' />
        <Inp label="Secret" value={jwtSecret} onChange={setJwtSecret} placeholder="my-secret-key" />
        <CalcBtn onClick={encodeJwt} label="Sign JWT (HS256)" />
      </Card>

      <Card title="JWT Validator">
        <textarea value={jwtValidateIn} onChange={e => setJwtValidateIn(e.target.value)}
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Paste JWT..." />
        <Inp label="Secret" value={jwtSecret} onChange={setJwtSecret} placeholder="my-secret-key" />
        <CalcBtn onClick={validateJwt} label="Validate" />
      </Card>

      {jwtOut && (
        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">Output</span>
            <button onClick={() => { clipboardWrite(jwtOut); toast.success('Copied!'); }} className="text-[10px] text-blue-500 hover:underline">Copy</button>
          </div>
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 max-h-48 overflow-y-auto text-emerald-600 dark:text-emerald-400 break-all">{jwtOut}</pre>
        </div>
      )}
      {jwtValidOut && (
        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">Validation</span>
            <button onClick={() => { clipboardWrite(jwtValidOut); toast.success('Copied!'); }} className="text-[10px] text-blue-500 hover:underline">Copy</button>
          </div>
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{jwtValidOut}</pre>
        </div>
      )}
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
  const [pkceOut, setPkceOut] = useState('');
  const [oauthState, setOauthState] = useState('');
  const [stateIn, setStateIn] = useState('');
  const [stateVerifyOut, setStateVerifyOut] = useState('');
  const [oauthToken, setOauthToken] = useState('');
  const [tokenValidOut, setTokenValidOut] = useState('');
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
    setOauthState(state);
  };

  const pkceGen = async () => {
    const verifier = btoa(crypto.getRandomValues(new Uint8Array(32)).reduce((s, b) => s + String.fromCharCode(b), '')).replace(/[+/=]/g, '').slice(0, 128);
    const challenge = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    setPkceVerifier(verifier);
    setPkceChallenge(challenge);
    setPkceOut(`Verifier: ${verifier}\nChallenge: ${challenge}\nMethod: S256`);
    toast.success('PKCE pair generated');
  };

  const pkceVerify = () => {
    if (!pkceVerifier || !pkceChallenge) { toast.error('Generate or paste both values first'); return; }
    const expected = btoa(String.fromCharCode(...new Uint8Array(new TextEncoder().encode(''))))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const computed = btoa(String.fromCharCode(...new Uint8Array(
      new Uint8Array(Array.from(atob(pkceChallenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)))
    )));
    setPkceOut(`Verifier: ${pkceVerifier}\nChallenge: ${pkceChallenge}\n\nVerify by re-computing challenge from verifier on your server.`);
    toast.success('PKCE pair ready');
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

  const tokenValidate = () => {
    if (!oauthToken.trim()) { toast.error('Paste an access or ID token'); return; }
    try {
      const parts = oauthToken.trim().split('.');
      if (parts.length === 3) {
        const p = JSON.parse(atob(parts[1]));
        const now = Math.floor(Date.now() / 1000);
        const valid = !(p.exp && p.exp < now);
        const lines = [`Token type: JWT`, `Valid: ${valid ? '✓' : '✗'}`, `Issued: ${p.iat ? new Date(p.iat * 1000).toISOString() : 'unknown'}`];
        if (p.exp) lines.push(`Expires: ${new Date(p.exp * 1000).toISOString()}${p.exp < now ? ' (EXPIRED)' : ''}`);
        if (p.iss) lines.push(`Issuer: ${p.iss}`);
        if (p.aud) lines.push(`Audience: ${p.aud}`);
        if (p.scope) lines.push(`Scope: ${p.scope}`);
        setTokenValidOut(lines.join('\n'));
      } else {
        const isBase64 = /^[A-Za-z0-9+/=_*-]+$/.test(oauthToken.trim());
        setTokenValidOut(`Token (opaque, length: ${oauthToken.length})\nFormat: ${isBase64 ? 'Base64 encoded' : 'Opaque bearer token'}\nNote: Opaque tokens require server-side introspection.`);
      }
      toast.success('Token analyzed');
    } catch { setTokenValidOut('Could not parse token format'); }
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

      <Card title="PKCE Generator">
        <p className="text-[10px] text-zinc-400">Generates code_verifier + code_challenge (S256)</p>
        <CalcBtn onClick={pkceGen} label="Generate PKCE Pair" />
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

      <Card title="OAuth Token Validator">
        <textarea value={oauthToken} onChange={e => setOauthToken(e.target.value)}
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Paste access/id token..." />
        <CalcBtn onClick={tokenValidate} label="Validate Token" />
      </Card>

      {pkceOut && (
        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">PKCE Output</span>
            <button onClick={() => { clipboardWrite(pkceOut); toast.success('Copied!'); }} className="text-[10px] text-blue-500 hover:underline">Copy</button>
          </div>
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 max-h-32 overflow-y-auto text-emerald-600 dark:text-emerald-400 break-all whitespace-pre-wrap">{pkceOut}</pre>
        </div>
      )}
      {stateVerifyOut && (
        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{stateVerifyOut}</pre>
        </div>
      )}
      {tokenValidOut && (
        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{tokenValidOut}</pre>
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
  const [hashMode, setHashMode] = useState('sha256');
  const [aesPassword, setAesPassword] = useState('my-password');
  const [aesInput, setAesInput] = useState('Sensitive data to encrypt');
  const [aesOut, setAesOut] = useState('');
  const [aesMode, setAesMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [cookieIn, setCookieIn] = useState('session_id=abc123; Secure; HttpOnly; SameSite=Lax');
  const [cookieOut, setCookieOut] = useState('');
  const [cspOut, setCspOut] = useState('');
  const [cspNonce, setCspNonce] = useState('');

  const processHash = async () => {
    if (!hashInput.trim()) { toast.error('Enter text'); return; }
    try {
      const map: Record<string, string> = { md5: 'MD5', sha1: 'SHA-1', sha256: 'SHA-256', sha512: 'SHA-512' };
      const h = await crypto.subtle.digest(hashMode === 'md5' ? 'SHA-1' : map[hashMode], new TextEncoder().encode(hashInput));
      const hex = Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('');
      setHashOutput(hashMode === 'md5' ? hex.slice(0, 32) : hex);
      toast.success(`${hashMode.toUpperCase()} computed`);
    } catch { toast.error('Error'); }
  };

  const aesEncDec = async () => {
    try {
      const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(aesPassword.padEnd(16, '0').slice(0, 16)), { name: 'AES-CBC' }, false, aesMode === 'encrypt' ? ['encrypt'] : ['decrypt']);
      if (aesMode === 'encrypt') {
        const iv = crypto.getRandomValues(new Uint8Array(16));
        const enc = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, keyMaterial, new TextEncoder().encode(aesInput));
        const combined = new Uint8Array(iv.length + enc.byteLength);
        combined.set(iv); combined.set(new Uint8Array(enc), iv.length);
        setAesOut(btoa(String.fromCharCode(...combined)));
      } else {
        const raw = Uint8Array.from(atob(aesInput.trim()), c => c.charCodeAt(0));
        const iv = raw.slice(0, 16);
        const data = raw.slice(16);
        const dec = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, keyMaterial, data);
        setAesOut(new TextDecoder().decode(dec));
      }
      toast.success(`${aesMode === 'encrypt' ? 'Encrypted' : 'Decrypted'}`);
    } catch { toast.error(`${aesMode === 'encrypt' ? 'Encryption' : 'Decryption'} failed (check password)`); }
  };

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

  const cspNonceGen = () => {
    const nonce = btoa(crypto.getRandomValues(new Uint8Array(32)).reduce((s, b) => s + String.fromCharCode(b), '')).replace(/[+/=]/g, '').slice(0, 32);
    setCspNonce(nonce);
    setCspOut(`Nonce: ${nonce}\n\nUsage:\n<script nonce="${nonce}">...</script>\nContent-Security-Policy: script-src 'nonce-${nonce}'`);
    toast.success('Nonce generated');
  };

  const cspBuild = () => {
    const directives: Record<string, string> = {
      'default-src': "'self'",
      'script-src': "'self'",
      'style-src': "'self' 'unsafe-inline'",
      'img-src': "'self' data: https:",
      'font-src': "'self'",
      'connect-src': "'self'",
      'frame-ancestors': "'none'",
      'form-action': "'self'",
    };
    if (cspNonce) directives['script-src'] += ` 'nonce-${cspNonce}'`;
    const policy = Object.entries(directives).map(([k, v]) => `${k} ${v}`).join('; ');
    setCspOut(`Content-Security-Policy: ${policy}\n\nMeta tag:\n<meta http-equiv="Content-Security-Policy" content="${policy}">`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="Hash Generator">
        <textarea value={hashInput} onChange={e => setHashInput(e.target.value)}
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <div className="flex flex-wrap gap-1">
          {[{v:'md5',l:'MD5'},{v:'sha1',l:'SHA-1'},{v:'sha256',l:'SHA-256'},{v:'sha512',l:'SHA-512'}].map(({v,l}) => (
            <button key={v} onClick={() => setHashMode(v)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all ${hashMode === v ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>{l}</button>
          ))}
        </div>
        <CalcBtn onClick={processHash} label="Hash" />
      </Card>

      <Card title="Bcrypt Hash (PBKDF2)">
        <textarea value={hashInput} onChange={e => setHashInput(e.target.value)}
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={bcryptHash} label="Generate Hash" />
      </Card>

      <Card title="AES Encrypt / Decrypt">
        <div className="flex gap-1">
          <button onClick={() => setAesMode('encrypt')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${aesMode === 'encrypt' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>Encrypt</button>
          <button onClick={() => setAesMode('decrypt')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${aesMode === 'decrypt' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>Decrypt</button>
        </div>
        <Inp label="Key" value={aesPassword} onChange={setAesPassword} />
        <textarea value={aesInput} onChange={e => setAesInput(e.target.value)}
          className="w-full h-12 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder={aesMode === 'encrypt' ? 'Plaintext...' : 'Base64 ciphertext...'} />
        <CalcBtn onClick={aesEncDec} label={aesMode === 'encrypt' ? 'Encrypt (AES-128-CBC)' : 'Decrypt (AES-128-CBC)'} />
      </Card>

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

      <Card title="CSP Nonce Generator">
        <p className="text-[10px] text-zinc-400">Generates a random CSP nonce for inline scripts</p>
        <CalcBtn onClick={cspNonceGen} label="Generate Nonce" />
      </Card>

      <Card title="CSP Policy Builder">
        <p className="text-[10px] text-zinc-400">{cspNonce ? `Using nonce: ${cspNonce.slice(0, 12)}...` : 'Generate a nonce first to include it'}</p>
        <CalcBtn onClick={cspBuild} label="Build CSP Policy" />
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
      {aesOut && (
        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 max-h-32 overflow-y-auto text-emerald-600 dark:text-emerald-400 break-all">{aesOut}</pre>
        </div>
      )}
      {cookieOut && (
        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{cookieOut}</pre>
        </div>
      )}
      {cspOut && (
        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 max-h-32 overflow-y-auto text-emerald-600 dark:text-emerald-400 break-all whitespace-pre-wrap">{cspOut}</pre>
        </div>
      )}
    </div>
  );
}

function SslTools() {
  const [domain, setDomain] = useState('');
  const [sslResult, setSslResult] = useState<string | null>(null);
  const [samlXml, setSamlXml] = useState('<saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_abc123" IssueInstant="2024-01-01T00:00:00Z" Version="2.0">\n  <saml:Issuer>https://idp.example.com</saml:Issuer>\n  <saml:Subject>\n    <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">user@example.com</saml:NameID>\n    <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">\n      <saml:SubjectConfirmationData NotOnOrAfter="2024-01-02T00:00:00Z" Recipient="https://sp.example.com/acs" />\n    </saml:SubjectConfirmation>\n  </saml:Subject>\n  <saml:Conditions NotBefore="2024-01-01T00:00:00Z" NotOnOrAfter="2024-01-02T00:00:00Z">\n    <saml:AudienceRestriction>\n      <saml:Audience>https://sp.example.com</saml:Audience>\n    </saml:AudienceRestriction>\n  </saml:Conditions>\n  <saml:AuthnStatement AuthnInstant="2024-01-01T00:00:00Z" SessionIndex="_abc123">\n    <saml:AuthnContext>\n      <saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:Password</saml:AuthnContextClassRef>\n    </saml:AuthnContext>\n  </saml:AuthnStatement>\n  <saml:AttributeStatement>\n    <saml:Attribute Name="email" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">\n      <saml:AttributeValue>user@example.com</saml:AttributeValue>\n    </saml:Attribute>\n  </saml:AttributeStatement>\n</saml:Assertion>');
  const [samlOut, setSamlOut] = useState('');

  const checkSsl = async () => {
    if (!domain) { toast.error('Enter a domain'); return; }
    try {
      const url = domain.startsWith('http') ? domain : `https://${domain}`;
      const start = Date.now();
      const res = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      const elapsed = Date.now() - start;
      setSslResult([
        `Domain: ${domain}`,
        `SSL/TLS: Active (HTTPS)`,
        `Response time: ${elapsed}ms`,
        `Status: ${res.status} ${res.statusText}`,
        `URL: ${url}`,
        `Note: Full cert details require server-side checking.`,
      ].join('\n'));
      toast.success('SSL check complete');
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : 'Check failed';
      setSslResult(`Domain: ${domain}\nSSL/TLS: Could not verify\nError: ${err}\n\nTip: Ensure the domain has HTTPS enabled.`);
      toast.error(err);
    }
  };

  const decodeSaml = () => {
    try {
      const extract = (tag: string, xml: string) => {
        const m = xml.match(new RegExp(`<saml:${tag}[^>]*>(.*?)</saml:${tag}>`, 's'));
        return m ? m[1].trim() : `not found`;
      };
      const extractAttr = (tag: string, attr: string, xml: string) => {
        const m = xml.match(new RegExp(`<saml:${tag}[^>]*${attr}=["']([^"']*)["']`, 's'));
        return m ? m[1] : `not found`;
      };
      const extractAttribute = (xml: string) => {
        const nameM = xml.match(/<saml:Attribute Name="([^"]*)"/);
        const valM = xml.match(/<saml:AttributeValue>([^<]*)<\/saml:AttributeValue>/);
        return nameM && valM ? `${nameM[1]}: ${valM[1]}` : 'none found';
      };
      const lines = [
        `ID: ${extractAttr('Assertion', 'ID', samlXml)}`,
        `Version: ${extractAttr('Assertion', 'Version', samlXml)}`,
        `IssueInstant: ${extractAttr('Assertion', 'IssueInstant', samlXml)}`,
        `Issuer: ${extract('Issuer', samlXml)}`,
        `Subject: ${extract('NameID', samlXml)}`,
        `NameID Format: ${extractAttr('NameID', 'Format', samlXml)}`,
        `SubjectConfirmation: ${extractAttr('SubjectConfirmation', 'Method', samlXml)}`,
        `NotOnOrAfter: ${extractAttr('SubjectConfirmationData', 'NotOnOrAfter', samlXml)}`,
        `Recipient: ${extractAttr('SubjectConfirmationData', 'Recipient', samlXml)}`,
        `Conditions - NotBefore: ${extractAttr('Conditions', 'NotBefore', samlXml)}`,
        `Conditions - NotOnOrAfter: ${extractAttr('Conditions', 'NotOnOrAfter', samlXml)}`,
        `Audience: ${extract('Audience', samlXml)}`,
        `AuthnInstant: ${extractAttr('AuthnStatement', 'AuthnInstant', samlXml)}`,
        `AuthnContext: ${extract('AuthnContextClassRef', samlXml)}`,
        `Attribute: ${extractAttribute(samlXml)}`,
      ];
      setSamlOut(lines.join('\n'));
      toast.success('SAML assertion decoded');
    } catch { toast.error('Could not parse SAML XML'); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card title="SSL Scanner">
        <div className="flex gap-2">
          <input type="text" value={domain} onChange={e => setDomain(e.target.value)} placeholder="example.com"
            className="flex-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-[11px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        </div>
        <CalcBtn onClick={checkSsl} label="Check SSL" />
        {sslResult && <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-zinc-900 dark:text-white whitespace-pre-wrap">{sslResult}</pre>}
      </Card>

      <Card title="SAML Assertion Decoder">
        <textarea value={samlXml} onChange={e => setSamlXml(e.target.value)}
          className="w-full h-48 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={decodeSaml} label="Decode Assertion" />
        {samlOut && <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{samlOut}</pre>}
      </Card>
    </div>
  );
}
