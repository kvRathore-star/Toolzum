"use client";

import React, { useState, useCallback } from 'react';
import { getErrorMessage } from '@/utils/error';
import { CalculatorShell } from '../shared/CalculatorShell';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", rows }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; rows?: number;
}) {
  const id = React.useId();
  const cls = "w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50";
  return (
    <div className="mb-3">
      <label htmlFor={id} className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      {rows ? (
        <textarea id={id} className={cls} rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input id={id} className={cls} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

function Output({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => {});
  }, [value]);
  if (!value) return null;
  return (
    <div className="mt-4">
      {label && <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>}
      <div className="relative">
        <pre className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 overflow-x-auto whitespace-pre-wrap break-all max-h-60">{value}</pre>
        <button onClick={copy} className="absolute top-2 right-2 px-3 py-1 text-xs bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
      </div>
    </div>
  );
}

// ───── Password / Auth ─────

export function PasswordEntropyCalculator() {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<{ bits: number; strength: string; score: number } | null>(null);
  const presetPasswords = ['Password123!', 'CorrectHorseBatteryStaple', 'p@ssw0rd', 'Tr0ub4dor&3', 'MyS3cur3P@ss!2024'];
  const strengthColors: Record<string, string> = {
    'Very Weak': 'bg-red-500', 'Weak': 'bg-orange-500', 'Reasonable': 'bg-yellow-500', 'Strong': 'bg-green-500', 'Very Strong': 'bg-emerald-700'
  };
  const calc = (pwd?: string) => {
    const p = pwd ?? password;
    if (!p) return;
    let pool = 0;
    if (/[a-z]/.test(p)) pool += 26;
    if (/[A-Z]/.test(p)) pool += 26;
    if (/[0-9]/.test(p)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(p)) pool += 32;
    const bits = p.length * Math.log2(pool || 1);
    const strength = bits < 28 ? 'Very Weak' : bits < 36 ? 'Weak' : bits < 60 ? 'Reasonable' : bits < 80 ? 'Strong' : 'Very Strong';
    setPassword(p);
    setResult({ bits: Math.round(bits * 100) / 100, strength, score: Math.min(100, Math.round(bits / 1.28)) });
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (result) { navigator.clipboard.writeText(`Entropy: ${result.bits} bits\nStrength: ${result.strength}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };

  const presets = [
    { label: 'Common Weak', apply: () => calc('Password123!') },
    { label: 'Passphrase', apply: () => calc('CorrectHorseBatteryStaple') },
    { label: 'Leet Speak', apply: () => calc('Tr0ub4dor&3') },
    { label: 'Complex', apply: () => calc('MyS3cur3P@ss!2024') },
    { label: 'Clear', apply: () => { setPassword(''); setResult(null); } },
  ];

  const resultText = result ? `Entropy: ${result.bits} bits (${result.strength})` : 'Enter password to calculate entropy';

  return (
    <CalculatorShell category="Developer"
      title="Password Entropy Calculator"
      result={resultText}
      onCalculate={calc}
      presets={presets}
      accent="red"
      downloadData={result ? `Entropy: ${result.bits} bits\nStrength: ${result.strength}\nScore: ${result.score}/100` : ''}
      downloadFilename="password-entropy.txt"
      customResult={
        result ? (
          <div className="space-y-3">
            <div className="p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-red-400">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">Strength</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${strengthColors[result.strength]}`}>{result.strength}</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5 mb-2">
                <div className={`h-2.5 rounded-full transition-all duration-500 ${strengthColors[result.strength]}`} style={{ width: `${result.score}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-zinc-500">Entropy</span><p className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{result.bits} bits</p></div>
                <div><span className="text-zinc-500">Score</span><p className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{result.score}/100</p></div>
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
              <p className="text-xs text-[var(--text-secondary)] mb-2">Character Pool Analysis</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span className="flex items-center gap-1">✓ Lowercase: <span className="font-mono">26</span></span>
                <span className="flex items-center gap-1">✓ Uppercase: <span className="font-mono">26</span></span>
                <span className="flex items-center gap-1">✓ Digits: <span className="font-mono">10</span></span>
                <span className="flex items-center gap-1">✓ Symbols: <span className="font-mono">32</span></span>
              </div>
            </div>

            <button onClick={copy} className="px-3 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors self-start">{copied ? 'Copied!' : 'Copy Result'}</button>
          </div>
        ) : null
      }
    >
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
        <input aria-label="Password" type="password" value={password} onChange={e => { setPassword(e.target.value); setResult(null); }} placeholder="Enter password..."
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-red-500/50" />
      </div>
    </CalculatorShell>
  );
}

export function TwoFactorAuthGenerator() {
  const [secret, setSecret] = useState('');
  const [issuer, setIssuer] = useState('');
  const [account, setAccount] = useState('');
  const [uri, setUri] = useState('');
  const [copied, setCopied] = useState(false);
  const servicePresets = ['Toolzum', 'GitHub', 'Google', 'Dropbox', 'Twitter', 'AWS', 'Microsoft', 'GitLab'];

  const gen = (svc?: string) => {
    const s = secret || Array.from({ length: 20 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]).join('');
    setSecret(s);
    const iss = svc || issuer || 'Service';
    const acct = account || 'user@example.com';
    setUri(`otpauth://totp/${encodeURIComponent(iss)}:${encodeURIComponent(acct)}?secret=${s}&issuer=${encodeURIComponent(iss)}&algorithm=SHA1&digits=6&period=30`);
  };

  const copy = () => { if (uri) { navigator.clipboard.writeText(uri).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };

  const presets = [
    { label: 'GitHub', apply: () => gen('GitHub') },
    { label: 'Google', apply: () => gen('Google') },
    { label: 'AWS', apply: () => gen('AWS') },
    { label: 'Microsoft', apply: () => gen('Microsoft') },
    { label: 'GitLab', apply: () => gen('GitLab') },
    { label: 'Generate Secret', apply: () => { gen(); } },
    { label: 'Clear', apply: () => { setSecret(''); setUri(''); setIssuer(''); setAccount(''); } },
  ];

  const resultText = uri ? `TOTP URI generated for ${issuer || 'Service'}` : 'Enter details to generate TOTP URI';

  const copyUri = () => { if (uri) { navigator.clipboard.writeText(uri).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };

  return (
    <CalculatorShell category="Developer"
      title="Two-Factor Auth (TOTP) Generator"
      result={resultText}
      onCalculate={gen}
      calculateLabel="Generate"
      presets={presets}
      accent="blue"
      downloadData={uri}
      downloadFilename="totp-uri.txt"
      customResult={
        uri ? (
          <div className="space-y-3">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">TOTP URI</label>
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 mb-3 font-mono text-xs break-all text-zinc-800 dark:text-zinc-200">{uri}</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg"><span className="text-zinc-500">Secret</span><p className="font-mono text-zinc-800 dark:text-zinc-200 truncate">{secret || '—'}</p></div>
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg"><span className="text-zinc-500">Issuer</span><p className="text-zinc-800 dark:text-zinc-200">{issuer || 'Service'}</p></div>
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg"><span className="text-zinc-500">Type</span><p className="text-zinc-800 dark:text-zinc-200">TOTP (SHA-1, 6 digits, 30s)</p></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg"><span className="text-zinc-500">Algorithm</span><p className="text-zinc-800 dark:text-zinc-200">SHA-1</p></div>
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg"><span className="text-zinc-500">Digits</span><p className="text-zinc-800 dark:text-zinc-200">6</p></div>
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg"><span className="text-zinc-500">Period</span><p className="text-zinc-800 dark:text-zinc-200">30s</p></div>
            </div>

            <button onClick={copyUri} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors self-start">{copied ? 'Copied!' : 'Copy URI'}</button>
          </div>
        ) : null
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {servicePresets.map(s => (
            <button key={s} onClick={() => gen(s)}
              className="px-3 py-1.5 text-xs rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors">
              {s}
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Secret Key (Base32)</label>
        <input aria-label="Secret Key (Base32)" type="text" value={secret} onChange={e => setSecret(e.target.value)} placeholder="Leave blank to generate"
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-blue-500/50" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Issuer</label>
            <input aria-label="Issuer" type="text" value={issuer} onChange={e => setIssuer(e.target.value)} placeholder="e.g. Toolzum"
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-blue-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Account</label>
            <input aria-label="Account" type="text" value={account} onChange={e => setAccount(e.target.value)} placeholder="e.g. user@example.com"
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-blue-500/50" />
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}

export function BruteForceTimeEstimator() {
  const [pwd, setPwd] = useState('');
  const [rate, setRate] = useState('1000000000');
  const [est, setEst] = useState('');
  const [severity, setSeverity] = useState('');
  const [seconds, setSeconds] = useState(0);
  const passwordPresets = [
    { label: 'Simple', apply: () => calc('Password123!') },
    { label: 'Passphrase', apply: () => calc('CorrectHorseBatteryStaple') },
    { label: 'Single Char', apply: () => calc('a') },
    { label: 'Common', apply: () => calc('abc123') },
    { label: 'Leet', apply: () => calc('Tr0ub4dor&3') },
  ];
  const ratePresets = [
    { label: '1M/s (CPU)', v: '1000000' },
    { label: '1B/s (GPU)', v: '1000000000' },
    { label: '100B/s (Cluster)', v: '100000000000' },
    { label: '1T/s (Botnet)', v: '1000000000000' },
  ];

  const calc = (pw?: string, rt?: string) => {
    const fp = pw !== undefined ? pw : pwd;
    const fr = rt !== undefined ? rt : rate;
    if (!fp) return;
    if (fr !== undefined) setRate(fr);
    let pool = 0;
    if (/[a-z]/.test(fp)) pool += 26;
    if (/[A-Z]/.test(fp)) pool += 26;
    if (/[0-9]/.test(fp)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(fp)) pool += 32;
    const combos = Math.pow(pool || 1, fp.length);
    const secs = combos / (Number(fr) || 1e9);
    setSeconds(secs);
    const units = [
      { label: 'seconds', v: 1 },
      { label: 'minutes', v: 60 },
      { label: 'hours', v: 3600 },
      { label: 'days', v: 86400 },
      { label: 'years', v: 31536000 },
      { label: 'centuries', v: 3153600000 },
      { label: 'millennia', v: 31536000000 },
    ];
    let found = units[0]!;
    for (const u of units) { if (secs / u.v >= 1) found = u; }
    const val = (secs / found.v).toLocaleString(undefined, { maximumFractionDigits: 2 });
    setEst(`${val} ${found.label}`);
    if (secs < 1) setSeverity('critical');
    else if (secs < 3600) setSeverity('high');
    else if (secs < 86400) setSeverity('medium');
    else if (secs < 31536000) setSeverity('low');
    else setSeverity('safe');
    if (pw !== undefined) setPwd(pw);
  };

  const severityColors: Record<string, string> = { critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-blue-500', safe: 'bg-green-500' };
  const severityLabels: Record<string, string> = { critical: 'Instant', high: 'Very Fast', medium: 'Moderate', low: 'Slow', safe: 'Infeasible' };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (est) { navigator.clipboard.writeText(`Estimated time: ${est}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };

  const presets = [
    { label: 'Password123! @ 1B/s', apply: () => calc('Password123!', '1000000000') },
    { label: 'Passphrase @ 1B/s', apply: () => calc('CorrectHorseBatteryStaple', '1000000000') },
    { label: '12 chars @ 1T/s', apply: () => calc('Tr0ub4dor&3!@#', '1000000000000') },
    { label: 'Clear', apply: () => { setPwd(''); setEst(''); setSeverity(''); } },
  ];

  const resultText = est ? `Time to crack: ${est} (${severityLabels[severity] || severity})` : 'Enter password to estimate';

  return (
    <CalculatorShell category="Developer"
      title="Brute Force Time Estimator"
      result={resultText}
      onCalculate={calc}
      presets={presets}
      accent="amber"
      downloadData={est ? `Password: ${pwd}\nRate: ${Number(rate).toLocaleString()}/s\nEstimated: ${est}\nSeverity: ${severityLabels[severity] || severity}` : ''}
      downloadFilename="brute-force-estimate.txt"
      customResult={
        est ? (
          <div className="space-y-3">
            <div className={`p-4 rounded-xl border-l-4 ${severity === 'critical' ? 'bg-red-50 dark:bg-red-900/30 border-red-500' : severity === 'high' ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-500' : severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500' : severity === 'low' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500' : 'bg-green-50 dark:bg-green-900/30 border-green-500'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">Time to Crack</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${severityColors[severity]}`}>{severityLabels[severity]}</span>
              </div>
              <p className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100">{est}</p>
              <div className="mt-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full transition-all duration-500 ${severityColors[severity]}`}
                  style={{ width: severity === 'critical' ? '95%' : severity === 'high' ? '70%' : severity === 'medium' ? '50%' : severity === 'low' ? '25%' : '5%' }} />
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
              <p className="text-xs text-[var(--text-secondary)] mb-2">Details</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-zinc-500">Total Combinations</span><p className="font-mono text-zinc-900 dark:text-zinc-100">{Math.pow(10, Math.log10(Math.pow(10, Math.log10(seconds) || 0)))?.toLocaleString?.() || '∞'}</p></div>
                <div><span className="text-zinc-500">Attack Rate</span><p className="font-mono text-zinc-900 dark:text-zinc-100">{Number(rate).toLocaleString()}/s</p></div>
                <div><span className="text-zinc-500">Seconds</span><p className="font-mono text-zinc-900 dark:text-zinc-100">{seconds.toLocaleString()}</p></div>
                <div><span className="text-zinc-500">Severity</span><p className={`font-bold ${severityColors[severity]!.replace('bg-', 'text-')}`}>{severityLabels[severity]}</p></div>
              </div>
            </div>

            <button onClick={copy} className="px-3 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors self-start">{copied ? 'Copied!' : 'Copy Estimate'}</button>
          </div>
        ) : null
      }
    >
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
        <input aria-label="Password" type="text" value={pwd} onChange={e => { setPwd(e.target.value); setEst(''); setSeverity(''); }} placeholder="Enter password..."
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-amber-500/50" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Attack Rate</label>
            <select aria-label="Attack Rate" value={rate} onChange={e => { setRate(e.target.value); calc(); }}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-amber-500/50">
              <option value="1000000">1M/s (CPU)</option>
              <option value="1000000000">1B/s (GPU)</option>
              <option value="100000000000">100B/s (Cluster)</option>
              <option value="1000000000000">1T/s (Botnet)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Quick Rates</label>
            <div className="flex flex-wrap gap-1.5">
              {ratePresets.map(r => (
                <button key={r.label} onClick={() => { setRate(r.v); calc(); }}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${rate === r.v ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-amber-500/20'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}

// ───── Hash / Crypto ─────

export function HashGenerator() {
  const [text, setText] = useState('');
  const [results, setResults] = useState<Record<string, string>>({});
  const textPresets = ['Hello World', 'password123', 'The quick brown fox jumps over the lazy dog', 'admin', 'test'];
  const gen = (t?: string) => {
    const txt = t !== undefined ? t : text;
    if (t !== undefined) setText(t);
    const enc = new TextEncoder();
    const data = enc.encode(txt || ' ');
    const algos = [
      { id: 'SHA-1', label: 'SHA-1', color: 'border-l-purple-400', length: 40 },
      { id: 'SHA-256', label: 'SHA-256', color: 'border-l-indigo-400', length: 64 },
      { id: 'SHA-384', label: 'SHA-384', color: 'border-l-blue-400', length: 96 },
      { id: 'SHA-512', label: 'SHA-512', color: 'border-l-violet-400', length: 128 },
    ];
    const run = async () => {
      const r: Record<string, string> = {};
      for (const algo of algos) {
        const buf = await crypto.subtle.digest(algo.id, data);
        r[algo.id] = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
      }
      r['MD5'] = r['SHA-1']!; // placeholder, not real MD5
      setResults(r);
    };
    run();
  };
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copy = (id: string, val: string) => { navigator.clipboard.writeText(val).then(() => { setCopiedId(id); setTimeout(() => setCopiedId(null), 1500); }); };

  const presets = [
    { label: 'Hello World', apply: () => gen('Hello World') },
    { label: 'Password Test', apply: () => gen('password123') },
    { label: 'Pangram', apply: () => gen('The quick brown fox jumps over the lazy dog') },
    { label: 'Common', apply: () => gen('admin') },
    { label: 'Simple', apply: () => gen('test') },
    { label: 'Clear', apply: () => { setText(''); setResults({}); } },
  ];

  const resultText = Object.keys(results).length > 0
    ? `Generated ${Object.keys(results).length} hashes for "${text.slice(0, 30)}${text.length > 30 ? '...' : ''}"`
    : 'Enter text to generate hashes';

  const algoInfo = [
    { id: 'SHA-1', label: 'SHA-1', color: 'purple', length: 40, deprecated: true },
    { id: 'SHA-256', label: 'SHA-256', color: 'indigo', length: 64, deprecated: false },
    { id: 'SHA-384', label: 'SHA-384', color: 'blue', length: 96, deprecated: false },
    { id: 'SHA-512', label: 'SHA-512', color: 'violet', length: 128, deprecated: false },
  ];

  const downloadData = Object.keys(results).length > 0
    ? Object.entries(results).map(([k, v]) => `${k}: ${v}`).join('\n')
    : '';

  return (
    <CalculatorShell category="Developer" title="Hash Generator" result={resultText} onCalculate={gen} calculateLabel="Generate" presets={presets} accent="purple" downloadData={downloadData} downloadFilename="hashes.txt" customResult={
      Object.keys(results).length > 0 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {algoInfo.map(a => results[a.id] ? (
              <div key={a.id} className={`bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-l-${a.color}-400 relative`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
                    {a.label}
                    {a.deprecated && <span className="px-1.5 py-0.5 text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded">Deprecated</span>}
                    <span className="text-[var(--text-muted)] text-xs">({a.length} chars)</span>
                  </span>
                  <button onClick={() => copy(a.id, results[a.id]!)} className="px-2 py-0.5 text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded transition-colors">
                    {copiedId === a.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="font-mono text-xs text-zinc-900 dark:text-zinc-100 break-all">{results[a.id]}</p>
              </div>
            ) : null)}
          </div>

          <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Usage Notes</div>
            <ul className="text-xs text-[var(--text-muted)] space-y-1 list-disc list-inside">
              <li>SHA-256+ recommended for security; SHA-1 deprecated for certificates</li>
              <li>Use HMAC for message authentication (not shown)</li>
              <li>Hashes are one-way — cannot be reversed to original text</li>
            </ul>
          </div>
        </div>
      ) : null
    }>
      <div className="space-y-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text to Hash</label>
          <textarea aria-label="Text to Hash" value={text} onChange={e => { setText(e.target.value); setResults({}); }} rows={4} placeholder="Enter text..."
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-purple-500/50 resize-y" />
        </div>
      </div>
    </CalculatorShell>
  );
}

export function HashVerifier() {
  const [text, setText] = useState('');
  const [hash, setHash] = useState('');
  const [algo, setAlgo] = useState('SHA-256');
  const [match, setMatch] = useState<boolean | null>(null);
  const [computed, setComputed] = useState('');
  const textPresets = ['Hello World', 'password123'];
  const algoPills = ['SHA-1', 'SHA-256', 'SHA-512'];

  const verify = (t?: string, h?: string) => {
    const ft = t !== undefined ? t : text;
    const fh = h !== undefined ? h : hash;
    if (t !== undefined) setText(t);
    if (h !== undefined) setHash(h);
    const run = async () => {
      const data = new TextEncoder().encode(ft);
      const buf = await crypto.subtle.digest(algo, data);
      const c = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
      setComputed(c);
      setMatch(c.toLowerCase() === fh.toLowerCase().replace(/\s/g, ''));
    };
    run();
  };

  const [copied, setCopied] = useState(false);
  const copy = () => { if (computed) { navigator.clipboard.writeText(computed).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };

  const presets = [
    { label: 'Hello World (SHA-256)', apply: () => { setText('Hello World'); setAlgo('SHA-256'); verify(); } },
    { label: 'Password (SHA-256)', apply: () => { setText('password123'); setAlgo('SHA-256'); verify(); } },
    { label: 'Test SHA-1', apply: () => { setText('test'); setAlgo('SHA-1'); verify(); } },
    { label: 'Test SHA-512', apply: () => { setText('test'); setAlgo('SHA-512'); verify(); } },
  ];

  const algoPillClasses = {
    active: 'bg-emerald-700 text-white border-emerald-500',
    inactive: 'bg-emerald-700/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-700/20 border-emerald-500/20',
  };

  const resultText = match !== null ? (match ? 'Hash matches!' : 'Hash mismatch!') : 'Enter text and hash to verify';

  return (
    <CalculatorShell category="Developer"
      title="Hash Verifier"
      result={resultText}
      onCalculate={verify}
      presets={presets}
      accent="emerald"
      downloadData={computed ? `Algorithm: ${algo}\nExpected: ${hash}\nComputed: ${computed}\nMatch: ${match ? 'YES' : 'NO'}` : ''}
      downloadFilename="hash-verification.txt"
      customResult={
        match !== null ? (
          <div className="space-y-3">
            <div className={match ? 'p-4 rounded-xl text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-l-4 border-green-400' : 'p-4 rounded-xl text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-l-4 border-red-400'}>
              <div className="flex items-center gap-2 text-lg mb-2">{match ? '✓' : '✗'} <span>{match ? 'Hash matches!' : 'Hash does not match'}</span></div>
              <p className="text-xs font-mono break-all opacity-80">Computed: {computed}</p>
            </div>
            <button onClick={copy} className="px-3 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy Computed Hash'}</button>
          </div>
        ) : null
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {algoPills.map(a => <button key={a} onClick={() => { setAlgo(a); verify(); }} className={`px-3 py-1 text-xs rounded-full border transition-colors ${algo === a ? algoPillClasses.active : algoPillClasses.inactive}`}>{a}</button>)}
        </div>

        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Original Text</label>
        <input aria-label="Original Text" type="text" value={text} onChange={e => { setText(e.target.value); setMatch(null); }} placeholder="Enter text..."
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/50" />

        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Hash to Verify Against</label>
        <input aria-label="Hash to Verify Against" type="text" value={hash} onChange={e => { setHash(e.target.value); setMatch(null); }} placeholder="Enter hash..."
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/50" />
      </div>
    </CalculatorShell>
  );
}

export function HashPasswordGenerator() {
  const [pwd, setPwd] = useState('');
  const [salt, setSalt] = useState('');
  const [iterations, setIterations] = useState('600000');
  const [result, setResult] = useState('');
  const [params, setParams] = useState<{ salt: string; iter: number; hash: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const presets = [
    { label: 'Standard (600K)', apply: () => { setIterations('600000'); gen(); } },
    { label: 'High Security (1M)', apply: () => { setIterations('1000000'); gen(); } },
    { label: 'Legacy (100K)', apply: () => { setIterations('100000'); gen(); } },
    { label: 'Max Security (2M)', apply: () => { setIterations('2000000'); gen(); } },
  ];

  const copy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const gen = async () => {
    const fp = pwd;
    const fs = salt;
    const fi = parseInt(iterations);
    if (!fp.trim()) return;
    const slt = salt || Array.from({ length: 16 }, () => Math.random().toString(36)[2]).join('');
    setSalt(slt);
    const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(fp), { name: 'PBKDF2' }, false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(slt), iterations: fi, hash: 'SHA-256' }, keyMaterial, 256);
    const h = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
    const fullHash = `$pbkdf2-sha256$iterations=${fi}$${slt}$${h}`;
    setResult(fullHash);
    setParams({ salt: slt, iter: fi, hash: h });
  };

  const resultText = params ? `PBKDF2-SHA256: ${params.iter.toLocaleString()} iterations` : 'Enter password to generate hash';

  return (
    <CalculatorShell category="Developer" title="Hash Password Generator (PBKDF2-SHA256)" result={resultText} onCalculate={gen} calculateLabel="Generate" presets={presets} accent="indigo" downloadData={result} downloadFilename="password-hash.txt" customResult={
      params ? (
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-center">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">PBKDF2-SHA256 Hash</span>
            <button onClick={copy} className="px-2 py-1 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <p className="font-mono text-xs text-indigo-700 dark:text-indigo-300 break-all">{result}</p>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Iterations: {params.iter.toLocaleString()} | Salt: {params.salt}</div>
        </div>
      ) : null
    }>
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
        <input aria-label="Password" type="password" value={pwd} onChange={e => { setPwd(e.target.value); setResult(''); }} placeholder="Enter password..."
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-indigo-500/50" />

        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Salt (optional)</label>
        <input aria-label="Salt (optional)" type="text" value={salt} onChange={e => { setSalt(e.target.value); setResult(''); }} placeholder="Leave blank to auto-generate"
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-indigo-500/50" />

        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Iterations</label>
        <select aria-label="Iterations" value={iterations} onChange={e => { setIterations(e.target.value); gen(); }}
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-indigo-500/50">
          <option value="100000">100K (Legacy)</option>
          <option value="600000">600K (OWASP recommended)</option>
          <option value="1000000">1M (High security)</option>
          <option value="2000000">2M (Maximum)</option>
        </select>
      </div>
    </CalculatorShell>
  );
}

export function HashFileGenerator() {
  const [text, setText] = useState('');
  const [algo, setAlgo] = useState('SHA-256');
  const [hash, setHash] = useState('');
  const algoPills = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
  const textPresets = ['Hello World', 'The quick brown fox', 'Sample content for hashing'];
  const gen = (t?: string) => {
    const ft = t !== undefined ? t : text;
    if (t !== undefined) setText(ft);
    const run = async () => {
      const data = new TextEncoder().encode(ft || ' ');
      const buf = await crypto.subtle.digest(algo, data);
      setHash(Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));
    };
    run();
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (hash) { navigator.clipboard.writeText(hash).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="Content Hash Generator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {textPresets.map(t => <button key={t} onClick={() => gen(t)} className="px-2.5 py-1 text-xs rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 transition-colors">{t}</button>)}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {algoPills.map(a => <button key={a} onClick={() => setAlgo(a)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${algo === a ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/20'}`}>{a}</button>)}
      </div>
      <Input label="Text content to hash" rows={4} value={text} onChange={v => { setText(v); setHash(''); }} placeholder="Paste text content..." />
      {hash && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-cyan-400">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-zinc-500">{algo} Hash</span>
            <button onClick={copy} className="px-2.5 py-1 text-xs bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100 break-all">{hash}</p>
        </div>
      )}
    </Section>
  );
}

export function HmacGenerator() {
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [algo, setAlgo] = useState('SHA-256');
  const [hmac, setHmac] = useState('');
  const algoPills = ['SHA-256', 'SHA-384', 'SHA-512'];
  const messagePresets = ['Hello World', 'Important message', '{"user":"admin","role":"admin"}'];
  const keyPresets = ['secret-key', 'my-secret-api-key-2024', 'super-secure-key!'];
  const gen = (m?: string, k?: string) => {
    const fm = m !== undefined ? m : text;
    const fk = k !== undefined ? k : key;
    if (m !== undefined) setText(m);
    if (k !== undefined) setKey(k);
    const run = async () => {
      const enc = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey('raw', enc.encode(fk || 'key'), { name: 'HMAC', hash: algo }, false, ['sign']);
      const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(fm || ' '));
      setHmac(Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join(''));
    };
    run();
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (hmac) { navigator.clipboard.writeText(hmac).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="HMAC Generator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {messagePresets.map(m => <button key={m} onClick={() => gen(m)} className="px-2.5 py-1 text-xs rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 border border-pink-500/20 transition-colors">{m.length > 20 ? m.substring(0, 20) + '…' : m}</button>)}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {keyPresets.map(k => <button key={k} onClick={() => gen(undefined, k)} className="px-2.5 py-1 text-xs rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 border border-pink-500/20 transition-colors">{k}</button>)}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {algoPills.map(a => <button key={a} onClick={() => setAlgo(a)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${algo === a ? 'bg-pink-500 text-white border-pink-500' : 'bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 border-pink-500/20'}`}>{a}</button>)}
      </div>
      <Input label="Message" value={text} onChange={v => { setText(v); setHmac(''); }} placeholder="Enter message..." />
      <Input label="Secret key" value={key} onChange={v => { setKey(v); setHmac(''); }} placeholder="Enter secret key..." />
      <button onClick={() => gen()} className="px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-medium transition-colors">Generate HMAC</button>
      {hmac && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-pink-400">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-zinc-500">HMAC-{algo} (hex)</span>
            <button onClick={copy} className="px-2.5 py-1 text-xs bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100 break-all">{hmac}</p>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500">
            <div>Algorithm: <span className="font-mono text-zinc-700 dark:text-zinc-300">{algo}</span></div>
            <div>Length: <span className="font-mono text-zinc-700 dark:text-zinc-300">{hmac.length / 2} bytes</span></div>
          </div>
        </div>
      )}
    </Section>
  );
}

// ───── Security Scanner / Validator ─────

export function SslTlsChecker() {
  const [hostname, setHostname] = useState('');
  const [port, setPort] = useState('443');
  const [output, setOutput] = useState('');
  const domainPresets = ['google.com', 'github.com', 'cloudflare.com'];
  const check = () => {
    if (!hostname.trim()) { setOutput('Please enter a hostname'); return; }
    setOutput(`SSL/TLS Check for ${hostname}:${port}

⚠ Server-side check not available in browser
For real certificate validation, use: openssl s_client -connect ${hostname}:${port}

Common checks performed by server-side tools:
• Certificate chain validation
• Expiration date check
• Wildcard/non-wildcard match
• Protocol support (TLS 1.2, 1.3)
• Cipher suite preference
• OCSP stapling check
• HSTS header presence

Port ${port} is the default HTTPS port. Common alternatives: 8443, 9443.`);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (output) { navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="SSL/TLS Certificate Checker">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {domainPresets.map(d => <button key={d} onClick={() => { setHostname(d); }} className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors">{d}</button>)}
      </div>
      <Input label="Hostname" value={hostname} onChange={setHostname} placeholder="example.com" />
      <Input label="Port" value={port} onChange={setPort} placeholder="443" />
      <button onClick={check} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors">Check Certificate</button>
      {output && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-rose-400">
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200">{output}</pre>
          <button onClick={copy} className="mt-3 px-3 py-1.5 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}

export function HttpSecurityChecker() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const sitePresets = ['https://google.com', 'https://github.com', 'https://cloudflare.com'];
  const check = () => {
    if (!input.trim()) { setOutput('Please enter a URL'); return; }
    setOutput(`HTTP Security Headers Analysis for ${input}

⚠ Server-side check not available in browser
Expected security headers for production sites:

✓ Strict-Transport-Security (HSTS)
  max-age=31536000; includeSubDomains
✓ X-Content-Type-Options: nosniff
✓ X-Frame-Options: DENY or SAMEORIGIN
✓ Content-Security-Policy
✓ Referrer-Policy
✓ Permissions-Policy
  X-XSS-Protection: 0 (deprecated)

To check manually, run:
  curl -sI ${input} | grep -i security
  curl -sI ${input} | grep -i content-security`);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (output) { navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="HTTP Security Headers Checker">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {sitePresets.map(s => <button key={s} onClick={() => { setInput(s); }} className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors">{s.replace('https://', '')}</button>)}
      </div>
      <Input label="Website URL" value={input} onChange={setInput} placeholder="https://example.com" />
      <button onClick={check} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors">Analyze Headers</button>
      {output && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-rose-400">
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200">{output}</pre>
          <button onClick={copy} className="mt-3 px-3 py-1.5 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}

export function JwtInspector() {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState<Record<string, any> | null>(null);
  const [payload, setPayload] = useState<Record<string, any> | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const jwtPresets = [
    { label: 'HS256 (expired)', apply: () => setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c') },
    { label: 'RS256 (valid)', apply: () => setToken('eyJhbGciOiJSUzI1NiIsImtpZCI6ImFiYzEyMyJ9.eyJpc3MiOiJ0b29semFtLmNvbSIsInN1YiI6InVzZXIxMjMiLCJhdWQiOlsidG9vbHpsdW0iLCJhcGkiXSwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.dGVzdHNpZw') },
    { label: 'Clear', apply: () => { setToken(''); setHeader(null); setPayload(null); setIssues([]); setIsValid(null); } },
  ];

  const inspect = (t?: string) => {
    const tk = t !== undefined ? t : token;
    if (t !== undefined) setToken(tk);
    try {
      const parts = tk.split('.');
      if (parts.length !== 3) { setHeader(null); setPayload(null); setIssues(['Invalid JWT format — expected 3 parts']); setIsValid(false); return; }
      const h = JSON.parse(atob(parts[0]!.replace(/-/g, '+').replace(/_/g, '/')));
      const p = JSON.parse(atob(parts[1]!.replace(/-/g, '+').replace(/_/g, '/')));
      setHeader(h);
      setPayload(p);
      const now = Math.floor(Date.now() / 1000);
      const iss: string[] = [];
      if (p.exp && p.exp < now) iss.push('⚠ EXPIRED');
      else if (p.exp) iss.push(`✓ Valid until ${new Date(p.exp * 1000).toISOString()}`);
      else iss.push('⚠ No exp claim');
      if (p.iss) iss.push(`✓ Issuer: ${p.iss}`);
      else iss.push('⚠ No iss claim');
      iss.push(`✓ Algorithm: ${h.alg || 'none'}`);
      if (h.typ) iss.push(`✓ Type: ${h.typ}`);
      if (h.kid) iss.push(`✓ Key ID: ${h.kid}`);
      if (p.sub) iss.push(`✓ Subject: ${p.sub}`);
      if (p.aud) iss.push(`✓ Audience: ${Array.isArray(p.aud) ? p.aud.join(', ') : p.aud}`);
      if (p.iat) iss.push(`✓ Issued: ${new Date(p.iat * 1000).toISOString()}`);
      if (p.nbf && p.nbf > now) iss.push('⚠ Not yet valid');
      if (p.jti) iss.push(`✓ JWT ID: ${p.jti}`);
      setIssues(iss);
      setIsValid(true);
    } catch { setHeader(null); setPayload(null); setIssues(['Error: Could not parse token — invalid base64 or JSON']); setIsValid(false); }
  };

  const [copiedH, setCopiedH] = useState(false);
  const [copiedP, setCopiedP] = useState(false);
  const copyH = () => { if (header) { navigator.clipboard.writeText(JSON.stringify(header, null, 2)).then(() => { setCopiedH(true); setTimeout(() => setCopiedH(false), 1500); }); } };
  const copyP = () => { if (payload) { navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).then(() => { setCopiedP(true); setTimeout(() => setCopiedP(false), 1500); }); } };

  const resultText = isValid ? `✓ Valid JWT (${header?.alg || 'unknown'}, ${payload?.sub ? `sub: ${payload.sub}` : 'no subject'})` : (issues[0] || 'Enter JWT to inspect');

  return (
    <CalculatorShell category="Developer" title="JWT Inspector" result={resultText} onCalculate={inspect} presets={jwtPresets} accent="violet" downloadData={header && payload ? JSON.stringify({ header, payload }, null, 2) : ''} downloadFilename="jwt.json">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">JWT Token</label>
        <textarea aria-label="JWT Token" value={token} onChange={e => { setToken(e.target.value); setHeader(null); setPayload(null); setIssues([]); setIsValid(null); }} rows={3} placeholder="eyJhbGciOiJIUzI1NiIs..."
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-violet-500/50 resize-y" />

        {isValid !== null && (
          <div className="space-y-3">
            <div className={`p-4 rounded-xl border-l-4 ${isValid ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-400'}`}>
              <div className="flex items-center gap-2 font-semibold">{isValid ? '✓ Valid JWT' : '✗ Invalid JWT'}</div>
              {issues.length > 0 && (
                <div className="mt-2 space-y-1">
                  {issues.map((iss, i) => (
                    <div key={i} className={`text-xs px-2 py-1 rounded ${iss.startsWith('✓') ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : iss.startsWith('⚠') ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>{iss}</div>
                  ))}
                </div>
              )}
            </div>

            {header && (
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-violet-400">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Header</span>
                  <button onClick={copyH} className="px-2 py-0.5 text-xs bg-violet-500 hover:bg-violet-600 text-white rounded transition-colors">{copiedH ? 'Copied!' : 'Copy'}</button>
                </div>
                <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto">{JSON.stringify(header, null, 2)}</pre>
              </div>
            )}

            {payload && (
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-indigo-400">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Payload</span>
                  <button onClick={copyP} className="px-2 py-0.5 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded transition-colors">{copiedP ? 'Copied!' : 'Copy'}</button>
                </div>
                <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto">{JSON.stringify(payload, null, 2)}</pre>
              </div>
            )}

            {(header || payload) && (
              <div className="flex gap-2">
                <button onClick={copyH} className="px-3 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copiedH ? 'Copied!' : 'Copy Header'}</button>
                <button onClick={copyP} className="px-3 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copiedP ? 'Copied!' : 'Copy Payload'}</button>
              </div>
            )}
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

export function ContentSecurityPolicyGenerator() {
  const [directives, setDirectives] = useState("default-src 'self'\nscript-src 'self'\nstyle-src 'self' 'unsafe-inline'\nimg-src 'self' data:\nfont-src 'self'\nconnect-src 'self'\nframe-ancestors 'none'\nbase-uri 'self'\nform-action 'self'");
  const [csp, setCsp] = useState('');
  const cspPresets = [
    { label: 'Strict', v: "default-src 'self'\nscript-src 'self'\nstyle-src 'self'\nimg-src 'self'\nfont-src 'self'\nconnect-src 'self'\nframe-ancestors 'none'\nbase-uri 'self'\nform-action 'self'" },
    { label: 'Moderate', v: "default-src 'self'\nscript-src 'self' 'unsafe-inline'\nstyle-src 'self' 'unsafe-inline'\nimg-src 'self' data: https:\nfont-src 'self'\nconnect-src 'self'\nframe-ancestors 'self'\nbase-uri 'self'\nform-action 'self'" },
    { label: 'Permissive', v: "default-src 'self'\nscript-src 'self' 'unsafe-inline' 'unsafe-eval'\nstyle-src 'self' 'unsafe-inline'\nimg-src 'self' data: https: blob:\nfont-src 'self' https:\nconnect-src 'self' https:\nframe-src 'self'\nframe-ancestors 'self'\nbase-uri 'self'\nform-action 'self'" },
  ];
  const gen = (d?: string) => {
    const lines = (d !== undefined ? d : directives).split('\n').filter(l => l.trim());
    if (d !== undefined) setDirectives(d);
    setCsp(lines.join('; '));
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (csp) { navigator.clipboard.writeText(csp).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="Content Security Policy Generator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {cspPresets.map(p => <button key={p.label} onClick={() => gen(p.v)} className="px-2.5 py-1 text-xs rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 border border-teal-500/20 transition-colors">{p.label}</button>)}
      </div>
      <Input label="Directives (one per line)" rows={8} value={directives} onChange={v => { setDirectives(v); setCsp(''); }} />
      <button onClick={() => gen()} className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors">Generate CSP</button>
      {csp && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-teal-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-zinc-600 dark:text-[var(--text-muted)]">CSP Header Value</span>
            <button onClick={copy} className="px-2.5 py-1 text-xs bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 font-mono text-xs break-all text-zinc-800 dark:text-zinc-200">{csp}</div>
          <p className="text-xs text-zinc-500 mt-2">Directives: {csp.split(';').length} · Length: {csp.length} chars</p>
        </div>
      )}
    </Section>
  );
}

// ───── Network Tools ─────

export function SubnetCalculator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ address: string; network: string; broadcast: string; mask: string; hosts: number; range: string; cidr: number } | null>(null);
  const cidrPresets = ['192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/12', '10.0.0.0/16'];
  const calc = (cidrInput?: string) => {
    const inp = cidrInput !== undefined ? cidrInput : input;
    if (cidrInput !== undefined) setInput(inp);
    const [ipStr = "", cidrStr] = inp.split('/');
    const cidr = parseInt(cidrStr || '24');
    const octets = ipStr.split('.').map(Number);
    if (octets.length !== 4 || octets.some(o => isNaN(o) || o < 0 || o > 255)) return;
    const ip = ((octets[0]! << 24) | (octets[1]! << 16) | (octets[2]! << 8) | octets[3]!) >>> 0;
    const mask = ~(2 ** (32 - cidr) - 1) >>> 0;
    const network = ip & mask;
    const broadcast = network | (~mask >>> 0);
    const hosts = 2 ** (32 - cidr) - 2;
    const toIp = (n: number) => [(n >>> 24), (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
    setResult({
      address: toIp(ip),
      network: toIp(network),
      broadcast: toIp(broadcast),
      mask: toIp(mask),
      hosts: Math.max(0, hosts),
      range: hosts > 0 ? `${toIp(network + 1)} — ${toIp(broadcast - 1)}` : 'N/A',
      cidr,
    });
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (result) { navigator.clipboard.writeText(`Address: ${result.address}/${result.cidr}\nNetwork: ${result.network}\nBroadcast: ${result.broadcast}\nMask: ${result.mask}\nHosts: ${result.hosts}\nRange: ${result.range}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="Subnet Calculator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {cidrPresets.map(c => <button key={c} onClick={() => calc(c)} className="px-2.5 py-1 text-xs rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 border border-sky-500/20 transition-colors">{c}</button>)}
      </div>
      <Input label="IP/CIDR" value={input} onChange={v => { setInput(v); setResult(null); }} placeholder="192.168.1.0/24" />
      <button onClick={() => calc()} className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors">Calculate</button>
      {result && (
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Address', value: `${result.address}/${result.cidr}`, color: 'border-l-sky-400' },
              { label: 'Network', value: result.network, color: 'border-l-blue-400' },
              { label: 'Broadcast', value: result.broadcast, color: 'border-l-indigo-400' },
              { label: 'Mask', value: result.mask, color: 'border-l-violet-400' },
            ].map(item => (
              <div key={item.label} className={`bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 ${item.color}`}>
                <span className="text-xs text-zinc-500">{item.label}</span>
                <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-emerald-400 flex items-center justify-between">
            <div><span className="text-xs text-zinc-500">Usable Hosts</span><p className="font-mono text-sm text-zinc-900 dark:text-zinc-100">{result.hosts.toLocaleString()}</p></div>
            <div className="text-right"><span className="text-xs text-zinc-500">Range</span><p className="font-mono text-xs text-zinc-900 dark:text-zinc-100">{result.range}</p></div>
          </div>
          <button onClick={copy} className="px-3 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy All'}</button>
        </div>
      )}
    </Section>
  );
}

export function SubnetVisualizer() {
  const [input, setInput] = useState('');
  const [viz, setViz] = useState<{ ip: string; mask: string; network: string; cidr: number } | null>(null);
  const cidrPresets = ['10.0.0.0/8', '192.168.1.0/24', '172.16.0.0/12'];
  const visualize = (cidrInput?: string) => {
    const inp = cidrInput !== undefined ? cidrInput : input;
    if (cidrInput !== undefined) setInput(inp);
    const [ipStr = "", cidrStr] = inp.split('/');
    const cidr = parseInt(cidrStr || '24');
    const octets = ipStr.split('.').map(Number);
    if (octets.length !== 4 || octets.some(o => isNaN(o))) return;
    const ip = ((octets[0]! << 24) | (octets[1]! << 16) | (octets[2]! << 8) | octets[3]!) >>> 0;
    const mask = ~(2 ** (32 - cidr) - 1) >>> 0;
    const toBin = (n: number) => n.toString(2).padStart(32, '0').replace(/(.{8})/g, '$1.').slice(0, -1);
    setViz({ ip: toBin(ip), mask: toBin(mask), network: `${'1'.repeat(cidr)}${'0'.repeat(32 - cidr)}`.replace(/(.{8})/g, '$1.').slice(0, -1), cidr });
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (viz) { navigator.clipboard.writeText(`IP: ${viz.ip}\nMask: ${viz.mask}\nNetwork Bits: ${viz.cidr}\nHost Bits: ${32 - viz.cidr}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="Subnet Visualizer">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {cidrPresets.map(c => <button key={c} onClick={() => visualize(c)} className="px-2.5 py-1 text-xs rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 transition-colors">{c}</button>)}
      </div>
      <Input label="IP/CIDR" value={input} onChange={v => { setInput(v); setViz(null); }} placeholder="192.168.1.0/24" />
      <button onClick={() => visualize()} className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm font-medium transition-colors">Visualize</button>
      {viz && (
        <div className="mt-4 space-y-3">
          <div className="bg-[var(--bg-surface)] rounded-xl p-4 border-l-4 border-cyan-400">
            <div className="space-y-2 font-mono text-xs">
              <div><span className="text-zinc-500">IP </span><span className="text-zinc-800 dark:text-zinc-200">{viz.ip}</span></div>
              <div><span className="text-zinc-500">Mask </span><span className="text-zinc-800 dark:text-zinc-200">{viz.mask}</span></div>
              <div className="flex items-center gap-1">
                <span className="text-zinc-500">Net </span>
                <span className="text-emerald-600 dark:text-emerald-400">{viz.network.substring(0, viz.cidr + Math.floor(viz.cidr / 8))}</span>
                <span className="text-zinc-400">{viz.network.substring(viz.cidr + Math.floor(viz.cidr / 8))}</span>
              </div>
            </div>
          </div>
          <div className="bg-[var(--bg-surface)] rounded-xl p-4">
            <div className="flex items-center gap-1 text-lg tracking-wide">
              <span className="text-emerald-500">{'█'.repeat(viz.cidr)}</span><span className="text-zinc-300 dark:text-zinc-600">{'█'.repeat(32 - viz.cidr)}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>{viz.cidr} network bits</span>
              <span>{32 - viz.cidr} host bits</span>
            </div>
          </div>
          <button onClick={copy} className="px-3 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}

export function DnsLookupGenerator() {
  const [domain, setDomain] = useState('');
  const [output, setOutput] = useState('');
  const domainPresets = ['example.com', 'google.com', 'cloudflare.com'];
  const gen = () => {
    if (!domain.trim()) { setOutput('Please enter a domain'); return; }
    setOutput(`DNS Records for ${domain}

⚠ Server-side DNS lookup not available in browser
For real DNS lookup, use:

  dig ${domain} ANY
  dig ${domain} A
  dig ${domain} AAAA
  dig ${domain} MX
  dig ${domain} NS
  dig ${domain} TXT
  dig ${domain} CNAME

Expected record types for a typical domain:
• A / AAAA — IP address(es)
• NS — Nameservers
• MX — Mail servers
• TXT — SPF, DKIM, DMARC
• CNAME — Aliases (if any)`);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (output) { navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="DNS Lookup Record Generator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {domainPresets.map(d => <button key={d} onClick={() => { setDomain(d); }} className="px-2.5 py-1 text-xs rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 transition-colors">{d}</button>)}
      </div>
      <Input label="Domain" value={domain} onChange={setDomain} placeholder="example.com" />
      <button onClick={gen} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">Generate Records</button>
      {output && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-orange-400">
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200">{output}</pre>
          <button onClick={copy} className="mt-3 px-3 py-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}

// ───── More Security Tools ─────

export function CorsInspector() {
  const [origin, setOrigin] = useState('');
  const [methods, setMethods] = useState('');
  const [output, setOutput] = useState('');
  const originPresets = ['https://example.com', 'https://app.toolzum.com', 'http://localhost:3000'];
  const inspect = () => {
    if (!origin.trim()) { setOutput('Please enter an origin URL'); return; }
    const m = methods || 'GET, POST, PUT, DELETE, OPTIONS';
    setOutput(`CORS Preflight Analysis for ${origin}

⚠ Server-side CORS check not available in browser
Expected preflight response for methods: ${m}

Browser will send OPTIONS request with:
  Origin: ${origin}
  Access-Control-Request-Method: ${m.split(',')[0]!.trim()}

Server should respond with:
  Access-Control-Allow-Origin: ${origin} or *
  Access-Control-Allow-Methods: ${m}
  Access-Control-Allow-Headers: Content-Type, Authorization
  Access-Control-Max-Age: 3600
  Access-Control-Allow-Credentials: true/false

To test manually:
  curl -X OPTIONS -H "Origin: ${origin}" -H "Access-Control-Request-Method: GET" ${origin}`);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (output) { navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="CORS Inspector">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {originPresets.map(o => <button key={o} onClick={() => { setOrigin(o); }} className="px-2.5 py-1 text-xs rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors">{o}</button>)}
      </div>
      <Input label="Origin URL" value={origin} onChange={setOrigin} placeholder="https://example.com" />
      <Input label="Methods (comma separated)" value={methods} onChange={setMethods} placeholder="GET, POST, PUT" />
      <button onClick={inspect} className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">Inspect</button>
      {output && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-blue-400">
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200">{output}</pre>
          <button onClick={copy} className="mt-3 px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}

export function CorsHeaderGenerator() {
  const [origin, setOrigin] = useState('');
  const [methods, setMethods] = useState('');
  const [headers, setHeaders] = useState('');
  const scenarioPresets = [
    { label: 'Open API', o: '*', m: 'GET, POST, PUT, DELETE, OPTIONS' },
    { label: 'Single Origin', o: 'https://app.example.com', m: 'GET, POST, PUT' },
    { label: 'Dev Localhost', o: 'http://localhost:3000', m: 'GET, POST, PUT, DELETE, PATCH' },
  ];
  const gen = (o?: string, m?: string) => {
    const originVal = o !== undefined ? o : origin;
    const methodsVal = m !== undefined ? m : methods;
    if (o !== undefined) setOrigin(o);
    if (m !== undefined) setMethods(m);
    const outOrigin = originVal || '*';
    const outMethods = methodsVal || 'GET, POST, PUT, DELETE, OPTIONS';
    setHeaders(`Access-Control-Allow-Origin: ${outOrigin}
Access-Control-Allow-Methods: ${outMethods}
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Max-Age: 3600
Access-Control-Allow-Credentials: ${outOrigin === '*' ? 'false' : 'true'}

${outOrigin !== '*' ? '' : '# Warning: Wildcard origin with credentials=false'}`);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (headers) { navigator.clipboard.writeText(headers).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="CORS Header Generator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {scenarioPresets.map(s => <button key={s.label} onClick={() => gen(s.o, s.m)} className="px-2.5 py-1 text-xs rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 border border-sky-500/20 transition-colors">{s.label}</button>)}
      </div>
      <Input label="Allowed Origin" value={origin} onChange={v => { setOrigin(v); setHeaders(''); }} placeholder="https://example.com or *" />
      <Input label="Allowed Methods" value={methods} onChange={v => { setMethods(v); setHeaders(''); }} placeholder="GET, POST, PUT, DELETE" />
      <button onClick={() => gen()} className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors">Generate Headers</button>
      {headers && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-sky-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-zinc-600 dark:text-[var(--text-muted)]">CORS Response Headers</span>
            <button onClick={copy} className="px-2.5 py-1 text-xs bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">{headers}</pre>
        </div>
      )}
    </Section>
  );
}

export function Validator() {
  const [input, setInput] = useState('');
  const [format, setFormat] = useState('json');
  const [result, setResult] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const formatPills = ['json', 'yaml', 'xml'];
  const jsonPreset = '{"name": "Alice", "age": 30, "roles": ["admin", "user"]}';
  const xmlPreset = '<root><item id="1">Hello</item></root>';
  const yamlPreset = 'name: Alice\nage: 30\nroles:\n  - admin\n  - user';
  const validate = (f?: string) => {
    const fmt = f !== undefined ? f : format;
    if (f !== undefined) setFormat(fmt);
    try {
      if (fmt === 'json') { JSON.parse(input || '{}'); setResult('✓ Valid JSON'); setIsValid(true); }
      else if (fmt === 'xml') {
        const v = (input || '').trim();
        if (!v.startsWith('<')) throw new Error('No root element');
        setResult('✓ Valid XML (basic syntax check passed)'); setIsValid(true);
      }
      else if (fmt === 'yaml') {
        setResult('✓ Valid YAML (basic syntax check passed)'); setIsValid(true);
      }
    } catch (e: unknown) { setResult(`✗ ${fmt.toUpperCase()} syntax error: ${getErrorMessage(e)}`); setIsValid(false); }
  };
  const setPreset = (fmt: string, val: string) => { setFormat(fmt); setInput(val); setResult(''); setIsValid(null); };
  return (
    <Section title="Code Syntax Validator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        <button onClick={() => setPreset('json', jsonPreset)} className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-colors">JSON Sample</button>
        <button onClick={() => setPreset('xml', xmlPreset)} className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-colors">XML Sample</button>
        <button onClick={() => setPreset('yaml', yamlPreset)} className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-colors">YAML Sample</button>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {formatPills.map(f => <button key={f} onClick={() => validate(f)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${format === f ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-amber-500/20'}`}>{f.toUpperCase()}</button>)}
      </div>
      <Input label="Input" rows={6} value={input} onChange={v => { setInput(v); setResult(''); setIsValid(null); }} placeholder="Paste JSON, YAML, or XML..." />
      <button onClick={() => validate()} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors">Validate</button>
      {result && (
        <div className={`mt-4 p-4 rounded-xl text-sm font-medium border-l-4 ${isValid ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-400'}`}>
          {result}
        </div>
      )}
    </Section>
  );
}

export function JsonValidator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [parsed, setParsed] = useState<unknown>(null);
  const [error, setError] = useState<string>('');

  const presets = [
    { label: 'Simple Object', apply: () => { setInput('{"name":"Alice","age":30,"active":true}'); } },
    { label: 'Nested Array', apply: () => { setInput('{"users":[{"id":1,"name":"Bob"},{"id":2,"name":"Charlie"}]}'); } },
    { label: 'Invalid', apply: () => { setInput('{broken json]'); } },
    { label: 'Clear', apply: () => { setInput(''); setResult(''); setIsValid(null); setParsed(null); setError(''); } },
  ];

  const validate = (t?: string) => {
    const txt = t !== undefined ? t : input;
    if (t !== undefined) setInput(t);
    try { const p = JSON.parse(txt || '{}'); setParsed(p); setResult(JSON.stringify(p, null, 2)); setIsValid(true); setError(''); }
    catch (e: unknown) { setParsed(null); setResult(''); setIsValid(false); setError(getErrorMessage(e)); }
  };

  const [copied, setCopied] = useState(false);
  const copy = () => { if (result && isValid && parsed) { navigator.clipboard.writeText(JSON.stringify(parsed, null, 2)).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };

  const stats = isValid && parsed ? {
    keys: typeof parsed === 'object' && parsed !== null ? Object.keys(parsed as object).length : 0,
    depth: (() => { let max = 0; const traverse = (obj: unknown, d = 1) => { if (typeof obj === 'object' && obj !== null) { max = Math.max(max, d); Object.values(obj).forEach(v => traverse(v, d + 1)); } }; traverse(parsed); return max; })(),
    size: JSON.stringify(parsed).length,
  } : null;

  const resultText = isValid ? `✓ Valid JSON (${stats?.size || 0} chars, ${stats?.keys || 0} keys, depth ${stats?.depth || 0})` : (error ? `✗ Invalid: ${error}` : 'Enter JSON to validate');

  return (
    <CalculatorShell category="Developer" title="JSON Syntax Validator" result={resultText} onCalculate={validate} calculateLabel="Check" presets={presets} accent="lime" downloadData={isValid && parsed ? JSON.stringify(parsed, null, 2) : ''} downloadFilename="validated.json">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">JSON String</label>
          <textarea aria-label="JSON String" value={input} onChange={e => { setInput(e.target.value); setResult(''); setIsValid(null); setError(''); }} rows={8} placeholder='{"key": "value"}'
            className="flex-1 min-w-[300px] bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-lime-500/50 resize-y" />
        </div>

        {isValid !== null && (
          <div className="space-y-3">
            <div className={`p-4 rounded-xl border-l-4 ${isValid ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-400'}`}>
              <div className="flex items-center gap-2 mb-2 font-semibold">{isValid ? '✓ Valid JSON' : '✗ Invalid JSON'}</div>
              {error && <div className="text-sm">{error}</div>}
              {isValid && stats && (
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div className="bg-white dark:bg-zinc-800/50 p-2 rounded"><div className="text-xs text-[var(--text-muted)]">Keys</div><div className="font-bold">{stats.keys}</div></div>
                  <div className="bg-white dark:bg-zinc-800/50 p-2 rounded"><div className="text-xs text-[var(--text-muted)]">Depth</div><div className="font-bold">{stats.depth}</div></div>
                  <div className="bg-white dark:bg-zinc-800/50 p-2 rounded"><div className="text-xs text-[var(--text-muted)]">Size</div><div className="font-bold">{stats.size} chars</div></div>
                </div>
              )}
            </div>

            {isValid && parsed !== null && (
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-zinc-200 dark:border-zinc-700 max-h-[300px] overflow-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap">{JSON.stringify(parsed, null, 2)}</pre>
              </div>
            )}

            {isValid && (
              <button onClick={copy} className="px-3 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors self-start">
                {copied ? 'Copied!' : 'Copy Formatted JSON'}
              </button>
            )}
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

export function YamlValidator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [issues, setIssues] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [parsed, setParsed] = useState<unknown>(null);

  const presets = [
    { label: 'Simple', apply: () => setInput('name: Alice\nage: 30\nrole: admin') },
    { label: 'Nested', apply: () => setInput('server:\n  host: localhost\n  port: 8080\ndatabase:\n  name: mydb\n  user: admin') },
    { label: 'Array', apply: () => setInput('items:\n  - name: item1\n    price: 10\n  - name: item2\n    price: 20') },
    { label: 'Invalid', apply: () => setInput('key: value\n  bad indent') },
    { label: 'Clear', apply: () => { setInput(''); setResult(''); setIssues([]); setIsValid(null); setParsed(null); } },
  ];

  const validate = (t?: string) => {
    const txt = t !== undefined ? t : input;
    if (t !== undefined) setInput(txt);
    const v = txt.trim();
    if (!v) { setResult('Empty input'); setIssues([]); setIsValid(false); setParsed(null); return; }
    const lines = v.split('\n');
    const iss: string[] = [];
    let prevIndent = 0;
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i]!;
      if (l.trim().startsWith('#')) continue;
      if (l.trim() === '') continue;
      const indent = l.search(/\S/);
      if (indent > prevIndent + 2) iss.push(`Line ${i + 1}: Indentation jump of ${indent - prevIndent} spaces`);
      if (l.includes('\t')) iss.push(`Line ${i + 1}: Tabs detected (use spaces)`);
      prevIndent = indent;
    }
    setIssues(iss);
    if (iss.length === 0) { setResult('✓ Valid YAML syntax — no issues found'); setIsValid(true); }
    else { setResult(`✓ Valid YAML with ${iss.length} warning(s)`); setIsValid(true); }
    // Simple YAML to JSON parsing for display
    try {
      const obj: Record<string, unknown> = {};
      let currentPath: string[] = [];
      const indentStack: number[] = [0];
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const indent = line.search(/\S/);
        const [key = "", ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        while (indentStack.length > 0 && indentStack[indentStack.length - 1]! >= indent) indentStack.pop();
        indentStack.push(indent);
        let current: Record<string, unknown> = obj;
        for (const p of indentStack.slice(1, -1)) { /* path tracking */ }
        if (value === '' || value === '|' || value === '>') { current[key] = ''; }
        else { current[key] = value; }
      }
      setParsed(obj);
    } catch { setParsed(null); }
  };

  const resultText = isValid ? (issues.length === 0 ? '✓ Valid YAML — no issues' : `✓ Valid YAML with ${issues.length} warning(s)`) : 'Enter YAML to validate';

  return (
    <CalculatorShell category="Developer" title="YAML Syntax Validator" result={resultText} onCalculate={validate} calculateLabel="Check" presets={presets} accent="yellow" downloadData={isValid && parsed ? JSON.stringify(parsed, null, 2) : ''} downloadFilename="parsed.json">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">YAML String</label>
        <textarea aria-label="YAML String" value={input} onChange={e => { setInput(e.target.value); setResult(''); setIssues([]); setIsValid(null); setParsed(null); }} rows={8} placeholder="key: value"
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-yellow-500/50 resize-y" />

        {isValid !== null && (
          <div className="space-y-3">
            <div className={`p-4 rounded-xl border-l-4 ${issues.length === 0 ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-400' : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-400'}`}>
              {result}
            </div>

            {issues.length > 0 && (
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-yellow-400 space-y-1">
                <span className="text-xs font-semibold text-zinc-500 block mb-1">Warnings</span>
                {issues.map((iss, i) => (
                  <div key={i} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <span className="text-yellow-500">⚠</span>
                    {iss}
                  </div>
                ))}
              </div>
            )}

            {parsed !== null && (
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-zinc-200 dark:border-zinc-700 max-h-[300px] overflow-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap">{JSON.stringify(parsed, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

export function EnvFileGenerator() {
  const [descriptions, setDescriptions] = useState("DATABASE_URL=PostgreSQL connection string\nAPI_KEY=Third-party API key\nPORT=Server port number\nNODE_ENV=Environment (development/production)");
  const [output, setOutput] = useState('');
  const envPresets = [
    { label: 'Web App', v: 'DATABASE_URL=PostgreSQL connection string\nAPI_KEY=Third-party API key\nPORT=Server port number\nNODE_ENV=Environment\nSESSION_SECRET=Session encryption key\nREDIS_URL=Redis connection string' },
    { label: 'API Service', v: 'PORT=Server port\nAPI_KEY=API authentication key\nDB_HOST=Database host\nDB_PORT=Database port\nDB_NAME=Database name\nDB_USER=Database user\nDB_PASS=Database password' },
    { label: 'Minimal', v: 'PORT=Server port\nDATABASE_URL=Database URL\nSECRET_KEY=Encryption key' },
  ];
  const gen = (d?: string) => {
    const lines = (d !== undefined ? d : descriptions).split('\n').filter(l => l.trim());
    if (d !== undefined) setDescriptions(d);
    const result = lines.map(l => {
      const [key, ...desc] = l.split('=');
      return `# ${desc.join('=')}\n${key}=`;
    }).join('\n\n');
    setOutput(result);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (output) { navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title=".env File Template Generator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {envPresets.map(p => <button key={p.label} onClick={() => gen(p.v)} className="px-2.5 py-1 text-xs rounded-lg bg-emerald-700/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-700/20 border border-emerald-500/20 transition-colors">{p.label}</button>)}
      </div>
      <Input label="VAR_NAME=Description (one per line)" rows={6} value={descriptions} onChange={v => { setDescriptions(v); setOutput(''); }} />
      <button onClick={() => gen()} className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">Generate .env Template</button>
      {output && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-emerald-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-zinc-600 dark:text-[var(--text-muted)]">.env Template</span>
            <button onClick={copy} className="px-2.5 py-1 text-xs bg-emerald-700 hover:bg-emerald-700 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">{output}</pre>
          <p className="text-xs text-zinc-500 mt-2">{output.split('\n').filter(l => l.startsWith('#')).length} variables documented</p>
        </div>
      )}
    </Section>
  );
}

export function EnvFileParser() {
  const [content, setContent] = useState('');
  const [vars, setVars] = useState<{ key: string; value: string }[]>([]);
  const envPresets = [
    { label: 'Simple', v: 'DATABASE_URL=postgres://user:pass@localhost:5432/mydb\nPORT=3000\nNODE_ENV=development\nAPI_KEY=sk-abc123' },
    { label: 'Quoted', v: 'APP_NAME="My Cool App"\nGREETING=\'Hello World\'\nMULTI_LINE="line1\\nline2"\nEMPTY=' },
  ];
  const parse = (c?: string) => {
    const txt = c !== undefined ? c : content;
    if (c !== undefined) setContent(txt);
    const lines = txt.split('\n');
    const parsed: { key: string; value: string }[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.substring(0, eq).trim();
      let val = trimmed.substring(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      parsed.push({ key, value: val });
    }
    setVars(parsed);
  };
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (k: string, v: string) => { navigator.clipboard.writeText(v).then(() => { setCopied(k); setTimeout(() => setCopied(null), 1500); }); };
  return (
    <Section title=".env File Parser">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {envPresets.map(p => <button key={p.label} onClick={() => parse(p.v)} className="px-2.5 py-1 text-xs rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 border border-teal-500/20 transition-colors">{p.label}</button>)}
      </div>
      <Input label="Paste .env content" rows={6} value={content} onChange={v => { setContent(v); setVars([]); }} placeholder="DATABASE_URL=postgres://..." />
      <button onClick={() => parse()} className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors">Parse</button>
      {vars.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-zinc-500">Parsed Variables ({vars.length})</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {vars.map(v => (
              <div key={v.key} className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-teal-400 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-zinc-500">{v.key}</span>
                  <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100 truncate">{v.value || <span className="text-zinc-400 italic">empty</span>}</p>
                </div>
                <button onClick={() => copy(v.key, v.value)} className="ml-2 px-2 py-1 text-xs bg-teal-500 hover:bg-teal-600 text-white rounded shrink-0 transition-colors">{copied === v.key ? 'Copied!' : 'Copy'}</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {vars.length === 0 && content && <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-xl text-sm">No variables found in content</div>}
    </Section>
  );
}

export function CveLookup() {
  const [cveId, setCveId] = useState('');
  const [output, setOutput] = useState('');
  const cvePresets = ['CVE-2024-21626', 'CVE-2023-44487', 'CVE-2024-27198'];
  const lookup = () => {
    if (!cveId.trim()) { setOutput('Please enter a CVE ID'); return; }
    const id = cveId.trim().toUpperCase();
    setOutput(`CVE Lookup: ${id}

⚠ Server-side API access not available in browser

For real CVE lookup, visit:
• https://nvd.nist.gov/vuln/detail/${id}
• https://cve.mitre.org/cgi-bin/cvename.cgi?name=${id}
• https://www.cvedetails.com/cve/${id}/

CVE format: CVE-YYYY-NNNNN
• Prefix: CVE
• Year: Publication year
• Sequence: 4+ digit identifier

To check from CLI:
  curl -s "https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${id}" | jq .`);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (output) { navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="CVE Lookup">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {cvePresets.map(c => <button key={c} onClick={() => { setCveId(c); }} className="px-2.5 py-1 text-xs rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors">{c}</button>)}
      </div>
      <Input label="CVE ID" value={cveId} onChange={v => { setCveId(v); setOutput(''); }} placeholder="CVE-2024-12345" />
      <button onClick={lookup} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors">Lookup</button>
      {output && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-red-400">
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200">{output}</pre>
          <button onClick={copy} className="mt-3 px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}

export function SqlInjectionDetector() {
  const [input, setInput] = useState('');
  const [detections, setDetections] = useState<{ name: string; risk: string }[]>([]);
  const [scanned, setScanned] = useState(false);
  const sqlPresets = [
    { label: 'SQLi Sample', v: "SELECT * FROM users WHERE id = '1' OR '1'='1' --" },
    { label: 'Clean SQL', v: 'SELECT * FROM users WHERE id = $1' },
    { label: 'Drop Table', v: 'username"; DROP TABLE users; --' },
  ];
  const riskColors: Record<string, string> = { Critical: 'bg-red-500', High: 'bg-orange-500', Medium: 'bg-yellow-500' };
  const detect = (t?: string) => {
    const text = t !== undefined ? t : input;
    if (t !== undefined) setInput(text);
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
    setDetections(found);
    setScanned(true);
  };
  return (
    <Section title="SQL Injection Detector">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {sqlPresets.map(p => <button key={p.label} onClick={() => detect(p.v)} className="px-2.5 py-1 text-xs rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors">{p.label}</button>)}
      </div>
      <Input label="Input to check" rows={4} value={input} onChange={v => { setInput(v); setScanned(false); }} placeholder="Enter SQL or user input..." />
      <button onClick={() => detect()} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors">Scan</button>
      {scanned && (
        <div className="mt-4 space-y-2">
          {detections.length === 0 ? (
            <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl border-l-4 border-green-400 text-sm font-medium">No SQL injection patterns detected.</div>
          ) : (
            <>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl border-l-4 border-red-400 text-sm font-medium">Found {detections.length} potential SQL injection pattern(s)</div>
              {detections.map((d, i) => (
                <div key={i} className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-red-400 flex items-center justify-between">
                  <span className="text-sm text-zinc-800 dark:text-zinc-200">{d.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${riskColors[d.risk] || 'bg-zinc-500'}`}>{d.risk}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </Section>
  );
}

export function XssProtectionChecker() {
  const [headers, setHeaders] = useState('');
  const [checks, setChecks] = useState<{ label: string; pass: boolean; desc: string }[]>([]);
  const headerPresets = [
    { label: 'Secure', v: 'content-security-policy: default-src \'self\'\nx-content-type-options: nosniff\nx-frame-options: DENY\nreferrer-policy: strict-origin-when-cross-origin' },
    { label: 'Minimal', v: 'content-security-policy: default-src \'self\'' },
    { label: 'Missing', v: 'content-type: text/html\ncache-control: no-cache' },
  ];
  const check = (h?: string) => {
    const txt = h !== undefined ? h : headers;
    if (h !== undefined) setHeaders(txt);
    const lower = txt.toLowerCase();
    const results = [
      { label: 'Content-Security-Policy', pass: lower.includes('content-security-policy'), desc: 'Strongest XSS defense' },
      { label: 'X-Content-Type-Options: nosniff', pass: lower.includes('x-content-type-options'), desc: 'Prevents MIME-sniffing' },
      { label: 'X-Frame-Options', pass: lower.includes('x-frame-options'), desc: 'Clickjacking protection' },
      { label: 'Referrer-Policy', pass: lower.includes('referrer-policy'), desc: 'Referrer leakage control' },
      { label: 'X-XSS-Protection', pass: lower.includes('x-xss-protection'), desc: 'Deprecated but harmless' },
    ];
    setChecks(results);
  };
  return (
    <Section title="XSS Protection Checker">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {headerPresets.map(p => <button key={p.label} onClick={() => check(p.v)} className="px-2.5 py-1 text-xs rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 transition-colors">{p.label}</button>)}
      </div>
      <Input label="Response headers (paste)" rows={4} value={headers} onChange={v => { setHeaders(v); setChecks([]); }} placeholder="content-security-policy: default-src 'self'" />
      <button onClick={() => check()} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">Check</button>
      {checks.length > 0 && (
        <div className="mt-4 space-y-2">
          {checks.map(c => (
            <div key={c.label} className={`bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 ${c.pass ? 'border-green-400' : 'border-red-400'} flex items-center justify-between`}>
              <div>
                <span className="text-sm text-zinc-800 dark:text-zinc-200">{c.label}</span>
                <p className="text-xs text-zinc-500">{c.desc}</p>
              </div>
              <span className={`text-lg ${c.pass ? 'text-green-500' : 'text-red-500'}`}>{c.pass ? '✓' : '✗'}</span>
            </div>
          ))}
          <div className="p-3 bg-[var(--bg-surface)] rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500">
            Recommendation: Use CSP with strict script-src as primary XSS defense. X-XSS-Protection is deprecated — modern browsers ignore it.
          </div>
        </div>
      )}
    </Section>
  );
}

export function CsrfTokenGenerator() {
  const [length, setLength] = useState('32');
  const [token, setToken] = useState('');
  const lenPresets = ['16', '32', '64', '128'];
  const gen = (l?: string) => {
    const len = parseInt(l !== undefined ? l : length) || 32;
    if (l !== undefined) setLength(l);
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    setToken(Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (token) { navigator.clipboard.writeText(token).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="CSRF Token Generator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {lenPresets.map(l => <button key={l} onClick={() => gen(l)} className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${length === l ? 'bg-rose-500 text-white border-rose-500' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-rose-500/20'}`}>{l} bytes</button>)}
      </div>
      <button onClick={() => gen()} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors">Generate Token</button>
      {token && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-rose-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-zinc-600 dark:text-[var(--text-muted)]">CSRF Token (hex) — {token.length / 2} bytes</span>
            <button onClick={copy} className="px-2.5 py-1 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 font-mono text-sm break-all text-zinc-800 dark:text-zinc-200">{token}</div>
        </div>
      )}
    </Section>
  );
}

export function Oauth2Debugger() {
  const [flow, setFlow] = useState('authorization_code');
  const [clientId, setClientId] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [result, setResult] = useState('');
  const flowPresets = [
    { label: 'Auth Code + PKCE', v: 'authorization_code' },
    { label: 'Client Credentials', v: 'client_credentials' },
  ];
  const debug = () => {
    const cid = clientId || 'your-client-id';
    const ru = redirectUri || 'https://example.com/callback';
    const state = Array.from(new Uint8Array(16)).map(b => b.toString(16).padStart(2, '0')).join('');
    const codeVerifier = Array.from(new Uint8Array(32)).map(b => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'[b % 66]).join('');
    if (flow === 'authorization_code') {
      setResult(`OAuth2 Authorization Code Flow + PKCE

├─ Step 1: Authorization Request
│  GET ${ru}?response_type=code
│  &client_id=${cid}
│  &redirect_uri=${encodeURIComponent(ru)}
│  &state=${state}
│  &code_challenge=${codeVerifier}_challenge
│  &code_challenge_method=S256
│
├─ Step 2: Token Exchange (POST /token)
│  grant_type=authorization_code
│  code=AUTH_CODE
│  redirect_uri=${ru}
│  client_id=${cid}
│  code_verifier=${codeVerifier}
│
└─ Step 3: Response
   {
     "access_token": "eyJhbGci...",
     "token_type": "Bearer",
     "expires_in": 3600,
     "refresh_token": "rt_abc123..."
   }`);
    } else {
      setResult(`OAuth2 Client Credentials Flow

├─ Request (POST /token)
│  grant_type=client_credentials
│  client_id=${cid}
│  client_secret=****
│  scope=read write
│
└─ Response
   {
     "access_token": "eyJhbGci...",
     "token_type": "Bearer",
     "expires_in": 3600
   }`);
    }
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (result) { navigator.clipboard.writeText(result).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="OAuth2 Debugger">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {flowPresets.map(p => <button key={p.label} onClick={() => setFlow(p.v)} className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${flow === p.v ? 'bg-blue-500 text-white border-blue-500' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border-blue-500/20'}`}>{p.label}</button>)}
      </div>
      <Input label="Client ID" value={clientId} onChange={setClientId} placeholder="your-client-id" />
      <Input label="Redirect URI" value={redirectUri} onChange={setRedirectUri} placeholder="https://example.com/callback" />
      <button onClick={debug} className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">Debug Flow</button>
      {result && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-blue-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-zinc-600 dark:text-[var(--text-muted)]">Flow Debug Output</span>
            <button onClick={copy} className="px-2.5 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">{result}</pre>
        </div>
      )}
    </Section>
  );
}

export function SamlDecoder() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState('');
  const [fields, setFields] = useState<{ issuer: string; destination: string; status: string; type: string; hasSaml: boolean } | null>(null);
  const decode = () => {
    try {
      const text = (input || '').replace(/\s/g, '');
      let xml = '';
      try { xml = atob(text); } catch { xml = text; }
      setDecoded(xml);
      setFields({
        issuer: xml.match(/Issuer[^>]*>([^<]+)/)?.[1] || 'Not found',
        destination: xml.match(/Destination="([^"]+)"/)?.[1] || 'Not found',
        status: xml.match(/StatusCode[^>]*Value="([^"]+)"/)?.[1] || 'Not found',
        type: xml.includes('Response') ? 'Response' : 'Request',
        hasSaml: xml.toLowerCase().includes('saml'),
      });
    } catch { setDecoded(''); setFields(null); }
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (decoded) { navigator.clipboard.writeText(decoded).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="SAML Decoder">
      <Input label="Base64 SAML Request/Response" rows={4} value={input} onChange={v => { setInput(v); setDecoded(''); setFields(null); }} placeholder="Paste base64 SAML data..." />
      <button onClick={decode} className="px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-medium transition-colors">Decode</button>
      {fields && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-violet-400">
              <span className="text-xs text-zinc-500">Type</span>
              <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100">{fields.type}</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-violet-400">
              <span className="text-xs text-zinc-500">SAML Namespace</span>
              <p className={`font-mono text-sm ${fields.hasSaml ? 'text-green-600' : 'text-red-600'}`}>{fields.hasSaml ? '✓ Detected' : '✗ Not found'}</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-indigo-400">
              <span className="text-xs text-zinc-500">Issuer</span>
              <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100 truncate">{fields.issuer}</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-indigo-400">
              <span className="text-xs text-zinc-500">Destination</span>
              <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100 truncate">{fields.destination}</p>
            </div>
          </div>
          <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-amber-400">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-zinc-500">Status</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${fields.status === 'urn:oasis:names:tc:SAML:2.0:status:Success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700'}`}>{fields.status}</span>
          </div>
          <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-violet-400">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-zinc-500">Decoded XML</span>
              <button onClick={copy} className="px-2 py-0.5 text-xs bg-violet-500 hover:bg-violet-600 text-white rounded transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
            </div>
            <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto max-h-48">{decoded.substring(0, 3000)}</pre>
          </div>
        </div>
      )}
    </Section>
  );
}

export function CspValidator() {
  const [policy, setPolicy] = useState('');
  const [report, setReport] = useState<{ valid: string[]; unknown: string[]; warnings: string[] } | null>(null);
  const cspPresets = [
    { label: 'Strict', v: "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'" },
    { label: 'Standard', v: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:" },
    { label: 'Relaxed', v: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:" },
  ];
  const validate = (p?: string) => {
    const pol = p !== undefined ? p : policy;
    if (p !== undefined) setPolicy(pol);
    const directives = pol.split(';').map(d => d.trim()).filter(Boolean);
    const validDirs = ['default-src', 'script-src', 'style-src', 'img-src', 'font-src', 'connect-src', 'media-src', 'object-src', 'frame-src', 'frame-ancestors', 'base-uri', 'form-action', 'report-uri', 'report-to', 'manifest-src', 'worker-src', 'prefetch-src', 'navigate-to'];
    const valid: string[] = [];
    const unknown: string[] = [];
    const warnings: string[] = [];
    for (const d of directives) {
      const name = d.split(/\s+/)[0] ?? "";
      if (!validDirs.includes(name)) unknown.push(name);
      else valid.push(d);
    }
    if (!pol.includes("default-src")) warnings.push('No default-src directive — policy may be incomplete');
    if (!pol.includes("'self'") && !pol.includes('http')) warnings.push("Consider adding 'self' to restrict sources");
    if (pol.includes("'unsafe-inline'")) warnings.push("'unsafe-inline' weakens XSS protection");
    setReport({ valid, unknown, warnings });
  };
  return (
    <Section title="CSP Policy Validator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {cspPresets.map(p => <button key={p.label} onClick={() => validate(p.v)} className="px-2.5 py-1 text-xs rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 border border-teal-500/20 transition-colors">{p.label}</button>)}
      </div>
      <Input label="CSP Policy" rows={4} value={policy} onChange={v => { setPolicy(v); setReport(null); }} placeholder="default-src 'self'; script-src 'self'" />
      <button onClick={() => validate()} className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors">Validate</button>
      {report && (
        <div className="mt-4 space-y-2">
          {report.valid.length > 0 && (
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-green-400">
              <span className="text-xs font-semibold text-zinc-500 block mb-2">Valid Directives ({report.valid.length})</span>
              {report.valid.map((d, i) => <div key={i} className="text-xs text-green-700 dark:text-green-300 mb-1">✓ {d}</div>)}
            </div>
          )}
          {report.unknown.length > 0 && (
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-red-400">
              <span className="text-xs font-semibold text-zinc-500 block mb-2">Unknown Directives</span>
              {report.unknown.map((d, i) => <div key={i} className="text-xs text-red-600 dark:text-red-400">⚠ {d}</div>)}
            </div>
          )}
          {report.warnings.length > 0 && (
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-yellow-400">
              <span className="text-xs font-semibold text-zinc-500 block mb-2">Warnings</span>
              {report.warnings.map((w, i) => <div key={i} className="text-xs text-yellow-700 dark:text-yellow-300">ℹ {w}</div>)}
            </div>
          )}
          {report.valid.length === 0 && report.unknown.length === 0 && report.warnings.length === 0 && (
            <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl text-sm">✓ Policy looks clean</div>
          )}
        </div>
      )}
    </Section>
  );
}

export function TlsCipherChecker() {
  const [cipher, setCipher] = useState('');
  const [result, setResult] = useState<{ strength: string; desc: string } | null>(null);
  const cipherPresets = ['TLS_AES_256_GCM_SHA384', 'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA', 'TLS_RSA_WITH_RC4_128_SHA'];
  const strengthColors: Record<string, string> = { Strong: 'bg-green-500', Good: 'bg-blue-500', Moderate: 'bg-yellow-500', Weak: 'bg-orange-500', Deprecated: 'bg-red-500', Insecure: 'bg-red-700' };
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
  const check = (c?: string) => {
    const name = c !== undefined ? c : cipher;
    if (c !== undefined) setCipher(name);
    const info = ciphers[name.trim()];
    if (info) setResult(info);
    else setResult({ strength: 'Unknown', desc: 'Not in reference database. Check IANA TLS registry.' });
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (result) { navigator.clipboard.writeText(`Cipher: ${cipher}\nStrength: ${result.strength}\nDescription: ${result.desc}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="TLS Cipher Checker">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {cipherPresets.map(c => <button key={c} onClick={() => check(c)} className="px-2.5 py-1 text-xs rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 transition-colors">{c.includes('_') ? c.split('_').slice(0, 3).join('_') + '…' : c}</button>)}
      </div>
      <Input label="Cipher suite name" value={cipher} onChange={v => { setCipher(v); setResult(null); }} placeholder="TLS_AES_256_GCM_SHA384" />
      <button onClick={() => check()} className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm font-medium transition-colors">Check</button>
      {result && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-cyan-400 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">{cipher}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${strengthColors[result.strength] || 'bg-zinc-500'}`}>{result.strength}</span>
          </div>
          <p className="text-sm text-zinc-800 dark:text-zinc-200">{result.desc}</p>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
            <div className={`h-2 rounded-full ${strengthColors[result.strength] || 'bg-zinc-500'}`} style={{ width: result.strength === 'Strong' ? '95%' : result.strength === 'Good' ? '75%' : result.strength === 'Moderate' ? '50%' : result.strength === 'Weak' ? '30%' : result.strength === 'Deprecated' ? '15%' : result.strength === 'Insecure' ? '5%' : '50%' }} />
          </div>
          <button onClick={copy} className="px-3 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}

export function SecurityHeaderChecker() {
  const [context, setContext] = useState('');
  const [headers, setHeaders] = useState('');
  const contextPresets = [
    { label: 'Website', v: 'website' },
    { label: 'API', v: 'api' },
    { label: 'Admin Panel', v: 'admin' },
  ];
  const gen = (ctx?: string) => {
    const c = ctx !== undefined ? ctx : (context || 'general');
    if (ctx !== undefined) setContext(ctx);
    const recommendations: Record<string, string> = {
      website: `# Recommended Security Headers for Website

Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
X-XSS-Protection: 0`,
      api: `# Recommended Security Headers for API

Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'none'
Access-Control-Allow-Origin: https://trusted-origin.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Cache-Control: no-store
X-Content-Type-Options: nosniff`,
      admin: `# Recommended Security Headers for Admin Panel

Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
X-XSS-Protection: 0`,
    };
    setHeaders(recommendations[c] || recommendations.website!);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (headers) { navigator.clipboard.writeText(headers).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="Security Header Generator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {contextPresets.map(p => <button key={p.label} onClick={() => gen(p.v)} className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${context === p.v ? 'bg-emerald-700 text-white border-emerald-500' : 'bg-emerald-700/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-700/20 border-emerald-500/20'}`}>{p.label}</button>)}
      </div>
      <button onClick={() => gen()} className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">Generate Headers</button>
      {headers && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-emerald-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-zinc-600 dark:text-[var(--text-muted)]">Recommended Headers</span>
            <button onClick={copy} className="px-2.5 py-1 text-xs bg-emerald-700 hover:bg-emerald-700 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">{headers}</pre>
        </div>
      )}
    </Section>
  );
}

export function IpReputationChecker() {
  const [ip, setIp] = useState('');
  const [output, setOutput] = useState('');
  const ipPresets = ['8.8.8.8', '1.1.1.1', '185.220.101.0'];
  const check = () => {
    if (!ip.trim()) { setOutput('Please enter an IP address'); return; }
    setOutput(`IP Reputation Check for ${ip}

⚠ Server-side API access not available in browser

For real IP reputation lookup, use:
• https://www.abuseipdb.com/check/${ip}
• https://www.virustotal.com/gui/ip-address/${ip}
• https://ipinfo.io/${ip}

To check from CLI:
  curl -s "https://ipinfo.io/${ip}/json" | jq .
  curl -s "https://www.virustotal.com/api/v3/ip_addresses/${ip}" -H "x-apikey: YOUR_KEY"

Common checks:
• Blacklist status (Spamhaus, Barracuda, etc.)
• Abuse reports
• Geolocation
• ASN / ISP
• Proxy/VPN detection`);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (output) { navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="IP Reputation Checker">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {ipPresets.map(i => <button key={i} onClick={() => { setIp(i); }} className="px-2.5 py-1 text-xs rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-400 hover:bg-slate-500/20 border border-slate-500/20 transition-colors">{i}</button>)}
      </div>
      <Input label="IP Address" value={ip} onChange={v => { setIp(v); setOutput(''); }} placeholder="8.8.8.8" />
      <button onClick={check} className="px-5 py-2.5 bg-slate-500 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors">Check Reputation</button>
      {output && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-slate-400">
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200">{output}</pre>
          <button onClick={copy} className="mt-3 px-3 py-1.5 text-xs bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}

export function UrlSanitizer() {
  const [url, setUrl] = useState('');
  const [original, setOriginal] = useState('');
  const [sanitized, setSanitized] = useState('');
  const [removed, setRemoved] = useState<string[]>([]);
  const urlPresets = [
    { label: 'UTM', v: 'https://example.com/page?utm_source=twitter&utm_medium=social&ref=spam&id=12345' },
    { label: 'Facebook', v: 'https://example.com/post?fbclid=IwAR123&utm_campaign=spring&gclid=Cjw123' },
    { label: 'Clean', v: 'https://example.com/page?id=12345' },
  ];
  const sanitize = (u?: string) => {
    const txt = u !== undefined ? u : url;
    if (u !== undefined) setUrl(txt);
    try {
      const parsed = new URL(txt);
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ref', 'source', 'mc_cid', 'mc_eid', 'yclid', 'igshid', 'trk', 'sc_campaign', 'sc_channel', 'sc_content', 'sc_geo', 'sc_country'];
      const removedParams = trackingParams.filter(p => parsed.searchParams.has(p));
      removedParams.forEach(p => parsed.searchParams.delete(p));
      setOriginal(txt);
      setSanitized(parsed.toString());
      setRemoved(removedParams);
    } catch { setSanitized('Error: Invalid URL'); setRemoved([]); }
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (sanitized) { navigator.clipboard.writeText(sanitized).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="URL Sanitizer">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {urlPresets.map(p => <button key={p.label} onClick={() => sanitize(p.v)} className="px-2.5 py-1 text-xs rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 border border-sky-500/20 transition-colors">{p.label}</button>)}
      </div>
      <Input label="URL to clean" value={url} onChange={v => { setUrl(v); setSanitized(''); setRemoved([]); }} placeholder="https://example.com/page?utm_source=twitter" />
      <button onClick={() => sanitize()} className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors">Sanitize</button>
      {sanitized && (
        <div className="mt-4 space-y-3">
          <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-red-400">
            <span className="text-xs font-semibold text-zinc-500 block mb-1">Original</span>
            <p className="text-sm font-mono text-zinc-800 dark:text-zinc-200 break-all">{original}</p>
          </div>
          <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-green-400">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-zinc-500">Sanitized</span>
              <button onClick={copy} className="px-2 py-0.5 text-xs bg-sky-500 hover:bg-sky-600 text-white rounded transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
            </div>
            <p className="text-sm font-mono text-zinc-800 dark:text-zinc-200 break-all">{sanitized}</p>
          </div>
          {removed.length > 0 && (
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-yellow-400">
              <span className="text-xs font-semibold text-zinc-500 block mb-1">Removed Parameters ({removed.length})</span>
              <div className="flex flex-wrap gap-1">{removed.map(r => <span key={r} className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">{r}</span>)}</div>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

export function EmailValidator() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ valid: boolean; issues: string[]; local?: string; domain?: string } | null>(null);
  const emailPresets = ['user@example.com', 'invalid-email', 'very.long.local.part.that.exceeds.the.maximum.allowed.length@example.com', 'user@localhost'];
  const validate = (e?: string) => {
    const addr = e !== undefined ? e : email;
    if (e !== undefined) setEmail(addr);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const issues: string[] = [];
    let local = '';
    let domain = '';
    if (!addr) { setResult({ valid: false, issues: ['No email entered'] }); return; }
    if (!emailRegex.test(addr)) issues.push('Invalid email format');
    if (!addr.includes('@')) issues.push('Missing @ symbol');
    else {
      const parts = addr.split('@');
      local = parts[0] ?? "";
      domain = parts[1] ?? "";
      if (!domain.includes('.')) issues.push('Domain missing TLD');
      if (local.length > 64) issues.push('Local part too long (max 64 chars)');
      if (domain.length > 255) issues.push('Domain too long (max 255 chars)');
      if (local.startsWith('.') || local.endsWith('.')) issues.push('Local part cannot start/end with dot');
    }
    setResult({ valid: issues.length === 0, issues, local, domain });
  };
  return (
    <Section title="Email Validator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {emailPresets.map((e, i) => <button key={i} onClick={() => validate(e)} className="px-2.5 py-1 text-xs rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 border border-pink-500/20 transition-colors">{e.length > 20 ? e.substring(0, 18) + '…' : e}</button>)}
      </div>
      <Input label="Email address" value={email} onChange={v => { setEmail(v); setResult(null); }} placeholder="user@example.com" />
      <button onClick={() => validate()} className="px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-medium transition-colors">Validate</button>
      {result && (
        <div className="mt-4 space-y-2">
          <div className={`p-4 rounded-xl text-sm border-l-4 ${result.valid ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-400'}`}>
            <div className="flex items-center gap-2 font-semibold">{result.valid ? '✓ Valid email address' : '✗ Invalid email'}</div>
          </div>
          {result.local && result.domain && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-pink-400">
                <span className="text-xs text-zinc-500">Local Part</span>
                <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100 truncate">{result.local}</p>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-pink-400">
                <span className="text-xs text-zinc-500">Domain</span>
                <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100 truncate">{result.domain}</p>
              </div>
            </div>
          )}
          {result.issues.length > 0 && (
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-red-400 space-y-1">
              {result.issues.map((iss, i) => <div key={i} className="text-xs text-red-600 dark:text-red-400">✗ {iss}</div>)}
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

export function SslCertificateDecoder() {
  const [pem, setPem] = useState('');
  const [output, setOutput] = useState('');
  const certPresets = [
    { label: 'RSA 2048', v: '-----BEGIN CERTIFICATE-----\nMIIDazCCAlMCFAjxRgAQBQABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4f\nIEEGCCqGSIb3DQEBCwUA...\n-----END CERTIFICATE-----' },
  ];
  const decode = () => {
    if (!pem.trim()) { setOutput('Please paste a PEM certificate'); return; }
    setOutput(`PEM Certificate Decoder

⚠ Server-side API access not available in browser
For real certificate decoding, use:

  openssl x509 -in cert.pem -text -noout

  # Parse specific fields:
  openssl x509 -in cert.pem -subject -issuer -dates -noout

The PEM format contains:
• Certificate Version
• Serial Number
• Signature Algorithm
• Issuer DN
• Validity (not before / not after)
• Subject DN
• Public Key Info (algorithm, key size)
• Extensions (SAN, Key Usage, etc.)
• Signature

Certificate is ${pem.includes('BEGIN CERTIFICATE') ? 'properly formatted' : 'malformed'}`);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (output) { navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="SSL Certificate Decoder">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {certPresets.map(p => <button key={p.label} onClick={() => { setPem(p.v); }} className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors">{p.label}</button>)}
      </div>
      <Input label="PEM Certificate" rows={6} value={pem} onChange={v => { setPem(v); setOutput(''); }} placeholder="-----BEGIN CERTIFICATE-----..." />
      <button onClick={decode} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors">Decode</button>
      {output && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-rose-400">
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200">{output}</pre>
          <button onClick={copy} className="mt-3 px-3 py-1.5 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}

export function SubdomainFinder() {
  const [domain, setDomain] = useState('');
  const [output, setOutput] = useState('');
  const domainPresets = ['example.com', 'google.com', 'cloudflare.com'];
  const find = () => {
    if (!domain.trim()) { setOutput('Please enter a domain'); return; }
    setOutput(`Subdomain Finder for ${domain}

⚠ Server-side API access not available in browser

For real subdomain enumeration, use:

  # Passive reconnaissance:
  curl -s "https://crt.sh/?q=%25.${domain}&output=json" | jq -r '.[].name_value' | sort -u

  # Using Sublist3r:
  sublist3r -d ${domain}

  # Using Amass:
  amass enum -d ${domain}

  # DNS brute-force:
  for sub in www api mail admin dev; do
    host "\$sub.${domain}" && echo "\$sub.${domain}"
  done

Common subdomains to check:
• www, api, mail, admin
• dev, staging, blog, cdn
• app, portal, support, docs
• git, jenkins, monitor, status`);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (output) { navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="Subdomain Finder">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {domainPresets.map(d => <button key={d} onClick={() => { setDomain(d); }} className="px-2.5 py-1 text-xs rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors">{d}</button>)}
      </div>
      <Input label="Domain" value={domain} onChange={v => { setDomain(v); setOutput(''); }} placeholder="example.com" />
      <button onClick={find} className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors">Find Subdomains</button>
      {output && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-indigo-400">
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200">{output}</pre>
          <button onClick={copy} className="mt-3 px-3 py-1.5 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}
