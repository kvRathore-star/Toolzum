"use client";

import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Clipboard } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";
import { DualPanel } from '../shared/DualPanel';
import { CalcActions } from '../shared/CalcActions';

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
    <button onClick={() => { clipboardWrite(text).then(ok => { if (ok) toast.success(label ? label + ' copied!' : 'Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }}
      className="text-xs text-[var(--accent)] hover:underline font-medium flex items-center gap-1"><Clipboard className="w-3 h-3" /> Copy</button>
  );
}

function InfoRow({ label, val }: { label: string; val: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-[var(--border-subtle)] last:border-0">
      <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
      <span className="text-sm font-mono text-[var(--text-primary)] break-all text-right ml-4">{val}</span>
    </div>
  );
}

export function IpAddressConverter() {
  const [input, setInput] = useState('192.168.1.1');
  const [output, setOutput] = useState('');
  const [isPrivate, setIsPrivate] = useState<boolean | null>(null);

  const PRESETS = [
    { label: '192.168.1.1', ip: '192.168.1.1' },
    { label: '10.0.0.1', ip: '10.0.0.1' },
    { label: '8.8.8.8', ip: '8.8.8.8' },
    { label: '127.0.0.1', ip: '127.0.0.1' },
    { label: '172.16.0.1', ip: '172.16.0.1' },
  ];

  const checkPrivate = (ip: string) => {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) { setIsPrivate(null); return; }
    if (parts[0] === 10) { setIsPrivate(true); return; }
    if (parts[0] === 172 && parts[1]! >= 16 && parts[1]! <= 31) { setIsPrivate(true); return; }
    if (parts[0] === 192 && parts[1] === 168) { setIsPrivate(true); return; }
    if (parts[0] === 127) { setIsPrivate(true); return; }
    if (parts[0] === 0) { setIsPrivate(true); return; }
    setIsPrivate(false);
  };

  const analyze = () => {
    const num = ipToNum(input);
    if (isNaN(num)) { setOutput('Invalid IPv4 address'); toast.error('Invalid IP'); return; }
    checkPrivate(input);

    const parts = input.split('.').map(Number);
    const binary = num.toString(2).padStart(32, '0');
    const grouped = binary.match(/.{8}/g) || [];
    const hex = num.toString(16).toUpperCase().padStart(8, '0');

    let classLabel = 'A';
    if (parts[0]! >= 192) classLabel = 'C';
    else if (parts[0]! >= 128) classLabel = 'B';

    const report = 'IPv4 Address Analysis\n' +
      '=====================\n\n' +
      'Dotted Decimal: ' + input + '\n' +
      'Integer:        ' + num + '\n' +
      'Hexadecimal:    0x' + hex + '\n' +
      'Binary:         ' + grouped.join('.') + '\n\n' +
      'Network Class:  ' + classLabel + '\n' +
      'Private/RFC1918: ' + (isPrivate === true ? 'Yes' : isPrivate === false ? 'No (Public)' : 'Unknown') + '\n\n' +
      'CIDR Notation:  ' + input + '/32\n' +
      'Subnet Mask:    255.255.255.255\n' +
      'Inverse Mask:   0.0.0.0';

    setOutput(report);
    toast.success('IP analyzed');
  };

  const num = ipToNum(input);
  const decOut = isNaN(num) ? '' : String(num);
  const binOut = isNaN(num) ? '' : num.toString(2).padStart(32, '0').replace(/(.{8})/g, '$1.').slice(0, -1);
  const hexOut = isNaN(num) ? '' : num.toString(16).toUpperCase().padStart(8, '0').replace(/(.{2})/g, '$1 ').trim();

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map(function(p) {
          return (
            <button key={p.label} onClick={() => { setInput(p.ip); setOutput(''); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {p.label}
            </button>
          );
        })}
      </div>
      <div className="space-y-5">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">IPv4 Address Converter</h2>
        <DualPanel
          input={<>
        <div className="space-y-1">
          <label htmlFor="lbl-networktoolkitwidgets-ipv4-address" className="text-xs font-medium text-[var(--text-secondary)]">IPv4 Address</label>
          <input id="lbl-networktoolkitwidgets-ipv4-address" aria-label="IPv4 Address" value={input} onChange={e => setInput(e.target.value)} placeholder="Enter IPv4..."
            className="w-full bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" />
        </div>

        <div>
          <InfoRow label="Dotted Decimal" val={input} />
          <InfoRow label="Decimal" val={decOut || '—'} />
          <InfoRow label="Hexadecimal" val={hexOut ? '0x' + hexOut.replace(/ /g, '') : '—'} />
          <InfoRow label="Binary" val={binOut || '—'} />
          <InfoRow label="Private (RFC1918)" val={isPrivate === true ? 'Yes' : isPrivate === false ? 'No (Public)' : '—'} />
        </div>

        <button onClick={analyze} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Full Analysis</button>
          </>}
          output={<>
            <pre className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-sm font-mono whitespace-pre-wrap min-h-24">{output || <span className="text-[var(--text-muted)]">Result appears here</span>}</pre>
          </>}
          actions={<CalcActions result={output} downloadData={output} downloadFilename='ip-analysis.txt' />}
        />
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
      <div className="space-y-5">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">IP Range Expander</h2>
        <DualPanel
          input={<>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="lbl-networktoolkitwidgets-start-ip" className="text-xs font-medium text-[var(--text-secondary)]">Start IP</label>
            <input id="lbl-networktoolkitwidgets-start-ip" aria-label="Start IP" value={start} onChange={e => setStart(e.target.value)} placeholder="Start IP..."
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" />
          </div>
          <div className="space-y-1">
            <label htmlFor="lbl-networktoolkitwidgets-end-ip" className="text-xs font-medium text-[var(--text-secondary)]">End IP</label>
            <input id="lbl-networktoolkitwidgets-end-ip" aria-label="End IP" value={end} onChange={e => setEnd(e.target.value)} placeholder="End IP..."
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" />
          </div>
        </div>
        <button onClick={expand} className="bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all">Expand Range</button>
          </>}
          output={<>
        {rangeCount > 0 ? (
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-[var(--text-secondary)]">Addresses ({rangeCount} total{rangeList.length < rangeCount ? ', showing first ' + rangeList.length : ''})</span>
            </div>
            <div className="max-h-[250px] overflow-y-auto font-mono text-sm text-[var(--text-primary)] space-y-1">
              {rangeList.map(ip => <div key={ip}>{ip}</div>)}
              {rangeCount > rangeList.length && <div className="text-[var(--text-muted)] italic text-sm">... {rangeCount - rangeList.length} more</div>}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">Expanded addresses appear here</p>
        )}
          </>}
          actions={<CalcActions result={rangeList.join('\n')} downloadData={rangeList.join('\n')} downloadFilename='ip-range.txt' />}
        />
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
      parts.push(bytes[i]!.toString(16).padStart(2, '0'));
    }
    const full = parts.join('');
    const addr = full.replace(/(.{4})/g, '$1:').slice(0, -1);
    const shortened = addr.replace(/(:0)+:/, '::');
    const subnet = 'fd' + bytes[0]!.toString(16).padStart(2, '0') + ':' +
                   bytes[1]!.toString(16).padStart(2, '0') + ':' +
                   bytes[2]!.toString(16).padStart(2, '0') + '::/48';
    setUla({ full: addr, shortened, subnet });
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="space-y-5">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">IPv6 ULA Generator</h2>
        <button onClick={generate} className="bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all">Generate New ULA</button>
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
