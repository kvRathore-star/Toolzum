"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

function parseDockerRun(cmd: string): string {
  const parts = cmd.trim().split(/\s+/);
  const yaml: Record<string, unknown> = { version: '3.8', services: { app: {} } };
  const svc = (yaml.services as Record<string, unknown>).app as Record<string, unknown>;
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

export default function DockerRunToCompose() {
  const [input, setInput] = useState('docker run -d --name myapp -p 8080:80 nginx');
  const [output, setOutput] = useState('');

  const convert = useCallback(() => {
    if (!input.trim()) { toast.error('Enter a docker run command'); return; }
    setOutput('services:\n  app:' + parseDockerRun(input));
  }, [input]);

  const copy = (txt: string, label: string) => { clipboardWrite(txt); toast.success(`${label} copied!`); };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="docker run -d --name myapp -p 8080:80 nginx" className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono h-[100px]" />
      <button onClick={convert} className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer">Convert to Compose</button>
      {output && (
        <div className="relative">
          <textarea value={output} readOnly className="w-full h-[300px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-emerald-500 outline-none resize-none font-mono" />
          <button onClick={() => copy(output, 'Compose')} className="absolute top-3 right-3 text-[11px] text-[var(--accent)] hover:underline bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)]">Copy</button>
        </div>
      )}
    </div>
  );
}
