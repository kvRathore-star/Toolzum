"use client";

import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Clipboard } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

function ipToNum(ip: string): number {
  const parts = ip.split('.');
  if (parts.length !== 4) return NaN;
  return parts.reduce((acc, oct) => (acc << 8) + parseInt(oct), 0) >>> 0;
}

function numToIp(num: number): string {
  return ((num >>> 24) & 0xFF) + '.' + ((num >>> 16) & 0xFF) + '.' + ((num >>> 8) & 0xFF) + '.' + (num & 0xFF);
}

function CopyBtn({ text, label }: { text: string; label?: string }) {
  return (
    <button onClick={() => { clipboardWrite(text); toast.success(label ? `${label} copied!` : 'Copied!'); }}
      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"><Clipboard className="w-3 h-3" /> Copy</button>
  );
}

function InfoRow({ label, val }: { label: string; val: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <span className="text-sm font-mono text-zinc-900 dark:text-white break-all text-right ml-4">{val}</span>
    </div>
  );
}

export function IpAddressConverter() {
  const [input, setInput] = useState('192.168.1.1');
  const num = ipToNum(input);
  const decOut = isNaN(num) ? '' : String(num);
  const binOut = isNaN(num) ? '' : num.toString(2).padStart(32, '0').replace(/(.{8})/g, '$1.').slice(0, -1);
  const hexOut = isNaN(num) ? '' : num.toString(16).toUpperCase().padStart(8, '0').replace(/(.{2})/g, '$1 ').trim();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">IPv4 Address Converter</h2>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">IPv4 Address</label>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Enter IPv4..."
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        </div>
        <div>
          <InfoRow label="Dotted Decimal" val={input} />
          <InfoRow label="Decimal" val={decOut || '\u2014'} />
          <InfoRow label="Binary" val={binOut || '\u2014'} />
          <InfoRow label="Hexadecimal" val={hexOut || '\u2014'} />
        </div>
      </div>
    </div>
  );
}

export function IpRangeExpander() {
  const [start, setStart] = useState('192.168.1.1');
  const [end, setEnd] = useState('192.168.1.20');
  const [rangeList, setRangeList] = useState<string[]>([]);
  const [rangeCount, setRangeCount] = useState(0);

  const expand = useCallback(() => {
    const s = ipToNum(start);
    const e = ipToNum(end);
    if (isNaN(s) || isNaN(e)) { toast.error('Invalid IP address'); return; }
    if (e < s) { toast.error('End IP must be >= Start IP'); return; }
    if (e - s > 65536) { toast.error('Range too large (max 65536 addresses)'); return; }
    const count = e - s + 1;
    setRangeCount(count);
    const list: string[] = [];
    const max = Math.min(e, s + 255);
    for (let i = s; i <= max; i++) list.push(numToIp(i));
    setRangeList(list);
  }, [start, end]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">IP Range Expander</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">Start IP</label>
            <input value={start} onChange={e => setStart(e.target.value)} placeholder="Start IP..."
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">End IP</label>
            <input value={end} onChange={e => setEnd(e.target.value)} placeholder="End IP..."
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
          </div>
        </div>
        <button onClick={expand} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all">Expand Range</button>
        {rangeCount > 0 && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Addresses ({rangeCount} total{rangeList.length < rangeCount ? `, showing first ${rangeList.length}` : ''})</span>
              <CopyBtn text={rangeList.join('\n')} label="Range" />
            </div>
            <div className="max-h-[250px] overflow-y-auto font-mono text-sm text-zinc-900 dark:text-white space-y-1">
              {rangeList.map(ip => <div key={ip}>{ip}</div>)}
              {rangeCount > rangeList.length && <div className="text-zinc-400 italic text-sm">... {rangeCount - rangeList.length} more</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Ipv6UlaGenerator() {
  const [ula, setUla] = useState({ full: '', shortened: '', subnet: '' });

  const generate = useCallback(() => {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    const parts: string[] = [];
    for (let i = 0; i < 8; i++) {
      if (i === 0) parts.push('fd');
      parts.push(bytes[i].toString(16).padStart(2, '0'));
    }
    const full = parts.join('');
    const addr = full.replace(/(.{4})/g, '$1:').slice(0, -1);
    const shortened = addr.replace(/(:0)+:/, '::');
    const subnet = 'fd' + bytes[0].toString(16).padStart(2, '0') + ':' +
                   bytes[1].toString(16).padStart(2, '0') + ':' +
                   bytes[2].toString(16).padStart(2, '0') + '::/48';
    setUla({ full: addr, shortened, subnet });
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">IPv6 ULA Generator</h2>
        <button onClick={generate} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all">Generate New ULA</button>
        {ula.full && (
          <div>
            <InfoRow label="Full Address" val={ula.full} />
            <InfoRow label="Shortened" val={ula.shortened} />
            <InfoRow label="Subnet" val={ula.subnet} />
            <div className="flex gap-3 mt-3">
              <CopyBtn text={ula.full} label="Full" />
              <CopyBtn text={ula.shortened} label="Short" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
