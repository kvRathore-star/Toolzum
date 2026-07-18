"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Key, FileCheck, Globe, Clipboard, ExternalLink } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'security' | 'config' | 'validators';

const SECRET_PATTERNS: [RegExp, string][] = [
  [/sk-[a-zA-Z0-9]{20,}/g, 'Stripe Secret Key'],
  [/ghp_[a-zA-Z0-9]{36,}/g, 'GitHub Personal Access Token'],
  [/gho_[a-zA-Z0-9]{36,}/g, 'GitHub OAuth Token'],
  [/xox[baprs]-[a-zA-Z0-9-]{24,}/g, 'Slack Token'],
  [/AIza[0-9A-Za-z_-]{35}/g, 'Google API Key'],
  [/AKIA[0-9A-Z]{16}/g, 'AWS Access Key'],
  [/-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/g, 'Private Key'],
  [/eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, 'JWT Token'],
  [/sk-[a-fA-F0-9]{32,}/g, 'OpenAI API Key'],
  [/pk-[a-fA-F0-9]{32,}/g, 'Publishable Key'],
  [/SG\.[a-zA-Z0-9_-]{22,}\.[a-zA-Z0-9_-]{22,}/g, 'SendGrid Key'],
  [/api[-_]?key['":\s=]+[a-zA-Z0-9]{16,}/gi, 'Potential API Key in config'],
  [/password['":\s=]+[^'"\s,]{6,}/gi, 'Potential password in config'],
  [/secret['":\s=]+[^'"\s,]{6,}/gi, 'Potential secret in config'],
];

function CopyBtn({ text, label }: { text: string; label?: string }) {
  return (
    <button onClick={() => { clipboardWrite(text); toast.success(label ? `${label} copied!` : 'Copied!'); }}
      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"><Clipboard className="w-3 h-3" /> Copy</button>
  );
}

export default function ScannerToolkit() {
  const [tab, setTab] = useState<Tab>('security');
  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${tab === v ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-xl w-fit">
        <TabBtn v="security" label="Security" icon={Key} />
        <TabBtn v="config" label="Config Linters" icon={FileCheck} />
        <TabBtn v="validators" label="Data Validators" icon={Globe} />
      </div>
      {tab === 'security' && <SecurityTools />}
      {tab === 'config' && <ConfigTools />}
      {tab === 'validators' && <ValidatorTools />}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
      <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{title}</h5>
      {children}
    </div>
  );
}

function SecurityTools() {
  const [scanInput, setScanInput] = useState('');
  const [scanOut, setScanOut] = useState('');
  const [secTxt, setSecTxt] = useState('Contact: mailto:security@example.com\nPreferred-Languages: en\nCanonical: https://example.com/.well-known/security.txt\nPolicy: https://example.com/security-policy.html\nEncryption: https://example.com/pgp-key.txt\nExpires: 2025-12-31T23:59:00Z');
  const [secTxtOut, setSecTxtOut] = useState('');
  const [robotsIn, setRobotsIn] = useState('User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /private/\nSitemap: https://example.com/sitemap.xml');
  const [robotsOut, setRobotsOut] = useState('');
  const [dnsIn, setDnsIn] = useState('');
  const [dnsOut, setDnsOut] = useState('');

  const scanSecrets = () => {
    if (!scanInput.trim()) { toast.error('Paste text to scan'); return; }
    const findings: string[] = [];
    SECRET_PATTERNS.forEach(([re, label]) => {
      re.lastIndex = 0;
      const matches = scanInput.match(re);
      if (matches) matches.forEach(m => findings.push(`${label}: ${m.slice(0, 20)}... (len: ${m.length})`));
    });
    if (findings.length) {
      setScanOut(`Found ${findings.length} potential secret(s):\n` + findings.join('\n'));
      toast.error(`${findings.length} secret(s) detected`);
    } else {
      setScanOut('No common secret patterns detected');
      toast.success('Clean scan');
    }
  };

  const genSecTxt = () => {
    if (!secTxt.trim()) { toast.error('Fill in security.txt fields'); return; }
    setSecTxtOut(secTxt);
    toast.success('security.txt generated');
  };

  const validateRobots = () => {
    if (!robotsIn.trim()) { toast.error('Enter robots.txt content'); return; }
    const lines = robotsIn.split('\n');
    const issues: string[] = [];
    const directives = ['user-agent', 'disallow', 'allow', 'sitemap', 'crawl-delay', 'host', 'clean-param'];
    lines.forEach((l, i) => {
      const trimmed = l.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const colon = trimmed.indexOf(':');
      if (colon < 0) { issues.push(`Line ${i + 1}: Missing colon — "${trimmed}"`); return; }
      const dir = trimmed.slice(0, colon).trim().toLowerCase();
      if (!directives.includes(dir)) issues.push(`Line ${i + 1}: Unknown directive "${dir}"`);
    });
    const hasUA = lines.some(l => l.trim().toLowerCase().startsWith('user-agent'));
    if (!hasUA) issues.push('Missing User-agent directive');
    setRobotsOut(issues.length ? issues.join('\n') : 'Valid robots.txt (' + lines.length + ' lines)');
    toast.success(issues.length ? `Found ${issues.length} issue(s)` : 'Valid!');
  };

  const validateDns = () => {
    if (!dnsIn.trim()) { toast.error('Enter a DNS record'); return; }
    const lines = dnsIn.split('\n');
    const results: string[] = [];
    lines.forEach((l, i) => {
      const parts = l.trim().split(/\s+/);
      if (parts.length < 2) { results.push(`Line ${i + 1}: Too few parts`); return; }
      const type = parts[parts.length - 2]?.toUpperCase();
      const val = parts[parts.length - 1];
      const validTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'SRV', 'CAA', 'PTR'];
      if (!validTypes.includes(type)) { results.push(`Line ${i + 1}: Unknown type "${type}"`); }
      if (type === 'A' && !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(val)) results.push(`Line ${i + 1}: Invalid A record IP`);
      if (type === 'AAAA' && !/^[0-9a-f:]+$/i.test(val)) results.push(`Line ${i + 1}: Invalid AAAA record`);
      if (type === 'MX' && !val.includes('.')) results.push(`Line ${i + 1}: Invalid MX record`);
      results.push(`Line ${i + 1}: ${type} ${val} \u2713`);
    });
    setDnsOut(results.join('\n'));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Secret Scanner">
        <textarea value={scanInput} onChange={e => setScanInput(e.target.value)}
          className="w-full h-28 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="Paste text/code to scan for secrets..." />
        <button onClick={scanSecrets} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Scan for Secrets</button>
        {scanOut && <div className="space-y-2"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 max-h-40 overflow-y-auto text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{scanOut}</pre></div>}
      </Card>

      <Card title="security.txt Generator">
        <textarea value={secTxt} onChange={e => setSecTxt(e.target.value)}
          className="w-full h-28 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
        <button onClick={genSecTxt} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate security.txt</button>
        {secTxtOut && <div className="space-y-2"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{secTxtOut}</pre><CopyBtn text={secTxtOut} label="security.txt" /></div>}
      </Card>

      <Card title="robots.txt Validator">
        <textarea value={robotsIn} onChange={e => setRobotsIn(e.target.value)}
          className="w-full h-24 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="User-agent: *\nAllow: /" />
        <button onClick={validateRobots} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Validate</button>
        {robotsOut && <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400">{robotsOut}</pre>}
      </Card>

      <Card title="DNS Record Validator">
        <textarea value={dnsIn} onChange={e => setDnsIn(e.target.value)}
          className="w-full h-24 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="example.com. 3600 A 192.168.1.1" />
        <button onClick={validateDns} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Validate Records</button>
        {dnsOut && <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{dnsOut}</pre>}
      </Card>
    </div>
  );
}

function ResultCard({ title, output }: { title: string; output: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-3">
      <h5 className="text-sm font-bold text-zinc-600 dark:text-zinc-400">{title}</h5>
      <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{output}</pre>
    </div>
  );
}

function ConfigTools() {
  const [dockerComposeIn, setDockerComposeIn] = useState('version: "3.8"\nservices:\n  web:\n    image: nginx:latest\n    ports:\n      - "80:80"\n    volumes:\n      - ./html:/usr/share/nginx/html');
  const [dcOut, setDcOut] = useState('');
  const [dockerfileIn, setDockerfileIn] = useState('FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]');
  const [dfOut, setDfOut] = useState('');
  const [htaccessIn, setHtaccessIn] = useState('RewriteEngine On\nRewriteRule ^old$ /new [R=301,L]\nErrorDocument 404 /404.html\nOptions -Indexes');
  const [htOut, setHtOut] = useState('');
  const [k8sIn, setK8sIn] = useState('apiVersion: v1\nkind: Pod\nmetadata:\n  name: my-pod\nspec:\n  containers:\n  - name: app\n    image: nginx:latest');
  const [k8sOut, setK8sOut] = useState('');
  const [ghaIn, setGhaIn] = useState('name: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm test');
  const [ghaOut, setGhaOut] = useState('');

  const validateYaml = (text: string): { valid: boolean; issues: string[] } => {
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
    return { valid: issues.length === 0, issues };
  };

  const keyWords = (yaml: string): string[] => {
    const kws = ['apiVersion', 'kind', 'metadata', 'spec', 'services', 'image', 'ports', 'volumes', 'environment', 'configMap', 'secret', 'deployment', 'service', 'pod', 'ingress', 'configmap', 'pvc', 'namespace'];
    return kws.filter(k => yaml.includes(k));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { title: 'Docker Compose Validator', state: dockerComposeIn, set: setDockerComposeIn, validate: () => {
          if (!dockerComposeIn.trim()) { toast.error('Enter docker-compose.yml'); return; }
          const res = validateYaml(dockerComposeIn);
          const kws = keyWords(dockerComposeIn);
          const hasServices = dockerComposeIn.includes('services:');
          const lines = [...res.issues, hasServices ? 'Has services:' : 'Missing services:', kws.length ? `Keywords: ${kws.join(', ')}` : ''];
          setDcOut(lines.join('\n')); toast.success(res.valid ? 'Valid YAML structure' : 'Issues found');
        }, out: dcOut },
        { title: 'Dockerfile Linter', state: dockerfileIn, set: setDockerfileIn, validate: () => {
          if (!dockerfileIn.trim()) { toast.error('Enter Dockerfile'); return; }
          const lines = dockerfileIn.split('\n');
          const issues: string[] = [];
          const validInstructions = ['FROM', 'RUN', 'CMD', 'LABEL', 'MAINTAINER', 'EXPOSE', 'ENV', 'ADD', 'COPY', 'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD', 'STOPSIGNAL', 'HEALTHCHECK', 'SHELL'];
          lines.forEach((l, i) => { const t = l.trim(); if (!t || t.startsWith('#')) return; const instr = t.split(/\s+/)[0].toUpperCase(); if (!validInstructions.includes(instr)) issues.push(`Line ${i + 1}: Unknown instruction "${instr}"`); });
          if (!lines.some(l => l.trim().toUpperCase().startsWith('FROM'))) issues.push('Missing FROM instruction');
          setDfOut(issues.length ? issues.join('\n') : 'Valid Dockerfile (' + lines.length + ' lines)');
          toast.success(issues.length ? 'Issues found' : 'Valid!');
        }, out: dfOut },
        { title: 'htaccess Validator', state: htaccessIn, set: setHtaccessIn, validate: () => {
          if (!htaccessIn.trim()) { toast.error('Enter .htaccess'); return; }
          const lines = htaccessIn.split('\n');
          const issues: string[] = [];
          const validDirs = ['RewriteEngine', 'RewriteRule', 'RewriteCond', 'RewriteBase', 'ErrorDocument', 'Redirect', 'RedirectMatch', 'Header', 'SetEnv', 'Deny', 'Allow', 'Order', 'Satisfy', 'AuthType', 'AuthName', 'AuthUserFile', 'Require', 'Options', 'AddType', 'AddHandler', 'AddCharset', 'DefaultType', 'FileETag', 'Limit', 'LimitExcept', 'php_flag', 'php_value', 'SetHandler', 'SetOutputFilter'];
          lines.forEach((l, i) => { const t = l.trim(); if (!t || t.startsWith('#')) return; const dir = t.split(/\s+/)[0]; if (!validDirs.includes(dir) && !dir.startsWith('<') && !dir.startsWith('</')) issues.push(`Line ${i + 1}: Unknown directive "${dir}"`); });
          setHtOut(issues.length ? issues.join('\n') : 'Valid .htaccess (' + lines.length + ' lines)');
          toast.success(issues.length ? 'Issues found' : 'Valid!');
        }, out: htOut },
        { title: 'Kubernetes YAML Validator', state: k8sIn, set: setK8sIn, validate: () => {
          if (!k8sIn.trim()) { toast.error('Enter Kubernetes YAML'); return; }
          const res = validateYaml(k8sIn);
          const lines = [...res.issues, k8sIn.includes('apiVersion:') ? 'Has apiVersion' : 'Missing apiVersion', k8sIn.includes('kind:') ? 'Has kind' : 'Missing kind', k8sIn.includes('metadata:') ? 'Has metadata' : 'Missing metadata'];
          setK8sOut(lines.join('\n')); toast.success(res.valid ? 'Valid K8s manifest' : 'Issues found');
        }, out: k8sOut },
        { title: 'GitHub Actions Validator', state: ghaIn, set: setGhaIn, validate: () => {
          if (!ghaIn.trim()) { toast.error('Enter GitHub Actions workflow'); return; }
          const res = validateYaml(ghaIn);
          const lines = [...res.issues, ghaIn.includes('name:') ? 'Has workflow name' : 'Missing name', ghaIn.includes('on:') ? 'Has trigger (on:)' : 'Missing on: trigger', ghaIn.includes('jobs:') ? 'Has jobs:' : 'Missing jobs:'];
          setGhaOut(lines.join('\n')); toast.success(res.valid ? 'Valid workflow' : 'Issues found');
        }, out: ghaOut },
      ].map(({ title, state, set, validate, out }) => (
        <Card key={title} title={title}>
          <textarea value={state} onChange={e => set(e.target.value)}
            className="w-full h-24 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
          <button onClick={validate} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Validate</button>
          {out && <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-32 overflow-y-auto">{out}</pre>}
        </Card>
      ))}
    </div>
  );
}

const LinkCard = ({ title, slug, desc }: { title: string; slug: string; desc: string }) => (
  <Link href={`/tools/${slug}`} className="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
    <div className="flex items-center gap-1">
      <h5 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline">{title}</h5>
      <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
    </div>
    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
  </Link>
);

function ValidatorTools() {
  const [geojsonIn, setGeojsonIn] = useState('{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[72.8777,19.0760]},"properties":{"name":"Mumbai"}}]}');
  const [geojsonOut, setGeojsonOut] = useState('');
  const [rssIn, setRssIn] = useState('<?xml version="1.0"?>\n<rss version="2.0">\n<channel>\n<title>My Feed</title>\n<link>https://example.com</link>\n<description>Test feed</description>\n<item>\n<title>Post 1</title>\n<link>https://example.com/1</link>\n<description>First post</description>\n</item>\n</channel>\n</rss>');
  const [rssOut, setRssOut] = useState('');
  const [sitemapIn, setSitemapIn] = useState('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>https://example.com/</loc><lastmod>2024-01-01</lastmod><priority>1.0</priority></url>\n<url><loc>https://example.com/about</loc><lastmod>2024-01-01</lastmod><priority>0.8</priority></url>\n</urlset>');
  const [sitemapOut, setSitemapOut] = useState('');
  const [xpathExpr, setXpathExpr] = useState('//div[@class="content"]/p');
  const [xpathIn, setXpathIn] = useState('<root><div class="content"><p>Hello</p></div></root>');
  const [xpathOut, setXpathOut] = useState('');
  const [cronIn, setCronIn] = useState('*/5 * * * *');
  const [cronOut, setCronOut] = useState('');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <LinkCard title="Email Validator" slug="email-format-validator" desc="Validate email addresses — check format, domain structure, TLD length, and MX record verification." />
      {[
        { title: 'GeoJSON Validator', validate: () => {
          try {
            const obj = JSON.parse(geojsonIn);
            const validTypes = ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection', 'Feature', 'FeatureCollection'];
            const check = (o: any): string[] => {
              const errs: string[] = [];
              if (!o) return ['Null object'];
              if (o.type && !validTypes.includes(o.type)) errs.push(`Unknown type: ${o.type}`);
              if (o.type === 'Feature' && !o.geometry) errs.push('Feature missing geometry');
              if (o.type === 'FeatureCollection' && !Array.isArray(o.features)) errs.push('FeatureCollection missing features array');
              if (o.geometry && o.geometry.type === 'Point' && (!Array.isArray(o.geometry.coordinates) || o.geometry.coordinates.length < 2)) errs.push('Point needs [lng, lat]');
              if (o.bbox && o.bbox.length !== 4) errs.push('bbox should be [west, south, east, north]');
              return errs;
            };
            const errs = check(obj);
            setGeojsonOut(errs.length ? errs.join('\n') : 'Valid GeoJSON');
            toast.success(errs.length ? 'Issues found' : 'Valid GeoJSON');
          } catch { toast.error('Invalid GeoJSON'); setGeojsonOut('Invalid JSON'); }
        }, out: geojsonOut, input: geojsonIn, set: setGeojsonIn, rows: 5 },
        { title: 'RSS Feed Validator', validate: () => {
          if (!rssIn.trim()) { toast.error('Enter RSS XML'); return; }
          const issues = [];
          if (!rssIn.includes('<rss') && !rssIn.includes('<feed')) issues.push('Missing <rss> or <feed> root');
          if (!rssIn.includes('<channel>') && !rssIn.includes('<feed>')) issues.push('Missing <channel> or <feed>');
          if (!rssIn.includes('<title>')) issues.push('Missing <title>');
          if (!rssIn.includes('<link>')) issues.push('Missing <link>');
          if (!rssIn.includes('<description>')) issues.push('Missing <description>');
          if (!rssIn.includes('<item>') && !rssIn.includes('<entry>')) issues.push('No items/entries found');
          const xmlStart = rssIn.trim().startsWith('<?xml');
          setRssOut((xmlStart ? 'Has XML declaration\n' : 'Missing XML declaration\n') + (issues.length ? issues.join('\n') : 'Valid RSS/Atom structure'));
          toast.success(issues.length ? 'Issues found' : 'Valid!');
        }, out: rssOut, input: rssIn, set: setRssIn, rows: 5 },
        { title: 'Sitemap Validator', validate: () => {
          if (!sitemapIn.trim()) { toast.error('Enter sitemap XML'); return; }
          const issues = [];
          if (!sitemapIn.trim().startsWith('<?xml')) issues.push('Missing XML declaration');
          if (!sitemapIn.includes('<urlset') && !sitemapIn.includes('<sitemapindex')) issues.push('Missing <urlset> or <sitemapindex> root');
          if (!sitemapIn.includes('<url>') && !sitemapIn.includes('<sitemap>')) issues.push('No <url> entries found');
          if (!sitemapIn.includes('<loc>')) issues.push('Missing <loc> (required in each url)');
          const urls = sitemapIn.match(/<loc>([^<]+)<\/loc>/g) || [];
          setSitemapOut(issues.length ? issues.join('\n') : `Valid sitemap (${urls.length} URL(s) found)`);
          toast.success(issues.length ? 'Issues found' : 'Valid sitemap');
        }, out: sitemapOut, input: sitemapIn, set: setSitemapIn, rows: 5 },
        { title: 'XPath Validator', validate: () => {
          if (!xpathIn.trim()) { toast.error('Enter XML/HTML'); return; }
          try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(xpathIn, 'text/xml');
            const parseError = doc.querySelector('parsererror');
            if (parseError) { setXpathOut('Invalid XML: ' + (parseError.textContent || '').slice(0, 100)); toast.error('Invalid XML'); return; }
            const result = doc.evaluate(xpathExpr, doc, null, XPathResult.ANY_TYPE, null);
            const results: string[] = [];
            let node: Node | null;
            while ((node = result.iterateNext())) results.push(node.textContent?.trim() || node.nodeName || '');
            setXpathOut(results.length ? `Found ${results.length} match(es):\n${results.join('\n')}` : 'No matches');
            toast.success(`Found ${results.length} match(es)`);
          } catch (e: unknown) { setXpathOut('XPath error: ' + (e instanceof Error ? e.message : '')); toast.error('Invalid XPath'); }
        }, out: xpathOut, custom: <><div className="space-y-1"><label className="text-xs font-medium text-zinc-500">XPath</label><input type="text" value={xpathExpr} onChange={e => setXpathExpr(e.target.value)} placeholder="//div/p" className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" /></div><div className="space-y-1"><label className="text-xs font-medium text-zinc-500">XML/HTML</label><textarea rows={3} value={xpathIn} onChange={e => setXpathIn(e.target.value)} placeholder="<root><div><p>text</p></div></root>" className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" /></div></> },
        { title: 'Cron Expression Validator', validate: () => {
          const parts = cronIn.trim().split(/\s+/);
          if (parts.length !== 5 && parts.length !== 6) { setCronOut('Expected 5 fields (minute hour day month weekday)'); return; }
          const ranges = [{ name: 'minute', min: 0, max: 59 }, { name: 'hour', min: 0, max: 23 }, { name: 'day', min: 1, max: 31 }, { name: 'month', min: 1, max: 12 }, { name: 'weekday', min: 0, max: 7 }];
          const issues: string[] = []; const desc: string[] = [];
          parts.slice(0, 5).forEach((p, i) => {
            const r = ranges[i];
            if (p === '*') { desc.push(`${r.name}: every`); return; }
            if (p.startsWith('*/')) { const n = parseInt(p.slice(2), 10); if (isNaN(n) || n < 1) issues.push(`${r.name}: invalid step "${p}"`); else desc.push(`${r.name}: every ${n} ${r.name}s`); return; }
            if (p.includes(',')) { const vals = p.split(',').map(v => parseInt(v, 10)); if (vals.some(v => isNaN(v) || v < r.min || v > r.max)) issues.push(`${r.name}: value(s) out of range ${r.min}-${r.max}`); else desc.push(`${r.name}: at ${p}`); return; }
            if (p.includes('-')) { const [a, b] = p.split('-').map(v => parseInt(v, 10)); if (isNaN(a) || isNaN(b) || a < r.min || b > r.max) issues.push(`${r.name}: range out of bounds`); else desc.push(`${r.name}: ${a}-${b}`); return; }
            const n = parseInt(p, 10); if (isNaN(n) || n < r.min || n > r.max) issues.push(`${r.name}: "${p}" not in range ${r.min}-${r.max}`); else desc.push(`${r.name}: at ${n}`);
          });
          setCronOut(issues.length ? issues.join('\n') : `Valid cron: ${parts.slice(0, 5).join(' ')}\n${desc.join('\n')}${parts[5] ? `\n(Cmd: ${parts.slice(5).join(' ')})` : ''}`);
          toast.success(issues.length ? 'Issues found' : 'Valid cron');
        }, out: cronOut, custom: <><div className="space-y-1"><label className="text-xs font-medium text-zinc-500">Cron Expression</label><input type="text" value={cronIn} onChange={e => setCronIn(e.target.value)} placeholder="*/5 * * * *" className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" /></div><p className="text-xs text-zinc-400">5 fields: minute hour day month weekday</p></> },
      ].map(({ title, validate, out, input, set, rows, custom }) => (
        <Card key={title} title={title}>
          {custom || <textarea value={input} onChange={e => set(e.target.value)}
            className={`w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y h-${(rows || 4) * 6}`} />}
          <button onClick={validate} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Validate</button>
          {out && <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-32 overflow-y-auto">{out}</pre>}
        </Card>
      ))}
    </div>
  );
}
