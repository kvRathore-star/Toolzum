"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Shield, Copy } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { clipboardWrite } from "@/lib/clipboard";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full bg-[var(--bg-overlay)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", rows }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; rows?: number;
}) {
  const cls = "w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50";
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
      <pre className="text-sm font-mono bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap break-all max-h-40 overflow-y-auto">{value}</pre>
      <button onClick={copy} className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</button>
    </div>
  );
}

function AesTool({ defaultMode = 'encrypt' }: { defaultMode?: 'encrypt' | 'decrypt' }) {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>(defaultMode);
  const [input, setInput] = useState('');
  const [pass, setPass] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => { setMode(defaultMode); setInput(''); setPass(''); setResult(''); }, [defaultMode]);

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

  const otherMode = mode === 'encrypt' ? 'decrypt' : 'encrypt';
  const otherLabel = mode === 'encrypt' ? 'Decrypt' : 'Encrypt';

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500 space-y-4">
      <Section title={`AES ${mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}`}>
        <button onClick={() => { setMode(otherMode); setInput(''); setPass(''); setResult(''); }}
          className="mb-4 text-xs text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Need to {otherLabel.toLowerCase()} instead? <span className="font-semibold">Switch to {otherLabel} →</span>
        </button>
        <Input label="Passphrase" type="password" value={pass} onChange={setPass} placeholder="Enter passphrase..." />
        <Input label={mode === 'encrypt' ? 'Plain text' : 'Ciphertext'} value={input} onChange={setInput}
          placeholder={mode === 'encrypt' ? 'Enter text to encrypt...' : 'Paste ciphertext...'} rows={5} />
        <button onClick={handleAction} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">
          <Shield className="w-4 h-4 inline mr-1.5" /> {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
        </button>
        {result && <Output value={result} label={mode === 'encrypt' ? 'Ciphertext' : 'Decrypted text'} />}
      </Section>
    </div>
  );
}

export function AesEncrypt() { return <AesTool defaultMode="encrypt" />; }
export function AesDecrypt() { return <AesTool defaultMode="decrypt" />; }
