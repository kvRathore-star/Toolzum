"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";


export default function ApiDocumentationGenerator() {
  const [endpoint, setEndpoint] = useState('/api/v2/users');
  const [method, setMethod] = useState('GET');
  const [desc, setDesc] = useState('Retrieve a list of all users');
  const [params, setParams] = useState('page (query, integer, optional) - Page number\nlimit (query, integer, optional) - Items per page');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const calc = () => {
    const paramLines = params.split('\n').filter(Boolean);
    const table = paramLines.map(p => {
      const parts = p.split('-');
      const field = parts[0]!.trim();
      const desc2 = parts.slice(1).join('-').trim();
      return `| ${field} | ${desc2} |`;
    }).join('\n');
    const output = `# ${method} ${endpoint}\n\n${desc}\n\n### Parameters\n\n| Parameter | Description |\n|-----------|-------------|\n${table}\n\n### Response\n\n\`\`\`json\n{\n  "data": [],\n  "total": 0,\n  "page": 1\n}\n\`\`\`\n\n### Example\n\n\`\`\`bash\ncurl -X ${method} "https://api.example.com${endpoint}"\n\`\`\``;
    setResult(output);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Documentation Generator</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label htmlFor="lbl-apidocumentationgenerator-endpoint" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Endpoint</label>
            <input id="lbl-apidocumentationgenerator-endpoint" aria-label="Endpoint" type="text" value={endpoint} onChange={e => setEndpoint(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label htmlFor="lbl-apidocumentationgenerator-method" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Method</label>
            <select id="lbl-apidocumentationgenerator-method" aria-label="Method" value={method} onChange={e => setMethod(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono">
              <option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="lbl-apidocumentationgenerator-description" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
          <input id="lbl-apidocumentationgenerator-description" aria-label="Description" type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
        </div>
        <div>
          <label htmlFor="lbl-apidocumentationgenerator-parameters-one-per-line-name-type-requir" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Parameters (one per line: name (type, required) - description)</label>
          <textarea id="lbl-apidocumentationgenerator-parameters-one-per-line-name-type-requir" aria-label="Parameters (one per line: name (type, required) - description)" value={params} onChange={e => setParams(e.target.value)} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Docs</button>
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
