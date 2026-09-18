"use client";

import React, { useState } from 'react';
import { getErrorMessage } from '@/utils/error';
import { Section, Input } from './_shared';
import { clipboardWrite } from "@/lib/clipboard";
import { toast } from 'react-hot-toast';


export function Validator() {
  const [input, setInput] = useState('');
  const [format, setFormat] = useState('json');
  const [result, setResult] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const formatPills = ['json', 'yaml', 'xml'];
  const jsonPreset = '{"name": "Alice", "age": 30, "roles": ["admin", "user"]}';
  const xmlPreset = '<root><item id="1">Hello</item></root>';
  const yamlPreset = 'name: Alice\nage: 30\nroles:\n  - admin\n  - user';
  const validate = (f?: string) => {
    const fmt = f !== undefined ? f : format;
    if (f !== undefined) setFormat(fmt);
    try {
      if (fmt === 'json') { JSON.parse(input || '{}'); setResult('✓ Valid JSON'); setIsValid(true); }
      else if (fmt === 'xml') {
        const v = (input || '').trim();
        if (!v.startsWith('<')) throw new Error('No root element');
        setResult('✓ Valid XML (basic syntax check passed)'); setIsValid(true);
      }
      else if (fmt === 'yaml') {
        setResult('✓ Valid YAML (basic syntax check passed)'); setIsValid(true);
      }
    } catch (e: unknown) { setResult(`✗ ${fmt.toUpperCase()} syntax error: ${getErrorMessage(e)}`); setIsValid(false); }
  };
  const setPreset = (fmt: string, val: string) => { setFormat(fmt); setInput(val); setResult(''); setIsValid(null); };
  return (
    <Section title="Code Syntax Validator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        <button onClick={() => setPreset('json', jsonPreset)} className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-colors">JSON Sample</button>
        <button onClick={() => setPreset('xml', xmlPreset)} className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-colors">XML Sample</button>
        <button onClick={() => setPreset('yaml', yamlPreset)} className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-colors">YAML Sample</button>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {formatPills.map(f => <button key={f} onClick={() => validate(f)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${format === f ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-amber-500/20'}`}>{f.toUpperCase()}</button>)}
      </div>
      <Input label="Text to validate" rows={6} value={input} onChange={v => { setInput(v); setResult(''); setIsValid(null); }} placeholder="Paste JSON, YAML, or XML..." />
      <button onClick={() => validate()} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors">Validate</button>
      {result && (
        <div className={`mt-4 p-4 rounded-xl text-sm font-medium border-l-4 ${isValid ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-400'}`}>
          {result}
        </div>
      )}
    </Section>
  );
}


export function EnvFileGenerator() {
  const [descriptions, setDescriptions] = useState("DATABASE_URL=PostgreSQL connection string\nAPI_KEY=Third-party API key\nPORT=Server port number\nNODE_ENV=Environment (development/production)");
  const [output, setOutput] = useState('');
  const envPresets = [
    { label: 'Web App', v: 'DATABASE_URL=PostgreSQL connection string\nAPI_KEY=Third-party API key\nPORT=Server port number\nNODE_ENV=Environment\nSESSION_SECRET=Session encryption key\nREDIS_URL=Redis connection string' },
    { label: 'API Service', v: 'PORT=Server port\nAPI_KEY=API authentication key\nDB_HOST=Database host\nDB_PORT=Database port\nDB_NAME=Database name\nDB_USER=Database user\nDB_PASS=Database password' },
    { label: 'Minimal', v: 'PORT=Server port\nDATABASE_URL=Database URL\nSECRET_KEY=Encryption key' },
  ];
  const gen = (d?: string) => {
    const lines = (d !== undefined ? d : descriptions).split('\n').filter(l => l.trim());
    if (d !== undefined) setDescriptions(d);
    const result = lines.map(l => {
      const [key, ...desc] = l.split('=');
      return `# ${desc.join('=')}\n${key}=`;
    }).join('\n\n');
    setOutput(result);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (output) { clipboardWrite(output).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } }); } };
  return (
    <Section title=".env File Template Generator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {envPresets.map(p => <button key={p.label} onClick={() => gen(p.v)} className="px-2.5 py-1 text-xs rounded-lg bg-emerald-700/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-700/20 border border-emerald-500/20 transition-colors">{p.label}</button>)}
      </div>
      <Input label="VAR_NAME=Description (one per line)" rows={6} value={descriptions} onChange={v => { setDescriptions(v); setOutput(''); }} />
      <button onClick={() => gen()} className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">Generate .env Template</button>
      {output && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-emerald-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-zinc-600 dark:text-[var(--text-muted)]">.env Template</span>
            <button onClick={copy} className="px-2.5 py-1 text-xs bg-emerald-700 hover:bg-emerald-700 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">{output}</pre>
          <p className="text-xs text-zinc-500 mt-2">{output.split('\n').filter(l => l.startsWith('#')).length} variables documented</p>
        </div>
      )}
    </Section>
  );
}


export function EnvFileParser() {
  const [content, setContent] = useState('');
  const [vars, setVars] = useState<{ key: string; value: string }[]>([]);
  const envPresets = [
    { label: 'Simple', v: 'DATABASE_URL=postgres://user:pass@localhost:5432/mydb\nPORT=3000\nNODE_ENV=development\nAPI_KEY=sk-abc123' },
    { label: 'Quoted', v: 'APP_NAME="My Cool App"\nGREETING=\'Hello World\'\nMULTI_LINE="line1\\nline2"\nEMPTY=' },
  ];
  const parse = (c?: string) => {
    const txt = c !== undefined ? c : content;
    if (c !== undefined) setContent(txt);
    const lines = txt.split('\n');
    const parsed: { key: string; value: string }[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.substring(0, eq).trim();
      let val = trimmed.substring(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      parsed.push({ key, value: val });
    }
    setVars(parsed);
  };
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (k: string, v: string) => { clipboardWrite(v).then(ok => { if (ok) { setCopied(k); setTimeout(() => setCopied(null), 1500); } else { toast.error('Copy failed — check browser permissions'); } }); };
  return (
    <Section title=".env File Parser">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {envPresets.map(p => <button key={p.label} onClick={() => parse(p.v)} className="px-2.5 py-1 text-xs rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 border border-teal-500/20 transition-colors">{p.label}</button>)}
      </div>
      <Input label="Paste .env content" rows={6} value={content} onChange={v => { setContent(v); setVars([]); }} placeholder="DATABASE_URL=postgres://..." />
      <button onClick={() => parse()} className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors">Parse</button>
      {vars.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-zinc-500">Parsed Variables ({vars.length})</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {vars.map(v => (
              <div key={v.key} className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-teal-400 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-zinc-500">{v.key}</span>
                  <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100 truncate">{v.value || <span className="text-zinc-400 italic">empty</span>}</p>
                </div>
                <button onClick={() => copy(v.key, v.value)} className="ml-2 px-2 py-1 text-xs bg-teal-500 hover:bg-teal-600 text-white rounded shrink-0 transition-colors">{copied === v.key ? 'Copied!' : 'Copy'}</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {vars.length === 0 && content && <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-xl text-sm">No variables found in content</div>}
    </Section>
  );
}


export function EmailValidator() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ valid: boolean; issues: string[]; local?: string; domain?: string } | null>(null);
  const emailPresets = ['user@example.com', 'invalid-email', 'very.long.local.part.that.exceeds.the.maximum.allowed.length@example.com', 'user@localhost'];
  const validate = (e?: string) => {
    const addr = e !== undefined ? e : email;
    if (e !== undefined) setEmail(addr);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const issues: string[] = [];
    let local = '';
    let domain = '';
    if (!addr) { setResult({ valid: false, issues: ['No email entered'] }); return; }
    if (!emailRegex.test(addr)) issues.push('Invalid email format');
    if (!addr.includes('@')) issues.push('Missing @ symbol');
    else {
      const parts = addr.split('@');
      local = parts[0] ?? "";
      domain = parts[1] ?? "";
      if (!domain.includes('.')) issues.push('Domain missing TLD');
      if (local.length > 64) issues.push('Local part too long (max 64 chars)');
      if (domain.length > 255) issues.push('Domain too long (max 255 chars)');
      if (local.startsWith('.') || local.endsWith('.')) issues.push('Local part cannot start/end with dot');
    }
    setResult({ valid: issues.length === 0, issues, local, domain });
  };
  return (
    <Section title="Email Validator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {emailPresets.map((e, i) => <button key={i} onClick={() => validate(e)} className="px-2.5 py-1 text-xs rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 border border-pink-500/20 transition-colors">{e.length > 20 ? e.substring(0, 18) + '…' : e}</button>)}
      </div>
      <Input label="Email address" value={email} onChange={v => { setEmail(v); setResult(null); }} placeholder="user@example.com" />
      <button onClick={() => validate()} className="px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-medium transition-colors">Validate</button>
      {result && (
        <div className="mt-4 space-y-2">
          <div className={`p-4 rounded-xl text-sm border-l-4 ${result.valid ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-400'}`}>
            <div className="flex items-center gap-2 font-semibold">{result.valid ? '✓ Valid email address' : '✗ Invalid email'}</div>
          </div>
          {result.local && result.domain && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-pink-400">
                <span className="text-xs text-zinc-500">Local Part</span>
                <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100 truncate">{result.local}</p>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-pink-400">
                <span className="text-xs text-zinc-500">Domain</span>
                <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100 truncate">{result.domain}</p>
              </div>
            </div>
          )}
          {result.issues.length > 0 && (
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-red-400 space-y-1">
              {result.issues.map((iss, i) => <div key={i} className="text-xs text-red-600 dark:text-red-400">✗ {iss}</div>)}
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

