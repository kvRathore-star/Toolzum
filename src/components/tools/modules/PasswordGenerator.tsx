"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { downloadOrShare } from '@/utils/nativeShare';
import { ToolPresetBar, type PresetOption } from '@/components/tools/ToolPresetBar';

type CharSet = 'upper' | 'lower' | 'numbers' | 'symbols';

const PRESETS: PresetOption[] = [
  { label: 'Web Login', description: '16 chars, all types' },
  { label: 'Bank/Secure', description: '24 chars, full complexity' },
  { label: 'App Password', description: '12 chars, readable' },
  { label: 'PIN Code', description: '6 digits' },
];

const PRESET_CONFIG: Record<string, Partial<Options>> = {
  'Web Login': { length: 16, upper: true, lower: true, numbers: true, symbols: true, excludeAmbiguous: false },
  'Bank/Secure': { length: 24, upper: true, lower: true, numbers: true, symbols: true, excludeAmbiguous: false },
  'App Password': { length: 12, upper: false, lower: true, numbers: true, symbols: false, excludeAmbiguous: true },
  'PIN Code': { length: 6, upper: false, lower: false, numbers: true, symbols: false, excludeAmbiguous: true },
};

interface Options {
  length: number;
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

function calcEntropy(password: string, options: Options): number {
  let pool = 0;
  if (options.upper) pool += 26;
  if (options.lower) pool += 26;
  if (options.numbers) pool += 10;
  if (options.symbols) pool += 32;
  if (pool === 0) return 0;
  return Math.round(password.length * Math.log2(pool));
}

function getStrength(entropy: number): { label: string; color: string; bg: string } {
  if (entropy >= 120) return { label: 'Strong', color: 'text-emerald-400', bg: 'bg-emerald-500' };
  if (entropy >= 80) return { label: 'Good', color: 'text-blue-400', bg: 'bg-blue-500' };
  if (entropy >= 60) return { label: 'Fair', color: 'text-amber-400', bg: 'bg-amber-500' };
  return { label: 'Weak', color: 'text-red-400', bg: 'bg-red-500' };
}

function generatePassword(opts: Options): string {
  let charset = '';
  if (opts.upper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (opts.lower) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (opts.numbers) charset += '0123456789';
  if (opts.symbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

  if (opts.excludeAmbiguous) {
    charset = charset.replace(/[Il1O0]/g, '');
  }

  if (!charset) return '';

  const values = new Uint32Array(opts.length);
  window.crypto.getRandomValues(values);
  return Array.from(values).map(v => charset[v % charset.length]).join('');
}

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [opts, setOpts] = useState<Options>({ length: 16, upper: true, lower: true, numbers: true, symbols: true, excludeAmbiguous: false });
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const generate = useCallback(() => {
    const pwd = generatePassword(opts);
    setPassword(pwd);
  }, [opts]);

  useEffect(() => { generate(); }, [generate]);

  const toggle = (key: keyof Options) => {
    if (typeof opts[key] === 'boolean') {
      const newOpts = { ...opts, [key]: !opts[key] };
      setOpts(newOpts);
      setActivePreset(null);
    }
  };

  const handlePreset = useCallback((preset: PresetOption) => {
    const config = PRESET_CONFIG[preset.label];
    if (config) setOpts(prev => ({ ...prev, ...config }));
    setActivePreset(preset.label);
  }, []);

  const copy = async () => {
    if (!password) return;
    await clipboardWrite(password);
    toast.success('Password copied!');
  };

  const download = () => {
    if (!password) return;
    const blob = new Blob([password], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, 'generated-password.txt');
    setTimeout(() => URL.revokeObjectURL(url), 200);
  };

  const entropy = useMemo(() => calcEntropy(password, opts), [password, opts]);
  const strength = useMemo(() => getStrength(entropy), [entropy]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
      {/* Presets */}
      <ToolPresetBar presets={PRESETS} onSelect={handlePreset} activeLabel={activePreset} />

      {/* Password display */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 shadow-[var(--shadow-card)] space-y-4">
        <div className="relative">
          <input
            type="text"
            readOnly
            value={password}
            className="w-full bg-[var(--bg-base)] border-2 border-emerald-500/30 rounded-xl px-5 py-4 text-xl font-mono text-emerald-400 outline-none text-center tracking-wider"
          />
        </div>

        {/* Strength meter */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-[var(--border-subtle)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${strength.bg}`}
              style={{ width: `${Math.min((entropy / 150) * 100, 100)}%` }}
            />
          </div>
          <span className={`text-xs font-bold ${strength.color} shrink-0`}>
            {strength.label} ({entropy} bit)
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={copy} disabled={!password} className="flex-1 min-w-[100px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.97]">
            Copy
          </button>
          <button onClick={download} disabled={!password} className="flex-1 min-w-[100px] px-4 py-2.5 bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm font-semibold rounded-xl transition-all active:scale-[0.97]">
            Download
          </button>
          <button onClick={generate} className="flex-1 min-w-[100px] px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.97]">
            Regenerate
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 space-y-5">
        {/* Length slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-[var(--text-primary)]">Password Length</label>
            <span className="text-sm font-mono text-[var(--accent)]">{opts.length}</span>
          </div>
          <input
            type="range"
            min="4" max="64" step="1"
            value={opts.length}
            onChange={(e) => { setOpts(prev => ({ ...prev, length: parseInt(e.target.value) })); setActivePreset(null); }}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-muted)]"><span>4</span><span>64</span></div>
        </div>

        {/* Character types */}
        <div className="grid grid-cols-2 gap-2">
          {([
            { key: 'upper' as keyof Options, label: 'Uppercase (A-Z)' },
            { key: 'lower' as keyof Options, label: 'Lowercase (a-z)' },
            { key: 'numbers' as keyof Options, label: 'Numbers (0-9)' },
            { key: 'symbols' as keyof Options, label: 'Symbols (!@#$)' },
          ]).map(opt => (
            <label key={opt.key} className="flex items-center gap-3 bg-[var(--bg-overlay)] p-3 rounded-xl cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors border border-transparent hover:border-[var(--border-subtle)]">
              <input
                type="checkbox"
                checked={opts[opt.key] as boolean}
                onChange={() => toggle(opt.key)}
                className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-[var(--text-primary)]">{opt.label}</span>
            </label>
          ))}
        </div>

        {/* Exclude ambiguous */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={opts.excludeAmbiguous}
            onChange={() => toggle('excludeAmbiguous')}
            className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
          />
          <span className="text-sm text-[var(--text-muted)]">Exclude ambiguous characters (I, l, 1, O, 0)</span>
        </label>
      </div>

      {/* Stats */}
      <div className="flex gap-4 flex-wrap text-[11px] text-[var(--text-muted)] font-medium">
        <span>Length: {password.length}</span>
        <span>Entropy: {entropy} bits</span>
        <span>Characters used: {new Set(password).size} unique</span>
      </div>
    </div>
  );
}
