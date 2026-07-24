"use client";

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Sliders, Globe, FileText, Mail, Phone, MessageSquare, MessageCircle, Wifi, User, Calendar, MapPin, RefreshCw, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

type QrType = 'url' | 'text' | 'email' | 'phone' | 'sms' | 'whatsapp' | 'wifi' | 'contact' | 'event' | 'location';

const TABS: { id: QrType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'url', label: 'URL', icon: Globe },
  { id: 'text', label: 'Text', icon: FileText },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'sms', label: 'SMS', icon: MessageSquare },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'contact', label: 'vCard', icon: User },
  { id: 'event', label: 'Event', icon: Calendar },
  { id: 'location', label: 'Location', icon: MapPin },
];

export default function QrCodeGenerator() {
  const [qrType, setQrType] = useState<QrType>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.includes('wifi-qr')) return 'wifi';
    return 'url';
  });

  const [urlContent, setUrlContent] = useState('https://toolzum.com');
  const [textContent, setTextContent] = useState('Hello from Toolzum!');

  const [emailAddr, setEmailAddr] = useState('hello@example.com');
  const [emailSubj, setEmailSubj] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const [phoneNum, setPhoneNum] = useState('+14155552671');

  const [smsNum, setSmsNum] = useState('+14155552671');
  const [smsBody, setSmsBody] = useState('');

  const [waNum, setWaNum] = useState('14155552671');
  const [waText, setWaText] = useState('');

  const [wifiSsid, setWifiSsid] = useState('MyNetwork');
  const [wifiPass, setWifiPass] = useState('MyPassword');
  const [wifiSec, setWifiSec] = useState('WPA');

  const [contactName, setContactName] = useState('John Doe');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [contactEmail, setContactEmail] = useState('john@example.com');
  const [contactOrg, setContactOrg] = useState('Acme Inc');
  const [contactUrl, setContactUrl] = useState('https://example.com');

  const [eventTitle, setEventTitle] = useState('Team Meeting');
  const [eventLoc, setEventLoc] = useState('Conference Room A');
  const [eventStart, setEventStart] = useState('20260724T090000');
  const [eventEnd, setEventEnd] = useState('20260724T100000');
  const [eventDesc, setEventDesc] = useState('Weekly sync');

  const [geoLat, setGeoLat] = useState('37.7749');
  const [geoLon, setGeoLon] = useState('-122.4194');
  const [geoLabel, setGeoLabel] = useState('San Francisco');

  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState<number>(300);
  const [logoImage, setLogoImage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getQRText = () => {
    switch (qrType) {
      case 'url': return urlContent;
      case 'text': return textContent;
      case 'email': {
        let s = `mailto:${emailAddr}`;
        const params: string[] = [];
        if (emailSubj) params.push(`subject=${encodeURIComponent(emailSubj)}`);
        if (emailBody) params.push(`body=${encodeURIComponent(emailBody)}`);
        if (params.length) s += '?' + params.join('&');
        return s;
      }
      case 'phone': return `tel:${phoneNum}`;
      case 'sms': {
        let s = `smsto:${smsNum}`;
        if (smsBody) s += `:${smsBody}`;
        return s;
      }
      case 'whatsapp': {
        let s = `https://wa.me/${waNum.replace(/\D/g, '')}`;
        if (waText) s += `?text=${encodeURIComponent(waText)}`;
        return s;
      }
      case 'wifi': return `WIFI:T:${wifiSec};S:${wifiSsid};P:${wifiPass};;`;
      case 'contact': {
        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${contactName}`,
          `N:${contactName.split(' ').reverse().join(';')};`,
          contactPhone ? `TEL:${contactPhone}` : '',
          contactEmail ? `EMAIL:${contactEmail}` : '',
          contactOrg ? `ORG:${contactOrg}` : '',
          contactUrl ? `URL:${contactUrl}` : '',
          'END:VCARD',
        ].filter(Boolean).join('\n');
      }
      case 'event': {
        return [
          'BEGIN:VEVENT',
          `SUMMARY:${eventTitle}`,
          eventLoc ? `LOCATION:${eventLoc}` : '',
          `DTSTART:${eventStart}`,
          `DTEND:${eventEnd}`,
          eventDesc ? `DESCRIPTION:${eventDesc}` : '',
          'END:VEVENT',
        ].filter(Boolean).join('\n');
      }
      case 'location': return `geo:${geoLat},${geoLon}?q=${encodeURIComponent(geoLabel || `${geoLat},${geoLon}`)}`;
      default: return '';
    }
  };

  useEffect(() => { generateQR(); }, [qrType, urlContent, textContent, emailAddr, emailSubj, emailBody, phoneNum, smsNum, smsBody, waNum, waText, wifiSsid, wifiPass, wifiSec, contactName, contactPhone, contactEmail, contactOrg, contactUrl, eventTitle, eventLoc, eventStart, eventEnd, eventDesc, geoLat, geoLon, geoLabel, fgColor, bgColor, size, logoImage]);

  const generateQR = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const qrText = getQRText();
    if (!qrText) return;
    try {
      await QRCode.toCanvas(canvas, qrText, {
        width: size, margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: 'H',
      });
      if (logoImage) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const logoImg = new Image();
        logoImg.src = logoImage;
        await new Promise(r => { logoImg.onload = r; });
        const logoSize = size * 0.2;
        const x = (size - logoSize) / 2;
        const y = (size - logoSize) / 2;
        ctx.fillStyle = bgColor;
        ctx.fillRect(x - 2, y - 2, logoSize + 4, logoSize + 4);
        ctx.drawImage(logoImg, x, y, logoSize, logoSize);
      }
    } catch { toast.error('Failed to generate QR code.'); }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setLogoImage(URL.createObjectURL(file)); toast.success('QR Center logo loaded!'); }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadOrShare(canvas.toDataURL('image/png'), 'qrcode.png');
    toast.success('QR code downloaded!');
  };

  const reset = () => {
    setQrType('url');
    setUrlContent('https://toolzum.com');
    setTextContent('Hello from Toolzum!');
    setEmailAddr('hello@example.com'); setEmailSubj(''); setEmailBody('');
    setPhoneNum('+14155552671');
    setSmsNum('+14155552671'); setSmsBody('');
    setWaNum('14155552671'); setWaText('');
    setWifiSsid('MyNetwork'); setWifiPass('MyPassword'); setWifiSec('WPA');
    setContactName('John Doe'); setContactPhone('+91 98765 43210'); setContactEmail('john@example.com');
    setContactOrg('Acme Inc'); setContactUrl('https://example.com');
    setEventTitle('Team Meeting'); setEventLoc('Conference Room A');
    setEventStart('20260724T090000'); setEventEnd('20260724T100000'); setEventDesc('Weekly sync');
    setGeoLat('37.7749'); setGeoLon('-122.4194'); setGeoLabel('San Francisco');
    setFgColor('#000000'); setBgColor('#ffffff'); setSize(300); setLogoImage(null);
  };

  const inpCls = "w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 text-[var(--text-primary)]";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-6 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Key className="w-6 h-6 text-[var(--accent)]" />
          QR Code Generator
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Generate QR codes for URLs, text, email, phone, SMS, WhatsApp, Wi-Fi, vCard contacts, calendar events, and GPS locations. Custom colors and center logo support.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 p-1.5 bg-[var(--bg-surface)] rounded-xl">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setQrType(tab.id)}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                qrType === tab.id
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-6 max-h-[600px] overflow-y-auto pr-1">
          <h4 className="font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1 border-b border-[var(--border-subtle)] pb-2">
            <Sliders className="w-4 h-4 text-[var(--accent)]" />
            Content
          </h4>

          {qrType === 'url' && (
            <div className="space-y-1 text-xs">
              <span className="font-bold text-[var(--text-secondary)] uppercase block">Website URL</span>
              <input type="url" value={urlContent} onChange={e => setUrlContent(e.target.value)} className={inpCls} />
            </div>
          )}

          {qrType === 'text' && (
            <div className="space-y-1 text-xs">
              <span className="font-bold text-[var(--text-secondary)] uppercase block">Plain Text</span>
              <textarea value={textContent} onChange={e => setTextContent(e.target.value)} className={`${inpCls} h-24 resize-none`} />
            </div>
          )}

          {qrType === 'email' && (
            <div className="space-y-3 text-xs">
              <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">Email Address</span><input type="email" value={emailAddr} onChange={e => setEmailAddr(e.target.value)} className={inpCls} /></div>
              <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">Subject</span><input type="text" value={emailSubj} onChange={e => setEmailSubj(e.target.value)} className={inpCls} /></div>
              <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">Body</span><textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} className={`${inpCls} h-20 resize-none`} /></div>
            </div>
          )}

          {qrType === 'phone' && (
            <div className="space-y-1 text-xs">
              <span className="font-bold text-[var(--text-secondary)] uppercase block">Phone Number (with country code)</span>
              <input type="tel" value={phoneNum} onChange={e => setPhoneNum(e.target.value)} placeholder="+14155552671" className={inpCls} />
            </div>
          )}

          {qrType === 'sms' && (
            <div className="space-y-3 text-xs">
              <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">Phone Number</span><input type="tel" value={smsNum} onChange={e => setSmsNum(e.target.value)} placeholder="+14155552671" className={inpCls} /></div>
              <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">Message</span><textarea value={smsBody} onChange={e => setSmsBody(e.target.value)} className={`${inpCls} h-20 resize-none`} /></div>
            </div>
          )}

          {qrType === 'whatsapp' && (
            <div className="space-y-3 text-xs">
              <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">Phone Number (without +)</span><input type="tel" value={waNum} onChange={e => setWaNum(e.target.value)} placeholder="14155552671" className={inpCls} /></div>
              <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">Pre-filled Message</span><textarea value={waText} onChange={e => setWaText(e.target.value)} className={`${inpCls} h-20 resize-none`} placeholder="Hi! I'd like to chat..." /></div>
            </div>
          )}

          {qrType === 'wifi' && (
            <div className="space-y-3 text-xs">
              <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">SSID (Network Name)</span><input type="text" value={wifiSsid} onChange={e => setWifiSsid(e.target.value)} className={inpCls} /></div>
              <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">Password</span><input type="password" value={wifiPass} onChange={e => setWifiPass(e.target.value)} className={inpCls} /></div>
              <div className="space-y-1">
                <span className="font-bold text-[var(--text-secondary)] uppercase block">Security</span>
                <select value={wifiSec} onChange={e => setWifiSec(e.target.value)} className={inpCls}>
                  <option value="WPA">WPA / WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Open (No Password)</option>
                </select>
              </div>
            </div>
          )}

          {qrType === 'contact' && (
            <div className="space-y-3 text-xs">
              <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">Full Name</span><input type="text" value={contactName} onChange={e => setContactName(e.target.value)} className={inpCls} /></div>
              <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">Phone</span><input type="text" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className={inpCls} /></div>
              <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">Email</span><input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className={inpCls} /></div>
              <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">Organization</span><input type="text" value={contactOrg} onChange={e => setContactOrg(e.target.value)} className={inpCls} /></div>
              <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">Website</span><input type="url" value={contactUrl} onChange={e => setContactUrl(e.target.value)} className={inpCls} /></div>
            </div>
          )}

          {qrType === 'event' && (
            <div className="space-y-3 text-xs">
              <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">Event Title</span><input type="text" value={eventTitle} onChange={e => setEventTitle(e.target.value)} className={inpCls} /></div>
              <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">Location</span><input type="text" value={eventLoc} onChange={e => setEventLoc(e.target.value)} className={inpCls} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">Start (YYYYMMDDTHHMMSS)</span><input type="text" value={eventStart} onChange={e => setEventStart(e.target.value)} className={inpCls} /></div>
                <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">End</span><input type="text" value={eventEnd} onChange={e => setEventEnd(e.target.value)} className={inpCls} /></div>
              </div>
              <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">Description</span><textarea value={eventDesc} onChange={e => setEventDesc(e.target.value)} className={`${inpCls} h-16 resize-none`} /></div>
            </div>
          )}

          {qrType === 'location' && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">Latitude</span><input type="text" value={geoLat} onChange={e => setGeoLat(e.target.value)} className={inpCls} /></div>
                <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">Longitude</span><input type="text" value={geoLon} onChange={e => setGeoLon(e.target.value)} className={inpCls} /></div>
              </div>
              <div className="space-y-1"><span className="font-bold text-[var(--text-secondary)] uppercase block">Label</span><input type="text" value={geoLabel} onChange={e => setGeoLabel(e.target.value)} className={inpCls} placeholder="San Francisco" /></div>
            </div>
          )}

          <h4 className="font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1 border-t border-[var(--border-subtle)] pt-4">
            <Sliders className="w-4 h-4 text-[var(--accent)]" />
            Style
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-[var(--text-secondary)] font-bold block">Foreground</span>
              <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-full h-10 border border-[var(--border-subtle)] rounded-lg cursor-pointer bg-transparent" />
            </div>
            <div className="space-y-1">
              <span className="text-[var(--text-secondary)] font-bold block">Background</span>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-10 border border-[var(--border-subtle)] rounded-lg cursor-pointer bg-transparent" />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <span className="font-bold text-[var(--text-secondary)] uppercase block">Size: {size}px</span>
            <input type="range" min={128} max={512} step={1} value={size} onChange={e => setSize(Number(e.target.value))} className="w-full" />
          </div>

          <div className="space-y-1 text-xs">
            <span className="text-[var(--text-secondary)] font-bold block">Center Logo</span>
            <label className="w-full py-2.5 bg-[var(--bg-overlay)] hover:bg-zinc-100 dark:hover:bg-[var(--bg-elevated)] text-zinc-700 dark:text-[var(--text-muted)] border border-[var(--border-subtle)] font-bold rounded-xl text-center cursor-pointer block">
              Choose Logo File
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
            {logoImage && <button onClick={() => setLogoImage(null)} className="text-[10px] text-rose-400 hover:text-rose-300 font-bold block mt-1">Remove Logo</button>}
          </div>

          <button onClick={reset} className="w-full py-2.5 bg-[var(--bg-overlay)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5">
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        </div>

        <div className="lg:col-span-2 bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col justify-between items-center min-h-[350px]">
          <div className="flex-1 flex justify-center items-center p-6 bg-white border border-[var(--border-subtle)] rounded-2xl shadow-inner w-full">
            <canvas ref={canvasRef} className="max-w-full max-h-[300px] object-contain" />
          </div>
          <button onClick={handleDownload} className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg text-sm">
            <Download className="w-4 h-4" /> Download QR PNG
          </button>
        </div>
      </div>
    </div>
  );
}
