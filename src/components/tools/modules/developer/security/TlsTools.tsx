"use client";

import React, { useState } from 'react';
import { Section, Input } from './_shared';
import { clipboardWrite } from "@/lib/clipboard";
import { toast } from 'react-hot-toast';
import { parseCert, pemToDer, type ParsedCert } from "@/lib/x509";


interface TlsCheck {
  host: string;
  reachable: boolean;
  finalUrl: string;
  certCount: number;
  latestExpiry: string;
  issuer: string;
}

export function SslTlsChecker() {
  const [hostname, setHostname] = useState('');
  const [port, setPort] = useState('443');
  const [result, setResult] = useState<TlsCheck | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const domainPresets = ['google.com', 'github.com', 'cloudflare.com'];
  const check = async () => {
    const host = hostname.trim().toLowerCase()
      .replace(/^https?:\/\//, '')
      .split('/')[0]!
      .split(':')[0]!;
    const portNum = parseInt(port.trim() || '443', 10);
    if (!host || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(host)) {
      setError('Enter a valid hostname, e.g. example.com');
      setResult(null);
      return;
    }
    if (!Number.isFinite(portNum) || portNum < 1 || portNum > 65535) {
      setError('Port must be 1–65535.');
      setResult(null);
      return;
    }
    setChecking(true);
    setError('');
    setResult(null);
    // Two real signals, no server needed:
    // 1. An https fetch succeeding means the browser validated the full
    //    chain (issuer trust + hostname match + expiry) — that IS the
    //    certificate check browsers perform. Failure = expired, untrusted,
    //    mismatched, or unreachable (indistinguishable client-side, stated).
    // 2. crt.sh issuance history gives issuer + expiry dates + cert count.
    let finalUrl = '';
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 20000);
      try {
        const res = await fetch(`https://${host}:${portNum}/`, { method: 'HEAD', mode: 'no-cors', signal: ctrl.signal });
        finalUrl = res.url || `https://${host}:${portNum}/`;
      } finally {
        clearTimeout(t);
      }
    } catch {
      setError(`${host}:${portNum} is unreachable over HTTPS from this browser — expired/untrusted certificate, wrong port, firewall, or the host is down (browsers don't distinguish these). For the exact cause: openssl s_client -connect ${host}:${portNum} -servername ${host}`);
      setChecking(false);
      return;
    }
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 25000);
      let certs: { issuer_name?: string; not_after?: string }[];
      try {
        const res = await fetch(`https://crt.sh/?q=%25.${encodeURIComponent(host)}&output=json`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        certs = await res.json();
      } finally {
        clearTimeout(t);
      }
      const list = Array.isArray(certs) ? certs : [];
      const expiries = list.map(c => c.not_after || '').filter(Boolean).sort();
      setResult({
        host: `${host}:${portNum}`,
        reachable: true,
        finalUrl,
        certCount: list.length,
        latestExpiry: expiries[expiries.length - 1] || 'unknown',
        issuer: list[0]?.issuer_name || 'unknown',
      });
      if (list.length === 0) {
        setError(`Reachable, but no public certificates found for ${host} — it may use a private/internal CA. Chain details for private CAs need: openssl s_client -connect ${host}:${portNum} -servername ${host}`);
      }
    } catch {
      // Reachability already proven above; only history failed.
      setResult({ host: `${host}:${portNum}`, reachable: true, finalUrl, certCount: 0, latestExpiry: 'unknown', issuer: 'unknown' });
      setError('Reachable with a valid certificate, but crt.sh history lookup failed (rate-limited?). Retry in a minute for issuer/expiry details.');
    } finally {
      setChecking(false);
    }
  };
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!result) return;
    clipboardWrite(`TLS check: ${result.host}\nReachable: yes (browser-validated certificate chain)\nFinal URL: ${result.finalUrl}\nPublic certs on record: ${result.certCount}\nLatest expiry: ${result.latestExpiry}\nIssuer: ${result.issuer}`).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } });
  };
  const rows: [string, string][] = result ? [
    ['Host', result.host],
    ['HTTPS reachable', 'Yes — browser validated the certificate chain (trust + hostname + expiry)'],
    ['Final URL', result.finalUrl],
    ['Public certs on record', String(result.certCount)],
    ['Latest expiry', result.latestExpiry],
    ['Issuer', result.issuer],
  ] : [];
  return (
    <Section title="SSL/TLS Certificate Checker">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {domainPresets.map(d => <button key={d} onClick={() => { setHostname(d); }} className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors">{d}</button>)}
      </div>
      <Input label="Hostname" value={hostname} onChange={v => { setHostname(v); setResult(null); setError(''); }} placeholder="example.com" />
      <Input label="Port" value={port} onChange={setPort} placeholder="443" />
      <button onClick={check} disabled={checking} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">{checking ? 'Checking…' : 'Check Certificate'}</button>
      {error && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-red-500/40">
          <p className="text-sm text-[var(--text-primary)]">{error}</p>
        </div>
      )}
      {result && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-green-500/50 space-y-2">
          {rows.map(([k, v]) => (
            <div key={k} className="flex flex-wrap gap-2 text-sm">
              <span className="w-32 shrink-0 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider pt-0.5">{k}</span>
              <span className="flex-1 min-w-0 font-mono text-[var(--text-primary)] break-all">{v}</span>
            </div>
          ))}
          <p className="text-xs text-[var(--text-muted)] pt-1">Cipher suites, TLS versions, and OCSP need a socket-level check — browsers don&apos;t expose them. Use the Cipher Checker below for suite grading, or openssl for the full handshake.</p>
          <button onClick={copy} className="mt-1 px-3 py-1.5 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
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
  const copy = () => { if (result) { clipboardWrite(`Cipher: ${cipher}\nStrength: ${result.strength}\nDescription: ${result.desc}`).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } }); } };
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
            <span className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)]">{cipher}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${strengthColors[result.strength] || 'bg-zinc-500'}`}>{result.strength}</span>
          </div>
          <p className="text-sm text-[var(--text-primary)]">{result.desc}</p>
          <div className="w-full bg-[var(--bg-overlay)] rounded-full h-2">
            <div className={`h-2 rounded-full ${strengthColors[result.strength] || 'bg-zinc-500'}`} style={{ width: result.strength === 'Strong' ? '95%' : result.strength === 'Good' ? '75%' : result.strength === 'Moderate' ? '50%' : result.strength === 'Weak' ? '30%' : result.strength === 'Deprecated' ? '15%' : result.strength === 'Insecure' ? '5%' : '50%' }} />
          </div>
          <button onClick={copy} className="px-3 py-1.5 text-xs bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}


export function SslCertificateDecoder() {
  const [pem, setPem] = useState('');
  const [cert, setCert] = useState<ParsedCert | null>(null);
  const [error, setError] = useState('');
  const certPresets = [
    { label: 'RSA 2048', v: '-----BEGIN CERTIFICATE-----\nMIIDazCCAlMCFAjxRgAQBQABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4f\nIEEGCCqGSIb3DQEBCwUA...\n-----END CERTIFICATE-----' },
  ];
  const decode = () => {
    setCert(null);
    setError('');
    if (!pem.trim()) { setError('Paste a PEM certificate first.'); return; }
    try {
      // Real ASN.1 DER parsing, entirely in your browser — the certificate
      // never leaves the page. Truncated/sample blobs fail honestly below.
      setCert(parseCert(pemToDer(pem)));
    } catch {
      setError('Could not parse this as a certificate — it may be truncated, a chain (paste one certificate at a time), or a private key. For full dumps: openssl x509 -in cert.pem -text -noout');
    }
  };
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!cert) return;
    const text = [
      `Subject: ${cert.subject}`,
      `Issuer: ${cert.issuer}`,
      `Valid: ${cert.notBefore} → ${cert.notAfter}`,
      `Serial: ${cert.serialHex}`,
      `Signature: ${cert.signatureAlgorithm}`,
      `Public key: ${cert.publicKeyAlgorithm} ${cert.publicKeySize}`,
      cert.san.length > 0 ? `SANs: ${cert.san.join(', ')}` : null,
      cert.keyUsage.length > 0 ? `Key usage: ${cert.keyUsage.join(', ')}` : null,
      `CA: ${cert.isCa ? 'yes' : 'no'}`,
    ].filter(Boolean).join('\n');
    clipboardWrite(text).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } });
  };
  const rows: [string, string][] = cert ? [
    ['Subject', cert.subject],
    ['Issuer', cert.issuer],
    ['Valid from', cert.notBefore],
    ['Valid until', cert.notAfter],
    ['Serial', cert.serialHex],
    ['Signature', cert.signatureAlgorithm],
    ['Public key', `${cert.publicKeyAlgorithm} ${cert.publicKeySize}`],
    ['Version', `v${cert.version}`],
    ['CA certificate', cert.isCa ? 'Yes' : 'No'],
  ] : [];
  return (
    <Section title="SSL Certificate Decoder">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {certPresets.map(p => <button key={p.label} onClick={() => { setPem(p.v); }} className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors">{p.label}</button>)}
      </div>
      <Input label="PEM Certificate" rows={6} value={pem} onChange={v => { setPem(v); setCert(null); setError(''); }} placeholder="-----BEGIN CERTIFICATE-----..." />
      <button onClick={decode} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors">Decode</button>
      {error && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-red-500/40">
          <p className="text-sm text-[var(--text-primary)]">{error}</p>
        </div>
      )}
      {cert && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-rose-400 space-y-2">
          {rows.map(([k, v]) => (
            <div key={k} className="flex flex-wrap gap-2 text-sm">
              <span className="w-28 shrink-0 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider pt-0.5">{k}</span>
              <span className="flex-1 min-w-0 font-mono text-[var(--text-primary)] break-all">{v}</span>
            </div>
          ))}
          {cert.san.length > 0 && (
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="w-28 shrink-0 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider pt-0.5">SANs ({cert.san.length})</span>
              <span className="flex-1 min-w-0 font-mono text-[var(--text-primary)] break-all">{cert.san.join(', ')}</span>
            </div>
          )}
          {cert.keyUsage.length > 0 && (
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="w-28 shrink-0 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider pt-0.5">Key usage</span>
              <span className="flex-1 min-w-0 font-mono text-[var(--text-primary)] break-all">{cert.keyUsage.join(', ')}</span>
            </div>
          )}
          <p className="text-xs text-[var(--text-muted)] pt-1">Decoded locally — paste one certificate at a time (chains decode first-cert-only).</p>
          <button onClick={copy} className="mt-1 px-3 py-1.5 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}

