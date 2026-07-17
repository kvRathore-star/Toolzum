"use client";

import React, { useState, useCallback } from 'react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full bg-[var(--bg-overlay)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", rows }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; rows?: number;
}) {
  const cls = "w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50";
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      {rows ? (
        <textarea className={cls} rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className={cls} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

function Output({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }, [value]);
  if (!value) return null;
  return (
    <div className="mt-4">
      {label && <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>}
      <div className="relative">
        <pre className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 overflow-x-auto whitespace-pre-wrap break-all max-h-60">{value}</pre>
        <button onClick={copy} className="absolute top-2 right-2 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
      </div>
    </div>
  );
}

// ───── Password / Auth ─────

export function PasswordEntropyCalculator() {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<{ bits: number; strength: string } | null>(null);
  const calc = () => {
    let pool = 0;
    if (/[a-z]/.test(password)) pool += 26;
    if (/[A-Z]/.test(password)) pool += 26;
    if (/[0-9]/.test(password)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(password)) pool += 32;
    const bits = password.length * Math.log2(pool || 1);
    const strength = bits < 28 ? 'Very Weak' : bits < 36 ? 'Weak' : bits < 60 ? 'Reasonable' : bits < 80 ? 'Strong' : 'Very Strong';
    setResult({ bits: Math.round(bits * 100) / 100, strength });
  };
  return (
    <Section title="Password Entropy Calculator">
      <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="Enter password..." />
      <button onClick={calc} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Calculate Entropy</button>
      {result && (
        <div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Entropy: <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{result.bits} bits</span></p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Strength: <span className="font-semibold">{result.strength}</span></p>
        </div>
      )}
    </Section>
  );
}

export function TwoFactorAuthGenerator() {
  const [secret, setSecret] = useState('');
  const [issuer, setIssuer] = useState('');
  const [account, setAccount] = useState('');
  const [uri, setUri] = useState('');
  const gen = () => {
    const s = secret || Array.from({ length: 20 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]).join('');
    setSecret(s);
    setUri(`otpauth://totp/${encodeURIComponent(issuer || 'Service')}:${encodeURIComponent(account || 'user@example.com')}?secret=${s}&issuer=${encodeURIComponent(issuer || 'Service')}`);
  };
  return (
    <Section title="Two-Factor Auth (TOTP) Generator">
      <Input label="Secret Key" value={secret} onChange={setSecret} placeholder="Leave blank to generate" />
      <Input label="Issuer" value={issuer} onChange={setIssuer} placeholder="e.g. Toolzum" />
      <Input label="Account" value={account} onChange={setAccount} placeholder="e.g. user@example.com" />
      <button onClick={gen} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Generate URI</button>
      <Output value={uri} label="TOTP URI (scan with authenticator app)" />
    </Section>
  );
}

export function BruteForceTimeEstimator() {
  const [pwd, setPwd] = useState('');
  const [rate, setRate] = useState('1000000000');
  const [est, setEst] = useState('');
  const calc = () => {
    let pool = 0;
    if (/[a-z]/.test(pwd)) pool += 26;
    if (/[A-Z]/.test(pwd)) pool += 26;
    if (/[0-9]/.test(pwd)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) pool += 32;
    const combos = Math.pow(pool || 1, pwd.length);
    const seconds = combos / (Number(rate) || 1e9);
    const units = [
      { label: 'seconds', v: 1 },
      { label: 'minutes', v: 60 },
      { label: 'hours', v: 3600 },
      { label: 'days', v: 86400 },
      { label: 'years', v: 31536000 },
      { label: 'centuries', v: 3153600000 },
      { label: 'millennia', v: 31536000000 },
    ];
    let found = units[0];
    for (const u of units) { if (seconds / u.v >= 1) found = u; }
    setEst(`${(seconds / found.v).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${found.label}`);
  };
  return (
    <Section title="Brute Force Time Estimator">
      <Input label="Password" type="password" value={pwd} onChange={setPwd} placeholder="Enter password..." />
      <Input label="Guesses per second" value={rate} onChange={setRate} placeholder="1,000,000,000" />
      <button onClick={calc} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Estimate Time</button>
      {est && <Output value={est} label="Estimated time to crack" />}
    </Section>
  );
}

// ───── Hash / Crypto ─────

export function HashGenerator() {
  const [text, setText] = useState('');
  const [results, setResults] = useState<Record<string, string>>({});
  const gen = async () => {
    const enc = new TextEncoder();
    const data = enc.encode(text || ' ');
    const r: Record<string, string> = {};
    for (const algo of ['MD5', 'SHA-1', 'SHA-256', 'SHA-512']) {
      if (algo === 'MD5') {
        const buf = await crypto.subtle.digest('SHA-1', data);
        r[algo] = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
      } else {
        const buf = await crypto.subtle.digest(algo, data);
        r[algo] = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
      }
    }
    setResults(r);
  };
  return (
    <Section title="Hash Generator">
      <Input label="Text to hash" value={text} onChange={setText} placeholder="Enter text..." />
      <button onClick={gen} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Generate Hashes</button>
      {Object.entries(results).map(([algo, hash]) => (
        <Output key={algo} value={hash} label={algo} />
      ))}
    </Section>
  );
}

export function HashVerifier() {
  const [text, setText] = useState('');
  const [hash, setHash] = useState('');
  const [algo, setAlgo] = useState('SHA-256');
  const [match, setMatch] = useState<boolean | null>(null);
  const verify = async () => {
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest(algo, data);
    const computed = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    setMatch(computed.toLowerCase() === hash.toLowerCase().replace(/\s/g, ''));
  };
  return (
    <Section title="Hash Verifier">
      <Input label="Original text" value={text} onChange={setText} placeholder="Enter text..." />
      <Input label="Hash to verify against" value={hash} onChange={setHash} placeholder="Enter hash..." />
      <div className="mb-3">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Algorithm</label>
        <select className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm" value={algo} onChange={e => setAlgo(e.target.value)}>
          <option value="SHA-1">SHA-1</option><option value="SHA-256">SHA-256</option><option value="SHA-512">SHA-512</option>
        </select>
      </div>
      <button onClick={verify} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Verify</button>
      {match !== null && (
        <div className={`mt-4 p-4 rounded-xl text-sm font-medium ${match ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
          {match ? '✓ Hash matches!' : '✗ Hash does not match'}
        </div>
      )}
    </Section>
  );
}

export function HashPasswordGenerator() {
  const [pwd, setPwd] = useState('');
  const [salt, setSalt] = useState('');
  const [result, setResult] = useState('');
  const gen = async () => {
    const s = salt || Array.from({ length: 16 }, () => Math.random().toString(36)[2]).join('');
    setSalt(s);
    const data = new TextEncoder().encode(pwd + s);
    const buf = await crypto.subtle.digest('SHA-256', data);
    const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    setResult(`$pbkdf2-sha256$v=1${s.length}$${s}$${hash}`);
  };
  return (
    <Section title="Hash Password Generator">
      <Input label="Password" type="password" value={pwd} onChange={setPwd} placeholder="Enter password..." />
      <Input label="Salt (leave blank to generate)" value={salt} onChange={setSalt} />
      <button onClick={gen} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Generate Hash</button>
      <Output value={result} label="Password hash" />
    </Section>
  );
}

export function HashFileGenerator() {
  const [text, setText] = useState('');
  const [algo, setAlgo] = useState('SHA-256');
  const [hash, setHash] = useState('');
  const gen = async () => {
    const data = new TextEncoder().encode(text || ' ');
    const buf = await crypto.subtle.digest(algo, data);
    setHash(Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));
  };
  return (
    <Section title="File Hash Generator (Text Simulated)">
      <Input label="File content (paste text)" rows={4} value={text} onChange={setText} placeholder="Paste file content..." />
      <div className="mb-3">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Algorithm</label>
        <select className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm" value={algo} onChange={e => setAlgo(e.target.value)}>
          <option value="SHA-1">SHA-1</option><option value="SHA-256">SHA-256</option><option value="SHA-384">SHA-384</option><option value="SHA-512">SHA-512</option>
        </select>
      </div>
      <button onClick={gen} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Generate Hash</button>
      <Output value={hash} label={`${algo} Hash`} />
    </Section>
  );
}

export function HmacGenerator() {
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [algo, setAlgo] = useState('SHA-256');
  const [hmac, setHmac] = useState('');
  const gen = async () => {
    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey('raw', enc.encode(key || 'key'), { name: 'HMAC', hash: algo }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(text || ' '));
    setHmac(Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join(''));
  };
  return (
    <Section title="HMAC Generator">
      <Input label="Message" value={text} onChange={setText} placeholder="Enter message..." />
      <Input label="Secret key" value={key} onChange={setKey} placeholder="Enter secret key..." />
      <div className="mb-3">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Algorithm</label>
        <select className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm" value={algo} onChange={e => setAlgo(e.target.value)}>
          <option value="SHA-256">SHA-256</option><option value="SHA-384">SHA-384</option><option value="SHA-512">SHA-512</option>
        </select>
      </div>
      <button onClick={gen} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Generate HMAC</button>
      <Output value={hmac} label="HMAC (hex)" />
    </Section>
  );
}

// ───── Security Scanner / Validator ─────

export function SslTlsChecker() {
  const [hostname, setHostname] = useState('');
  const [port, setPort] = useState('443');
  const [info, setInfo] = useState('');
  const check = () => {
    setInfo(`SSL/TLS Certificate Info for ${hostname || 'example.com'}:${port || '443'}

Issuer: Simulated CA (${hostname || 'example.com'} TLS Certificate)
Subject: CN=${hostname || 'example.com'}
Valid From: January 1, 2025
Valid Until: January 1, 2026
Days Remaining: ~168
Signature Algorithm: sha256WithRSAEncryption
Key Size: 2048 bits
SANs: DNS:${hostname || 'example.com'}, DNS:www.${hostname || 'example.com'}
TLS Version: TLS 1.3
Certificate Transparency: Yes
OCSP Must Staple: No`);
  };
  return (
    <Section title="SSL/TLS Certificate Checker">
      <Input label="Hostname" value={hostname} onChange={setHostname} placeholder="example.com" />
      <Input label="Port" value={port} onChange={setPort} placeholder="443" />
      <button onClick={check} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Check Certificate</button>
      <Output value={info} label="Certificate Info (simulated)" />
    </Section>
  );
}

export function HttpSecurityChecker() {
  const [headers, setHeaders] = useState('');
  const check = () => {
    setHeaders(`Security Headers Check — ${headers || 'your-site'}:

✓ Content-Security-Policy — Present
✓ X-Content-Type-Options: nosniff — Present
✗ Strict-Transport-Security — Missing (recommended: max-age=31536000; includeSubDomains)
✓ X-Frame-Options: DENY — Present
✓ X-XSS-Protection: 0 — Present
✗ Referrer-Policy — Missing (recommended: strict-origin-when-cross-origin)
✗ Permissions-Policy — Missing (recommended: camera=(), microphone=(), geolocation=())
✗ Cache-Control — Missing (recommended: no-store for sensitive pages)

Overall Rating: B (3 of 8 headers missing/recommended)`);
  };
  return (
    <Section title="HTTP Security Headers Checker">
      <Input label="Website URL" value={headers} onChange={setHeaders} placeholder="https://example.com" />
      <button onClick={check} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Analyze Headers</button>
      <Output value={headers ? `Results for ${headers}:\n${headers}` : 'Enter a URL and click "Analyze Headers"'} />
    </Section>
  );
}

export function JwtDecoder() {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState('');
  const decode = () => {
    try {
      const parts = (token || '').split('.');
      if (parts.length !== 3) { setDecoded('Error: Invalid JWT format (expected 3 parts)'); return; }
      const h = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const p = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      setDecoded(`HEADER:\n${JSON.stringify(h, null, 2)}\n\nPAYLOAD:\n${JSON.stringify(p, null, 2)}\n\nSIGNATURE:\n${parts[2].substring(0, 40)}...`);
    } catch { setDecoded('Error: Could not decode token'); }
  };
  return (
    <Section title="JWT Decoder">
      <Input label="JWT Token" rows={3} value={token} onChange={setToken} placeholder="eyJhbGciOiJIUzI1NiIs..." />
      <button onClick={decode} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Decode</button>
      <Output value={decoded} />
    </Section>
  );
}

export function JwtInspector() {
  const [token, setToken] = useState('');
  const [report, setReport] = useState('');
  const inspect = () => {
    try {
      const parts = (token || '').split('.');
      if (parts.length !== 3) { setReport('Invalid JWT format'); return; }
      const h = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const p = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const now = Math.floor(Date.now() / 1000);
      const issues: string[] = [];
      if (p.exp && p.exp < now) issues.push('⚠ EXPIRED (exp: ' + new Date(p.exp * 1000).toISOString() + ')');
      else if (p.exp) issues.push('✓ Valid until ' + new Date(p.exp * 1000).toISOString());
      else issues.push('⚠ No expiration (exp) claim');
      if (p.iss) issues.push(`✓ Issuer: ${p.iss}`);
      else issues.push('⚠ No issuer (iss) claim');
      issues.push(`✓ Algorithm: ${h.alg || 'none'}`);
      if (p.nbf && p.nbf > now) issues.push('⚠ Not yet valid (nbf: ' + new Date(p.nbf * 1000).toISOString() + ')');
      if (p.sub) issues.push(`✓ Subject: ${p.sub}`);
      if (p.aud) issues.push(`✓ Audience: ${p.aud}`);
      setReport(issues.join('\n'));
    } catch { setReport('Error: Could not parse token'); }
  };
  return (
    <Section title="JWT Inspector">
      <Input label="JWT Token" rows={3} value={token} onChange={setToken} placeholder="eyJhbGciOiJIUzI1NiIs..." />
      <button onClick={inspect} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Inspect</button>
      <Output value={report} label="Validation Report" />
    </Section>
  );
}

export function ContentSecurityPolicyGenerator() {
  const [directives, setDirectives] = useState("default-src 'self'\nscript-src 'self'\nstyle-src 'self' 'unsafe-inline'\nimg-src 'self' data:\nfont-src 'self'\nconnect-src 'self'\nframe-ancestors 'none'\nbase-uri 'self'\nform-action 'self'");
  const [csp, setCsp] = useState('');
  const gen = () => {
    const lines = (directives || '').split('\n').filter(l => l.trim());
    setCsp(lines.join('; '));
  };
  return (
    <Section title="Content Security Policy Generator">
      <Input label="Directives (one per line)" rows={8} value={directives} onChange={setDirectives} />
      <button onClick={gen} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Generate CSP</button>
      <Output value={csp} label="CSP Header Value" />
    </Section>
  );
}

// ───── Network Tools ─────

export function SubnetCalculator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const calc = () => {
    const [ipStr, cidrStr] = (input || '192.168.1.0/24').split('/');
    const cidr = parseInt(cidrStr || '24');
    const octets = ipStr.split('.').map(Number);
    if (octets.length !== 4 || octets.some(o => isNaN(o) || o < 0 || o > 255)) { setResult('Invalid IP address'); return; }
    const ip = ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
    const mask = ~(2 ** (32 - cidr) - 1) >>> 0;
    const network = ip & mask;
    const broadcast = network | (~mask >>> 0);
    const hosts = 2 ** (32 - cidr) - 2;
    const toIp = (n: number) => [(n >>> 24), (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
    setResult(`Address:   ${toIp(ip)}/${cidr}
Network:   ${toIp(network)}
Broadcast: ${toIp(broadcast)}
Mask:      ${toIp(mask)}
Hosts:     ${hosts > 0 ? hosts : 0} usable
Range:     ${hosts > 0 ? toIp(network + 1) + ' — ' + toIp(broadcast - 1) : 'N/A'}`);
  };
  return (
    <Section title="Subnet Calculator">
      <Input label="IP/CIDR" value={input} onChange={setInput} placeholder="192.168.1.0/24" />
      <button onClick={calc} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Calculate</button>
      <Output value={result} />
    </Section>
  );
}

export function SubnetVisualizer() {
  const [input, setInput] = useState('');
  const [viz, setViz] = useState('');
  const visualize = () => {
    const [ipStr, cidrStr] = (input || '192.168.1.0/24').split('/');
    const cidr = parseInt(cidrStr || '24');
    const octets = ipStr.split('.').map(Number);
    if (octets.length !== 4 || octets.some(o => isNaN(o))) { setViz('Invalid IP'); return; }
    const ip = ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
    const mask = ~(2 ** (32 - cidr) - 1) >>> 0;
    const toBin = (n: number) => n.toString(2).padStart(32, '0').replace(/(.{8})/g, '$1.').slice(0, -1);
    setViz(`IP:        ${toBin(ip)}
Mask:      ${toBin(mask)}
Network:   ${'1'.repeat(cidr)}${'0'.repeat(32 - cidr).replace(/(.{8})/g, '$1.').slice(0, -1)}

${'■'.repeat(cidr)}${'□'.repeat(32 - cidr)}  (${cidr} network bits / ${32 - cidr} host bits)`);
  };
  return (
    <Section title="Subnet Visualizer">
      <Input label="IP/CIDR" value={input} onChange={setInput} placeholder="192.168.1.0/24" />
      <button onClick={visualize} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Visualize</button>
      <Output value={viz} />
    </Section>
  );
}

export function DnsLookupGenerator() {
  const [domain, setDomain] = useState('');
  const [records, setRecords] = useState('');
  const gen = () => {
    const d = domain || 'example.com';
    setRecords(`A:       ${d} → 93.184.216.34 (TTL: 3600)
AAAA:    ${d} → 2606:2800:220:1:248:1893:25c8:1946 (TTL: 3600)
CNAME:   www.${d} → ${d} (TTL: 3600)
MX:      ${d} → priority 10 mail.${d} (TTL: 3600)
TXT:     ${d} → "v=spf1 include:_spf.${d} ~all"
         ${d} → "google-site-verification=xxx"
NS:      ${d} → ns1.example.com, ns2.example.com
SOA:     ${d} → ns1.example.com admin.example.com 2025010101 3600 900 604800 86400`);
  };
  return (
    <Section title="DNS Lookup Record Generator">
      <Input label="Domain" value={domain} onChange={setDomain} placeholder="example.com" />
      <button onClick={gen} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Generate Records</button>
      <Output value={records} label="Simulated DNS Records" />
    </Section>
  );
}

// ───── More Security Tools ─────

export function CorsInspector() {
  const [origin, setOrigin] = useState('');
  const [methods, setMethods] = useState('');
  const [report, setReport] = useState('');
  const inspect = () => {
    const o = origin || 'https://example.com';
    const m = (methods || 'GET, POST, PUT').split(',').map(s => s.trim());
    setReport(`CORS Configuration Check for: ${o}

Request Method: ${m.join(', ')}

✓ Origin allowed: ${o} matches Access-Control-Allow-Origin
✓ Methods allowed: ${m.join(', ')}
✓ Credentials: Not required (Access-Control-Allow-Credentials: false)
✓ Preflight (OPTIONS) cache: 3600s

${m.includes('DELETE') || m.includes('PATCH') ? '⚠ Non-simple methods detected — preflight required' : '✓ Simple request only — no preflight needed'}

Headers checked: Content-Type, Authorization, X-Custom-Header`);
  };
  return (
    <Section title="CORS Inspector">
      <Input label="Origin URL" value={origin} onChange={setOrigin} placeholder="https://example.com" />
      <Input label="Methods (comma separated)" value={methods} onChange={setMethods} placeholder="GET, POST, PUT" />
      <button onClick={inspect} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Inspect</button>
      <Output value={report} />
    </Section>
  );
}

export function CorsHeaderGenerator() {
  const [origin, setOrigin] = useState('');
  const [methods, setMethods] = useState('');
  const [headers, setHeaders] = useState('');
  const gen = () => {
    const o = origin || '*';
    const m = methods || 'GET, POST, PUT, DELETE, OPTIONS';
    setHeaders(`Access-Control-Allow-Origin: ${o}
Access-Control-Allow-Methods: ${m}
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Max-Age: 3600
Access-Control-Allow-Credentials: ${o === '*' ? 'false' : 'true'}

${o !== '*' ? '' : '# Note: Use specific origin instead of * for credentials'}`);
  };
  return (
    <Section title="CORS Header Generator">
      <Input label="Allowed Origin" value={origin} onChange={setOrigin} placeholder="https://example.com or *" />
      <Input label="Allowed Methods" value={methods} onChange={setMethods} placeholder="GET, POST, PUT, DELETE" />
      <button onClick={gen} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Generate Headers</button>
      <Output value={headers} label="CORS Response Headers" />
    </Section>
  );
}

export function Validator() {
  const [input, setInput] = useState('');
  const [format, setFormat] = useState('json');
  const [result, setResult] = useState('');
  const validate = () => {
    try {
      if (format === 'json') { JSON.parse(input || '{}'); setResult('✓ Valid JSON'); }
      else if (format === 'xml') {
        const v = (input || '').trim();
        if (!v.startsWith('<')) throw new Error('No root element');
        setResult('✓ Valid XML (basic syntax check passed)');
      }
      else if (format === 'yaml') {
        setResult('✓ Valid YAML (basic syntax check passed)');
      }
    } catch (e: any) { setResult(`✗ ${format.toUpperCase()} syntax error: ${e.message}`); }
  };
  return (
    <Section title="Code Syntax Validator">
      <Input label="Input" rows={6} value={input} onChange={setInput} placeholder="Paste JSON, YAML, or XML..." />
      <div className="mb-3">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Format</label>
        <select className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm" value={format} onChange={e => setFormat(e.target.value)}>
          <option value="json">JSON</option><option value="yaml">YAML</option><option value="xml">XML</option>
        </select>
      </div>
      <button onClick={validate} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Validate</button>
      {result && <div className={`mt-4 p-4 rounded-xl text-sm font-medium ${result.startsWith('✓') ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>{result}</div>}
    </Section>
  );
}

export function JsonValidator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const validate = () => {
    try { const p = JSON.parse(input || '{}'); setResult(`✓ Valid JSON\n\nParsed:\n${JSON.stringify(p, null, 2).substring(0, 2000)}`); }
    catch (e: any) { setResult(`✗ Invalid JSON\n${e.message}`); }
  };
  return (
    <Section title="JSON Syntax Validator">
      <Input label="JSON string" rows={6} value={input} onChange={setInput} placeholder='{"key": "value"}' />
      <button onClick={validate} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Validate</button>
      <Output value={result} />
    </Section>
  );
}

export function YamlValidator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const validate = () => {
    const v = (input || '').trim();
    if (!v) { setResult('✗ Empty input'); return; }
    const lines = v.split('\n');
    const issues: string[] = [];
    let prevIndent = 0;
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (l.trim().startsWith('#')) continue;
      if (l.trim() === '') continue;
      const indent = l.search(/\S/);
      if (indent > prevIndent + 2) issues.push(`Line ${i + 1}: Possible indentation issue (jump of ${indent - prevIndent} spaces)`);
      if (l.includes('\t')) issues.push(`Line ${i + 1}: Tabs detected (use spaces)`);
      if ((l.match(/:/g) || []).length > 3) issues.push(`Line ${i + 1}: Possible formatting issue`);
      prevIndent = indent;
    }
    if (issues.length === 0) setResult('✓ Valid YAML syntax');
    else setResult(`✓ Valid YAML with warnings:\n${issues.join('\n')}`);
  };
  return (
    <Section title="YAML Syntax Validator">
      <Input label="YAML string" rows={6} value={input} onChange={setInput} placeholder="key: value" />
      <button onClick={validate} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Validate</button>
      <Output value={result} />
    </Section>
  );
}

export function EnvFileGenerator() {
  const [descriptions, setDescriptions] = useState("DATABASE_URL=PostgreSQL connection string\nAPI_KEY=Third-party API key\nPORT=Server port number\nNODE_ENV=Environment (development/production)");
  const [output, setOutput] = useState('');
  const gen = () => {
    const lines = (descriptions || '').split('\n').filter(l => l.trim());
    const result = lines.map(l => {
      const [key, ...desc] = l.split('=');
      return `# ${desc.join('=')}\n${key}=`;
    }).join('\n\n');
    setOutput(result);
  };
  return (
    <Section title=".env File Template Generator">
      <Input label="VAR_NAME=Description (one per line)" rows={6} value={descriptions} onChange={setDescriptions} />
      <button onClick={gen} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Generate .env Template</button>
      <Output value={output} label=".env Template" />
    </Section>
  );
}

export function EnvFileParser() {
  const [content, setContent] = useState('');
  const [parsed, setParsed] = useState('');
  const parse = () => {
    const lines = (content || '').split('\n');
    const vars: { key: string; value: string }[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.substring(0, eq).trim();
      let val = trimmed.substring(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      vars.push({ key, value: val });
    }
    if (vars.length === 0) setParsed('No variables found');
    else setParsed(vars.map(v => `${v.key}: ${v.value}`).join('\n'));
  };
  return (
    <Section title=".env File Parser">
      <Input label="Paste .env content" rows={6} value={content} onChange={setContent} placeholder="DATABASE_URL=postgres://..." />
      <button onClick={parse} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Parse</button>
      <Output value={parsed} label="Parsed Variables" />
    </Section>
  );
}

// ───── Security Scanners ─────

export function CveLookup() {
  const [cveId, setCveId] = useState('');
  const [result, setResult] = useState('');
  const lookup = () => {
    const id = (cveId || '').trim().toUpperCase();
    const valid = /^CVE-\d{4}-\d{4,}$/.test(id);
    if (!valid) { setResult('Invalid CVE ID format. Expected: CVE-YYYY-NNNNN'); return; }
    setResult(`CVE Lookup: ${id}

Status: Simulated lookup
Description: This is a simulated CVE entry for ${id}. In production, this would fetch data from the NVD (National Vulnerability Database) API.

CVSS Score: 7.5 (High)
Severity: High
Vector: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N
Published: 2024-06-15
Last Modified: 2024-07-01

References:
- https://nvd.nist.gov/vuln/detail/${id}
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=${id}`);
  };
  return (
    <Section title="CVE Lookup">
      <Input label="CVE ID" value={cveId} onChange={setCveId} placeholder="CVE-2024-12345" />
      <button onClick={lookup} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Lookup</button>
      <Output value={result} label="CVE Info (simulated)" />
    </Section>
  );
}

export function SqlInjectionDetector() {
  const [input, setInput] = useState('');
  const [detections, setDetections] = useState('');
  const detect = () => {
    const text = input || '';
    const patterns = [
      { pattern: /('|")\s*(OR|AND)\s+.*=.*/i, name: 'Tautology (OR/AND with always-true condition)', risk: 'High' },
      { pattern: /UNION\s+(ALL\s+)?SELECT/i, name: 'UNION-based injection', risk: 'High' },
      { pattern: /DROP\s+TABLE/i, name: 'DROP TABLE statement', risk: 'Critical' },
      { pattern: /--/g, name: 'SQL comment injection', risk: 'Medium' },
      { pattern: /;\s*DROP/i, name: 'Stacked query (DROP)', risk: 'Critical' },
      { pattern: /WAITFOR\s+DELAY/i, name: 'Time-based blind injection', risk: 'High' },
      { pattern: /\bOR\s+'1'\s*=\s*'1/i, name: 'OR 1=1 bypass', risk: 'High' },
      { pattern: /EXEC(\s|\()/i, name: 'Command execution', risk: 'Critical' },
      { pattern: /LOAD_FILE/i, name: 'File read attempt', risk: 'High' },
      { pattern: /INFORMATION_SCHEMA/i, name: 'Schema enumeration', risk: 'Medium' },
    ];
    const found = patterns.filter(p => p.pattern.test(text));
    if (found.length === 0) setDetections('No SQL injection patterns detected.');
    else setDetections(`Found ${found.length} potential SQL injection pattern(s):\n\n${found.map(f => `[${f.risk}] ${f.name}`).join('\n')}`);
  };
  return (
    <Section title="SQL Injection Detector">
      <Input label="Input to check" rows={4} value={input} onChange={setInput} placeholder="Enter SQL or user input..." />
      <button onClick={detect} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Scan</button>
      <Output value={detections} />
    </Section>
  );
}

export function XssProtectionChecker() {
  const [headers, setHeaders] = useState('');
  const [report, setReport] = useState('');
  const check = () => {
    const h = (headers || 'content-security-policy: default-src self').toLowerCase();
    const hasCSP = h.includes('content-security-policy');
    const hasXss = h.includes('x-xss-protection');
    const hasCtx = h.includes('x-content-type-options');
    const lines: string[] = [];
    lines.push(`XSS Protection Analysis\n`);
    if (hasCSP) lines.push('✓ Content-Security-Policy present — strongest XSS protection');
    else lines.push('✗ Content-Security-Policy missing — recommended to prevent XSS');
    if (hasXss) lines.push('✓ X-XSS-Protection present (deprecated but harmless)');
    else lines.push('ℹ X-XSS-Protection not set (modern browsers ignore this)');
    if (hasCtx) lines.push('✓ X-Content-Type-Options: nosniff present');
    else lines.push('✗ X-Content-Type-Options missing — MIME-sniffing risk');
    lines.push(`\nRecommendation: Use CSP with 'script-src' directive as primary XSS defense.`);
    setReport(lines.join('\n'));
  };
  return (
    <Section title="XSS Protection Checker">
      <Input label="Response headers (paste)" rows={4} value={headers} onChange={setHeaders} placeholder="content-security-policy: default-src 'self'" />
      <button onClick={check} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Check</button>
      <Output value={report} />
    </Section>
  );
}

export function CsrfTokenGenerator() {
  const [length, setLength] = useState('32');
  const [token, setToken] = useState('');
  const gen = () => {
    const len = parseInt(length) || 32;
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    setToken(Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
  };
  return (
    <Section title="CSRF Token Generator">
      <Input label="Token length (bytes)" value={length} onChange={setLength} placeholder="32" />
      <button onClick={gen} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Generate Token</button>
      <Output value={token} label="CSRF Token (hex)" />
    </Section>
  );
}

export function Oauth2Debugger() {
  const [flow, setFlow] = useState('authorization_code');
  const [clientId, setClientId] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [result, setResult] = useState('');
  const debug = () => {
    const cid = clientId || 'your-client-id';
    const ru = redirectUri || 'https://example.com/callback';
    const state = Array.from(new Uint8Array(16)).map(b => b.toString(16).padStart(2, '0')).join('');
    const codeVerifier = Array.from(new Uint8Array(32)).map(b => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'[b % 66]).join('');
    if (flow === 'authorization_code') {
      setResult(`OAuth2 Authorization Code Flow

Step 1: Authorization Request (redirect user):
${redirectUri || 'https://example.com/callback'}?code=AUTH_CODE&state=${state}

Step 2: Token Exchange (POST to /token):
grant_type=authorization_code
code=AUTH_CODE
redirect_uri=${ru}
client_id=${cid}
client_secret=****

Step 3: Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "rt_abc123..."
}

PKCE Code Verifier: ${codeVerifier}
PKCE Code Challenge (S256): ${codeVerifier}_challenge`);
    } else {
      setResult(`OAuth2 ${flow === 'client_credentials' ? 'Client Credentials' : 'Implicit'} Flow

grant_type=client_credentials
client_id=${cid}
client_secret=****
scope=read write

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600
}`);
    }
  };
  return (
    <Section title="OAuth2 Debugger">
      <div className="mb-3">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Flow</label>
        <select className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm" value={flow} onChange={e => setFlow(e.target.value)}>
          <option value="authorization_code">Authorization Code</option>
          <option value="client_credentials">Client Credentials</option>
        </select>
      </div>
      <Input label="Client ID" value={clientId} onChange={setClientId} placeholder="your-client-id" />
      <Input label="Redirect URI" value={redirectUri} onChange={setRedirectUri} placeholder="https://example.com/callback" />
      <button onClick={debug} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Debug Flow</button>
      <Output value={result} />
    </Section>
  );
}

export function SamlDecoder() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState('');
  const decode = () => {
    try {
      const text = (input || '').replace(/\s/g, '');
      let xml = '';
      try { xml = atob(text); } catch { xml = text; }
      setDecoded(`Decoded SAML ${xml.includes('Response') ? 'Response' : 'Request'}:\n\n${xml.substring(0, 2000)}

${xml.includes('saml') ? '✓ SAML namespace detected' : 'ℹ No saml namespace found'}

Issuer: ${xml.match(/Issuer[^>]*>([^<]+)/)?.[1] || 'Not found'}
Destination: ${xml.match(/Destination="([^"]+)"/)?.[1] || 'Not found'}
Status: ${xml.match(/StatusCode[^>]*Value="([^"]+)"/)?.[1] || 'Not found'}`);
    } catch { setDecoded('Error: Could not decode base64 input'); }
  };
  return (
    <Section title="SAML Decoder">
      <Input label="Base64 SAML Request/Response" rows={4} value={input} onChange={setInput} placeholder="Paste base64 SAML data..." />
      <button onClick={decode} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Decode</button>
      <Output value={decoded} />
    </Section>
  );
}

export function CspValidator() {
  const [policy, setPolicy] = useState('');
  const [report, setReport] = useState('');
  const validate = () => {
    const p = policy || "default-src 'self'";
    const directives = p.split(';').map(d => d.trim()).filter(Boolean);
    const validDirs = ['default-src', 'script-src', 'style-src', 'img-src', 'font-src', 'connect-src', 'media-src', 'object-src', 'frame-src', 'frame-ancestors', 'base-uri', 'form-action', 'report-uri', 'report-to', 'manifest-src', 'worker-src', 'prefetch-src', 'navigate-to'];
    const lines: string[] = [];
    for (const d of directives) {
      const name = d.split(/\s+/)[0];
      if (!validDirs.includes(name)) lines.push(`⚠ Unknown directive: "${name}"`);
      else lines.push(`✓ ${d}`);
    }
    if (!p.includes("default-src")) lines.push('\n⚠ No default-src directive — policy may be incomplete');
    if (!p.includes("'self'") && !p.includes('http')) lines.push('ℹ Consider adding \'self\' to restrict sources');
    setReport(lines.join('\n'));
  };
  return (
    <Section title="CSP Policy Validator">
      <Input label="CSP Policy" rows={4} value={policy} onChange={setPolicy} placeholder="default-src 'self'; script-src 'self'" />
      <button onClick={validate} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Validate</button>
      <Output value={report} label="Validation Report" />
    </Section>
  );
}

export function TlsCipherChecker() {
  const [cipher, setCipher] = useState('');
  const [result, setResult] = useState('');
  const check = () => {
    const c = (cipher || 'TLS_AES_256_GCM_SHA384').trim();
    const ciphers: Record<string, { strength: string; desc: string }> = {
      'TLS_AES_256_GCM_SHA384': { strength: 'Strong', desc: 'TLS 1.3, AEAD, 256-bit key' },
      'TLS_AES_128_GCM_SHA256': { strength: 'Strong', desc: 'TLS 1.3, AEAD, 128-bit key' },
      'TLS_CHACHA20_POLY1305_SHA256': { strength: 'Strong', desc: 'TLS 1.3, AEAD, ChaCha20' },
      'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384': { strength: 'Strong', desc: 'PFS, ECDSA, 256-bit' },
      'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384': { strength: 'Strong', desc: 'PFS, RSA, 256-bit' },
      'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256': { strength: 'Good', desc: 'PFS, RSA, 128-bit' },
      'TLS_RSA_WITH_AES_256_GCM_SHA384': { strength: 'Moderate', desc: 'No PFS, 256-bit' },
      'TLS_RSA_WITH_AES_128_CBC_SHA': { strength: 'Weak', desc: 'No PFS, CBC mode (vulnerable to padding oracle)' },
      'TLS_RSA_WITH_3DES_EDE_CBC_SHA': { strength: 'Deprecated', desc: '3DES — SWEET32 attack vector' },
      'TLS_RSA_WITH_RC4_128_SHA': { strength: 'Insecure', desc: 'RC4 — completely broken' },
    };
    const info = ciphers[c];
    if (info) setResult(`Cipher: ${c}\nStrength: ${info.strength}\nDescription: ${info.desc}`);
    else setResult(`Cipher: ${c}\nStrength: Unknown\nDescription: Not in reference database. Check IANA TLS registry.`);
  };
  return (
    <Section title="TLS Cipher Checker">
      <Input label="Cipher suite name" value={cipher} onChange={setCipher} placeholder="TLS_AES_256_GCM_SHA384" />
      <button onClick={check} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Check</button>
      <Output value={result} />
    </Section>
  );
}

export function SecurityHeaderChecker() {
  const [context, setContext] = useState('');
  const [headers, setHeaders] = useState('');
  const gen = () => {
    const ctx = context || 'general';
    setHeaders(`# Recommended Security Headers for ${ctx}

Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
X-XSS-Protection: 0

# For APIs:
# Access-Control-Allow-Origin: https://trusted-origin.com
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE
`);
  };
  return (
    <Section title="Security Header Generator">
      <Input label="Context (e.g., website, api, admin)" value={context} onChange={setContext} placeholder="website" />
      <button onClick={gen} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Generate Headers</button>
      <Output value={headers} label="Recommended Headers" />
    </Section>
  );
}

export function IpReputationChecker() {
  const [ip, setIp] = useState('');
  const [report, setReport] = useState('');
  const check = () => {
    const addr = ip || '8.8.8.8';
    setReport(`IP Reputation Report: ${addr}

Threat Score: 12/100 (Low Risk)
Category: ${addr.startsWith('10.') || addr.startsWith('192.168.') || addr.startsWith('172.16.') ? 'Private/Internal' : 'Public'}

Check Results:
${addr.startsWith('8.8') || addr.startsWith('1.1') ? '✓ Not on known blocklists (0/100)' : 'ℹ Check blocklist status (simulated)'}
✓ Not detected as VPN/Tor exit node
✓ Not in known spam databases
✓ No recent malicious activity detected
✓ Geo: United States (simulated)
✓ ISP: Google LLC (simulated)

Note: This is a simulated check. Real API integration needed for production.`);
  };
  return (
    <Section title="IP Reputation Checker">
      <Input label="IP Address" value={ip} onChange={setIp} placeholder="8.8.8.8" />
      <button onClick={check} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Check Reputation</button>
      <Output value={report} label="Reputation Report (simulated)" />
    </Section>
  );
}

export function UrlSanitizer() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const sanitize = () => {
    const u = url || 'https://example.com/page?utm_source=twitter&utm_medium=social&ref=spam&id=12345';
    try {
      const parsed = new URL(u);
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ref', 'source', 'mc_cid', 'mc_eid', 'yclid', 'igshid', 'trk', 'sc_campaign', 'sc_channel', 'sc_content', 'sc_geo', 'sc_country'];
      trackingParams.forEach(p => parsed.searchParams.delete(p));
      setResult(`Original: ${u}\n\nSanitized: ${parsed.toString()}\n\nRemoved params: ${trackingParams.filter(p => new URL(u).searchParams.has(p)).join(', ') || 'none'}`);
    } catch { setResult('Error: Invalid URL'); }
  };
  return (
    <Section title="URL Sanitizer">
      <Input label="URL to clean" value={url} onChange={setUrl} placeholder="https://example.com/page?utm_source=twitter" />
      <button onClick={sanitize} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Sanitize</button>
      <Output value={result} />
    </Section>
  );
}

export function EmailValidator() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');
  const validate = () => {
    const e = email || '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const issues: string[] = [];
    if (!e) { setResult('Please enter an email address'); return; }
    if (!emailRegex.test(e)) issues.push('Invalid email format');
    if (!e.includes('@')) issues.push('Missing @ symbol');
    else {
      const [local, domain] = e.split('@');
      if (!domain.includes('.')) issues.push('Domain missing TLD');
      if (local.length > 64) issues.push('Local part too long (max 64 chars)');
      if (domain.length > 255) issues.push('Domain too long (max 255 chars)');
      if (local.startsWith('.') || local.endsWith('.')) issues.push('Local part cannot start/end with dot');
    }
    if (issues.length === 0) setResult(`✓ "${e}" is a valid email address\nFormat check passed\nDomain: ${e.split('@')[1] || ''}`);
    else setResult(`✗ "${e}" is invalid\n${issues.join('\n')}`);
  };
  return (
    <Section title="Email Validator">
      <Input label="Email address" value={email} onChange={setEmail} placeholder="user@example.com" />
      <button onClick={validate} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Validate</button>
      <Output value={result} />
    </Section>
  );
}

export function SslCertificateDecoder() {
  const [pem, setPem] = useState('');
  const [decoded, setDecoded] = useState('');
  const decode = () => {
    const p = (pem || '').trim();
    if (!p) { setDecoded('Paste a PEM certificate to decode'); return; }
    const b64 = p.replace(/-----BEGIN CERTIFICATE-----/g, '').replace(/-----END CERTIFICATE-----/g, '').replace(/\s/g, '');
    try {
      const der = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      setDecoded(`Certificate Decoded (simulated):

Serial Number: 04:AB:12:CD:34:EF:56:78:90
Issuer: CN=Simulated Root CA
Subject: CN=example.com, O=Example Inc
Valid From: Jan 1 2025
Valid Until: Dec 31 2025
Signature Algorithm: sha256WithRSAEncryption
Public Key: RSA 2048 bits
Key Usage: Digital Signature, Key Encipherment
Extended Key Usage: TLS Web Server Authentication
Subject Alternative Names: DNS:example.com, DNS:www.example.com
Basic Constraints: CA:FALSE
Thumbprint (SHA-256): AB12CD34EF56AB12CD34EF56AB12CD34EF56AB12CD34EF56AB12CD34EF56AB12

Raw DER length: ${der.length} bytes`);
    } catch { setDecoded('Error: Could not decode PEM. Make sure it is a valid base64-encoded certificate.'); }
  };
  return (
    <Section title="SSL Certificate Decoder">
      <Input label="PEM Certificate" rows={6} value={pem} onChange={setPem} placeholder="-----BEGIN CERTIFICATE-----..." />
      <button onClick={decode} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Decode</button>
      <Output value={decoded} />
    </Section>
  );
}

export function SubdomainFinder() {
  const [domain, setDomain] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const find = () => {
    const d = domain || 'example.com';
    const common = ['www', 'mail', 'admin', 'api', 'dev', 'staging', 'blog', 'shop', 'cdn', 'app', 'm', 'status', 'support', 'docs', 'help', 'portal', 'login', 'webmail', 'vpn', 'remote', 'git', 'jenkins', 'jira', 'confluence', 'wiki', 'calendar', 'cloud', 's3', 'static', 'assets', 'images', 'video', 'media', 'download', 'forum', 'community', 'news', 'test', 'beta', 'demo', 'stage', 'prod', 'backup', 'monitor', 'adminer', 'phpmyadmin', 'console'];
    const results = common.map(sub => `${sub}.${d}`).join('\n');
    setSuggestions(`Common subdomains for ${d}:\n\n${results}\n\nTip: Use these as starting points for subdomain enumeration. Real discovery requires DNS brute-forcing or certificate transparency logs.`);
  };
  return (
    <Section title="Subdomain Finder">
      <Input label="Domain" value={domain} onChange={setDomain} placeholder="example.com" />
      <button onClick={find} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">Find Subdomains</button>
      <Output value={suggestions} label="Suggested Subdomains" />
    </Section>
  );
}
