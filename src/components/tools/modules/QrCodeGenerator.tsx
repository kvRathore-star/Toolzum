"use client";

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Sliders, RefreshCw, Key, FileText, Globe, Wifi, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

export default function QrCodeGenerator() {
  const [qrType, setQrType] = useState<'text' | 'url' | 'wifi' | 'contact'>('url');
  
  // Content states
  const [textContent, setTextContent] = useState('Hello from Toolzum!');
  const [urlContent, setUrlContent] = useState('https://toolzum.com');
  
  // Wifi states
  const [wifiSsid, setWifiSsid] = useState('MyNetwork');
  const [wifiPass, setWifiPass] = useState('MyPassword');
  const [wifiSec, setWifiSec] = useState('WPA');

  // Contact states
  const [contactName, setContactName] = useState('John Doe');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [contactEmail, setContactEmail] = useState('john@example.com');

  // Style states
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState<number>(300);
  const [logoImage, setLogoImage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getQRText = () => {
    if (qrType === 'text') return textContent;
    if (qrType === 'url') return urlContent;
    if (qrType === 'wifi') {
      return `WIFI:T:${wifiSec};S:${wifiSsid};P:${wifiPass};;`;
    }
    if (qrType === 'contact') {
      return `BEGIN:VCARD\nVERSION:3.0\nN:${contactName}\nTEL:${contactPhone}\nEMAIL:${contactEmail}\nEND:VCARD`;
    }
    return '';
  };

  useEffect(() => {
    generateQR();
  }, [qrType, textContent, urlContent, wifiSsid, wifiPass, wifiSec, contactName, contactPhone, contactEmail, fgColor, bgColor, size, logoImage]);

  const generateQR = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const qrText = getQRText();
    if (!qrText) return;

    try {
      const options = {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: 'H' as const, // High level helps make logo overlays scannable
      };

      await QRCode.toCanvas(canvas, qrText, options);

      // Draw logo in the center if uploaded
      if (logoImage) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const logoImg = new Image();
        logoImg.src = logoImage;
        await new Promise((resolve) => {
          logoImg.onload = resolve;
        });

        // Calculate size & position (logo is usually 20% of QR size max)
        const logoSize = size * 0.2;
        const x = (size - logoSize) / 2;
        const y = (size - logoSize) / 2;

        // Draw background box for logo (white to clear QR code pixels)
        ctx.fillStyle = bgColor;
        ctx.fillRect(x - 2, y - 2, logoSize + 4, logoSize + 4);

        // Draw actual logo
        ctx.drawImage(logoImg, x, y, logoSize, logoSize);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate QR code.');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoImage(url);
      toast.success('QR Center logo loaded!');
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    downloadOrShare(canvas.toDataURL('image/png'), 'qrcode.png');
    toast.success('QR code downloaded!');
  };

  const reset = () => {
    setQrType('url');
    setTextContent('Hello from Toolzum!');
    setUrlContent('https://toolzum.com');
    setWifiSsid('MyNetwork');
    setWifiPass('MyPassword');
    setWifiSec('WPA');
    setContactName('John Doe');
    setContactPhone('+91 98765 43210');
    setContactEmail('john@example.com');
    setFgColor('#000000');
    setBgColor('#ffffff');
    setSize(300);
    setLogoImage(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 border border-zinc-200 dark:border-white/5 rounded-2xl">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Key className="w-6 h-6 text-indigo-500" />
          Dynamic QR Code Generator
        </h2>
        <p className="text-sm text-[var(--text-secondary)] dark:text-zinc-400 mt-1">
          Generate high-resolution QR codes for text, website links, Wi-Fi credentials, or digital contact cards. Custom colors and center logo support.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl max-w-md">
        {[
          { id: 'url', label: 'URL Link', icon: Globe },
          { id: 'text', label: 'Plain Text', icon: FileText },
          { id: 'wifi', label: 'Wi-Fi Network', icon: Wifi },
          { id: 'contact', label: 'vCard Contact', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setQrType(tab.id as any)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                qrType === tab.id
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6 max-h-[600px] overflow-y-auto pr-1">
          <h4 className="font-bold text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <Sliders className="w-4 h-4 text-indigo-500" />
            Content Parameters
          </h4>

          {/* URL Input */}
          {qrType === 'url' && (
            <div className="space-y-1 text-xs animate-in fade-in duration-300">
              <span className="font-bold text-zinc-500 uppercase block">Website URL</span>
              <input
                type="url" value={urlContent} onChange={e => setUrlContent(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 text-zinc-900 dark:text-white"
              />
            </div>
          )}

          {/* Text Input */}
          {qrType === 'text' && (
            <div className="space-y-1 text-xs animate-in fade-in duration-300">
              <span className="font-bold text-zinc-500 uppercase block">Plain Text Message</span>
              <textarea
                value={textContent} onChange={e => setTextContent(e.target.value)}
                className="w-full h-24 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 text-zinc-900 dark:text-white resize-none"
              />
            </div>
          )}

          {/* Wifi Inputs */}
          {qrType === 'wifi' && (
            <div className="space-y-4 animate-in fade-in duration-300 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-zinc-500 uppercase block">Network SSID (Name)</span>
                <input
                  type="text" value={wifiSsid} onChange={e => setWifiSsid(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <span className="font-bold text-zinc-500 uppercase block">Security Password</span>
                <input
                  type="password" value={wifiPass} onChange={e => setWifiPass(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <span className="font-bold text-zinc-500 uppercase block">Security Type</span>
                <select
                  value={wifiSec} onChange={e => setWifiSec(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 text-zinc-900 dark:text-white"
                >
                  <option value="WPA">WPA / WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Unsecured (Open)</option>
                </select>
              </div>
            </div>
          )}

          {/* Contact Inputs */}
          {qrType === 'contact' && (
            <div className="space-y-4 animate-in fade-in duration-300 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-zinc-500 uppercase block">Full Name</span>
                <input
                  type="text" value={contactName} onChange={e => setContactName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <span className="font-bold text-zinc-500 uppercase block">Phone Number</span>
                <input
                  type="text" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <span className="font-bold text-zinc-500 uppercase block">Email Address</span>
                <input
                  type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <h4 className="font-bold text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1 border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <Sliders className="w-4 h-4 text-indigo-500" />
            Style Options
          </h4>

          {/* Color pickers */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-zinc-500 font-bold block mb-1">Foreground</span>
              <input
                type="color" value={fgColor} onChange={e => setFgColor(e.target.value)}
                className="w-full h-10 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer bg-transparent"
              />
            </div>
            <div className="space-y-1">
              <span className="text-zinc-500 font-bold block mb-1">Background</span>
              <input
                type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                className="w-full h-10 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer bg-transparent"
              />
            </div>
          </div>

          {/* Logo upload */}
          <div className="space-y-1 text-xs">
            <span className="text-zinc-500 font-bold block mb-1">Center Logo Overlay</span>
            <label className="w-full py-2.5 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-[var(--text-muted)] border border-zinc-200 dark:border-zinc-700 font-bold rounded-xl text-center cursor-pointer block">
              Choose Logo File
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
            {logoImage && (
              <button
                onClick={() => setLogoImage(null)}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-bold block mt-1"
              >
                Remove Logo
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={reset}
              className="w-full py-2.5 bg-[var(--bg-overlay)] dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Reset Parameters
            </button>
          </div>
        </div>

        {/* View Workspace */}
        <div className="lg:col-span-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-6 rounded-2xl flex flex-col justify-between items-center min-h-[350px]">
          <div className="flex-1 flex justify-center items-center p-6 bg-white border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-inner">
            <canvas ref={canvasRef} className="max-w-full max-h-[300px] object-contain" />
          </div>

          <button
            onClick={handleDownload}
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg text-sm"
          >
            <Download className="w-4 h-4" />
            Download QR PNG
          </button>
        </div>
      </div>
    </div>
  );
}