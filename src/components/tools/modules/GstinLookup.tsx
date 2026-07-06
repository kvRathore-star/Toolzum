"use client";

import React, { useState, useMemo } from 'react';
import { Search, CheckCircle, XCircle, Building2, MapPin, CreditCard, Upload, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

const STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh',
  '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan',
  '09': 'Uttar Pradesh', '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
  '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram', '16': 'Tripura',
  '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal', '20': 'Jharkhand',
  '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
  '25': 'Daman & Diu', '26': 'Dadra & Nagar Haveli', '27': 'Maharashtra', '28': 'Andhra Pradesh (Old)',
  '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu',
  '34': 'Puducherry', '35': 'Andaman & Nicobar', '36': 'Telangana', '37': 'Andhra Pradesh',
  '38': 'Ladakh', '97': 'Other Territory',
};

function validateGstin(gstin: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const cleaned = gstin.toUpperCase().trim();

  if (!cleaned) return { valid: false, errors: ['Enter a GSTIN'] };
  if (cleaned.length !== 15) return { valid: false, errors: ['GSTIN must be 15 characters'] };
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/.test(cleaned)) {
    return { valid: false, errors: ['Invalid GSTIN format. Expected: 2 state digits + 10 PAN + 1 entity + 1 check + Z + checksum'] };
  }
  if (!STATE_CODES[cleaned.substring(0, 2)]) errors.push('Unknown state code: ' + cleaned.substring(0, 2));

  const pan = cleaned.substring(2, 12);
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) errors.push('Invalid PAN embedded in GSTIN');

  const entityCode = cleaned[12];
  if (!/^[1-9]$/.test(entityCode)) errors.push('Invalid entity code (must be 1-9)');

  return { valid: errors.length === 0, errors };
}

function extractInfo(gstin: string) {
  const cleaned = gstin.toUpperCase().trim();
  const stateCode = cleaned.substring(0, 2);
  const pan = cleaned.substring(2, 12);
  const entityCode = cleaned[12];
  const checkDigit = cleaned[14];

  const entityTypes: Record<string, string> = {
    '1': 'Regular', '2': 'Composition', '3': 'TDS/TCS',
    '4': 'UN Body', '5': 'Non-Resident', '6': 'Other',
    '7': 'SEZ Developer', '8': 'SEZ Unit', '9': 'Government',
  };

  return {
    stateCode,
    stateName: STATE_CODES[stateCode] || 'Unknown',
    pan,
    entityType: entityTypes[entityCode] || 'Unknown',
    entityCode,
    checkDigit,
    isValidFormat: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/.test(cleaned),
  };
}

export default function GstinLookup() {
  const [input, setInput] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulk, setShowBulk] = useState(false);

  const validation = useMemo(() => validateGstin(input), [input]);
  const info = useMemo(() => input.trim() ? extractInfo(input) : null, [input]);

  const parsedBulk = useMemo(() => {
    if (!bulkInput.trim()) return [];
    return bulkInput.split('\n').map(l => l.trim()).filter(Boolean).map(gstin => ({
      gstin,
      valid: validateGstin(gstin).valid,
      info: extractInfo(gstin),
    }));
  }, [bulkInput]);

  const validCount = parsedBulk.filter(r => r.valid).length;
  const invalidCount = parsedBulk.filter(r => !r.valid).length;

  const handleExport = () => {
    if (!parsedBulk.length) return;
    const csv = ['GSTIN,Status,State,PAN,Entity Type']
      .concat(parsedBulk.map(r =>
        `${r.gstin},${r.valid ? 'Valid' : 'Invalid'},${r.info.stateName},${r.info.pan},${r.info.entityType}`
      )).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `gstin_bulk_lookup_${Date.now()}.csv`);
    toast.success(`Exported ${parsedBulk.length} records`);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Building2 className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">GSTIN Lookup & Validator</h3>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Validate GSTIN format, extract state, PAN, and entity type. No API key needed.</p>
          <button onClick={() => setShowBulk(!showBulk)}
            className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1">
            <Upload className="w-3 h-3" /> {showBulk ? 'Single' : 'Bulk'}
          </button>
        </div>

        {!showBulk ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value.toUpperCase())}
                placeholder="Enter 15-digit GSTIN (e.g. 27AABCU1234D1Z5)"
                maxLength={15}
                className="flex-1 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-mono tracking-wider outline-none focus:ring-2 focus:ring-blue-500/30 uppercase" />
            </div>

            {input && (
              <div className={`p-4 rounded-xl border ${validation.valid ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {validation.valid ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`font-bold text-sm ${validation.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {validation.valid ? 'Valid GSTIN Format' : 'Invalid GSTIN'}
                  </span>
                </div>

                {validation.errors.length > 0 && (
                  <ul className="space-y-0.5 mb-3">
                    {validation.errors.map((e, i) => (
                      <li key={i} className="text-xs text-red-500 flex items-start gap-1.5">
                        <span className="mt-0.5">•</span>{e}
                      </li>
                    ))}
                  </ul>
                )}

                {info && validation.valid && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-black/30 rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> State</p>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-white">{info.stateName}</p>
                      <p className="text-[10px] text-zinc-500">Code: {info.stateCode}</p>
                    </div>
                    <div className="bg-white dark:bg-black/30 rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5 flex items-center gap-1"><CreditCard className="w-3 h-3" /> PAN</p>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-white font-mono">{info.pan}</p>
                      <p className="text-[10px] text-zinc-500">Extracted from GSTIN</p>
                    </div>
                    <div className="bg-white dark:bg-black/30 rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5">Entity Type</p>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-white">{info.entityType}</p>
                      <p className="text-[10px] text-zinc-500">Code: {info.entityCode}</p>
                    </div>
                    <div className="bg-white dark:bg-black/30 rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5">Check Digit</p>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-white font-mono">{info.checkDigit}</p>
                      <p className="text-[10px] text-zinc-500">Last character</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-3">
              <p className="text-[10px] text-blue-600 dark:text-blue-400">
                <strong>Pro:</strong> Bulk lookup via CSV upload, export results, business name resolution, credit score tracking, and API webhook integration.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea value={bulkInput} onChange={e => setBulkInput(e.target.value.toUpperCase())}
              placeholder="Paste multiple GSTINs, one per line:&#10;27AABCU1234D1Z5&#10;29AABBZ3456E1Z6&#10;..."
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 font-mono resize-none h-32" />

            {parsedBulk.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">
                    {parsedBulk.length} GSTINs — <span className="text-emerald-500 font-semibold">{validCount} valid</span>, <span className="text-red-500 font-semibold">{invalidCount} invalid</span>
                  </span>
                  <button onClick={handleExport} className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-600">
                    <Download className="w-3 h-3" /> Export CSV
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {parsedBulk.map((r, i) => (
                    <div key={i} className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${r.valid ? 'bg-zinc-50 dark:bg-black/20 border-zinc-200 dark:border-zinc-800' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30'}`}>
                      {r.valid ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                      <span className="font-mono tracking-wider">{r.gstin}</span>
                      <span className="text-zinc-400">→</span>
                      <span className="text-zinc-600 dark:text-zinc-400">{r.info.stateName}</span>
                      <span className="text-zinc-300 dark:text-zinc-600">|</span>
                      <span className="text-zinc-600 dark:text-zinc-400">{r.info.entityType}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
                <strong>Pro:</strong> Validate 10,000+ GSTINs in one upload, business legal name resolution, GST return status check, and compliance reports. Used by enterprise procurement teams.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-[10px] text-zinc-500">
        GSTIN format validation is based on the government&apos;s published GSTIN structure. Does not verify with the GST portal in real time.
      </div>
    </div>
  );
}
