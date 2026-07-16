"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Network, Globe, GitCompare, Shuffle } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'subnet' | 'conv' | 'range' | 'ula';

function ipToNum(ip: string): number {
  const parts = ip.split('.');
  if (parts.length !== 4) return NaN;
  return parts.reduce((acc, oct) => (acc << 8) + parseInt(oct), 0) >>> 0;
}

function numToIp(num: number): string {
  return ((num >>> 24) & 0xFF) + '.' + ((num >>> 16) & 0xFF) + '.' + ((num >>> 8) & 0xFF) + '.' + (num & 0xFF);
}

function computeSubnet(ip: string, cidr: number) {
  const ipNum = ipToNum(ip);
  if (isNaN(ipNum) || cidr < 0 || cidr > 32) return null;
  const mask = ~(0xFFFFFFFF >>> cidr) >>> 0;
  const network = ipNum & mask;
  const broadcast = (network | ~mask) >>> 0;
  const total = Math.pow(2, 32 - cidr);
  return {
    network: numToIp(network),
    broadcast: numToIp(broadcast),
    firstHost: total > 2 ? numToIp(network + 1) : 'N/A',
    lastHost: total > 2 ? numToIp(broadcast - 1) : 'N/A',
    totalHosts: total > 2 ? total - 2 : total,
    maskDotted: numToIp(mask),
    maskBinary: ((mask >>> 24) & 0xFF).toString(2).padStart(8,'0') + '.' +
                ((mask >>> 16) & 0xFF).toString(2).padStart(8,'0') + '.' +
                ((mask >>> 8) & 0xFF).toString(2).padStart(8,'0') + '.' +
                (mask & 0xFF).toString(2).padStart(8,'0'),
    cidr,
  };
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

export default function NetworkToolkit() {
  const [tab, setTab] = useState<Tab>('subnet');

  const [cidrInput, setCidrInput] = useState('192.168.1.0/24');
  const [subnetResult, setSubnetResult] = useState<ReturnType<typeof computeSubnet>>(null);

  const [ipConvInput, setIpConvInput] = useState('192.168.1.1');
  const [decOut, setDecOut] = useState('');
  const [binOut, setBinOut] = useState('');
  const [hexOut, setHexOut] = useState('');

  const [rangeStart, setRangeStart] = useState('192.168.1.1');
  const [rangeEnd, setRangeEnd] = useState('192.168.1.20');
  const [rangeList, setRangeList] = useState<string[]>([]);
  const [rangeCount, setRangeCount] = useState(0);

  const [ula, setUla] = useState({ full: '', shortened: '', subnet: '' });

  const handleCidrChange = useCallback((val: string) => {
    setCidrInput(val);
    const m = val.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/);
    if (m) setSubnetResult(computeSubnet(m[1], parseInt(m[2])));
    else setSubnetResult(null);
  }, []);

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

  const copy = (txt: string, label: string) => { clipboardWrite(txt); toast.success(`${label} copied!`); };

  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${tab === v ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );

  const InfoRow = ({ label, val }: { label: string; val: string }) => (
    <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-[11px] font-medium text-zinc-500">{label}</span>
      <span className="text-[11px] font-mono text-zinc-900 dark:text-white">{val}</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 w-fit">
        <TabBtn v="subnet" label="Subnet Calc" icon={Network} />
        <TabBtn v="conv" label="IP Converter" icon={Globe} />
        <TabBtn v="range" label="Range Expander" icon={GitCompare} />
        <TabBtn v="ula" label="IPv6 ULA" icon={Shuffle} />
      </div>

      {tab === 'subnet' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
          <input value={cidrInput} onChange={e => handleCidrChange(e.target.value)} placeholder="e.g. 192.168.1.0/24" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none font-mono" />
          {subnetResult && (
            <div className="space-y-0">
              <InfoRow label="Network Address" val={subnetResult.network} />
              <InfoRow label="Broadcast Address" val={subnetResult.broadcast} />
              <InfoRow label="First Usable Host" val={subnetResult.firstHost} />
              <InfoRow label="Last Usable Host" val={subnetResult.lastHost} />
              <InfoRow label="Total Hosts" val={String(subnetResult.totalHosts)} />
              <InfoRow label="Subnet Mask" val={subnetResult.maskDotted} />
              <InfoRow label="Mask Binary" val={subnetResult.maskBinary} />
              <InfoRow label="CIDR Notation" val={`/${subnetResult.cidr}`} />
            </div>
          )}
        </div>
      )}

      {tab === 'conv' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
          <input value={ipConvInput} onChange={e => handleIpConv(e.target.value)} placeholder="Enter IPv4..." className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none font-mono" />
          <div className="space-y-0">
            <InfoRow label="Dotted Decimal" val={ipConvInput} />
            <InfoRow label="Decimal" val={decOut || '—'} />
            <InfoRow label="Binary" val={binOut || '—'} />
            <InfoRow label="Hexadecimal" val={hexOut || '—'} />
          </div>
        </div>
      )}

      {tab === 'range' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input value={rangeStart} onChange={e => setRangeStart(e.target.value)} placeholder="Start IP..." className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-3 text-sm text-zinc-900 dark:text-white outline-none font-mono" />
            <input value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} placeholder="End IP..." className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-3 text-sm text-zinc-900 dark:text-white outline-none font-mono" />
          </div>
          <button onClick={handleRangeExpand} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer">Expand Range</button>
          {rangeCount > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500">Addresses ({rangeCount} total{rangeList.length < rangeCount ? `, showing first ${rangeList.length}` : ''})</span>
                <button onClick={() => copy(rangeList.join('\n'), 'Range')} className="text-[10px] text-indigo-400 hover:underline">Copy All</button>
              </div>
              <div className="max-h-[250px] overflow-y-auto font-mono text-[11px] text-zinc-900 dark:text-white space-y-0.5">
                {rangeList.map(ip => <div key={ip}>{ip}</div>)}
                {rangeCount > rangeList.length && <div className="text-zinc-400 italic">... {rangeCount - rangeList.length} more</div>}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'ula' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
          <button onClick={generateUla} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors cursor-pointer flex items-center gap-2">
            <Shuffle className="w-4 h-4" /> Generate New ULA
          </button>
          {ula.full && (
            <div className="space-y-0">
              <InfoRow label="Full Address" val={ula.full} />
              <InfoRow label="Shortened" val={ula.shortened} />
              <InfoRow label="Subnet" val={ula.subnet} />
              <div className="pt-2 flex gap-2">
                <button onClick={() => copy(ula.full, 'Full Address')} className="text-[10px] text-indigo-400 hover:underline">Copy Full</button>
                <button onClick={() => copy(ula.shortened, 'Shortened')} className="text-[10px] text-indigo-400 hover:underline">Copy Short</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
