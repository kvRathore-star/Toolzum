"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';

type Tab = 'security' | 'cloud' | 'convert' | 'extra';

const TABS: { key: Tab; label: string }[] = [
  { key: 'security', label: 'Security' },
  { key: 'cloud', label: 'Cloud Tools' },
  { key: 'convert', label: 'Converters' },
  { key: 'extra', label: 'Extra' },
];

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 ${className}`}>{children}</div>;
}

function PasswordEntropyCalc() {
  const [password, setPassword] = useState('HelloWorld123!');
  const [entropy, setEntropy] = useState(0);
  const [strength, setStrength] = useState('');
  const [time, setTime] = useState('');

  const calcEntropy = () => {
    let charset = 0;
    if (/[a-z]/.test(password)) charset += 26;
    if (/[A-Z]/.test(password)) charset += 26;
    if (/\d/.test(password)) charset += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charset += 32;
    const entropyBits = password.length * Math.log2(charset || 1);
    setEntropy(parseFloat(entropyBits.toFixed(2)));
    if (entropyBits < 30) setStrength('Very Weak');
    else if (entropyBits < 50) setStrength('Weak');
    else if (entropyBits < 70) setStrength('Reasonable');
    else if (entropyBits < 90) setStrength('Strong');
    else setStrength('Very Strong');
    const attemptsPerSec = 1e9;
    const seconds = Math.pow(2, entropyBits) / attemptsPerSec;
    if (seconds < 1) setTime('Instant');
    else if (seconds < 60) setTime(`${seconds.toFixed(0)} seconds`);
    else if (seconds < 3600) setTime(`${(seconds / 60).toFixed(0)} minutes`);
    else if (seconds < 86400) setTime(`${(seconds / 3600).toFixed(0)} hours`);
    else if (seconds < 31536000) setTime(`${(seconds / 86400).toFixed(0)} days`);
    else setTime(`${(seconds / 31536000).toFixed(0)} years`);
  };

  return (
    <Card className="md:col-span-2">
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">Password Entropy Calculator</h4>
      <input type="text" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono mb-2" />
      <button onClick={calcEntropy} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mb-3">Calculate</button>
      {entropy > 0 && (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg"><p className="text-lg font-bold">{entropy}</p><p className="text-xs text-zinc-400">Bits</p></div>
          <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg"><p className={`text-lg font-bold ${strength === 'Very Strong' || strength === 'Strong' ? 'text-emerald-500' : strength === 'Reasonable' ? 'text-yellow-500' : 'text-red-500'}`}>{strength}</p><p className="text-xs text-zinc-400">Strength</p></div>
          <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg"><p className="text-lg font-bold text-xs">{time}</p><p className="text-xs text-zinc-400">Crack Time (1B/s)</p></div>
        </div>
      )}
    </Card>
  );
}

function CidrCalculator() {
  const [cidr, setCidr] = useState('192.168.1.0/24');
  const [result, setResult] = useState('');

  const calc = () => {
    const parts = cidr.split('/');
    if (parts.length !== 2) { toast.error('Invalid CIDR format (e.g. 192.168.1.0/24)'); return; }
    const prefix = parseInt(parts[1]);
    if (isNaN(prefix) || prefix < 0 || prefix > 32) { toast.error('Prefix must be 0-32'); return; }
    const octets = parts[0].split('.').map(Number);
    if (octets.length !== 4 || octets.some(o => isNaN(o) || o < 0 || o > 255)) { toast.error('Invalid IP address'); return; }
    const ipInt = octets.reduce((acc, o) => (acc << 8) + o, 0) >>> 0;
    const mask = ~(2 ** (32 - prefix) - 1) >>> 0;
    const network = ipInt & mask;
    const broadcast = network | ~mask >>> 0;
    const firstHost = prefix < 31 ? network + 1 : network;
    const lastHost = prefix < 31 ? broadcast - 1 : broadcast;
    const totalHosts = prefix < 31 ? 2 ** (32 - prefix) - 2 : 2 ** (32 - prefix);
    const fmt = (n: number) => [24, 16, 8, 0].map(s => (n >>> s) & 255).join('.');
    setResult(
      `Network:   ${fmt(network)}/${prefix}\n` +
      `Broadcast: ${fmt(broadcast)}\n` +
      `First Host: ${fmt(firstHost)}\n` +
      `Last Host:  ${fmt(lastHost)}\n` +
      `Total Hosts: ${totalHosts}\n` +
      `Netmask:   ${fmt(mask)}`
    );
  };

  return (
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">CIDR Calculator</h4>
      <input type="text" value={cidr} onChange={e => setCidr(e.target.value)} placeholder="192.168.1.0/24" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono mb-2" />
      <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Calculate</button>
      {result && <textarea readOnly rows={7} value={result} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
    </Card>
  );
}

function AwsIamPolicyAnalyzer() {
  const [policy, setPolicy] = useState('{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"s3:ListBucket","Resource":"arn:aws:s3:::example-bucket"},{"Effect":"Allow","Action":["s3:GetObject","s3:PutObject"],"Resource":"arn:aws:s3:::example-bucket/*"}]}');
  const [analysis, setAnalysis] = useState('');

  const analyze = () => {
    try {
      const p = JSON.parse(policy);
      const statements = p.Statement || [];
      const issues: string[] = [];
      let actions: string[] = [];
      let resources: string[] = [];

      statements.forEach((s: any, i: number) => {
        const acts = Array.isArray(s.Action) ? s.Action : [s.Action];
        const ress = Array.isArray(s.Resource) ? s.Resource : [s.Resource];
        actions = [...actions, ...acts];
        resources = [...resources, ...ress];

        if (s.Effect === 'Allow' && ress.some((r: string) => r === '*')) issues.push(`⚠️ Statement ${i + 1}: Wildcard resource '*'`);

        if (ress.some((r: string) => r === '*') && acts.some((a: string) => a === '*')) issues.push(`🚨 Statement ${i + 1}: Full admin access (*:* on *)`);

        if (acts.some((a: string) => a === 's3:*')) issues.push(`⚠️ Statement ${i + 1}: Broad s3:* action - consider scoping`);
      });

      const uniqueActions = [...new Set(actions)];
      const uniqueResources = [...new Set(resources)];

      setAnalysis(
        `Statements: ${statements.length}\n` +
        `Unique Actions: ${uniqueActions.length}\n` +
        `Unique Resources: ${uniqueResources.length}\n` +
        `\nActions:\n${uniqueActions.map(a => `  • ${a}`).join('\n')}\n` +
        `\nResources:\n${uniqueResources.map(r => `  • ${r}`).join('\n')}\n` +
        (issues.length > 0 ? `\nIssues:\n${issues.join('\n')}` : '\n✅ No obvious issues'))
      ;
    } catch { toast.error('Invalid IAM policy JSON'); }
  };

  return (
    <Card className="md:col-span-2">
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">AWS IAM Policy Analyzer</h4>
      <textarea rows={6} value={policy} onChange={e => setPolicy(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
      <button onClick={analyze} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Analyze</button>
      {analysis && <textarea readOnly rows={10} value={analysis} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
    </Card>
  );
}

function JsonToYaml() {
  const [json, setJson] = useState('{"name": "test", "version": "1.0", "dependencies": {"express": "^4.18"}}');
  const [yaml, setYaml] = useState('');

  const convert = () => {
    try {
      const obj = JSON.parse(json);
      const toYaml = (o: any, indent = 0): string => {
        const pad = '  '.repeat(indent);
        if (typeof o !== 'object' || o === null) return `${o}`;
        if (Array.isArray(o)) return o.map(v => `${pad}- ${typeof v === 'object' ? '\n' + toYaml(v, indent + 1) : v}`).join('\n');
        return Object.entries(o).map(([k, v]) => {
          if (typeof v === 'object' && v !== null && !Array.isArray(v)) return `${pad}${k}:\n${toYaml(v, indent + 1)}`;
          if (Array.isArray(v)) return `${pad}${k}:\n${toYaml(v, indent + 1)}`;
          if (typeof v === 'string') return `${pad}${k}: "${v}"`;
          return `${pad}${k}: ${v}`;
        }).join('\n');
      };
      setYaml(toYaml(obj));
    } catch { toast.error('Invalid JSON'); }
  };

  return (
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">JSON → YAML</h4>
      <textarea rows={5} value={json} onChange={e => setJson(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
      <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">→ YAML</button>
      {yaml && <textarea readOnly rows={6} value={yaml} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
    </Card>
  );
}

function ExcelToCsv() {
  const [data, setData] = useState('Column1\tColumn2\tColumn3\nValue1\tValue2\tValue3\nA\tB\tC');
  const [csv, setCsv] = useState('');

  const convert = () => {
    const lines = data.trim().split('\n');
    const result = lines.map(l => {
      const cols = l.split('\t').map(c => {
        const trimmed = c.trim();
        return trimmed.includes(',') ? `"${trimmed}"` : trimmed;
      });
      return cols.join(',');
    }).join('\n');
    setCsv(result);
  };

  return (
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Excel (TSV) → CSV</h4>
      <textarea rows={4} value={data} onChange={e => setData(e.target.value)} placeholder="Paste tab-separated data" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
      <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">→ CSV</button>
      {csv && <textarea readOnly rows={5} value={csv} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
    </Card>
  );
}

function HashGenerator() {
  const [input, setInput] = useState('hello world');
  const [algo, setAlgo] = useState('SHA-256');
  const [hash, setHash] = useState('');

  const generate = async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest(algo, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    setHash(hashArray.map(b => b.toString(16).padStart(2, '0')).join(''));
  };

  return (
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Hash Generator</h4>
      <input type="text" value={input} onChange={e => setInput(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono mb-2" />
      <select value={algo} onChange={e => setAlgo(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm mb-2">
        <option value="SHA-1">SHA-1</option>
        <option value="SHA-256">SHA-256</option>
        <option value="SHA-384">SHA-384</option>
        <option value="SHA-512">SHA-512</option>
      </select>
      <button onClick={generate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Generate</button>
      {hash && <div className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono break-all">{hash}</div>}
    </Card>
  );
}

function MarkdownQuickEditor() {
  const [md, setMd] = useState('# Hello\nThis is **bold** and *italic*.\n\n- Item 1\n- Item 2\n- Item 3');
  const [preview, setPreview] = useState('');

  const renderPreview = () => {
    let html = md
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, (m) => m.startsWith('<') ? m : `<p>${m}</p>`);
    setPreview(html);
  };

  return (
    <Card className="md:col-span-2">
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Markdown Quick Editor</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <textarea rows={8} value={md} onChange={e => setMd(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
          <button onClick={renderPreview} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Preview</button>
        </div>
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 prose prose-sm max-h-64 overflow-auto" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(preview) }} />
      </div>
    </Card>
  );
}

export default function MiscUtilitiesKit() {
  const [tab, setTab] = useState<Tab>('security');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${tab === t.key ? 'bg-blue-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}>{t.label}</button>
        ))}
      </div>
      {tab === 'security' && (
        <div className="grid grid-cols-1 gap-6">
          <PasswordEntropyCalc />
          <CidrCalculator />
        </div>
      )}
      {tab === 'cloud' && <AwsIamPolicyAnalyzer />}
      {tab === 'convert' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <JsonToYaml />
          <ExcelToCsv />
        </div>
      )}
      {tab === 'extra' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HashGenerator />
          <MarkdownQuickEditor />
        </div>
      )}
    </div>
  );
}
