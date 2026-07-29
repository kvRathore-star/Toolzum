"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { inputClass, labelClass, btnClass, cardClass, headingClass, resultClass } from './ApiTools.shared';

export function OpenapiMockGenerator() {
  const [spec, setSpec] = useState('/users:\n  get:\n    responses:\n      200:\n        schema:\n          type: array\n          items:\n            type: object\n            properties:\n              id: { type: integer }\n              name: { type: string }');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const calc = () => {
    const lines = spec.split('\n').filter(Boolean);
    const mock: Record<string, any> = {};
    let currentPath = '';
    for (const line of lines) {
      if (line.startsWith('/')) { currentPath = line.split(':')[0]; mock[currentPath] = {}; }
      if (line.includes('type: integer')) mock[currentPath] = { data: [{ id: 1, name: 'John' }], total: 1 };
      if (line.includes('type: string')) mock[currentPath] = { data: [{ id: 1, name: 'John' }], total: 1 };
    }
    setResult(JSON.stringify(mock, null, 2));
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">OpenAPI Mock Generator</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">OpenAPI Spec (YAML fragment)</label>
          <textarea value={spec} onChange={e => setSpec(e.target.value)} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Mock</button>
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

export function OpenapiToPostman() {
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
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">OpenAPI Spec (YAML)</label>
          <textarea value={spec} onChange={e => setSpec(e.target.value)} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
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

export function OpenapiValidator() {
  const [spec, setSpec] = useState('openapi: "3.0.0"\ninfo:\n  title: Test API\n  version: "1.0.0"\npaths:\n  /users:\n    get:\n      responses:\n        "200":\n          description: OK');
  const [result, setResult] = useState<{ valid: boolean; issues: string[] } | null>(null);
  const calc = () => {
    const issues: string[] = [];
    if (!spec.includes('openapi:')) issues.push('Missing openapi version field');
    if (!spec.includes('info:')) issues.push('Missing info section');
    if (!spec.includes('title:')) issues.push('Missing API title');
    if (!spec.includes('version:')) issues.push('Missing API version');
    if (!spec.includes('paths:')) issues.push('Missing paths section');
    if (!spec.includes('/')) issues.push('No endpoint paths defined');
    setResult({ valid: issues.length === 0, issues: issues.length ? issues : ['Schema appears valid'] });
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">OpenAPI Validator</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">OpenAPI Spec (YAML)</label>
          <textarea value={spec} onChange={e => setSpec(e.target.value)} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Validate</button>
        {result && (
          <div className={`p-3 rounded-xl text-sm font-bold ${result.valid ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
            <p>{result.valid ? '✓ Valid Spec' : '✗ Issues Found'}</p>
            {result.issues.map((issue, i) => <p key={i} className="text-xs font-normal mt-1">{issue}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}

export function PostmanCollectionGenerator() {
  const [endpoints, setEndpoints] = useState('GET /users List users\nPOST /users Create user\nGET /users/:id Get user');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'Users CRUD', data: 'GET /users List users\nPOST /users Create user\nGET /users/:id Get user\nPUT /users/:id Update user\nDELETE /users/:id Delete user' },
    { label: 'Posts API', data: 'GET /posts List posts\nPOST /posts Create post\nGET /posts/:id Get post' },
  ];
  const calc = () => {
    const lines = endpoints.split('\n').filter(Boolean);
    const items = lines.map(l => {
      const [method, path, ...descParts] = l.split(' ');
      return {
        name: descParts.join(' ') || path,
        request: { method, header: [], url: { raw: `https://api.example.com${path}`, protocol: 'https', host: ['api', 'example', 'com'], path: path.split('/').filter(Boolean) } },
      };
    });
    const collection = {
      info: { name: 'API Collection', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
      item: items,
    };
    setResult(JSON.stringify(collection, null, 2));
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Postman Collection Generator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setEndpoints(p.data); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-orange-400 text-[var(--text-secondary)] hover:text-orange-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Endpoints (METHOD /path description, one per line)</label>
          <textarea value={endpoints} onChange={e => setEndpoints(e.target.value)} rows={4} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate</button>
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

export function PostmanToOpenapiConverter() {
  const [collection, setCollection] = useState('{"info":{"name":"My API"},"item":[{"name":"Users","request":{"method":"GET","url":{"raw":"https://api.example.com/users"}}}]}');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const calc = () => {
    try {
      const c = JSON.parse(collection);
      const paths: Record<string, any> = {};
      for (const item of c.item || []) {
        const path = item.request?.url?.raw ? new URL(item.request.url.raw).pathname : '/' + (item.name || '').toLowerCase();
        const method = (item.request?.method || 'GET').toLowerCase();
        paths[path] = paths[path] || {};
        paths[path][method] = { summary: item.name || '', responses: { '200': { description: 'OK' } } };
      }
      const spec = { openapi: '3.0.0', info: { title: c.info?.name || 'API', version: '1.0.0' }, paths };
      setResult(JSON.stringify(spec, null, 2));
    } catch {
      setResult('Error: Invalid Postman collection JSON');
    }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Postman to OpenAPI Converter</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Postman Collection (JSON)</label>
          <textarea value={collection} onChange={e => setCollection(e.target.value)} rows={4} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Convert</button>
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

export function SwaggerOpenapiGenerator() {
  const [title, setTitle] = useState('Pet Store API');
  const [version, setVersion] = useState('1.0.0');
  const [desc, setDesc] = useState('A sample pet store API');
  const [endpoints, setEndpoints] = useState('GET /pets List all pets\nPOST /pets Create a pet\nGET /pets/{petId} Get pet by ID');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'Pet Store', t: 'Pet Store API', v: '1.0.0', d: 'A sample pet store API', e: 'GET /pets List all pets\nPOST /pets Create a pet\nGET /pets/{petId} Get pet by ID' },
    { label: 'Blog API', t: 'Blog API', v: '2.0.0', d: 'A simple blog API', e: 'GET /posts List posts\nPOST /posts Create post\nGET /posts/{id} Get post' },
  ];
  const calc = () => {
    const lines = endpoints.split('\n').filter(Boolean);
    const paths: Record<string, any> = {};
    for (const line of lines) {
      const [method, path, ...descParts] = line.split(' ');
      const m = method.toLowerCase();
      paths[path] = paths[path] || {};
      paths[path][m] = { summary: descParts.join(' '), responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object' } } } } } };
    }
    const spec = { openapi: '3.0.0', info: { title, version, description: desc }, paths };
    setResult(JSON.stringify(spec, null, 2));
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Swagger/OpenAPI Generator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setTitle(p.t); setVersion(p.v); setDesc(p.d); setEndpoints(p.e); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-green-400 text-[var(--text-secondary)] hover:text-green-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Version</label>
            <input type="text" value={version} onChange={e => setVersion(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Endpoints (METHOD /path description, one per line)</label>
          <textarea value={endpoints} onChange={e => setEndpoints(e.target.value)} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Spec</button>
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

export function GrpcStatusCodeLookup() {
  const [code, setCode] = useState('4');
  const [result, setResult] = useState('');
  const codes: Record<string, { name: string; desc: string }> = {
    '0': { name: 'OK', desc: 'The operation completed successfully' },
    '1': { name: 'CANCELLED', desc: 'The operation was cancelled' },
    '2': { name: 'UNKNOWN', desc: 'Unknown error' },
    '3': { name: 'INVALID_ARGUMENT', desc: 'Client specified an invalid argument' },
    '4': { name: 'DEADLINE_EXCEEDED', desc: 'Deadline expired before operation completed' },
    '5': { name: 'NOT_FOUND', desc: 'Some requested entity was not found' },
    '6': { name: 'ALREADY_EXISTS', desc: 'Entity already exists' },
    '7': { name: 'PERMISSION_DENIED', desc: 'Caller does not have permission' },
    '8': { name: 'RESOURCE_EXHAUSTED', desc: 'Resource exhausted (rate limit)' },
    '9': { name: 'FAILED_PRECONDITION', desc: 'System not in required state' },
    '10': { name: 'ABORTED', desc: 'Operation aborted' },
    '11': { name: 'OUT_OF_RANGE', desc: 'Operation was attempted past valid range' },
    '12': { name: 'UNIMPLEMENTED', desc: 'Operation not implemented' },
    '13': { name: 'INTERNAL', desc: 'Internal errors' },
    '14': { name: 'UNAVAILABLE', desc: 'Service is currently unavailable' },
    '15': { name: 'DATA_LOSS', desc: 'Unrecoverable data loss or corruption' },
    '16': { name: 'UNAUTHENTICATED', desc: 'Request not authenticated' },
  };
  const presets = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];
  const info = codes[code] || null;
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">gRPC Status Code Lookup</h2>
        <div className="flex flex-wrap gap-1">
          {presets.map(c => (
            <button key={c} onClick={() => setCode(c)}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${code === c ? 'bg-stone-600 text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-zinc-900'}`}>{c}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Code</label>
            <input type="number" value={code} onChange={e => setCode(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div className="flex items-end">
            <button onClick={() => setResult(codes[code]?.name || '')} className="w-full bg-stone-600 hover:bg-stone-500 text-white font-bold py-2 rounded-lg text-xs transition-all">Lookup</button>
          </div>
        </div>
        {info && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
            <p className="text-lg font-black text-stone-600 dark:text-stone-300">{info.name}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{info.desc}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SoapApiTester() {
  const [wsdl, setWsdl] = useState('https://example.com/service?wsdl');
  const [method, setMethod] = useState('GetUser');
  const [params, setParams] = useState('<userId>123</userId>');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const calc = () => {
    const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${method} xmlns="http://example.com/service">
      ${params}
    </${method}>
  </soap:Body>
</soap:Envelope>`;
    setResult(envelope);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">SOAP API Tester</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">WSDL URL</label>
          <input type="text" value={wsdl} onChange={e => setWsdl(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Method</label>
            <input type="text" value={method} onChange={e => setMethod(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">XML Parameters</label>
            <textarea value={params} onChange={e => setParams(e.target.value)} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate SOAP Envelope</button>
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

export function WebhookPayloadGenerator() {
  const [event, setEvent] = useState('user.created');
  const [fields, setFields] = useState('id: number\nname: string\nemail: string\ncreatedAt: string');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'User Created', e: 'user.created', f: 'id: number\nname: string\nemail: string\ncreatedAt: string' },
    { label: 'Order Placed', e: 'order.placed', f: 'orderId: number\ntotal: number\nitems: number\ncustomerEmail: string' },
    { label: 'Payment', e: 'payment.completed', f: 'transactionId: string\namount: number\ncurrency: string\nstatus: string' },
  ];
  const generate = (t: string) => {
    if (t === 'number') return Math.floor(Math.random() * 1000);
    if (t === 'string') return Math.random().toString(36).substring(2, 8);
    if (t === 'email') return `${Math.random().toString(36).substring(2, 8)}@example.com`;
    if (t === 'boolean') return Math.random() > 0.5;
    return 'value';
  };
  const calc = () => {
    const payload: Record<string, any> = {};
    for (const line of fields.split('\n').filter(Boolean)) {
      const [key, type] = line.split(':').map(s => s.trim());
      payload[key] = generate(type);
    }
    const webhook = { id: Math.random().toString(36).substring(2, 10), event, created: new Date().toISOString(), data: payload };
    setResult(JSON.stringify(webhook, null, 2));
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Webhook Payload Generator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setEvent(p.e); setFields(p.f); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-blue-400 text-[var(--text-secondary)] hover:text-blue-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Event Name</label>
            <input type="text" value={event} onChange={e => { setEvent(e.target.value); setResult(''); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Fields (key: type)</label>
            <textarea value={fields} onChange={e => { setFields(e.target.value); setResult(''); }} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Payload</button>
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

export function WebhookRetryConfig() {
  const [maxRetries, setMaxRetries] = useState('3');
  const [baseDelay, setBaseDelay] = useState('1000');
  const [result, setResult] = useState<{ name: string; delays: string; total: number }[]>([]);
  const calc = () => {
    const max = parseInt(maxRetries);
    const delay = parseInt(baseDelay);
    const strategies = [
      { name: 'Fixed', delays: Array.from({ length: max }, () => delay) },
      { name: 'Linear', delays: Array.from({ length: max }, (_, i) => delay * (i + 1)) },
      { name: 'Exponential', delays: Array.from({ length: max }, (_, i) => delay * Math.pow(2, i)) },
      { name: 'Exponential + Jitter', delays: Array.from({ length: max }, (_, i) => Math.round(delay * Math.pow(2, i) * (0.5 + Math.random() * 0.5))) },
    ];
    setResult(strategies.map(s => ({
      name: s.name,
      delays: s.delays.join(' → '),
      total: s.delays.reduce((a, b) => a + b, 0),
    })));
  };
  const maxTotal = result.length ? Math.max(...result.map(r => r.total)) : 1;
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Webhook Retry Config</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Max Retries</label>
            <input type="number" value={maxRetries} onChange={e => setMaxRetries(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Base Delay (ms)</label>
            <input type="number" value={baseDelay} onChange={e => setBaseDelay(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Calculate</button>
        {result.length > 0 && (
          <div className="space-y-3">
            {result.map(r => (
              <div key={r.name} className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)]">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-bold">{r.name}</p>
                  <p className="text-xs font-bold text-amber-500">{(r.total / 1000).toFixed(1)}s</p>
                </div>
                <p className="text-[10px] font-mono text-[var(--text-muted)] mb-1.5">{r.delays}</p>
                <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(r.total / maxTotal) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function WebhookSignatureVerifier() {
  const [payload, setPayload] = useState('{"event":"user.created","data":{"id":1}}');
  const [secret, setSecret] = useState('whsec_test_secret_key');
  const [signature, setSignature] = useState('');
  const [result, setResult] = useState<{ expected: string; match: boolean | null }>({ expected: '', match: null });
  const calc = async () => {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const msgData = encoder.encode(payload);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, msgData);
    const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
    const expectedSig = 'sha256=' + hex;
    setResult({ expected: expectedSig, match: signature ? signature === expectedSig : null });
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Webhook Signature Verifier</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Payload</label>
          <textarea value={payload} onChange={e => setPayload(e.target.value)} rows={2} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Signing Secret</label>
            <input type="text" value={secret} onChange={e => setSecret(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Signature</label>
            <input type="text" value={signature} onChange={e => setSignature(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Verify</button>
        {result.expected && (
          <div className="space-y-2">
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Expected Signature</p>
              <p className="text-xs font-mono break-all">{result.expected}</p>
            </div>
            {result.match !== null && (
              <div className={`p-3 rounded-xl text-sm font-bold ${result.match ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                {result.match ? '✓ Signature matches!' : '✗ Signature does not match'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function WebhookTester() {
  const [url, setUrl] = useState('https://webhook.site/your-unique-id');
  const [payload, setPayload] = useState('{"event":"test","data":{"message":"Hello"}}');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);
  const calc = async () => {
    setLoading(true); setResult(''); setStatus(null);
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
      const text = await res.text();
      setStatus(res.status);
      setResult(text.slice(0, 500));
    } catch (e) {
      setResult(`Fetch error: ${e}\n\n(Note: This may fail due to CORS. Use a test endpoint that supports CORS.)`);
    } finally { setLoading(false); }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Webhook Tester</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Webhook URL</label>
          <input type="text" value={url} onChange={e => setUrl(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Payload (JSON)</label>
          <textarea value={payload} onChange={e => setPayload(e.target.value)} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">
          {loading ? 'Sending...' : 'Send Test'}
        </button>
        {result && (
          <div className="space-y-2">
            {status !== null && (
              <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${status >= 200 && status < 300 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                Status: {status}
              </div>
            )}
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-48 whitespace-pre-wrap break-all">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export function WebhookValidator() {
  const [payload, setPayload] = useState('{"id":"evt_123","event":"user.created","data":{"id":1,"name":"John","email":"john@example.com"},"created":"2026-01-01T00:00:00Z"}');
  const [result, setResult] = useState<{ valid: boolean; issues: string[] } | null>(null);
  const calc = () => {
    try {
      const obj = JSON.parse(payload);
      const issues: string[] = [];
      if (!obj.id) issues.push('Missing: id');
      if (!obj.event) issues.push('Missing: event');
      if (!obj.data) issues.push('Missing: data');
      if (!obj.created) issues.push('Missing: created (timestamp)');
      if (obj.created && isNaN(Date.parse(obj.created))) issues.push('Invalid: created timestamp format');
      if (obj.event && !obj.event.includes('.')) issues.push('Suggestion: use dot notation for event (e.g., user.created)');
      setResult({ valid: issues.length === 0, issues: issues.length ? issues : ['✓ Payload structure is valid'] });
    } catch {
      setResult({ valid: false, issues: ['Error: Invalid JSON'] });
    }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Webhook Validator</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Webhook Payload (JSON)</label>
          <textarea value={payload} onChange={e => { setPayload(e.target.value); setResult(null); }} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Validate</button>
        {result && (
          <div className={`p-3 rounded-xl ${result.valid ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            <p className={`text-sm font-bold ${result.valid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{result.valid ? '✓ Valid' : '✗ Issues'}</p>
            {result.issues.map((issue, i) => <p key={i} className="text-xs mt-1 text-[var(--text-secondary)]">{issue}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConventionalCommitGenerator() {
  const [type, setType] = useState('feat');
  const [scope, setScope] = useState('api');
  const [message, setMessage] = useState('add user list pagination');
  const [breaking, setBreaking] = useState('');
  const [body, setBody] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'Feature', t: 'feat', s: 'api', m: 'add user list pagination', b: '' },
    { label: 'Bug Fix', t: 'fix', s: 'auth', m: 'handle token refresh race condition', b: '' },
    { label: 'Breaking', t: 'feat', s: 'core', m: 'migrate to new caching layer', b: 'old cache API deprecated' },
  ];
  const calc = () => {
    const scopeStr = scope ? `(${scope})` : '';
    const breakingStr = breaking ? `!\n\nBREAKING CHANGE: ${breaking}` : '';
    const bodyStr = body ? `\n\n${body}` : '';
    setResult(`${type}${scopeStr}${breakingStr}: ${message}${bodyStr}`);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Conventional Commit Generator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setType(p.t); setScope(p.s); setMessage(p.m); setBreaking(p.b); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-blue-400 text-[var(--text-secondary)] hover:text-blue-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Type</label>
            <select value={type} onChange={e => { setType(e.target.value); setResult(''); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs">
              <option value="feat">feat</option><option value="fix">fix</option><option value="docs">docs</option>
              <option value="style">style</option><option value="refactor">refactor</option><option value="perf">perf</option>
              <option value="test">test</option><option value="chore">chore</option><option value="ci">ci</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Scope</label>
            <input type="text" value={scope} onChange={e => setScope(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
          <input type="text" value={message} onChange={e => setMessage(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Breaking Change</label>
          <input type="text" value={breaking} onChange={e => setBreaking(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Body</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={2} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Commit</button>
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto break-all">{result}</pre>
            <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
