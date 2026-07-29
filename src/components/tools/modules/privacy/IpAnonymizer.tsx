"use client";

import React, { useState } from 'react';
import { EyeOff, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function IpAnonymizer() {
  const [ip, setIp] = useState('192.168.1.125');
  const [mask, setMask] = useState('24'); // /24 mask
  const [anonymized, setAnonymized] = useState('');

  const anonymizeIp = () => {
    if (!ip.trim()) {
      toast.error('Please enter IP address');
      return;
    }

    try {
      const parts = ip.trim().split('.');
      if (parts.length !== 4) {
        toast.error('Invalid IPv4 format');
        return;
      }

      if (mask === '24') {
        // Zero out last octet
        setAnonymized(`${parts[0]}.${parts[1]}.${parts[2]}.0`);
      } else if (mask === '16') {
        // Zero out last two octets
        setAnonymized(`${parts[0]}.${parts[1]}.0.0`);
      } else {
        // Full hash anonymizer (standard GDPR mask method)
        setAnonymized(`xxx.xxx.xxx.xxx`);
      }
      toast.success('IP Anonymized!');
    } catch (err) {
      toast.error('Failed to anonymize');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <EyeOff className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">GDPR IP Anonymizer</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase">IPv4 Address</label>
              <input type="text" value={ip} onChange={e => setIp(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 outline-none text-[var(--text-primary)]" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Anonymization Level</label>
              <select value={mask} onChange={e => setMask(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-2.5 py-2 outline-none">
                <option value="24">Mask last octet (GDPR /24 - standard)</option>
                <option value="16">Mask last 2 octets (Aggressive /16)</option>
                <option value="hash">Full hashing block replacement</option>
              </select>
            </div>
          </div>

          <button onClick={anonymizeIp} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer">
            <RefreshCw className="w-4 h-4" /> Anonymize IP
          </button>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-zinc-800 flex flex-col justify-center items-center min-h-[160px] space-y-3">
          <span className="text-[10px] text-[var(--text-secondary)] uppercase block">Anonymized Output</span>
          <p className="text-3xl font-black text-emerald-400 font-mono tracking-wider">{anonymized ? anonymized : '--'}</p>
          {anonymized && (
            <button onClick={() => { clipboardWrite(anonymized); toast.success('Copied!'); }} className="text-[var(--accent)] hover:underline">Copy Result</button>
          )}
        </div>
      </div>
    </div>
  );
}