"use client";

import React, { useState } from 'react';
import { Copy, RefreshCw, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function MacAddressGenerator() {
  const [qty, setQty] = useState(5);
  const [prefix, setPrefix] = useState('00:50:56'); // VMware default prefix
  const [uppercase, setUppercase] = useState(true);
  const [delimiter, setDelimiter] = useState(':');
  const [list, setList] = useState<string[]>([]);

  const generateMacs = () => {
    const arr: string[] = [];
    const hex = '0123456789abcdef';

    for (let q = 0; q < qty; q++) {
      let mac = prefix.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
      // Pad out to 12 hex digits
      while (mac.length < 12) {
        mac += hex[Math.floor(Math.random() * 16)];
      }

      // Chunk and join with delimiter
      const chunks = mac.match(/.{2}/g);
      if (chunks) {
        let formatted = chunks.join(delimiter);
        if (uppercase) formatted = formatted.toUpperCase();
        arr.push(formatted);
      }
    }

    setList(arr);
    toast.success(`Generated ${qty} MAC Addresses!`);
  };

  const handleCopy = () => {
    clipboardWrite(list.join('\n')).then(ok => { if (ok) toast.success('Copied all addresses!'); else toast.error('Copy blocked by the browser — select the text manually.'); });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-5 border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-[var(--accent)]" />
          MAC Address List Generator
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Generate random hardware MAC addresses with custom prefixes, formats and cases client-side.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-4 text-xs">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase border-b border-[var(--border-subtle)] pb-2">Formatting</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="lbl-macaddressgenerator-quantity" className="text-[10px] text-[var(--text-muted)] font-bold">Quantity</label>
              <select id="lbl-macaddressgenerator-quantity" aria-label="Quantity" value={qty} onChange={e => setQty(parseInt(e.target.value))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-2.5 py-2 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2">
                <option value="5">5 Addresses</option>
                <option value="10">10 Addresses</option>
                <option value="20">20 Addresses</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="lbl-macaddressgenerator-delimiter" className="text-[10px] text-[var(--text-muted)] font-bold">Delimiter</label>
              <select id="lbl-macaddressgenerator-delimiter" aria-label="Delimiter" value={delimiter} onChange={e => setDelimiter(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-2.5 py-2 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2">
                <option value=":">Colon (:)</option>
                <option value="-">Hyphen (-)</option>
                <option value="">None</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="lbl-macaddressgenerator-oui-prefix-e-g-00-50-56-for-vmware" className="text-[10px] text-[var(--text-muted)] font-bold">OUI Prefix (e.g. 00:50:56 for VMware)</label>
            <input id="lbl-macaddressgenerator-oui-prefix-e-g-00-50-56-for-vmware" aria-label="OUI Prefix (e.g. 00:50:56 for VMware)" type="text" value={prefix} onChange={e => setPrefix(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
          </div>

          <div className="flex items-center gap-1.5 pt-2">
            <input id="lbl-macaddressgenerator-uppercase-hex-letters" aria-label="Uppercase Hex Letters" type="checkbox" checked={uppercase} onChange={e => setUppercase(e.target.checked)} className="rounded" />
            <label htmlFor="lbl-macaddressgenerator-uppercase-hex-letters" className="text-[var(--text-muted)] cursor-pointer">Uppercase Hex Letters</label>
          </div>

          <button onClick={generateMacs} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer">
            <RefreshCw className="w-4 h-4" /> Generate Addresses
          </button>
        </div>

        {/* Results */}
        <div className="min-h-[250px] flex flex-col justify-between">
          <div className="space-y-2 flex-1 flex flex-col">
            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2">
              <span className="text-xs text-[var(--text-muted)] font-bold uppercase">MAC Addresses</span>
              {list.length > 0 && <button onClick={handleCopy} className="p-1.5 text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)] rounded-lg" aria-label="Copy all MAC addresses"><Copy className="w-4 h-4" /></button>}
            </div>
            <textarea aria-label="Generated MAC addresses output" readOnly value={list.join('\n')} placeholder="Addresses will appear here..." className="w-full flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-zinc-300 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 h-48 resize-none mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}