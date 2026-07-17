"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Shield, Key, FileCheck, Globe, AlertTriangle } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'ssl' | 'security' | 'config' | 'validators';

export default function ScannerToolkit() {
  const [tab, setTab] = useState<Tab>('ssl');
  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${tab === v ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        <TabBtn v="ssl" label="SSL/TLS" icon={Shield} />
        <TabBtn v="security" label="Security" icon={Key} />
        <TabBtn v="config" label="Config Linters" icon={FileCheck} />
        <TabBtn v="validators" label="Data Validators" icon={Globe} />
      </div>
      {tab === 'ssl' && <SslTools />}
      {tab === 'security' && <SecurityTools />}
      {tab === 'config' && <ConfigTools />}
      {tab === 'validators' && <ValidatorTools />}
    </div>
  );
}

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
    <h5 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{title}</h5>
    {children}
  </div>
);

const CalcBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={onClick} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all active:scale-[0.98]">{label}</button>
);

const Inp = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div className="flex items-center gap-1.5">
    <label className="text-[10px] text-zinc-500 shrink-0">{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
  </div>
);

function SslTools() {
  const [certPem, setCertPem] = useState('-----BEGIN CERTIFICATE-----\nMIIDazCCAlMCFAjxRgAQBMBh7l7L/AcCBLa1x9WJMA0GCSqGSIb3DQEBCwUAMFkx\nCzAJBgNVBAYTAlVTMRYwFAYDVQQIDA1DYWxpZm9ybmlhMRYwFAYDVQQHDA1TYW4g\nRnJhbmNpc2NvMQswCQYDVQQLDAJJVDEQMA4GA1UEAwwHZXhhbXBsZTAeFw0yNDAx\nMDEwMDAwMDBaFw0yNTAxMDEwMDAwMDBaMFkxCzAJBgNVBAYTAlVTMRYwFAYDVQQI\nDA1DYWxpZm9ybmlhMRYwFAYDVQQHDA1TYW4gRnJhbmNpc2NvMQswCQYDVQQLDAJJ\nVDEQMA4GA1UEAwwHZXhhbXBsZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC\nggEBAK6A0iN7bT9cC5y8Vn5fFz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5\nfz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5f\nz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5fz5f\n-----END CERTIFICATE-----');
  const [certOut, setCertOut] = useState('');
  const [sslDomain, setSslDomain] = useState('');
  const [sslOut, setSslOut] = useState('');
  const [tlsCiphers, setTlsCiphers] = useState('');

  const decodeCert = () => {
    try {
      const b64 = certPem.replace(/-----BEGIN CERTIFICATE-----/, '').replace(/-----END CERTIFICATE-----/, '').replace(/\s/g, '');
      const der = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      let offset = 0;
      const readLen = (): number => { const b = der[offset++]; if (b < 0x80) return b; const n = b & 0x7f; let len = 0; for (let i = 0; i < n; i++) len = (len << 8) | der[offset++]; return len; };
      const readSeq = () => { if (der[offset++] !== 0x30) return null; return readLen(); };
      const readOid = (): string => { if (der[offset++] !== 0x06) return ''; const len = readLen(); const oid = []; for (let i = 0; i < len; i++) oid.push(der[offset++].toString()); return oid.join('.'); };
      if (readSeq() === null) { setCertOut('Invalid DER encoding'); return; }
      const certInfo = [
        `Algorithm: ${readOid()}`,
        `Serial: ${Array.from(der.slice(offset, offset + 20)).map(b => b.toString(16).padStart(2, '0')).join(':').slice(0, 40)}...`,
        `Size: ${der.length} bytes`,
        `Format: X.509 v3`,
        `Note: Full parsing requires ASN.1 library. Shown: basic structure.`,
      ];
      setCertOut(certInfo.join('\n'));
      toast.success('Certificate decoded');
    } catch { toast.error('Invalid PEM certificate'); }
  };

  const validateCert = async () => {
    if (!sslDomain.trim()) { toast.error('Enter a domain'); return; }
    try {
      const url = `https://${sslDomain.replace(/^https?:\/\//, '')}`;
      const start = Date.now();
      const res = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      const elapsed = Date.now() - start;
      setSslOut(['Domain: ' + sslDomain, 'HTTPS: ' + (res.type === 'opaque' ? 'Active (no-cors)' : 'Connected'), 'Response: ' + elapsed + 'ms', 'Protocol: TLS 1.3 (assumed)', 'Note: Client-side cert validation is limited. Use openssl s_client for full chain. Hint: ' + url].join('\n'));
      toast.success('Certificate check complete');
    } catch {
      setSslOut(['Domain: ' + sslDomain, 'HTTPS: Could not connect', 'Check: Ensure the domain has HTTPS enabled'].join('\n'));
      toast.error('Connection failed');
    }
  };

  const checkCiphers = () => {
    const allCiphers = [
      ['TLS_AES_256_GCM_SHA384', 'TLS 1.3', 'Secure'],
      ['TLS_CHACHA20_POLY1305_SHA256', 'TLS 1.3', 'Secure'],
      ['TLS_AES_128_GCM_SHA256', 'TLS 1.3', 'Secure'],
      ['TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384', 'TLS 1.2', 'Secure'],
      ['TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384', 'TLS 1.2', 'Secure'],
      ['TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305', 'TLS 1.2', 'Secure'],
      ['TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305', 'TLS 1.2', 'Secure'],
      ['TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256', 'TLS 1.2', 'Secure'],
      ['TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256', 'TLS 1.2', 'Secure'],
      ['TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA384', 'TLS 1.2', 'Moderate'],
      ['TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384', 'TLS 1.2', 'Moderate'],
      ['TLS_RSA_WITH_AES_256_GCM_SHA384', 'TLS 1.2', 'Weak (no PFS)'],
      ['TLS_RSA_WITH_AES_128_GCM_SHA256', 'TLS 1.2', 'Weak (no PFS)'],
      ['TLS_RSA_WITH_AES_256_CBC_SHA256', 'TLS 1.2', 'Weak'],
      ['TLS_RSA_WITH_3DES_EDE_CBC_SHA', 'TLS 1.2', 'Insecure'],
    ].map(([name, proto, sec]) => `${sec === 'Secure' ? '✓' : sec === 'Moderate' ? '~' : '✗'} ${name} [${proto}] — ${sec}`);
    setTlsCiphers(allCiphers.join('\n') + '\n\nModern browsers support only TLS 1.3 ciphers + ECDHE TLS 1.2.\nServer config should disable Weak/Insecure ciphers.');
    toast.success('Cipher reference loaded');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="SSL Certificate Decoder">
        <textarea value={certPem} onChange={e => setCertPem(e.target.value)}
          className="w-full h-20 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Paste PEM certificate..." />
        <CalcBtn onClick={decodeCert} label="Decode" />
      </Card>

      <Card title="SSL Certificate Validator">
        <Inp label="Domain" value={sslDomain} onChange={setSslDomain} placeholder="example.com" />
        <CalcBtn onClick={validateCert} label="Check Certificate" />
      </Card>

      <Card title="TLS Cipher Checker">
        <p className="text-[10px] text-zinc-400">Reference list of TLS ciphers and their security level</p>
        <CalcBtn onClick={checkCiphers} label="Show Cipher List" />
      </Card>

      {certOut && (
        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{certOut}</pre>
        </div>
      )}
      {sslOut && (
        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{sslOut}</pre>
        </div>
      )}
      {tlsCiphers && (
        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 max-h-48 overflow-y-auto text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{tlsCiphers}</pre>
        </div>
      )}
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

function SecurityTools() {
  const [scanInput, setScanInput] = useState('');
  const [scanOut, setScanOut] = useState('');
  const [secTxt, setSecTxt] = useState('Contact: mailto:security@example.com\nPreferred-Languages: en\nCanonical: https://example.com/.well-known/security.txt\nPolicy: https://example.com/security-policy.html\nEncryption: https://example.com/pgp-key.txt\nExpires: 2025-12-31T23:59:00Z');
  const [secTxtOut, setSecTxtOut] = useState('');
  const [robotsIn, setRobotsIn] = useState('User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /private/\nSitemap: https://example.com/sitemap.xml');
  const [robotsOut, setRobotsOut] = useState('');
  const [dnsIn, setDnsIn] = useState('');
  const [dnsOut, setDnsOut] = useState('');

  const scanSecrets = () => {
    if (!scanInput.trim()) { toast.error('Paste text to scan'); return; }
    const findings: string[] = [];
    SECRET_PATTERNS.forEach(([re, label]) => {
      re.lastIndex = 0;
      const matches = scanInput.match(re);
      if (matches) matches.forEach(m => findings.push(`⚠️ ${label}: ${m.slice(0, 20)}... (len: ${m.length})`));
    });
    if (findings.length) {
      setScanOut(`Found ${findings.length} potential secret(s):\n` + findings.join('\n'));
      toast.error(`${findings.length} secret(s) detected`);
    } else {
      setScanOut('✓ No common secret patterns detected');
      toast.success('Clean scan');
    }
  };

  const genSecTxt = () => {
    if (!secTxt.trim()) { toast.error('Fill in security.txt fields'); return; }
    setSecTxtOut(secTxt);
    toast.success('security.txt generated');
  };

  const validateRobots = () => {
    if (!robotsIn.trim()) { toast.error('Enter robots.txt content'); return; }
    const lines = robotsIn.split('\n');
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
    setRobotsOut(issues.length ? issues.join('\n') : '✓ Valid robots.txt (' + lines.length + ' lines)');
    toast.success(issues.length ? `Found ${issues.length} issue(s)` : 'Valid!');
  };

  const validateDns = () => {
    if (!dnsIn.trim()) { toast.error('Enter a DNS record'); return; }
    const lines = dnsIn.split('\n');
    const results: string[] = [];
    lines.forEach((l, i) => {
      const parts = l.trim().split(/\s+/);
      if (parts.length < 2) { results.push(`Line ${i + 1}: Too few parts`); return; }
      const type = parts[parts.length - 2]?.toUpperCase();
      const val = parts[parts.length - 1];
      const validTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'SRV', 'CAA', 'PTR'];
      if (!validTypes.includes(type)) { results.push(`Line ${i + 1}: Unknown type "${type}"`); }
      if (type === 'A' && !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(val)) results.push(`Line ${i + 1}: Invalid A record IP`);
      if (type === 'AAAA' && !/^[0-9a-f:]+$/i.test(val)) results.push(`Line ${i + 1}: Invalid AAAA record`);
      if (type === 'MX' && !val.includes('.')) results.push(`Line ${i + 1}: Invalid MX record`);
      results.push(`Line ${i + 1}: ${type} ${val} ✓`);
    });
    setDnsOut(results.join('\n'));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card title="Secret Scanner">
        <textarea value={scanInput} onChange={e => setScanInput(e.target.value)}
          className="w-full h-24 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Paste text/code to scan for secrets..." />
        <CalcBtn onClick={scanSecrets} label="Scan for Secrets" />
      </Card>

      <Card title="security.txt Generator">
        <textarea value={secTxt} onChange={e => setSecTxt(e.target.value)}
          className="w-full h-24 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Contact: mailto:security@example.com\n..." />
        <CalcBtn onClick={genSecTxt} label="Generate security.txt" />
      </Card>

      <Card title="robots.txt Validator">
        <textarea value={robotsIn} onChange={e => setRobotsIn(e.target.value)}
          className="w-full h-20 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="User-agent: *\nAllow: /" />
        <CalcBtn onClick={validateRobots} label="Validate" />
      </Card>

      <Card title="DNS Record Validator">
        <textarea value={dnsIn} onChange={e => setDnsIn(e.target.value)}
          className="w-full h-20 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="example.com. 3600 A 192.168.1.1\nexample.com. 3600 MX mail.example.com." />
        <CalcBtn onClick={validateDns} label="Validate Records" />
      </Card>

      {scanOut && (
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 max-h-40 overflow-y-auto text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{scanOut}</pre>
        </div>
      )}
      {secTxtOut && (
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{secTxtOut}</pre>
        </div>
      )}
      {robotsOut && (
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-emerald-600 dark:text-emerald-400">{robotsOut}</pre>
        </div>
      )}
      {dnsOut && (
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
          <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{dnsOut}</pre>
        </div>
      )}
    </div>
  );
}

function ConfigTools() {
  const [dockerComposeIn, setDockerComposeIn] = useState('version: "3.8"\nservices:\n  web:\n    image: nginx:latest\n    ports:\n      - "80:80"\n    volumes:\n      - ./html:/usr/share/nginx/html');
  const [dcOut, setDcOut] = useState('');
  const [dockerfileIn, setDockerfileIn] = useState('FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]');
  const [dfOut, setDfOut] = useState('');
  const [htaccessIn, setHtaccessIn] = useState('RewriteEngine On\nRewriteRule ^old$ /new [R=301,L]\nErrorDocument 404 /404.html\nOptions -Indexes');
  const [htOut, setHtOut] = useState('');
  const [k8sIn, setK8sIn] = useState('apiVersion: v1\nkind: Pod\nmetadata:\n  name: my-pod\nspec:\n  containers:\n  - name: app\n    image: nginx:latest');
  const [k8sOut, setK8sOut] = useState('');
  const [ghaIn, setGhaIn] = useState('name: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm test');
  const [ghaOut, setGhaOut] = useState('');

  const validateYaml = (text: string): { valid: boolean; issues: string[] } => {
    const lines = text.split('\n');
    const issues: string[] = [];
    let prevIndent = 0;
    lines.forEach((l, i) => {
      const trimmed = l.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const indent = l.search(/\S/);
      if (indent > prevIndent + 2) issues.push(`Line ${i + 1}: Over-indented (${indent} spaces)`);
      if (trimmed.includes('\t')) issues.push(`Line ${i + 1}: Contains tab (use spaces)`);
      if (trimmed.includes(': ') && trimmed.indexOf(':') !== trimmed.lastIndexOf(':')) issues.push(`Line ${i + 1}: Multiple colons — missing space?`);
      prevIndent = indent;
    });
    return { valid: issues.length === 0, issues };
  };

  const keyWords = (yaml: string): string[] => {
    const kws = ['apiVersion', 'kind', 'metadata', 'spec', 'services', 'image', 'ports', 'volumes', 'environment', 'configMap', 'secret', 'deployment', 'service', 'pod', 'ingress', 'configmap', 'pvc', 'namespace'];
    return kws.filter(k => yaml.includes(k));
  };

  const validateDc = () => {
    if (!dockerComposeIn.trim()) { toast.error('Enter docker-compose.yml'); return; }
    const res = validateYaml(dockerComposeIn);
    const kws = keyWords(dockerComposeIn);
    const hasServices = dockerComposeIn.includes('services:');
    const lines = [
      ...res.issues,
      hasServices ? '✓ Has services:' : '✗ Missing services:',
      kws.length ? `Keywords: ${kws.join(', ')}` : '',
    ];
    setDcOut(lines.join('\n'));
    toast.success(res.valid ? 'Valid YAML structure' : 'Issues found');
  };

  const validateDf = () => {
    if (!dockerfileIn.trim()) { toast.error('Enter Dockerfile'); return; }
    const lines = dockerfileIn.split('\n');
    const issues: string[] = [];
    const validInstructions = ['FROM', 'RUN', 'CMD', 'LABEL', 'MAINTAINER', 'EXPOSE', 'ENV', 'ADD', 'COPY', 'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD', 'STOPSIGNAL', 'HEALTHCHECK', 'SHELL'];
    lines.forEach((l, i) => {
      const t = l.trim();
      if (!t || t.startsWith('#')) return;
      const instr = t.split(/\s+/)[0].toUpperCase();
      if (!validInstructions.includes(instr)) issues.push(`Line ${i + 1}: Unknown instruction "${instr}"`);
    });
    const hasFrom = lines.some(l => l.trim().toUpperCase().startsWith('FROM'));
    if (!hasFrom) issues.push('Missing FROM instruction');
    setDfOut(issues.length ? issues.join('\n') : '✓ Valid Dockerfile (' + lines.length + ' lines)');
    toast.success(issues.length ? 'Issues found' : 'Valid!');
  };

  const validateHt = () => {
    if (!htaccessIn.trim()) { toast.error('Enter .htaccess'); return; }
    const lines = htaccessIn.split('\n');
    const issues: string[] = [];
    const validDirs = ['RewriteEngine', 'RewriteRule', 'RewriteCond', 'RewriteBase', 'ErrorDocument', 'Redirect', 'RedirectMatch', 'Header', 'SetEnv', 'Deny', 'Allow', 'Order', 'Satisfy', 'AuthType', 'AuthName', 'AuthUserFile', 'Require', 'Options', 'AddType', 'AddHandler', 'AddCharset', 'DefaultType', 'FileETag', 'Limit', 'LimitExcept', 'php_flag', 'php_value', 'SetHandler', 'SetOutputFilter'];
    lines.forEach((l, i) => {
      const t = l.trim();
      if (!t || t.startsWith('#')) return;
      const dir = t.split(/\s+/)[0];
      if (!validDirs.includes(dir) && !dir.startsWith('<') && !dir.startsWith('</')) issues.push(`Line ${i + 1}: Unknown directive "${dir}"`);
    });
    setHtOut(issues.length ? issues.join('\n') : '✓ Valid .htaccess (' + lines.length + ' lines)');
    toast.success(issues.length ? 'Issues found' : 'Valid!');
  };

  const validateK8s = () => {
    if (!k8sIn.trim()) { toast.error('Enter Kubernetes YAML'); return; }
    const res = validateYaml(k8sIn);
    const hasApi = k8sIn.includes('apiVersion:');
    const hasKind = k8sIn.includes('kind:');
    const hasMeta = k8sIn.includes('metadata:');
    const lines = [
      ...res.issues,
      hasApi ? '✓ Has apiVersion' : '✗ Missing apiVersion',
      hasKind ? '✓ Has kind' : '✗ Missing kind',
      hasMeta ? '✓ Has metadata' : '✗ Missing metadata',
    ];
    setK8sOut(lines.join('\n'));
    toast.success(res.valid ? 'Valid K8s manifest' : 'Issues found');
  };

  const validateGha = () => {
    if (!ghaIn.trim()) { toast.error('Enter GitHub Actions workflow'); return; }
    const res = validateYaml(ghaIn);
    const hasName = ghaIn.includes('name:');
    const hasOn = ghaIn.includes('on:');
    const hasJobs = ghaIn.includes('jobs:');
    const lines = [
      ...res.issues,
      hasName ? '✓ Has workflow name' : '✗ Missing name',
      hasOn ? '✓ Has trigger (on:)' : '✗ Missing on: trigger',
      hasJobs ? '✓ Has jobs:' : '✗ Missing jobs:',
    ];
    setGhaOut(lines.join('\n'));
    toast.success(res.valid ? 'Valid workflow' : 'Issues found');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="Docker Compose Validator">
        <textarea value={dockerComposeIn} onChange={e => setDockerComposeIn(e.target.value)}
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={validateDc} label="Validate" />
      </Card>

      <Card title="Dockerfile Linter">
        <textarea value={dockerfileIn} onChange={e => setDockerfileIn(e.target.value)}
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={validateDf} label="Lint" />
      </Card>

      <Card title="htaccess Validator">
        <textarea value={htaccessIn} onChange={e => setHtaccessIn(e.target.value)}
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={validateHt} label="Validate" />
      </Card>

      <Card title="Kubernetes YAML Validator">
        <textarea value={k8sIn} onChange={e => setK8sIn(e.target.value)}
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={validateK8s} label="Validate" />
      </Card>

      <Card title="GitHub Actions Validator">
        <textarea value={ghaIn} onChange={e => setGhaIn(e.target.value)}
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={validateGha} label="Validate" />
      </Card>

      {dcOut && <ResultCard title={`Docker Compose`} output={dcOut} />}
      {dfOut && <ResultCard title={`Dockerfile`} output={dfOut} />}
      {htOut && <ResultCard title={'.htaccess'} output={htOut} />}
      {k8sOut && <ResultCard title={'K8s YAML'} output={k8sOut} />}
      {ghaOut && <ResultCard title={'GitHub Actions'} output={ghaOut} />}
    </div>
  );
}

function ResultCard({ title, output }: { title: string; output: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
      <h5 className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">{title}</h5>
      <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{output}</pre>
    </div>
  );
}

function ValidatorTools() {
  const [geojsonIn, setGeojsonIn] = useState('{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[72.8777,19.0760]},"properties":{"name":"Mumbai"}}]}');
  const [geojsonOut, setGeojsonOut] = useState('');
  const [rssIn, setRssIn] = useState('<?xml version="1.0"?>\n<rss version="2.0">\n<channel>\n<title>My Feed</title>\n<link>https://example.com</link>\n<description>Test feed</description>\n<item>\n<title>Post 1</title>\n<link>https://example.com/1</link>\n<description>First post</description>\n</item>\n</channel>\n</rss>');
  const [rssOut, setRssOut] = useState('');
  const [sitemapIn, setSitemapIn] = useState('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>https://example.com/</loc><lastmod>2024-01-01</lastmod><priority>1.0</priority></url>\n<url><loc>https://example.com/about</loc><lastmod>2024-01-01</lastmod><priority>0.8</priority></url>\n</urlset>');
  const [sitemapOut, setSitemapOut] = useState('');
  const [xpathExpr, setXpathExpr] = useState('//div[@class="content"]/p');
  const [xpathIn, setXpathIn] = useState('<root><div class="content"><p>Hello</p></div></root>');
  const [xpathOut, setXpathOut] = useState('');
  const [cronIn, setCronIn] = useState('*/5 * * * *');
  const [cronOut, setCronOut] = useState('');
  const [emailIn, setEmailIn] = useState('user@example.com');
  const [emailOut, setEmailOut] = useState('');

  const validateGeoJSON = () => {
    try {
      const obj = JSON.parse(geojsonIn);
      const validTypes = ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection', 'Feature', 'FeatureCollection'];
      const check = (o: any): string[] => {
        const errs: string[] = [];
        if (!o) return ['Null object'];
        if (o.type && !validTypes.includes(o.type)) errs.push(`Unknown type: ${o.type}`);
        if (o.type === 'Feature' && !o.geometry) errs.push('Feature missing geometry');
        if (o.type === 'FeatureCollection' && !Array.isArray(o.features)) errs.push('FeatureCollection missing features array');
        if (o.geometry && o.geometry.type === 'Point' && (!Array.isArray(o.geometry.coordinates) || o.geometry.coordinates.length < 2)) errs.push('Point needs [lng, lat]');
        if (o.bbox && o.bbox.length !== 4) errs.push('bbox should be [west, south, east, north]');
        return errs;
      };
      const errs = check(obj);
      setGeojsonOut(errs.length ? errs.join('\n') : '✓ Valid GeoJSON');
      toast.success(errs.length ? 'Issues found' : 'Valid GeoJSON');
    } catch { toast.error('Invalid GeoJSON'); setGeojsonOut('✗ Invalid JSON'); }
  };

  const validateRss = () => {
    if (!rssIn.trim()) { toast.error('Enter RSS XML'); return; }
    const hasRss = rssIn.includes('<rss') || rssIn.includes('<feed');
    const hasChannel = rssIn.includes('<channel>') || rssIn.includes('<feed>');
    const hasTitle = rssIn.includes('<title>');
    const hasLink = rssIn.includes('<link>');
    const hasDesc = rssIn.includes('<description>');
    const hasItem = rssIn.includes('<item>') || rssIn.includes('<entry>');
    const issues: string[] = [];
    if (!hasRss) issues.push('Missing &lt;rss&gt; or &lt;feed&gt; root');
    if (!hasChannel) issues.push('Missing &lt;channel&gt; or &lt;feed&gt;');
    if (!hasTitle) issues.push('Missing &lt;title&gt;');
    if (!hasLink) issues.push('Missing &lt;link&gt;');
    if (!hasDesc) issues.push('Missing &lt;description&gt;');
    if (!hasItem) issues.push('No items/entries found');
    const xmlStart = rssIn.trim().startsWith('<?xml');
    setRssOut((xmlStart ? '✓ Has XML declaration\n' : '✗ Missing XML declaration\n') + (issues.length ? issues.join('\n') : '✓ Valid RSS/Atom structure'));
    toast.success(issues.length ? 'Issues found' : 'Valid!');
  };

  const validateSitemap = () => {
    if (!sitemapIn.trim()) { toast.error('Enter sitemap XML'); return; }
    const hasUrlset = sitemapIn.includes('<urlset') || sitemapIn.includes('<sitemapindex');
    const hasUrl = sitemapIn.includes('<url>');
    const hasLoc = sitemapIn.includes('<loc>');
    const xmlDecl = sitemapIn.trim().startsWith('<?xml');
    const issues: string[] = [];
    if (!xmlDecl) issues.push('Missing XML declaration');
    if (!hasUrlset) issues.push('Missing &lt;urlset&gt; or &lt;sitemapindex&gt; root');
    if (!hasUrl && !sitemapIn.includes('<sitemap>')) issues.push('No &lt;url&gt; entries found');
    if (!hasLoc) issues.push('Missing &lt;loc&gt; (required in each url)');
    const urls = sitemapIn.match(/<loc>([^<]+)<\/loc>/g) || [];
    setSitemapOut(issues.join('\n') + (issues.length ? '' : `\n✓ Valid sitemap (${urls.length} URL(s) found)`));
    toast.success(issues.length ? 'Issues found' : 'Valid sitemap');
  };

  const testXpath = () => {
    if (!xpathIn.trim()) { toast.error('Enter XML/HTML'); return; }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xpathIn, 'text/xml');
      const parseError = doc.querySelector('parsererror');
      if (parseError) { setXpathOut('✗ Invalid XML: ' + (parseError.textContent || '').slice(0, 100)); toast.error('Invalid XML'); return; }
      const result = doc.evaluate(xpathExpr, doc, null, XPathResult.ANY_TYPE, null);
      const results: string[] = [];
      let node: Node | null;
      while ((node = result.iterateNext())) {
        results.push(node.textContent?.trim() || node.nodeName || '');
      }
      setXpathOut(results.length ? `Found ${results.length} match(es):\n${results.join('\n')}` : 'No matches');
      toast.success(`Found ${results.length} match(es)`);
    } catch (e: unknown) {
      setXpathOut('✗ XPath error: ' + (e instanceof Error ? e.message : ''));
      toast.error('Invalid XPath');
    }
  };

  const CRON_DESCRIPTIONS: Record<string, string> = {
    '*': 'every',
    '*/': 'every',
  };
  const validateCron = () => {
    const parts = cronIn.trim().split(/\s+/);
    if (parts.length !== 5 && parts.length !== 6) { setCronOut('✗ Expected 5 fields (minute hour day month weekday)'); return; }
    const ranges = [
      { name: 'minute', min: 0, max: 59 },
      { name: 'hour', min: 0, max: 23 },
      { name: 'day', min: 1, max: 31 },
      { name: 'month', min: 1, max: 12 },
      { name: 'weekday', min: 0, max: 7 },
    ];
    const issues: string[] = [];
    const desc: string[] = [];
    parts.slice(0, 5).forEach((p, i) => {
      const r = ranges[i];
      if (p === '*') { desc.push(`${r.name}: every`); return; }
      if (p.startsWith('*/')) {
        const n = parseInt(p.slice(2), 10);
        if (isNaN(n) || n < 1) issues.push(`${r.name}: invalid step "${p}"`);
        else desc.push(`${r.name}: every ${n} ${r.name}s`);
        return;
      }
      if (p.includes(',')) {
        const vals = p.split(',').map(v => parseInt(v, 10));
        if (vals.some(v => isNaN(v) || v < r.min || v > r.max)) issues.push(`${r.name}: value(s) out of range ${r.min}-${r.max}`);
        else desc.push(`${r.name}: at ${p}`);
        return;
      }
      if (p.includes('-')) {
        const [a, b] = p.split('-').map(v => parseInt(v, 10));
        if (isNaN(a) || isNaN(b) || a < r.min || b > r.max) issues.push(`${r.name}: range out of bounds`);
        else desc.push(`${r.name}: ${a}-${b}`);
        return;
      }
      const n = parseInt(p, 10);
      if (isNaN(n) || n < r.min || n > r.max) issues.push(`${r.name}: "${p}" not in range ${r.min}-${r.max}`);
      else desc.push(`${r.name}: at ${n}`);
    });
    const weekdayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    setCronOut(issues.length
      ? issues.join('\n')
      : `✓ Valid cron: ${parts.slice(0, 5).join(' ')}\n${desc.join('\n')}${parts[5] ? `\n(Cmd: ${parts.slice(5).join(' ')})` : ''}`
    );
    toast.success(issues.length ? 'Issues found' : 'Valid cron');
  };

  const validateEmail = () => {
    if (!emailIn.trim()) { toast.error('Enter an email'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const parts = emailIn.split('@');
    const hasDotAfterAt = parts[1]?.includes('.');
    const hasValidTLD = parts[1]?.split('.').pop()!.length >= 2;
    const localLen = parts[0]?.length;
    const issues: string[] = [];
    if (!emailRegex.test(emailIn)) issues.push('Basic format check failed');
    if (!hasDotAfterAt) issues.push('Domain must contain a dot');
    if (!hasValidTLD) issues.push('TLD must be at least 2 characters');
    if (localLen && localLen > 64) issues.push('Local part too long (max 64 chars)');
    if (emailIn.length > 254) issues.push('Total length exceeds 254 chars');
    const mxSuggest = parts[1] ? `\nTo verify MX records, use: nslookup -type=MX ${parts[1]}` : '';
    setEmailOut(issues.length ? issues.join('\n') + mxSuggest : `✓ Valid email format${mxSuggest}`);
    toast.success(issues.length ? 'Issues found' : 'Valid email');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="GeoJSON Validator">
        <textarea value={geojsonIn} onChange={e => setGeojsonIn(e.target.value)}
          className="w-full h-24 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={validateGeoJSON} label="Validate GeoJSON" />
      </Card>

      <Card title="RSS Feed Validator">
        <textarea value={rssIn} onChange={e => setRssIn(e.target.value)}
          className="w-full h-24 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={validateRss} label="Validate RSS" />
      </Card>

      <Card title="Sitemap Validator">
        <textarea value={sitemapIn} onChange={e => setSitemapIn(e.target.value)}
          className="w-full h-20 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <CalcBtn onClick={validateSitemap} label="Validate Sitemap" />
      </Card>

      <Card title="XPath Validator">
        <Inp label="XPath" value={xpathExpr} onChange={setXpathExpr} placeholder="//div/p" />
        <textarea value={xpathIn} onChange={e => setXpathIn(e.target.value)}
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="<root><div><p>text</p></div></root>" />
        <CalcBtn onClick={testXpath} label="Test XPath" />
      </Card>

      <Card title="Cron Expression Validator">
        <Inp label="Cron" value={cronIn} onChange={setCronIn} placeholder="*/5 * * * *" />
        <p className="text-[10px] text-zinc-400">5 fields: minute hour day month weekday</p>
        <CalcBtn onClick={validateCron} label="Validate" />
      </Card>

      <Card title="Email Validator">
        <Inp label="Email" value={emailIn} onChange={setEmailIn} placeholder="user@example.com" />
        <CalcBtn onClick={validateEmail} label="Validate Email" />
      </Card>

      {geojsonOut && <ResultCard title="GeoJSON" output={geojsonOut} />}
      {rssOut && <ResultCard title="RSS Feed" output={rssOut} />}
      {sitemapOut && <ResultCard title="Sitemap" output={sitemapOut} />}
      {xpathOut && <ResultCard title="XPath" output={xpathOut} />}
      {cronOut && <ResultCard title="Cron" output={cronOut} />}
      {emailOut && <ResultCard title="Email" output={emailOut} />}
    </div>
  );
}
