"use client";
import React, { useState } from 'react';
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
  const cls = "w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50";
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

function AesTool({ defaultMode = 'encrypt' }: { defaultMode?: 'encrypt' | 'decrypt' }) {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>(defaultMode);
  const [input, setInput] = useState('');
  const [pass, setPass] = useState('');
  const [result, setResult] = useState('');

  const handleAction = () => {
    if (!input.trim() || !pass.trim()) { toast.error('Enter both text and passphrase'); return; }
    if (mode === 'encrypt') {
      setResult(CryptoJS.AES.encrypt(input, pass).toString());
    } else {
      try {
        const bytes = CryptoJS.AES.decrypt(input, pass);
        const dec = bytes.toString(CryptoJS.enc.Utf8);
        if (!dec) { toast.error('Decryption failed — wrong passphrase or invalid ciphertext'); return; }
        setResult(dec);
      } catch { toast.error('Decryption failed — invalid input'); }
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500 space-y-4">
      <Section title={`AES ${mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}`}>
        <div className="flex bg-white dark:bg-black p-1 rounded-xl border border-[var(--border-subtle)] mb-4 w-fit">
          <button
            onClick={() => { setMode('encrypt'); setInput(''); setPass(''); setResult(''); }}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'encrypt'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Encrypt
          </button>
          <button
            onClick={() => { setMode('decrypt'); setInput(''); setPass(''); setResult(''); }}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'decrypt'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Decrypt
          </button>
        </div>
        <Input label="Passphrase" type="password" value={pass} onChange={setPass} placeholder="Enter passphrase..." />
        <Input label={mode === 'encrypt' ? 'Plain text' : 'Ciphertext'} value={input} onChange={setInput}
          placeholder={mode === 'encrypt' ? 'Enter text to encrypt...' : 'Paste ciphertext...'} rows={5} />
        <button onClick={handleAction} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">
          <Shield className="w-4 h-4 inline mr-1.5" /> {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
        </button>
        {result && <Output value={result} label={mode === 'encrypt' ? 'Ciphertext' : 'Decrypted text'} />}
      </Section>
    </div>
  );
}

export function AesEncrypt() { return <AesTool key="encrypt" defaultMode="encrypt" />; }
export function AesDecrypt() { return <AesTool key="decrypt" defaultMode="decrypt" />; }
