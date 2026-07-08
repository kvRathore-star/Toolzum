"use client";

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, ShieldCheck, HelpCircle, Loader2, AlertCircle, Building, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

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
  const [usage, setUsage] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('ifscLookupUsage');
    if (stored) {
      try {
        const { date, count } = JSON.parse(stored);
        setUsage(date === today ? count : 0);
      } catch { setUsage(0); }
    }
  }, []);

  const trackUsage = (count: number) => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('ifscLookupUsage', JSON.stringify({ date: today, count }));
    setUsage(count);
  };

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
    } catch (err: any) {
      setError(err.message || 'An error occurred during lookup.');
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
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 border border-zinc-200 dark:border-white/5 rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-indigo-500" />
            IFSC Bank Branch Lookup
          </h2>
          <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0"><Crown className="w-3.5 h-3.5" /> Pro</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] dark:text-zinc-400 mt-1">
          Look up Indian Financial System Code (IFSC) branch details, address, MICR, contact information, and bank features instantly.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <p className="text-xs text-zinc-500">Daily free lookups:</p>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: DAILY_LIMIT }, (_, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < usage ? 'bg-zinc-300 dark:bg-zinc-600' : 'bg-indigo-500'}`} />
              ))}
            </div>
            <span className="text-[10px] font-bold text-zinc-500">{remaining} / {DAILY_LIMIT} remaining</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Enter 11-Digit IFSC Code</label>
          <div className="flex gap-2">
            <input type="text" maxLength={11} placeholder="e.g. HDFC0000123" value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              className="flex-1 bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-lg font-mono tracking-wider text-zinc-900 dark:text-white outline-none"
              onKeyDown={e => e.key === 'Enter' && handleLookup()} />
            <button onClick={handleLookup} disabled={loading || remaining === 0}
              className="bg-[var(--accent)] hover:bg-indigo-600 disabled:bg-indigo-800/50 text-white font-bold px-6 rounded-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {remaining === 0 ? 'Limit reached' : 'Lookup'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 animate-in fade-in duration-300">
            <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
            <div><h4 className="font-bold text-rose-400">Lookup Error</h4><p className="text-sm text-[var(--text-secondary)] dark:text-zinc-400 mt-0.5">{error}</p></div>
          </div>
        )}

        {data && (
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            {data.isOfflineFallback && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div><h4 className="font-bold text-amber-400">Offline Fallback Match</h4><p className="text-sm text-[var(--text-secondary)] dark:text-zinc-400 mt-0.5">We identified this bank code locally, but detailed branch information requires an active internet connection.</p></div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 space-y-1">
                <span className="text-xs text-zinc-500 font-bold uppercase block">Bank Name</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-[var(--text-primary)] block">{data.BANK}</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 space-y-1">
                <span className="text-xs text-zinc-500 font-bold uppercase block">Branch Name</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-[var(--text-primary)] block">{data.BRANCH}</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 space-y-1">
                <span className="text-xs text-zinc-500 font-bold uppercase block">IFSC Code</span>
                <span className="text-lg font-mono font-bold text-indigo-500 block">{data.IFSC}</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 space-y-1">
                <span className="text-xs text-zinc-500 font-bold uppercase block">MICR Code</span>
                <span className="text-lg font-mono font-bold text-zinc-800 dark:text-zinc-200 block">{data.MICR || 'N/A'}</span>
              </div>
            </div>
            {data.ADDRESS && (
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 space-y-4">
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500 font-bold uppercase block">Branch Address</span>
                  <div className="flex items-start gap-2 text-zinc-800 dark:text-zinc-200 text-sm">
                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{data.ADDRESS}, {data.CITY}, {data.DISTRICT}, {data.STATE}</span>
                  </div>
                </div>
                <div className="flex gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                  <a href={getMapsLink()} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer">View on Google Maps</a>
                </div>
              </div>
            )}
            {!data.isOfflineFallback && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
                <div className={`p-3 rounded-lg border ${data.UPI !== false ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>UPI Supported</div>
                <div className={`p-3 rounded-lg border ${data.NEFT !== false ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>NEFT Supported</div>
                <div className={`p-3 rounded-lg border ${data.IMPS !== false ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>IMPS Supported</div>
                <div className={`p-3 rounded-lg border ${data.RTGS !== false ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>RTGS Supported</div>
              </div>
            )}
            {data.CONTACT && data.CONTACT !== 'N/A' && (
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] dark:text-zinc-400">
                <Phone className="w-4 h-4 text-indigo-500" />
                <span>Contact Number: <strong>{data.CONTACT}</strong></span>
              </div>
            )}
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3 flex items-center justify-between">
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400"><strong>Pro:</strong> Bulk IFSC validation — upload a CSV of 100+ IFSC codes and get branch details in one click. Used by accountants and CAs daily.</p>
          <Link href="/pricing" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 underline shrink-0 ml-4">Upgrade →</Link>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-white/5 space-y-2">
          <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            IFSC Code Structure
          </h4>
          <p className="text-xs text-zinc-500 leading-relaxed">
            The 11-digit IFSC code uniquely identifies bank branches in India. The first four characters represent the <strong>Bank Name</strong> (e.g. HDFC), the fifth character is always <strong>0</strong> (reserved for future use), and the last six characters represent the specific <strong>Branch Code</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
