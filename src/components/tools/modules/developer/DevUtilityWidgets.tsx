"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';

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
    <div className="w-full p-6">
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
    setResult('Port ' + num + ': ' + service + ' (' + category + ')');
  };

  const presets = [
    { label: 'HTTP (80)', apply: () => { setPort('80'); lookup(); } },
    { label: 'HTTPS (443)', apply: () => { setPort('443'); lookup(); } },
    { label: 'SSH (22)', apply: () => { setPort('22'); lookup(); } },
    { label: 'DNS (53)', apply: () => { setPort('53'); lookup(); } },
    { label: 'Custom', apply: () => { setPort(''); setResult(''); } },
  ];

  const resultText = result || 'Enter port number to lookup';

  return (
    <CalculatorShell title="Port Number Lookup" result={resultText} onCalculate={lookup} presets={presets} accent="indigo" downloadData={result} downloadFilename="port-lookup.txt">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Port Number</label>
      <input type="number" value={port} onChange={e => setPort(e.target.value)} min={1} max={65535}
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-indigo-500/50" />

      {result && <pre className="p-4 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono whitespace-pre-wrap">{result}</pre>}
    </CalculatorShell>
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
    setResult('Browser: ' + browser + ' ' + version + '\nOS: ' + (osMatch ? osMatch[1] : 'Unknown'));
  };

  const presets = [
    { label: 'Chrome Desktop', apply: () => { setUa('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'); parse(); } },
    { label: 'Firefox Desktop', apply: () => { setUa('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'); parse(); } },
    { label: 'Safari iOS', apply: () => { setUa('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'); parse(); } },
    { label: 'Chrome Android', apply: () => { setUa('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'); parse(); } },
    { label: 'Clear', apply: () => { setUa(''); setResult(''); } },
  ];

  const resultText = result || 'Enter User-Agent string to parse';

  return (
    <CalculatorShell title="User-Agent Parser" result={resultText} onCalculate={parse} presets={presets} accent="purple" downloadData={result} downloadFilename="ua-parse.txt">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">User-Agent String</label>
      <textarea value={ua} onChange={e => setUa(e.target.value)} rows={3} placeholder="Paste User-Agent string..."
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-purple-500/50 resize-y" />

      {result && <pre className="p-4 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono whitespace-pre-wrap">{result}</pre>}
    </CalculatorShell>
  );
}

export function QueryStringParser() {
  const [qs, setQs] = useState('?name=Alice&age=30&active=true&tags=admin,user');
  const [result, setResult] = useState('');

  const parse = () => {
    const clean = qs.startsWith('?') ? qs.slice(1) : qs;
    const params: Record<string, string> = {};
    clean.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) params[decodeURIComponent(k)] = v ? decodeURIComponent(v) : '';
    });
    setResult(JSON.stringify(params, null, 2));
  };

  const presets = [
    { label: 'Simple', apply: () => { setQs('?name=Alice&age=30'); parse(); } },
    { label: 'Array', apply: () => { setQs('?tags=admin&tags=user&tags=guest'); parse(); } },
    { label: 'Nested', apply: () => { setQs('?user[name]=Alice&user[age]=30&user[active]=true'); parse(); } },
    { label: 'Clear', apply: () => { setQs(''); setResult(''); } },
  ];

  const resultText = result || 'Enter query string to parse';

  return (
    <CalculatorShell title="Query String Parser" result={resultText} onCalculate={parse} presets={presets} accent="emerald" downloadData={result} downloadFilename="query-params.json">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Query String</label>
      <input type="text" value={qs} onChange={e => setQs(e.target.value)} placeholder="?key=value&foo=bar"
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/50" />

      {result && <pre className="p-4 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono whitespace-pre-wrap">{result}</pre>}
    </CalculatorShell>
  );
}

export function SseEventFormatter() {
  const [input, setInput] = useState('event: message\ndata: {"text": "Hello World"}\nid: 1\n\nevent: update\ndata: {"status": "online"}\ndata: {"extra": "info"}\nid: 2\n\n');
  const [events, setEvents] = useState<{ type: string; data: string; id: string }[]>([]);
  const [output, setOutput] = useState('');
  const { copied, copy } = useCopy();

  const PRESETS: Record<string, string> = {
    standard: 'event: message\ndata: {"text": "Hello World"}\nid: 1\n\nevent: update\ndata: {"status": "online"}\nid: 2\n\n',
    multiline: 'event: message\ndata: line 1\ndata: line 2\ndata: line 3\nid: 1\n\nevent: notification\ndata: {"title": "Alert"}\ndata: {"body": "Check this out"}\nid: 2\n\n',
  };

  const format = () => {
    const lines = input.split('\n');
    const parsed: { type: string; data: string[]; id: string }[] = [];
    let current: { type: string; data: string[]; id: string } | null = null;

    lines.forEach(line => {
      if (line.trim() === '') {
        if (current) { parsed.push(current); current = null; }
        return;
      }
      if (!current) current = { type: 'message', data: [], id: '' };
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const field = line.slice(0, colonIdx);
        const value = line.slice(colonIdx + 1).trim();
        if (field === 'event') current.type = value;
        else if (field === 'data') current.data.push(value);
        else if (field === 'id') current.id = value;
      }
    });
    if (current) parsed.push(current);

    const formatted = parsed.map(function(ev, i) {
      return 'Event ' + (i + 1) + ':\n  type: ' + ev.type + '\n  id: ' + (ev.id || 'N/A') + '\n  data: ' + ev.data.join('\n        ');
    }).join('\n\n');

    const evList = parsed.map(function(ev) {
      return { type: ev.type, data: ev.data.join('\n'), id: ev.id };
    });
    setEvents(evList);
    setOutput(formatted || 'No events parsed');
  };

  const copyOutput = () => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Events copied!');
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sse-events.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setInput(PRESETS.standard)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Standard SSE</button>
        <button onClick={() => setInput(PRESETS.multiline)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Multi-line data</button>
      </div>
      <Section title="SSE Event Formatter">
        <div className="space-y-3">
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">SSE Event Text</label><textarea value={input} onChange={e => setInput(e.target.value)} rows={6} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50 resize-y" /></div>
          <button onClick={format} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Format</button>

          {events.length > 0 && (
            <div className="space-y-2">
              {events.map(function(ev, i) {
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 text-xs font-bold rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">{ev.type}</span>
                    <span className="text-[var(--text-muted)] text-xs">id: {ev.id || 'N/A'}</span>
                  </div>
                );
              })}
            </div>
          )}

          {output && <div className="mt-4"><pre className="p-4 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono whitespace-pre-wrap">{output}</pre><div className="flex gap-2 mt-2"><button onClick={copyOutput} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg hover:text-[var(--text-primary)] transition-colors">{copied ? 'Copied!' : 'Copy'}</button><button onClick={downloadOutput} className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">Download</button></div></div>}
        </div>
      </Section>
    </div>
  );
}

export function RateLimitHeaderParser() {
  const [headers, setHeaders] = useState('X-RateLimit-Limit: 1000\nX-RateLimit-Remaining: 742\nX-RateLimit-Reset: 1721145600\nRetry-After: 30');
  const [output, setOutput] = useState('');
  const [usagePct, setUsagePct] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState('');
  const { copied, copy } = useCopy();

  const PRESETS: Record<string, string> = {
    github: 'X-RateLimit-Limit: 5000\nX-RateLimit-Remaining: 4965\nX-RateLimit-Reset: 1721145600\nX-RateLimit-Used: 35\nX-RateLimit-Resource: core',
    twitter: 'X-RateLimit-Limit: 300\nX-RateLimit-Remaining: 42\nX-RateLimit-Reset: 1721145600\nRetry-After: 45',
  };

  const parse = () => {
    const lines = headers.split('\n');
    const parsed: Record<string, string> = {};
    lines.forEach(line => {
      const [k, ...v] = line.split(': ');
      if (k) parsed[k.trim()] = v.join(': ').trim();
    });
    const limit = parseInt(parsed['X-RateLimit-Limit']) || 0;
    const remaining = parseInt(parsed['X-RateLimit-Remaining']) || 0;
    const reset = parseInt(parsed['X-RateLimit-Reset']) || 0;
    const retryAfter = parseInt(parsed['Retry-After']) || 0;
    const used = limit - remaining;
    const pct = limit > 0 ? (used / limit * 100) : 0;
    setUsagePct(pct);

    if (reset > 0) {
      const resetDate = new Date(reset * 1000);
      const now = new Date();
      const diffMs = resetDate.getTime() - now.getTime();
      if (diffMs > 0) {
        const mins = Math.floor(diffMs / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        setTimeUntilReset(mins + 'm ' + secs + 's');
      } else {
        setTimeUntilReset('Already passed');
      }
    }

    const barLen = 30;
    const filled = Math.round((pct / 100) * barLen);
    const bar = '█'.repeat(filled) + '░'.repeat(barLen - filled);

    let summary = 'Parsed Rate Limit Headers:\n\n';
    summary += 'Limit:     ' + (limit || 'N/A') + '\n';
    summary += 'Remaining: ' + (remaining || 'N/A') + '\n';
    summary += 'Used:      ' + (used || 'N/A') + '\n';
    summary += 'Reset:     ' + (reset ? new Date(reset * 1000).toLocaleString() : 'N/A') + '\n';
    summary += 'Retry-After: ' + (retryAfter ? retryAfter + 's' : 'N/A') + '\n\n';
    summary += 'Usage: [' + bar + '] ' + pct.toFixed(1) + '%\n';
    if (timeUntilReset) summary += 'Time until reset: ' + timeUntilReset + '\n';
    setOutput(summary);
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
    a.download = 'rate-limit-report.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => { setHeaders(PRESETS.github); setOutput(''); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">GitHub API</button>
        <button onClick={() => { setHeaders(PRESETS.twitter); setOutput(''); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Twitter API</button>
      </div>
      <Section title="Rate Limit Header Parser">
        <div className="space-y-3">
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Rate Limit Headers</label><textarea value={headers} onChange={e => setHeaders(e.target.value)} rows={5} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50 resize-y" /></div>
          <button onClick={parse} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Parse</button>

          {usagePct > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                <span>Usage</span>
                <span>{usagePct.toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div className={'h-full rounded-full transition-all ' + (usagePct > 80 ? 'bg-red-500' : usagePct > 50 ? 'bg-yellow-500' : 'bg-green-500')} style={{ width: Math.min(usagePct, 100) + '%' }} />
              </div>
              {timeUntilReset && <p className="text-xs text-[var(--text-muted)] mt-1">Reset in: {timeUntilReset}</p>}
            </div>
          )}

          {output && <div className="mt-4"><pre className="p-4 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono whitespace-pre-wrap">{output}</pre><div className="flex gap-2 mt-2"><button onClick={copyOutput} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg hover:text-[var(--text-primary)] transition-colors">{copied ? 'Copied!' : 'Copy'}</button><button onClick={downloadOutput} className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">Download</button></div></div>}
        </div>
      </Section>
    </div>
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
        out += 'Tier ' + (i + 1) + ': ' + t.name + '\n  Price: ' + (t.price === 0 ? 'Free' : '$' + t.price + '/mo') + '\n  Users: ' + (t.users === Infinity ? 'Unlimited' : t.users) + '\n';
        if (t.features) out += '  Features: ' + (t.features as string[]).join(', ') + '\n';
        out += '\n';
      });
      setResult(out);
    } catch { setResult('Invalid JSON — check your tier format'); }
  };

  const presets = [
    { label: 'Freemium', apply: () => setTiers('[{"name":"Free","price":0,"users":1},{"name":"Pro","price":29,"users":50,"features":["Analytics","API"]},{"name":"Enterprise","price":99,"users":Infinity,"features":["SSO","SLA","Support"]}]') },
    { label: 'SaaS Standard', apply: () => setTiers('[{"name":"Starter","price":9,"users":5},{"name":"Growth","price":49,"users":100},{"name":"Scale","price":199,"users":Infinity}]') },
    { label: 'Clear', apply: () => setTiers('[]') },
  ];

  const resultText = result ? 'Pricing tiers built' : 'Enter tiers JSON to build';

  return (
    <CalculatorShell title="Pricing Tier Builder" result={resultText} onCalculate={build} presets={presets} accent="indigo" downloadData={result} downloadFilename="pricing-tiers.txt">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Tiers JSON</label>
        <textarea value={tiers} onChange={e => setTiers(e.target.value)} rows={6}
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-indigo-500/50 resize-y"
          placeholder='[{"name": "Free", "price": 0, "users": 1, "features": ["Basic"]}]' />

        {result && (
          <pre className="p-4 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono whitespace-pre-wrap">{result}</pre>
        )}
      </div>
    </CalculatorShell>
  );
}
