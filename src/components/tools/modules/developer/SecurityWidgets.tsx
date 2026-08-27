"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { Copy, Download } from 'lucide-react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full bg-[var(--bg-overlay)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
      {children}
    </div>
  );
}

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

  const presets = [
    { label: 'Sample with Secrets', apply: () => setInput("const config = {\n  apiKey: 'sk-abc123def456ghi789jkl012mno345pqr',\n  password: 'supersecret123',\n  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',\n  github: 'ghp_abcdefghijklmnopqrstuvwxyz123456'\n};") },
  ];

  const copyOutput = () => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Copied to clipboard!');
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scan-results.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };
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
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
      <Section title="Secret Scanner">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 mb-4">
            {presets.map((p) => (
              <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                {p.label}
              </button>
            ))}
          </div>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={6} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50 resize-y" placeholder="Paste text or code to scan for API keys, tokens, and secrets..." />
          <button onClick={scan} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Scan for Secrets</button>
          {output && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <button onClick={copyOutput} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg hover:text-[var(--text-primary)] transition-colors">
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
                <button onClick={downloadOutput} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
              <pre className="p-4 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">{output}</pre>
            </div>
          )}
        </div>
      </Section>
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
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
      <Section title="security.txt Generator">
        <div className="space-y-3">
          <div className="space-y-2">
            <div><label className="block text-sm font-medium mb-1">Contact</label><input type="text" value={contact} onChange={e => setContact(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
            <div><label className="block text-sm font-medium mb-1">Policy URL</label><input type="text" value={policy} onChange={e => setPolicy(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
            <div><label className="block text-sm font-medium mb-1">Encryption Key URL</label><input type="text" value={encryption} onChange={e => setEncryption(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
            <div><label className="block text-sm font-medium mb-1">Expires</label><input type="text" value={expires} onChange={e => setExpires(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
          </div>
          <button onClick={generate} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Generate security.txt</button>
          {output && <div><pre className="p-4 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono whitespace-pre-wrap">{output}</pre><CopyBtn text={output} label="security.txt" /></div>}
        </div>
      </Section>
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
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
      <Section title="robots.txt Validator">
        <div className="space-y-3">
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={6} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50 resize-y" placeholder="User-agent: *\nAllow: /" />
          <button onClick={validate} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Validate</button>
          {output && <pre className="p-4 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono whitespace-pre-wrap">{output}</pre>}
        </div>
      </Section>
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
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
      <Section title="DNS Record Validator">
        <div className="space-y-3">
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={5} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50 resize-y" placeholder="example.com. 3600 A 192.168.1.1" />
          <button onClick={validate} className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg">Validate Records</button>
          {output && <pre className="p-4 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">{output}</pre>}
        </div>
      </Section>
    </div>
  );
}
