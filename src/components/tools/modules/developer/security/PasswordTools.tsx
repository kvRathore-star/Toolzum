"use client";

import React, { useState } from 'react';
import { CalculatorShell } from '../../shared/CalculatorShell';

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
        <label htmlFor="lbl-passwordtools-password" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
        <input id="lbl-passwordtools-password" aria-label="Password" type="password" value={password} onChange={e => { setPassword(e.target.value); setResult(null); }} placeholder="Enter password..."
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

        <label htmlFor="lbl-passwordtools-secret-key-base32" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Secret Key (Base32)</label>
        <input id="lbl-passwordtools-secret-key-base32" aria-label="Secret Key (Base32)" type="text" value={secret} onChange={e => setSecret(e.target.value)} placeholder="Leave blank to generate"
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-blue-500/50" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lbl-passwordtools-issuer" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Issuer</label>
            <input id="lbl-passwordtools-issuer" aria-label="Issuer" type="text" value={issuer} onChange={e => setIssuer(e.target.value)} placeholder="e.g. Toolzum"
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-blue-500/50" />
          </div>
          <div>
            <label htmlFor="lbl-passwordtools-account" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Account</label>
            <input id="lbl-passwordtools-account" aria-label="Account" type="text" value={account} onChange={e => setAccount(e.target.value)} placeholder="e.g. user@example.com"
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
        <label htmlFor="lbl-passwordtools-password-5" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
        <input id="lbl-passwordtools-password-5" aria-label="Password" type="text" value={pwd} onChange={e => { setPwd(e.target.value); setEst(''); setSeverity(''); }} placeholder="Enter password..."
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-amber-500/50" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lbl-passwordtools-attack-rate" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Attack Rate</label>
            <select id="lbl-passwordtools-attack-rate" aria-label="Attack Rate" value={rate} onChange={e => { setRate(e.target.value); calc(); }}
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

