"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

type Tab = 'network' | 'sse' | 'crypto' | 'time';

const TABS: { key: Tab; label: string }[] = [
  { key: 'network', label: 'Network' },
  { key: 'sse', label: 'Formatters' },
  { key: 'crypto', label: 'Crypto & Proto' },
  { key: 'time', label: 'Time Tools' },
];

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 ${className}`}>{children}</div>;
}

export default function NetworkUtilityKit() {
  const [tab, setTab] = useState<Tab>('network');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${tab === t.key ? 'bg-blue-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}>{t.label}</button>
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
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Port Number Lookup</h4>
        <input type="number" value={port} onChange={e => setPort(e.target.value)} min={1} max={65535} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm mb-2" />
        <button onClick={lookupPort} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Lookup</button>
        {portInfo && <p className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-mono">{portInfo}</p>}
      </Card>
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">User-Agent Parser</h4>
        <textarea rows={3} value={ua} onChange={e => setUa(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={parseUA} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Parse</button>
        {uaInfo && <textarea readOnly rows={3} value={uaInfo} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
      </Card>
      <Card className="md:col-span-2"><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Query String Parser</h4>
        <input type="text" value={qs} onChange={e => setQs(e.target.value)} placeholder="?key=value&foo=bar" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono" />
        <button onClick={parseQueryString} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Parse</button>
        {qsParsed && <textarea readOnly rows={5} value={qsParsed} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
      </Card>
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
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">SSE Event Formatter</h4>
        <textarea rows={4} value={sseEvent} onChange={e => setSseEvent(e.target.value)} placeholder="SSE event text" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={formatSSE} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Format</button>
        {sseFormatted && <textarea readOnly rows={5} value={sseFormatted} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
      </Card>
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Rate Limit Header Parser</h4>
        <textarea rows={4} value={rlHeader} onChange={e => setRlHeader(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={parseRateLimit} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Parse</button>
        {rlParsed && <textarea readOnly rows={6} value={rlParsed} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
      </Card>
      <Card className="md:col-span-2"><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Pricing Tier Builder</h4>
        <textarea rows={4} value={pricingTiers} onChange={e => setPricingTiers(e.target.value)} placeholder='[{"name": "Free", "price": 0, "users": 1}]' className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={buildPricing} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Build</button>
        {pricingOut && <textarea readOnly rows={6} value={pricingOut} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
      </Card>
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
        });
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
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">TOTP Generator</h4>
        <input type="text" value={totpSecret} onChange={e => setTotpSecret(e.target.value)} placeholder="Base32 secret" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono mb-2" />
        <button onClick={generateTotp} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate TOTP</button>
        {totpCode && <p className="mt-2 text-center text-2xl font-bold tracking-widest text-blue-600 dark:text-blue-400">{totpCode}</p>}
      </Card>
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">SSH Key Generator</h4>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <select value={sshType} onChange={e => setSshType(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm">
            <option value="RSA">RSA</option><option value="ECDSA">ECDSA</option><option value="Ed25519">Ed25519</option>
          </select>
          <input type="number" value={sshBits} onChange={e => setSshBits(e.target.value)} min={1024} max={8192} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={generateSshKey} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate</button>
        {sshKey && <textarea readOnly rows={8} value={sshKey} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
      </Card>
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
    } catch { toast.error('Invalid timezone (use IANA names like America/New_York)'); }
  };

  const zones = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Asia/Dubai', 'Australia/Sydney', 'Pacific/Auckland'];

  const worldClock = () => {
    const now = new Date();
    const lines = zones.map(z => `${z}: ${now.toLocaleString('en-US', { timeZone: z, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}`);
    setTzResult(lines.join('\n'));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Timestamp ↔ Date</h4>
        <div className="space-y-2">
          <input type="number" value={ts} onChange={e => setTs(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono" />
          <button onClick={timestampToDate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">→ Date</button>
          {dateFromTs && <p className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-mono">{dateFromTs}</p>}
          <input type="datetime-local" value={dateStr} onChange={e => setDateStr(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
          <button onClick={dateToTimestamp} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">→ Timestamp</button>
          {tsFromDate && <p className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-mono">{tsFromDate}</p>}
        </div>
      </Card>
      <Card><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Time Zone Converter</h4>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <select value={tzFrom} onChange={e => setTzFrom(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm">{zones.map(z => <option key={z} value={z}>{z}</option>)}</select>
          <span className="flex items-center justify-center text-zinc-400">→</span>
          <select value={tzTo} onChange={e => setTzTo(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm">{zones.map(z => <option key={z} value={z}>{z}</option>)}</select>
        </div>
        <button onClick={convertTz} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert</button>
        {tzResult && <textarea readOnly rows={4} value={tzResult} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
      </Card>
      <Card className="md:col-span-2"><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">World Clock</h4>
        <button onClick={worldClock} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Show World Clock</button>
        {tzResult && tzResult.includes('UTC') && <textarea readOnly rows={zones.length + 1} value={tzResult} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
      </Card>
    </div>
  );
}
