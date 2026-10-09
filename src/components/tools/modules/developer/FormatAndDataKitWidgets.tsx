"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { DualPanel } from '../shared/DualPanel';
import { CalcActions } from '../shared/CalcActions';
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
          let value: string | boolean | number = trimmed.slice(eqIdx + 1).trim();
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
        <textarea aria-label="INI to JSON Converter" rows={5} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={convert} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Convert to JSON</button>
        <DualPanel
          input={<>
        <textarea aria-label="INI to JSON Converter" rows={5} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={convert} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Convert to JSON</button>
          </>}
          output={<>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto min-h-24">{output || <span className="text-[var(--text-muted)]">Result appears here</span>}</pre>
          </>}
          actions={<CalcActions result={output} downloadData={output} downloadFilename='ini-to-json.txt' />}
        />
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
        setOutput('MessagePack encoded (' + encoded.byteLength + ' bytes):\nHex: ' + hex + '\nBase64: ' + btoa(String.fromCharCode(...new Uint8Array(encoded))));
      } else {
        const binaryStr = atob(input.replace(/\s/g, ''));
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
        const decoded = msgpack.decode(bytes);
        setOutput('MessagePack decoded:\n' + JSON.stringify(decoded, null, 2));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid input');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">MessagePack Inspector</h2>
        <div className="flex gap-2">
          <button onClick={() => setMode('encode')} className={'px-3 py-1.5 text-sm rounded-lg ' + (mode === 'encode' ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)]')}>Encode JSON → MsgPack</button>
          <button onClick={() => setMode('decode')} className={'px-3 py-1.5 text-sm rounded-lg ' + (mode === 'decode' ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)]')}>Decode Base64 MsgPack → JSON</button>
        </div>
        <textarea aria-label="Decode Base64 MsgPack → JSON" rows={4} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" placeholder={mode === 'encode' ? 'Enter JSON to encode' : 'Enter Base64 MessagePack to decode'} />
        <button onClick={inspect} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Inspect</button>
        <DualPanel
          input={<>
        <div className="flex gap-2">
          <button onClick={() => setMode('encode')} className={'px-3 py-1.5 text-sm rounded-lg ' + (mode === 'encode' ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)]')}>Encode JSON → MsgPack</button>
          <button onClick={() => setMode('decode')} className={'px-3 py-1.5 text-sm rounded-lg ' + (mode === 'decode' ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)]')}>Decode Base64 MsgPack → JSON</button>
        </div>
        <textarea aria-label="Decode Base64 MsgPack → JSON" rows={4} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" placeholder={mode === 'encode' ? 'Enter JSON to encode' : 'Enter Base64 MessagePack to decode'} />
        <button onClick={inspect} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Inspect</button>
          </>}
          output={<>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto min-h-24">{output || <span className="text-[var(--text-muted)]">Result appears here</span>}</pre>
          </>}
          actions={<CalcActions result={output} downloadData={output} downloadFilename='messagepack.txt' />}
        />
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
        setOutput('CBOR encoded (' + encoded.length + ' bytes):\nHex: ' + hex + '\nBase64: ' + btoa(String.fromCharCode(...encoded)));
      } else {
        const binaryStr = atob(input.replace(/\s/g, ''));
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
        const decoded = cbor.decode(bytes);
        setOutput('CBOR decoded:\n' + JSON.stringify(decoded, null, 2));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid input');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">CBOR Inspector</h2>
        <div className="flex gap-2">
          <button onClick={() => setMode('encode')} className={'px-3 py-1.5 text-sm rounded-lg ' + (mode === 'encode' ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)]')}>Encode JSON → CBOR</button>
          <button onClick={() => setMode('decode')} className={'px-3 py-1.5 text-sm rounded-lg ' + (mode === 'decode' ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)]')}>Decode Base64 CBOR → JSON</button>
        </div>
        <textarea aria-label="Decode Base64 CBOR → JSON" rows={4} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" placeholder={mode === 'encode' ? 'Enter JSON to encode' : 'Enter Base64 CBOR to decode'} />
        <button onClick={inspect} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Inspect</button>
        <DualPanel
          input={<>
        <div className="flex gap-2">
          <button onClick={() => setMode('encode')} className={'px-3 py-1.5 text-sm rounded-lg ' + (mode === 'encode' ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)]')}>Encode JSON → CBOR</button>
          <button onClick={() => setMode('decode')} className={'px-3 py-1.5 text-sm rounded-lg ' + (mode === 'decode' ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)]')}>Decode Base64 CBOR → JSON</button>
        </div>
        <textarea aria-label="Decode Base64 CBOR → JSON" rows={4} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" placeholder={mode === 'encode' ? 'Enter JSON to encode' : 'Enter Base64 CBOR to decode'} />
        <button onClick={inspect} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Inspect</button>
          </>}
          output={<>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto min-h-24">{output || <span className="text-[var(--text-muted)]">Result appears here</span>}</pre>
          </>}
          actions={<CalcActions result={output} downloadData={output} downloadFilename='cbor-inspect.txt' />}
        />
      </div>
    </div>
  );
}

export function DataAnonymizer() {
  const [input, setInput] = useState('Contact john@email.com or call 555-123-4567. SSN: 123-45-6789. Card: 4111-1111-1111-1111. IP: 192.168.1.1');
  const [output, setOutput] = useState('');
  const [detectedTypes, setDetectedTypes] = useState<Record<string, number>>({});

  const PRESETS: Record<string, string> = {
    pii: 'Name: John Doe\nEmail: john.doe@gmail.com\nPhone: (555) 123-4567\nSSN: 123-45-6789\nAddress: 123 Main St, Springfield, IL 62701',
    financial: 'Card: 4111-1111-1111-1111\nCard2: 5500-0000-0000-0004\nAccount: 1234567890\nRouting: 021000021\nIP: 10.0.0.1',
  };

  const anonymize = () => {
    let result = input;
    const counts: Record<string, number> = {};

    result = result.replace(/[\w.-]+@[\w.-]+\.\w+/g, function(match) {
      counts['email'] = (counts['email'] || 0) + 1;
      return '***@***.***';
    });
    result = result.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, function(match) {
      counts['phone'] = (counts['phone'] || 0) + 1;
      return '***-***-****';
    });
    result = result.replace(/\b\d{3}-\d{2}-\d{4}\b/g, function(match) {
      counts['SSN'] = (counts['SSN'] || 0) + 1;
      return '***-**-****';
    });
    result = result.replace(/\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})\b/g, function(match) {
      counts['credit card'] = (counts['credit card'] || 0) + 1;
      return '****-****-****-****';
    });
    result = result.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, function(match) {
      counts['IP address'] = (counts['IP address'] || 0) + 1;
      return '***.***.***.***';
    });

    setDetectedTypes(counts);
    setOutput(result);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setInput(PRESETS.pii!)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">PII Data</button>
        <button onClick={() => setInput(PRESETS.financial!)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Financial Data</button>
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Data Anonymizer</h2>
        <DualPanel
          input={<>
        <textarea aria-label="Data Anonymizer" rows={4} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={anonymize} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Anonymize</button>
          </>}
          output={<>
        {Object.keys(detectedTypes).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(detectedTypes).map(function(entry) {
              return (
                <span key={entry[0]} className="px-2 py-0.5 text-xs font-bold rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {entry[0]}: {entry[1]}
                </span>
              );
            })}
          </div>
        )}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[var(--bg-surface)] dark:bg-[var(--bg-elevated)] rounded-lg">
                <span className="font-bold text-[var(--text-muted)]">Before</span>
                <pre className="mt-1 whitespace-pre-wrap font-mono">{input}</pre>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <span className="font-bold text-emerald-600">After</span>
                <pre className="mt-1 whitespace-pre-wrap font-mono text-emerald-700 dark:text-emerald-300">{output || <span className="text-[var(--text-muted)]">Result appears here</span>}</pre>
              </div>
            </div>
          </>}
          actions={<CalcActions result={output} downloadData={output} downloadFilename='anonymized.txt' />}
        />
      </div>
    </div>
  );
}

export function CodeToCurlConverter() {
  const [input, setInput] = useState("fetch('https://api.example.com/data', {\n  method: 'POST',\n  headers: {'Content-Type': 'application/json'},\n  body: JSON.stringify({key: 'value'})\n})");
  const [output, setOutput] = useState('');

  const presets = [
    { label: 'Sample Fetch', apply: () => setInput("fetch('https://api.example.com/data', {\n  method: 'POST',\n  headers: {'Content-Type': 'application/json'},\n  body: JSON.stringify({key: 'value'})\n})") },
    { label: 'Sample Axios', apply: () => setInput("axios({\n  method: 'GET',\n  url: 'https://api.example.com/users',\n  headers: {\n    'Authorization': 'Bearer abc123'\n  }\n})") },
  ];

  
  
  const convert = () => {
    let method = 'GET';
    let url = '';
    const headers: string[] = [];
    let body = '';

    const urlMatch = input.match(/['"](https?:\/\/[^'"]+)['"]/);
    if (urlMatch) url = urlMatch[1] ?? "";
    if (/method:\s*['"](POST|PUT|DELETE|PATCH)['"]/i.test(input)) method = input.match(/method:\s*['"]([^'"]+)['"]/i)?.[1] || 'GET';
    else if (/fetch\(['"]/.test(input) && /body/.test(input)) method = 'POST';

    const bodyMatch = input.match(/body:\s*(JSON\.stringify\((.+)\)|['"](.+)['"])/);
    if (bodyMatch) body = bodyMatch[2] || bodyMatch[3] || '';

    const headerRegex = /['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g;
    let m;
    while ((m = headerRegex.exec(input)) !== null) {
      if (!m[1]!.toLowerCase().includes('method') && !m[1]!.toLowerCase().includes('body')) {
        headers.push("-H '" + m[1] + ': ' + m[2] + "'");
      }
    }

    let result = "curl -X " + method + " '" + url + "'";
    if (headers.length > 0) result += " \\\n  " + headers.join(' \\\n  ');
    if (body) result += " \\\n  -d '" + body + "'";
    setOutput(result);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Code to cURL Converter</h2>
        <DualPanel
          input={<>
        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map((p) => (
            <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {p.label}
            </button>
          ))}
        </div>
        <textarea aria-label="Paste fetch/axios code" rows={5} value={input} onChange={e => setInput(e.target.value)} placeholder="Paste fetch/axios code"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={convert} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Convert to cURL</button>
                  </>}
          output={<>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto min-h-24">{output || <span className="text-[var(--text-muted)]">Result appears here</span>}</pre>
          </>}
          actions={<CalcActions result={output} downloadData={output} downloadFilename='curl-command.txt' />}
        />
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
      if (urlMatch) method = urlMatch[1] ?? method;
      else if (curl.includes('-d') || curl.includes('--data')) method = 'POST';

      const urlMatch2 = curl.match(/['"](https?:\/\/[^'"]+)['"]/);
      if (urlMatch2) url = urlMatch2[1] ?? url;

      const headerRegex = /-H\s+['"]([^:]+):\s*([^'"]+)['"]/g;
      let m;
      while ((m = headerRegex.exec(curl)) !== null) {
        headers[m[1]!] = m[2] ?? "";
      }

      const dataMatch = curl.match(/-d\s+['"]([^'"]*)['"]/);
      if (dataMatch) body = dataMatch[1] ?? body;
      else {
        const dataMatch2 = curl.match(/--data\s+['"]([^'"]*)['"]/);
        if (dataMatch2) body = dataMatch2[1] ?? body;
      }

      let result = '';
      if (targetLang === 'fetch') {
        const h = Object.entries(headers).map(([k, v]) => "      '" + k + "': '" + v + "'").join(',\n');
        result = "fetch('" + url + "', {\n  method: '" + method + "',\n  headers: {\n" + h + "\n  }" + (body ? ",\n  body: JSON.stringify(" + (body.startsWith('{') ? body : "'" + body + "'") + ")" : '') + "\n})";
      } else if (targetLang === 'axios') {
        const h = Object.entries(headers).map(([k, v]) => "      '" + k + "': '" + v + "'").join(',\n');
        result = "axios({\n  method: '" + method + "',\n  url: '" + url + "',\n  headers: {\n" + h + "\n  }" + (body ? ",\n  data: " + (body.startsWith('{') ? body : "'" + body + "'") : '') + "\n})";
      } else if (targetLang === 'xhr') {
        const h = Object.entries(headers).map(([k, v]) => "  xhr.setRequestHeader('" + k + "', '" + v + "');").join('\n');
        result = "const xhr = new XMLHttpRequest();\nxhr.open('" + method + "', '" + url + "');\n" + h + "\nxhr.onload = () => console.log(xhr.responseText);\n" + (body ? "xhr.send(" + (body.startsWith('{') ? body : "'" + body + "'") + ");" : 'xhr.send();');
      } else if (targetLang === 'python') {
        const h = Object.entries(headers).map(([k, v]) => "    '" + k + "': '" + v + "'").join(',\n');
        const bodyStr = body ? (body.startsWith('{') ? body : "'" + body + "'") : '';
        result = "import requests\n\nheaders = {\n" + h + "\n}\nresponse = requests.request(\n  '" + method + "',\n  '" + url + "',\n  headers=headers" + (bodyStr ? ",\n  json=" + bodyStr : '') + "\n)\nprint(response.text)";
      } else if (targetLang === 'node') {
        const h = Object.entries(headers).map(([k, v]) => "    '" + k + "': '" + v + "'").join(',\n');
        result = "const https = require('https');\n\nconst options = {\n  hostname: '" + new URL(url).hostname + "',\n  path: '" + new URL(url).pathname + "',\n  method: '" + method + "',\n  headers: {\n" + h + "\n  }\n};\n\nconst req = https.request(options, res => {\n  let data = '';\n  res.on('data', chunk => data += chunk);\n  res.on('end', () => console.log(data));\n});\n\n" + (body ? "req.write(" + (body.startsWith('{') ? body : "'" + body + "'") + ");\n" : '') + "req.end();";
      }

      setOutput(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to parse cURL');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">cURL to Code Converter</h2>
        <div className="flex flex-wrap gap-2">
          {(['fetch', 'axios', 'xhr', 'python', 'node'] as const).map(lang => (
            <button key={lang} onClick={() => setTargetLang(lang)} className={'px-3 py-1.5 text-sm rounded-lg ' + (targetLang === lang ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)]')}>{lang}</button>
          ))}
        </div>
        <textarea aria-label="Paste cURL command" rows={6} value={input} onChange={e => setInput(e.target.value)} placeholder="Paste cURL command"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={convert} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Convert</button>
        <DualPanel
          input={<>
        <div className="flex flex-wrap gap-2">
          {(['fetch', 'axios', 'xhr', 'python', 'node'] as const).map(lang => (
            <button key={lang} onClick={() => setTargetLang(lang)} className={'px-3 py-1.5 text-sm rounded-lg ' + (targetLang === lang ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)]')}>{lang}</button>
          ))}
        </div>
        <textarea aria-label="Paste cURL command" rows={6} value={input} onChange={e => setInput(e.target.value)} placeholder="Paste cURL command"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={convert} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Convert</button>
          </>}
          output={<>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-96 overflow-auto border border-[var(--border-subtle)] min-h-24">{output || <span className="text-[var(--text-muted)]">Result appears here</span>}</pre>
          </>}
          actions={<CalcActions result={output} downloadData={output} downloadFilename='curl-code.txt' />}
        />
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
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">JSON-RPC Builder</h2>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Method</label>
          <input aria-label="Method" type="text" value={method} onChange={e => setMethod(e.target.value)} placeholder="method.name"
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Params (JSON)</label>
          <textarea aria-label="Params (JSON)" rows={3} value={params} onChange={e => setParams(e.target.value)} placeholder='{"param": "value"}'
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={build} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Build</button>
        <DualPanel
          input={<>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Method</label>
          <input aria-label="Method" type="text" value={method} onChange={e => setMethod(e.target.value)} placeholder="method.name"
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Params (JSON)</label>
          <textarea aria-label="Params (JSON)" rows={3} value={params} onChange={e => setParams(e.target.value)} placeholder='{"param": "value"}'
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={build} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Build</button>
          </>}
          output={<>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto min-h-24">{output || <span className="text-[var(--text-muted)]">Result appears here</span>}</pre>
          </>}
          actions={<CalcActions result={output} downloadData={output} downloadFilename='json-rpc.txt' />}
        />
      </div>
    </div>
  );
}

export function HarAnalyzer() {
  const [input, setInput] = useState('{"log": {"entries": [{"request": {"method": "GET", "url": "https://example.com/api/users", "headers": []}, "response": {"status": 200, "content": {"size": 1234}}, "timings": {"wait": 50, "receive": 30}, "startedDateTime": "2024-01-01T10:00:00Z"}, {"request": {"method": "POST", "url": "https://example.com/api/data", "headers": []}, "response": {"status": 201, "content": {"size": 512}}, "timings": {"wait": 100, "receive": 50}, "startedDateTime": "2024-01-01T10:00:01Z"}, {"request": {"method": "GET", "url": "https://cdn.example.com/style.css", "headers": []}, "response": {"status": 304, "content": {"size": 0}}, "timings": {"wait": 5, "receive": 1}, "startedDateTime": "2024-01-01T10:00:02Z"}]}}');
  const [output, setOutput] = useState('');
  const [domainBreakdown, setDomainBreakdown] = useState<Record<string, number>>({});
  const [statusDist, setStatusDist] = useState<Record<number, number>>({});
  const [waterfall, setWaterfall] = useState('');

  const PRESETS: Record<string, string> = {
    small: '{"log": {"entries": [{"request": {"method": "GET", "url": "https://example.com/"}, "response": {"status": 200, "content": {"size": 2048}}, "timings": {"wait": 20, "receive": 10}}, {"request": {"method": "GET", "url": "https://example.com/app.js"}, "response": {"status": 200, "content": {"size": 15000}}, "timings": {"wait": 30, "receive": 80}}]}}',
    cookies: '{"log": {"entries": [{"request": {"method": "GET", "url": "https://api.example.com/auth", "cookies": [{"name": "session", "value": "abc123"}]}, "response": {"status": 200, "content": {"size": 512}, "cookies": [{"name": "token", "value": "xyz"}]}, "timings": {"wait": 100, "receive": 50}}, {"request": {"method": "GET", "url": "https://api.example.com/data", "cookies": [{"name": "token", "value": "xyz"}]}, "response": {"status": 200, "content": {"size": 4096}}, "timings": {"wait": 80, "receive": 120}}]}}',
  };

  const analyze = () => {
    try {
      const har = JSON.parse(input);
      interface HarEntry {
        request?: { url?: string };
        response?: { status?: number; content?: { size?: number } };
        timings?: { wait?: number; receive?: number };
      }
      const entries: HarEntry[] = har?.log?.entries || [];
      if (entries.length === 0) { setOutput('No HAR entries found — paste a HAR object with log.entries (DevTools → Network → Export HAR).'); return; }

      const totalSize = entries.reduce((s: number, e: HarEntry) => s + (e.response?.content?.size || 0), 0);
      const totalTime = entries.reduce((s: number, e: HarEntry) => s + (e.timings?.wait || 0) + (e.timings?.receive || 0), 0);

      const domains: Record<string, number> = {};
      const statuses: Record<number, number> = {};
      const lines: string[] = [];
      let badUrls = 0;
      let unknownStatus = 0;
      let unknownSize = 0;

      entries.forEach((e: HarEntry, i: number) => {
        try {
          const u = new URL(e.request?.url || '');
          domains[u.hostname] = (domains[u.hostname] || 0) + 1;
        } catch { badUrls += 1; }
        const status = e.response?.status;
        if (typeof status === 'number') statuses[status] = (statuses[status] || 0) + 1;
        else unknownStatus += 1;
        // size -1/undefined means "unknown" in HAR — counted as 0 bytes
        // below, and reported here instead of silently absorbed.
        const sz = e.response?.content?.size;
        if (typeof sz !== 'number' || sz < 0) unknownSize += 1;
      });

      setDomainBreakdown(domains);
      setStatusDist(statuses);

      lines.push('HAR Analysis Report');
      lines.push('==================');
      lines.push('Entries: ' + entries.length);
      lines.push('Total Size: ' + (totalSize / 1024).toFixed(2) + ' KB');
      lines.push('Total Time: ' + totalTime.toFixed(0) + 'ms');
      lines.push('');

      lines.push('Domain Breakdown:');
      Object.entries(domains).forEach(function(entry) {
        lines.push('  ' + entry[0] + ': ' + entry[1] + ' request(s)');
      });
      lines.push('');

      lines.push('Status Distribution:');
      Object.entries(statuses).forEach(function(entry) {
        const pct = ((entry[1] / entries.length) * 100).toFixed(1);
        lines.push('  ' + entry[0] + ': ' + entry[1] + ' (' + pct + '%)');
      });
      // Partial input must read as partial — never present a clean report
      // over skipped entries.
      if (unknownStatus > 0) lines.push('  unknown status: ' + unknownStatus);
      if (badUrls > 0 || unknownSize > 0) {
        lines.push('');
        lines.push('Skipped/approximated:');
        if (badUrls > 0) lines.push('  ' + badUrls + ' entr' + (badUrls === 1 ? 'y' : 'ies') + ' with missing/malformed URLs (excluded from domain breakdown)');
        if (unknownSize > 0) lines.push('  ' + unknownSize + ' entr' + (unknownSize === 1 ? 'y' : 'ies') + ' with unknown body size (counted as 0 bytes)');
      }

      let wf = 'Waterfall (text):\n';
      entries.forEach((e: HarEntry, i: number) => {
        const wait = e.timings?.wait || 0;
        const recv = e.timings?.receive || 0;
        const total = wait + recv;
        const url = (e.request?.url || '').slice(0, 40);
        const bar = '#'.repeat(Math.min(Math.ceil(total / 20), 30));
        wf += '  ' + String(i + 1).padStart(2, ' ') + '. ' + url.padEnd(42) + ' ' + bar + ' ' + total + 'ms\n';
      });
      setWaterfall(wf);
      setOutput(lines.join('\n'));
    } catch { toast.error('Invalid HAR JSON'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setInput(PRESETS.small!)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Small HAR</button>
        <button onClick={() => setInput(PRESETS.cookies!)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">With cookies</button>
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">HAR File Analyzer</h2>
        <DualPanel
          input={<>
        <textarea aria-label="HAR File Analyzer" rows={6} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={analyze} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Analyze</button>
          </>}
          output={<>
        {Object.keys(statusDist).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusDist).map(function(entry) {
              const color = entry[0].startsWith('2') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : entry[0].startsWith('3') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : entry[0].startsWith('4') ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
              return <span key={entry[0]} className={'px-2 py-0.5 text-xs font-bold rounded ' + color}>{entry[0]}: {entry[1]}</span>;
            })}
          </div>
        )}
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto min-h-24">{output || <span className="text-[var(--text-muted)]">Result appears here</span>}</pre>
            {waterfall ? <pre className="text-xs font-mono bg-zinc-900 text-green-400 rounded-lg p-3 whitespace-pre-wrap max-h-48 overflow-y-auto">{waterfall}</pre> : null}
          </>}
          actions={<CalcActions result={output + (waterfall ? '\n\n' + waterfall : '')} downloadData={output + (waterfall ? '\n\n' + waterfall : '')} downloadFilename='har-report.txt' />}
        />
      </div>
    </div>
  );
}

export function LogAnalyzer() {
  const [input, setInput] = useState('2024-01-01 10:00:00 ERROR [app] Connection failed to db:5432\n2024-01-01 10:00:01 INFO [http] GET /api/users 200 45ms\n2024-01-01 10:00:02 WARN [app] High memory usage: 85%\n2024-01-01 10:00:03 ERROR [http] POST /api/data 500 1200ms\n2024-01-01 10:00:04 INFO [http] GET /api/health 200 5ms');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState<{ total: number; errorRate: string; statusDist: Record<string, number> }>({ total: 0, errorRate: '0%', statusDist: {} });

  const PRESETS: Record<string, string> = {
    apache: '127.0.0.1 - frank [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326\n127.0.0.1 - frank [10/Oct/2000:13:55:37 -0700] "GET /nonexistent HTTP/1.0" 404 289\n127.0.0.1 - frank [10/Oct/2000:13:55:38 -0700] "POST /api/data HTTP/1.1" 500 1024',
    nginx: '2024/01/01 10:00:00 [error] 12345#0: *1 connection refused\n2024/01/01 10:00:01 [notice] 12345#0: *2 client: 192.168.1.1\n2024/01/01 10:00:02 [warn] 12345#0: *3 upstream response too slow',
  };

  const analyze = () => {
    const lines = input.trim().split('\n');
    const levels: Record<string, number> = {};
    const statusDist: Record<string, number> = {};
    const ips: Record<string, number> = {};
    const urls: string[] = [];
    let errorCount = 0;

    lines.forEach(function(line) {
      const levelMatch = line.match(/\b(ERROR|INFO|WARN|DEBUG|FATAL|TRACE|error|notice|warn|crit)\b/i);
      if (levelMatch) {
        const lvl = levelMatch[1]!.toUpperCase();
        levels[lvl] = (levels[lvl] || 0) + 1;
        if (lvl === 'ERROR' || lvl === 'FATAL' || lvl === 'CRIT') errorCount++;
      }

      const statusMatch = line.match(/\s(\d{3})\s/);
      if (statusMatch) {
        const s = statusMatch[1] ?? "";
        statusDist[s] = (statusDist[s] ?? 0) + 1;
      }

      const ipMatch = line.match(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/);
      if (ipMatch) ips[ipMatch[1]!] = (ips[ipMatch[1]!] ?? 0) + 1;

      const urlMatch = line.match(/"([A-Z]+) ([^ "]+)/);
      if (urlMatch && urlMatch[2] !== '-') urls.push(urlMatch[2] ?? "");
    });

    const errorRate = lines.length > 0 ? ((errorCount / lines.length) * 100).toFixed(1) : '0';
    setStats({ total: lines.length, errorRate: errorRate + '%', statusDist });

    let report = 'Log Analysis Report\n';
    report += '===================\n';
    report += 'Total lines: ' + lines.length + '\n';
    report += 'Error rate: ' + errorRate + '%\n\n';

    report += 'Log Levels:\n';
    Object.entries(levels).sort((a, b) => b[1] - a[1]).forEach(function(entry) {
      report += '  ' + entry[0] + ': ' + entry[1] + '\n';
    });

    if (Object.keys(statusDist).length > 0) {
      report += '\nHTTP Status Codes:\n';
      Object.entries(statusDist).sort((a, b) => b[1] - a[1]).forEach(function(entry) {
        report += '  ' + entry[0] + ': ' + entry[1] + '\n';
      });
    }

    if (Object.keys(ips).length > 0) {
      report += '\nTop IPs:\n';
      Object.entries(ips).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(function(entry) {
        report += '  ' + entry[0] + ': ' + entry[1] + '\n';
      });
    }

    if (urls.length > 0) {
      report += '\nURLs accessed:\n';
      [...new Set(urls)].forEach(function(u) { report += '  ' + u + '\n'; });
    }

    setOutput(report);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setInput(PRESETS.apache!)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Apache access</button>
        <button onClick={() => setInput(PRESETS.nginx!)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Nginx error</button>
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Log File Analyzer</h2>
        <DualPanel
          input={<>
        <textarea aria-label="Log File Analyzer" rows={6} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={analyze} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Analyze</button>
          </>}
          output={<>
        {stats.total > 0 && (
          <div className="flex gap-4 text-xs">
            <span className="px-2 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent)] dark:bg-[var(--accent)]/10 dark:text-[var(--accent)]">Lines: {stats.total}</span>
            <span className="px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Errors: {stats.errorRate}</span>
          </div>
        )}
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto min-h-24">{output || <span className="text-[var(--text-muted)]">Result appears here</span>}</pre>
          </>}
          actions={<CalcActions result={output} downloadData={output} downloadFilename='log-analysis.txt' />}
        />
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
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">package.json Validator</h2>
        <textarea aria-label="package.json Validator" rows={6} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={validate} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Validate</button>
        <DualPanel
          input={<>
        <textarea aria-label="package.json Validator" rows={6} value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={validate} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Validate</button>
          </>}
          output={<>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto min-h-24">{output || <span className="text-[var(--text-muted)]">Result appears here</span>}</pre>
          </>}
          actions={<CalcActions result={output} downloadData={output} downloadFilename='package-json.txt' />}
        />
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
    setOutput(m ? 'MIME type: ' + m : 'Unknown extension');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">MIME Type Finder</h2>
        <input aria-label="MIME Type Finder" type="text" value={ext} onChange={e => setExt(e.target.value.startsWith('.') ? e.target.value : '.' + e.target.value)} placeholder=".ext"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-mono" />
        <button onClick={find} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Find MIME Type</button>
        <DualPanel
          input={<>
        <input aria-label="MIME Type Finder" type="text" value={ext} onChange={e => setExt(e.target.value.startsWith('.') ? e.target.value : '.' + e.target.value)} placeholder=".ext"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-mono" />
        <button onClick={find} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Find MIME Type</button>
          </>}
          output={<>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto min-h-24">{output || <span className="text-[var(--text-muted)]">Result appears here</span>}</pre>
          </>}
          actions={<CalcActions result={output} downloadData={output} downloadFilename='mime-type.txt' />}
        />
      </div>
    </div>
  );
}
