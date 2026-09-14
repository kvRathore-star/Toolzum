"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { Home, Road, MapPin, Flag, Hash, CheckCircle2, XCircle, Copy, ClipboardList, Sparkles, Navigation } from 'lucide-react';

const ACCENT = '#d97706';

interface ParsedAddress {
  line1: string;
  line2: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

const INDIAN_REGIONS = [
  { name: 'Andhra Pradesh', aliases: ['andhra pradesh', 'andhra', 'ap'], pin: ['5'] },
  { name: 'Arunachal Pradesh', aliases: ['arunachal pradesh', 'arunachal', 'ar'], pin: ['7'] },
  { name: 'Assam', aliases: ['assam', 'as'], pin: ['7'] },
  { name: 'Bihar', aliases: ['bihar', 'br'], pin: ['7', '8'] },
  { name: 'Chhattisgarh', aliases: ['chhattisgarh', 'chhatisgarh', 'cg', 'ct'], pin: ['4'] },
  { name: 'Goa', aliases: ['goa', 'ga'], pin: ['4'] },
  { name: 'Gujarat', aliases: ['gujarat', 'gj'], pin: ['3'] },
  { name: 'Haryana', aliases: ['haryana', 'hr'], pin: ['1'] },
  { name: 'Himachal Pradesh', aliases: ['himachal pradesh', 'himachal', 'hp'], pin: ['1'] },
  { name: 'Jharkhand', aliases: ['jharkhand', 'jh'], pin: ['7', '8'] },
  { name: 'Karnataka', aliases: ['karnataka', 'karnatak', 'ka'], pin: ['5'] },
  { name: 'Kerala', aliases: ['kerala', 'keral', 'kl'], pin: ['6'] },
  { name: 'Madhya Pradesh', aliases: ['madhya pradesh', 'mp'], pin: ['4'] },
  { name: 'Maharashtra', aliases: ['maharashtra', 'maha', 'mh'], pin: ['4'] },
  { name: 'Manipur', aliases: ['manipur', 'mn'], pin: ['7'] },
  { name: 'Meghalaya', aliases: ['meghalaya', 'ml'], pin: ['7'] },
  { name: 'Mizoram', aliases: ['mizoram', 'mz'], pin: ['7'] },
  { name: 'Nagaland', aliases: ['nagaland', 'nl'], pin: ['7'] },
  { name: 'Odisha', aliases: ['odisha', 'orissa', 'od'], pin: ['7'] },
  { name: 'Punjab', aliases: ['punjab', 'pb'], pin: ['1'] },
  { name: 'Rajasthan', aliases: ['rajasthan', 'rj'], pin: ['3'] },
  { name: 'Sikkim', aliases: ['sikkim', 'sk'], pin: ['7'] },
  { name: 'Tamil Nadu', aliases: ['tamil nadu', 'tamilnadu', 'tn'], pin: ['6'] },
  { name: 'Telangana', aliases: ['telangana', 'tg', 'ts'], pin: ['5'] },
  { name: 'Tripura', aliases: ['tripura', 'tr'], pin: ['7'] },
  { name: 'Uttar Pradesh', aliases: ['uttar pradesh', 'up'], pin: ['2'] },
  { name: 'Uttarakhand', aliases: ['uttarakhand', 'uk', 'ut', 'uttaranchal'], pin: ['2'] },
  { name: 'West Bengal', aliases: ['west bengal', 'westbengal', 'wb', 'bengal'], pin: ['7'] },
  { name: 'Andaman and Nicobar Islands', aliases: ['andaman and nicobar', 'andaman & nicobar', 'andaman', 'a&n', 'an'], pin: ['6'] },
  { name: 'Chandigarh', aliases: ['chandigarh', 'ch'], pin: ['1'] },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', aliases: ['dadra and nagar haveli', 'daman and diu', 'daman', 'dadra', 'dn', 'dd'], pin: ['3'] },
  { name: 'Jammu and Kashmir', aliases: ['jammu and kashmir', 'jammu & kashmir', 'jammu', 'kashmir', 'j&k', 'jk'], pin: ['1'] },
  { name: 'Ladakh', aliases: ['ladakh', 'la'], pin: ['1'] },
  { name: 'Lakshadweep', aliases: ['lakshadweep', 'ld'], pin: ['6'] },
  { name: 'Delhi', aliases: ['delhi', 'new delhi', 'nct', 'dl'], pin: ['1'] },
  { name: 'Puducherry', aliases: ['puducherry', 'pondicherry', 'py'], pin: ['6'] },
];

const PRESETS = [
  {
    label: '🏙️ Urban (Mumbai)',
    address: `A-204, Sunshine Apartments,
Bandra West,
Mumbai,
Maharashtra 400050`
  },
  {
    label: '🌾 Rural (UP)',
    address: `Village & Post Kheriya,
Tehsil Sadar,
Lucknow,
Uttar Pradesh 226001`
  },
  {
    label: '🏛️ Metro (Delhi)',
    address: `Plot No. 7, Lajpat Nagar IV,
Ring Road,
New Delhi 110024`
  },
];

function findRegion(text: string): string | null {
  const lower = text.toLowerCase();
  for (const region of INDIAN_REGIONS) {
    for (const alias of region.aliases) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(lower)) return region.name;
    }
  }
  return null;
}

function findDistrict(text: string): string | null {
  const distPatterns = [
    /(?:district|distt?\.?)\s*:?\s*([A-Za-z\s]+?)(?:\n|,|$)/i,
    /([A-Za-z\s]+?)\s+(?:district|distt?\.?)\s*(?:\n|,|$)/i,
  ];
  for (const p of distPatterns) {
    const m = text.match(p);
    if (m) return m[1]!.trim().replace(/^[,\s]+|[,\s]+$/g, '');
  }
  return null;
}

function parseAddress(text: string): ParsedAddress | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const pinMatch = trimmed.match(/\b(\d{6})\b/);
  const pincode = pinMatch ? pinMatch[1] ?? '' : '';

  const region = findRegion(trimmed);
  const state = region || '';

  let remaining = trimmed;
  if (pincode) remaining = remaining.replace(new RegExp(pincode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
  if (state) {
    for (const r of INDIAN_REGIONS) {
      if (r.name === state) {
        for (const alias of r.aliases) {
          const esc = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const re = new RegExp(`\\b${esc}\\b`, 'gi');
          remaining = remaining.replace(re, '');
        }
        break;
      }
    }
  }

  remaining = remaining.replace(/[,\s]+/g, '\n').split('\n').map(l => l.trim()).filter(Boolean).join('\n');

  const district = findDistrict(remaining) || '';
  if (district) {
    const escaped = district.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?:district|distt?\\.?)\\s*:?\\s*${escaped}|${escaped}\\s+(?:district|distt?\\.?)`, 'gi');
    remaining = remaining.replace(re, '');
    remaining = remaining.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), '');
  }

  remaining = remaining.split('\n').map(l => l.trim()).filter(Boolean).join('\n');

  const lines = remaining.split('\n').filter(Boolean);
  let city = '';
  let line2 = '';
  let line1 = '';

  if (lines.length > 0) {
    city = lines[lines.length - 1]!;
  }
  if (lines.length > 1) {
    line2 = lines[lines.length - 2]!;
  }
  if (lines.length > 2) {
    line1 = lines.slice(0, -2).join(', ');
  } else if (lines.length === 2) {
    line1 = '';
  }

  return { line1, line2, city, district, state, pincode };
}

const FIELD_CONFIG = [
  { key: 'line1', label: 'Line 1 (Flat / Building / Area)', icon: Home, color: '#d97706' },
  { key: 'line2', label: 'Line 2 (Street / Locality)', icon: Road, color: '#ea580c' },
  { key: 'city', label: 'City / Town / Village', icon: MapPin, color: '#2563eb' },
  { key: 'district', label: 'District', icon: Navigation, color: '#7c3aed' },
] as const;

const RESULT_FIELDS = ['line1', 'line2', 'city', 'district'] as const;

export default function IndianAddressParser() {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<ParsedAddress | null>(null);
  const [showCopyHint, setShowCopyHint] = useState(false);

  const handleParse = useCallback(() => {
    if (!input.trim()) {
      toast.error('Please enter an address to parse');
      return;
    }
    const result = parseAddress(input);
    if (!result) {
      toast.error('Could not parse address. Try a different format.');
      return;
    }
    setParsed(result);
    setShowCopyHint(true);
    setTimeout(() => setShowCopyHint(false), 3000);
    toast.success('Address parsed successfully!');
  }, [input]);

  const handlePreset = useCallback((address: string) => {
    setInput(address);
    setParsed(null);
  }, []);

  const pincodeValid = useMemo(() => {
    if (!parsed?.pincode) return null;
    const pin = parsed.pincode;
    if (!/^\d{6}$/.test(pin)) return false;
    if (!parsed.state) return true;
    const firstDigit = pin[0] ?? "";
    const region = INDIAN_REGIONS.find(r => r.name === parsed.state);
    if (!region) return null;
    return region.pin.includes(firstDigit);
  }, [parsed]);

  const handleCopyField = useCallback((value: string, label: string) => {
    clipboardWrite(value);
    toast.success(`${label} copied!`);
  }, []);

  const handleCopyAll = useCallback(() => {
    if (!parsed) return;
    const json = JSON.stringify(parsed, null, 2);
    clipboardWrite(json);
    toast.success('All fields copied as JSON!');
  }, [parsed]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-overlay)] p-6 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${ACCENT}15` }}>
            <MapPin className="w-5 h-5" style={{ color: ACCENT }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Indian Address Parser</h2>
            <p className="text-sm text-[var(--text-secondary)]">Parse free-text Indian addresses into structured fields</p>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => handlePreset(p.address)}
            className="px-3 py-1.5 text-[10px] font-semibold rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-700 dark:hover:text-amber-400 transition-all bg-[var(--bg-overlay)]/50 cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xl space-y-4">
            <label htmlFor="lbl-indianaddressparser-enter-indian-address" className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <MapPin className="w-4 h-4" style={{ color: ACCENT }} />
              Enter Indian Address
            </label>
            <textarea id="lbl-indianaddressparser-enter-indian-address" aria-label="Enter Indian Address"
              value={input}
              onChange={e => { setInput(e.target.value); setParsed(null); }}
              placeholder={`Sample Indian address:
A-204, Sunshine Apartments,
Bandra West,
Mumbai,
Maharashtra 400050`}
              rows={7}
              className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 transition-all duration-200 resize-y font-mono focus:border-amber-500"
              style={{ '--tw-ring-color': ACCENT } as React.CSSProperties}
            />
            <button
              onClick={handleParse}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25"
            >
              <Sparkles className="w-4 h-4" />
              Parse Address
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <AnimatePresence mode="wait">
            {parsed ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                    Parsed Address
                  </h3>
                  <div className="flex items-center gap-1">
                    {showCopyHint && (
                      <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[9px] text-[var(--text-muted)] mr-1"
                      >
                        Click to copy
                      </motion.span>
                    )}
                    <button
                      onClick={handleCopyAll}
                      className="text-[10px] text-[var(--text-muted)] hover:text-amber-500 transition-colors bg-[var(--bg-overlay)] px-2 py-1 rounded-lg border border-[var(--border-subtle)] flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      All as JSON
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {RESULT_FIELDS.map((key) => {
                    const field = FIELD_CONFIG.find(f => f.key === key)!;
                    const value = parsed[key as keyof ParsedAddress] || '';
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] hover:border-amber-500/30 transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${field.color}12` }}>
                          <field.icon className="w-4 h-4" style={{ color: field.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">{field.label}</span>
                          <span className="text-sm font-medium text-[var(--text-primary)] break-words">{value || <span className="italic text-[var(--text-muted)]">Not found</span>}</span>
                        </div>
                        <button
                          aria-label={`Copy ${field.label}`}
                          onClick={() => handleCopyField(value, field.label)}
                          className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-amber-500 transition-all p-1 rounded hover:bg-amber-500/10"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    );
                  })}

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="group flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] hover:border-amber-500/30 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${ACCENT}12` }}>
                      <Flag className="w-4 h-4" style={{ color: ACCENT }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">State / UT</span>
                      {parsed.state ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: `${ACCENT}15`, color: ACCENT }}>
                          <MapPin className="w-3 h-3" />
                          {parsed.state}
                        </span>
                      ) : (
                        <span className="text-sm italic text-[var(--text-muted)]">Not found</span>
                      )}
                    </div>
                    {parsed.state && (
                      <button
                        aria-label="Copy state"
                        onClick={() => handleCopyField(parsed.state, 'State')}
                        className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-amber-500 transition-all p-1 rounded hover:bg-amber-500/10"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="group flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] hover:border-amber-500/30 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#05966912' }}>
                      <Hash className="w-4 h-4" style={{ color: '#059669' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Pincode</span>
                      {parsed.pincode ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold font-mono tracking-widest text-[var(--text-primary)]">{parsed.pincode}</span>
                          {pincodeValid === true && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-700/10 px-1.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          )}
                          {pincodeValid === false && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" /> Mismatch
                            </span>
                          )}
                          {pincodeValid === null && parsed.state && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                              Unknown region
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm italic text-[var(--text-muted)]">Not found</span>
                      )}
                    </div>
                    {parsed.pincode && (
                      <button
                        aria-label="Copy pincode"
                        onClick={() => handleCopyField(parsed.pincode, 'Pincode')}
                        className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-amber-500 transition-all p-1 rounded hover:bg-amber-500/10"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xl flex flex-col items-center justify-center text-center min-h-[320px]"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${ACCENT}10` }}>
                  <MapPin className="w-7 h-7" style={{ color: ACCENT }} />
                </div>
                <p className="text-sm font-bold text-[var(--text-secondary)]">Waiting for address input</p>
                <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">
                  Enter an Indian address on the left and click <strong>Parse Address</strong> to see structured fields here.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
