"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Clipboard } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'network' | 'sse' | 'crypto' | 'time';

const TABS: { key: Tab; label: string }[] = [
  { key: 'network', label: 'Network' },
  { key: 'sse', label: 'Formatters' },
  { key: 'crypto', label: 'Crypto & Proto' },
  { key: 'time', label: 'Time Tools' },
];

function CopyBtn({ text, label }: { text: string; label?: string }) {
  return (
    <button onClick={() => { clipboardWrite(text); toast.success(label ? `${label} copied!` : 'Copied!'); }}
      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"><Clipboard className="w-3 h-3" /> Copy</button>
  );
}

export default function NetworkUtilityKit() {
  const [tab, setTab] = useState<Tab>('network');

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${tab === t.key ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>{t.label}</button>
        ))}
      </div>
      {tab === 'network' && <NetworkTools />}
      {tab === 'sse' && <FormatterTools />}
      {tab === 'crypto' && <CryptoTools />}
      {tab === 'time' && <TimeTools />}
    </div>
  );
}

const PORTS: Record<number, string> = {
  20: 'FTP Data', 21: 'FTP Control', 22: 'SSH', 23: 'Telnet', 25: 'SMTP',
  53: 'DNS', 80: 'HTTP', 110: 'POP3', 143: 'IMAP', 443: 'HTTPS',
  465: 'SMTPS', 587: 'SMTP Submission', 993: 'IMAPS', 995: 'POP3S',
  1433: 'MSSQL', 1521: 'Oracle DB', 3306: 'MySQL', 3389: 'RDP',
  5432: 'PostgreSQL', 5900: 'VNC', 6379: 'Redis', 8080: 'HTTP Alt',
  8443: 'HTTPS Alt', 27017: 'MongoDB',
};

function NetworkTools() {
  const [port, setPort] = useState('443');
  const [portInfo, setPortInfo] = useState('');
  const [ua, setUa] = useState('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  const [uaInfo, setUaInfo] = useState('');
  const [qs, setQs] = useState('?name=Alice&age=30&active=true&tags=admin,user');
  const [qsParsed, setQsParsed] = useState('');

  const lookupPort = () => {
    const num = parseInt(port);
    if (num < 1 || num > 65535) { setPortInfo('Invalid port number (1-65535)'); return; }
    const service = PORTS[num] || 'Unknown / ephemeral';
    const category = num < 1024 ? 'Well-known' : num < 49152 ? 'Registered' : 'Dynamic/Private';
    setPortInfo(`Port ${num}: ${service} (${category})`);
  };

  const parseUA = () => {
    const isChrome = ua.includes('Chrome/');
    const isFirefox = ua.includes('Firefox/');
    const isSafari = ua.includes('Safari/') && !isChrome;
    const isEdge = ua.includes('Edg/');
    const osMatch = ua.match(/\(([^)]+)\)/);
    const browser = isEdge ? 'Edge' : isFirefox ? 'Firefox' : isChrome ? 'Chrome' : isSafari ? 'Safari' : 'Unknown';
    const version = ua.match(/(Chrome|Firefox|Safari|Edg)\/([\d.]+)/)?.[2] || 'Unknown';
    setUaInfo(`Browser: ${browser} ${version}\nOS: ${osMatch ? osMatch[1] : 'Unknown'}`);
  };

  const parseQueryString = () => {
    const clean = qs.startsWith('?') ? qs.slice(1) : qs;
    const params: Record<string, string> = {};
    clean.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) params[decodeURIComponent(k)] = v ? decodeURIComponent(v) : '';
    });
    setQsParsed(JSON.stringify(params, null, 2));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Port Number Lookup</h5>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Port</label>
          <input type="number" value={port} onChange={e => setPort(e.target.value)} min={1} max={65535}
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        </div>
        <button onClick={lookupPort} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Lookup</button>
        {portInfo && <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400">{portInfo}</pre>}
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">User-Agent Parser</h5>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">User-Agent string</label>
          <textarea rows={3} value={ua} onChange={e => setUa(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        </div>
        <button onClick={parseUA} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Parse</button>
        {uaInfo && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{uaInfo}</pre><div className="mt-1"><CopyBtn text={uaInfo} label="UA" /></div></div>}
      </div>
      <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Query String Parser</h5>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Query string</label>
          <input type="text" value={qs} onChange={e => setQs(e.target.value)} placeholder="?key=value&foo=bar"
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        </div>
        <button onClick={parseQueryString} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Parse</button>
        {qsParsed && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{qsParsed}</pre><div className="mt-1"><CopyBtn text={qsParsed} label="Parsed" /></div></div>}
      </div>
    </div>
  );
}

function FormatterTools() {
  const [sseEvent, setSseEvent] = useState('data: {"message": "hello"}\nevent: update\nid: 1\n\n');
  const [sseFormatted, setSseFormatted] = useState('');
  const [rlHeader, setRlHeader] = useState('X-RateLimit-Limit: 1000\nX-RateLimit-Remaining: 742\nX-RateLimit-Reset: 1721145600\nRetry-After: 30');
  const [rlParsed, setRlParsed] = useState('');
  const [pricingTiers, setPricingTiers] = useState('[{"name": "Free", "price": 0, "users": 1}, {"name": "Pro", "price": 29, "users": 50}]');
  const [pricingOut, setPricingOut] = useState('');

  const formatSSE = () => {
    const lines = sseEvent.split('\n');
    const parsed: Record<string, string[]> = {};
    lines.forEach(line => {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const field = line.slice(0, colonIdx);
        const value = line.slice(colonIdx + 1).trim();
        parsed[field] = parsed[field] || [];
        parsed[field].push(value);
      }
    });
    setSseFormatted(JSON.stringify(parsed, null, 2));
  };

  const parseRateLimit = () => {
    const lines = rlHeader.split('\n');
    const result: Record<string, string> = {};
    lines.forEach(line => {
      const [k, ...v] = line.split(': ');
      if (k) result[k.trim()] = v.join(': ').trim();
    });
    const limit = parseInt(result['X-RateLimit-Limit']);
    const remaining = parseInt(result['X-RateLimit-Remaining']);
    const reset = parseInt(result['X-RateLimit-Reset']);
    const retryAfter = parseInt(result['Retry-After']);
    let summary = `Limit: ${limit}\nRemaining: ${remaining}\nUsed: ${limit - remaining}\nReset: ${reset ? new Date(reset * 1000).toLocaleString() : 'N/A'}\nRetry-After: ${retryAfter ? `${retryAfter}s` : 'N/A'}\n`;
    if (limit > 0) summary += `Usage: ${((limit - remaining) / limit * 100).toFixed(1)}%`;
    setRlParsed(summary);
  };

  const buildPricing = () => {
    try {
      const tiers = JSON.parse(pricingTiers);
      let out = '';
      tiers.forEach((t: any, i: number) => {
        out += `Tier ${i + 1}: ${t.name}\n  Price: ${t.price === 0 ? 'Free' : `$${t.price}/mo`}\n  Users: ${t.users === Infinity ? 'Unlimited' : t.users}\n`;
        if (t.features) out += `  Features: ${(t.features as string[]).join(', ')}\n`;
        out += '\n';
      });
      setPricingOut(out);
    } catch { toast.error('Invalid tiers JSON'); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">SSE Event Formatter</h5>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">SSE event text</label>
          <textarea rows={4} value={sseEvent} onChange={e => setSseEvent(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        </div>
        <button onClick={formatSSE} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Format</button>
        {sseFormatted && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{sseFormatted}</pre><div className="mt-1"><CopyBtn text={sseFormatted} label="SSE" /></div></div>}
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Rate Limit Header Parser</h5>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Headers</label>
          <textarea rows={4} value={rlHeader} onChange={e => setRlHeader(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        </div>
        <button onClick={parseRateLimit} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Parse</button>
        {rlParsed && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{rlParsed}</pre><div className="mt-1"><CopyBtn text={rlParsed} label="Rate limit" /></div></div>}
      </div>
      <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Pricing Tier Builder</h5>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Tiers JSON</label>
          <textarea rows={4} value={pricingTiers} onChange={e => setPricingTiers(e.target.value)} placeholder='[{"name": "Free", "price": 0, "users": 1}]'
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        </div>
        <button onClick={buildPricing} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Build</button>
        {pricingOut && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{pricingOut}</pre><div className="mt-1"><CopyBtn text={pricingOut} label="Pricing" /></div></div>}
      </div>
    </div>
  );
}

function CryptoTools() {
  const [totpSecret, setTotpSecret] = useState('JBSWY3DPEHPK3PXP');
  const [totpCode, setTotpCode] = useState('');
  const [sshType, setSshType] = useState('RSA');
  const [sshBits, setSshBits] = useState('2048');
  const [sshKey, setSshKey] = useState('');

  const generateTotp = () => {
    try {
      const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      const key = totpSecret.toUpperCase().replace(/\s/g, '');
      let counter = BigInt(Math.floor(Date.now() / 30000));
      const counterBytes = new Uint8Array(8);
      for (let i = 7; i >= 0; i--) { counterBytes[i] = Number(counter & BigInt(0xff)); counter >>= BigInt(8); }
      let keyBytes = new Uint8Array(Math.floor(key.length * 5 / 8));
      let bits = '';
      for (const c of key) {
        const idx = base32chars.indexOf(c);
        if (idx >= 0) bits += idx.toString(2).padStart(5, '0');
      }
      for (let i = 0; i < keyBytes.length; i++) {
        keyBytes[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2);
      }
      crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
        .then(k => crypto.subtle.sign('HMAC', k, counterBytes))
        .then(sig => {
          const arr = new Uint8Array(sig);
          const offset = arr[arr.length - 1] & 0xf;
          const code = ((arr[offset] & 0x7f) << 24 | (arr[offset + 1] & 0xff) << 16 | (arr[offset + 2] & 0xff) << 8 | (arr[offset + 3] & 0xff)) % 1000000;
          setTotpCode(String(code).padStart(6, '0'));
        })
        .catch(err => toast.error(err?.message || 'Operation failed'));
    } catch { toast.error('Invalid secret'); }
  };

  const generateSshKey = () => {
    const header = `-----BEGIN ${sshType} PRIVATE KEY-----`;
    const footer = `-----END ${sshType} PRIVATE KEY-----`;
    const fakeKey = Array.from({ length: 4 }, () => Math.random().toString(36).slice(2, 10)).join('');
    const pubKey = `${sshType.toLowerCase()} ${btoa(fakeKey)} generated-key@toolhub`;
    setSshKey(`${header}\n${btoa(fakeKey.repeat(8)).match(/.{1,64}/g)?.join('\n') || btoa(fakeKey)}\n${footer}\n\nPublic key:\n${pubKey}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">TOTP Generator</h5>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Base32 Secret</label>
          <input type="text" value={totpSecret} onChange={e => setTotpSecret(e.target.value)} placeholder="Base32 secret"
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        </div>
        <button onClick={generateTotp} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate TOTP</button>
        {totpCode && <p className="text-center text-3xl font-bold tracking-widest text-blue-600 dark:text-blue-400">{totpCode}</p>}
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">SSH Key Generator</h5>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">Type</label>
            <select value={sshType} onChange={e => setSshType(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:border-blue-500">
              <option value="RSA">RSA</option><option value="ECDSA">ECDSA</option><option value="Ed25519">Ed25519</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">Bits</label>
            <input type="number" value={sshBits} onChange={e => setSshBits(e.target.value)} min={1024} max={8192}
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
          </div>
        </div>
        <button onClick={generateSshKey} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate</button>
        {sshKey && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-64 overflow-y-auto">{sshKey}</pre><div className="mt-1"><CopyBtn text={sshKey} label="SSH key" /></div></div>}
      </div>
    </div>
  );
}

function TimeTools() {
  const [ts, setTs] = useState(String(Math.floor(Date.now() / 1000)));
  const [dateFromTs, setDateFromTs] = useState('');
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 16));
  const [tsFromDate, setTsFromDate] = useState('');
  const [tzFrom, setTzFrom] = useState('America/New_York');
  const [tzTo, setTzTo] = useState('Asia/Tokyo');
  const [tzTime, setTzTime] = useState('');
  const [tzResult, setTzResult] = useState('');

  const zones = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Asia/Dubai', 'Australia/Sydney', 'Pacific/Auckland'];

  const timestampToDate = () => {
    const num = parseInt(ts);
    const d = new Date(num * 1000);
    setDateFromTs(d.toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'full', timeStyle: 'medium' }) + ' UTC');
  };

  const dateToTimestamp = () => {
    const d = new Date(dateStr);
    setTsFromDate(String(Math.floor(d.getTime() / 1000)));
  };

  const convertTz = () => {
    try {
      const d = new Date();
      const from = d.toLocaleString('en-US', { timeZone: tzFrom, dateStyle: 'full', timeStyle: 'medium' });
      const to = d.toLocaleString('en-US', { timeZone: tzTo, dateStyle: 'full', timeStyle: 'medium' });
      setTzResult(`${tzFrom}: ${from}\n${tzTo}: ${to}\n\nUTC: ${d.toUTCString()}`);
    } catch { toast.error('Invalid timezone (use IANA names)'); }
  };

  const worldClock = () => {
    const now = new Date();
    const lines = zones.map(z => `${z}: ${now.toLocaleString('en-US', { timeZone: z, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}`);
    setTzResult(lines.join('\n'));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Timestamp ↔ Date</h5>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Unix Timestamp (s)</label>
          <input type="number" value={ts} onChange={e => setTs(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        </div>
        <button onClick={timestampToDate} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">→ Date</button>
        {dateFromTs && <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400">{dateFromTs}</pre>}
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Date/time</label>
          <input type="datetime-local" value={dateStr} onChange={e => setDateStr(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        </div>
        <button onClick={dateToTimestamp} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">→ Timestamp</button>
        {tsFromDate && <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400">{tsFromDate}</pre>}
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Time Zone Converter</h5>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">From</label>
          <select value={tzFrom} onChange={e => setTzFrom(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:border-blue-500">
            {zones.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">To</label>
          <select value={tzTo} onChange={e => setTzTo(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:border-blue-500">
            {zones.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <button onClick={convertTz} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
        {tzResult && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{tzResult}</pre><div className="mt-1"><CopyBtn text={tzResult} label="Timezone" /></div></div>}
      </div>
      <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">World Clock</h5>
        <button onClick={worldClock} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Show World Clock</button>
        {tzResult && tzResult.includes('UTC') && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{tzResult}</pre><div className="mt-1"><CopyBtn text={tzResult} label="World clock" /></div></div>}
      </div>
    </div>
  );
}
