"use client";
import React, { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { GitCompare, QrCode, Image, Phone, Key, Link } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'json-diff' | 'wifi-qr' | 'svg' | 'phone' | 'otp' | 'slugify';

function slugify(text: string, options: { lowercase: boolean; trim: boolean; separator: string; removeSpecials: boolean }): string {
  let s = text;
  if (options.lowercase) s = s.toLowerCase();
  if (options.removeSpecials) s = s.replace(/[^a-zA-Z0-9\s-]/g, '');
  s = s.replace(/\s+/g, options.separator);
  s = s.replace(/-+/g, options.separator);
  if (options.trim) s = s.replace(new RegExp(`^${options.separator}|${options.separator}$`, 'g'), '');
  return s;
}

function formatJSON(s: string): string {
  try { return JSON.stringify(JSON.parse(s), null, 2); } catch { return s; }
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

export default function OtherUtilities() {
  const [tab, setTab] = useState<Tab>('json-diff');

  // JSON Diff
  const [diffA, setDiffA] = useState('{\n  "name": "Alice",\n  "age": 30\n}');
  const [diffB, setDiffB] = useState('{\n  "name": "Alice",\n  "age": 31\n}');
  const [diffResult, setDiffResult] = useState<string[]>([]);

  // WiFi QR
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiEnc, setWifiEnc] = useState('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);
  const [wifiCode, setWifiCode] = useState('');

  // SVG
  const [svgW, setSvgW] = useState(400);
  const [svgH, setSvgH] = useState(300);
  const [svgBg, setSvgBg] = useState('#CCCCCC');
  const [svgColor, setSvgColor] = useState('#333333');
  const [svgText, setSvgText] = useState('');
  const [svgDataUri, setSvgDataUri] = useState('');
  const [svgCode, setSvgCode] = useState('');

  // Phone
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneResult, setPhoneResult] = useState<ReturnType<typeof detectCountry>>(null);

  // OTP
  const [otpLen, setOtpLen] = useState(6);
  const [otpType, setOtpType] = useState<'numeric' | 'alpha' | 'hex'>('numeric');
  const [otpCount, setOtpCount] = useState(5);
  const [otpCodes, setOtpCodes] = useState<string[]>([]);

  // Slugify
  const [slugInput, setSlugInput] = useState('');
  const [slugLowercase, setSlugLowercase] = useState(true);
  const [slugTrim, setSlugTrim] = useState(true);
  const [slugSep, setSlugSep] = useState('-');
  const slugOutput = useMemo(() => slugify(slugInput, { lowercase: slugLowercase, trim: slugTrim, separator: slugSep, removeSpecials: true }), [slugInput, slugLowercase, slugTrim, slugSep]);

  const handleJsonDiff = useCallback(() => {
    const a = formatJSON(diffA);
    const b = formatJSON(diffB);
    const aLines = a.split('\n');
    const bLines = b.split('\n');
    const max = Math.max(aLines.length, bLines.length);
    const result: string[] = [];
    for (let i = 0; i < max; i++) {
      const la = aLines[i] || '';
      const lb = bLines[i] || '';
      if (la !== lb) {
        if (la) result.push(`- ${la}`);
        if (lb) result.push(`+ ${lb}`);
      }
    }
    setDiffResult(result.length > 0 ? result : ['No differences found.']);
  }, [diffA, diffB]);

  const generateSvg = useCallback(() => {
    const text = svgText || `${svgW} × ${svgH}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
  <rect width="100%" height="100%" fill="${svgBg}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="${Math.min(svgW, svgH) * 0.08}" fill="${svgColor}">${text}</text>
</svg>`;
    setSvgCode(svg);
    setSvgDataUri('data:image/svg+xml,' + encodeURIComponent(svg));
  }, [svgW, svgH, svgBg, svgColor, svgText]);

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

  const copy = (txt: string, label: string) => { clipboardWrite(txt); toast.success(`${label} copied!`); };

  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${tab === v ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
        <TabBtn v="json-diff" label="JSON Diff" icon={GitCompare} />
        <TabBtn v="wifi-qr" label="WiFi QR" icon={QrCode} />
        <TabBtn v="svg" label="SVG Placeholder" icon={Image} />
        <TabBtn v="phone" label="Phone Parser" icon={Phone} />
        <TabBtn v="otp" label="OTP Gen" icon={Key} />
        <TabBtn v="slugify" label="Slugify" icon={Link} />
      </div>

      {tab === 'json-diff' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea value={diffA} onChange={e => setDiffA(e.target.value)} className="w-full h-[200px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white outline-none resize-none font-mono" />
            <textarea value={diffB} onChange={e => setDiffB(e.target.value)} className="w-full h-[200px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white outline-none resize-none font-mono" />
          </div>
          <button onClick={handleJsonDiff} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer">Compare</button>
          {diffResult.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5">
              <div className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Diff</div>
              <div className="max-h-[200px] overflow-y-auto font-mono text-xs space-y-0.5">
                {diffResult.map((line, i) => {
                  const isRemoved = line.startsWith('- ');
                  const isAdded = line.startsWith('+ ');
                  return (
                    <div key={i} className={`py-1 px-2 rounded ${isRemoved ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : isAdded ? 'bg-green-50 dark:bg-green-900/20 text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'wifi-qr' && (
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
      )}

      {tab === 'svg' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Width</label>
                <input value={svgW} onChange={e => setSvgW(parseInt(e.target.value) || 400)} type="number" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none font-mono" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Height</label>
                <input value={svgH} onChange={e => setSvgH(parseInt(e.target.value) || 300)} type="number" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none font-mono" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Bg Color</label>
                <input value={svgBg} onChange={e => setSvgBg(e.target.value)} type="text" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none font-mono" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Text Color</label>
                <input value={svgColor} onChange={e => setSvgColor(e.target.value)} type="text" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none font-mono" />
              </div>
            </div>
            <input value={svgText} onChange={e => setSvgText(e.target.value)} placeholder="Text (default: dimensions)" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none" />
            <button onClick={generateSvg} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer">Generate</button>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
            {svgDataUri && (
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 flex items-center justify-center min-h-[150px]">
                <img src={svgDataUri} alt="SVG placeholder" className="max-w-full rounded-lg shadow-sm" />
              </div>
            )}
            {svgCode && (
              <div className="space-y-2">
                <div className="relative">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">SVG Code</label>
                  <textarea value={svgCode} readOnly rows={4} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-[10px] text-zinc-900 dark:text-white outline-none resize-none font-mono" />
                  <button onClick={() => copy(svgCode, 'SVG')} className="absolute top-5 right-2 text-[10px] text-indigo-400 hover:underline bg-white dark:bg-zinc-800 px-2 py-0.5 rounded">Copy SVG</button>
                </div>
                <div className="relative">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Data URI</label>
                  <input type="text" readOnly value={svgDataUri} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-[10px] text-zinc-900 dark:text-white outline-none font-mono truncate" />
                  <button onClick={() => copy(svgDataUri, 'Data URI')} className="absolute top-5 right-2 text-[10px] text-indigo-400 hover:underline bg-white dark:bg-zinc-800 px-2 py-0.5 rounded">Copy URI</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'phone' && (
        <div className="space-y-4">
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
      )}

      {tab === 'otp' && (
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
      )}

      {tab === 'slugify' && (
        <div className="space-y-4">
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
      )}
    </div>
  );
}
