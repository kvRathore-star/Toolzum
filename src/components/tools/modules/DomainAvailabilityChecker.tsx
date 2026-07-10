"use client";

import React, { useState } from 'react';
import { Search, Globe, CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DomainStatus {
  domain: string;
  available: boolean;
  error?: string;
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
        const res = await fetch(`https://dns.google/resolve?name=${fullDomain}&type=A`);
        const data: { Answer?: { data: string }[] } = await res.json();
        checks.push({
          domain: fullDomain,
          available: !data.Answer || data.Answer.length === 0,
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
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 border border-zinc-200 dark:border-white/5 rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-500" />
          Domain Name Availability Checker
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Check domain availability across 10 popular TLDs instantly. Find available domains for your next project.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkDomain()}
            placeholder="Enter a name (e.g. myproject)"
            className="flex-1 px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <button
            onClick={checkDomain}
            disabled={isLoading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {isLoading ? 'Checking...' : 'Check Availability'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((r) => (
              <div key={r.domain} className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-700/50">
                <div className="flex items-center gap-3">
                  {r.available ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                  <span className="text-sm font-mono text-[var(--text-primary)]">{r.domain}</span>
                </div>
                <span className={`text-xs font-medium ${r.available ? 'text-emerald-600' : 'text-zinc-400'}`}>
                  {r.available ? 'Available' : r.error || 'Taken'}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-[11px] text-zinc-400 flex items-center gap-1">
          <ExternalLink className="w-3 h-3" />
          Powered by Google DNS — real-time lookup, no registration stored
        </p>
      </div>
    </div>
  );
}
