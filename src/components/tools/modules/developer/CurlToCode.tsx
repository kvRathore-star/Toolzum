"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

type Target = 'fetch' | 'axios' | 'xhr' | 'python' | 'php';

export default function CurlToCode() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [target, setTarget] = useState<Target>('fetch');
  const [includeHeaders, setIncludeHeaders] = useState(true);

  const convert = (curl: string, t: Target) => {
    if (!curl.trim()) { setOutput(''); return; }
    try {
      const urlMatch = curl.match(/curl\s+(?:-X\s+\w+\s+)?['"]?([^'"\s]+\.[^'"\s]+)['"]?/);
      const methodMatch = curl.match(/-X\s+(\w+)/);
      const headerMatches = [...curl.matchAll(/-H\s+['"]([^'"]+)['"]/g)];
      const dataMatch = curl.match(/(?:--data|-d)\s+['"]([^'"]+)['"]/);
      const method = methodMatch?.[1] || (dataMatch ? 'POST' : 'GET');
      const url = urlMatch?.[1] || '';
      const headers = headerMatches.map(m => m[1]);
      const body = dataMatch?.[1] || '';

      let code = '';
      switch (t) {
        case 'fetch': {
          code = `fetch('${url}', {\n  method: '${method}',\n${includeHeaders && headers.length ? `  headers: {\n${headers.map(h => { const [k, ...v] = h.split(': '); return `    '${k}': '${v.join(': ')}'`; }).join(',\n')}\n  },\n` : ''}${body ? `  body: '${body}',\n` : ''}})\n  .then(res => res.json())\n  .then(console.log);`;
          break;
        }
        case 'axios': {
          code = `axios({\n  method: '${method}',\n  url: '${url}',\n${includeHeaders && headers.length ? `  headers: {\n${headers.map(h => { const [k, ...v] = h.split(': '); return `    '${k}': '${v.join(': ')}'`; }).join(',\n')}\n  },\n` : ''}${body ? `  data: '${body}',\n` : ''}})\n  .then(res => console.log(res.data));`;
          break;
        }
        case 'xhr': {
          code = `const xhr = new XMLHttpRequest();\nxhr.open('${method}', '${url}');\n${includeHeaders ? headers.map(h => { const [k, ...v] = h.split(': '); return `xhr.setRequestHeader('${k}', '${v.join(': ')}');`; }).join('\n') : ''}\nxhr.onload = () => console.log(JSON.parse(xhr.responseText));\n${body ? `xhr.send('${body}');` : "xhr.send();"}`;
          break;
        }
        case 'python': {
          code = `import requests\n\nurl = '${url}'\n${includeHeaders && headers.length ? `headers = {\n${headers.map(h => { const [k, ...v] = h.split(': '); return `    '${k}': '${v.join(': ')}'`; }).join(',\n')}\n}\n` : ''}${body ? `data = '${body}'\n` : ''}\nresponse = requests.${method.toLowerCase()}(${['get', 'post', 'put', 'patch', 'delete'].includes(method.toLowerCase()) ? method.toLowerCase() : 'request'}(url${includeHeaders && headers.length ? ', headers=headers' : ''}${body ? ', data=data' : ''}))\nprint(response.json())`;
          break;
        }
        case 'php': {
          code = `$ch = curl_init();\ncurl_setopt($ch, CURLOPT_URL, '${url}');\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\ncurl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${method}');\n${includeHeaders ? headers.map(h => { const [k, ...v] = h.split(': '); return `curl_setopt($ch, CURLOPT_HTTPHEADER, ['${k}: ${v.join(': ')}']);`; }).join('\n') : ''}${body ? `\ncurl_setopt($ch, CURLOPT_POSTFIELDS, '${body}');` : ''}\n$response = curl_exec($ch);\ncurl_close($ch);\n$result = json_decode($response, true);\nvar_dump($result);`;
          break;
        }
      }
      setOutput(code);
    } catch { setOutput(''); toast.error('Could not parse cURL command'); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-[var(--bg-surface)] rounded-xl p-1">
          {(['fetch', 'axios', 'xhr', 'python', 'php'] as Target[]).map(t => (
            <button key={t} onClick={() => { setTarget(t); if (input) convert(input, t); }} className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-all ${target === t ? 'bg-[var(--bg-elevated)] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-[var(--text-secondary)]'}`}>{t === 'xhr' ? 'XHR' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
          <input type="checkbox" checked={includeHeaders} onChange={() => setIncludeHeaders(!includeHeaders)} className="rounded border-zinc-300 dark:border-zinc-600" />
          Headers
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea value={input} onChange={e => { setInput(e.target.value); convert(e.target.value, target); }} placeholder="Paste cURL command..." className="w-full h-[350px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono focus:border-[var(--accent)] transition-colors" />
        <div className="relative">
          <textarea value={output} readOnly placeholder="Generated code..." className="w-full h-[350px] bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono" />
          {output && <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="absolute top-3 right-3 text-[10px] text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 bg-white dark:bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)] transition-colors">Copy</button>}
        </div>
      </div>
    </div>
  );
}
