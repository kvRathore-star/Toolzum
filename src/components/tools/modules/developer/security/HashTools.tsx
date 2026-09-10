"use client";

import React, { useState } from 'react';
import { CalculatorShell } from '../../shared/CalculatorShell';
import { Section, Input } from './_shared';

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

