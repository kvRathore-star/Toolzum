"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import * as msgpack from '@msgpack/msgpack';
import * as cbor from 'cbor-x';

export function IniToJsonConverter() {
  const [input, setInput] = useState('[database]\nhost = localhost\nport = 5432\n\n[app]\ndebug = true\nname = MyApp');
  const [output, setOutput] = useState('');

  const convert = () => {
    const result: Record<string, any> = {};
    let currentSection = '';
    input.split('\n').forEach(line => {
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
    setOutput(JSON.stringify(result, null, 2));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">INI to JSON Converter</h2>
        <textarea rows={5} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert to JSON</button>
        {output && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{output}</pre>}
      </div>
    </div>
  );
}

export function MessagePackInspector() {
  const [input, setInput] = useState('{"hello": "world", "nums": [1, 2, 3]}');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const inspect = () => {
    try {
      if (mode === 'encode') {
        const parsed = JSON.parse(input);
        const encoded = msgpack.encode(parsed);
        const hex = Array.from(new Uint8Array(encoded)).map(b => b.toString(16).padStart(2, '0')).join(' ');
        setOutput(`MessagePack encoded (${encoded.byteLength} bytes):\nHex: ${hex}\nBase64: ${btoa(String.fromCharCode(...new Uint8Array(encoded)))}`);
      } else {
        const binaryStr = atob(input.replace(/\s/g, ''));
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
        const decoded = msgpack.decode(bytes);
        setOutput(`MessagePack decoded:\n${JSON.stringify(decoded, null, 2)}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid input');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">MessagePack Inspector</h2>
        <div className="flex gap-2">
          <button onClick={() => setMode('encode')} className={`px-3 py-1.5 text-sm rounded-lg ${mode === 'encode' ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)]'}`}>Encode JSON → MsgPack</button>
          <button onClick={() => setMode('decode')} className={`px-3 py-1.5 text-sm rounded-lg ${mode === 'decode' ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)]'}`}>Decode Base64 MsgPack → JSON</button>
        </div>
        <textarea rows={4} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" placeholder={mode === 'encode' ? 'Enter JSON to encode' : 'Enter Base64 MessagePack to decode'} />
        <button onClick={inspect} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Inspect</button>
        {output && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{output}</pre>}
      </div>
    </div>
  );
}

export function CborInspector() {
  const [input, setInput] = useState('{"name": "test", "count": 42}');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const inspect = () => {
    try {
      if (mode === 'encode') {
        const parsed = JSON.parse(input);
        const encoded = cbor.encode(parsed);
        const hex = Array.from(encoded).map(b => b.toString(16).padStart(2, '0')).join(' ');
        setOutput(`CBOR encoded (${encoded.length} bytes):\nHex: ${hex}\nBase64: ${btoa(String.fromCharCode(...encoded))}`);
      } else {
        const binaryStr = atob(input.replace(/\s/g, ''));
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
        const decoded = cbor.decode(bytes);
        setOutput(`CBOR decoded:\n${JSON.stringify(decoded, null, 2)}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid input');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">CBOR Inspector</h2>
        <div className="flex gap-2">
          <button onClick={() => setMode('encode')} className={`px-3 py-1.5 text-sm rounded-lg ${mode === 'encode' ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)]'}`}>Encode JSON → CBOR</button>
          <button onClick={() => setMode('decode')} className={`px-3 py-1.5 text-sm rounded-lg ${mode === 'decode' ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)]'}`}>Decode Base64 CBOR → JSON</button>
        </div>
        <textarea rows={4} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" placeholder={mode === 'encode' ? 'Enter JSON to encode' : 'Enter Base64 CBOR to decode'} />
        <button onClick={inspect} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Inspect</button>
        {output && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{output}</pre>}
      </div>
    </div>
  );
}

export function DataAnonymizer() {
  const [input, setInput] = useState('Contact john@email.com or call 555-123-4567. IP: 192.168.1.1');
  const [output, setOutput] = useState('');

  const anonymize = () => {
    let result = input;
    result = result.replace(/[\w.-]+@[\w.-]+\.\w+/g, '***@***.***');
    result = result.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '***-***-****');
    result = result.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '***.***.***.***');
    setOutput(result);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Data Anonymizer</h2>
        <textarea rows={4} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={anonymize} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Anonymize</button>
        {output && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{output}</pre>}
      </div>
    </div>
  );
}

export function CodeToCurlConverter() {
  const [input, setInput] = useState("fetch('https://api.example.com/data', {\n  method: 'POST',\n  headers: {'Content-Type': 'application/json'},\n  body: JSON.stringify({key: 'value'})\n})");
  const [output, setOutput] = useState('');

  const convert = () => {
    let method = 'GET';
    let url = '';
    const headers: string[] = [];
    let body = '';

    const urlMatch = input.match(/['"](https?:\/\/[^'"]+)['"]/);
    if (urlMatch) url = urlMatch[1];
    if (/method:\s*['"](POST|PUT|DELETE|PATCH)['"]/i.test(input)) method = input.match(/method:\s*['"]([^'"]+)['"]/i)?.[1] || 'GET';
    else if (/fetch\(['"]/.test(input) && /body/.test(input)) method = 'POST';

    const bodyMatch = input.match(/body:\s*(JSON\.stringify\((.+)\)|['"](.+)['"])/);
    if (bodyMatch) body = bodyMatch[2] || bodyMatch[3] || '';

    const headerRegex = /['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g;
    let m;
    while ((m = headerRegex.exec(input)) !== null) {
      if (!m[1].toLowerCase().includes('method') && !m[1].toLowerCase().includes('body')) {
        headers.push(`-H '${m[1]}: ${m[2]}'`);
      }
    }

    let result = `curl -X ${method} '${url}'`;
    if (headers.length > 0) result += ` \\\n  ${headers.join(' \\\n  ')}`;
    if (body) result += ` \\\n  -d '${body}'`;
    setOutput(result);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Code to cURL Converter</h2>
        <textarea rows={5} value={input} onChange={e => setInput(e.target.value)} placeholder="Paste fetch/axios code"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert to cURL</button>
        {output && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{output}</pre>}
      </div>
    </div>
  );
}

export function CurlToCodeConverter() {
  const [input, setInput] = useState("curl -X POST 'https://api.example.com/data' \\\n  -H 'Content-Type: application/json' \\\n  -H 'Authorization: Bearer token' \\\n  -d '{\"key\":\"value\"}'");
  const [output, setOutput] = useState('');
  const [targetLang, setTargetLang] = useState<'fetch' | 'axios' | 'xhr' | 'python' | 'node'>('fetch');

  const convert = () => {
    try {
      const curl = input.trim();
      if (!curl.startsWith('curl')) { toast.error('Input must start with "curl"'); return; }

      let method = 'GET';
      let url = '';
      const headers: Record<string, string> = {};
      let body = '';

      const urlMatch = curl.match(/-X\s+(\w+)/);
      if (urlMatch) method = urlMatch[1];
      else if (curl.includes('-d') || curl.includes('--data')) method = 'POST';

      const urlMatch2 = curl.match(/['"](https?:\/\/[^'"]+)['"]/);
      if (urlMatch2) url = urlMatch2[1];

      const headerRegex = /-H\s+['"]([^:]+):\s*([^'"]+)['"]/g;
      let m;
      while ((m = headerRegex.exec(curl)) !== null) {
        headers[m[1]] = m[2];
      }

      const dataMatch = curl.match(/-d\s+['"]([^'"]*)['"]/);
      if (dataMatch) body = dataMatch[1];
      else {
        const dataMatch2 = curl.match(/--data\s+['"]([^'"]*)['"]/);
        if (dataMatch2) body = dataMatch2[1];
      }

      let result = '';
      if (targetLang === 'fetch') {
        const h = Object.entries(headers).map(([k, v]) => `      '${k}': '${v}'`).join(',\n');
        result = `fetch('${url}', {\n  method: '${method}',\n  headers: {\n${h}\n  }${body ? `,\n  body: JSON.stringify(${body.startsWith('{') ? body : `'${body}'`})` : ''}\n})`;
      } else if (targetLang === 'axios') {
        const h = Object.entries(headers).map(([k, v]) => `      '${k}': '${v}'`).join(',\n');
        result = `axios({\n  method: '${method}',\n  url: '${url}',\n  headers: {\n${h}\n  }${body ? `,\n  data: ${body.startsWith('{') ? body : `'${body}'`}` : ''}\n})`;
      } else if (targetLang === 'xhr') {
        const h = Object.entries(headers).map(([k, v]) => `  xhr.setRequestHeader('${k}', '${v}');`).join('\n');
        result = `const xhr = new XMLHttpRequest();\nxhr.open('${method}', '${url}');\n${h}\nxhr.onload = () => console.log(xhr.responseText);\n${body ? `xhr.send(${body.startsWith('{') ? body : `'${body}'`});` : 'xhr.send();'}`;
      } else if (targetLang === 'python') {
        const h = Object.entries(headers).map(([k, v]) => `    '${k}': '${v}'`).join(',\n');
        const bodyStr = body ? (body.startsWith('{') ? body : "'" + body + "'") : '';
        result = `import requests\n\nheaders = {\n${h}\n}\nresponse = requests.request(\n  '${method}',\n  '${url}',\n  headers=headers${bodyStr ? `,\n  json=${bodyStr}` : ''}\n)\nprint(response.text)`;
      } else if (targetLang === 'node') {
        const h = Object.entries(headers).map(([k, v]) => `    '${k}': '${v}'`).join(',\n');
        result = `const https = require('https');\n\nconst options = {\n  hostname: '${new URL(url).hostname}',\n  path: '${new URL(url).pathname}',\n  method: '${method}',\n  headers: {\n${h}\n  }\n};\n\nconst req = https.request(options, res => {\n  let data = '';\n  res.on('data', chunk => data += chunk);\n  res.on('end', () => console.log(data));\n});\n\n${body ? `req.write(${body.startsWith('{') ? body : `'${body}'`});\n` : ''}req.end();`;
      }

      setOutput(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to parse cURL');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">cURL to Code Converter</h2>
        <div className="flex flex-wrap gap-2">
          {['fetch', 'axios', 'xhr', 'python', 'node'].map(lang => (
            <button key={lang} onClick={() => setTargetLang(lang as any)} className={`px-3 py-1.5 text-sm rounded-lg ${targetLang === lang ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)]'}`}>{lang}</button>
          ))}
        </div>
        <textarea rows={6} value={input} onChange={e => setInput(e.target.value)} placeholder="Paste cURL command"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={convert} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Convert</button>
        {output && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-96 overflow-auto">{output}</pre>}
      </div>
    </div>
  );
}

export function JsonRpcBuilder() {
  const [method, setMethod] = useState('user.get');
  const [params, setParams] = useState('{"id": 1}');
  const [output, setOutput] = useState('');

  const build = () => {
    try {
      const parsed = params.trim() ? JSON.parse(params) : {};
      setOutput(JSON.stringify({ jsonrpc: '2.0', method, params: parsed, id: Date.now() }, null, 2));
    } catch { toast.error('Invalid JSON params'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">JSON-RPC Builder</h2>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Method</label>
          <input type="text" value={method} onChange={e => setMethod(e.target.value)} placeholder="method.name"
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Params (JSON)</label>
          <textarea rows={3} value={params} onChange={e => setParams(e.target.value)} placeholder='{"param": "value"}'
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={build} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Build</button>
        {output && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{output}</pre>}
      </div>
    </div>
  );
}

export function HarAnalyzer() {
  const [input, setInput] = useState('{"log": {"entries": [{"request": {"method": "GET", "url": "https://example.com"}, "response": {"status": 200, "content": {"size": 1234}}, "timings": {"wait": 100, "receive": 50}}]}}');
  const [output, setOutput] = useState('');

  const analyze = () => {
    try {
      const har = JSON.parse(input);
      const entries = har?.log?.entries || [];
      if (entries.length === 0) { setOutput('No entries found.'); return; }
      const totalSize = entries.reduce((s: number, e: any) => s + (e.response?.content?.size || 0), 0);
      const totalTime = entries.reduce((s: number, e: any) => s + (e.timings?.wait || 0) + (e.timings?.receive || 0), 0);
      const urls = entries.map((e: any) => e.request?.url);
      setOutput(`Entries: ${entries.length}\nTotal Size: ${(totalSize / 1024).toFixed(2)} KB\nTotal Time: ${totalTime.toFixed(0)}ms\nURLs:\n${urls.map((u: string) => `  ${u}`).join('\n')}`);
    } catch { toast.error('Invalid HAR JSON'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">HAR File Analyzer</h2>
        <textarea rows={6} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={analyze} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Analyze</button>
        {output && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{output}</pre>}
      </div>
    </div>
  );
}

export function LogAnalyzer() {
  const [input, setInput] = useState('2024-01-01 10:00:00 ERROR Connection failed\n2024-01-01 10:01:00 INFO Request received\n2024-01-01 10:02:00 WARN High memory usage\n2024-01-01 10:03:00 ERROR Timeout exceeded');
  const [output, setOutput] = useState('');

  const analyze = () => {
    const lines = input.trim().split('\n');
    const levels: Record<string, number> = {};
    lines.forEach(line => {
      const match = line.match(/\b(ERROR|INFO|WARN|DEBUG|FATAL|TRACE)\b/);
      if (match) levels[match[1]] = (levels[match[1]] || 0) + 1;
    });
    setOutput(`Total Lines: ${lines.length}\n\nBy Level:\n${Object.entries(levels).sort((a, b) => b[1] - a[1]).map(([k, v]) => `  ${k}: ${v}`).join('\n')}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Log File Analyzer</h2>
        <textarea rows={6} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={analyze} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Analyze</button>
        {output && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">{output}</pre>}
      </div>
    </div>
  );
}

export function PackageJsonValidator() {
  const [input, setInput] = useState('{"name": "my-app", "version": "1.0.0", "scripts": {"start": "node index.js"}, "dependencies": {"express": "^4.18.0"}}');
  const [output, setOutput] = useState('');

  const validate = () => {
    try {
      const obj = JSON.parse(input);
      const issues: string[] = [];
      if (!obj.name) issues.push('Missing "name"');
      else if (!/^[a-z0-9@_/-]+$/.test(obj.name)) issues.push('Name should be lowercase with no spaces');
      if (!obj.version) issues.push('Missing "version"');
      else if (!/^\d+\.\d+\.\d+$/.test(obj.version)) issues.push('Version should follow semver (x.y.z)');
      if (!obj.scripts || Object.keys(obj.scripts).length === 0) issues.push('No scripts defined');
      const hasDep = obj.dependencies && Object.keys(obj.dependencies).length > 0;
      const hasDevDep = obj.devDependencies && Object.keys(obj.devDependencies).length > 0;
      if (!hasDep && !hasDevDep) issues.push('No dependencies or devDependencies');
      if (issues.length === 0) issues.push('package.json looks valid!');
      setOutput(issues.join('\n'));
    } catch { toast.error('Invalid JSON'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">package.json Validator</h2>
        <textarea rows={6} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={validate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Validate</button>
        {output && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{output}</pre>}
      </div>
    </div>
  );
}

export function MimeFinder() {
  const [ext, setExt] = useState('.json');
  const [output, setOutput] = useState('');

  const MIME_DB: Record<string, string> = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.mjs': 'application/javascript',
    '.json': 'application/json', '.xml': 'application/xml', '.pdf': 'application/pdf',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
    '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/vnd.microsoft.icon',
    '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
    '.ogg': 'audio/ogg', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
    '.zip': 'application/zip', '.gz': 'application/gzip', '.txt': 'text/plain', '.csv': 'text/csv',
    '.yaml': 'text/yaml', '.yml': 'text/yaml', '.toml': 'application/toml', '.wasm': 'application/wasm',
  };

  const find = () => {
    const m = MIME_DB[ext.toLowerCase()];
    setOutput(m ? `MIME type: ${m}` : 'Unknown extension');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">MIME Type Finder</h2>
        <input type="text" value={ext} onChange={e => setExt(e.target.value.startsWith('.') ? e.target.value : `.${e.target.value}`)} placeholder=".ext"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-mono" />
        <button onClick={find} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Find MIME Type</button>
        {output && <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{output}</pre>}
      </div>
    </div>
  );
}
