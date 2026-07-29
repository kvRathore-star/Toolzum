"use client";
import React, { useState, useCallback } from 'react';

const PORTS: Record<number, string> = {
  20: 'FTP Data', 21: 'FTP Control', 22: 'SSH', 23: 'Telnet', 25: 'SMTP',
  53: 'DNS', 80: 'HTTP', 110: 'POP3', 143: 'IMAP', 443: 'HTTPS',
  465: 'SMTPS', 587: 'SMTP Submission', 993: 'IMAPS', 995: 'POP3S',
  1433: 'MSSQL', 1521: 'Oracle DB', 3306: 'MySQL', 3389: 'RDP',
  5432: 'PostgreSQL', 5900: 'VNC', 6379: 'Redis', 8080: 'HTTP Alt',
  8443: 'HTTPS Alt', 27017: 'MongoDB',
};

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, []);
  return { copied, copy };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full bg-[var(--bg-overlay)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
      {children}
    </div>
  );
}

export function PortNumberLookup() {
  const [port, setPort] = useState('443');
  const [result, setResult] = useState('');
  const lookup = () => {
    const num = parseInt(port);
    if (num < 1 || num > 65535) { setResult('Invalid port number (1-65535)'); return; }
    const service = PORTS[num] || 'Unknown / ephemeral';
    const category = num < 1024 ? 'Well-known' : num < 49152 ? 'Registered' : 'Dynamic/Private';
    setResult(`Port ${num}: ${service} (${category})`);
  };
  return (
    <Section title="Port Number Lookup">
      <div className="space-y-3">
        <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Port Number</label><input type="number" value={port} onChange={e => setPort(e.target.value)} min={1} max={65535} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
        <button onClick={lookup} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Lookup</button>
        {result && <pre className="p-4 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono whitespace-pre-wrap">{result}</pre>}
      </div>
    </Section>
  );
}

export function UserAgentParser() {
  const [ua, setUa] = useState('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  const [result, setResult] = useState('');
  const parse = () => {
    const isChrome = ua.includes('Chrome/');
    const isFirefox = ua.includes('Firefox/');
    const isSafari = ua.includes('Safari/') && !isChrome;
    const isEdge = ua.includes('Edg/');
    const osMatch = ua.match(/\(([^)]+)\)/);
    const browser = isEdge ? 'Edge' : isFirefox ? 'Firefox' : isChrome ? 'Chrome' : isSafari ? 'Safari' : 'Unknown';
    const version = ua.match(/(Chrome|Firefox|Safari|Edg)\/([\d.]+)/)?.[2] || 'Unknown';
    setResult(`Browser: ${browser} ${version}\nOS: ${osMatch ? osMatch[1] : 'Unknown'}`);
  };
  return (
    <Section title="User-Agent Parser">
      <div className="space-y-3">
        <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">User-Agent String</label><textarea value={ua} onChange={e => setUa(e.target.value)} rows={3} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 resize-y" /></div>
        <button onClick={parse} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Parse</button>
        {result && <pre className="p-4 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono whitespace-pre-wrap">{result}</pre>}
      </div>
    </Section>
  );
}

export function QueryStringParser() {
  const [qs, setQs] = useState('?name=Alice&age=30&active=true&tags=admin,user');
  const [result, setResult] = useState('');
  const { copied, copy } = useCopy();
  const parse = () => {
    const clean = qs.startsWith('?') ? qs.slice(1) : qs;
    const params: Record<string, string> = {};
    clean.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) params[decodeURIComponent(k)] = v ? decodeURIComponent(v) : '';
    });
    setResult(JSON.stringify(params, null, 2));
  };
  return (
    <Section title="Query String Parser">
      <div className="space-y-3">
        <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Query String</label><input type="text" value={qs} onChange={e => setQs(e.target.value)} placeholder="?key=value&foo=bar" className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
        <button onClick={parse} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Parse</button>
        {result && <div className="mt-4"><pre className="p-4 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono whitespace-pre-wrap">{result}</pre><button onClick={() => copy(result)} className="mt-2 px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-xl text-sm font-medium transition-colors">{copied ? 'Copied!' : 'Copy'}</button></div>}
      </div>
    </Section>
  );
}

export function SseEventFormatter() {
  const [input, setInput] = useState('data: {"message": "hello"}\nevent: update\nid: 1\n\n');
  const [result, setResult] = useState('');
  const { copied, copy } = useCopy();
  const format = () => {
    const lines = input.split('\n');
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
    setResult(JSON.stringify(parsed, null, 2));
  };
  return (
    <Section title="SSE Event Formatter">
      <div className="space-y-3">
        <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">SSE Event Text</label><textarea value={input} onChange={e => setInput(e.target.value)} rows={6} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 resize-y" /></div>
        <button onClick={format} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Format</button>
        {result && <div className="mt-4"><pre className="p-4 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono whitespace-pre-wrap">{result}</pre><button onClick={() => copy(result)} className="mt-2 px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-xl text-sm font-medium transition-colors">{copied ? 'Copied!' : 'Copy'}</button></div>}
      </div>
    </Section>
  );
}

export function RateLimitHeaderParser() {
  const [headers, setHeaders] = useState('X-RateLimit-Limit: 1000\nX-RateLimit-Remaining: 742\nX-RateLimit-Reset: 1721145600\nRetry-After: 30');
  const [result, setResult] = useState('');
  const parse = () => {
    const lines = headers.split('\n');
    const parsed: Record<string, string> = {};
    lines.forEach(line => {
      const [k, ...v] = line.split(': ');
      if (k) parsed[k.trim()] = v.join(': ').trim();
    });
    const limit = parseInt(parsed['X-RateLimit-Limit']);
    const remaining = parseInt(parsed['X-RateLimit-Remaining']);
    const reset = parseInt(parsed['X-RateLimit-Reset']);
    const retryAfter = parseInt(parsed['Retry-After']);
    let summary = `Limit: ${limit}\nRemaining: ${remaining}\nUsed: ${limit - remaining}\nReset: ${reset ? new Date(reset * 1000).toLocaleString() : 'N/A'}\nRetry-After: ${retryAfter ? `${retryAfter}s` : 'N/A'}\n`;
    if (limit > 0) summary += `Usage: ${((limit - remaining) / limit * 100).toFixed(1)}%`;
    setResult(summary);
  };
  return (
    <Section title="Rate Limit Header Parser">
      <div className="space-y-3">
        <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Rate Limit Headers</label><textarea value={headers} onChange={e => setHeaders(e.target.value)} rows={5} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 resize-y" /></div>
        <button onClick={parse} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Parse</button>
        {result && <pre className="p-4 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono whitespace-pre-wrap">{result}</pre>}
      </div>
    </Section>
  );
}

export function PricingTierBuilder() {
  const [tiers, setTiers] = useState('[{"name": "Free", "price": 0, "users": 1}, {"name": "Pro", "price": 29, "users": 50}]');
  const [result, setResult] = useState('');
  const build = () => {
    try {
      const parsed = JSON.parse(tiers);
      let out = '';
      parsed.forEach((t: any, i: number) => {
        out += `Tier ${i + 1}: ${t.name}\n  Price: ${t.price === 0 ? 'Free' : `$${t.price}/mo`}\n  Users: ${t.users === Infinity ? 'Unlimited' : t.users}\n`;
        if (t.features) out += `  Features: ${(t.features as string[]).join(', ')}\n`;
        out += '\n';
      });
      setResult(out);
    } catch { setResult('Invalid JSON — check your tier format'); }
  };
  return (
    <Section title="Pricing Tier Builder">
      <div className="space-y-3">
        <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Tiers JSON</label><textarea value={tiers} onChange={e => setTiers(e.target.value)} rows={5} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 resize-y" placeholder='[{"name": "Free", "price": 0, "users": 1}]' /></div>
        <button onClick={build} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Build</button>
        {result && <pre className="p-4 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono whitespace-pre-wrap">{result}</pre>}
      </div>
    </Section>
  );
}
