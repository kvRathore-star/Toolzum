"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const inputClass = "w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono";
const btnClass = "w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg text-sm transition-colors";
const resultClass = "p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm whitespace-pre-wrap font-mono";

function validateYaml(text: string): string[] {
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
  return issues;
}

export function DockerComposeValidator() {
  const [input, setInput] = useState('version: "3.8"\nservices:\n  web:\n    image: nginx:latest\n    ports:\n      - "80:80"');
  const [output, setOutput] = useState('');
  const validate = () => {
    if (!input.trim()) { toast.error('Enter docker-compose.yml'); return; }
    const issues = validateYaml(input);
    const hasServices = input.includes('services:');
    const kws = ['apiVersion', 'kind', 'metadata', 'spec', 'services', 'image', 'ports', 'volumes'].filter(k => input.includes(k));
    const lines = [
      ...issues,
      hasServices ? 'Has services:' : 'Missing services:',
      kws.length ? `Keywords: ${kws.join(', ')}` : '',
    ].filter(Boolean);
    setOutput(lines.join('\n'));
    toast.success(issues.length ? 'Issues found' : 'Valid YAML structure');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Docker Compose Validator</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={6} className={`${inputClass} resize-y`} />
      <button onClick={validate} className={btnClass}>Validate</button>
      {output && <pre className={`${resultClass} max-h-48 overflow-y-auto`}>{output}</pre>}
    </div>
  );
}

export function DockerfileLinter() {
  const [input, setInput] = useState('FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]');
  const [output, setOutput] = useState('');
  const validate = () => {
    if (!input.trim()) { toast.error('Enter Dockerfile'); return; }
    const lines = input.split('\n');
    const issues: string[] = [];
    const validInstructions = ['FROM', 'RUN', 'CMD', 'LABEL', 'MAINTAINER', 'EXPOSE', 'ENV', 'ADD', 'COPY', 'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD', 'STOPSIGNAL', 'HEALTHCHECK', 'SHELL'];
    lines.forEach((l, i) => {
      const t = l.trim();
      if (!t || t.startsWith('#')) return;
      const instr = t.split(/\s+/)[0].toUpperCase();
      if (!validInstructions.includes(instr)) issues.push(`Line ${i + 1}: Unknown instruction "${instr}"`);
    });
    if (!lines.some(l => l.trim().toUpperCase().startsWith('FROM'))) issues.push('Missing FROM instruction');
    setOutput(issues.length ? issues.join('\n') : `Valid Dockerfile (${lines.length} lines)`);
    toast.success(issues.length ? 'Issues found' : 'Valid!');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Dockerfile Linter</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={6} className={`${inputClass} resize-y`} />
      <button onClick={validate} className={btnClass}>Lint</button>
      {output && <pre className={`${resultClass} max-h-48 overflow-y-auto`}>{output}</pre>}
    </div>
  );
}

export function HtaccessValidator() {
  const [input, setInput] = useState('RewriteEngine On\nRewriteRule ^old$ /new [R=301,L]\nErrorDocument 404 /404.html\nOptions -Indexes');
  const [output, setOutput] = useState('');
  const validate = () => {
    if (!input.trim()) { toast.error('Enter .htaccess'); return; }
    const lines = input.split('\n');
    const issues: string[] = [];
    const validDirs = ['RewriteEngine', 'RewriteRule', 'RewriteCond', 'RewriteBase', 'ErrorDocument', 'Redirect', 'RedirectMatch', 'Header', 'SetEnv', 'Deny', 'Allow', 'Order', 'Satisfy', 'AuthType', 'AuthName', 'AuthUserFile', 'Require', 'Options', 'AddType', 'AddHandler', 'AddCharset', 'DefaultType', 'FileETag', 'Limit', 'LimitExcept', 'php_flag', 'php_value', 'SetHandler', 'SetOutputFilter'];
    lines.forEach((l, i) => {
      const t = l.trim();
      if (!t || t.startsWith('#')) return;
      const dir = t.split(/\s+/)[0];
      if (!validDirs.includes(dir) && !dir.startsWith('<') && !dir.startsWith('</')) issues.push(`Line ${i + 1}: Unknown directive "${dir}"`);
    });
    setOutput(issues.length ? issues.join('\n') : `Valid .htaccess (${lines.length} lines)`);
    toast.success(issues.length ? 'Issues found' : 'Valid!');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">htaccess Validator</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={6} className={`${inputClass} resize-y`} />
      <button onClick={validate} className={btnClass}>Validate</button>
      {output && <pre className={`${resultClass} max-h-48 overflow-y-auto`}>{output}</pre>}
    </div>
  );
}

export function KubernetesYamlValidator() {
  const [input, setInput] = useState('apiVersion: v1\nkind: Pod\nmetadata:\n  name: my-pod\nspec:\n  containers:\n  - name: app\n    image: nginx:latest');
  const [output, setOutput] = useState('');
  const validate = () => {
    if (!input.trim()) { toast.error('Enter Kubernetes YAML'); return; }
    const issues = validateYaml(input);
    const lines = [
      ...issues,
      input.includes('apiVersion:') ? 'Has apiVersion' : 'Missing apiVersion',
      input.includes('kind:') ? 'Has kind' : 'Missing kind',
      input.includes('metadata:') ? 'Has metadata' : 'Missing metadata',
    ];
    setOutput(lines.join('\n'));
    toast.success(issues.length ? 'Issues found' : 'Valid K8s manifest');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Kubernetes YAML Validator</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={6} className={`${inputClass} resize-y`} />
      <button onClick={validate} className={btnClass}>Validate</button>
      {output && <pre className={`${resultClass} max-h-48 overflow-y-auto`}>{output}</pre>}
    </div>
  );
}

export function GithubActionsValidator() {
  const [input, setInput] = useState('name: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm test');
  const [output, setOutput] = useState('');
  const validate = () => {
    if (!input.trim()) { toast.error('Enter GitHub Actions workflow'); return; }
    const issues = validateYaml(input);
    const lines = [
      ...issues,
      input.includes('name:') ? 'Has workflow name' : 'Missing name',
      input.includes('on:') ? 'Has trigger (on:)' : 'Missing on: trigger',
      input.includes('jobs:') ? 'Has jobs:' : 'Missing jobs:',
    ];
    setOutput(lines.join('\n'));
    toast.success(issues.length ? 'Issues found' : 'Valid workflow');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">GitHub Actions Validator</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={6} className={`${inputClass} resize-y`} />
      <button onClick={validate} className={btnClass}>Validate</button>
      {output && <pre className={`${resultClass} max-h-48 overflow-y-auto`}>{output}</pre>}
    </div>
  );
}

export function GeoJsonValidator() {
  const [input, setInput] = useState('{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[72.8777,19.0760]},"properties":{"name":"Mumbai"}}]}');
  const [output, setOutput] = useState('');
  const validate = () => {
    try {
      const obj = JSON.parse(input);
      const validTypes = ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection', 'Feature', 'FeatureCollection'];
      const errs: string[] = [];
      if (!obj.type) errs.push('Missing type field');
      else if (!validTypes.includes(obj.type)) errs.push(`Unknown type: ${obj.type}`);
      if (obj.type === 'Feature' && !obj.geometry) errs.push('Feature missing geometry');
      if (obj.type === 'FeatureCollection' && !Array.isArray(obj.features)) errs.push('FeatureCollection missing features array');
      if (obj.geometry?.type === 'Point' && (!Array.isArray(obj.geometry.coordinates) || obj.geometry.coordinates.length < 2)) errs.push('Point needs [lng, lat]');
      if (obj.bbox && obj.bbox.length !== 4) errs.push('bbox should be [west, south, east, north]');
      setOutput(errs.length ? errs.join('\n') : 'Valid GeoJSON');
      toast.success(errs.length ? 'Issues found' : 'Valid GeoJSON');
    } catch { toast.error('Invalid JSON'); setOutput('Invalid JSON'); }
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">GeoJSON Validator</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={6} className={`${inputClass} resize-y`} />
      <button onClick={validate} className={btnClass}>Validate</button>
      {output && <pre className={`${resultClass} max-h-48 overflow-y-auto`}>{output}</pre>}
    </div>
  );
}

export function RssFeedValidator() {
  const [input, setInput] = useState('<?xml version="1.0"?>\n<rss version="2.0">\n<channel>\n<title>My Feed</title>\n<link>https://example.com</link>\n<description>Test feed</description>\n<item>\n<title>Post 1</title>\n<link>https://example.com/1</link>\n</item>\n</channel>\n</rss>');
  const [output, setOutput] = useState('');
  const validate = () => {
    if (!input.trim()) { toast.error('Enter RSS XML'); return; }
    const issues: string[] = [];
    if (!input.includes('<rss') && !input.includes('<feed')) issues.push('Missing <rss> or <feed> root');
    if (!input.includes('<channel>') && !input.includes('<feed>')) issues.push('Missing <channel> or <feed>');
    if (!input.includes('<title>')) issues.push('Missing <title>');
    if (!input.includes('<link>')) issues.push('Missing <link>');
    if (!input.includes('<description>')) issues.push('Missing <description>');
    if (!input.includes('<item>') && !input.includes('<entry>')) issues.push('No items/entries found');
    const xmlDecl = input.trim().startsWith('<?xml');
    setOutput((xmlDecl ? 'Has XML declaration\n' : 'Missing XML declaration\n') + (issues.length ? issues.join('\n') : 'Valid RSS/Atom structure'));
    toast.success(issues.length ? 'Issues found' : 'Valid!');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">RSS Feed Validator</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={6} className={`${inputClass} resize-y`} />
      <button onClick={validate} className={btnClass}>Validate</button>
      {output && <pre className={`${resultClass} max-h-48 overflow-y-auto`}>{output}</pre>}
    </div>
  );
}

export function SitemapValidator() {
  const [input, setInput] = useState('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>https://example.com/</loc><lastmod>2024-01-01</lastmod><priority>1.0</priority></url>\n</urlset>');
  const [output, setOutput] = useState('');
  const validate = () => {
    if (!input.trim()) { toast.error('Enter sitemap XML'); return; }
    const issues: string[] = [];
    if (!input.trim().startsWith('<?xml')) issues.push('Missing XML declaration');
    if (!input.includes('<urlset') && !input.includes('<sitemapindex')) issues.push('Missing <urlset> or <sitemapindex> root');
    if (!input.includes('<url>') && !input.includes('<sitemap>')) issues.push('No <url> entries found');
    if (!input.includes('<loc>')) issues.push('Missing <loc> (required in each url)');
    const urls = input.match(/<loc>([^<]+)<\/loc>/g) || [];
    setOutput(issues.length ? issues.join('\n') : `Valid sitemap (${urls.length} URL(s) found)`);
    toast.success(issues.length ? 'Issues found' : 'Valid sitemap');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Sitemap Validator</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={6} className={`${inputClass} resize-y`} />
      <button onClick={validate} className={btnClass}>Validate</button>
      {output && <pre className={`${resultClass} max-h-48 overflow-y-auto`}>{output}</pre>}
    </div>
  );
}

export function XpathValidator() {
  const [expr, setExpr] = useState('//div[@class="content"]/p');
  const [xml, setXml] = useState('<root><div class="content"><p>Hello</p></div></root>');
  const [output, setOutput] = useState('');
  const validate = () => {
    if (!xml.trim()) { toast.error('Enter XML/HTML'); return; }
    try {
      const doc = new DOMParser().parseFromString(xml, 'text/xml');
      const parseError = doc.querySelector('parsererror');
      if (parseError) { setOutput('Invalid XML: ' + (parseError.textContent || '').slice(0, 100)); toast.error('Invalid XML'); return; }
      const result = doc.evaluate(expr, doc, null, XPathResult.ANY_TYPE, null);
      const results: string[] = [];
      let node: Node | null;
      while ((node = result.iterateNext())) results.push(node.textContent?.trim() || node.nodeName || '');
      setOutput(results.length ? `Found ${results.length} match(es):\n${results.join('\n')}` : 'No matches');
      toast.success(`Found ${results.length} match(es)`);
    } catch (e: unknown) { setOutput('XPath error: ' + (e instanceof Error ? e.message : '')); toast.error('Invalid XPath'); }
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">XPath Validator</h1>
      <div className="space-y-2">
        <div><label className="block text-sm font-medium mb-1">XPath Expression</label><input type="text" value={expr} onChange={e => setExpr(e.target.value)} className={inputClass} placeholder="//div/p" /></div>
        <div><label className="block text-sm font-medium mb-1">XML/HTML</label><textarea value={xml} onChange={e => setXml(e.target.value)} rows={4} className={`${inputClass} resize-y`} placeholder="<root><div><p>text</p></div></root>" /></div>
      </div>
      <button onClick={validate} className={btnClass}>Test XPath</button>
      {output && <pre className={`${resultClass} max-h-48 overflow-y-auto`}>{output}</pre>}
    </div>
  );
}

export function CronExpressionValidator() {
  const [input, setInput] = useState('*/5 * * * *');
  const [output, setOutput] = useState('');
  const validate = () => {
    const parts = input.trim().split(/\s+/);
    if (parts.length !== 5 && parts.length !== 6) { setOutput('Expected 5 fields (minute hour day month weekday)'); return; }
    const ranges = [{ name: 'minute', min: 0, max: 59 }, { name: 'hour', min: 0, max: 23 }, { name: 'day', min: 1, max: 31 }, { name: 'month', min: 1, max: 12 }, { name: 'weekday', min: 0, max: 7 }];
    const issues: string[] = [];
    const desc: string[] = [];
    parts.slice(0, 5).forEach((p, i) => {
      const r = ranges[i];
      if (p === '*') { desc.push(`${r.name}: every`); return; }
      if (p.startsWith('*/')) { const n = parseInt(p.slice(2)); if (isNaN(n) || n < 1) issues.push(`${r.name}: invalid step "${p}"`); else desc.push(`${r.name}: every ${n} ${r.name}s`); return; }
      if (p.includes(',')) { const vals = p.split(',').map(v => parseInt(v)); if (vals.some(v => isNaN(v) || v < r.min || v > r.max)) issues.push(`${r.name}: value(s) out of range ${r.min}-${r.max}`); else desc.push(`${r.name}: at ${p}`); return; }
      if (p.includes('-')) { const [a, b] = p.split('-').map(v => parseInt(v)); if (isNaN(a) || isNaN(b) || a < r.min || b > r.max) issues.push(`${r.name}: range out of bounds`); else desc.push(`${r.name}: ${a}-${b}`); return; }
      const n = parseInt(p); if (isNaN(n) || n < r.min || n > r.max) issues.push(`${r.name}: "${p}" not in range ${r.min}-${r.max}`); else desc.push(`${r.name}: at ${n}`);
    });
    setOutput(issues.length ? issues.join('\n') : `Valid cron: ${parts.slice(0, 5).join(' ')}\n${desc.join('\n')}${parts[5] ? `\n(Cmd: ${parts.slice(5).join(' ')})` : ''}`);
    toast.success(issues.length ? 'Issues found' : 'Valid cron');
  };
  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-6">Cron Expression Validator</h1>
      <input type="text" value={input} onChange={e => setInput(e.target.value)} className={inputClass} placeholder="*/5 * * * *" />
      <p className="text-xs text-zinc-400">5 fields: minute hour day month weekday</p>
      <button onClick={validate} className={btnClass}>Validate</button>
      {output && <pre className={`${resultClass} max-h-48 overflow-y-auto`}>{output}</pre>}
    </div>
  );
}
