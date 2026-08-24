"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { getErrorMessage } from '@/utils/error';
import { CalculatorShell } from '../shared/CalculatorShell';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full bg-[var(--bg-overlay)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
      {children}
    </div>
  );
}

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

const taCls = "w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 resize-y";
const btnCls = "w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg";
const preCls = "p-4 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto";

export function DockerComposeValidator() {
  const [input, setInput] = useState('version: "3.8"\nservices:\n  web:\n    image: nginx:latest\n    ports:\n      - "80:80"');
  const [output, setOutput] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
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
    setIsValid(issues.length === 0);
    toast.success(issues.length ? 'Issues found' : 'Valid YAML structure');
  };

  const presets = [
    { label: 'Web Service', apply: () => setInput('version: "3.8"\nservices:\n  web:\n    image: nginx:latest\n    ports:\n      - "80:80"\n    volumes:\n      - ./html:/usr/share/nginx/html') },
    { label: 'Multi-service', apply: () => setInput('version: "3.8"\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n  db:\n    image: postgres:15\n    environment:\n      POSTGRES_PASSWORD: secret') },
    { label: 'Clear', apply: () => { setInput(''); setOutput(''); setIsValid(null); } },
  ];

  const resultText = isValid === true ? '✓ Valid Docker Compose' : (isValid === false ? '✗ Invalid' : 'Enter docker-compose.yml');

  return (
    <CalculatorShell title="Docker Compose Validator" result={resultText} onCalculate={validate} presets={presets} accent="blue" downloadData={output} downloadFilename="docker-compose-validation.txt">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Docker Compose YAML</label>
      <textarea value={input} onChange={e => { setInput(e.target.value); setOutput(''); setIsValid(null); }} rows={8}
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y" />

      <button onClick={validate} className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors w-full sm:w-auto">Validate</button>

      {output && (
        <pre className={`p-4 rounded-xl ${isValid ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-500/20' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-500/20'}`}>{output}</pre>
      )}
    </CalculatorShell>
  );
}

export function DockerfileLinter() {
  const [input, setInput] = useState('FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]');
  const [output, setOutput] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

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
    setIsValid(issues.length === 0);
    setOutput(issues.length ? issues.join('\n') : `Valid Dockerfile (${lines.length} lines)`);
    toast.success(issues.length ? 'Issues found' : 'Valid!');
  };

  const presets = [
    { label: 'Node.js', apply: () => setInput('FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]') },
    { label: 'Python', apply: () => setInput('FROM python:3.11-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nCMD ["python", "app.py"]') },
    { label: 'Go', apply: () => setInput('FROM golang:1.21-alpine\nWORKDIR /app\nCOPY go.mod go.sum .\nRUN go mod download\nCOPY . .\nRUN go build -o app\nCMD ["./app"]') },
    { label: 'Clear', apply: () => { setInput(''); setOutput(''); setIsValid(null); } },
  ];

  const resultText = isValid === true ? '✓ Valid Dockerfile' : (isValid === false ? '✗ Issues found' : 'Enter Dockerfile to lint');

  return (
    <CalculatorShell title="Dockerfile Linter" result={resultText} onCalculate={validate} presets={presets} accent="blue" downloadData={output} downloadFilename="dockerfile-lint.txt">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Dockerfile</label>
      <textarea value={input} onChange={e => { setInput(e.target.value); setOutput(''); setIsValid(null); }} rows={10}
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y" />

      <button onClick={validate} className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors w-full sm:w-auto">Lint</button>

      {output && (
        <pre className={`p-4 rounded-xl ${isValid ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-500/20' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-500/20'}`}>{output}</pre>
      )}
    </CalculatorShell>
  );
}

export function HtaccessValidator() {
  const [input, setInput] = useState('RewriteEngine On\nRewriteRule ^old$ /new [R=301,L]\nErrorDocument 404 /404.html\nOptions -Indexes');
  const [output, setOutput] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

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
    setIsValid(issues.length === 0);
    setOutput(issues.length ? issues.join('\n') : `Valid .htaccess (${lines.length} lines)`);
    toast.success(issues.length ? 'Issues found' : 'Valid!');
  };

  const presets = [
    { label: 'Basic', apply: () => setInput('RewriteEngine On\nRewriteRule ^old$ /new [R=301,L]\nErrorDocument 404 /404.html\nOptions -Indexes') },
    { label: 'Force HTTPS', apply: () => setInput('RewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]') },
    { label: 'SPA Rewrite', apply: () => setInput('RewriteEngine On\nRewriteBase /\nRewriteRule ^index\\.html$ - [L]\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME} !-d\nRewriteRule . /index.html [L]') },
    { label: 'Clear', apply: () => { setInput(''); setOutput(''); setIsValid(null); } },
  ];

  const resultText = isValid === true ? '✓ Valid .htaccess' : (isValid === false ? '✗ Issues found' : 'Enter .htaccess to validate');

  return (
    <CalculatorShell title="htaccess Validator" result={resultText} onCalculate={validate} presets={presets} accent="emerald" downloadData={output} downloadFilename="htaccess-validation.txt">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">htaccess Content</label>
      <textarea value={input} onChange={e => { setInput(e.target.value); setOutput(''); setIsValid(null); }} rows={8}
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y" />

      <button onClick={validate} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors w-full sm:w-auto">Validate</button>

      {output && (
        <pre className={`p-4 rounded-xl ${isValid ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-500/20'}`}>{output}</pre>
      )}
    </CalculatorShell>
  );
}

export function KubernetesYamlValidator() {
  const [input, setInput] = useState('apiVersion: v1\nkind: Pod\nmetadata:\n  name: my-pod\nspec:\n  containers:\n  - name: app\n    image: nginx:latest');
  const [output, setOutput] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validate = () => {
    if (!input.trim()) { toast.error('Enter Kubernetes YAML'); return; }
    const issues = validateYaml(input);
    const lines = [
      ...issues,
      input.includes('apiVersion:') ? 'Has apiVersion' : 'Missing apiVersion',
      input.includes('kind:') ? 'Has kind' : 'Missing kind',
      input.includes('metadata:') ? 'Has metadata' : 'Missing metadata',
    ];
    setIsValid(issues.length === 0);
    setOutput(lines.join('\n'));
    toast.success(issues.length ? 'Issues found' : 'Valid K8s manifest');
  };

  const presets = [
    { label: 'Pod', apply: () => setInput('apiVersion: v1\nkind: Pod\nmetadata:\n  name: my-pod\nspec:\n  containers:\n  - name: app\n    image: nginx:latest') },
    { label: 'Deployment', apply: () => setInput('apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: nginx-deployment\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: nginx\n  template:\n    metadata:\n      labels:\n        app: nginx\n    spec:\n      containers:\n      - name: nginx\n        image: nginx:latest') },
    { label: 'Service', apply: () => setInput('apiVersion: v1\nkind: Service\nmetadata:\n  name: nginx-service\nspec:\n  selector:\n    app: nginx\n  ports:\n    - protocol: TCP\n      port: 80\n      targetPort: 80') },
    { label: 'Clear', apply: () => { setInput(''); setOutput(''); setIsValid(null); } },
  ];

  const resultText = isValid === true ? '✓ Valid K8s manifest' : (isValid === false ? '✗ Issues found' : 'Enter Kubernetes YAML');

  return (
    <CalculatorShell title="Kubernetes YAML Validator" result={resultText} onCalculate={validate} presets={presets} accent="blue" downloadData={output} downloadFilename="k8s-validation.txt">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Kubernetes YAML</label>
      <textarea value={input} onChange={e => { setInput(e.target.value); setOutput(''); setIsValid(null); }} rows={10}
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y" />

      <button onClick={validate} className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors w-full sm:w-auto">Validate</button>

      {output && (
        <pre className={`p-4 rounded-xl ${isValid ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-500/20' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-500/20'}`}>{output}</pre>
      )}
    </CalculatorShell>
  );
}

export function GithubActionsValidator() {
  const [input, setInput] = useState('name: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm test');
  const [output, setOutput] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validate = () => {
    if (!input.trim()) { toast.error('Enter GitHub Actions workflow'); return; }
    const issues = validateYaml(input);
    const lines = [
      ...issues,
      input.includes('name:') ? 'Has workflow name' : 'Missing name',
      input.includes('on:') ? 'Has trigger (on:)' : 'Missing on: trigger',
      input.includes('jobs:') ? 'Has jobs:' : 'Missing jobs:',
    ];
    setIsValid(issues.length === 0);
    setOutput(lines.join('\n'));
    toast.success(issues.length ? 'Issues found' : 'Valid workflow');
  };

  const presets = [
    { label: 'Node.js CI', apply: () => setInput('name: Node.js CI\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: "20"\n      - run: npm ci\n      - run: npm test') },
    { label: 'Docker Build', apply: () => setInput('name: Docker\non:\n  push:\n    branches: [main]\njobs:\n  docker:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: docker/login-action@v3\n        with:\n          registry: ghcr.io\n          username: ${{ github.actor }}\n          password: ${{ secrets.GITHUB_TOKEN }}\n      - uses: docker/build-push-action@v5\n        with:\n          push: true\n          tags: ghcr.io/${{ github.repository }}/app:latest') },
    { label: 'Clear', apply: () => { setInput(''); setOutput(''); setIsValid(null); } },
  ];

  const resultText = isValid === true ? '✓ Valid workflow' : (isValid === false ? '✗ Issues found' : 'Enter GitHub Actions YAML');

  return (
    <CalculatorShell title="GitHub Actions Validator" result={resultText} onCalculate={validate} presets={presets} accent="purple" downloadData={output} downloadFilename="github-actions-validation.txt">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">GitHub Actions Workflow YAML</label>
      <textarea value={input} onChange={e => { setInput(e.target.value); setOutput(''); setIsValid(null); }} rows={10}
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-y" />

      <button onClick={validate} className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-medium transition-colors w-full sm:w-auto">Validate</button>

      {output && (
        <pre className={`p-4 rounded-xl ${isValid ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-500/20' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-500/20'}`}>{output}</pre>
      )}
    </CalculatorShell>
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
    <Section title="GeoJSON Validator">
      <div className="space-y-3">
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={6} className={taCls} />
        <button onClick={validate} className={btnCls}>Validate</button>
        {output && <pre className={preCls}>{output}</pre>}
      </div>
    </Section>
  );
}

export function RssFeedValidator() {
  const [input, setInput] = useState('<?xml version="1.0"?>\n<rss version="2.0">\n<channel>\n<title>My Feed</title>\n<link>https://example.com</link>\n<description>Test feed</description>\n<item>\n<title>Post 1</title>\n<link>https://example.com/1</link>\n</item>\n</channel>\n</rss>');
  const [output, setOutput] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

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
    setIsValid(issues.length === 0);
    setOutput((xmlDecl ? 'Has XML declaration\n' : 'Missing XML declaration\n') + (issues.length ? issues.join('\n') : 'Valid RSS/Atom structure'));
    toast.success(issues.length ? 'Issues found' : 'Valid!');
  };

  const presets = [
    { label: 'RSS 2.0', apply: () => setInput('<?xml version="1.0"?>\n<rss version="2.0">\n<channel>\n<title>My Feed</title>\n<link>https://example.com</link>\n<description>Test feed</description>\n<item>\n<title>Post 1</title>\n<link>https://example.com/1</link>\n</item>\n</channel>\n</rss>') },
    { label: 'Atom', apply: () => setInput('<?xml version="1.0"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n<title>My Feed</title>\n<link href="https://example.com"/>\n<updated>2024-01-01T00:00:00Z</updated>\n<entry>\n<title>Post 1</title>\n<link href="https://example.com/1"/>\n</entry>\n</feed>') },
    { label: 'Clear', apply: () => { setInput(''); setOutput(''); setIsValid(null); } },
  ];

  const resultText = isValid === true ? '✓ Valid RSS/Atom' : (isValid === false ? '✗ Issues found' : 'Enter RSS/Atom XML');

  return (
    <CalculatorShell title="RSS Feed Validator" result={resultText} onCalculate={validate} presets={presets} accent="orange" downloadData={output} downloadFilename="rss-validation.txt">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">RSS/Atom XML</label>
      <textarea value={input} onChange={e => { setInput(e.target.value); setOutput(''); setIsValid(null); }} rows={8}
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-y" />

      <button onClick={validate} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors w-full sm:w-auto">Validate</button>

      {output && (
        <pre className={`p-4 rounded-xl ${isValid ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-500/20' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-500/20'}`}>{output}</pre>
      )}
    </CalculatorShell>
  );
}

export function SitemapValidator() {
  const [input, setInput] = useState('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>https://example.com/</loc><lastmod>2024-01-01</lastmod><priority>1.0</priority></url>\n</urlset>');
  const [output, setOutput] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validate = () => {
    if (!input.trim()) { toast.error('Enter sitemap XML'); return; }
    const issues: string[] = [];
    if (!input.trim().startsWith('<?xml')) issues.push('Missing XML declaration');
    if (!input.includes('<urlset') && !input.includes('<sitemapindex')) issues.push('Missing <urlset> or <sitemapindex> root');
    if (!input.includes('<url>') && !input.includes('<sitemap>')) issues.push('No <url> entries found');
    if (!input.includes('<loc>')) issues.push('Missing <loc> (required in each url)');
    const urls = input.match(/<loc>([^<]+)<\/loc>/g) || [];
    setIsValid(issues.length === 0);
    setOutput(issues.length ? issues.join('\n') : `Valid sitemap (${urls.length} URL(s) found)`);
    toast.success(issues.length ? 'Issues found' : 'Valid sitemap');
  };

  const presets = [
    { label: 'Basic', apply: () => setInput('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>https://example.com/</loc><lastmod>2024-01-01</lastmod><priority>1.0</priority></url>\n</urlset>') },
    { label: 'Multiple URLs', apply: () => setInput('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>https://example.com/</loc><lastmod>2024-01-01</lastmod><priority>1.0</priority></url>\n<url><loc>https://example.com/about</loc><lastmod>2024-01-15</lastmod><priority>0.8</priority></url>\n<url><loc>https://example.com/contact</loc><lastmod>2024-02-01</lastmod><priority>0.5</priority></url>\n</urlset>') },
    { label: 'Sitemap Index', apply: () => setInput('<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<sitemap><loc>https://example.com/sitemap1.xml</loc><lastmod>2024-01-01</lastmod></sitemap>\n<sitemap><loc>https://example.com/sitemap2.xml</loc><lastmod>2024-01-01</lastmod></sitemap>\n</sitemapindex>') },
    { label: 'Clear', apply: () => { setInput(''); setOutput(''); setIsValid(null); } },
  ];

  const resultText = isValid === true ? '✓ Valid sitemap' : (isValid === false ? '✗ Issues found' : 'Enter sitemap XML');

  return (
    <CalculatorShell title="Sitemap Validator" result={resultText} onCalculate={validate} presets={presets} accent="indigo" downloadData={output} downloadFilename="sitemap-validation.txt">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Sitemap XML</label>
      <textarea value={input} onChange={e => { setInput(e.target.value); setOutput(''); setIsValid(null); }} rows={8}
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y" />

      <button onClick={validate} className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors w-full sm:w-auto">Validate</button>

      {output && (
        <pre className={`p-4 rounded-xl ${isValid ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-500/20'}`}>{output}</pre>
      )}
    </CalculatorShell>
  );
}

export function XpathValidator() {
  const [expr, setExpr] = useState('//div[@class="content"]/p');
  const [xml, setXml] = useState('<root><div class="content"><p>Hello</p></div></root>');
  const [output, setOutput] = useState('');
  const [matchCount, setMatchCount] = useState(0);

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
      setMatchCount(results.length);
      setOutput(results.length ? `Found ${results.length} match(es):\n${results.join('\n')}` : 'No matches');
      toast.success(`Found ${results.length} match(es)`);
    } catch (e: unknown) { setOutput('XPath error: ' + (e instanceof Error ? e.message : '')); toast.error('Invalid XPath'); }
  };

  const presets = [
    { label: 'All divs', apply: () => { setExpr('//div'); setXml('<root><div class="a">1</div><div class="b">2</div></root>'); } },
    { label: 'Class selector', apply: () => { setExpr('//div[@class="content"]/p'); setXml('<root><div class="content"><p>Hello</p></div></root>'); } },
    { label: 'All links', apply: () => { setExpr('//a[@href]'); setXml('<root><a href="/a">A</a><a href="/b">B</a></root>'); } },
    { label: 'Clear', apply: () => { setExpr(''); setXml(''); setOutput(''); } },
  ];

  const resultText = matchCount > 0 ? `Found ${matchCount} match(es)` : (output ? output : 'Enter XPath and XML');

  return (
    <CalculatorShell title="XPath Validator" result={resultText} onCalculate={validate} presets={presets} accent="violet" downloadData={output} downloadFilename="xpath-results.txt">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">XPath Expression</label>
        <input type="text" value={expr} onChange={e => setExpr(e.target.value)} placeholder="//div/p"
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/50" />

        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">XML/HTML</label>
        <textarea value={xml} onChange={e => setXml(e.target.value)} rows={4}
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-y" placeholder="<root><div><p>text</p></div></root>" />

        <button onClick={validate} className="px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-medium transition-colors w-full sm:w-auto">Test XPath</button>

        {output && (
          <pre className={`p-4 rounded-xl font-mono text-sm whitespace-pre-wrap ${matchCount > 0 ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-500/20' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-500/20'}`}>
            {output}
          </pre>
        )}
      </div>
    </CalculatorShell>
  );
}

export function CronExpressionValidator() {
  const [input, setInput] = useState('*/5 * * * *');
  const [output, setOutput] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validate = () => {
    const parts = input.trim().split(/\s+/);
    if (parts.length !== 5 && parts.length !== 6) { setOutput('Expected 5 fields (minute hour day month weekday)'); setIsValid(false); return; }
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
    setIsValid(issues.length === 0);
    setOutput(issues.length ? issues.join('\n') : `Valid cron: ${parts.slice(0, 5).join(' ')}\n${desc.join('\n')}${parts[5] ? `\n(Cmd: ${parts.slice(5).join(' ')})` : ''}`);
    toast.success(issues.length ? 'Issues found' : 'Valid cron');
  };

  const presets = [
    { label: 'Every 5 min', apply: () => { setInput('*/5 * * * *'); validate(); } },
    { label: 'Daily at 3am', apply: () => { setInput('0 3 * * *'); validate(); } },
    { label: 'Weekly Monday', apply: () => { setInput('0 0 * * 1'); validate(); } },
    { label: 'Monthly 1st', apply: () => { setInput('0 0 1 * *'); validate(); } },
    { label: 'Clear', apply: () => { setInput(''); setOutput(''); } },
  ];

  const resultText = isValid ? '✓ Valid cron expression' : (output || 'Enter cron expression');

  return (
    <CalculatorShell title="Cron Expression Validator" result={resultText} onCalculate={validate} presets={presets} accent="emerald" downloadData={output} downloadFilename="cron-validation.txt">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Cron Expression</label>
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="*/5 * * * *"
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
        <p className="text-xs text-[var(--text-muted)]">5 fields: minute hour day month weekday (optional 6th: command)</p>
        <button onClick={validate} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors w-full sm:w-auto">Validate</button>

        {output && (
          <pre className={`p-4 rounded-xl font-mono text-sm whitespace-pre-wrap ${isValid ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-500/20'}`}>
            {output}
          </pre>
        )}
      </div>
    </CalculatorShell>
  );
}
