"use client";

import React, { useState } from 'react';
import { Search, MapPin, Calendar, Shield, FileSpreadsheet, Download, Upload, Copy, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from "@/lib/clipboard";
import { useRovingTabs } from "@/components/useRovingTabs";

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

const CHECK_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Real GSTIN check-digit validation (Luhn mod-36 over the first 14 chars:
 *  odd positions ×1, even positions ×2, base-36 digit sums). Verified against
 *  the documented vector 27AAPFU0939F1Z → check char V. */
function verifyCheckDigit(gstin: string): boolean {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const codePoint = CHECK_CHARS.indexOf(gstin[i]!);
    if (codePoint < 0) return false;
    const digit = codePoint * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(digit / 36) + (digit % 36);
  }
  return CHECK_CHARS[(36 - (sum % 36)) % 36] === gstin[14];
}

interface DecodedGstin {
  gstin: string;
  stateCode: string;
  state: string;
  pan: string;
  entityCode: string;
  checkChar: string;
  checksumValid: boolean;
}

/**
 * Decodes only what the GSTIN itself contains (state, PAN, entity, check
 * digit). Live business details (legal name, address, filing status) exist
 * only on the GST portal — this tool never invents them. Every field shown
 * below is derived locally from the number you typed.
 */
function decodeGstin(gstin: string): DecodedGstin {
  const stateCode = gstin.slice(0, 2);
  return {
    gstin,
    stateCode,
    state: STATE_CODES[stateCode] || 'Unknown State',
    pan: gstin.slice(2, 12),
    entityCode: gstin.slice(12, 14),
    checkChar: gstin.slice(14, 15),
    checksumValid: verifyCheckDigit(gstin),
  };
}

export default function GstinLookup() {
  const [gstin, setGstin] = useState('');
  const [result, setResult] = useState<DecodedGstin | null>(null);
  const [loading, setLoading] = useState(false);
  const [bulkData, setBulkData] = useState<string[]>([]);
  const [bulkResults, setBulkResults] = useState<DecodedGstin[]>([]);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const lookupTabs = useRovingTabs(
    ['single', 'bulk'] as const,
    activeTab,
    setActiveTab,
    "data-lookup-tab",
  );

  const handleLookup = () => {
    const clean = gstin.trim().toUpperCase();
    if (!clean) return toast.error('Enter a GSTIN');
    if (!GSTIN_REGEX.test(clean)) return toast.error('Invalid GSTIN format. Must be 15 characters (2 state + 10 PAN + 3 entity + 1 check)');

    setLoading(true);
    setResult(null);
    // Local decode is instant; the beat keeps the loading state honest.
    setTimeout(() => {
      const data = decodeGstin(clean);
      setResult(data);
      setLoading(false);
      if (!data.checksumValid) {
        toast.error('Format looks right but the check digit fails — this GSTIN is likely mistyped.');
      } else {
        toast.success('GSTIN decoded — format valid, check digit verified');
      }
    }, 300);
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
    const results = bulkData.map(g => decodeGstin(g));
    setBulkResults(results);
    const bad = results.filter(r => !r.checksumValid).length;
    toast.success(`Decoded ${results.length} GSTINs${bad > 0 ? ` — ${bad} fail the check digit` : ' — all check digits valid'}`);
  };

  const handleExport = () => {
    const data = result ? [result] : bulkResults;
    if (data.length === 0) return toast.error('No data to export');
    const header = 'GSTIN,State Code,State,PAN,Entity Code,Check Digit,Checksum Valid';
    const rows = data.map(r => `"${r.gstin}","${r.stateCode}","${r.state}","${r.pan}","${r.entityCode}","${r.checkChar}","${r.checksumValid ? 'Yes' : 'No'}"`);
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
        <h3 className="text-lg font-bold text-[var(--text-primary)]">GSTIN Validator & Decoder</h3>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
        <div className="flex border-b border-[var(--border-subtle)]" role="tablist" aria-label="Lookup mode" onKeyDown={lookupTabs.onKeyDown}>
          {(['single', 'bulk'] as const).map(tab => (
            <button key={tab} role="tab" {...lookupTabs.tabProps(tab)} aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab ? 'text-[var(--accent)] border-b-2 border-[var(--accent)] bg-[var(--accent)]/10' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}>
              {tab === 'single' ? 'Single Lookup' : 'Bulk CSV'}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {activeTab === 'single' ? (
            <>
              <p className="text-xs text-[var(--text-secondary)]">Enter a 15-character GSTIN to validate its format, verify the check digit, and decode the embedded state + PAN. Unlimited, offline, private.</p>
              <div className="flex gap-2">
                <input aria-label="GSTIN to validate and decode" value={gstin} onChange={e => setGstin(e.target.value.toUpperCase())} placeholder="27AABCU1234D1Z5"
                  maxLength={15}
                  className="flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--text-primary)] uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/30" />
                <button onClick={handleLookup} disabled={loading || !gstin}
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-700 disabled:bg-[var(--bg-overlay)] dark:disabled:bg-[var(--bg-elevated)] text-white font-bold rounded-xl text-sm flex items-center gap-1.5 transition-colors">
                  {loading ? 'Checking...' : <><Search className="w-4 h-4" /> Validate</>}
                </button>
              </div>

              {result && (
                <div role="status" className="bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-mono font-bold text-[var(--text-primary)]">{result.gstin}</h4>
                        <p className="text-[11px] text-[var(--text-secondary)]">PAN {result.pan} · {result.state}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${result.checksumValid ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>{result.checksumValid ? 'Valid' : 'Bad check digit'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-[var(--text-muted)]" /> <span className="text-[var(--text-secondary)] dark:text-[var(--text-muted)]">State {result.stateCode} — {result.state}</span></div>
                      <div className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-[var(--text-muted)]" /> <span className="text-[var(--text-secondary)] dark:text-[var(--text-muted)]">Entity {result.entityCode} · Check {result.checkChar}</span></div>
                      <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-[var(--text-muted)]" /> <span className="text-[var(--text-secondary)] dark:text-[var(--text-muted)]">For live registration details, search this GSTIN on gst.gov.in</span></div>
                      <div className="flex items-center gap-1.5"><FileSpreadsheet className="w-3 h-3 text-[var(--text-muted)]" /> <span className="text-[var(--text-secondary)] dark:text-[var(--text-muted)]">Names, addresses & filing status live only on the GST portal — never guessed</span></div>
                    </div>
                  </div>
                  <div className="border-t border-[var(--border-subtle)] p-3 flex gap-2">
                    <button onClick={handleExport} className="flex items-center gap-1 px-3 py-1.5 bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] rounded-lg text-[10px] font-semibold hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] transition-colors">
                      <Download className="w-3 h-3" /> Export CSV
                    </button>
                    <button onClick={() => { clipboardWrite(JSON.stringify(result, null, 2)); toast.success('Copied!'); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] rounded-lg text-[10px] font-semibold hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] transition-colors">
                      <Copy className="w-3 h-3" /> Copy JSON
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-xs text-[var(--text-secondary)]">Upload a CSV or text file with one GSTIN per line — bulk format-validate and decode up to 500 at once, free.</p>
              <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-6 text-center hover:border-emerald-500/50 transition-colors cursor-pointer bg-[var(--bg-overlay)]/50 dark:bg-black/20"
                role="button" tabIndex={0} onClick={() => document.getElementById('bulk-gstin-file')?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('bulk-gstin-file')?.click(); } }}>
                <Upload className="w-8 h-8 mx-auto mb-2 text-[var(--text-muted)]" />
                <p className="text-sm font-medium text-[var(--text-secondary)] dark:text-[var(--text-muted)]">{bulkData.length > 0 ? `${bulkData.length} GSTINs loaded` : 'Upload CSV/TXT file'}</p>
                <p className="text-[10px] text-[var(--text-secondary)] mt-1">One GSTIN per line</p>
                <input aria-label="One GSTIN per line" id="bulk-gstin-file" type="file" accept=".csv,.txt" onChange={handleBulkFile} className="sr-only" />
              </div>
              {bulkData.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)]">{bulkData.length} GSTINs loaded</span>
                    <button onClick={handleBulkLookup} className="px-4 py-2 bg-emerald-700 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors">
                      Validate All
                    </button>
                  </div>
                  {bulkResults.length > 0 && (
                    <>
                      <div className="max-h-60 overflow-y-auto border border-[var(--border-subtle)] rounded-xl divide-y divide-zinc-100 dark:divide-zinc-800">
                        {bulkResults.map((r, i) => (
                              <div key={i} className="p-3 bg-[var(--bg-overlay)]">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-xs font-mono font-semibold text-[var(--text-primary)]">{r.gstin}</p>
                                    <p className="text-[10px] text-[var(--text-secondary)]">{r.state} · PAN {r.pan}</p>
                                  </div>
                                  <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${r.checksumValid ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>{r.checksumValid ? 'Valid' : 'Bad digit'}</span>
                                </div>
                              </div>
                        ))}
                      </div>
                      <button onClick={handleExport} className="w-full py-2.5 bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                        <Download className="w-3.5 h-3.5" /> Export All to CSV
                      </button>
                    </>
                  )}
                </div>
              )}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3">
                <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Offline decode only — business names and filing status are not public data and are never shown here.
                </p>
              </div>
            </>
          )}

          <div className="bg-[var(--accent)]/10/20 border border-[var(--accent)]/20 rounded-xl p-3">
            <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]">
              <strong>How it works:</strong> the first 2 digits encode the state, the next 10 are the holder&apos;s PAN, then entity code + check digit (verified with the official mod-36 algorithm) — all decoded on your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
