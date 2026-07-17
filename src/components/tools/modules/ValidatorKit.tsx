"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle, FileType, FileCode, Clock, Clipboard } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'html' | 'yaml' | 'xml' | 'cron';

function CopyBtn({ text, label }: { text: string; label?: string }) {
  return (
    <button onClick={() => { clipboardWrite(text); toast.success(label ? `${label} copied!` : 'Copied!'); }}
      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"><Clipboard className="w-3 h-3" /> Copy</button>
  );
}

export default function ValidatorKit() {
  const [tab, setTab] = useState<Tab>('html');

  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${tab === v ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-xl w-fit">
        <TabBtn v="html" label="HTML/Lint" icon={CheckCircle} />
        <TabBtn v="yaml" label="YAML Tools" icon={FileType} />
        <TabBtn v="xml" label="XML Tools" icon={FileCode} />
        <TabBtn v="cron" label="Cron Tools" icon={Clock} />
      </div>
      {tab === 'html' && <HtmlLint />}
      {tab === 'yaml' && <YamlTools />}
      {tab === 'xml' && <XmlTools />}
      {tab === 'cron' && <CronTools />}
    </div>
  );
}

function HtmlLint() {
  const [htmlInput, setHtmlInput] = useState('<!DOCTYPE html><html><head><title>Test</title></head><body><p>Hello</p></body></html>');
  const [htmlOutput, setHtmlOutput] = useState('');

  const lintHtml = () => {
    const issues: string[] = [];
    if (!/<\!DOCTYPE\s+html>/i.test(htmlInput)) issues.push('Missing DOCTYPE declaration');
    const tagStack: string[] = [];
    const tagRegex = /<\/?(\w+)[^>]*>/g;
    let match;
    while ((match = tagRegex.exec(htmlInput)) !== null) {
      const tag = match[1].toLowerCase();
      if (['br', 'hr', 'img', 'input', 'meta', 'link', '!DOCTYPE'].includes(tag)) continue;
      if (match[0].startsWith('</')) {
        if (tagStack.length && tagStack[tagStack.length - 1] === tag) tagStack.pop();
        else issues.push(`Unexpected closing tag: </${tag}>`);
      } else {
        tagStack.push(tag);
      }
    }
    if (tagStack.length) issues.push(`Unclosed tags: ${tagStack.join(', ')}`);
    if (!issues.length) issues.push('No issues found');
    setHtmlOutput(issues.join('\n'));
    toast.success(`Found ${issues.length} issue(s)`);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
      <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">HTML Linter</h5>
      <div className="space-y-1">
        <label className="text-xs font-medium text-zinc-500">HTML</label>
        <textarea value={htmlInput} onChange={e => setHtmlInput(e.target.value)} placeholder="Paste HTML..."
          className="w-full h-32 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
      </div>
      <div className="flex gap-3">
        <button onClick={lintHtml} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Lint HTML</button>
        <button onClick={() => { const f = (tag: string) => `<${tag}></${tag}>`; setHtmlInput(`<!DOCTYPE html><html><head><title>Page</title></head><body>${f('div')}${f('p')}</body></html>`); setHtmlOutput(''); }}
          className="px-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-medium rounded-xl">Reset</button>
      </div>
      {htmlOutput && <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-zinc-900 dark:text-white">{htmlOutput}</pre>}
    </div>
  );
}

function YamlTools() {
  const [yamlInput, setYamlInput] = useState('name: John\nage: 30\nskills:\n  - JavaScript\n  - Python\n');
  const [yamlOutput, setYamlOutput] = useState('');
  const [yamlMode, setYamlMode] = useState<'validate' | 'to-json' | 'minify'>('validate');

  const processYaml = () => {
    const lines = yamlInput.split('\n');
    const issues: string[] = [];
    let valid = true;
    lines.forEach((line, i) => {
      if (!line.trim() || line.trim().startsWith('#')) return;
      const indent = line.search(/\S/);
      if (indent % 2 !== 0) issues.push(`Line ${i + 1}: Odd indentation (${indent} spaces)`);
      if (line.includes('\t')) issues.push(`Line ${i + 1}: Contains tabs (use spaces)`);
      if (!/^[\s]*[\w.-]+:/.test(line) && !/^[\s]*- /.test(line) && !line.startsWith('---'))
        issues.push(`Line ${i + 1}: Suspicious syntax`);
    });
    if (issues.length) valid = false;
    switch (yamlMode) {
      case 'validate':
        setYamlOutput(valid ? 'Valid YAML syntax' : issues.join('\n'));
        break;
      case 'to-json': {
        if (!valid) { setYamlOutput('Cannot convert: ' + issues.join('\n')); break; }
        const obj: Record<string, any> = {};
        let current: Record<string, any> = obj;
        const stack: Record<string, any>[] = [obj];
        lines.forEach(line => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return;
          if (/^[\w.-]+:/.test(trimmed)) {
            const [k, ...v] = trimmed.split(':');
            const val = v.join(':').trim();
            const nk = k.trim();
            if (val) current[nk] = isNaN(Number(val)) ? val.replace(/^["']|["']$/g, '') : Number(val);
            else { const next: Record<string, any> = {}; current[nk] = next; stack.push(current); current = next; }
          }
        });
        setYamlOutput(JSON.stringify(obj, null, 2));
        break;
      }
      case 'minify':
        setYamlOutput(lines.filter(l => l.trim() && !l.trim().startsWith('#')).join('\n'));
        break;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
      <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">YAML Tools</h5>
      <div className="flex gap-2">
        {[{ v: 'validate', l: 'Validate' }, { v: 'to-json', l: 'To JSON' }, { v: 'minify', l: 'Minify' }].map(({ v, l }) => (
          <button key={v} onClick={() => setYamlMode(v as typeof yamlMode)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${yamlMode === v ? 'bg-blue-600 text-white shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>{l}</button>
        ))}
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-zinc-500">YAML content</label>
        <textarea value={yamlInput} onChange={e => setYamlInput(e.target.value)} placeholder="Paste YAML..."
          className="w-full h-32 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
      </div>
      <button onClick={processYaml} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Process</button>
      {yamlOutput && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 max-h-48 overflow-y-auto text-emerald-600 dark:text-emerald-400">{yamlOutput}</pre><div className="mt-1"><CopyBtn text={yamlOutput} label="YAML result" /></div></div>}
    </div>
  );
}

function XmlTools() {
  const [xmlInput, setXmlInput] = useState('<root><item id="1">Hello</item><item id="2">World</item></root>');
  const [xmlOutput, setXmlOutput] = useState('');
  const [xmlMode, setXmlMode] = useState<'format' | 'minify' | 'validate'>('format');

  const processXml = () => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlInput, 'text/xml');
      const parseError = doc.querySelector('parsererror');
      if (xmlMode === 'validate') {
        setXmlOutput(parseError ? `Invalid XML: ${parseError.textContent}` : 'Valid XML');
        return;
      }
      if (parseError) { setXmlOutput(`Invalid XML: ${parseError.textContent}`); return; }
      if (xmlMode === 'minify') {
        setXmlOutput(xmlInput.replace(/>\s+</g, '><').trim());
        return;
      }
      const serialize = (node: Node, indent = 0): string => {
        if (node.nodeType === 3) {
          const text = node.textContent?.trim();
          return text ? ' '.repeat(indent) + text + '\n' : '';
        }
        if (node.nodeType !== 1) return '';
        const el = node as Element;
        const attrs = Array.from(el.attributes).map(a => ` ${a.name}="${a.value}"`).join('');
        const children = Array.from(el.childNodes);
        const hasText = children.some(c => c.nodeType === 3 && c.textContent?.trim());
        if (!hasText && children.length) {
          return ' '.repeat(indent) + `<${el.tagName}${attrs}>\n${children.map(c => serialize(c, indent + 2)).join('')}` + ' '.repeat(indent) + `</${el.tagName}>\n`;
        }
        const content = hasText ? el.textContent?.trim() : '';
        if (content) return ' '.repeat(indent) + `<${el.tagName}${attrs}>${content}</${el.tagName}>\n`;
        return ' '.repeat(indent) + `<${el.tagName}${attrs} />\n`;
      };
      setXmlOutput(serialize(doc.documentElement));
    } catch (e: unknown) {
      setXmlOutput(`Error: ${e instanceof Error ? e.message : 'XML processing failed'}`);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
      <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">XML Tools</h5>
      <div className="flex gap-2">
        {[{ v: 'format', l: 'Format' }, { v: 'minify', l: 'Minify' }, { v: 'validate', l: 'Validate' }].map(({ v, l }) => (
          <button key={v} onClick={() => setXmlMode(v as typeof xmlMode)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${xmlMode === v ? 'bg-blue-600 text-white shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>{l}</button>
        ))}
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-zinc-500">XML content</label>
        <textarea value={xmlInput} onChange={e => setXmlInput(e.target.value)} placeholder="Paste XML..."
          className="w-full h-32 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" />
      </div>
      <button onClick={processXml} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Process</button>
      {xmlOutput && <div className="relative"><pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 max-h-48 overflow-y-auto text-emerald-600 dark:text-emerald-400">{xmlOutput}</pre><div className="mt-1"><CopyBtn text={xmlOutput} label="XML result" /></div></div>}
    </div>
  );
}

function CronTools() {
  const [cronExpr, setCronExpr] = useState('*/5 * * * *');
  const [cronOutput, setCronOutput] = useState('');

  const CRON_EXPLAIN: Record<string, string> = {
    '* * * * *': 'Every minute',
    '*/5 * * * *': 'Every 5 minutes',
    '*/15 * * * *': 'Every 15 minutes',
    '0 * * * *': 'Every hour',
    '0 */6 * * *': 'Every 6 hours',
    '0 0 * * *': 'Every day at midnight',
    '0 0 * * 0': 'Every Sunday at midnight',
    '0 0 1 * *': 'Every 1st of the month',
    '0 0 * * 1-5': 'Weekdays at midnight',
    '*/30 * * * *': 'Every 30 minutes',
    '0 */12 * * *': 'Every 12 hours',
    '30 4 * * *': 'Daily at 4:30 AM',
    '0 9 * * 1-5': 'Weekdays at 9 AM',
    '0 0 * * 6,0': 'Every weekend at midnight',
  };

  const explainCron = () => {
    const trimmed = cronExpr.trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length !== 5) {
      setCronOutput('Invalid: expected 5 fields (minute hour day month weekday)');
      return;
    }
    if (CRON_EXPLAIN[trimmed]) {
      setCronOutput(CRON_EXPLAIN[trimmed]);
    } else {
      const labels = ['minute', 'hour', 'day', 'month', 'weekday'];
      const desc = parts.map((p, i) => `${labels[i]}: ${p}`).join(' | ');
      setCronOutput(desc + '\n\nTip: Click a preset below for common schedules.');
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
      <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Cron Expression Explainer</h5>
      <div className="flex gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-zinc-500">Cron expression</label>
          <input type="text" value={cronExpr} onChange={e => setCronExpr(e.target.value)} placeholder="* * * * *"
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        </div>
        <button onClick={explainCron} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl self-end">Explain</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(CRON_EXPLAIN).map(([expr, desc]) => (
          <button key={expr} onClick={() => { setCronExpr(expr); setCronOutput(desc); }}
            className="px-3 py-1.5 text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors" title={desc}>
            {expr}
          </button>
        ))}
      </div>
      {cronOutput && <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400">{cronOutput}</pre>}
    </div>
  );
}
