"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Shield, Copy } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { clipboardWrite } from "@/lib/clipboard";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", rows }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; rows?: number;
}) {
  const cls = "w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50";
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
  const copy = () => { clipboardWrite(value); toast.success(`${label || 'Value'} copied!`); };
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label || 'Output'}</label>
      <pre className="text-sm font-mono bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap break-all max-h-40 overflow-y-auto">{value}</pre>
      <button onClick={copy} className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</button>
    </div>
  );
}

function StrengthMeter({ password }: { password: string }) {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;
    return Math.min(5, score);
  };

  const strength = getStrength();
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-emerald-500'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < strength ? colors[strength] : 'bg-zinc-200 dark:bg-zinc-700'} transition-colors`} />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
        <span>{labels[strength]}</span>
        <span>{password.length} chars</span>
      </div>
    </div>
  );
}

function AesTool({ defaultMode = 'encrypt' }: { defaultMode?: 'encrypt' | 'decrypt' }) {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>(defaultMode);
  const [input, setInput] = useState('');
  const [pass, setPass] = useState('');
  const [result, setResult] = useState('');
  const [algorithm, setAlgorithm] = useState<'AES-128' | 'AES-256'>('AES-256');
  const [outputFormat, setOutputFormat] = useState<'Base64' | 'Hex'>('Base64');
  const [benchmark, setBenchmark] = useState<{ time: number; ops: number } | null>(null);

  const handleAction = useCallback(() => {
    if (!input.trim() || !pass.trim()) { toast.error('Enter both text and passphrase'); return; }

    const startTime = performance.now();

    try {
      if (mode === 'encrypt') {
        const options: any = {};
        if (algorithm === 'AES-256') {
          options.keySize = 256 / 32;
        } else {
          options.keySize = 128 / 32;
        }
        const encrypted = CryptoJS.AES.encrypt(input, pass, options);
        const formatted = outputFormat === 'Hex' ? encrypted.ciphertext.toString(CryptoJS.enc.Hex) : encrypted.toString();
        setResult(formatted);
      } else {
        const bytes = CryptoJS.AES.decrypt(input, pass);
        const dec = bytes.toString(CryptoJS.enc.Utf8);
        if (!dec) { toast.error('Decryption failed — wrong passphrase or invalid ciphertext'); return; }
        setResult(dec);
      }
    } catch {
      toast.error(mode === 'encrypt' ? 'Encryption failed' : 'Decryption failed — invalid input');
      return;
    }

    const elapsed = performance.now() - startTime;
    setBenchmark({ time: elapsed, ops: Math.round(1000 / Math.max(elapsed, 0.1)) });
  }, [input, pass, mode, algorithm, outputFormat]);

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500 space-y-4">
      <Section title={`AES ${mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}`}>
        <div className="flex bg-white dark:bg-black p-1 rounded-xl border border-[var(--border-subtle)] mb-4 w-fit">
          <button
            onClick={() => { setMode('encrypt'); setInput(''); setPass(''); setResult(''); setBenchmark(null); }}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'encrypt'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Encrypt
          </button>
          <button
            onClick={() => { setMode('decrypt'); setInput(''); setPass(''); setResult(''); setBenchmark(null); }}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'decrypt'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Decrypt
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Algorithm</label>
            <select value={algorithm} onChange={e => setAlgorithm(e.target.value as any)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-blue-500/50">
              <option value="AES-128">AES-128 (128-bit)</option>
              <option value="AES-256">AES-256 (256-bit)</option>
            </select>
          </div>
          {mode === 'encrypt' && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Output Format</label>
              <select value={outputFormat} onChange={e => setOutputFormat(e.target.value as any)}
                className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-blue-500/50">
                <option value="Base64">Base64</option>
                <option value="Hex">Hexadecimal</option>
              </select>
            </div>
          )}
        </div>

        <Input label="Passphrase" type="password" value={pass} onChange={setPass} placeholder="Enter passphrase..." />
        <StrengthMeter password={pass} />

        {mode === 'encrypt' && (
          <div className="flex gap-2 mt-2">
            <button onClick={() => { setPass('weak'); }} className="px-2 py-1 text-[10px] font-medium bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors">Weak: "weak"</button>
            <button onClick={() => { setPass('Str0ng!P@ssw0rd#2024'); }} className="px-2 py-1 text-[10px] font-medium bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors">Strong: "Str0ng!P@ssw0rd#2024"</button>
          </div>
        )}

        <Input label={mode === 'encrypt' ? 'Plain text' : 'Ciphertext'} value={input} onChange={setInput}
          placeholder={mode === 'encrypt' ? 'Enter text to encrypt...' : 'Paste ciphertext...'} rows={5} />
        <button onClick={handleAction} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" /> {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
        </button>
        {result && <Output value={result} label={mode === 'encrypt' ? 'Ciphertext' : 'Decrypted text'} />}
        {benchmark && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs text-[var(--text-muted)] flex items-center gap-4">
            <span>Time: <span className="font-mono font-bold text-[var(--text-primary)]">{benchmark.time.toFixed(2)}ms</span></span>
            <span>Throughput: <span className="font-mono font-bold text-[var(--text-primary)]">{benchmark.ops.toLocaleString()} ops/sec</span></span>
          </div>
        )}
      </Section>
    </div>
  );
}

export function AesEncrypt() { return <AesTool key="encrypt" defaultMode="encrypt" />; }
export function AesDecrypt() { return <AesTool key="decrypt" defaultMode="decrypt" />; }
