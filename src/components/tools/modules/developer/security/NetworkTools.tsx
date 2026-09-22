"use client";

import React, { useState } from 'react';
import { Section, Input } from './_shared';
import { clipboardWrite } from "@/lib/clipboard";
import { toast } from 'react-hot-toast';


export function SubnetCalculator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ address: string; network: string; broadcast: string; mask: string; hosts: number; range: string; cidr: number } | null>(null);
  const cidrPresets = ['192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/12', '10.0.0.0/16'];
  const calc = (cidrInput?: string) => {
    const inp = cidrInput !== undefined ? cidrInput : input;
    if (cidrInput !== undefined) setInput(inp);
    const [ipStr = "", cidrStr] = inp.split('/');
    const cidr = parseInt(cidrStr || '24');
    const octets = ipStr.split('.').map(Number);
    if (octets.length !== 4 || octets.some(o => isNaN(o) || o < 0 || o > 255)) return;
    const ip = ((octets[0]! << 24) | (octets[1]! << 16) | (octets[2]! << 8) | octets[3]!) >>> 0;
    const mask = ~(2 ** (32 - cidr) - 1) >>> 0;
    const network = ip & mask;
    const broadcast = network | (~mask >>> 0);
    const hosts = 2 ** (32 - cidr) - 2;
    const toIp = (n: number) => [(n >>> 24), (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
    setResult({
      address: toIp(ip),
      network: toIp(network),
      broadcast: toIp(broadcast),
      mask: toIp(mask),
      hosts: Math.max(0, hosts),
      range: hosts > 0 ? `${toIp(network + 1)} — ${toIp(broadcast - 1)}` : 'N/A',
      cidr,
    });
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (result) { clipboardWrite(`Address: ${result.address}/${result.cidr}\nNetwork: ${result.network}\nBroadcast: ${result.broadcast}\nMask: ${result.mask}\nHosts: ${result.hosts}\nRange: ${result.range}`).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } }); } };
  return (
    <Section title="Subnet Calculator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {cidrPresets.map(c => <button key={c} onClick={() => calc(c)} className="px-2.5 py-1 text-xs rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 border border-sky-500/20 transition-colors">{c}</button>)}
      </div>
      <Input label="IP/CIDR" value={input} onChange={v => { setInput(v); setResult(null); }} placeholder="192.168.1.0/24" />
      <button onClick={() => calc()} className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors">Calculate</button>
      {result && (
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Address', value: `${result.address}/${result.cidr}`, color: 'border-l-sky-400' },
              { label: 'Network', value: result.network, color: 'border-l-blue-400' },
              { label: 'Broadcast', value: result.broadcast, color: 'border-l-indigo-400' },
              { label: 'Mask', value: result.mask, color: 'border-l-violet-400' },
            ].map(item => (
              <div key={item.label} className={`bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 ${item.color}`}>
                <span className="text-xs text-[var(--text-muted)]">{item.label}</span>
                <p className="font-mono text-sm text-[var(--text-primary)]">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-emerald-400 flex items-center justify-between">
            <div><span className="text-xs text-[var(--text-muted)]">Usable Hosts</span><p className="font-mono text-sm text-[var(--text-primary)]">{result.hosts.toLocaleString()}</p></div>
            <div className="text-right"><span className="text-xs text-[var(--text-muted)]">Range</span><p className="font-mono text-xs text-[var(--text-primary)]">{result.range}</p></div>
          </div>
          <button onClick={copy} className="px-3 py-1.5 text-xs bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy All'}</button>
        </div>
      )}
    </Section>
  );
}


export function SubnetVisualizer() {
  const [input, setInput] = useState('');
  const [viz, setViz] = useState<{ ip: string; mask: string; network: string; cidr: number } | null>(null);
  const cidrPresets = ['10.0.0.0/8', '192.168.1.0/24', '172.16.0.0/12'];
  const visualize = (cidrInput?: string) => {
    const inp = cidrInput !== undefined ? cidrInput : input;
    if (cidrInput !== undefined) setInput(inp);
    const [ipStr = "", cidrStr] = inp.split('/');
    const cidr = parseInt(cidrStr || '24');
    const octets = ipStr.split('.').map(Number);
    if (octets.length !== 4 || octets.some(o => isNaN(o))) return;
    const ip = ((octets[0]! << 24) | (octets[1]! << 16) | (octets[2]! << 8) | octets[3]!) >>> 0;
    const mask = ~(2 ** (32 - cidr) - 1) >>> 0;
    const toBin = (n: number) => n.toString(2).padStart(32, '0').replace(/(.{8})/g, '$1.').slice(0, -1);
    setViz({ ip: toBin(ip), mask: toBin(mask), network: `${'1'.repeat(cidr)}${'0'.repeat(32 - cidr)}`.replace(/(.{8})/g, '$1.').slice(0, -1), cidr });
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (viz) { clipboardWrite(`IP: ${viz.ip}\nMask: ${viz.mask}\nNetwork Bits: ${viz.cidr}\nHost Bits: ${32 - viz.cidr}`).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } }); } };
  return (
    <Section title="Subnet Visualizer">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {cidrPresets.map(c => <button key={c} onClick={() => visualize(c)} className="px-2.5 py-1 text-xs rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 transition-colors">{c}</button>)}
      </div>
      <Input label="IP/CIDR" value={input} onChange={v => { setInput(v); setViz(null); }} placeholder="192.168.1.0/24" />
      <button onClick={() => visualize()} className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm font-medium transition-colors">Visualize</button>
      {viz && (
        <div className="mt-4 space-y-3">
          <div className="bg-[var(--bg-surface)] rounded-xl p-4 border-l-4 border-cyan-400">
            <div className="space-y-2 font-mono text-xs">
              <div><span className="text-[var(--text-muted)]">IP </span><span className="text-[var(--text-primary)]">{viz.ip}</span></div>
              <div><span className="text-[var(--text-muted)]">Mask </span><span className="text-[var(--text-primary)]">{viz.mask}</span></div>
              <div className="flex items-center gap-1">
                <span className="text-[var(--text-muted)]">Net </span>
                <span className="text-emerald-600 dark:text-emerald-400">{viz.network.substring(0, viz.cidr + Math.floor(viz.cidr / 8))}</span>
                <span className="text-[var(--text-muted)]">{viz.network.substring(viz.cidr + Math.floor(viz.cidr / 8))}</span>
              </div>
            </div>
          </div>
          <div className="bg-[var(--bg-surface)] rounded-xl p-4">
            <div className="flex items-center gap-1 text-lg tracking-wide">
              <span className="text-emerald-500">{'█'.repeat(viz.cidr)}</span><span className="text-zinc-300 dark:text-[var(--text-secondary)]">{'█'.repeat(32 - viz.cidr)}</span>
            </div>
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
              <span>{viz.cidr} network bits</span>
              <span>{32 - viz.cidr} host bits</span>
            </div>
          </div>
          <button onClick={copy} className="px-3 py-1.5 text-xs bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}


const DNS_RECORD_TYPES = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME'] as const;

interface DnsRecords {
  domain: string;
  records: { type: string; values: string[] }[];
  failed: string[];
}

export function DnsLookupGenerator() {
  const [domain, setDomain] = useState('');
  const [results, setResults] = useState<DnsRecords | null>(null);
  const [looking, setLooking] = useState(false);
  const [error, setError] = useState('');
  const domainPresets = ['example.com', 'google.com', 'cloudflare.com'];

  const gen = async () => {
    const raw = domain.trim().toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]!;
    if (!raw || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(raw)) {
      setError('Enter a valid domain, e.g. example.com');
      setResults(null);
      return;
    }
    setLooking(true);
    setError('');
    setResults(null);
    try {
      // Real DNS answers via DNS-over-HTTPS (no raw DNS in browsers).
      const records: DnsRecords['records'] = [];
      const failed: string[] = [];
      for (const type of DNS_RECORD_TYPES) {
        try {
          const data = await fetchJson(
            `https://dns.google/resolve?name=${encodeURIComponent(raw)}&type=${type}`, 10000,
          ) as { Status?: number; Answer?: { data?: string }[] };
          if (data?.Status === 0 && Array.isArray(data?.Answer) && data.Answer.length > 0) {
            const values = [...new Set(data.Answer.map(a => String(a?.data || '').replace(/^"|"$/g, '')))];
            records.push({ type, values });
          }
        } catch {
          failed.push(type);
        }
      }
      setResults({ domain: raw, records, failed });
      if (records.length === 0) {
        setError(failed.length > 0
          ? `No records returned — DNS-over-HTTPS may be blocked or rate-limited. Retry in a minute.`
          : `No A/AAAA/MX/NS/TXT/CNAME records found for ${raw}.`);
      }
    } finally {
      setLooking(false);
    }
  };

  const copyAll = () => {
    if (!results) return;
    const text = [`DNS Records for ${results.domain}`, '',
      ...results.records.flatMap(r => [`${r.type}:`, ...r.values.map(v => `  ${v}`), '']),
    ].join('\n');
    clipboardWrite(text).then(ok => {
      if (ok) toast.success('Records copied!');
      else toast.error('Copy blocked by the browser — select the text manually.');
    });
  };

  const [copied, setCopied] = useState(false);
  const copy = () => { if (results) { copyAll(); setCopied(true); setTimeout(() => setCopied(false), 1500); } };
  return (
    <Section title="DNS Lookup Record Generator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {domainPresets.map(d => <button key={d} onClick={() => { setDomain(d); }} className="px-2.5 py-1 text-xs rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 transition-colors">{d}</button>)}
      </div>
      <Input label="Domain" value={domain} onChange={v => { setDomain(v); setResults(null); setError(''); }} placeholder="example.com" />
      <button onClick={gen} disabled={looking} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">{looking ? 'Looking up…' : 'Generate Records'}</button>
      {error && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-red-500/40">
          <p className="text-sm text-[var(--text-primary)]">{error}</p>
        </div>
      )}
      {results && results.records.length > 0 && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-orange-400 space-y-3">
          <div className="flex items-center gap-3">
            <p className="text-sm font-bold text-[var(--text-primary)]">DNS Records for {results.domain}</p>
            <button onClick={copy} className="ml-auto px-3 py-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          {results.records.map(r => (
            <div key={r.type}>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">{r.type}</p>
              <pre className="whitespace-pre-wrap text-sm font-mono text-[var(--text-primary)] break-all">{r.values.join('\n')}</pre>
            </div>
          ))}
          <p className="text-xs text-[var(--text-muted)]">Live answers via DNS-over-HTTPS. A missing type means no records published — not an error.</p>
        </div>
      )}
    </Section>
  );
}


interface IpInfo {
  ip: string;
  hostname: string;
  city: string;
  region: string;
  country: string;
  org: string;
}

export function IpReputationChecker() {
  const [ip, setIp] = useState('');
  const [info, setInfo] = useState<IpInfo | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const ipPresets = ['8.8.8.8', '1.1.1.1', '185.220.101.0'];
  const check = async () => {
    const target = ip.trim();
    if (!target || !/^[a-zA-Z0-9.:]+$/.test(target)) {
      setError('Enter an IP address or hostname, e.g. 8.8.8.8');
      setInfo(null);
      return;
    }
    setChecking(true);
    setError('');
    setInfo(null);
    try {
      // Real geo/ASN/org data via ipinfo.io (browser-friendly, no key).
      // Abuse/blacklist verdicts need keyed APIs (AbuseIPDB, VirusTotal),
      // so those are honest link-outs, not faked results.
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      let data: Record<string, string>;
      try {
        const res = await fetch(`https://ipinfo.io/${encodeURIComponent(target)}/json`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
      } finally {
        clearTimeout(t);
      }
      if (data?.bogon) {
        setError(`${target} is a bogon (private/reserved) address — no public reputation exists.`);
        return;
      }
      setInfo({
        ip: data?.ip || target,
        hostname: data?.hostname || '—',
        city: data?.city || '—',
        region: data?.region || '—',
        country: data?.country || '—',
        org: data?.org || '—',
      });
    } catch {
      setError('Lookup failed — ipinfo.io may be rate-limiting. Wait a minute and retry, or use the direct links below.');
    } finally {
      setChecking(false);
    }
  };
  const target = ip.trim();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!info) return;
    clipboardWrite(`IP: ${info.ip}\nHostname: ${info.hostname}\nLocation: ${info.city}, ${info.region}, ${info.country}\nOrg: ${info.org}`).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } });
  };
  const rows: [string, string][] = info ? [
    ['IP', info.ip],
    ['Hostname', info.hostname],
    ['Location', [info.city, info.region, info.country].filter(v => v !== '—').join(', ') || '—'],
    ['ASN / Org', info.org],
  ] : [];
  return (
    <Section title="IP Reputation Checker">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {ipPresets.map(i => <button key={i} onClick={() => { setIp(i); }} className="px-2.5 py-1 text-xs rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-400 hover:bg-slate-500/20 border border-slate-500/20 transition-colors">{i}</button>)}
      </div>
      <Input label="IP Address" value={ip} onChange={v => { setIp(v); setInfo(null); setError(''); }} placeholder="8.8.8.8" />
      <button onClick={check} disabled={checking} className="px-5 py-2.5 bg-slate-500 hover:bg-slate-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">{checking ? 'Checking…' : 'Check Reputation'}</button>
      {error && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-red-500/40">
          <p className="text-sm text-[var(--text-primary)]">{error}</p>
        </div>
      )}
      {info && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-slate-400 space-y-2">
          {rows.map(([k, v]) => (
            <div key={k} className="flex flex-wrap gap-2 text-sm">
              <span className="w-24 shrink-0 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider pt-0.5">{k}</span>
              <span className="flex-1 min-w-0 font-mono text-[var(--text-primary)] break-all">{v}</span>
            </div>
          ))}
          <button onClick={copy} className="mt-1 px-3 py-1.5 text-xs bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
      {target && (
        <div className="mt-3 p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
          <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Abuse & blacklist verdicts (need an account — open directly)</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              [`https://www.abuseipdb.com/check/${encodeURIComponent(target)}`, 'AbuseIPDB'],
              [`https://www.virustotal.com/gui/ip-address/${encodeURIComponent(target)}`, 'VirusTotal'],
              [`https://ipinfo.io/${encodeURIComponent(target)}`, 'ipinfo.io'],
            ].map(([u, label]) => (
              <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--accent)] hover:underline">{label}</a>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}


export function UrlSanitizer() {
  const [url, setUrl] = useState('');
  const [original, setOriginal] = useState('');
  const [sanitized, setSanitized] = useState('');
  const [removed, setRemoved] = useState<string[]>([]);
  const urlPresets = [
    { label: 'UTM', v: 'https://example.com/page?utm_source=twitter&utm_medium=social&ref=spam&id=12345' },
    { label: 'Facebook', v: 'https://example.com/post?fbclid=IwAR123&utm_campaign=spring&gclid=Cjw123' },
    { label: 'Clean', v: 'https://example.com/page?id=12345' },
  ];
  const sanitize = (u?: string) => {
    const txt = u !== undefined ? u : url;
    if (u !== undefined) setUrl(txt);
    try {
      const parsed = new URL(txt);
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ref', 'source', 'mc_cid', 'mc_eid', 'yclid', 'igshid', 'trk', 'sc_campaign', 'sc_channel', 'sc_content', 'sc_geo', 'sc_country'];
      const removedParams = trackingParams.filter(p => parsed.searchParams.has(p));
      removedParams.forEach(p => parsed.searchParams.delete(p));
      setOriginal(txt);
      setSanitized(parsed.toString());
      setRemoved(removedParams);
    } catch { setSanitized('Error: Invalid URL'); setRemoved([]); }
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (sanitized) { clipboardWrite(sanitized).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } }); } };
  return (
    <Section title="URL Sanitizer">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {urlPresets.map(p => <button key={p.label} onClick={() => sanitize(p.v)} className="px-2.5 py-1 text-xs rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 border border-sky-500/20 transition-colors">{p.label}</button>)}
      </div>
      <Input label="URL to clean" value={url} onChange={v => { setUrl(v); setSanitized(''); setRemoved([]); }} placeholder="https://example.com/page?utm_source=twitter" />
      <button onClick={() => sanitize()} className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors">Sanitize</button>
      {sanitized && (
        <div className="mt-4 space-y-3">
          <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-red-400">
            <span className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Original</span>
            <p className="text-sm font-mono text-[var(--text-primary)] break-all">{original}</p>
          </div>
          <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-green-400">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-[var(--text-muted)]">Sanitized</span>
              <button onClick={copy} className="px-2 py-0.5 text-xs bg-sky-500 hover:bg-sky-600 text-white rounded transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
            </div>
            <p className="text-sm font-mono text-[var(--text-primary)] break-all">{sanitized}</p>
          </div>
          {removed.length > 0 && (
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-yellow-400">
              <span className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Removed Parameters ({removed.length})</span>
              <div className="flex flex-wrap gap-1">{removed.map(r => <span key={r} className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">{r}</span>)}</div>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}


const COMMON_SUBDOMAINS = [
  'www', 'api', 'mail', 'admin', 'dev', 'staging', 'blog', 'cdn',
  'app', 'portal', 'support', 'docs', 'shop', 'forum', 'status', 'vpn',
  'ftp', 'smtp', 'test', 'demo', 'beta', 'm', 'mobile', 'secure',
];

interface SubdomainResults {
  fromCerts: string[];
  live: string[];
  probed: number;
}

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

export function SubdomainFinder() {
  const [domain, setDomain] = useState('');
  const [results, setResults] = useState<SubdomainResults | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const domainPresets = ['example.com', 'google.com', 'cloudflare.com'];

  const find = async () => {
    const raw = domain.trim().toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]!;
    if (!raw || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(raw)) {
      setError('Enter a valid domain, e.g. example.com');
      setResults(null);
      return;
    }
    setScanning(true);
    setError('');
    setResults(null);
    try {
      // Passive enumeration via Certificate Transparency (crt.sh allows
      // browser requests). May be slow or rate-limited — handled below.
      const certData = await fetchJson(
        `https://crt.sh/?q=%25.${encodeURIComponent(raw)}&output=json`, 25000,
      ) as { name_value?: string }[];
      const seen = new Set<string>();
      for (const entry of Array.isArray(certData) ? certData : []) {
        for (const name of String(entry?.name_value || '').split('\n')) {
          const n = name.trim().toLowerCase().replace(/^\*\./, '');
          if ((n === raw || n.endsWith(`.${raw}`)) && !seen.has(n)) seen.add(n);
        }
      }
      const fromCerts = [...seen].sort().slice(0, 500);

      // Live probing of common names via DNS-over-HTTPS (no raw DNS in
      // browsers). Batched to stay polite; a miss means "no A record",
      // not "doesn't exist" (could be CNAME-only or firewalled).
      const live: string[] = [];
      const BATCH = 6;
      for (let i = 0; i < COMMON_SUBDOMAINS.length; i += BATCH) {
        const batch = COMMON_SUBDOMAINS.slice(i, i + BATCH);
        const checks = await Promise.all(batch.map(async (sub) => {
          try {
            const data = await fetchJson(
              `https://dns.google/resolve?name=${encodeURIComponent(`${sub}.${raw}`)}&type=A`, 10000,
            ) as { Status?: number; Answer?: unknown[] };
            return data?.Status === 0 && Array.isArray(data?.Answer) && data.Answer.length > 0 ? `${sub}.${raw}` : null;
          } catch {
            return null;
          }
        }));
        for (const hit of checks) if (hit) live.push(hit);
      }
      setResults({ fromCerts, live, probed: COMMON_SUBDOMAINS.length });
      if (fromCerts.length === 0 && live.length === 0) {
        setError(`No subdomains found for ${raw} — it may have no public certificates yet, or crt.sh is rate-limiting. Try again in a minute.`);
      }
    } catch {
      setError('Lookup failed — crt.sh may be down or rate-limiting. Wait a minute and retry.');
    } finally {
      setScanning(false);
    }
  };

  const copyAll = () => {
    if (!results) return;
    const all = [...new Set([...results.live, ...results.fromCerts])].join('\n');
    clipboardWrite(all).then(ok => {
      if (ok) toast.success('Subdomains copied!');
      else toast.error('Copy blocked by the browser — select the text manually.');
    });
  };

  const [copied, setCopied] = useState(false);
  const copy = () => { if (results) { copyAll(); setCopied(true); setTimeout(() => setCopied(false), 1500); } };
  return (
    <Section title="Subdomain Finder">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {domainPresets.map(d => <button key={d} onClick={() => { setDomain(d); }} className="px-2.5 py-1 text-xs rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 border border-[var(--accent)]/20 transition-colors">{d}</button>)}
      </div>
      <Input label="Domain" value={domain} onChange={v => { setDomain(v); setResults(null); setError(''); }} placeholder="example.com" />
      <button onClick={find} disabled={scanning} className="px-5 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">{scanning ? 'Scanning…' : 'Find Subdomains'}</button>
      {error && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-red-500/40">
          <p className="text-sm text-[var(--text-primary)]">{error}</p>
        </div>
      )}
      {results && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-[var(--accent)]/20 space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-[var(--text-primary)]"><strong>{results.live.length}</strong> live <span className="text-[var(--text-muted)]">({results.probed} common names probed)</span></span>
            <span className="text-[var(--text-primary)]"><strong>{results.fromCerts.length}</strong> in certificates</span>
            <button onClick={copy} className="ml-auto px-3 py-1.5 text-xs bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy all'}</button>
          </div>
          {results.live.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Live — DNS resolves</p>
              <pre className="whitespace-pre-wrap text-sm font-mono text-[var(--text-primary)]">{results.live.join('\n')}</pre>
            </div>
          )}
          {results.fromCerts.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Seen in public certificates (may include retired names)</p>
              <pre className="whitespace-pre-wrap text-sm font-mono text-[var(--text-primary)] break-all">{results.fromCerts.slice(0, 100).join('\n')}{results.fromCerts.length > 100 ? `\n…plus ${results.fromCerts.length - 100} more (Copy all to get everything)` : ''}</pre>
            </div>
          )}
          <p className="text-xs text-[var(--text-muted)]">Sources: Certificate Transparency via crt.sh plus live DNS checks of {COMMON_SUBDOMAINS.length} common names. A name missing here can still exist (CNAME-only, unlisted, or behind a firewall) — for exhaustive recon use Amass or Sublist3r.</p>
        </div>
      )}
    </Section>
  );
}

