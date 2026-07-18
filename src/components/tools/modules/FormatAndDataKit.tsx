"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

type Tab = 'formats' | 'data' | 'codeconv' | 'analyzers';

const TABS: { key: Tab; label: string }[] = [
  { key: 'formats', label: 'Formats' },
  { key: 'data', label: 'Data Tools' },
  { key: 'codeconv', label: 'Code Convert' },
  { key: 'analyzers', label: 'Analyzers' },
];

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 ${className}`}>{children}</div>;
}

function LinkCard({ title, href, desc }: { title: string; href: string; desc: string }) {
  return (
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">{title}</h4>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">{desc}</p>
      <a href={href} className="inline-block w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm text-center transition-all">Open →</a>
    </Card>
  );
}

function IniToJson() {
  const [ini, setIni] = useState('[database]\nhost = localhost\nport = 5432\n\n[app]\ndebug = true\nname = MyApp');
  const [json, setJson] = useState('');

  const convert = () => {
    const result: Record<string, any> = {};
    let currentSection = '';
    ini.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        currentSection = trimmed.slice(1, -1);
        result[currentSection] = {};
      } else if (trimmed && !trimmed.startsWith(';') && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let value: any = trimmed.slice(eqIdx + 1).trim();
          if (value === 'true') value = true;
          else if (value === 'false') value = false;
          else if (!isNaN(Number(value))) value = Number(value);
          if (currentSection) result[currentSection][key] = value;
          else result[key] = value;
        }
      }
    });
    setJson(JSON.stringify(result, null, 2));
  };

  return (
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">INI ↔ JSON</h4>
      <textarea rows={4} value={ini} onChange={e => setIni(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
      <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">→ JSON</button>
      {json && <textarea readOnly rows={4} value={json} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
    </Card>
  );
}

function MsgpackInspector() {
  const [json, setJson] = useState('{"hello": "world", "nums": [1, 2, 3]}');
  const [hex, setHex] = useState('');
  const [info, setInfo] = useState('');

  const encode = () => {
    try {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(JSON.stringify(json));
      setHex(Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' '));
      setInfo(`JSON encoded as UTF-8: ${bytes.length} bytes`);
    } catch { toast.error('Invalid JSON'); }
  };

  return (
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">MessagePack Inspector (Sim)</h4>
      <textarea rows={4} value={json} onChange={e => setJson(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
      <button onClick={encode} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Inspect</button>
      {hex && <><div className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono break-all">{hex}</div><p className="text-xs text-zinc-400 mt-1">{info}</p></>}
    </Card>
  );
}

function CborInspector() {
  const [json, setJson] = useState('{"name": "test", "count": 42}');
  const [hex, setHex] = useState('');
  const [info, setInfo] = useState('');

  const encode = () => {
    try {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(JSON.stringify(json));
      const majorTypes = bytes.map(b => (b >> 5) & 7).join(',');
      setHex(Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' '));
      setInfo(`CBOR-like encoding: ${bytes.length} bytes | Major types: [${majorTypes.slice(0, 20)}]`);
    } catch { toast.error('Invalid JSON'); }
  };

  return (
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">CBOR Inspector (Sim)</h4>
      <textarea rows={4} value={json} onChange={e => setJson(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
      <button onClick={encode} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Inspect</button>
      {hex && <><div className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono break-all">{hex}</div><p className="text-xs text-zinc-400 mt-1">{info}</p></>}
    </Card>
  );
}

function ExcelSheetMerger() {
  const [sheets, setSheets] = useState('[Sheet1]\nid,name\n1,Alice\n2,Bob\n\n[Sheet2]\nid,score\n1,95\n2,87');
  const [merged, setMerged] = useState('');

  const merge = () => {
    const sections = sheets.split(/\[(.+?)\]/).slice(1);
    const allRows: string[] = [];
    let mergedLines: string[] = [];
    sections.forEach((s, i) => {
      if (i % 2 === 1) {
        const lines = s.trim().split('\n');
        if (i === 1) { mergedLines = [...lines]; }
        else { mergedLines = mergedLines.slice(0, 1).concat(lines.slice(1).map((l, idx) => mergedLines[idx + 1] ? `${mergedLines[idx + 1]},${l.split(',').slice(1).join(',')}` : l)); }
      }
    });
    setMerged(mergedLines.join('\n'));
  };

  return (
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Excel Sheet Merger (Sim)</h4>
      <textarea rows={5} value={sheets} onChange={e => setSheets(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
      <button onClick={merge} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Merge</button>
      {merged && <textarea readOnly rows={5} value={merged} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
    </Card>
  );
}

function DataAnonymizer() {
  const [text, setText] = useState('Contact john@email.com or call 555-123-4567. IP: 192.168.1.1');
  const [anonymized, setAnonymized] = useState('');

  const anonymize = () => {
    let result = text;
    result = result.replace(/[\w.-]+@[\w.-]+\.\w+/g, '***@***.***');
    result = result.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '***-***-****');
    result = result.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '***.***.***.***');
    setAnonymized(result);
  };

  return (
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Data Anonymizer</h4>
      <textarea rows={4} value={text} onChange={e => setText(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
      <button onClick={anonymize} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Anonymize</button>
      {anonymized && <textarea readOnly rows={4} value={anonymized} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
    </Card>
  );
}

function CodeToCurlConverter() {
  const [code, setCode] = useState("fetch('https://api.example.com/data', {\n  method: 'POST',\n  headers: {'Content-Type': 'application/json'},\n  body: JSON.stringify({key: 'value'})\n})");
  const [curl, setCurl] = useState('');

  const convert = () => {
    let result = code;
    let method = 'GET';
    let url = '';
    let headers: string[] = [];
    let body = '';

    const urlMatch = code.match(/['"](https?:\/\/[^'"]+)['"]/);
    if (urlMatch) url = urlMatch[1];

    if (/method:\s*['"](POST|PUT|DELETE|PATCH)['"]/i.test(code)) {
      method = code.match(/method:\s*['"]([^'"]+)['"]/i)?.[1] || 'GET';
    } else if (/method['"]?\s*:\s*['"](POST|PUT|DELETE|PATCH)['"]/i.test(code)) {
      method = 'POST';
    } else if (/fetch\(['"]/.test(code) && /body/.test(code)) {
      method = 'POST';
    }

    const bodyMatch = code.match(/body:\s*(JSON\.stringify\((.+)\)|['"](.+)['"])/);
    if (bodyMatch) body = bodyMatch[2] || bodyMatch[3] || '';

    const headerRegex = /['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g;
    let m;
    while ((m = headerRegex.exec(code)) !== null) {
      if (!m[1].toLowerCase().includes('method') && !m[1].toLowerCase().includes('body')) {
        headers.push(`-H '${m[1]}: ${m[2]}'`);
      }
    }

    result = `curl -X ${method} '${url}'`;
    if (headers.length > 0) result += ` \\\n  ${headers.join(' \\\n  ')}`;
    if (body) result += ` \\\n  -d '${body}'`;
    setCurl(result);
  };

  return (
    <Card className="md:col-span-2">
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Code → cURL Converter</h4>
      <textarea rows={4} value={code} onChange={e => setCode(e.target.value)} placeholder="Paste fetch/axios/request code" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
      <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">→ cURL</button>
      {curl && <textarea readOnly rows={4} value={curl} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
    </Card>
  );
}

function CurlToCodeConverter() {
  const [curl, setCurl] = useState("curl -X POST 'https://api.example.com/data' -H 'Content-Type: application/json' -d '{\"key\":\"value\"}'");
  const [code, setCode] = useState('');

  const convert = () => {
    const methodMatch = curl.match(/-X\s+(\w+)/);
    const method = methodMatch ? methodMatch[1] : (/-d\s/.test(curl) ? 'POST' : 'GET');
    const urlMatch = curl.match(/['"](https?:\/\/[^'"]+)['"]/);
    const url = urlMatch ? urlMatch[1] : '';
    const headerMatches = [...curl.matchAll(/-H\s+['"]([^'"]+)['"]/g)];
    const headers: Record<string, string> = {};
    headerMatches.forEach(m => { const [k, ...v] = m[1].split(/:\s*/); headers[k] = v.join(': '); });
    const bodyMatch = curl.match(/-d\s+['"](.+)['"]/);
    const body = bodyMatch ? bodyMatch[1] : '';

    let output = `fetch('${url}', {\n  method: '${method}',\n  headers: ${JSON.stringify(headers, null, 4)}`;
    if (body) output += `,\n  body: JSON.stringify(${body})`;
    output += '\n})';
    setCode(output);
  };

  return (
    <Card className="md:col-span-2">
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">cURL → Code Converter</h4>
      <textarea rows={4} value={curl} onChange={e => setCurl(e.target.value)} placeholder="Paste cURL command" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
      <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">→ fetch()</button>
      {code && <textarea readOnly rows={6} value={code} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
    </Card>
  );
}

function JsonRpcBuilder() {
  const [method, setMethod] = useState('user.get');
  const [params, setParams] = useState('{"id": 1}');
  const [rpc, setRpc] = useState('');

  const build = () => {
    try {
      const parsed = params.trim() ? JSON.parse(params) : {};
      const req = { jsonrpc: '2.0', method, params: parsed, id: Date.now() };
      setRpc(JSON.stringify(req, null, 2));
    } catch { toast.error('Invalid JSON params'); }
  };

  return (
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">JSON-RPC Builder</h4>
      <input type="text" value={method} onChange={e => setMethod(e.target.value)} placeholder="Method" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm mb-2" />
      <textarea rows={3} value={params} onChange={e => setParams(e.target.value)} placeholder='{"param": "value"}' className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
      <button onClick={build} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Build</button>
      {rpc && <textarea readOnly rows={5} value={rpc} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
    </Card>
  );
}

function HarAnalyzer() {
  const [harJson, setHarJson] = useState('{"log": {"entries": [{"request": {"method": "GET", "url": "https://example.com", "headers": []}, "response": {"status": 200, "content": {"size": 1234}, "headers": []}, "timings": {"wait": 100, "receive": 50}}]}}');
  const [analysis, setAnalysis] = useState('');

  const analyze = () => {
    try {
      const har = JSON.parse(harJson);
      const entries = har?.log?.entries || [];
      if (entries.length === 0) { setAnalysis('No entries found.'); return; }
      const totalSize = entries.reduce((s: number, e: any) => s + (e.response?.content?.size || 0), 0);
      const totalTime = entries.reduce((s: number, e: any) => s + (e.timings?.wait || 0) + (e.timings?.receive || 0), 0);
      const statuses = entries.map((e: any) => e.response?.status);
      const urls = entries.map((e: any) => e.request?.url);
      setAnalysis(`Entries: ${entries.length}\nTotal Size: ${(totalSize / 1024).toFixed(2)} KB\nTotal Time: ${totalTime.toFixed(0)}ms\nStatuses: ${statuses.join(', ')}\nURLs:\n${urls.map((u: string) => `  ${u}`).join('\n')}`);
    } catch { toast.error('Invalid HAR JSON'); }
  };

  return (
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">HAR File Analyzer</h4>
      <textarea rows={5} value={harJson} onChange={e => setHarJson(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
      <button onClick={analyze} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Analyze</button>
      {analysis && <textarea readOnly rows={6} value={analysis} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
    </Card>
  );
}

function LogAnalyzer() {
  const [logs, setLogs] = useState('2024-01-01 10:00:00 ERROR Connection failed\n2024-01-01 10:01:00 INFO Request received\n2024-01-01 10:02:00 WARN High memory usage\n2024-01-01 10:03:00 ERROR Timeout exceeded');
  const [stats, setStats] = useState('');

  const analyze = () => {
    const lines = logs.trim().split('\n');
    const levels: Record<string, number> = {};
    lines.forEach(line => {
      const match = line.match(/\b(ERROR|INFO|WARN|DEBUG|FATAL|TRACE)\b/);
      if (match) levels[match[1]] = (levels[match[1]] || 0) + 1;
    });
    setStats(`Total Lines: ${lines.length}\n\nBy Level:\n${Object.entries(levels).sort((a, b) => b[1] - a[1]).map(([k, v]) => `  ${k}: ${v}`).join('\n')}`);
  };

  return (
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">Log File Analyzer</h4>
      <textarea rows={5} value={logs} onChange={e => setLogs(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
      <button onClick={analyze} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Analyze</button>
      {stats && <textarea readOnly rows={6} value={stats} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
    </Card>
  );
}

function PackageJsonValidator() {
  const [pkg, setPkg] = useState('{"name": "my-app", "version": "1.0.0", "scripts": {"start": "node index.js"}, "dependencies": {"express": "^4.18.0"}}');
  const [validation, setValidation] = useState('');

  const validate = () => {
    try {
      const obj = JSON.parse(pkg);
      const issues: string[] = [];
      if (!obj.name) issues.push('❌ Missing "name"');
      else if (!/^[a-z0-9@_/-]+$/.test(obj.name)) issues.push('⚠️ Name should be lowercase with no spaces');
      if (!obj.version) issues.push('❌ Missing "version"');
      else if (!/^\d+\.\d+\.\d+$/.test(obj.version)) issues.push('⚠️ Version should follow semver (x.y.z)');
      if (!obj.scripts || Object.keys(obj.scripts).length === 0) issues.push('⚠️ No scripts defined');
      const hasDep = obj.dependencies && Object.keys(obj.dependencies).length > 0;
      const hasDevDep = obj.devDependencies && Object.keys(obj.devDependencies).length > 0;
      if (!hasDep && !hasDevDep) issues.push('⚠️ No dependencies or devDependencies');
      if (issues.length === 0) issues.push('✅ package.json looks valid!');
      setValidation(issues.join('\n'));
    } catch { toast.error('Invalid JSON'); }
  };

  return (
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">package.json Validator</h4>
      <textarea rows={5} value={pkg} onChange={e => setPkg(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono" />
      <button onClick={validate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Validate</button>
      {validation && <textarea readOnly rows={5} value={validation} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-xs font-mono mt-2" />}
    </Card>
  );
}

function MimeFinder() {
  const [ext, setExt] = useState('.json');
  const [mime, setMime] = useState('');

  const mimeDb: Record<string, string> = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.mjs': 'application/javascript',
    '.json': 'application/json', '.xml': 'application/xml', '.pdf': 'application/pdf',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
    '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/vnd.microsoft.icon',
    '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
    '.ogg': 'audio/ogg', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
    '.otf': 'font/otf', '.zip': 'application/zip', '.gz': 'application/gzip',
    '.tar': 'application/x-tar', '.txt': 'text/plain', '.csv': 'text/csv', '.yaml': 'text/yaml',
    '.yml': 'text/yaml', '.toml': 'application/toml', '.wasm': 'application/wasm',
    '.cjs': 'application/javascript',
  };

  const find = () => {
    const m = mimeDb[ext.toLowerCase()];
    setMime(m ? `MIME: ${m}` : 'Unknown extension');
  };

  return (
    <Card>
      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 text-sm">MIME Type Finder</h4>
      <input type="text" value={ext} onChange={e => setExt(e.target.value.startsWith('.') ? e.target.value : `.${e.target.value}`)} placeholder=".ext" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
      <button onClick={find} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-2">Find</button>
      {mime && <p className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono">{mime}</p>}
    </Card>
  );
}

export default function FormatAndDataKit() {
  const [tab, setTab] = useState<Tab>('formats');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${tab === t.key ? 'bg-blue-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}>{t.label}</button>
        ))}
      </div>
      {tab === 'formats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <IniToJson />
          <LinkCard title="JSON ↔ TOML" href="/tools/toml-converter" desc="Bidirectional JSON to TOML conversion" />
          <LinkCard title="JSON → Toon" href="/tools/json-toon-converter" desc="Convert JSON to human-readable Toon format" />
          <div className="grid grid-cols-2 gap-6">
            <MsgpackInspector />
            <CborInspector />
          </div>
        </div>
      )}
      {tab === 'data' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LinkCard title="CSV Data Cleaner" href="/tools/csv-data-cleaner" desc="Trim, dedup, email lowecasing, phone digit-stripping" />
          <ExcelSheetMerger />
          <LinkCard title="CSV Statistics" href="/tools/csv-statistics" desc="Per-column stats: count, sum, avg, min, max" />
          <DataAnonymizer />
        </div>
      )}
      {tab === 'codeconv' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CodeToCurlConverter />
          <CurlToCodeConverter />
          <JsonRpcBuilder />
        </div>
      )}
      {tab === 'analyzers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HarAnalyzer />
          <LogAnalyzer />
          <PackageJsonValidator />
          <MimeFinder />
        </div>
      )}
    </div>
  );
}
