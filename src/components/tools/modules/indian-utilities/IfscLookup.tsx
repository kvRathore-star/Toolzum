"use client";

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, ShieldCheck, HelpCircle, Loader2, AlertCircle, Building, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useUsageCounter } from '@/hooks/useUsageCounter';
import { getErrorMessage } from '@/utils/error';

const COMMON_BANKS: Record<string, string> = {
  SBIN: 'State Bank of India',
  HDFC: 'HDFC Bank',
  ICIC: 'ICICI Bank',
  UTIB: 'Axis Bank',
  BARB: 'Bank of Baroda',
  PUNB: 'Punjab National Bank',
  CNRB: 'Canara Bank',
  IBKL: 'IDBI Bank',
  KKBK: 'Kotak Mahindra Bank',
  YESB: 'Yes Bank',
  IDFB: 'IDFC First Bank',
  UBIN: 'Union Bank of India',
  IOBA: 'Indian Overseas Bank',
  MAHB: 'Bank of Maharashtra',
  PSIB: 'Punjab & Sind Bank',
  CBIN: 'Central Bank of India',
  INDB: 'IndusInd Bank',
};

const DAILY_LIMIT = 20;

export default function IfscLookup() {
  const [ifsc, setIfsc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const { usage, trackUsage } = useUsageCounter('ifscLookupUsage');

  const validateIFSC = (code: string) => /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(code);

  const handleLookup = async () => {
    const cleanIfsc = ifsc.trim().toUpperCase();
    if (!cleanIfsc) { toast.error('Please enter an IFSC code'); return; }
    if (cleanIfsc.length !== 11) { setError('IFSC code must be exactly 11 characters long.'); setData(null); return; }
    if (!validateIFSC(cleanIfsc)) { setError('Invalid IFSC format. Format should be: 4 letters, then 0, then 6 alphanumeric characters (e.g. SBIN0000001).'); setData(null); return; }
    if (usage >= DAILY_LIMIT) { toast.error(`You've used all ${DAILY_LIMIT} free lookups today. Upgrade to Pro for unlimited searches.`); return; }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`https://ifsc.razorpay.com/${cleanIfsc}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('IFSC code not found in the database. Please verify the code.');
        throw new Error('Failed to fetch IFSC details. Please try again.');
      }
      const json = await response.json();
      setData(json);
      trackUsage(usage + 1);
      toast.success('Branch details retrieved successfully!');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'An error occurred during lookup.'));
      const bankCode = cleanIfsc.substring(0, 4);
      const bankName = COMMON_BANKS[bankCode];
      if (bankName) {
        setData({ BANK: bankName, BRANCH: 'Offline Lookup (Details not available without internet)', IFSC: cleanIfsc, isOfflineFallback: true });
      }
    } finally { setLoading(false); }
  };

  const getMapsLink = () => {
    if (!data) return '#';
    const query = `${data.BANK} ${data.BRANCH} ${data.ADDRESS || ''} ${data.CITY || ''}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const remaining = DAILY_LIMIT - usage;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-6 border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Building className="w-6 h-6 text-[var(--accent)]" />
            IFSC Bank Branch Lookup
          </h2>
          <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0"><Crown className="w-3.5 h-3.5" /> Pro</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mt-1">
          Look up Indian Financial System Code (IFSC) branch details, address, MICR, contact information, and bank features instantly.
        </p>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex items-center justify-between bg-[var(--bg-overlay)]/50 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-secondary)]">Daily free lookups:</p>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: DAILY_LIMIT }, (_, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < usage ? 'bg-[var(--bg-overlay)] dark:bg-[var(--bg-elevated)]' : 'bg-[var(--accent-ink)]'}`} />
              ))}
            </div>
            <span className="text-[10px] font-bold text-[var(--text-secondary)]">{remaining} / {DAILY_LIMIT} remaining</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-[var(--text-primary)]">Enter 11-Digit IFSC Code</label>
          <div className="flex gap-2">
            <input aria-label="Enter 11-Digit IFSC Code" type="text" maxLength={11} placeholder="e.g. HDFC0000123" value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              className="flex-1 bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-xl px-4 py-3 text-lg font-mono tracking-wider text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              onKeyDown={e => e.key === 'Enter' && handleLookup()} />
            <button onClick={handleLookup} disabled={loading || remaining === 0}
              className="bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white font-bold px-6 rounded-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {remaining === 0 ? 'Limit reached' : 'Lookup'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 animate-in fade-in duration-300">
            <AlertCircle className="w-5 h-5 text-[var(--accent)] mt-0.5 shrink-0" />
            <div><h3 className="font-bold text-rose-700 dark:text-rose-400">Lookup Error</h3><p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mt-0.5">{error}</p></div>
          </div>
        )}

        {data && (
          <div className="border-t border-[var(--border-subtle)] pt-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            {data.isOfflineFallback && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div><h3 className="font-bold text-amber-700 dark:text-amber-400">Offline Fallback Match</h3><p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mt-0.5">We identified this bank code locally, but detailed branch information requires an active internet connection.</p></div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] space-y-1">
                <span className="text-xs text-[var(--text-secondary)] font-bold uppercase block">Bank Name</span>
                <span className="text-lg font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)] block">{data.BANK}</span>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] space-y-1">
                <span className="text-xs text-[var(--text-secondary)] font-bold uppercase block">Branch Name</span>
                <span className="text-lg font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)] block">{data.BRANCH}</span>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] space-y-1">
                <span className="text-xs text-[var(--text-secondary)] font-bold uppercase block">IFSC Code</span>
                <span className="text-lg font-mono font-bold text-[var(--accent)] block">{data.IFSC}</span>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] space-y-1">
                <span className="text-xs text-[var(--text-secondary)] font-bold uppercase block">MICR Code</span>
                <span className="text-lg font-mono font-bold text-[var(--text-primary)] block">{data.MICR || 'N/A'}</span>
              </div>
            </div>
            {data.ADDRESS && (
              <div className="p-4 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] space-y-4">
                <div className="space-y-1">
                  <span className="text-xs text-[var(--text-secondary)] font-bold uppercase block">Branch Address</span>
                  <div className="flex items-start gap-2 text-[var(--text-primary)] text-sm">
                    <MapPin className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                    <span>{data.ADDRESS}, {data.CITY}, {data.DISTRICT}, {data.STATE}</span>
                  </div>
                </div>
                <div className="flex gap-4 border-t border-[var(--border-subtle)] pt-3">
                  <a href={getMapsLink()} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[var(--accent)] hover:text-indigo-300 flex items-center gap-1 cursor-pointer">View on Google Maps</a>
                </div>
              </div>
            )}
            {!data.isOfflineFallback && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
                <div className={`p-3 rounded-lg border ${data.UPI !== false ? 'bg-emerald-700/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]'}`}>UPI Supported</div>
                <div className={`p-3 rounded-lg border ${data.NEFT !== false ? 'bg-emerald-700/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]'}`}>NEFT Supported</div>
                <div className={`p-3 rounded-lg border ${data.IMPS !== false ? 'bg-emerald-700/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]'}`}>IMPS Supported</div>
                <div className={`p-3 rounded-lg border ${data.RTGS !== false ? 'bg-emerald-700/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]'}`}>RTGS Supported</div>
              </div>
            )}
            {data.CONTACT && data.CONTACT !== 'N/A' && (
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
                <Phone className="w-4 h-4 text-[var(--accent)]" />
                <span>Contact Number: <strong>{data.CONTACT}</strong></span>
              </div>
            )}
          </div>
        )}

        <div className="bg-[var(--accent)]/10/20 border border-[var(--accent)]/20 rounded-xl p-3 flex items-center justify-between">
          <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]"><strong>Pro:</strong> Bulk IFSC validation — upload a CSV of 100+ IFSC codes and get branch details in one click. Used by accountants and CAs daily.</p>
          <Link href="/pricing" className="text-[10px] font-bold text-[var(--accent)] dark:text-[var(--accent)] underline shrink-0 ml-4">Upgrade →</Link>
        </div>

        <div className="p-4 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] space-y-2">
          <h3 className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
            IFSC Code Structure
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            The 11-digit IFSC code uniquely identifies bank branches in India. The first four characters represent the <strong>Bank Name</strong> (e.g. HDFC), the fifth character is always <strong>0</strong> (reserved for future use), and the last six characters represent the specific <strong>Branch Code</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
