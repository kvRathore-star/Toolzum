"use client";

import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

interface RDAPEntity {
  handle?: string;
  roles?: string[];
  vcardArray?: string[][];
  entities?: RDAPEntity[];
  events?: { eventAction: string; eventDate: string }[];
  remarks?: { title: string; description: string[] }[];
}

interface RDAPResponse {
  ldhName?: string;
  handle?: string;
  port43?: string;
  events?: { eventAction: string; eventDate: string }[];
  entities?: RDAPEntity[];
  nameservers?: { ldhName: string }[];
  status?: string[];
  secureDNS?: { delegationSigned?: boolean };
  rdapConformance?: string[];
  notices?: { title: string; description: string[] }[];
}

interface WhoisResult {
  domain: string;
  registrar: string;
  creationDate: string;
  expirationDate: string;
  nameServers: string[];
  status: string[];
  dnssec: string;
  rawData: string;
}

function parseRDAP(data: RDAPResponse, domain: string): WhoisResult {
  const creation = data.events?.find(e => e.eventAction === 'registration')?.eventDate || '';
  const expiration = data.events?.find(e => e.eventAction === 'expiration')?.eventDate || '';
  const nameservers = data.nameservers?.map(n => n.ldhName) || [];

  let registrar = '';
  const findRegistrar = (entities: RDAPEntity[] | undefined) => {
    if (!entities) return;
    for (const e of entities) {
      if (e.roles?.includes('registrar') && e.vcardArray?.[1]) {
        for (const item of e.vcardArray[1]) {
          if (item[0] === 'fn') { registrar = item[3] ?? ''; return; }
        }
      }
      if (e.entities) findRegistrar(e.entities);
    }
  };
  findRegistrar(data.entities);

  return {
    domain: data.ldhName || domain,
    registrar: registrar || 'N/A',
    creationDate: creation || 'N/A',
    expirationDate: expiration || 'N/A',
    nameServers: nameservers,
    status: data.status || [],
    dnssec: data.secureDNS?.delegationSigned === true ? 'Signed' : data.secureDNS?.delegationSigned === false ? 'Unsigned' : 'N/A',
    rawData: JSON.stringify(data, null, 2),
  };
}

function parseWhoisFreeAes(data: Record<string, unknown>, domain: string): WhoisResult {
  const raw = (data.raw as string) || JSON.stringify(data, null, 2);
  const registrar = (data.registrar || data.Registrar || '') as string | string[];
  const creation = (data.creation_date || data.created || data['Creation Date'] || '') as string | string[];
  const expiration = (data.expiration_date || data.expires || data['Registry Expiry Date'] || '') as string | string[];
  const nameservers = (data.name_servers || data.nameservers || []) as string | string[];
  const status = (data.status || []) as string | string[];

  return {
    domain,
    registrar: Array.isArray(registrar) ? (registrar[0] ?? '') : registrar || 'N/A',
    creationDate: Array.isArray(creation) ? (creation[0] ?? '') : creation || 'N/A',
    expirationDate: Array.isArray(expiration) ? (expiration[0] ?? '') : expiration || 'N/A',
    nameServers: Array.isArray(nameservers) ? nameservers.slice(0, 10) : [],
    status: Array.isArray(status) ? status : typeof status === 'string' ? [status] : [],
    dnssec: 'N/A',
    rawData: raw,
  };
}

function validateDomain(d: string): string | null {
  const clean = d.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/\.$/, '');
  if (!clean) return null;
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(clean)) return null;
  return clean;
}

export default function WhoisLookup() {
  const [domain, setDomain] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<WhoisResult | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const lookup = async (d?: string) => {
    const target = validateDomain(d || domain);
    if (!target) { toast.error('Enter a valid domain (e.g. example.com)'); return; }

    setIsProcessing(true);
    setError('');
    setResult(null);

    // 15s ceiling per provider — neither endpoint may hang the UI forever.
    const withTimeout = () => AbortSignal.timeout(15000);
    let rdapNotFound = false;
    try {
      const res = await fetch(`https://rdap.org/domain/${target}`, { signal: withTimeout() });
      if (res.status === 404) {
        // 404 is data, not a network error: unregistered or TLD unsupported.
        rdapNotFound = true;
        throw new Error('RDAP 404');
      }
      if (!res.ok) throw new Error('RDAP failed');
      const data: RDAPResponse = await res.json();
      setResult(parseRDAP(data, target));
      setHistory(prev => [target, ...prev.filter(h => h !== target)].slice(0, 5));
      toast.success('WHOIS data retrieved!');
    } catch {
      try {
        const fallbackRes = await fetch(`https://whois.freeaes.com/api/whois?domain=${target}`, { signal: withTimeout() });
        if (!fallbackRes.ok) throw new Error('Fallback failed');
        const data: Record<string, unknown> = await fallbackRes.json();
        if (data.error || !data.raw) throw new Error((data.error as string) || 'No data');
        setResult(parseWhoisFreeAes(data, target));
        setHistory(prev => [target, ...prev.filter(h => h !== target)].slice(0, 5));
        toast.success('WHOIS data retrieved (via fallback)');
      } catch {
        setError(rdapNotFound
          ? `No RDAP record for ${target} — the domain may be unregistered (possibly available) or the TLD may be unsupported. Verify at a registrar before acting.`
          : 'Unable to retrieve WHOIS information. Try again later.');
        toast.error('Lookup failed');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    if (result) lookup(result.domain);
    else if (history.length > 0) lookup(history[0]);
  };

  const handleDownload = async () => {
    if (!result) return;
    try {
      const text = [
        `Domain: ${result.domain}`,
        `Registrar: ${result.registrar}`,
        `Created: ${result.creationDate}`,
        `Expires: ${result.expirationDate}`,
        `DNSSEC: ${result.dnssec}`,
        `Name Servers: ${result.nameServers.join(', ')}`,
        `Status: ${result.status.join(', ')}`,
        '',
        '--- Raw Data ---',
        result.rawData,
      ].join('\n');
      const blob = new Blob([text], { type: 'text/plain' });
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      await downloadOrShare(url, `whois-${result.domain}.txt`);
    } catch {
      toast.error('Download failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-2xl text-[var(--accent)] text-sm space-y-1">
        <h4 className="font-bold text-[var(--text-primary)]">WHOIS Lookup</h4>
        <p className="text-[var(--text-secondary)]">Look up domain registration information. Uses public RDAP/whois APIs.</p>
      </div>

      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row gap-3">
                      <input type="text" value={domain} aria-label="Domain" onChange={e => setDomain(e.target.value)} onKeyDown={e => e.key === 'Enter' && lookup()} placeholder="example.com" className="flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 font-mono" />
          <button onClick={() => lookup()} disabled={isProcessing} className="px-6 py-2.5 bg-[var(--accent-ink)] hover:opacity-90 disabled:bg-[var(--accent-ink)]/50 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer justify-center">
            {isProcessing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {isProcessing ? 'Looking up...' : 'Lookup'}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4">
                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Domain</p>
                <p className="text-sm font-mono font-bold text-[var(--accent)] mt-1">{result.domain}</p>
              </div>
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4">
                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Registrar</p>
                <p className="text-sm font-bold text-[var(--text-primary)] mt-1">{result.registrar}</p>
              </div>
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4">
                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Created</p>
                <p className="text-sm text-[var(--text-primary)] mt-1 font-mono">{result.creationDate}</p>
              </div>
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4">
                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Expires</p>
                <p className="text-sm text-[var(--text-primary)] mt-1 font-mono">{result.expirationDate}</p>
              </div>
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4">
                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">DNSSEC</p>
                <p className="text-sm text-[var(--text-primary)] mt-1 font-mono">{result.dnssec}</p>
              </div>
            </div>

            {result.nameServers.length > 0 && (
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4">
                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-2">Name Servers</p>
                <div className="flex flex-wrap gap-2">
                  {result.nameServers.map(ns => (
                    <span key={ns} className="px-2.5 py-1 bg-[var(--bg-surface)] rounded-lg text-xs font-mono text-[var(--text-secondary)]">{ns}</span>
                  ))}
                </div>
              </div>
            )}

            {result.status.length > 0 && (
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4">
                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-2">Domain Status</p>
                <div className="flex flex-wrap gap-2">
                  {result.status.map(st => (
                    <span key={st} className="px-2.5 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg text-xs font-mono">{st}</span>
                  ))}
                </div>
              </div>
            )}

            <details className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl">
              <summary className="px-4 py-3 text-xs font-bold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors">Raw Data</summary>
              <div className="border-t border-[var(--border-subtle)] p-4">
                <pre className="text-[10px] font-mono text-[var(--text-secondary)] whitespace-pre-wrap max-h-60 overflow-y-auto">{result.rawData}</pre>
              </div>
            </details>

            <div className="flex gap-3">
              <button onClick={handleDownload} className="px-4 py-2 bg-[var(--accent-ink)] hover:opacity-90 text-white text-xs font-bold rounded-xl transition-colors">Download</button>
              <button onClick={() => lookup(result.domain)} className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-bold rounded-xl transition-colors">Refresh</button>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="pt-3 border-t border-[var(--border-subtle)]">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Recent Lookups</p>
            <div className="flex flex-wrap gap-2">
              {history.map(h => (
                <button key={h} onClick={() => { setDomain(h); lookup(h); }} className="px-3 py-1 text-xs font-mono bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors">{h}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
