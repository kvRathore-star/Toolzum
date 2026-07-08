"use client";

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Loader2, AlertCircle, Eye, Info, CheckCircle2, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const DAILY_LIMIT = 20;

export default function PincodeFinder() {
  const [searchMode, setSearchMode] = useState<'pincode' | 'postoffice'>('pincode');
  const [pincode, setPincode] = useState('');
  const [officeName, setOfficeName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[] | null>(null);
  const [usage, setUsage] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('pincodeFinderUsage');
    if (stored) {
      try {
        const { date, count } = JSON.parse(stored);
        setUsage(date === today ? count : 0);
      } catch { setUsage(0); }
    }
  }, []);

  const trackUsage = (count: number) => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('pincodeFinderUsage', JSON.stringify({ date: today, count }));
    setUsage(count);
  };

  const handleSearch = async () => {
    setError(null);
    setResults(null);
    if (usage >= DAILY_LIMIT) { toast.error(`You've used all ${DAILY_LIMIT} free searches today. Upgrade to Pro for unlimited lookups.`); return; }

    if (searchMode === 'pincode') {
      const cleanPincode = pincode.trim();
      if (!cleanPincode) { toast.error('Please enter a Pincode'); return; }
      if (!/^\d{6}$/.test(cleanPincode)) { setError('Pincode must be exactly 6 digits (e.g. 110001).'); return; }
      setLoading(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPincode}`);
        if (!response.ok) throw new Error('API server returned an error.');
        const json = (await response.json()) as any;
        const postOffices = json[0]?.PostOffice;
        if (json[0]?.Status === 'Success' && postOffices) { setResults(postOffices); trackUsage(usage + 1); toast.success(`Found ${postOffices.length} branches!`); }
        else setError(json[0]?.Message || 'No post offices found for this pincode.');
      } catch (err) { setError('Failed to fetch pincode details. Please verify your connection and try again.'); }
      finally { setLoading(false); }
    } else {
      const cleanName = officeName.trim();
      if (!cleanName || cleanName.length < 3) { toast.error('Please enter at least 3 characters of the Post Office name'); return; }
      setLoading(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(cleanName)}`);
        if (!response.ok) throw new Error('API server returned an error.');
        const json = (await response.json()) as any;
        const postOffices = json[0]?.PostOffice;
        if (json[0]?.Status === 'Success' && postOffices) { setResults(postOffices); trackUsage(usage + 1); toast.success(`Found ${postOffices.length} matching branches!`); }
        else setError(json[0]?.Message || 'No post offices found matching this name.');
      } catch (err) { setError('Failed to fetch post office details. Please try again.'); }
      finally { setLoading(false); }
    }
  };

  const getPincodeBreakdown = (pinStr: string) => {
    if (pinStr.length !== 6) return null;
    return { region: pinStr[0], subRegion: pinStr[1], sortingDistrict: pinStr[2], office: pinStr.substring(3) };
  };

  const currentPincode = searchMode === 'pincode' ? pincode : results?.[0]?.Pincode || '';
  const breakdown = currentPincode.length === 6 ? getPincodeBreakdown(currentPincode) : null;
  const remaining = DAILY_LIMIT - usage;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 border border-zinc-200 dark:border-white/5 rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-indigo-500" />
            India Pincode & Branch Finder
          </h2>
          <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0"><Crown className="w-3.5 h-3.5" /> Pro</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] dark:text-zinc-400 mt-1">
          Search details by pincode or lookup pincodes by Post Office/Branch name across India. Free official postal API integration.
        </p>
      </div>

      <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
        <p className="text-xs text-zinc-500">Daily free searches:</p>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: DAILY_LIMIT }, (_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < usage ? 'bg-zinc-300 dark:bg-zinc-600' : 'bg-indigo-500'}`} />
            ))}
          </div>
          <span className="text-[10px] font-bold text-zinc-500">{remaining} / {DAILY_LIMIT} remaining</span>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl max-w-sm">
        <button onClick={() => { setSearchMode('pincode'); setError(null); setResults(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${searchMode === 'pincode' ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-secondary)] dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}>Search by Pincode</button>
        <button onClick={() => { setSearchMode('postoffice'); setError(null); setResults(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${searchMode === 'postoffice' ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-secondary)] dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}>Search by Branch Name</button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="space-y-2">
          {searchMode === 'pincode' ? (
            <>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Enter 6-Digit Pincode</label>
              <div className="flex gap-2">
                <input type="text" maxLength={6} placeholder="e.g. 110001" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-lg font-mono tracking-widest text-zinc-900 dark:text-white outline-none"
                  onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                <button onClick={handleSearch} disabled={loading || remaining === 0}
                  className="bg-[var(--accent)] hover:bg-indigo-600 disabled:bg-indigo-800/50 text-white font-bold px-6 rounded-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  {remaining === 0 ? 'Limit reached' : 'Search'}
                </button>
              </div>
            </>
          ) : (
            <>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Enter Post Office / City Name</label>
              <div className="flex gap-2">
                <input type="text" placeholder="e.g. Connaught Place" value={officeName} onChange={(e) => setOfficeName(e.target.value)}
                  className="flex-1 bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none"
                  onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                <button onClick={handleSearch} disabled={loading || remaining === 0}
                  className="bg-[var(--accent)] hover:bg-indigo-600 disabled:bg-indigo-800/50 text-white font-bold px-6 rounded-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  {remaining === 0 ? 'Limit reached' : 'Search'}
                </button>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 animate-in fade-in duration-300">
            <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
            <div><h4 className="font-bold text-rose-400">Search Error</h4><p className="text-sm text-[var(--text-secondary)] dark:text-zinc-400 mt-0.5">{error}</p></div>
          </div>
        )}

        {breakdown && (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl space-y-4">
            <div className="flex items-center gap-1 text-xs font-bold text-zinc-800 dark:text-zinc-200"><Info className="w-4 h-4 text-indigo-500" />Pincode Structure Analysis ({currentPincode})</div>
            <div className="flex justify-center text-center gap-1 font-mono text-xl font-bold p-3 bg-white dark:bg-black/50 rounded-lg border border-zinc-200 dark:border-white/5">
              <div className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded"><span className="text-indigo-400 block">{breakdown.region}</span><span className="text-[8px] text-zinc-500 uppercase block mt-1">Region</span></div>
              <div className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded"><span className="text-rose-400 block">{breakdown.subRegion}</span><span className="text-[8px] text-zinc-500 uppercase block mt-1">Sub-Reg</span></div>
              <div className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded"><span className="text-amber-400 block">{breakdown.sortingDistrict}</span><span className="text-[8px] text-zinc-500 uppercase block mt-1">Sorting</span></div>
              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded flex-1"><span className="text-emerald-400 block tracking-widest">{breakdown.office}</span><span className="text-[8px] text-zinc-500 uppercase block mt-1">Post Office Route</span></div>
            </div>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Branches Found ({results.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
              {results.map((office: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 hover:border-indigo-500/30 transition-all flex flex-col justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-zinc-900 dark:text-[var(--text-primary)] text-sm block">{office.Name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${office.DeliveryStatus === 'Delivery' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{office.DeliveryStatus}</span>
                    </div>
                    <span className="text-zinc-500 block">Type: {office.BranchType}</span>
                  </div>
                  <div className="space-y-1 text-[var(--text-secondary)] dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-2">
                    <span className="block">Pincode: <strong className="font-mono text-indigo-400">{office.Pincode}</strong></span>
                    <span className="block">District: {office.District}</span>
                    <span className="block">Circle: {office.Circle}</span>
                    <span className="block">State: {office.State}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3 flex items-center justify-between">
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400"><strong>Pro:</strong> Bulk pincode lookup — upload a CSV of 100+ pincodes and get city/state/district data in one click. Used by e-commerce sellers and logistics teams daily.</p>
          <Link href="/pricing" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 underline shrink-0 ml-4">Upgrade →</Link>
        </div>
      </div>
    </div>
  );
}
