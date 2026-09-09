"use client";

import React, { useState } from 'react';
import { Section, Input } from './_shared';

export function SslTlsChecker() {
  const [hostname, setHostname] = useState('');
  const [port, setPort] = useState('443');
  const [output, setOutput] = useState('');
  const domainPresets = ['google.com', 'github.com', 'cloudflare.com'];
  const check = () => {
    if (!hostname.trim()) { setOutput('Please enter a hostname'); return; }
    setOutput(`SSL/TLS Check for ${hostname}:${port}

⚠ Server-side check not available in browser
For real certificate validation, use: openssl s_client -connect ${hostname}:${port}

Common checks performed by server-side tools:
• Certificate chain validation
• Expiration date check
• Wildcard/non-wildcard match
• Protocol support (TLS 1.2, 1.3)
• Cipher suite preference
• OCSP stapling check
• HSTS header presence

Port ${port} is the default HTTPS port. Common alternatives: 8443, 9443.`);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (output) { navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="SSL/TLS Certificate Checker">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {domainPresets.map(d => <button key={d} onClick={() => { setHostname(d); }} className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors">{d}</button>)}
      </div>
      <Input label="Hostname" value={hostname} onChange={setHostname} placeholder="example.com" />
      <Input label="Port" value={port} onChange={setPort} placeholder="443" />
      <button onClick={check} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors">Check Certificate</button>
      {output && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-rose-400">
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200">{output}</pre>
          <button onClick={copy} className="mt-3 px-3 py-1.5 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}


export function TlsCipherChecker() {
  const [cipher, setCipher] = useState('');
  const [result, setResult] = useState<{ strength: string; desc: string } | null>(null);
  const cipherPresets = ['TLS_AES_256_GCM_SHA384', 'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA', 'TLS_RSA_WITH_RC4_128_SHA'];
  const strengthColors: Record<string, string> = { Strong: 'bg-green-500', Good: 'bg-blue-500', Moderate: 'bg-yellow-500', Weak: 'bg-orange-500', Deprecated: 'bg-red-500', Insecure: 'bg-red-700' };
  const ciphers: Record<string, { strength: string; desc: string }> = {
    'TLS_AES_256_GCM_SHA384': { strength: 'Strong', desc: 'TLS 1.3, AEAD, 256-bit key' },
    'TLS_AES_128_GCM_SHA256': { strength: 'Strong', desc: 'TLS 1.3, AEAD, 128-bit key' },
    'TLS_CHACHA20_POLY1305_SHA256': { strength: 'Strong', desc: 'TLS 1.3, AEAD, ChaCha20' },
    'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384': { strength: 'Strong', desc: 'PFS, ECDSA, 256-bit' },
    'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384': { strength: 'Strong', desc: 'PFS, RSA, 256-bit' },
    'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256': { strength: 'Good', desc: 'PFS, RSA, 128-bit' },
    'TLS_RSA_WITH_AES_256_GCM_SHA384': { strength: 'Moderate', desc: 'No PFS, 256-bit' },
    'TLS_RSA_WITH_AES_128_CBC_SHA': { strength: 'Weak', desc: 'No PFS, CBC mode (vulnerable to padding oracle)' },
    'TLS_RSA_WITH_3DES_EDE_CBC_SHA': { strength: 'Deprecated', desc: '3DES — SWEET32 attack vector' },
    'TLS_RSA_WITH_RC4_128_SHA': { strength: 'Insecure', desc: 'RC4 — completely broken' },
  };
  const check = (c?: string) => {
    const name = c !== undefined ? c : cipher;
    if (c !== undefined) setCipher(name);
    const info = ciphers[name.trim()];
    if (info) setResult(info);
    else setResult({ strength: 'Unknown', desc: 'Not in reference database. Check IANA TLS registry.' });
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (result) { navigator.clipboard.writeText(`Cipher: ${cipher}\nStrength: ${result.strength}\nDescription: ${result.desc}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="TLS Cipher Checker">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {cipherPresets.map(c => <button key={c} onClick={() => check(c)} className="px-2.5 py-1 text-xs rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 transition-colors">{c.includes('_') ? c.split('_').slice(0, 3).join('_') + '…' : c}</button>)}
      </div>
      <Input label="Cipher suite name" value={cipher} onChange={v => { setCipher(v); setResult(null); }} placeholder="TLS_AES_256_GCM_SHA384" />
      <button onClick={() => check()} className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm font-medium transition-colors">Check</button>
      {result && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-cyan-400 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">{cipher}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${strengthColors[result.strength] || 'bg-zinc-500'}`}>{result.strength}</span>
          </div>
          <p className="text-sm text-zinc-800 dark:text-zinc-200">{result.desc}</p>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
            <div className={`h-2 rounded-full ${strengthColors[result.strength] || 'bg-zinc-500'}`} style={{ width: result.strength === 'Strong' ? '95%' : result.strength === 'Good' ? '75%' : result.strength === 'Moderate' ? '50%' : result.strength === 'Weak' ? '30%' : result.strength === 'Deprecated' ? '15%' : result.strength === 'Insecure' ? '5%' : '50%' }} />
          </div>
          <button onClick={copy} className="px-3 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}


export function SslCertificateDecoder() {
  const [pem, setPem] = useState('');
  const [output, setOutput] = useState('');
  const certPresets = [
    { label: 'RSA 2048', v: '-----BEGIN CERTIFICATE-----\nMIIDazCCAlMCFAjxRgAQBQABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4f\nIEEGCCqGSIb3DQEBCwUA...\n-----END CERTIFICATE-----' },
  ];
  const decode = () => {
    if (!pem.trim()) { setOutput('Please paste a PEM certificate'); return; }
    setOutput(`PEM Certificate Decoder

⚠ Server-side API access not available in browser
For real certificate decoding, use:

  openssl x509 -in cert.pem -text -noout

  # Parse specific fields:
  openssl x509 -in cert.pem -subject -issuer -dates -noout

The PEM format contains:
• Certificate Version
• Serial Number
• Signature Algorithm
• Issuer DN
• Validity (not before / not after)
• Subject DN
• Public Key Info (algorithm, key size)
• Extensions (SAN, Key Usage, etc.)
• Signature

Certificate is ${pem.includes('BEGIN CERTIFICATE') ? 'properly formatted' : 'malformed'}`);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (output) { navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); } };
  return (
    <Section title="SSL Certificate Decoder">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {certPresets.map(p => <button key={p.label} onClick={() => { setPem(p.v); }} className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors">{p.label}</button>)}
      </div>
      <Input label="PEM Certificate" rows={6} value={pem} onChange={v => { setPem(v); setOutput(''); }} placeholder="-----BEGIN CERTIFICATE-----..." />
      <button onClick={decode} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors">Decode</button>
      {output && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-rose-400">
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200">{output}</pre>
          <button onClick={copy} className="mt-3 px-3 py-1.5 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}

