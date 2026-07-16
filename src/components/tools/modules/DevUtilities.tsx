"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Plug, Shield, Container, AlignLeft, Mail } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'port' | 'chmod' | 'docker' | 'yaml' | 'email';

function genPort(ranges: { min: number; max: number }[]): number {
  const total = ranges.reduce((s, r) => s + r.max - r.min + 1, 0);
  let offset = Math.floor(Math.random() * total);
  for (const r of ranges) {
    const size = r.max - r.min + 1;
    if (offset < size) return r.min + offset;
    offset -= size;
  }
  return 49152 + Math.floor(Math.random() * 16384);
}

function toNumericPerm(s: string): string {
  const parts = s.split(',').map(p => p.trim());
  let num = 0;
  const categories = ['u', 'g', 'o'];
  for (let ci = 0; ci < 3; ci++) {
    const part = parts.find(p => p.startsWith(categories[ci])) || '';
    const perm = part.split('=')[1] || '';
    let val = 0;
    if (perm.includes('r')) val += 4;
    if (perm.includes('w')) val += 2;
    if (perm.includes('x')) val += 1;
    num = num * 10 + val;
  }
  return String(num);
}

function toSymbolicPerm(n: string): string {
  const nums = n.split('').map(Number);
  if (nums.length !== 3) return '';
  const perm = (v: number): string => {
    let s = '';
    if (v & 4) s += 'r'; else s += '-';
    if (v & 2) s += 'w'; else s += '-';
    if (v & 1) s += 'x'; else s += '-';
    return s;
  };
  return `u=${perm(nums[0])},g=${perm(nums[1])},o=${perm(nums[2])}`;
}

function parseDockerRun(cmd: string): string {
  const parts = cmd.trim().split(/\s+/);
  const yaml: Record<string, unknown> = { version: '3.8', services: { app: {} } };
  const svc = yaml.services.app as Record<string, unknown>;
  let i = 0;
  while (i < parts.length) {
    const p = parts[i];
    if (p === 'docker' || p === 'run') { i++; continue; }
    if (p === '-d' || p === '--detach') { svc.detach = true; i++; continue; }
    if (p === '--name' && i + 1 < parts.length) { svc.container_name = parts[i + 1]; i += 2; continue; }
    if ((p === '-p' || p === '--publish') && i + 1 < parts.length) {
      if (!svc.ports) svc.ports = [];
      (svc.ports as string[]).push(parts[i + 1]);
      i += 2; continue;
    }
    if ((p === '-v' || p === '--volume') && i + 1 < parts.length) {
      if (!svc.volumes) svc.volumes = [];
      (svc.volumes as string[]).push(parts[i + 1]);
      i += 2; continue;
    }
    if ((p === '-e' || p === '--env') && i + 1 < parts.length) {
      if (!svc.environment) svc.environment = [];
      (svc.environment as string[]).push(parts[i + 1]);
      i += 2; continue;
    }
    if (p === '--restart' && i + 1 < parts.length) { svc.restart = parts[i + 1]; i += 2; continue; }
    if (p === '--network' && i + 1 < parts.length) {
      if (!svc.networks) svc.networks = [];
      (svc.networks as string[]).push(parts[i + 1]);
      i += 2; continue;
    }
    if (!p.startsWith('-') && !svc.image) { svc.image = p; i++; continue; }
    i++;
  }
  return JSY(svc, 2);
}

function JSY(obj: unknown, indent: number): string {
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj === 'string') return obj.includes(' ') ? `"${obj}"` : obj;
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return '\n' + obj.map(v => '  '.repeat(indent) + '- ' + (typeof v === 'object' && v !== null ? JSY(v, indent + 1).trimStart() : JSY(v, 0))).join('\n');
  }
  if (typeof obj === 'object' && obj !== null) {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return '\n' + entries.map(([k, v]) => {
      if (v === undefined || v === null || (Array.isArray(v) && v.length === 0)) return '';
      const val = JSY(v, indent + 1);
      if (val.startsWith('\n')) return '  '.repeat(indent) + k + ':' + val;
      return '  '.repeat(indent) + k + ': ' + val;
    }).filter(Boolean).join('\n');
  }
  return String(obj);
}

function formatYaml(input: string): string {
  const lines = input.split('\n');
  const out: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) { out.push(line); continue; }
    const indent = line.search(/\S/);
    const arrMatch = trimmed.match(/^-\s+(.+)$/);
    if (arrMatch) {
      out.push('  '.repeat(indent / 2) + '- ' + arrMatch[1]);
    } else {
      const kvMatch = trimmed.match(/^([a-zA-Z0-9_\-]+):\s*(.*)$/);
      if (kvMatch) {
        const val = kvMatch[2].trim();
        out.push('  '.repeat(indent / 2) + kvMatch[1] + ': ' + val);
      } else {
        out.push('  '.repeat(indent / 2) + trimmed);
      }
    }
  }
  return out.join('\n');
}

function normalizeEmail(email: string): string {
  let e = email.trim().toLowerCase();
  const atIdx = e.indexOf('@');
  if (atIdx === -1) return e;
  let local = e.slice(0, atIdx);
  const domain = e.slice(atIdx);
  // Remove +tag
  local = local.split('+')[0];
  // Remove dots for gmail
  if (domain === '@gmail.com' || domain === '@googlemail.com') local = local.replace(/\./g, '');
  return local + domain;
}

export default function DevUtilities() {
  const [tab, setTab] = useState<Tab>('port');
  const [portRanges, setPortRanges] = useState([{ min: 49152, max: 65535 }]);
  const [portCount, setPortCount] = useState(1);
  const [ports, setPorts] = useState<number[]>([]);

  const [chmodInput, setChmodInput] = useState('755');
  const [chmodSymbolic, setChmodSymbolic] = useState('u=rwx,g=rx,o=rx');
  const [chmodNumeric, setChmodNumeric] = useState('755');

  const [dockerInput, setDockerInput] = useState('docker run -d --name myapp -p 8080:80 nginx');
  const [dockerOutput, setDockerOutput] = useState('');

  const [yamlInput, setYamlInput] = useState('');
  const [yamlOutput, setYamlOutput] = useState('');

  const [emailInput, setEmailInput] = useState('');

  const generatePorts = useCallback(() => {
    const selectedRanges: { min: number; max: number }[] = [];
    if (portRanges.length === 0) selectedRanges.push({ min: 49152, max: 65535 });
    else selectedRanges.push(...portRanges);
    const generated: number[] = [];
    for (let i = 0; i < portCount; i++) {
      generated.push(genPort(selectedRanges));
    }
    setPorts(generated);
  }, [portRanges, portCount]);

  const handleChmodInput = useCallback((val: string) => {
    setChmodInput(val);
    if (/^[0-7]{3}$/.test(val)) {
      setChmodNumeric(val);
      setChmodSymbolic(toSymbolicPerm(val));
    } else if (val.includes('=')) {
      const n = toNumericPerm(val);
      if (n.length === 3) {
        setChmodNumeric(n);
        setChmodSymbolic(toSymbolicPerm(n));
      }
    }
  }, []);

  const handleDockerConvert = useCallback(() => {
    if (!dockerInput.trim()) { toast.error('Enter a docker run command'); return; }
    setDockerOutput('services:\n  app:' + parseDockerRun(dockerInput));
  }, [dockerInput]);

  const handleYamlFormat = useCallback(() => {
    if (!yamlInput.trim()) return;
    try { setYamlOutput(formatYaml(yamlInput)); } catch { setYamlOutput(''); }
  }, [yamlInput]);

  const copy = (txt: string, label: string) => { clipboardWrite(txt); toast.success(`${label} copied!`); };

  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${tab === v ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
        <TabBtn v="port" label="Port Gen" icon={Plug} />
        <TabBtn v="chmod" label="Chmod Calc" icon={Shield} />
        <TabBtn v="docker" label="Docker→Compose" icon={Container} />
        <TabBtn v="yaml" label="YAML Formatter" icon={AlignLeft} />
        <TabBtn v="email" label="Email Normalizer" icon={Mail} />
      </div>

      {tab === 'port' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-xs text-zinc-500">Count: {portCount}</label>
            <input type="range" min={1} max={20} value={portCount} onChange={e => setPortCount(parseInt(e.target.value))} className="w-32" />
            <button onClick={generatePorts} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer">Generate</button>
          </div>
          <div className="space-y-2">
            {[0, 1, 2].map(i => {
              const label = ['Well-Known (0-1023)', 'Registered (1024-49151)', 'Dynamic (49152-65535)'][i];
              const range = [{min:0,max:1023},{min:1024,max:49151},{min:49152,max:65535}][i];
              const checked = portRanges.some(r => r.min === range.min);
              return (
                <label key={i} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <input type="checkbox" checked={checked} onChange={() => {
                    if (checked) setPortRanges(prev => prev.filter(r => r.min !== range.min));
                    else setPortRanges(prev => [...prev, range]);
                  }} />
                  {label} ({range.min}-{range.max})
                </label>
              );
            })}
          </div>
          {ports.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {ports.map((p, i) => (
                <div key={i} className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-center">
                  <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">{p}</span>
                  <button onClick={() => copy(String(p), 'Port')} className="block text-[9px] text-zinc-400 hover:text-zinc-600 mt-0.5">Copy</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'chmod' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {['644', '755', '777', '600', '700', '444', '400', '000'].map(p => (
              <button key={p} onClick={() => handleChmodInput(p)} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2.5 py-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-mono cursor-pointer">{p}</button>
            ))}
          </div>
          <input value={chmodInput} onChange={e => handleChmodInput(e.target.value)} placeholder="e.g. 755 or u=rwx,g=rx,o=rx" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none font-mono" />
          {/^[0-7]{3}$/.test(chmodNumeric) && (
            <div className="space-y-3">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Owner', val: parseInt(chmodNumeric[0]) },
                    { label: 'Group', val: parseInt(chmodNumeric[1]) },
                    { label: 'Others', val: parseInt(chmodNumeric[2]) },
                  ].map(({ label, val }) => (
                    <div key={label} className="text-center">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">{label}</div>
                      <div className="text-lg font-bold font-mono text-zinc-900 dark:text-white">{val}</div>
                      <div className="text-xs font-mono text-zinc-500">
                        {val & 4 ? 'r' : '-'}{val & 2 ? 'w' : '-'}{val & 1 ? 'x' : '-'}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {val === 7 ? 'Read, Write, Exec' : val === 6 ? 'Read, Write' : val === 5 ? 'Read, Exec' : val === 4 ? 'Read Only' : val === 3 ? 'Write, Exec' : val === 2 ? 'Write Only' : val === 1 ? 'Execute Only' : 'No Access'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-xs text-zinc-500">
                <span className="font-bold">Symbolic:</span> <span className="font-mono text-zinc-900 dark:text-white">{chmodSymbolic}</span>
                <button onClick={() => copy(chmodSymbolic, 'Symbolic')} className="ml-2 text-[10px] text-indigo-400 hover:underline">Copy</button>
              </div>
              <div className="text-xs text-zinc-500">
                <span className="font-bold">Numeric:</span> <span className="font-mono text-zinc-900 dark:text-white">{chmodNumeric}</span>
                <button onClick={() => copy(chmodNumeric, 'Numeric')} className="ml-2 text-[10px] text-indigo-400 hover:underline">Copy</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'docker' && (
        <div className="space-y-4">
          <textarea value={dockerInput} onChange={e => setDockerInput(e.target.value)} placeholder="docker run -d --name myapp -p 8080:80 nginx" className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono h-[100px]" />
          <button onClick={handleDockerConvert} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer">Convert</button>
          {dockerOutput && (
            <div className="relative">
              <textarea value={dockerOutput} readOnly className="w-full h-[300px] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-sm text-zinc-900 dark:text-emerald-400 outline-none resize-none font-mono" />
              <button onClick={() => copy(dockerOutput, 'Compose')} className="absolute top-3 right-3 text-[10px] text-indigo-400 hover:underline bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700">Copy</button>
            </div>
          )}
        </div>
      )}

      {tab === 'yaml' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <textarea value={yamlInput} onChange={e => { setYamlInput(e.target.value); setTimeout(() => handleYamlFormat(), 0); }} placeholder="Paste YAML here..." className="w-full h-[350px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono" />
          <div className="relative">
            <textarea value={yamlOutput} readOnly placeholder="Formatted YAML..." className="w-full h-[350px] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono" />
            {yamlOutput && <button onClick={() => copy(yamlOutput, 'YAML')} className="absolute top-3 right-3 text-[10px] text-indigo-400 hover:underline bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700">Copy</button>}
          </div>
        </div>
      )}

      {tab === 'email' && (
        <div className="space-y-4">
          <textarea value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="Enter emails, one per line..." className="w-full h-[200px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono" />
          {emailInput.trim() && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5">
              <div className="text-[10px] font-bold text-zinc-400 uppercase mb-3">Normalized ({emailInput.trim().split('\n').filter(Boolean).length} processed)</div>
              <div className="space-y-1">
                {emailInput.trim().split('\n').filter(Boolean).map((e, i) => {
                  const norm = normalizeEmail(e);
                  return (
                    <div key={i} className="grid grid-cols-2 gap-4 text-xs font-mono py-1.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                      <span className="text-zinc-500 break-all">{e.trim()}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 break-all flex items-center gap-2">
                        {norm}
                        <button onClick={() => copy(norm, 'Email')} className="text-[9px] text-indigo-400 hover:underline ml-auto">Copy</button>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
