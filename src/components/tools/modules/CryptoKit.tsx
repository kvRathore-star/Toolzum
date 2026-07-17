"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Shield, Unlock, Copy } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { clipboardWrite } from "@/lib/clipboard";

export default function CryptoKit() {
  const [encryptInput, setEncryptInput] = useState('');
  const [encryptPass, setEncryptPass] = useState('');
  const [encryptResult, setEncryptResult] = useState('');
  const [decryptInput, setDecryptInput] = useState('');
  const [decryptPass, setDecryptPass] = useState('');
  const [decryptResult, setDecryptResult] = useState('');

  const handleEncrypt = () => {
    if (!encryptInput.trim() || !encryptPass.trim()) { toast.error('Enter both text and passphrase'); return; }
    setEncryptResult(CryptoJS.AES.encrypt(encryptInput, encryptPass).toString());
  };

  const handleDecrypt = () => {
    if (!decryptInput.trim() || !decryptPass.trim()) { toast.error('Enter both ciphertext and passphrase'); return; }
    try {
      const bytes = CryptoJS.AES.decrypt(decryptInput, decryptPass);
      const dec = bytes.toString(CryptoJS.enc.Utf8);
      if (!dec) { toast.error('Decryption failed — wrong passphrase or invalid ciphertext'); return; }
      setDecryptResult(dec);
    } catch { toast.error('Decryption failed — invalid input'); }
  };

  const copy = (txt: string, label: string) => { clipboardWrite(txt); toast.success(`${label} copied!`); };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
          <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2"><Shield className="w-4 h-4 text-blue-600" /> Encrypt</h5>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">Passphrase</label>
            <input value={encryptPass} onChange={e => setEncryptPass(e.target.value)} type="password" placeholder="Passphrase..."
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">Plain text</label>
            <textarea value={encryptInput} onChange={e => setEncryptInput(e.target.value)} placeholder="Enter text to encrypt..."
              className="w-full h-28 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none" />
          </div>
          <button onClick={handleEncrypt} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"><Unlock className="w-4 h-4 inline mr-1.5" /> Encrypt</button>
          {encryptResult && (
            <div className="relative">
              <label className="text-xs font-medium text-zinc-500 mb-1 block">Ciphertext</label>
              <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap break-all max-h-40 overflow-y-auto">{encryptResult}</pre>
              <button onClick={() => copy(encryptResult, 'Ciphertext')} className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</button>
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
          <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2"><Shield className="w-4 h-4 text-blue-600" /> Decrypt</h5>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">Passphrase</label>
            <input value={decryptPass} onChange={e => setDecryptPass(e.target.value)} type="password" placeholder="Passphrase..."
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">Ciphertext</label>
            <textarea value={decryptInput} onChange={e => setDecryptInput(e.target.value)} placeholder="Paste ciphertext..."
              className="w-full h-28 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none" />
          </div>
          <button onClick={handleDecrypt} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"><Unlock className="w-4 h-4 inline mr-1.5" /> Decrypt</button>
          {decryptResult && (
            <div className="relative">
              <label className="text-xs font-medium text-zinc-500 mb-1 block">Decrypted text</label>
              <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-40 overflow-y-auto">{decryptResult}</pre>
              <button onClick={() => copy(decryptResult, 'Decrypted')} className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
