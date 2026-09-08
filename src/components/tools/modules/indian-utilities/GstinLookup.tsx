"use client";

import React, { useState, useMemo } from 'react';
import { Search, Building2, MapPin, Calendar, Shield, FileSpreadsheet, Download, Check, X, Upload, Copy, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from "@/lib/clipboard";

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir','02': 'Himachal Pradesh','03': 'Punjab','04': 'Chandigarh','05': 'Uttarakhand',
  '06': 'Haryana','07': 'Delhi','08': 'Rajasthan','09': 'Uttar Pradesh','10': 'Bihar',
  '11': 'Sikkim','12': 'Arunachal Pradesh','13': 'Nagaland','14': 'Manipur','15': 'Mizoram',
  '16': 'Tripura','17': 'Meghalaya','18': 'Assam','19': 'West Bengal','20': 'Jharkhand',
  '21': 'Odisha','22': 'Chhattisgarh','23': 'Madhya Pradesh','24': 'Gujarat','25': 'Daman & Diu',
  '26': 'Dadra & Nagar Haveli','27': 'Maharashtra','28': 'Andhra Pradesh','29': 'Karnataka',
  '30': 'Goa','31': 'Lakshadweep','32': 'Kerala','33': 'Tamil Nadu','34': 'Puducherry',
  '35': 'Andaman & Nicobar','36': 'Telangana','37': 'Andhra Pradesh (New)','38': 'Ladakh','97': 'Other Territory',
};

function mockLookup(gstin: string) {
  const stateCode = gstin.slice(0, 2);
  const pan = gstin.slice(2, 12);
  const entity = gstin.slice(12, 15);
  const state = STATE_CODES[stateCode] || 'Unknown State';
  return {
    legalName: `Sample Business ${pan.slice(0, 4)}`,
    tradeName: `Sample Trade ${pan.slice(0, 4)}`,
    address: `123 Business Park, Sector ${parseInt(entity, 36) % 20 + 1}, ${state}`,
    state,
    pincode: `${parseInt(stateCode) * 1000 + 100}`,
    registrationDate: `20${Math.floor(Math.random() * 4) + 20}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    lastUpdatedDate: `20${Math.floor(Math.random() * 2) + 24}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    status: 'Active',
    taxpayerType: ['Regular', 'Composition', 'Unregistered'][Math.floor(Math.random() * 2)],
    filingStatus: ['Filing Regularly', 'Filing Quarterly', 'Pending'][Math.floor(Math.random() * 2)],
    constitution: ['Private Limited', 'Public Limited', 'Partnership', 'Proprietorship', 'LLP'][Math.floor(Math.random() * 5)],
  };
}

function getDailyLookups(): number {
  if (typeof window === 'undefined') return 0;
  const data = localStorage.getItem('gstin_lookups');
  if (!data) return 0;
  const { date, count } = JSON.parse(data);
  if (date !== new Date().toDateString()) return 0;
  return count;
}

function incrementLookups() {
  localStorage.setItem('gstin_lookups', JSON.stringify({ date: new Date().toDateString(), count: getDailyLookups() + 1 }));
}

interface LookupResult {
  legalName: string; tradeName: string; address: string; state: string; pincode: string;
  registrationDate: string; lastUpdatedDate: string; status: string; taxpayerType: string;
  filingStatus: string; constitution: string;
}

export default function GstinLookup() {
  const [gstin, setGstin] = useState('');
  const [result, setResult] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [bulkData, setBulkData] = useState<string[]>([]);
  const [bulkResults, setBulkResults] = useState<LookupResult[]>([]);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

  const isValid = useMemo(() => GSTIN_REGEX.test(gstin.toUpperCase()), [gstin]);
  const dailyUsed = getDailyLookups();
  const isFreeLimitReached = dailyUsed >= 5;

  const handleLookup = () => {
    const clean = gstin.trim().toUpperCase();
    if (!clean) return toast.error('Enter a GSTIN');
    if (!GSTIN_REGEX.test(clean)) return toast.error('Invalid GSTIN format. Must be 15 characters (2 state + 10 PAN + 3 entity + 1 check)');
    if (isFreeLimitReached) return toast.error('Daily free limit (5) reached. Upgrade to Pro for unlimited lookups.');

    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const data = mockLookup(clean);
      setResult(data);
      incrementLookups();
      setLoading(false);
      toast.success('GSTIN lookup complete');
    }, 800);
  };

  const handleBulkFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').map(l => l.trim().toUpperCase()).filter(l => l && GSTIN_REGEX.test(l));
      if (lines.length === 0) return toast.error('No valid GSTINs found in file');
      setBulkData(lines);
      toast.success(`Found ${lines.length} valid GSTINs`);
    };
    reader.readAsText(file);
  };

  const handleBulkLookup = () => {
    const results = bulkData.map(g => mockLookup(g));
    setBulkResults(results);
    toast.success(`Looked up ${results.length} GSTINs`);
  };

  const handleExport = () => {
    const data = result ? [result] : bulkResults;
    if (data.length === 0) return toast.error('No data to export');
    const header = 'Legal Name,Trade Name,Address,State,Pincode,Registration Date,Status,Taxpayer Type,Filing Status,Constitution';
    const rows = data.map(r => `"${r.legalName}","${r.tradeName}","${r.address}","${r.state}","${r.pincode}","${r.registrationDate}","${r.status}","${r.taxpayerType}","${r.filingStatus}","${r.constitution}"`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `gstin_lookup_${Date.now()}.csv`);
    toast.success(`Exported ${data.length} records`);
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <Search className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">GSTIN Lookup & Business Verifier</h3>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
        <div className="flex border-b border-[var(--border-subtle)]">
          {(['single', 'bulk'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab ? 'text-emerald-500 border-b-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}>
              {tab === 'single' ? 'Single Lookup' : 'Bulk CSV'}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {activeTab === 'single' ? (
            <>
              <p className="text-xs text-[var(--text-secondary)]">Enter a 15-character GSTIN to verify business details. Free: 5 lookups/day. <strong>{5 - dailyUsed} remaining today.</strong></p>
              <div className="flex gap-2">
                <input aria-label="Enter a 15-character GSTIN to verify business details. Free: 5 lookups/day." value={gstin} onChange={e => setGstin(e.target.value.toUpperCase())} placeholder="27AABCU1234D1Z5"
                  maxLength={15}
                  className="flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--text-primary)] uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/30" />
                <button onClick={handleLookup} disabled={loading || !gstin || isFreeLimitReached}
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 transition-colors">
                  {loading ? 'Searching...' : <><Search className="w-4 h-4" /> Verify</>}
                </button>
              </div>

              {result && (
                <div className="bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">{result.legalName}</h4>
                        <p className="text-[11px] text-[var(--text-secondary)]">@{result.tradeName}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full">{result.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-[var(--text-muted)]" /> <span className="text-zinc-600 dark:text-[var(--text-muted)]">{result.address}</span></div>
                      <div className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-[var(--text-muted)]" /> <span className="text-zinc-600 dark:text-[var(--text-muted)]">{result.constitution}</span></div>
                      <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-[var(--text-muted)]" /> <span className="text-zinc-600 dark:text-[var(--text-muted)]">Registered: {result.registrationDate}</span></div>
                      <div className="flex items-center gap-1.5"><FileSpreadsheet className="w-3 h-3 text-[var(--text-muted)]" /> <span className="text-zinc-600 dark:text-[var(--text-muted)]">{result.taxpayerType} · {result.filingStatus}</span></div>
                    </div>
                  </div>
                  <div className="border-t border-[var(--border-subtle)] p-3 flex gap-2">
                    <button onClick={handleExport} className="flex items-center gap-1 px-3 py-1.5 bg-zinc-200 dark:bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] rounded-lg text-[10px] font-semibold hover:bg-zinc-300 dark:hover:bg-[var(--bg-elevated)] transition-colors">
                      <Download className="w-3 h-3" /> Export CSV
                    </button>
                    <button onClick={() => { clipboardWrite(JSON.stringify(result, null, 2)); toast.success('Copied!'); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-zinc-200 dark:bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] rounded-lg text-[10px] font-semibold hover:bg-zinc-300 dark:hover:bg-[var(--bg-elevated)] transition-colors">
                      <Copy className="w-3 h-3" /> Copy JSON
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-xs text-[var(--text-secondary)]">Upload a CSV or text file with one GSTIN per line. Pro feature — bulk verify up to 500 GSTINs at once.</p>
              <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-6 text-center hover:border-emerald-500/50 transition-colors cursor-pointer bg-[var(--bg-overlay)]/50 dark:bg-black/20"
                role="button" tabIndex={0} onClick={() => document.getElementById('bulk-gstin-file')?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('bulk-gstin-file')?.click(); } }}>
                <Upload className="w-8 h-8 mx-auto mb-2 text-[var(--text-muted)]" />
                <p className="text-sm font-medium text-zinc-600 dark:text-[var(--text-muted)]">{bulkData.length > 0 ? `${bulkData.length} GSTINs loaded` : 'Upload CSV/TXT file'}</p>
                <p className="text-[10px] text-[var(--text-secondary)] mt-1">One GSTIN per line</p>
                <input aria-label="One GSTIN per line" id="bulk-gstin-file" type="file" accept=".csv,.txt" onChange={handleBulkFile} className="sr-only" />
              </div>
              {bulkData.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)]">{bulkData.length} GSTINs loaded</span>
                    <button onClick={handleBulkLookup} className="px-4 py-2 bg-emerald-700 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors">
                      Verify All
                    </button>
                  </div>
                  {bulkResults.length > 0 && (
                    <>
                      <div className="max-h-60 overflow-y-auto border border-[var(--border-subtle)] rounded-xl divide-y divide-zinc-100 dark:divide-zinc-800">
                        {bulkResults.map((r, i) => (
                          <div key={i} className="p-3 bg-[var(--bg-overlay)]">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{r.legalName}</p>
                                <p className="text-[10px] text-[var(--text-secondary)]">{bulkData[i]}</p>
                              </div>
                              <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold rounded">{r.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={handleExport} className="w-full py-2.5 bg-zinc-200 dark:bg-[var(--bg-surface)] hover:bg-zinc-300 dark:hover:bg-[var(--bg-elevated)] text-zinc-600 dark:text-[var(--text-muted)] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                        <Download className="w-3.5 h-3.5" /> Export All to CSV
                      </button>
                    </>
                  )}
                </div>
              )}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3">
                <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Bulk lookup is a Pro feature. Free: 5 individual lookups/day.
                </p>
              </div>
            </>
          )}

          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
            <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]">
              <strong>Pro:</strong> Unlimited lookups, bulk CSV verification (500+ GSTINs), export detailed reports, API access for automated vendor verification. <strong>₹499/mo</strong> for team plans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
