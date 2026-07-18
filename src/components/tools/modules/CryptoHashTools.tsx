"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Shield, Unlock, Copy } from 'lucide-react';
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

export function AesEncrypt() {
  const [input, setInput] = useState('');
  const [pass, setPass] = useState('');
  const [result, setResult] = useState('');

  const handleEncrypt = () => {
    if (!input.trim() || !pass.trim()) { toast.error('Enter both text and passphrase'); return; }
    setResult(CryptoJS.AES.encrypt(input, pass).toString());
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500 space-y-4">
      <Section title="AES Encrypt">
        <Input label="Passphrase" type="password" value={pass} onChange={setPass} placeholder="Enter passphrase..." />
        <Input label="Plain text" value={input} onChange={setInput} placeholder="Enter text to encrypt..." rows={5} />
        <button onClick={handleEncrypt} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"><Unlock className="w-4 h-4 inline mr-1.5" /> Encrypt</button>
        {result && <Output value={result} label="Ciphertext" />}
      </Section>
    </div>
  );
}

export function AesDecrypt() {
  const [input, setInput] = useState('');
  const [pass, setPass] = useState('');
  const [result, setResult] = useState('');

  const handleDecrypt = () => {
    if (!input.trim() || !pass.trim()) { toast.error('Enter both ciphertext and passphrase'); return; }
    try {
      const bytes = CryptoJS.AES.decrypt(input, pass);
      const dec = bytes.toString(CryptoJS.enc.Utf8);
      if (!dec) { toast.error('Decryption failed — wrong passphrase or invalid ciphertext'); return; }
      setResult(dec);
    } catch { toast.error('Decryption failed — invalid input'); }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500 space-y-4">
      <Section title="AES Decrypt">
        <Input label="Passphrase" type="password" value={pass} onChange={setPass} placeholder="Enter passphrase..." />
        <Input label="Ciphertext" value={input} onChange={setInput} placeholder="Paste ciphertext..." rows={5} />
        <button onClick={handleDecrypt} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"><Unlock className="w-4 h-4 inline mr-1.5" /> Decrypt</button>
        {result && <Output value={result} label="Decrypted text" />}
      </Section>
    </div>
  );
}
