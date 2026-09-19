"use client";

import React, { useState } from 'react';
import { Key, Download, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as openpgp from 'openpgp';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from "@/lib/clipboard";
import { getErrorMessage } from '@/utils/error';

export default function PgpKeyGenerator() {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@domain.com');
  const [passphrase, setPassphrase] = useState('secret123');
  const [isGenerating, setIsGenerating] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const generateKeys = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Please enter Name and Email');
      return;
    }

    setIsGenerating(true);
    toast.success('Generating 2048-bit RSA key pair client-side, please wait...');

    try {
      const { privateKey: privKey, publicKey: pubKey } = await openpgp.generateKey({
        type: 'rsa',
        rsaBits: 2048,
        userIDs: [{ name: name.trim(), email: email.trim() }],
        passphrase: passphrase.trim()
      });

      setPublicKey(pubKey);
      setPrivateKey(privKey);
      toast.success('PGP Keys successfully generated!');
    } catch (err: unknown) {
      console.error(err);
      toast.error('Failed to generate key pair: ' + getErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (txt: string, label: string) => {
    clipboardWrite(txt).then(ok => { if (ok) toast.success(`${label} copied!`); else toast.error('Copy blocked by the browser — select the text manually.'); });
  };

  const handleDownload = (txt: string, filename: string) => {
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, filename);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-5 border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-[var(--accent)]" />
          PGP Key Pair Generator
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Generate RSA-2048 public and private PGP key blocks offline using openpgp securely in-browser.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings */}
        <div className="lg:col-span-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase border-b border-[var(--border-subtle)] pb-2">User Identity</h3>
          
          <div className="space-y-1">
            <label htmlFor="lbl-pgpkeygenerator-user-name" className="text-[10px] text-[var(--text-muted)] font-bold">User Name</label>
            <input id="lbl-pgpkeygenerator-user-name" aria-label="User Name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
          </div>

          <div className="space-y-1">
            <label htmlFor="lbl-pgpkeygenerator-email-address" className="text-[10px] text-[var(--text-muted)] font-bold">Email Address</label>
            <input id="lbl-pgpkeygenerator-email-address" aria-label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
          </div>

          <div className="space-y-1">
            <label htmlFor="lbl-pgpkeygenerator-passphrase-password-lock" className="text-[10px] text-[var(--text-muted)] font-bold">Passphrase (Password Lock)</label>
            <input id="lbl-pgpkeygenerator-passphrase-password-lock" aria-label="Passphrase (Password Lock)" type="text" value={passphrase} onChange={e => setPassphrase(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
          </div>

          <button onClick={generateKeys} disabled={isGenerating} className="w-full mt-4 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            Generate PGP Keys
          </button>
        </div>

        {/* Outputs */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Public Key */}
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl flex flex-col justify-between">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2 mb-2">
                <span className="text-xs text-[var(--text-muted)] font-bold uppercase">Public Key Block</span>
                {publicKey && (
                  <div className="flex gap-2">
                    <button onClick={() => handleCopy(publicKey, 'Public Key')} className="p-1 text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)] rounded" aria-label="Copy public key"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDownload(publicKey, 'public_key.asc')} className="p-1 text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)] rounded" aria-label="Download public key"><Download className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
              <textarea aria-label="Generate keys to view public armor block..." readOnly value={publicKey} placeholder="Generate keys to view public armor block..." className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--accent)] font-mono text-[9px] h-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none" />
            </div>

            {/* Private Key */}
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl flex flex-col justify-between">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2 mb-2">
                <span className="text-xs text-[var(--text-muted)] font-bold uppercase">Private Key Block</span>
                {privateKey && (
                  <div className="flex gap-2">
                    <button onClick={() => handleCopy(privateKey, 'Private Key')} className="p-1 text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)] rounded" aria-label="Copy private key"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDownload(privateKey, 'private_key.asc')} className="p-1 text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)] rounded" aria-label="Download private key"><Download className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
              <textarea aria-label="Generate keys to view private armor block..." readOnly value={privateKey} placeholder="Generate keys to view private armor block..." className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--accent)] font-mono text-[9px] h-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}