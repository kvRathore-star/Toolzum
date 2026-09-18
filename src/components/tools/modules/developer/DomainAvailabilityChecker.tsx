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
    const name = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').split('.')[0];
    if (!name || name.length < 2) {
      toast.error('Enter a domain name (at least 2 characters)');
      return;
    }

    setIsLoading(true);
    setResults([]);

    const checks: DomainStatus[] = [];
    for (const tld of COMMON_TLDS) {
      const fullDomain = `${name}${tld}`;
      try {
        // Check A (web) AND MX (mail) records: a domain with mail but no
        // website is still registered. The old check looked at A records
        // only and reported such domains as "available".
        const [aRes, mxRes] = await Promise.all([
          fetch(`https://dns.google/resolve?name=${fullDomain}&type=A`),
          fetch(`https://dns.google/resolve?name=${fullDomain}&type=MX`),
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
        <p className="text-xs text-[var(--text-secondary)] mt-1">Checks live DNS (web + mail records) across 10 popular TLDs. DNS-based — a final registrar check confirms before purchase.</p>
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
