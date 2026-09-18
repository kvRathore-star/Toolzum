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
                <span className="text-xs text-zinc-500">{item.label}</span>
                <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-emerald-400 flex items-center justify-between">
            <div><span className="text-xs text-zinc-500">Usable Hosts</span><p className="font-mono text-sm text-zinc-900 dark:text-zinc-100">{result.hosts.toLocaleString()}</p></div>
            <div className="text-right"><span className="text-xs text-zinc-500">Range</span><p className="font-mono text-xs text-zinc-900 dark:text-zinc-100">{result.range}</p></div>
          </div>
          <button onClick={copy} className="px-3 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy All'}</button>
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
              <div><span className="text-zinc-500">IP </span><span className="text-zinc-800 dark:text-zinc-200">{viz.ip}</span></div>
              <div><span className="text-zinc-500">Mask </span><span className="text-zinc-800 dark:text-zinc-200">{viz.mask}</span></div>
              <div className="flex items-center gap-1">
                <span className="text-zinc-500">Net </span>
                <span className="text-emerald-600 dark:text-emerald-400">{viz.network.substring(0, viz.cidr + Math.floor(viz.cidr / 8))}</span>
                <span className="text-zinc-400">{viz.network.substring(viz.cidr + Math.floor(viz.cidr / 8))}</span>
              </div>
            </div>
          </div>
          <div className="bg-[var(--bg-surface)] rounded-xl p-4">
            <div className="flex items-center gap-1 text-lg tracking-wide">
              <span className="text-emerald-500">{'█'.repeat(viz.cidr)}</span><span className="text-zinc-300 dark:text-zinc-600">{'█'.repeat(32 - viz.cidr)}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>{viz.cidr} network bits</span>
              <span>{32 - viz.cidr} host bits</span>
            </div>
          </div>
          <button onClick={copy} className="px-3 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}


export function DnsLookupGenerator() {
  const [domain, setDomain] = useState('');
  const [output, setOutput] = useState('');
  const domainPresets = ['example.com', 'google.com', 'cloudflare.com'];
  const gen = () => {
    if (!domain.trim()) { setOutput('Please enter a domain'); return; }
    setOutput(`DNS Records for ${domain}

⚠ Server-side DNS lookup not available in browser
For real DNS lookup, use:

  dig ${domain} ANY
  dig ${domain} A
  dig ${domain} AAAA
  dig ${domain} MX
  dig ${domain} NS
  dig ${domain} TXT
  dig ${domain} CNAME

Expected record types for a typical domain:
• A / AAAA — IP address(es)
• NS — Nameservers
• MX — Mail servers
• TXT — SPF, DKIM, DMARC
• CNAME — Aliases (if any)`);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (output) { clipboardWrite(output).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } }); } };
  return (
    <Section title="DNS Lookup Record Generator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {domainPresets.map(d => <button key={d} onClick={() => { setDomain(d); }} className="px-2.5 py-1 text-xs rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 transition-colors">{d}</button>)}
      </div>
      <Input label="Domain" value={domain} onChange={setDomain} placeholder="example.com" />
      <button onClick={gen} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">Generate Records</button>
      {output && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-orange-400">
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200">{output}</pre>
          <button onClick={copy} className="mt-3 px-3 py-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}


export function IpReputationChecker() {
  const [ip, setIp] = useState('');
  const [output, setOutput] = useState('');
  const ipPresets = ['8.8.8.8', '1.1.1.1', '185.220.101.0'];
  const check = () => {
    if (!ip.trim()) { setOutput('Please enter an IP address'); return; }
    setOutput(`IP Reputation Check for ${ip}

⚠ Server-side API access not available in browser

For real IP reputation lookup, use:
• https://www.abuseipdb.com/check/${ip}
• https://www.virustotal.com/gui/ip-address/${ip}
• https://ipinfo.io/${ip}

To check from CLI:
  curl -s "https://ipinfo.io/${ip}/json" | jq .
  curl -s "https://www.virustotal.com/api/v3/ip_addresses/${ip}" -H "x-apikey: YOUR_KEY"

Common checks:
• Blacklist status (Spamhaus, Barracuda, etc.)
• Abuse reports
• Geolocation
• ASN / ISP
• Proxy/VPN detection`);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (output) { clipboardWrite(output).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } }); } };
  return (
    <Section title="IP Reputation Checker">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {ipPresets.map(i => <button key={i} onClick={() => { setIp(i); }} className="px-2.5 py-1 text-xs rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-400 hover:bg-slate-500/20 border border-slate-500/20 transition-colors">{i}</button>)}
      </div>
      <Input label="IP Address" value={ip} onChange={v => { setIp(v); setOutput(''); }} placeholder="8.8.8.8" />
      <button onClick={check} className="px-5 py-2.5 bg-slate-500 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors">Check Reputation</button>
      {output && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-slate-400">
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200">{output}</pre>
          <button onClick={copy} className="mt-3 px-3 py-1.5 text-xs bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
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
            <span className="text-xs font-semibold text-zinc-500 block mb-1">Original</span>
            <p className="text-sm font-mono text-zinc-800 dark:text-zinc-200 break-all">{original}</p>
          </div>
          <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-green-400">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-zinc-500">Sanitized</span>
              <button onClick={copy} className="px-2 py-0.5 text-xs bg-sky-500 hover:bg-sky-600 text-white rounded transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
            </div>
            <p className="text-sm font-mono text-zinc-800 dark:text-zinc-200 break-all">{sanitized}</p>
          </div>
          {removed.length > 0 && (
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-yellow-400">
              <span className="text-xs font-semibold text-zinc-500 block mb-1">Removed Parameters ({removed.length})</span>
              <div className="flex flex-wrap gap-1">{removed.map(r => <span key={r} className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">{r}</span>)}</div>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}


export function SubdomainFinder() {
  const [domain, setDomain] = useState('');
  const [output, setOutput] = useState('');
  const domainPresets = ['example.com', 'google.com', 'cloudflare.com'];
  const find = () => {
    if (!domain.trim()) { setOutput('Please enter a domain'); return; }
    setOutput(`Subdomain Finder for ${domain}

⚠ Server-side API access not available in browser

For real subdomain enumeration, use:

  # Passive reconnaissance:
  curl -s "https://crt.sh/?q=%25.${domain}&output=json" | jq -r '.[].name_value' | sort -u

  # Using Sublist3r:
  sublist3r -d ${domain}

  # Using Amass:
  amass enum -d ${domain}

  # DNS brute-force:
  for sub in www api mail admin dev; do
    host "\$sub.${domain}" && echo "\$sub.${domain}"
  done

Common subdomains to check:
• www, api, mail, admin
• dev, staging, blog, cdn
• app, portal, support, docs
• git, jenkins, monitor, status`);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (output) { clipboardWrite(output).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } }); } };
  return (
    <Section title="Subdomain Finder">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {domainPresets.map(d => <button key={d} onClick={() => { setDomain(d); }} className="px-2.5 py-1 text-xs rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors">{d}</button>)}
      </div>
      <Input label="Domain" value={domain} onChange={v => { setDomain(v); setOutput(''); }} placeholder="example.com" />
      <button onClick={find} className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors">Find Subdomains</button>
      {output && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-indigo-400">
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200">{output}</pre>
          <button onClick={copy} className="mt-3 px-3 py-1.5 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}

