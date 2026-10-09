"use client";

import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

interface CertInfo {
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  sans: string[];
  protocolVersion: string;
  serialNumber?: string;
  fingerprint?: string;
}

interface ChainCert {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
}

interface SslResult {
  domain: string;
  cert: CertInfo;
  chain: ChainCert[];
  status: 'valid' | 'expiring' | 'expired';
  /** live = direct chain check; ctlog = newest Certificate-Transparency log entry (not the live chain). */
  source: 'live' | 'ctlog';
}

function parseSSLCheckerResponse(data: Record<string, unknown>, domain: string): SslResult | null {
  if (!data || data.error) return null;
  const info = (data.certificate_info || data.cert || data) as Record<string, unknown>;
  const validity = info.validity as Record<string, unknown> | undefined;
  const extensions = info.extensions as Record<string, unknown> | undefined;
  const validTo = (info.valid_to || info.validTill || validity?.to || '') as string;
  const validFrom = (info.valid_from || info.validFrom || validity?.from || '') as string;
  const now = new Date();
  const end = new Date(validTo);
  const daysRemaining = Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  let status: 'valid' | 'expiring' | 'expired' = 'valid';
  if (daysRemaining < 0) status = 'expired';
  else if (daysRemaining < 30) status = 'expiring';

  const sans = (info.subject_alt_names || extensions?.subjectAltName || info.san || []) as string[] | string;
  const chain: ChainCert[] = [];
  if (data.certificate_chain || data.chain) {
    const raw = (data.certificate_chain || data.chain || []) as Record<string, unknown>[];
    for (const c of raw) {
      chain.push({
        subject: (c.subject || c.Subject || '') as string,
        issuer: (c.issuer || c.Issuer || '') as string,
        validFrom: (c.valid_from || c.validFrom || c.ValidFrom || '') as string,
        validTo: (c.valid_to || c.validTo || c.ValidTo || '') as string,
      });
    }
  }

  return {
    domain,
    cert: {
      issuer: (info.issuer || info.Issuer || 'N/A') as string,
      subject: (info.subject || info.Subject || 'N/A') as string,
      validFrom,
      validTo,
      daysRemaining,
      sans: Array.isArray(sans) ? sans : typeof sans === 'string' ? sans.split(/,\s*/) : [],
      protocolVersion: (info.protocol_version || info.version || 'N/A') as string,
      serialNumber: (info.serial_number || info.serialNumber) as string | undefined,
      fingerprint: info.fingerprint as string | undefined,
    },
    chain,
    status,
    source: 'live',
  };
}

function parseCrtShResponse(data: Record<string, unknown>[], domain: string): SslResult | null {
  if (!data || data.length === 0) return null;
  const entry = data[0] as Record<string, unknown>;
  const validTo = (entry.not_after || '') as string;
  const validFrom = (entry.not_before || '') as string;
  const now = new Date();
  const end = new Date(validTo);
  const daysRemaining = Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  let status: 'valid' | 'expiring' | 'expired' = 'valid';
  if (daysRemaining < 0) status = 'expired';
  else if (daysRemaining < 30) status = 'expiring';

  return {
    domain,
    cert: {
      issuer: (entry.issuer_name || 'N/A') as string,
      subject: (entry.subject_name || 'N/A') as string,
      validFrom: validFrom,
      validTo: validTo,
      daysRemaining,
      sans: entry.name_value ? (entry.name_value as string).split(/\n+/) : [],
      protocolVersion: 'N/A',
      serialNumber: entry.serial_number as string | undefined,
    },
    chain: [],
    status,
    source: 'ctlog',
  };
}

function validateDomain(d: string): string | null {
  const clean = d.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!clean) return null;
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(clean)) return null;
  return clean;
}

export default function SslChecker() {
  const [domain, setDomain] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SslResult | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const blobUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const check = async (d?: string) => {
    const target = validateDomain(d || domain);
    if (!target) { toast.error('Enter a valid domain (e.g. example.com)'); return; }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    // 15s ceiling: a stalled provider must not hang the UI. Supersede
    // (a newer lookup) and timeout share the abort channel — told apart
    // by whether this run is still current.
    const timer = setTimeout(() => controller.abort(), 15000);

    setIsProcessing(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`https://ssl-checker.io/api/v1/check?domain=${target}`, { signal: controller.signal });
      if (!res.ok) throw new Error('SSL Checker API failed');
      const data = (await res.json()) as Record<string, unknown>;
      const parsed = parseSSLCheckerResponse(data, target);
      if (!parsed) throw new Error('Invalid response');
      setResult(parsed);
      setHistory(prev => [target, ...prev.filter(h => h !== target)].slice(0, 5));
      const message = parsed.status === 'valid' ? 'Certificate is valid' : parsed.status === 'expiring' ? 'Certificate expiring soon' : 'Certificate expired';
      if (parsed.status === 'valid') toast.success(message);
      else toast(message, { icon: parsed.status === 'expiring' ? '⚠️' : '🚫' });
    } catch (err: unknown) {
      // A newer lookup superseded this one — stay silent, it owns the UI.
      if (err instanceof Error && err.name === 'AbortError' && abortRef.current !== controller) return;
      try {
        // Fresh controller: the primary one may be timed-out/aborted.
        const fb = new AbortController();
        const fbTimer = setTimeout(() => fb.abort(), 15000);
        let crtData: Record<string, unknown>[];
        try {
          const crtRes = await fetch(`https://crt.sh/?q=${target}&output=json`, { signal: fb.signal });
          if (!crtRes.ok) throw new Error('crt.sh failed');
          crtData = await crtRes.json();
        } finally {
          clearTimeout(fbTimer);
        }
        const parsed = parseCrtShResponse(crtData, target);
        if (!parsed) throw new Error('No certificate data found');
        setResult(parsed);
        setHistory(prev => [target, ...prev.filter(h => h !== target)].slice(0, 5));
        toast.success('Newest logged certificate retrieved (via crt.sh — log entry, not live chain status)');
      } catch {
        setError('Unable to check SSL certificate. Try again later.');
        toast.error('SSL check failed');
      }
    } finally {
      clearTimeout(timer);
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    if (result) check(result.domain);
    else if (history.length > 0) check(history[0]);
  };

  const handleDownload = async () => {
    if (!result) return;
    try {
      const text = [
        `Domain: ${result.domain}`,
        `Status: ${result.status}`,
        `Issuer: ${result.cert.issuer}`,
        `Subject: ${result.cert.subject}`,
        `Valid From: ${result.cert.validFrom}`,
        `Valid To: ${result.cert.validTo}`,
        `Days Remaining: ${result.cert.daysRemaining}`,
        `Protocol: ${result.cert.protocolVersion}`,
        `SANs: ${result.cert.sans.join(', ')}`,
      ].join('\n');
      const blob = new Blob([text], { type: 'text/plain' });
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      await downloadOrShare(url, `ssl-cert-${result.domain}.txt`);
    } catch {
      toast.error('Download failed');
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'valid': return 'text-emerald-500 bg-emerald-700/10 border-emerald-500/20';
      case 'expiring': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'expired': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-[var(--text-secondary)] bg-[var(--bg-overlay)]0/10 border-zinc-500/20';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-2xl text-[var(--text-secondary)] text-sm space-y-1">
        <h4 className="font-bold text-[var(--text-primary)]">SSL Certificate Checker</h4>
        <p className="text-[var(--text-secondary)]">Check SSL certificate details for any domain. Uses public certificate transparency APIs.</p>
      </div>

      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row gap-3">
                      <input type="text" value={domain} aria-label="Domain" onChange={e => setDomain(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} placeholder="example.com" className="flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 font-mono" />
          <button onClick={() => check()} disabled={isProcessing} className="px-6 py-2.5 bg-[var(--accent-ink)] hover:opacity-90 disabled:bg-[var(--accent-ink)]/50 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer justify-center">
            {isProcessing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {isProcessing ? 'Checking...' : 'Check SSL'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button onClick={handleRetry} className="mt-2 text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 underline">Retry</button>
          </div>
        )}

        {result && (
          <div role="status" className="space-y-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${statusColor(result.status)}`}>
              {result.status === 'valid' && 'Valid'}
              {result.status === 'expiring' && `Expiring in ${result.cert.daysRemaining} days`}
              {result.status === 'expired' && `Expired (${Math.abs(result.cert.daysRemaining)} days ago)`}
            </div>
            {result.source === 'ctlog' && (
              <p className="text-xs text-[var(--text-muted)]">Newest Certificate-Transparency log entry — not a live chain check; confirm expiry against the live server before acting.</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4">
                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Issuer</p>
                <p className="text-sm font-mono text-[var(--text-primary)] mt-1 break-all">{result.cert.issuer}</p>
              </div>
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4">
                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Subject</p>
                <p className="text-sm font-mono text-[var(--text-primary)] mt-1 break-all">{result.cert.subject}</p>
              </div>
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4">
                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Valid From</p>
                <p className="text-sm text-[var(--text-primary)] mt-1 font-mono">{result.cert.validFrom || 'N/A'}</p>
              </div>
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4">
                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Valid To</p>
                <p className="text-sm text-[var(--text-primary)] mt-1 font-mono">{result.cert.validTo || 'N/A'}</p>
              </div>
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4">
                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Days Remaining</p>
                <p className={`text-sm font-bold mt-1 ${result.cert.daysRemaining < 0 ? 'text-red-500' : result.cert.daysRemaining < 30 ? 'text-amber-500' : 'text-emerald-500'}`}>{result.cert.daysRemaining < 0 ? 0 : result.cert.daysRemaining} days</p>
              </div>
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4">
                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Protocol Version</p>
                <p className="text-sm font-mono text-[var(--text-primary)] mt-1">{result.cert.protocolVersion}</p>
              </div>
            </div>

            {result.cert.sans.length > 0 && (
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4">
                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-2">Subject Alternative Names (SANs)</p>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {result.cert.sans.map((san, i) => (
                    <span key={i} className="px-2.5 py-1 bg-[var(--bg-surface)] rounded-lg text-xs font-mono text-[var(--text-secondary)]">{san}</span>
                  ))}
                </div>
              </div>
            )}

            {result.chain.length > 0 && (
              <details className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl">
                <summary className="px-4 py-3 text-xs font-bold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors">Certificate Chain ({result.chain.length})</summary>
                <div className="border-t border-[var(--border-subtle)] p-4 space-y-3">
                  {result.chain.map((c, i) => (
                    <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-3 text-xs">
                      <p><span className="text-[var(--text-muted)]">Subject:</span> <span className="font-mono text-[var(--text-primary)]">{c.subject}</span></p>
                      <p><span className="text-[var(--text-muted)]">Issuer:</span> <span className="font-mono text-[var(--text-primary)]">{c.issuer}</span></p>
                      <p><span className="text-[var(--text-muted)]">Valid:</span> <span className="font-mono text-[var(--text-primary)]">{c.validFrom} — {c.validTo}</span></p>
                    </div>
                  ))}
                </div>
              </details>
            )}

            <div className="flex gap-3">
              <button onClick={handleDownload} className="px-4 py-2 bg-[var(--accent-ink)] hover:opacity-90 text-white text-xs font-bold rounded-xl transition-colors">Download</button>
              <button onClick={() => check(result.domain)} className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-bold rounded-xl transition-colors">Refresh</button>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="pt-3 border-t border-[var(--border-subtle)]">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Recent Checks</p>
            <div className="flex flex-wrap gap-2">
              {history.map(h => (
                <button key={h} onClick={() => { setDomain(h); check(h); }} className="px-3 py-1 text-xs font-mono bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors">{h}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
