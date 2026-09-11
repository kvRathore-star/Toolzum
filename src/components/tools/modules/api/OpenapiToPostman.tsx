"use client";
import { useState } from 'react';

export default function OpenapiToPostman() {
  const [spec, setSpec] = useState('openapi: 3.0.0\ninfo:\n  title: My API\n  version: 1.0.0\npaths:\n  /users:\n    get:\n      summary: List users\n      responses:\n        200:\n          description: OK');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const calc = () => {
    const collection = {
      info: { name: 'API Collection', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
      item: [
        {
          name: '/users',
          request: { method: 'GET', header: [], url: { raw: 'https://api.example.com/users', protocol: 'https', host: ['api', 'example', 'com'], path: ['users'] } },
          response: [{ name: '200 OK', status: 'OK', code: 200, header: [], body: '[]' }],
        },
      ],
    };
    setResult(JSON.stringify(collection, null, 2));
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">OpenAPI to Postman</h2>
        <div>
          <label htmlFor="lbl-openapitopostman-openapi-spec-yaml" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">OpenAPI Spec (YAML)</label>
          <textarea id="lbl-openapitopostman-openapi-spec-yaml" aria-label="OpenAPI Spec (YAML)" value={spec} onChange={e => setSpec(e.target.value)} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Convert</button>
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
