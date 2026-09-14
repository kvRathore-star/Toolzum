"use client";

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Loader2, AlertCircle, Info, CheckCircle2, Crown, Clock, TrendingUp, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { clipboardWrite } from "@/lib/clipboard";
import { useUsageCounter } from '@/hooks/useUsageCounter';

const DAILY_LIMIT = 20;

const QUICK_PRESETS = ['110001', '400001', '700001', '600001', '500001', '560001'];

export default function PincodeFinder() {
  const [searchMode, setSearchMode] = useState<'pincode' | 'postoffice'>('pincode');
  const [pincode, setPincode] = useState('');
  const [officeName, setOfficeName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[] | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const { usage, trackUsage } = useUsageCounter('pincodeFinderUsage');

  useEffect(() => {
    const history = localStorage.getItem('pincodeSearchHistory');
    if (history) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate search history from localStorage on mount
      try { setSearchHistory(JSON.parse(history)); } catch {}
    }
  }, []);

  const addToHistory = (query: string) => {
    const updated = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem('pincodeSearchHistory', JSON.stringify(updated));
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
        if (json[0]?.Status === 'Success' && postOffices) { setResults(postOffices); trackUsage(usage + 1); addToHistory(cleanPincode); toast.success(`Found ${postOffices.length} branches!`); }
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
        if (json[0]?.Status === 'Success' && postOffices) { setResults(postOffices); trackUsage(usage + 1); addToHistory(cleanName); toast.success(`Found ${postOffices.length} matching branches!`); }
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

  const accentColor = '#2563eb';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--bg-overlay)] p-6 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <MapPin className="w-6 h-6" style={{ color: accentColor }} />
            India Pincode & Branch Finder
          </h2>
          <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0"><Crown className="w-3.5 h-3.5" /> Pro</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mt-1">
          Search details by pincode or lookup pincodes by Post Office/Branch name across India. Free official postal API integration.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-between bg-[var(--bg-overlay)]/50 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)]">
        <p className="text-xs text-[var(--text-secondary)]">Daily free searches:</p>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: DAILY_LIMIT }, (_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i < usage ? 'bg-zinc-300 dark:bg-zinc-600' : ''}`} style={{ backgroundColor: i < usage ? undefined : accentColor }} />
            ))}
          </div>
          <motion.span key={remaining} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-[10px] font-bold text-[var(--text-secondary)]">{remaining} / {DAILY_LIMIT} remaining</motion.span>
        </div>
      </motion.div>

      <div className="flex gap-2 p-1 bg-[var(--bg-surface)] rounded-xl max-w-sm">
        <button onClick={() => { setSearchMode('pincode'); setError(null); setResults(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${searchMode === 'pincode' ? 'text-white shadow-sm' : 'text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:text-zinc-900 dark:hover:text-zinc-200'}`}
          style={{ backgroundColor: searchMode === 'pincode' ? accentColor : 'transparent' }}>Search by Pincode</button>
        <button onClick={() => { setSearchMode('postoffice'); setError(null); setResults(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${searchMode === 'postoffice' ? 'text-white shadow-sm' : 'text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:text-zinc-900 dark:hover:text-zinc-200'}`}
          style={{ backgroundColor: searchMode === 'postoffice' ? accentColor : 'transparent' }}>Search by Branch Name</button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
        <div className="space-y-2">
          {searchMode === 'pincode' ? (
            <>
              <label className="block text-sm font-bold text-[var(--text-primary)]">Enter 6-Digit Pincode</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: accentColor }} />
                  <input aria-label="Enter 6-Digit Pincode" type="text" maxLength={6} placeholder="e.g. 110001" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] rounded-xl pl-12 pr-4 py-3 text-lg font-mono tracking-widest text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 transition-all duration-200"
                    style={{ borderColor: pincode.length === 6 ? accentColor : undefined, '--tw-ring-color': accentColor } as React.CSSProperties}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                </div>
                <button onClick={handleSearch} disabled={loading || remaining === 0}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 text-white font-bold px-6 rounded-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-blue-500/25">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  {remaining === 0 ? 'Limit reached' : 'Search'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {QUICK_PRESETS.map(p => (
                  <button key={p} onClick={() => setPincode(p)}
                    className="px-3 py-1 text-[10px] font-semibold rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-400 transition-all cursor-pointer bg-[var(--bg-overlay)]/50">
                    {p}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <label className="block text-sm font-bold text-[var(--text-primary)]">Enter Post Office / City Name</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: accentColor }} />
                  <input aria-label="Enter Post Office / City Name" type="text" placeholder="e.g. Connaught Place" value={officeName} onChange={(e) => setOfficeName(e.target.value)}
                    className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 transition-all duration-200"
                    onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                </div>
                <button onClick={handleSearch} disabled={loading || remaining === 0}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 text-white font-bold px-6 rounded-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-blue-500/25">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  {remaining === 0 ? 'Limit reached' : 'Search'}
                </button>
              </div>
            </>
          )}
        </div>

        <AnimatePresence>
          {searchHistory.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1"><Clock className="w-3 h-3" style={{ color: accentColor }} /> Recent Searches</span>
                <button aria-label="Clear search history" onClick={() => { setSearchHistory([]); localStorage.removeItem('pincodeSearchHistory'); }} className="text-[10px] text-[var(--text-secondary)] hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {searchHistory.map((h, i) => (
                  <button key={i} onClick={() => { if (/^\d{6}$/.test(h)) { setSearchMode('pincode'); setPincode(h); } else { setSearchMode('postoffice'); setOfficeName(h); } }}
                    className="px-2.5 py-1 text-[10px] rounded-lg bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-blue-400 transition-all cursor-pointer">
                    {h}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-rose-700 dark:text-rose-400" />
              <div><h3 className="font-bold text-rose-700 dark:text-rose-400">Search Error</h3><p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mt-0.5">{error}</p></div>
            </motion.div>
          )}
        </AnimatePresence>

        {breakdown && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] rounded-xl space-y-4">
            <div className="flex items-center gap-1 text-xs font-bold text-zinc-800 dark:text-zinc-200"><Info className="w-4 h-4" style={{ color: accentColor }} />Pincode Structure Analysis ({currentPincode})</div>
            <div className="flex justify-center text-center gap-1 font-mono text-xl font-bold p-3 bg-white dark:bg-black/50 rounded-lg border border-zinc-200 dark:border-[var(--border-subtle)]">
              <div className="px-2 py-1 rounded" style={{ backgroundColor: '#2563eb10', borderColor: '#2563eb20', borderWidth: 1 }}><span style={{ color: accentColor }} className="block">{breakdown.region}</span><span className="text-[8px] text-[var(--text-secondary)] uppercase block mt-1">Region</span></div>
              <div className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded"><span className="text-rose-700 dark:text-rose-400 block">{breakdown.subRegion}</span><span className="text-[8px] text-[var(--text-secondary)] uppercase block mt-1">Sub-Reg</span></div>
              <div className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded"><span className="text-amber-700 dark:text-amber-400 block">{breakdown.sortingDistrict}</span><span className="text-[8px] text-[var(--text-secondary)] uppercase block mt-1">Sorting</span></div>
              <div className="px-3 py-1 bg-emerald-700/10 border border-emerald-500/20 rounded flex-1"><span className="text-emerald-700 dark:text-emerald-400 block tracking-widest">{breakdown.office}</span><span className="text-[8px] text-[var(--text-secondary)] uppercase block mt-1">Post Office Route</span></div>
            </div>
          </motion.div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="relative">
                <MapPin className="w-10 h-10 mx-auto" style={{ color: accentColor }} />
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full" style={{ backgroundColor: accentColor + '40' }} />
              </motion.div>
              <p className="text-xs text-[var(--text-secondary)] mt-3">Searching postal database...</p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {results && results.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Branches Found ({results.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
                {results.map((office: any, idx: number) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-xl bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] transition-all duration-200 flex flex-col justify-between gap-3 text-xs"
                    style={{ borderColor: idx === 0 ? accentColor + '30' : undefined }}>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-zinc-900 dark:text-[var(--text-primary)] text-sm block">{office.Name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${office.DeliveryStatus === 'Delivery' ? 'bg-emerald-700/10 text-emerald-700 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'}`}>{office.DeliveryStatus}</span>
                      </div>
                      <span className="text-[var(--text-secondary)] block">Type: {office.BranchType}</span>
                    </div>
                    <div className="space-y-1 text-[var(--text-secondary)] dark:text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-2">
                      <span className="block">Pincode: <strong className="font-mono" style={{ color: accentColor }}>{office.Pincode}</strong>
                        <button aria-label={`Copy pincode ${office.Pincode}`} onClick={() => { clipboardWrite(office.Pincode); toast.success('Pincode copied!'); }} className="ml-1.5 inline-flex p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                      </span>
                      <span className="block"><MapPin className="w-3 h-3 inline mr-1" style={{ color: accentColor }} />District: {office.District}</span>
                      <span className="block">Circle: {office.Circle}</span>
                      <span className="block">State: {office.State}</span>
                    </div>
                    {office.Phone && (
                      <div className="text-[10px] text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-2">
                        📞 {office.Phone}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-3 rounded-xl flex items-center justify-between" style={{ backgroundColor: '#2563eb10', borderColor: '#2563eb20', borderWidth: 1 }}>
          <p className="text-[10px]" style={{ color: accentColor }}><strong>Pro:</strong> Bulk pincode lookup — upload a CSV of 100+ pincodes and get city/state/district data in one click. Used by e-commerce sellers and logistics teams daily.</p>
          <Link href="/pricing" className="text-[10px] font-bold underline shrink-0 ml-4" style={{ color: accentColor }}>Upgrade →</Link>
        </div>
      </motion.div>
    </div>
  );
}
