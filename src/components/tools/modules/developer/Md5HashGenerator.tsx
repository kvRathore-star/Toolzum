"use client";

import React, { useState } from 'react';
import { Shield, Copy, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';
import CryptoJS from 'crypto-js';
import { clipboardWrite } from "@/lib/clipboard";

export default function Md5HashGenerator() {
  const [input, setInput] = useState('');
  const [md5Hash, setMd5Hash] = useState('');
  const [sha256Hash, setSha256Hash] = useState('');
  const [sha1Hash, setSha1Hash] = useState('');
  const [sha512Hash, setSha512Hash] = useState('');

  const generateHashes = () => {
    if (!input.trim()) {
      toast.error('Please enter input text');
      return;
    }
    
    setMd5Hash(CryptoJS.MD5(input).toString());
    setSha256Hash(CryptoJS.SHA256(input).toString());
    setSha1Hash(CryptoJS.SHA1(input).toString());
    setSha512Hash(CryptoJS.SHA512(input).toString());
    toast.success('Hashes generated!');
  };

  const handleCopy = (txt: string, label: string) => {
    clipboardWrite(txt);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-5 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-[var(--accent)]" />
          MD5 & Cryptographic Hash Generator
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Generate message digests and cryptographic hash signatures securely client-side in your browser.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs text-[var(--text-muted)] font-bold uppercase block">Input Text Data</span>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter text to hash here..."
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-64 outline-none text-xs resize-none font-mono"
            />
          </div>
          <button onClick={generateHashes} className="w-full mt-4 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <Shield className="w-4 h-4" /> Compute Hashes
          </button>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl space-y-4">
          <span className="text-xs text-[var(--text-muted)] font-bold uppercase block border-b border-zinc-800 pb-2">Cryptographic Hash Digest List</span>
          
          <div className="space-y-3">
            {/* MD5 */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold">
                <span>MD5 (128-bit)</span>
                {md5Hash && <button onClick={() => handleCopy(md5Hash, 'MD5')} className="text-[var(--accent)] hover:underline">Copy</button>}
              </div>
              <input type="text" readOnly value={md5Hash} placeholder="Compute hashes to view digest..." className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-zinc-900 dark:text-emerald-400 font-mono text-xs outline-none" />
            </div>

            {/* SHA-1 */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold">
                <span>SHA-1 (160-bit)</span>
                {sha1Hash && <button onClick={() => handleCopy(sha1Hash, 'SHA-1')} className="text-[var(--accent)] hover:underline">Copy</button>}
              </div>
              <input type="text" readOnly value={sha1Hash} placeholder="Compute hashes to view digest..." className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-zinc-900 dark:text-emerald-400 font-mono text-xs outline-none" />
            </div>

            {/* SHA-256 */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold">
                <span>SHA-256 (256-bit)</span>
                {sha256Hash && <button onClick={() => handleCopy(sha256Hash, 'SHA-256')} className="text-[var(--accent)] hover:underline">Copy</button>}
              </div>
              <input type="text" readOnly value={sha256Hash} placeholder="Compute hashes to view digest..." className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-zinc-900 dark:text-emerald-400 font-mono text-xs outline-none" />
            </div>

            {/* SHA-512 */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold">
                <span>SHA-512 (512-bit)</span>
                {sha512Hash && <button onClick={() => handleCopy(sha512Hash, 'SHA-512')} className="text-[var(--accent)] hover:underline">Copy</button>}
              </div>
              <textarea readOnly rows={2} value={sha512Hash} placeholder="Compute hashes to view digest..." className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-zinc-900 dark:text-emerald-400 font-mono text-xs outline-none resize-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}