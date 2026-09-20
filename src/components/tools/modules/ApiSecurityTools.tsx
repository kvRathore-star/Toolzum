"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { inputClass, labelClass, btnClass, cardClass, headingClass, resultClass } from './ApiTools.shared';
import { clipboardWrite } from "@/lib/clipboard";


export function ApiKeyGenerator() {
  const [prefix, setPrefix] = useState('sk');
  const [length, setLength] = useState('32');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'Stripe-like', prefix: 'sk', len: '32' },
    { label: 'GitHub PAT', prefix: 'ghp', len: '40' },
    { label: 'Simple Key', prefix: 'key', len: '24' },
  ];
  const calc = () => {
    const len = parseInt(length);
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let key = '';
    for (let i = 0; i < len; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
    setResult(prefix ? `${prefix}_${key}` : key);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Key Generator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setPrefix(p.prefix); setLength(p.len); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-rose-400 text-[var(--text-secondary)] hover:text-rose-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lbl-apisecuritytools-prefix" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Prefix</label>
            <input id="lbl-apisecuritytools-prefix" aria-label="Prefix" type="text" value={prefix} onChange={e => { setPrefix(e.target.value); setResult(''); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label htmlFor="lbl-apisecuritytools-length" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Length</label>
            <input id="lbl-apisecuritytools-length" aria-label="Length" type="number" value={length} onChange={e => { setLength(e.target.value); setResult(''); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate</button>
        {result && (
          <div className="relative">
            <pre className="bg-gray-900 text-rose-300 rounded-xl p-4 text-sm font-mono overflow-x-auto break-all">{result}</pre>
            <button onClick={() => { clipboardWrite(result).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else toast.error('Copy blocked by the browser — select the text manually.'); }); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiKeyHasher() {
  const [apiKey, setApiKey] = useState('sk_test_abc123def456');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const calc = async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setResult(hashHex);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Key Hasher</h2>
        <div>
          <label htmlFor="lbl-apisecuritytools-api-key" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">API Key</label>
          <input id="lbl-apisecuritytools-api-key" aria-label="API Key" type="text" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Hash (SHA-256)</button>
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto break-all">{result}</pre>
            <button onClick={() => { clipboardWrite(result).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else toast.error('Copy blocked by the browser — select the text manually.'); }); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiKeyValidator() {
  const [apiKey, setApiKey] = useState('sk_test_abc123def456ghi789');
  const [result, setResult] = useState<{ valid: boolean; checks: { label: string; pass: boolean }[] } | null>(null);
  // Known provider prefixes — identification, not validation (no offline
  // check can verify a key with its issuer; the old copy implied it could).
  const PROVIDERS: { prefix: string; name: string }[] = [
    { prefix: 'sk_live_', name: 'Stripe live secret' },
    { prefix: 'sk_test_', name: 'Stripe test secret' },
    { prefix: 'rk_live_', name: 'Stripe restricted' },
    { prefix: 'ghp_', name: 'GitHub personal token' },
    { prefix: 'gho_', name: 'GitHub OAuth token' },
    { prefix: 'xoxb-', name: 'Slack bot token' },
    { prefix: 'xoxp-', name: 'Slack user token' },
    { prefix: 'AKIA', name: 'AWS access key' },
    { prefix: 'AIza', name: 'Google API key' },
    { prefix: 'hf_', name: 'Hugging Face token' },
    { prefix: 'sk-ant-', name: 'Anthropic key' },
    { prefix: 'dop_v1_', name: 'DigitalOcean token' },
  ];
  const shannon = (s: string): number => {
    if (!s) return 0;
    const freq = new Map<string, number>();
    for (const c of s) freq.set(c, (freq.get(c) || 0) + 1);
    let h = 0;
    for (const n of freq.values()) {
      const p = n / s.length;
      h -= p * Math.log2(p);
    }
    return h;
  };
  const calc = () => {
    const key = apiKey.trim();
    const provider = PROVIDERS.find(p => key.startsWith(p.prefix));
    const entropy = shannon(key);
    const checks = [
      { label: `Length ${key.length} (typical keys are 20+ chars)`, pass: key.length >= 20 },
      { label: provider ? `Recognized format: ${provider.name}` : 'Unrecognized prefix — custom or malformed format', pass: !!provider },
      { label: `Entropy ${entropy.toFixed(1)} bits/char ${entropy >= 4 ? '(looks random)' : '(low — may be a placeholder like "test123")'}`, pass: entropy >= 4 },
      { label: 'Valid characters (a-zA-Z0-9_-.~)', pass: /^[a-zA-Z0-9_\-.~]+$/.test(key) && key.length > 0 },
      { label: 'Not a common placeholder (test/demo/example/12345/abcdef)', pass: !/^(test|demo|example|changeme|12345|abcdef)/i.test(key) },
    ];
    setResult({ valid: checks.every(c => c.pass), checks });
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Key Hygiene Check</h2>
        <p className="text-[11px] text-[var(--text-secondary)]">Checks format, provider prefix, and randomness offline. No offline check can confirm a key works with its issuer — only a real API call can.</p>
        <div>
          <label htmlFor="lbl-apisecuritytools-api-key-4" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">API Key</label>
          <input id="lbl-apisecuritytools-api-key-4" aria-label="API Key" type="text" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Validate</button>
        {result && (
          <div className="space-y-2">
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${result.valid ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
              <span className="text-lg">{result.valid ? '✓' : '✗'}</span>
              {result.valid ? 'Valid API Key' : 'Invalid API Key'}
            </div>
            <div className="space-y-1.5">
              {result.checks.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={c.pass ? 'text-green-500' : 'text-red-700 dark:text-red-400'}>{c.pass ? '✓' : '✗'}</span>
                  <span className="text-[var(--text-secondary)]">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiCostEstimator() {
  const [requests, setRequests] = useState('1000000');
  const [pricePerMillion, setPricePerMillion] = useState('0.50');
  const [users, setUsers] = useState('10000');
  const [result, setResult] = useState<{ cost: number; costPerUser: number; reqPerUser: number; monthlyPerUser: number } | null>(null);
  const presets = [
    { label: 'OpenAI GPT-4o', req: '1000000', ppm: '10.00', users: '5000' },
    { label: 'Stripe API', req: '500000', ppm: '0.50', users: '10000' },
    { label: 'Small Startup', req: '100000', ppm: '1.00', users: '1000' },
  ];
  const calc = () => {
    const req = parseFloat(requests);
    const ppm = parseFloat(pricePerMillion);
    const u = parseFloat(users);
    setResult({
      cost: (req / 1000000) * ppm,
      costPerUser: ((req / 1000000) * ppm) / u,
      reqPerUser: req / u,
      monthlyPerUser: (req / u) * ppm / 1000000,
    });
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Cost Estimator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setRequests(p.req); setPricePerMillion(p.ppm); setUsers(p.users); setResult(null); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-green-400 text-[var(--text-secondary)] hover:text-green-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="lbl-apisecuritytools-monthly-requests" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Monthly Requests</label>
            <input id="lbl-apisecuritytools-monthly-requests" aria-label="Monthly Requests" type="number" value={requests} onChange={e => { setRequests(e.target.value); setResult(null); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <label htmlFor="lbl-apisecuritytools-price-million" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Price/Million ($)</label>
            <input id="lbl-apisecuritytools-price-million" aria-label="Price/Million ($)" type="number" value={pricePerMillion} onChange={e => { setPricePerMillion(e.target.value); setResult(null); }} step="0.01" className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <label htmlFor="lbl-apisecuritytools-users" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Users</label>
            <input id="lbl-apisecuritytools-users" aria-label="Users" type="number" value={users} onChange={e => { setUsers(e.target.value); setResult(null); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Estimate Cost</button>
        {result && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Monthly Cost</p>
              <p className="text-2xl font-black text-green-500">${result.cost.toFixed(2)}</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Cost Per User</p>
              <p className="text-2xl font-black text-blue-700 dark:text-blue-400">${result.costPerUser.toFixed(4)}</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Requests Per User</p>
              <p className="text-xl font-bold text-purple-500">{result.reqPerUser.toFixed(1)}</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Monthly Cost/User</p>
              <p className="text-xl font-bold text-amber-500">${result.monthlyPerUser.toFixed(4)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiGatewayRateCalculator() {
  const [maxRps, setMaxRps] = useState('100');
  const [burstSize, setBurstSize] = useState('200');
  const [windowSec, setWindowSec] = useState('60');
  const [result, setResult] = useState<{ maxPerWindow: number; sustainedRate: number; throttledRate: number } | null>(null);
  const calc = () => {
    const rps = parseFloat(maxRps);
    const burst = parseFloat(burstSize);
    const windowS = parseFloat(windowSec);
    setResult({
      maxPerWindow: rps * windowS,
      sustainedRate: (rps * windowS) / windowS,
      throttledRate: Math.round(rps * 0.8),
    });
  };
  const wSec = parseFloat(windowSec) || 60;
  const maxVal = result ? Math.max(result.maxPerWindow, result.sustainedRate * wSec, result.throttledRate * wSec) || 1 : 1;
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Gateway Rate Calculator</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="lbl-apisecuritytools-max-rps" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Max RPS</label>
            <input id="lbl-apisecuritytools-max-rps" aria-label="Max RPS" type="number" value={maxRps} onChange={e => { setMaxRps(e.target.value); setResult(null); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <label htmlFor="lbl-apisecuritytools-burst-size" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Burst Size</label>
            <input id="lbl-apisecuritytools-burst-size" aria-label="Burst Size" type="number" value={burstSize} onChange={e => { setBurstSize(e.target.value); setResult(null); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <label htmlFor="lbl-apisecuritytools-window-s" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Window (s)</label>
            <input id="lbl-apisecuritytools-window-s" aria-label="Window (s)" type="number" value={windowSec} onChange={e => { setWindowSec(e.target.value); setResult(null); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Calculate</button>
        {result && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Per Window</p>
                <p className="text-lg font-bold text-cyan-500">{result.maxPerWindow.toLocaleString()}</p>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Sustained</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{result.sustainedRate} req/s</p>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Throttle (80%)</p>
                <p className="text-lg font-bold text-amber-500">{result.throttledRate} req/s</p>
              </div>
            </div>
            <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden relative">
              <div className="h-full bg-cyan-500 rounded-full transition-all absolute left-0 top-0" style={{ width: `${(result.sustainedRate / parseFloat(maxRps)) * 100}%`, maxWidth: '100%' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiRateLimiterCalculator() {
  const [limit, setLimit] = useState('100');
  const [windowMins, setWindowMins] = useState('15');
  const [burst, setBurst] = useState('20');
  const [result, setResult] = useState<{ ratePerSec: number; ratePerMin: number; burstWindow: number; retryAfter: number } | null>(null);
  const calc = () => {
    const l = parseInt(limit);
    const w = parseInt(windowMins);
    const b = parseInt(burst);
    const ratePerSec = l / (w * 60);
    setResult({
      ratePerSec,
      ratePerMin: l / w,
      burstWindow: Math.ceil(b / ratePerSec),
      retryAfter: Math.ceil(w / l * 60),
    });
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Rate Limiter Calculator</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="lbl-apisecuritytools-rate-limit" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Rate Limit</label>
            <input id="lbl-apisecuritytools-rate-limit" aria-label="Rate Limit" type="number" value={limit} onChange={e => setLimit(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <label htmlFor="lbl-apisecuritytools-window-min" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Window (min)</label>
            <input id="lbl-apisecuritytools-window-min" aria-label="Window (min)" type="number" value={windowMins} onChange={e => setWindowMins(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <label htmlFor="lbl-apisecuritytools-burst" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Burst</label>
            <input id="lbl-apisecuritytools-burst" aria-label="Burst" type="number" value={burst} onChange={e => setBurst(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Calculate</button>
        {result && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Per Second</p>
              <p className="text-xl font-bold text-violet-500">{result.ratePerSec.toFixed(3)} req/s</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Per Minute</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{result.ratePerMin.toFixed(1)} req/min</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Burst Window</p>
              <p className="text-xl font-bold text-amber-500">~{result.burstWindow}s</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Retry-After</p>
              <p className="text-xl font-bold text-emerald-500">{result.retryAfter}s</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
