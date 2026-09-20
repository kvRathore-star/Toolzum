"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";


export default function RestEndpointDocumenter() {
  const [endpoints, setEndpoints] = useState('GET /users - List all users\nPOST /users - Create a user\nGET /users/:id - Get user by ID\nPUT /users/:id - Update user\nDELETE /users/:id - Delete user');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'CRUD Users', data: 'GET /users - List all users\nPOST /users - Create a user\nGET /users/:id - Get user by ID\nPUT /users/:id - Update user\nDELETE /users/:id - Delete user' },
    { label: 'Blog API', data: 'GET /posts - List posts\nPOST /posts - Create post\nGET /posts/:id - Get post\nPUT /posts/:id - Update post\nDELETE /posts/:id - Delete post\nGET /comments - List comments' },
  ];
  const calc = () => {
    const lines = endpoints.split('\n').filter(Boolean);
    // Sample bodies are derived from each endpoint's own :params (the old
    // version appended one identical canned body to every document).
    const table = lines.map(l => {
      const [method, ...rest] = l.split(' ');
      const restStr = rest.join(' ');
      const [path, ...descParts] = restStr.split('-');
      return { method: (method || 'GET').trim().toUpperCase(), path: (path || '/').trim(), desc: descParts.join('-').trim() };
    });
    const rows = table.map(t => `| ${t.method} | \`${t.path}\` | ${t.desc} |`).join('\n');
    const sections = table.map(t => {
      const params = [...t.path.matchAll(/:([A-Za-z_]\w*)/g)].map(m => m[1]!);
      const paramJson = params.map(p => `  "${p}": "${p === 'id' ? '1' : 'value'}"`).join(',\n');
      const body = ['POST', 'PUT', 'PATCH'].includes(t.method) && params.length > 0
        ? `\n**Request Body**\n\n\`\`\`json\n{\n${paramJson}\n}\n\`\`\`\n`
        : '';
      const resp = params.length > 0
        ? `\n**Response**\n\n\`\`\`json\n{\n  "success": true,\n${paramJson}\n}\n\`\`\`\n`
        : `\n**Response**\n\n\`\`\`json\n{\n  "success": true\n}\n\`\`\`\n`;
      return `### ${t.method} ${t.path}\n\n${t.desc}${body}${resp}`;
    }).join('\n');
    const output = `## REST API Endpoints\n\n| Method | Path | Description |\n|--------|------|-------------|\n${rows}\n\n${sections}`;
    setResult(output);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">REST Endpoint Documenter</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setEndpoints(p.data); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-teal-400 text-[var(--text-secondary)] hover:text-teal-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div>
          <label htmlFor="lbl-restendpointdocumenter-endpoints-method-path-description-one-pe" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Endpoints (METHOD /path - description, one per line)</label>
          <textarea id="lbl-restendpointdocumenter-endpoints-method-path-description-one-pe" aria-label="Endpoints (METHOD /path - description, one per line)" value={endpoints} onChange={e => setEndpoints(e.target.value)} rows={4} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Docs</button>
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-64 whitespace-pre-wrap break-all">{result}</pre>
            <button onClick={() => { clipboardWrite(result).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else toast.error('Copy blocked by the browser — select the text manually.'); }); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
