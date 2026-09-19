"use client";
import React, { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

function slugify(text: string, options: { lowercase: boolean; trim: boolean; separator: string; removeSpecials: boolean }): string {
  let s = text;
  if (options.lowercase) s = s.toLowerCase();
  if (options.removeSpecials) s = s.replace(/[^a-zA-Z0-9\s-]/g, '');
  s = s.replace(/\s+/g, options.separator);
  s = s.replace(/-+/g, options.separator);
  if (options.trim) s = s.replace(new RegExp(`^${options.separator}|${options.separator}$`, 'g'), '');
  return s;
}

const PHONE_RULES = [
  { code: '1', name: 'US/Canada', len: 10 },
  { code: '44', name: 'United Kingdom', len: 10 },
  { code: '91', name: 'India', len: 10 },
  { code: '86', name: 'China', len: 11 },
  { code: '49', name: 'Germany', len: 10 },
  { code: '33', name: 'France', len: 9 },
  { code: '81', name: 'Japan', len: 10 },
  { code: '7', name: 'Russia', len: 10 },
  { code: '55', name: 'Brazil', len: 10 },
  { code: '61', name: 'Australia', len: 9 },
  { code: '82', name: 'South Korea', len: 9 },
  { code: '34', name: 'Spain', len: 9 },
  { code: '39', name: 'Italy', len: 10 },
  { code: '31', name: 'Netherlands', len: 9 },
  { code: '46', name: 'Sweden', len: 9 },
  { code: '41', name: 'Switzerland', len: 9 },
  { code: '971', name: 'UAE', len: 9 },
  { code: '966', name: 'Saudi Arabia', len: 9 },
];

function detectCountry(phone: string): { country: string; code: string; national: string; e164: string } | null {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  for (const r of PHONE_RULES) {
    if (digits.startsWith(r.code)) {
      const national = digits.slice(r.code.length);
      return {
        country: r.name,
        code: '+' + r.code,
        national,
        e164: '+' + r.code + ' ' + national.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3'),
      };
    }
  }
  return null;
}

const copy = (txt: string, label: string) => { clipboardWrite(txt); toast.success(`${label} copied!`); };

export function PhoneParser() {
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneResult, setPhoneResult] = useState<ReturnType<typeof detectCountry>>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">International Phone Parser</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Parse and format international phone numbers.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          { label: '+14155552671 (US)', apply: () => { setPhoneInput('+14155552671'); setPhoneResult(detectCountry('+14155552671')); } },
          { label: '+919876543210 (India)', apply: () => { setPhoneInput('+919876543210'); setPhoneResult(detectCountry('+919876543210')); } },
          { label: '+447911123456 (UK)', apply: () => { setPhoneInput('+447911123456'); setPhoneResult(detectCountry('+447911123456')); } },
        ].map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <input value={phoneInput} onChange={e => { setPhoneInput(e.target.value); setPhoneResult(detectCountry(e.target.value)); }} aria-label="Phone number" placeholder="Enter phone number (e.g. +14155552671 or +919876543210)..." className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl px-5 py-3 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 font-mono" />
      {phoneResult && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-2">
          <div className="text-xs flex justify-between"><span className="text-[var(--text-muted)]">Country</span><span className="font-bold text-[var(--text-primary)]">{phoneResult.country}</span></div>
          <div className="text-xs flex justify-between"><span className="text-[var(--text-muted)]">Country Code</span><span className="font-bold text-[var(--text-primary)]">{phoneResult.code}</span></div>
          <div className="text-xs flex justify-between"><span className="text-[var(--text-muted)]">National Number</span><span className="font-bold text-[var(--text-primary)]">{phoneResult.national}</span></div>
          <div className="text-xs flex justify-between"><span className="text-[var(--text-muted)]">E.164 Format</span><span className="font-bold text-[var(--accent)]">{phoneResult.e164}</span></div>
          <div className="flex gap-3 items-center">
            <button onClick={() => copy(phoneResult.e164, 'E.164')} className="text-[10px] text-[var(--accent)] hover:underline">Copy</button>
            <button onClick={() => { const output = `Country: ${phoneResult.country}\nCountry Code: ${phoneResult.code}\nNational Number: ${phoneResult.national}\nE.164 Format: ${phoneResult.e164}`; const blob = new Blob([output], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='phone-parsed.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-[10px] text-[var(--accent)] hover:underline font-medium">Download</button>
          </div>
        </div>
      )}
      {phoneInput && !phoneResult && <p className="text-xs text-[var(--text-muted)]">No matching country found for this number.</p>}
    </div>
  );
}

export function OTPGenerator() {
  const [otpLen, setOtpLen] = useState(6);
  const [otpType, setOtpType] = useState<'numeric' | 'alpha' | 'hex'>('numeric');
  const [otpCount, setOtpCount] = useState(5);
  const [otpCodes, setOtpCodes] = useState<string[]>([]);

  const generateOTP = useCallback(() => {
    const codes: string[] = [];
    const chars = otpType === 'numeric' ? '0123456789' : otpType === 'hex' ? '0123456789ABCDEF' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < otpCount; i++) {
      let code = '';
      for (let j = 0; j < otpLen; j++) code += chars[Math.floor(Math.random() * chars.length)];
      codes.push(code);
    }
    setOtpCodes(codes);
    toast.success(`Generated ${otpCount} codes!`);
  }, [otpLen, otpType, otpCount]);

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">OTP Code Generator</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Generate one-time passcodes of various types and lengths.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          { label: '6-digit Numeric', apply: () => { setOtpLen(6); setOtpType('numeric'); setOtpCount(5); } },
          { label: '8-digit Hex', apply: () => { setOtpLen(8); setOtpType('hex'); setOtpCount(5); } },
          { label: '4-digit Numeric', apply: () => { setOtpLen(4); setOtpType('numeric'); setOtpCount(5); } },
        ].map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label htmlFor="lbl-otherutilitieswidgets-length" className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Length</label>
            <select id="lbl-otherutilitieswidgets-length" aria-label="Length" value={otpLen} onChange={e => setOtpLen(parseInt(e.target.value))} className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2">
              {[4,5,6,7,8].map(n => <option key={n} value={n}>{n} digits</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Type</label>
            <div className="flex bg-[var(--bg-surface)] rounded-xl p-1">
              {(['numeric','alpha','hex'] as const).map(t => (
                <button key={t} onClick={() => setOtpType(t)} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${otpType === t ? 'bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="lbl-otherutilitieswidgets-count-otpcount" className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Count: {otpCount}</label>
            <input id="lbl-otherutilitieswidgets-count-otpcount" type="range" min={1} max={20} value={otpCount} onChange={e => setOtpCount(parseInt(e.target.value))} aria-label="OTP count" className="w-24" />
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={generateOTP} className="bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer">Generate OTP Codes</button>
          {otpCodes.length > 0 && (
            <button onClick={() => { const output = otpCodes.join('\n'); const blob = new Blob([output], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='otp-codes.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-[var(--accent)] hover:underline font-medium">Download All</button>
          )}
        </div>
        {otpCodes.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {otpCodes.map((code, i) => (
              <div key={i} className="bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-3 py-3 text-center">
                <div className="text-sm font-mono font-bold text-[var(--accent)] tracking-wider">{code.replace(/(.{3})/g, '$1 ').trim()}</div>
                <button onClick={() => copy(code, 'OTP')} className="text-[9px] text-[var(--accent)] hover:underline mt-1 block">Copy</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SlugifyTool() {
  const [slugInput, setSlugInput] = useState('');
  const [slugLowercase, setSlugLowercase] = useState(true);
  const [slugTrim, setSlugTrim] = useState(true);
  const [slugSep, setSlugSep] = useState('-');
  const slugOutput = useMemo(() => slugify(slugInput, { lowercase: slugLowercase, trim: slugTrim, separator: slugSep, removeSpecials: true }), [slugInput, slugLowercase, slugTrim, slugSep]);

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">URL Slug Generator</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Convert text into URL-friendly slugs.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Hello World Example', apply: () => setSlugInput('Hello World Example') },
          { label: 'My Blog Post Title', apply: () => setSlugInput('My Blog Post Title') },
          { label: 'Special Ch@rs! Here', apply: () => setSlugInput('Special Ch@rs! Here') },
        ].map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <input aria-label="Enter text to slugify..." value={slugInput} onChange={e => setSlugInput(e.target.value)} placeholder="Enter text to slugify..." className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl px-5 py-3 text-sm text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
      <div className="flex items-center gap-4 flex-wrap text-xs text-[var(--text-secondary)]">
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={slugLowercase} onChange={e => setSlugLowercase(e.target.checked)} /> Lowercase</label>
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={slugTrim} onChange={e => setSlugTrim(e.target.checked)} /> Trim</label>
        <label className="flex items-center gap-1.5">
          Separator:
          <select value={slugSep} onChange={e => setSlugSep(e.target.value)} className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 font-mono">-</select>
        </label>
      </div>
      {slugInput && (
        <div className="relative bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5">
          <label htmlFor="lbl-otherutilitieswidgets-slug" className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Slug</label>
          <input id="lbl-otherutilitieswidgets-slug" aria-label="Slug" type="text" readOnly value={slugOutput} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 font-mono" />
          <div className="absolute top-6 right-3 flex gap-2">
            <button onClick={() => copy(slugOutput, 'Slug')} className="text-[10px] text-[var(--accent)] hover:underline bg-white dark:bg-[var(--bg-surface)] px-2 py-0.5 rounded">Copy</button>
            <button onClick={() => { const blob = new Blob([slugOutput], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='slug.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-[10px] text-[var(--accent)] hover:underline font-medium bg-white dark:bg-[var(--bg-surface)] px-2 py-0.5 rounded">Download</button>
          </div>
        </div>
      )}
    </div>
  );
}
