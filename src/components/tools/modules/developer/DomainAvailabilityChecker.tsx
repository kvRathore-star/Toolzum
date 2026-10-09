"use client";

import React, { useState } from 'react';
import { Search, Globe, CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DomainStatus {
  domain: string;
  available: boolean;
  error?: string;
  note?: string;
}

const COMMON_TLDS = ['.com', '.net', '.org', '.io', '.dev', '.app', '.co', '.me', '.tools', '.xyz'];

export default function DomainAvailabilityChecker() {
  const [domain, setDomain] = useState('');
  const [results, setResults] = useState<DomainStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const checkDomain = async () => {
    const cleaned = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    // Strip a known TLD suffix if present ("myshop.com" → "myshop") so a
    // pasted FQDN checks the right base. The old split('.')[0] turned
    // "my.cool" into "my" and checked the wrong domain entirely.
    const tldsSorted = [...COMMON_TLDS].sort((a, b) => b.length - a.length);
    let name = cleaned;
    for (const t of tldsSorted) {
      if (cleaned.endsWith(t)) { name = cleaned.slice(0, -t.length); break; }
    }
    if (!name || name.includes('.') || name.length < 2) {
      toast.error('Enter a single name without extension (e.g. myshop — not my.shop)');
      return;
    }

    setIsLoading(true);
    setResults([]);

    const checks: DomainStatus[] = [];
    for (const tld of COMMON_TLDS) {
      const fullDomain = `${name}${tld}`;
      // RDAP first: a 404 from the authoritative server means "not
      // registered" — far stronger than DNS absence. Anything ambiguous
      // falls back to the DNS A/MX heuristic below, labeled as such.
      try {
        const r = await fetch('/api/rdap-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: fullDomain }),
          signal: AbortSignal.timeout(10000),
        });
        if (r.ok) {
          const data = (await r.json()) as { outcome?: string };
          if (data.outcome === 'registered') {
            checks.push({ domain: fullDomain, available: false, note: 'Registered (RDAP record found)' });
            continue;
          }
          if (data.outcome === 'unregistered') {
            checks.push({ domain: fullDomain, available: true, note: 'Available — no RDAP record; confirm at a registrar' });
            continue;
          }
        }
      } catch {
        /* RDAP unreachable for this TLD — heuristic below */
      }
      try {
        // DNS heuristic (weak signal): a domain with mail but no
        // website is still registered. The old check looked at A records
        // only and reported such domains as "available".
        // 10s per lookup: one stalled resolver must not hang the whole
        // sequential TLD loop. Timeouts land in catch per-TLD below.
        const [aRes, mxRes] = await Promise.all([
          fetch(`https://dns.google/resolve?name=${fullDomain}&type=A`, { signal: AbortSignal.timeout(10000) }),
          fetch(`https://dns.google/resolve?name=${fullDomain}&type=MX`, { signal: AbortSignal.timeout(10000) }),
        ]);
        const aData: { Answer?: { data: string }[] } = await aRes.json();
        const mxData: { Answer?: { data: string }[] } = await mxRes.json();
        const hasA = !!aData.Answer && aData.Answer.length > 0;
        const hasMx = !!mxData.Answer && mxData.Answer.length > 0;
        checks.push({
          domain: fullDomain,
          available: !hasA && !hasMx,
          note: !hasA && !hasMx ? 'No DNS records — likely available, confirm at a registrar' : hasA ? 'Has a website — registered' : 'Has mail records — registered',
        });
      } catch {
        checks.push({
          domain: fullDomain,
          available: false,
          error: 'DNS lookup failed',
        });
      }
    }

    setResults(checks);
    setIsLoading(false);

    const available = checks.filter(c => c.available);
    if (available.length > 0) {
      toast.success(`${available.length} domain(s) available!`);
    } else {
      toast('All checked domains are taken — try a different name', { icon: '💡' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-5 border border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-500" />
          Domain Name Availability Checker
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Checks each name against its authoritative RDAP server first (a missing record means likely available), falling back to DNS web+mail records where RDAP is unsupported. A final registrar check confirms before purchase.</p>
      </div>

      <div className="bg-[var(--bg-elevated)]/30 border border-[var(--border-subtle)] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            aria-label="Domain"
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkDomain()}
            placeholder="Enter a name (e.g. myproject)"
            className="flex-1 px-4 py-2.5 text-sm bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/40"
          />
          <button
            onClick={checkDomain}
            disabled={isLoading}
            className="px-5 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--accent-ink)]/50 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {isLoading ? 'Checking...' : 'Check Availability'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((r) => (
              <div key={r.domain} className="flex items-center justify-between px-4 py-3 bg-[var(--bg-overlay)]/30 rounded-xl border border-[var(--border-subtle)]/50">
                <div className="flex items-center gap-3">
                  {r.available ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-700 dark:text-red-400 shrink-0" />
                  )}
                  <span className="text-sm font-mono text-[var(--text-primary)]">{r.domain}</span>
                  {r.note && <span className="text-[10px] text-[var(--text-muted)] hidden sm:inline">{r.note}</span>}
                </div>
                <span className={`text-xs font-medium ${r.available ? 'text-emerald-600' : 'text-[var(--text-muted)]'}`}>
                  {r.available ? 'Available' : r.error || 'Taken'}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-[11px] text-[var(--text-muted)] flex items-center gap-1">
          <ExternalLink className="w-3 h-3" />
          Powered by Google DNS — real-time lookup, no registration stored
        </p>
      </div>
    </div>
  );
}
