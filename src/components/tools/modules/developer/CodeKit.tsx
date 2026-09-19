"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { DualPanel } from '../shared/DualPanel';
import { CalcActions } from '../shared/CalcActions';
import * as acorn from 'acorn';
import DOMPurify from 'dompurify';

const CalcBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={onClick} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all active:scale-[0.98]">{label}</button>
);

const Result = ({ value }: { value: string }) => (
  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-[var(--bg-overlay)] rounded-lg px-2 py-1 break-all whitespace-pre-wrap">{value}</p>
);


function PresetBar({ presets }: { presets: { label: string; apply: () => void }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((p, i) => (
        <button key={i} onClick={p.apply}
          className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg text-[10px] font-medium hover:bg-[var(--accent)]/20 transition-colors">
          {p.label}
        </button>
      ))}
    </div>
  );
}

export function CodeObfuscator() {
  const [input, setInput] = useState('');
  const [level, setLevel] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [output, setOutput] = useState('');

  const presets = [
    { label: 'Simple function', apply: () => setInput('function greet(name) {\n  return "Hello, " + name;\n}') },
    { label: 'Class with methods', apply: () => setInput('class User {\n  constructor(name, age) {\n    this.name = name;\n    this.age = age;\n  }\n  greet() {\n    return `Hi, I am ${this.name}`;\n  }\n  getAge() {\n    return this.age;\n  }\n}') },
    { label: 'Async code', apply: () => setInput('async function fetchData(url) {\n  const res = await fetch(url);\n  const data = await res.json();\n  return data;\n}') },
  ];

  const obfuscate = () => {
    if (!input.trim()) { toast.error('Enter code to obfuscate'); return; }
    let result = '';
    if (level === 'light') {
      const encoded = btoa(unescape(encodeURIComponent(input)));
      result = `/* Light obfuscation */\nvar _0x1 = "${encoded}";\nvar _0x2 = decodeURIComponent(escape(atob(_0x1)));\n`;
    } else if (level === 'medium') {
      const hex = Array.from(input).map(c => '\\x' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
      const encoded = btoa(unescape(encodeURIComponent(input)));
      result = `/* Medium obfuscation */\nvar _0x_a = "${hex}";\nvar _0x_b = Function("return unescape(\"" + _0x_a + "\")")();\nvar _0x_c = "${encoded}";\n`;
    } else {
      const vars = Array.from({ length: 5 }, (_, i) => `_0x${(Math.random() * 0xffff | 0).toString(16)}`);
      const encoded = btoa(unescape(encodeURIComponent(input)));
      const chunks: string[] = [];
      for (let i = 0; i < encoded.length; i += 20) chunks.push(encoded.slice(i, i + 20));
      result = `/* Heavy obfuscation */\n`;
      chunks.forEach((c, i) => { result += `var ${vars[i % vars.length]}_${i} = "${c}";\n`; });
      result += `var _decoded = ${vars.map((v, i) => `${v}_${i}`).join(' + ')};\n`;
      result += `var _result = decodeURIComponent(escape(atob(_decoded)));\n`;
      const deadCode = `\n/* ${Array.from({ length: 3 }, () => 'if(Math.random()>0.5){void(0)}').join(' ')} */\n`;
      result += deadCode;
    }
    setOutput(result);
    toast.success(`Obfuscated (${level})`);
  };

  return (
    <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl space-y-3">
        <DualPanel
          input={<>
      <PresetBar presets={presets} />
      <select aria-label="Obfuscation level" value={level} onChange={e => setLevel(e.target.value as 'light' | 'medium' | 'heavy')}
        className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[10px] text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2">
        <option value="light">Light (Base64)</option>
        <option value="medium">Medium (Hex + Base64)</option>
        <option value="heavy">Heavy (Multi-var + Dead Code)</option>
      </select>
      <textarea aria-label="Heavy (Multi-var + Dead Code)" value={input} onChange={e => setInput(e.target.value)} placeholder="Paste code to obfuscate..."
        className="w-full h-28 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[9px] font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none" />
      <CalcBtn onClick={obfuscate} label="Obfuscate" />
                </>}
          output={<>
            {output ? <Result value={output} /> : <span className="text-[var(--text-muted)]">Result appears here</span>}
          </>}
          actions={<CalcActions result={output || ''} downloadData={output || ''} downloadFilename='obfuscated.js' />}
        />

    </div>
  );
}

export function CodeToCurlParser() {
  const [input, setInput] = useState('fetch("https://api.example.com/users", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json",\n    "Authorization": "Bearer token123"\n  },\n  body: JSON.stringify({ name: "John", email: "john@example.com" })\n})');
  const [output, setOutput] = useState<string | null>(null);

  const presets = [
    { label: 'fetch() call', apply: () => setInput('fetch("https://api.example.com/users", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json",\n    "Authorization": "Bearer token123"\n  },\n  body: JSON.stringify({ name: "John", email: "john@example.com" })\n})') },
    { label: 'axios call', apply: () => setInput('axios.post("https://api.example.com/data", {\n  name: "John",\n  email: "john@example.com"\n}, {\n  headers: {\n    "Authorization": "Bearer token123"\n  }\n})') },
    { label: 'XMLHttpRequest', apply: () => setInput('const xhr = new XMLHttpRequest();\nxhr.open("PUT", "https://api.example.com/users/1");\nxhr.setRequestHeader("Content-Type", "application/json");\nxhr.setRequestHeader("Authorization", "Bearer token123");\nxhr.send(JSON.stringify({ name: "Updated" }));') },
  ];

  const parse = () => {
    let method = 'GET', url = '', headers: string[] = [], body = '';

    // fetch() pattern
    const fetchMatch = input.match(/fetch\s*\(\s*["'`](.*?)["'`]/s);
    if (fetchMatch) {
      url = fetchMatch[1]!;
      const methodMatch = input.match(/method\s*:\s*["'`](\w+)["'`]/);
      if (methodMatch) method = methodMatch[1]!;
      const headerMatches = [...input.matchAll(/["'`](.*?)["'`]\s*:\s*["'`](.*?)["'`]/g)];
      headers = headerMatches.filter(m => m[1]!.toLowerCase().includes('content') || m[1]!.toLowerCase().includes('auth') || m[1]!.toLowerCase().includes('accept')).map(m => `-H '${m[1]}: ${m[2]}'`);
      const bodyMatch = input.match(/body\s*:\s*JSON\.stringify\((.*?)\)/s);
      if (bodyMatch) body = bodyMatch[1]!;
    }

    // axios pattern
    const axiosMatch = input.match(/axios\s*\.\s*(get|post|put|patch|delete)\s*\(\s*["'`](.*?)["'`]/s);
    if (axiosMatch) {
      method = axiosMatch[1]!.toUpperCase();
      url = axiosMatch[2]!;
      const axiosHeaders = input.match(/headers\s*:\s*\{([^}]+)\}/s);
      if (axiosHeaders) {
        const hm = [...axiosHeaders[1]!.matchAll(/["'`](.*?)["'`]\s*:\s*["'`](.*?)["'`]/g)];
        headers = hm.map(m => `-H '${m[1]}: ${m[2]}'`);
      }
      const axiosBody = input.match(/axios\s*\.\s*\w+\s*\([^)]*,\s*(\{[^}]+\})/s);
      if (axiosBody) body = axiosBody[1]!;
    }

    // XMLHttpRequest pattern
    const xhrMatch = input.match(/\.open\s*\(\s*["'`](\w+)["'`]\s*,\s*["'`](.*?)["'`]/s);
    if (xhrMatch) {
      method = xhrMatch[1]!;
      url = xhrMatch[2]!;
      const xhrHeaders = [...input.matchAll(/setRequestHeader\s*\(\s*["'`](.*?)["'`]\s*,\s*["'`](.*?)["'`]/g)];
      headers = xhrHeaders.map(m => `-H '${m[1]}: ${m[2]}'`);
      const xhrBody = input.match(/\.send\s*\((.*?)\)/s);
      if (xhrBody && xhrBody[1]!.trim() !== '') body = xhrBody[1]!;
    }

    // Fallback: raw curl
    if (!url) {
      const curlUrl = input.match(/https?:\/\/[^\s"']+/);
      if (curlUrl) url = curlUrl[0];
      const curlMethod = input.match(/-X\s+(\w+)/);
      if (curlMethod) method = curlMethod[1]!;
    }

    if (!url) { toast.error('Could not detect URL'); return; }

    const curlParts = [`curl -X ${method} '${url}'`];
    headers.forEach(h => curlParts.push(`  ${h}`));
    if (body) curlParts.push(`  -d '${body.trim()}'`);
    const curlCmd = curlParts.join(' \\\n');
    setOutput(curlCmd);
    toast.success('Parsed to curl');
  };

  return (
    <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl space-y-3">
        <DualPanel
          input={<>
      <PresetBar presets={presets} />
      <textarea aria-label="Paste fetch, axios, or XMLHttpRequest code..." value={input} onChange={e => setInput(e.target.value)} placeholder="Paste fetch, axios, or XMLHttpRequest code..."
        className="w-full h-28 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[9px] font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none" />
      <CalcBtn onClick={parse} label="Parse to Curl" />
                </>}
          output={<>
            {output ? <Result value={output} /> : <span className="text-[var(--text-muted)]">Result appears here</span>}
          </>}
          actions={<CalcActions result={output || ''} downloadData={output || ''} downloadFilename='curl-command.sh' />}
        />

    </div>
  );
}

export function JsSyntaxChecker() {
  const [code, setCode] = useState('const x = 1;');
  const [result, setResult] = useState<string | null>(null);
  const [issues, setIssues] = useState<{ line: number; col: number; msg: string; severity: string; suggestion: string }[]>([]);

  const presets = [
    { label: 'Valid JS', apply: () => { setCode('const greet = (name) => {\n  return `Hello, ${name}`;\n};'); } },
    { label: 'Missing semicolon', apply: () => { setCode('const x = 1\nconst y = 2\nconsole.log(x + y)'); } },
    { label: 'Undefined variable', apply: () => { setCode('function demo() {\n  console.log(undeclared);\n}'); } },
    { label: 'Syntax error', apply: () => { setCode('function broken( {\n  return 42\n}'); } },
  ];

  const check = () => {
    const found: typeof issues = [];
    try {
      const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
      const declaredVars = new Set<string>();
      const usedVars = new Set<string>();

      interface AstNode {
        type?: string;
        id?: { name?: string } | null;
        name?: string;
        [key: string]: unknown;
      }
      const walk = (node: unknown) => {
        if (!node || typeof node !== 'object') return;
        const n = node as AstNode;
        if (n.type === 'VariableDeclarator' && n.id?.name) declaredVars.add(n.id.name);
        if (n.type === 'FunctionDeclaration' && n.id?.name) declaredVars.add(n.id.name);
        if (n.type === 'Identifier' && n.name && !['console', 'JSON', 'Math', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Promise', 'Map', 'Set', 'Date', 'RegExp', 'Error', 'parseInt', 'parseFloat', 'undefined', 'NaN', 'Infinity', 'globalThis', 'window', 'document', 'process', 'require', 'module', 'exports'].includes(n.name)) {
          usedVars.add(n.name);
        }
        for (const key of Object.keys(n)) {
          if (key === 'type' || key === 'loc') continue;
          const val: unknown = n[key];
          if (Array.isArray(val)) val.forEach(walk);
          else if (val && typeof val === 'object') walk(val);
        }
      };
      ast.body.forEach(walk);

      usedVars.forEach(v => {
        if (!declaredVars.has(v)) {
          found.push({ line: 0, col: 0, msg: `Variable '${v}' used but never declared`, severity: 'warning', suggestion: `Declare '${v}' with let, const, or var before use` });
        }
      });

      const lines = code.split('\n');
      lines.forEach((line, i) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}') && !trimmed.endsWith(',') && !trimmed.endsWith('(') && !trimmed.endsWith(')') && trimmed !== '' && !/^\s*$/.test(trimmed)) {
          found.push({ line: i + 1, col: line.length, msg: 'Missing semicolon', severity: 'info', suggestion: 'Add ; at end of statement' });
        }
      });

      if (found.length === 0) {
        setResult(`✓ Valid JavaScript (${ast.body.length} statements parsed)`);
      } else {
        setResult(`✗ Found ${found.length} issue(s)`);
      }
      setIssues(found);
      toast.success(found.length === 0 ? 'No issues found' : `Found ${found.length} issue(s)`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '';
      const lineMatch = message.match(/line (\d+)/i) || message.match(/:(\d+):/);
      const line = lineMatch ? parseInt(lineMatch[1]!) : 0;
      const colMatch = message.match(/column (\d+)/i);
      const col = colMatch ? parseInt(colMatch[1]!) : 0;
      const msg = message || 'Unknown syntax error';
      found.push({ line, col, msg, severity: 'error', suggestion: 'Fix the syntax error at this position' });
      setResult(`✗ Syntax Error: ${msg}`);
      setIssues(found);
    }
  };

  return (
    <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl space-y-3">
        <DualPanel
          input={<>
      <PresetBar presets={presets} />
      <textarea aria-label="JavaScript code..." value={code} onChange={e => setCode(e.target.value)} placeholder="JavaScript code..."
        className="w-full h-28 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[9px] font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none" />
      <CalcBtn onClick={check} label="Check Syntax" />
                </>}
          output={<>
            {result ? <Result value={result} /> : <span className="text-[var(--text-muted)]">Result appears here</span>}
            {issues.length > 0 && (
              <div className="bg-[var(--bg-overlay)] rounded-lg p-2 space-y-1 max-h-32 overflow-y-auto">
                {issues.map((iss, i) => (
                  <div key={i} className="flex items-start gap-2 text-[9px] font-mono">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${iss.severity === 'error' ? 'bg-red-500' : iss.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                    <span className="text-[var(--text-secondary)]">{iss.line > 0 ? `L${iss.line}: ` : ''}{iss.msg} — <span className="text-emerald-600 dark:text-emerald-400">{iss.suggestion}</span></span>
                  </div>
                ))}
              </div>
            )}
          </>}
          actions={<CalcActions result={result + '\n\n' + issues.map(i => `[${i.severity.toUpperCase()}] L${i.line}: ${i.msg} → ${i.suggestion}`).join('\n')} downloadData={result + '\n\n' + issues.map(i => `[${i.severity.toUpperCase()}] L${i.line}: ${i.msg} → ${i.suggestion}`).join('\n')} downloadFilename='syntax-report.txt' />}
        />

    </div>
  );
}

export function PugToHtml() {
  const [input, setInput] = useState('div.container\n  h1.title Hello\n  p.content World');
  const [output, setOutput] = useState('');
  const [preview, setPreview] = useState(false);

  const presets = [
    { label: 'Simple page', apply: () => setInput('html\n  head\n    title My Page\n  body\n    h1 Welcome\n    p This is a simple page.') },
    { label: 'Form', apply: () => setInput('form(action="/submit" method="POST")\n  label(for="name") Name:\n  input#name(type="text" name="name" placeholder="Enter name")\n  label(for="email") Email:\n  input#email(type="email" name="email" placeholder="Enter email")\n  button(type="submit") Submit') },
    { label: 'Card layout', apply: () => setInput('div.card\n  h2.card-title Product Name\n  p.card-desc A great product description.\n  div.card-footer\n    span.price $29.99\n    button.btn Add to Cart') },
  ];

  const convert = () => {
    const lines = input.split('\n');
    const out: string[] = [];
    const indentStack: number[] = [];

    lines.forEach((line, lineIdx) => {
      if (!line.trim()) return;
      const indent = line.search(/\S/);
      const content = line.trim();

      while (indentStack.length > 0 && indentStack[indentStack.length - 1]! >= indent) {
        if (out.length > 0) {
          const lastLine = out[out.length - 1];
          const tagMatch = lastLine!.match(/^<(\w+)/);
          if (tagMatch && !['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tagMatch[1]!)) {
            out[out.length - 1] = lastLine + `</${tagMatch[1]}>`;
          }
        }
        indentStack.pop();
      }

      let tag = 'div';
      let attrs = '';
      let id = '';
      let classes: string[] = [];
      let text = '';
      let selfClosing = false;

      const tagMatch = content.match(/^(\w[\w-]*)/);
      if (tagMatch) tag = tagMatch[1]!;

      const idMatch = content.match(/#([\w-]+)/);
      if (idMatch) id = idMatch[1]!;

      const classMatches = [...content.matchAll(/\.([\w-]+)/g)];
      classes = classMatches.map(m => m[1]!);

      const parenMatch = content.match(/\(([^)]+)\)/);
      if (parenMatch) {
        const attrStr = parenMatch[1];
        const attrPairs = [...attrStr!.matchAll(/(\w[\w-]*)=["']([^"']*?)["']/g)];
        attrs = attrPairs.map(m => ` ${m[1]}="${m[2]}"`).join('');
        const attrBool = attrStr!.match(/(\w[\w-]*)(?:,\s*|$)/g);
        if (attrBool) {
          attrBool.forEach(a => {
            const name = a.replace(/[, ]/g, '').trim();
            if (name && !name.includes('=')) attrs += ` ${name}`;
          });
        }
      }

      const textAfterAttr = content.includes(')') ? content.slice(content.lastIndexOf(')') + 1).trim() : '';
      const textDirect = content.includes(' ') ? content.slice(content.indexOf(' ')).trim() : '';
      text = textAfterAttr || textDirect;
      if (text.startsWith('(') && text.endsWith(')')) text = '';

      const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link'];
      selfClosing = selfClosingTags.includes(tag);

      const classAttr = classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
      const idAttr = id ? ` id="${id}"` : '';
      const openTag = `<${tag}${idAttr}${classAttr}${attrs}>`;

      if (selfClosing) {
        out.push(`${openTag}`);
        indentStack.push(indent);
      } else if (text && !content.endsWith('{')) {
        out.push(`${openTag}${text}</${tag}>`);
      } else {
        out.push(`${openTag}`);
        indentStack.push(indent);
      }
    });

    while (indentStack.length > 0) {
      if (out.length > 0) {
        const lastLine = out[out.length - 1];
        const tagMatch = lastLine!.match(/^<(\w+)/);
        if (tagMatch && !['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tagMatch[1]!)) {
          out[out.length - 1] = lastLine + `</${tagMatch[1]}>`;
        }
      }
      indentStack.pop();
    }

    const html = out.join('\n');
    setOutput(html);
    toast.success('Converted to HTML');
  };

  return (
    <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl space-y-3">
        <DualPanel
          input={<>
      <PresetBar presets={presets} />
      <textarea aria-label="div.container&#10; h1 Hello&#10; p World" value={input} onChange={e => setInput(e.target.value)} placeholder="div.container&#10;  h1 Hello&#10;  p World"
        className="w-full h-28 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[9px] font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none" />
      <div className="flex gap-2">
        <CalcBtn onClick={convert} label="Convert" />
        {output && (
          <button onClick={() => setPreview(!preview)}
            className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all active:scale-[0.98]">
            {preview ? 'Hide Preview' : 'Live Preview'}
          </button>
        )}
      </div>
                </>}
          output={<>
            {preview && (
              <div className="bg-white rounded-lg border border-[var(--border-subtle)] p-4 max-h-40 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(output) }} className="text-[11px] text-gray-800" />
              </div>
            )}
            {output ? <Result value={output} /> : <span className="text-[var(--text-muted)]">Result appears here</span>}
          </>}
          actions={<CalcActions result={output || ''} downloadData={output || ''} downloadFilename='output.html' />}
        />

    </div>
  );
}
