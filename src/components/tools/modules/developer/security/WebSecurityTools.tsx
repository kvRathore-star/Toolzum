"use client";

import React, { useState } from 'react';
import { Section, Input } from './_shared';
import { clipboardWrite } from "@/lib/clipboard";
import { toast } from 'react-hot-toast';


export function HttpSecurityChecker() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const sitePresets = ['https://google.com', 'https://github.com', 'https://cloudflare.com'];
  const check = () => {
    if (!input.trim()) { setOutput('Please enter a URL'); return; }
    setOutput(`HTTP Security Headers Analysis for ${input}

⚠ Server-side check not available in browser
Expected security headers for production sites:

✓ Strict-Transport-Security (HSTS)
  max-age=31536000; includeSubDomains
✓ X-Content-Type-Options: nosniff
✓ X-Frame-Options: DENY or SAMEORIGIN
✓ Content-Security-Policy
✓ Referrer-Policy
✓ Permissions-Policy
  X-XSS-Protection: 0 (deprecated)

To check manually, run:
  curl -sI ${input} | grep -i security
  curl -sI ${input} | grep -i content-security`);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (output) { clipboardWrite(output).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } }); } };
  return (
    <Section title="HTTP Security Headers Checker">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {sitePresets.map(s => <button key={s} onClick={() => { setInput(s); }} className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors">{s.replace('https://', '')}</button>)}
      </div>
      <Input label="Website URL" value={input} onChange={setInput} placeholder="https://example.com" />
      <button onClick={check} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors">Analyze Headers</button>
      {output && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-rose-400">
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200">{output}</pre>
          <button onClick={copy} className="mt-3 px-3 py-1.5 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}


export function ContentSecurityPolicyGenerator() {
  const [directives, setDirectives] = useState("default-src 'self'\nscript-src 'self'\nstyle-src 'self' 'unsafe-inline'\nimg-src 'self' data:\nfont-src 'self'\nconnect-src 'self'\nframe-ancestors 'none'\nbase-uri 'self'\nform-action 'self'");
  const [csp, setCsp] = useState('');
  const cspPresets = [
    { label: 'Strict', v: "default-src 'self'\nscript-src 'self'\nstyle-src 'self'\nimg-src 'self'\nfont-src 'self'\nconnect-src 'self'\nframe-ancestors 'none'\nbase-uri 'self'\nform-action 'self'" },
    { label: 'Moderate', v: "default-src 'self'\nscript-src 'self' 'unsafe-inline'\nstyle-src 'self' 'unsafe-inline'\nimg-src 'self' data: https:\nfont-src 'self'\nconnect-src 'self'\nframe-ancestors 'self'\nbase-uri 'self'\nform-action 'self'" },
    { label: 'Permissive', v: "default-src 'self'\nscript-src 'self' 'unsafe-inline' 'unsafe-eval'\nstyle-src 'self' 'unsafe-inline'\nimg-src 'self' data: https: blob:\nfont-src 'self' https:\nconnect-src 'self' https:\nframe-src 'self'\nframe-ancestors 'self'\nbase-uri 'self'\nform-action 'self'" },
  ];
  const gen = (d?: string) => {
    const lines = (d !== undefined ? d : directives).split('\n').filter(l => l.trim());
    if (d !== undefined) setDirectives(d);
    setCsp(lines.join('; '));
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (csp) { clipboardWrite(csp).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } }); } };
  return (
    <Section title="Content Security Policy Generator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {cspPresets.map(p => <button key={p.label} onClick={() => gen(p.v)} className="px-2.5 py-1 text-xs rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 border border-teal-500/20 transition-colors">{p.label}</button>)}
      </div>
      <Input label="Directives (one per line)" rows={8} value={directives} onChange={v => { setDirectives(v); setCsp(''); }} />
      <button onClick={() => gen()} className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors">Generate CSP</button>
      {csp && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-teal-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-zinc-600 dark:text-[var(--text-muted)]">CSP Header Value</span>
            <button onClick={copy} className="px-2.5 py-1 text-xs bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 font-mono text-xs break-all text-zinc-800 dark:text-zinc-200">{csp}</div>
          <p className="text-xs text-zinc-500 mt-2">Directives: {csp.split(';').length} · Length: {csp.length} chars</p>
        </div>
      )}
    </Section>
  );
}


export function CorsInspector() {
  const [origin, setOrigin] = useState('');
  const [methods, setMethods] = useState('');
  const [output, setOutput] = useState('');
  const originPresets = ['https://example.com', 'https://app.toolzum.com', 'http://localhost:3000'];
  const inspect = () => {
    if (!origin.trim()) { setOutput('Please enter an origin URL'); return; }
    const m = methods || 'GET, POST, PUT, DELETE, OPTIONS';
    setOutput(`CORS Preflight Analysis for ${origin}

⚠ Server-side CORS check not available in browser
Expected preflight response for methods: ${m}

Browser will send OPTIONS request with:
  Origin: ${origin}
  Access-Control-Request-Method: ${m.split(',')[0]!.trim()}

Server should respond with:
  Access-Control-Allow-Origin: ${origin} or *
  Access-Control-Allow-Methods: ${m}
  Access-Control-Allow-Headers: Content-Type, Authorization
  Access-Control-Max-Age: 3600
  Access-Control-Allow-Credentials: true/false

To test manually:
  curl -X OPTIONS -H "Origin: ${origin}" -H "Access-Control-Request-Method: GET" ${origin}`);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (output) { clipboardWrite(output).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } }); } };
  return (
    <Section title="CORS Inspector">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {originPresets.map(o => <button key={o} onClick={() => { setOrigin(o); }} className="px-2.5 py-1 text-xs rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors">{o}</button>)}
      </div>
      <Input label="Origin URL" value={origin} onChange={setOrigin} placeholder="https://example.com" />
      <Input label="Methods (comma separated)" value={methods} onChange={setMethods} placeholder="GET, POST, PUT" />
      <button onClick={inspect} className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">Inspect</button>
      {output && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-blue-400">
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200">{output}</pre>
          <button onClick={copy} className="mt-3 px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}


export function CorsHeaderGenerator() {
  const [origin, setOrigin] = useState('');
  const [methods, setMethods] = useState('');
  const [headers, setHeaders] = useState('');
  const scenarioPresets = [
    { label: 'Open API', o: '*', m: 'GET, POST, PUT, DELETE, OPTIONS' },
    { label: 'Single Origin', o: 'https://app.example.com', m: 'GET, POST, PUT' },
    { label: 'Dev Localhost', o: 'http://localhost:3000', m: 'GET, POST, PUT, DELETE, PATCH' },
  ];
  const gen = (o?: string, m?: string) => {
    const originVal = o !== undefined ? o : origin;
    const methodsVal = m !== undefined ? m : methods;
    if (o !== undefined) setOrigin(o);
    if (m !== undefined) setMethods(m);
    const outOrigin = originVal || '*';
    const outMethods = methodsVal || 'GET, POST, PUT, DELETE, OPTIONS';
    setHeaders(`Access-Control-Allow-Origin: ${outOrigin}
Access-Control-Allow-Methods: ${outMethods}
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Max-Age: 3600
Access-Control-Allow-Credentials: ${outOrigin === '*' ? 'false' : 'true'}

${outOrigin !== '*' ? '' : '# Warning: Wildcard origin with credentials=false'}`);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (headers) { clipboardWrite(headers).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } }); } };
  return (
    <Section title="CORS Header Generator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {scenarioPresets.map(s => <button key={s.label} onClick={() => gen(s.o, s.m)} className="px-2.5 py-1 text-xs rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 border border-sky-500/20 transition-colors">{s.label}</button>)}
      </div>
      <Input label="Allowed Origin" value={origin} onChange={v => { setOrigin(v); setHeaders(''); }} placeholder="https://example.com or *" />
      <Input label="Allowed Methods" value={methods} onChange={v => { setMethods(v); setHeaders(''); }} placeholder="GET, POST, PUT, DELETE" />
      <button onClick={() => gen()} className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors">Generate Headers</button>
      {headers && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-sky-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-zinc-600 dark:text-[var(--text-muted)]">CORS Response Headers</span>
            <button onClick={copy} className="px-2.5 py-1 text-xs bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">{headers}</pre>
        </div>
      )}
    </Section>
  );
}


export function CveLookup() {
  const [cveId, setCveId] = useState('');
  const [output, setOutput] = useState('');
  const cvePresets = ['CVE-2024-21626', 'CVE-2023-44487', 'CVE-2024-27198'];
  const lookup = () => {
    if (!cveId.trim()) { setOutput('Please enter a CVE ID'); return; }
    const id = cveId.trim().toUpperCase();
    setOutput(`CVE Lookup: ${id}

⚠ Server-side API access not available in browser

For real CVE lookup, visit:
• https://nvd.nist.gov/vuln/detail/${id}
• https://cve.mitre.org/cgi-bin/cvename.cgi?name=${id}
• https://www.cvedetails.com/cve/${id}/

CVE format: CVE-YYYY-NNNNN
• Prefix: CVE
• Year: Publication year
• Sequence: 4+ digit identifier

To check from CLI:
  curl -s "https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${id}" | jq .`);
  };
  const [copied, setCopied] = useState(false);
  const copy = () => { if (output) { clipboardWrite(output).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } }); } };
  return (
    <Section title="CVE Lookup">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {cvePresets.map(c => <button key={c} onClick={() => { setCveId(c); }} className="px-2.5 py-1 text-xs rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors">{c}</button>)}
      </div>
      <Input label="CVE ID" value={cveId} onChange={v => { setCveId(v); setOutput(''); }} placeholder="CVE-2024-12345" />
      <button onClick={lookup} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors">Lookup</button>
      {output && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-red-400">
          <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-800 dark:text-zinc-200">{output}</pre>
          <button onClick={copy} className="mt-3 px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}
    </Section>
  );
}


export function SqlInjectionDetector() {
  const [input, setInput] = useState('');
  const [detections, setDetections] = useState<{ name: string; risk: string }[]>([]);
  const [scanned, setScanned] = useState(false);
  const sqlPresets = [
    { label: 'SQLi Sample', v: "SELECT * FROM users WHERE id = '1' OR '1'='1' --" },
    { label: 'Clean SQL', v: 'SELECT * FROM users WHERE id = $1' },
    { label: 'Drop Table', v: 'username"; DROP TABLE users; --' },
  ];
  const riskColors: Record<string, string> = { Critical: 'bg-red-500', High: 'bg-orange-500', Medium: 'bg-yellow-500' };
  const detect = (t?: string) => {
    const text = t !== undefined ? t : input;
    if (t !== undefined) setInput(text);
    const patterns = [
      { pattern: /('|")\s*(OR|AND)\s+.*=.*/i, name: 'Tautology (OR/AND with always-true condition)', risk: 'High' },
      { pattern: /UNION\s+(ALL\s+)?SELECT/i, name: 'UNION-based injection', risk: 'High' },
      { pattern: /DROP\s+TABLE/i, name: 'DROP TABLE statement', risk: 'Critical' },
      { pattern: /--/g, name: 'SQL comment injection', risk: 'Medium' },
      { pattern: /;\s*DROP/i, name: 'Stacked query (DROP)', risk: 'Critical' },
      { pattern: /WAITFOR\s+DELAY/i, name: 'Time-based blind injection', risk: 'High' },
      { pattern: /\bOR\s+'1'\s*=\s*'1/i, name: 'OR 1=1 bypass', risk: 'High' },
      { pattern: /EXEC(\s|\()/i, name: 'Command execution', risk: 'Critical' },
      { pattern: /LOAD_FILE/i, name: 'File read attempt', risk: 'High' },
      { pattern: /INFORMATION_SCHEMA/i, name: 'Schema enumeration', risk: 'Medium' },
    ];
    const found = patterns.filter(p => p.pattern.test(text));
    setDetections(found);
    setScanned(true);
  };
  return (
    <Section title="SQL Injection Detector">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {sqlPresets.map(p => <button key={p.label} onClick={() => detect(p.v)} className="px-2.5 py-1 text-xs rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors">{p.label}</button>)}
      </div>
      <Input label="Input to check" rows={4} value={input} onChange={v => { setInput(v); setScanned(false); }} placeholder="Enter SQL or user input..." />
      <button onClick={() => detect()} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors">Scan</button>
      {scanned && (
        <div className="mt-4 space-y-2">
          {detections.length === 0 ? (
            <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl border-l-4 border-green-400 text-sm font-medium">No SQL injection patterns detected.</div>
          ) : (
            <>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl border-l-4 border-red-400 text-sm font-medium">Found {detections.length} potential SQL injection pattern(s)</div>
              {detections.map((d, i) => (
                <div key={i} className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-red-400 flex items-center justify-between">
                  <span className="text-sm text-zinc-800 dark:text-zinc-200">{d.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${riskColors[d.risk] || 'bg-zinc-500'}`}>{d.risk}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </Section>
  );
}


export function XssProtectionChecker() {
  const [headers, setHeaders] = useState('');
  const [checks, setChecks] = useState<{ label: string; pass: boolean; desc: string }[]>([]);
  const headerPresets = [
    { label: 'Secure', v: 'content-security-policy: default-src \'self\'\nx-content-type-options: nosniff\nx-frame-options: DENY\nreferrer-policy: strict-origin-when-cross-origin' },
    { label: 'Minimal', v: 'content-security-policy: default-src \'self\'' },
    { label: 'Missing', v: 'content-type: text/html\ncache-control: no-cache' },
  ];
  const check = (h?: string) => {
    const txt = h !== undefined ? h : headers;
    if (h !== undefined) setHeaders(txt);
    const lower = txt.toLowerCase();
    const results = [
      { label: 'Content-Security-Policy', pass: lower.includes('content-security-policy'), desc: 'Strongest XSS defense' },
      { label: 'X-Content-Type-Options: nosniff', pass: lower.includes('x-content-type-options'), desc: 'Prevents MIME-sniffing' },
      { label: 'X-Frame-Options', pass: lower.includes('x-frame-options'), desc: 'Clickjacking protection' },
      { label: 'Referrer-Policy', pass: lower.includes('referrer-policy'), desc: 'Referrer leakage control' },
      { label: 'X-XSS-Protection', pass: lower.includes('x-xss-protection'), desc: 'Deprecated but harmless' },
    ];
    setChecks(results);
  };
  return (
    <Section title="XSS Protection Checker">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {headerPresets.map(p => <button key={p.label} onClick={() => check(p.v)} className="px-2.5 py-1 text-xs rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 transition-colors">{p.label}</button>)}
      </div>
      <Input label="Response headers (paste)" rows={4} value={headers} onChange={v => { setHeaders(v); setChecks([]); }} placeholder="content-security-policy: default-src 'self'" />
      <button onClick={() => check()} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">Check</button>
      {checks.length > 0 && (
        <div className="mt-4 space-y-2">
          {checks.map(c => (
            <div key={c.label} className={`bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 ${c.pass ? 'border-green-400' : 'border-red-400'} flex items-center justify-between`}>
              <div>
                <span className="text-sm text-zinc-800 dark:text-zinc-200">{c.label}</span>
                <p className="text-xs text-zinc-500">{c.desc}</p>
              </div>
              <span className={`text-lg ${c.pass ? 'text-green-500' : 'text-red-500'}`}>{c.pass ? '✓' : '✗'}</span>
            </div>
          ))}
          <div className="p-3 bg-[var(--bg-surface)] rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500">
            Recommendation: Use CSP with strict script-src as primary XSS defense. X-XSS-Protection is deprecated — modern browsers ignore it.
          </div>
        </div>
      )}
    </Section>
  );
}


export function CspValidator() {
  const [policy, setPolicy] = useState('');
  const [report, setReport] = useState<{ valid: string[]; unknown: string[]; warnings: string[] } | null>(null);
  const cspPresets = [
    { label: 'Strict', v: "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'" },
    { label: 'Standard', v: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:" },
    { label: 'Relaxed', v: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:" },
  ];
  const validate = (p?: string) => {
    const pol = p !== undefined ? p : policy;
    if (p !== undefined) setPolicy(pol);
    const directives = pol.split(';').map(d => d.trim()).filter(Boolean);
    const validDirs = ['default-src', 'script-src', 'style-src', 'img-src', 'font-src', 'connect-src', 'media-src', 'object-src', 'frame-src', 'frame-ancestors', 'base-uri', 'form-action', 'report-uri', 'report-to', 'manifest-src', 'worker-src', 'prefetch-src', 'navigate-to'];
    const valid: string[] = [];
    const unknown: string[] = [];
    const warnings: string[] = [];
    for (const d of directives) {
      const name = d.split(/\s+/)[0] ?? "";
      if (!validDirs.includes(name)) unknown.push(name);
      else valid.push(d);
    }
    if (!pol.includes("default-src")) warnings.push('No default-src directive — policy may be incomplete');
    if (!pol.includes("'self'") && !pol.includes('http')) warnings.push("Consider adding 'self' to restrict sources");
    if (pol.includes("'unsafe-inline'")) warnings.push("'unsafe-inline' weakens XSS protection");
    setReport({ valid, unknown, warnings });
  };
  return (
    <Section title="CSP Policy Validator">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {cspPresets.map(p => <button key={p.label} onClick={() => validate(p.v)} className="px-2.5 py-1 text-xs rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 border border-teal-500/20 transition-colors">{p.label}</button>)}
      </div>
      <Input label="CSP Policy" rows={4} value={policy} onChange={v => { setPolicy(v); setReport(null); }} placeholder="default-src 'self'; script-src 'self'" />
      <button onClick={() => validate()} className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors">Validate</button>
      {report && (
        <div className="mt-4 space-y-2">
          {report.valid.length > 0 && (
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-green-400">
              <span className="text-xs font-semibold text-zinc-500 block mb-2">Valid Directives ({report.valid.length})</span>
              {report.valid.map((d, i) => <div key={i} className="text-xs text-green-700 dark:text-green-300 mb-1">✓ {d}</div>)}
            </div>
          )}
          {report.unknown.length > 0 && (
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-red-400">
              <span className="text-xs font-semibold text-zinc-500 block mb-2">Unknown Directives</span>
              {report.unknown.map((d, i) => <div key={i} className="text-xs text-red-600 dark:text-red-400">⚠ {d}</div>)}
            </div>
          )}
          {report.warnings.length > 0 && (
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-yellow-400">
              <span className="text-xs font-semibold text-zinc-500 block mb-2">Warnings</span>
              {report.warnings.map((w, i) => <div key={i} className="text-xs text-yellow-700 dark:text-yellow-300">ℹ {w}</div>)}
            </div>
          )}
          {report.valid.length === 0 && report.unknown.length === 0 && report.warnings.length === 0 && (
            <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl text-sm">✓ Policy looks clean</div>
          )}
        </div>
      )}
    </Section>
  );
}
