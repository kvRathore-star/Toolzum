"use client";
import { useState } from 'react';

export default function ApiDocsGenerator() {
  const [spec, setSpec] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'Sample API', s: '{"openapi":"3.0.0","info":{"title":"My API","version":"1.0.0","description":"A sample API"},"paths":{"/users":{"get":{"summary":"List users","parameters":[{"name":"page","in":"query","schema":{"type":"integer"},"required":false}]}},"/users/{id}":{"get":{"summary":"Get user by ID"}}}}' },
  ];
  const calc = () => {
    try {
      const s = JSON.parse(spec || '{}');
      const title = s.info?.title || 'API';
      const version = s.info?.version || '1.0.0';
      const desc = s.info?.description || '';
      const paths = Object.entries(s.paths || {});
      let md = `# ${title} v${version}\n\n${desc ? desc + '\n\n' : ''}`;
      for (const [path, methods] of paths) {
        for (const [method, detail] of Object.entries(methods as Record<string, any>)) {
          const d = detail as any;
          const summary = d.summary || method.toUpperCase();
          md += `## ${method.toUpperCase()} \`${path}\`\n\n${summary}\n\n`;
          if (d.parameters?.length) {
            md += '### Parameters\n\n| Name | In | Type | Required |\n|------|-----|------|----------|\n';
            for (const p of d.parameters) {
              md += `| ${p.name} | ${p.in} | ${p.schema?.type || 'string'} | ${p.required ? 'Yes' : 'No'} |\n`;
            }
            md += '\n';
          }
        }
      }
      if (!paths.length) md += '_No endpoints defined._\n';
      setResult(md);
    } catch { setResult('Invalid JSON. Paste a valid OpenAPI spec.'); }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Docs Generator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setSpec(p.s); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-blue-400 text-[var(--text-secondary)] hover:text-blue-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">OpenAPI Spec (JSON)</label>
          <textarea value={spec} onChange={e => { setSpec(e.target.value); setResult(''); }} rows={6} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Docs</button>
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-64 whitespace-pre-wrap break-all">{result}</pre>
            <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
