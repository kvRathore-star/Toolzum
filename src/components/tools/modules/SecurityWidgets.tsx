"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const inputClass = "w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono";
const btnClass = "w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg text-sm transition-colors";
const resultClass = "p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm whitespace-pre-wrap font-mono";

const SECRET_PATTERNS: [RegExp, string][] = [
  [/sk-[a-zA-Z0-9]{20,}/g, 'Stripe Secret Key'],
  [/ghp_[a-zA-Z0-9]{36,}/g, 'GitHub Personal Access Token'],
  [/gho_[a-zA-Z0-9]{36,}/g, 'GitHub OAuth Token'],
  [/xox[baprs]-[a-zA-Z0-9-]{24,}/g, 'Slack Token'],
  [/AIza[0-9A-Za-z_-]{35}/g, 'Google API Key'],
  [/AKIA[0-9A-Z]{16}/g, 'AWS Access Key'],
  [/-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/g, 'Private Key'],
  [/eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, 'JWT Token'],
  [/sk-[a-fA-F0-9]{32,}/g, 'OpenAI API Key'],
  [/pk-[a-fA-F0-9]{32,}/g, 'Publishable Key'],
  [/SG\.[a-zA-Z0-9_-]{22,}\.[a-zA-Z0-9_-]{22,}/g, 'SendGrid Key'],
  [/api[-_]?key['":\s=]+[a-zA-Z0-9]{16,}/gi, 'Potential API Key in config'],
  [/password['":\s=]+[^'"\s,]{6,}/gi, 'Potential password in config'],
  [/secret['":\s=]+[^'"\s,]{6,}/gi, 'Potential secret in config'],
];

function CopyBtn({ text, label }: { text: string; label?: string }) {
  return (
    <button onClick={() => { clipboardWrite(text); toast.success(label ? `${label} copied!` : 'Copied!'); }}
      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1 mt-2">Copy</button>
  );
}

export function SecretScanner() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const scan = () => {
    if (!input.trim()) { toast.error('Paste text to scan'); return; }
    const findings: string[] = [];
    SECRET_PATTERNS.forEach(([re, label]) => {
      re.lastIndex = 0;
      const matches = input.match(re);
      if (matches) matches.forEach(m => findings.push(`${label}: ${m.slice(0, 20)}... (len: ${m.length})`));
    });
    if (findings.length) {
      setOutput(`Found ${findings.length} potential secret(s):\n${findings.join('\n')}`);
      toast.error(`${findings.length} secret(s) detected`);
    } else {
      setOutput('No common secret patterns detected');
      toast.success('Clean scan');
    }
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Secret Scanner</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={6} className={`${inputClass} resize-y`} placeholder="Paste text or code to scan for API keys, tokens, and secrets..." />
      <button onClick={scan} className={btnClass}>Scan for Secrets</button>
      {output && <pre className={resultClass + ' max-h-48 overflow-y-auto'}>{output}</pre>}
    </div>
  );
}

export function SecurityTxtGenerator() {
  const [contact, setContact] = useState('security@example.com');
  const [policy, setPolicy] = useState('https://example.com/security-policy.html');
  const [encryption, setEncryption] = useState('https://example.com/pgp-key.txt');
  const [expires, setExpires] = useState('2025-12-31T23:59:00Z');
  const [output, setOutput] = useState('');
  const generate = () => {
    const lines = [
      `Contact: mailto:${contact}`,
      `Preferred-Languages: en`,
      `Canonical: https://example.com/.well-known/security.txt`,
      `Policy: ${policy}`,
      encryption && `Encryption: ${encryption}`,
      `Expires: ${expires}`,
    ].filter(Boolean);
    setOutput(lines.join('\n'));
    toast.success('security.txt generated!');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">security.txt Generator</h1>
      <div className="space-y-2">
        <div><label className="block text-sm font-medium mb-1">Contact</label><input type="text" value={contact} onChange={e => setContact(e.target.value)} className={inputClass} /></div>
        <div><label className="block text-sm font-medium mb-1">Policy URL</label><input type="text" value={policy} onChange={e => setPolicy(e.target.value)} className={inputClass} /></div>
        <div><label className="block text-sm font-medium mb-1">Encryption Key URL</label><input type="text" value={encryption} onChange={e => setEncryption(e.target.value)} className={inputClass} /></div>
        <div><label className="block text-sm font-medium mb-1">Expires</label><input type="text" value={expires} onChange={e => setExpires(e.target.value)} className={inputClass} /></div>
      </div>
      <button onClick={generate} className={btnClass}>Generate security.txt</button>
      {output && <div><pre className={resultClass}>{output}</pre><CopyBtn text={output} label="security.txt" /></div>}
    </div>
  );
}

export function RobotsTxtValidator() {
  const [input, setInput] = useState('User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://example.com/sitemap.xml');
  const [output, setOutput] = useState('');
  const validate = () => {
    if (!input.trim()) { toast.error('Enter robots.txt content'); return; }
    const lines = input.split('\n');
    const issues: string[] = [];
    const directives = ['user-agent', 'disallow', 'allow', 'sitemap', 'crawl-delay', 'host', 'clean-param'];
    lines.forEach((l, i) => {
      const trimmed = l.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const colon = trimmed.indexOf(':');
      if (colon < 0) { issues.push(`Line ${i + 1}: Missing colon — "${trimmed}"`); return; }
      const dir = trimmed.slice(0, colon).trim().toLowerCase();
      if (!directives.includes(dir)) issues.push(`Line ${i + 1}: Unknown directive "${dir}"`);
    });
    const hasUA = lines.some(l => l.trim().toLowerCase().startsWith('user-agent'));
    if (!hasUA) issues.push('Missing User-agent directive');
    setOutput(issues.length ? issues.join('\n') : `Valid robots.txt (${lines.length} lines)`);
    toast.success(issues.length ? `Found ${issues.length} issue(s)` : 'Valid!');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">robots.txt Validator</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={6} className={`${inputClass} resize-y`} placeholder="User-agent: *\nAllow: /" />
      <button onClick={validate} className={btnClass}>Validate</button>
      {output && <pre className={resultClass}>{output}</pre>}
    </div>
  );
}

export function DnsRecordValidator() {
  const [input, setInput] = useState('example.com. 3600 A 192.168.1.1\nexample.com. 3600 AAAA 2001:db8::1\nexample.com. 3600 MX mail.example.com.');
  const [output, setOutput] = useState('');
  const validate = () => {
    if (!input.trim()) { toast.error('Enter DNS records'); return; }
    const lines = input.split('\n');
    const results: string[] = [];
    const validTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'SRV', 'CAA', 'PTR'];
    lines.forEach((l, i) => {
      const parts = l.trim().split(/\s+/);
      if (parts.length < 2) { results.push(`Line ${i + 1}: Too few parts`); return; }
      const type = parts[parts.length - 2]?.toUpperCase();
      const val = parts[parts.length - 1];
      if (!validTypes.includes(type)) { results.push(`Line ${i + 1}: Unknown type "${type}"`); }
      if (type === 'A' && !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(val)) results.push(`Line ${i + 1}: Invalid A record IP`);
      if (type === 'AAAA' && !/^[0-9a-f:]+$/i.test(val)) results.push(`Line ${i + 1}: Invalid AAAA record`);
      if (type === 'MX' && !val.includes('.')) results.push(`Line ${i + 1}: Invalid MX record`);
      results.push(`Line ${i + 1}: ${type} ${val} \u2713`);
    });
    setOutput(results.join('\n'));
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">DNS Record Validator</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={5} className={`${inputClass} resize-y`} placeholder="example.com. 3600 A 192.168.1.1" />
      <button onClick={validate} className={btnClass}>Validate Records</button>
      {output && <pre className={`${resultClass} max-h-48 overflow-y-auto`}>{output}</pre>}
    </div>
  );
}
