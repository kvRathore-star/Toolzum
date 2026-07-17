"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Globe, GitCompare, Shuffle, Clipboard } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'conv' | 'range' | 'ula';

function ipToNum(ip: string): number {
  const parts = ip.split('.');
  if (parts.length !== 4) return NaN;
  return parts.reduce((acc, oct) => (acc << 8) + parseInt(oct), 0) >>> 0;
}

function numToIp(num: number): string {
  return ((num >>> 24) & 0xFF) + '.' + ((num >>> 16) & 0xFF) + '.' + ((num >>> 8) & 0xFF) + '.' + (num & 0xFF);
}

function generateULA() {
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
  return { full: addr, shortened, subnet };
}

function CopyBtn({ text, label }: { text: string; label?: string }) {
  return (
    <button onClick={() => { clipboardWrite(text); toast.success(label ? `${label} copied!` : 'Copied!'); }}
      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"><Clipboard className="w-3 h-3" /> Copy</button>
  );
}

export default function NetworkToolkit() {
  const [tab, setTab] = useState<Tab>('conv');

  const [ipConvInput, setIpConvInput] = useState('192.168.1.1');
  const [decOut, setDecOut] = useState('');
  const [binOut, setBinOut] = useState('');
  const [hexOut, setHexOut] = useState('');

  const [rangeStart, setRangeStart] = useState('192.168.1.1');
  const [rangeEnd, setRangeEnd] = useState('192.168.1.20');
  const [rangeList, setRangeList] = useState<string[]>([]);
  const [rangeCount, setRangeCount] = useState(0);

  const [ula, setUla] = useState({ full: '', shortened: '', subnet: '' });

  const handleIpConv = useCallback((val: string) => {
    setIpConvInput(val);
    const num = ipToNum(val);
    if (!isNaN(num)) {
      setDecOut(String(num));
      setBinOut(num.toString(2).padStart(32, '0').replace(/(.{8})/g, '$1.').slice(0, -1));
      setHexOut(num.toString(16).toUpperCase().padStart(8, '0').replace(/(.{2})/g, '$1 ').trim());
    } else {
      setDecOut(''); setBinOut(''); setHexOut('');
    }
  }, []);

  const handleRangeExpand = useCallback(() => {
    const start = ipToNum(rangeStart);
    const end = ipToNum(rangeEnd);
    if (isNaN(start) || isNaN(end)) { toast.error('Invalid IP address'); return; }
    if (end < start) { toast.error('End IP must be >= Start IP'); return; }
    if (end - start > 65536) { toast.error('Range too large (max 65536 addresses)'); return; }
    const count = end - start + 1;
    setRangeCount(count);
    const list: string[] = [];
    const max = Math.min(end, start + 255);
    for (let i = start; i <= max; i++) list.push(numToIp(i));
    setRangeList(list);
  }, [rangeStart, rangeEnd]);

  const generateUla = useCallback(() => {
    setUla(generateULA());
  }, []);

  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${tab === v ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  const InfoRow = ({ label, val }: { label: string; val: string }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <span className="text-sm font-mono text-zinc-900 dark:text-white break-all text-right ml-4">{val}</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-xl w-fit">
        <TabBtn v="conv" label="IP Converter" icon={Globe} />
        <TabBtn v="range" label="Range Expander" icon={GitCompare} />
        <TabBtn v="ula" label="IPv6 ULA" icon={Shuffle} />
      </div>

      {tab === 'conv' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">IPv4 Address</label>
            <input value={ipConvInput} onChange={e => handleIpConv(e.target.value)} placeholder="Enter IPv4..."
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
          </div>
          <div>
            <InfoRow label="Dotted Decimal" val={ipConvInput} />
            <InfoRow label="Decimal" val={decOut || '\u2014'} />
            <InfoRow label="Binary" val={binOut || '\u2014'} />
            <InfoRow label="Hexadecimal" val={hexOut || '\u2014'} />
          </div>
        </div>
      )}

      {tab === 'range' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Start IP</label>
              <input value={rangeStart} onChange={e => setRangeStart(e.target.value)} placeholder="Start IP..."
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">End IP</label>
              <input value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} placeholder="End IP..."
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
            </div>
          </div>
          <button onClick={handleRangeExpand} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all">Expand Range</button>
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
      )}

      {tab === 'ula' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
          <button onClick={generateUla} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 w-fit">
            <Shuffle className="w-4 h-4" /> Generate New ULA
          </button>
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
      )}
    </div>
  );
}
