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

export function WiFiQRGenerator() {
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiEnc, setWifiEnc] = useState('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);
  const [wifiCode, setWifiCode] = useState('');

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">WiFi QR Code Generator</h1>
        <p className="text-sm text-zinc-500 mt-1">Generate WiFi configuration strings for QR codes.</p>
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">SSID</label>
            <input value={wifiSSID} onChange={e => setWifiSSID(e.target.value)} placeholder="Network name..." className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Password</label>
            <input value={wifiPass} onChange={e => setWifiPass(e.target.value)} placeholder="Password..." className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
            {['WPA', 'WEP', 'nopass'].map(e => (
              <button key={e} onClick={() => setWifiEnc(e)} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${wifiEnc === e ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500'}`}>{e === 'nopass' ? 'None' : e}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-zinc-500">
            <input type="checkbox" checked={wifiHidden} onChange={e => setWifiHidden(e.target.checked)} /> Hidden
          </label>
        </div>
        <button onClick={() => {
          const code = `WIFI:T:${wifiEnc};S:${wifiSSID};P:${wifiPass};${wifiHidden ? 'H:true;' : ''}`;
          setWifiCode(code);
          if (wifiSSID) toast.success('WiFi config generated!');
          else toast.error('Enter an SSID');
        }} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer">Generate Config</button>
        {wifiCode && (
          <div className="relative">
            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">WiFi Config String</label>
            <input type="text" readOnly value={wifiCode} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-emerald-600 dark:text-emerald-400 outline-none font-mono" />
            <button onClick={() => copy(wifiCode, 'WiFi config')} className="absolute top-5 right-2 text-[10px] text-indigo-400 hover:underline bg-white dark:bg-zinc-800 px-2 py-0.5 rounded">Copy</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function PhoneParser() {
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneResult, setPhoneResult] = useState<ReturnType<typeof detectCountry>>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">International Phone Parser</h1>
        <p className="text-sm text-zinc-500 mt-1">Parse and format international phone numbers.</p>
      </div>
      <input value={phoneInput} onChange={e => { setPhoneInput(e.target.value); setPhoneResult(detectCountry(e.target.value)); }} placeholder="Enter phone number (e.g. +14155552671 or +919876543210)..." className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-3 text-sm text-zinc-900 dark:text-white outline-none font-mono" />
      {phoneResult && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-2">
          <div className="text-xs flex justify-between"><span className="text-zinc-400">Country</span><span className="font-bold text-zinc-900 dark:text-white">{phoneResult.country}</span></div>
          <div className="text-xs flex justify-between"><span className="text-zinc-400">Country Code</span><span className="font-bold text-zinc-900 dark:text-white">{phoneResult.code}</span></div>
          <div className="text-xs flex justify-between"><span className="text-zinc-400">National Number</span><span className="font-bold text-zinc-900 dark:text-white">{phoneResult.national}</span></div>
          <div className="text-xs flex justify-between"><span className="text-zinc-400">E.164 Format</span><span className="font-bold text-blue-600 dark:text-blue-400">{phoneResult.e164}</span></div>
          <button onClick={() => copy(phoneResult.e164, 'E.164')} className="text-[10px] text-indigo-400 hover:underline">Copy</button>
        </div>
      )}
      {phoneInput && !phoneResult && <p className="text-xs text-zinc-400">No matching country found for this number.</p>}
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
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">OTP Code Generator</h1>
        <p className="text-sm text-zinc-500 mt-1">Generate one-time passcodes of various types and lengths.</p>
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Length</label>
            <select value={otpLen} onChange={e => setOtpLen(parseInt(e.target.value))} className="bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none">
              {[4,5,6,7,8].map(n => <option key={n} value={n}>{n} digits</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Type</label>
            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
              {(['numeric','alpha','hex'] as const).map(t => (
                <button key={t} onClick={() => setOtpType(t)} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${otpType === t ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Count: {otpCount}</label>
            <input type="range" min={1} max={20} value={otpCount} onChange={e => setOtpCount(parseInt(e.target.value))} className="w-24" />
          </div>
        </div>
        <button onClick={generateOTP} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer">Generate OTP Codes</button>
        {otpCodes.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {otpCodes.map((code, i) => (
              <div key={i} className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-center">
                <div className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider">{code.replace(/(.{3})/g, '$1 ').trim()}</div>
                <button onClick={() => copy(code, 'OTP')} className="text-[9px] text-indigo-400 hover:underline mt-1 block">Copy</button>
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
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">URL Slug Generator</h1>
        <p className="text-sm text-zinc-500 mt-1">Convert text into URL-friendly slugs.</p>
      </div>
      <input value={slugInput} onChange={e => setSlugInput(e.target.value)} placeholder="Enter text to slugify..." className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-3 text-sm text-zinc-900 dark:text-white outline-none" />
      <div className="flex items-center gap-4 flex-wrap text-xs text-zinc-500">
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={slugLowercase} onChange={e => setSlugLowercase(e.target.checked)} /> Lowercase</label>
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={slugTrim} onChange={e => setSlugTrim(e.target.checked)} /> Trim</label>
        <label className="flex items-center gap-1.5">
          Separator:
          <select value={slugSep} onChange={e => setSlugSep(e.target.value)} className="bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-white outline-none font-mono">-</select>
        </label>
      </div>
      {slugInput && (
        <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Slug</label>
          <input type="text" readOnly value={slugOutput} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-blue-600 dark:text-blue-400 outline-none font-mono" />
          <button onClick={() => copy(slugOutput, 'Slug')} className="absolute top-6 right-3 text-[10px] text-indigo-400 hover:underline bg-white dark:bg-zinc-800 px-2 py-0.5 rounded">Copy</button>
        </div>
      )}
    </div>
  );
}
