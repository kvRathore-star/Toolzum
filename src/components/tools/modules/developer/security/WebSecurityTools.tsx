"use client";

import React, { useState } from 'react';
import { Section, Input } from './_shared';
import { clipboardWrite } from "@/lib/clipboard";
import { toast } from 'react-hot-toast';


interface HeaderSignals {
  input: string;
  reachable: boolean;
  finalUrl: string;
  upgradedToHttps: boolean;
  status: number | null;
  contentType: string | null;
}

export function HttpSecurityChecker() {
  const [input, setInput] = useState('');
  const [signals, setSignals] = useState<HeaderSignals | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const sitePresets = ['https://google.com', 'https://github.com', 'https://cloudflare.com'];
  const check = async () => {
    const raw = input.trim();
    if (!raw) { setError('Enter a website URL.'); setSignals(null); return; }
    let target = raw;
    if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
    try {
      const u = new URL(target);
      if (!/^https?:$/.test(u.protocol)) throw new Error('bad protocol');
      target = u.toString();
    } catch {
      setError('Enter a valid URL, e.g. https://example.com');
      setSignals(null);
      return;
    }
    setChecking(true);
    setError('');
    setSignals(null);
    // Browsers hide security headers cross-origin (they aren't CORS-exposed),
    // so what IS observable: reachability, the redirect chain (http→https
    // upgrade = HSTS in action), status and content-type when the server
    // permits. The header checklist below stays as a labeled reference.
    const startedHttp = target.startsWith('http://');
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 20000);
      let status: number | null = null;
      let contentType: string | null = null;
      let finalUrl = target;
      try {
        const res = await fetch(target, { method: 'HEAD', signal: ctrl.signal });
        status = res.status;
        finalUrl = res.url || target;
        contentType = res.headers.get('content-type');
      } catch {
        // CORS-blocked reads still prove reachability via a no-cors probe
        // (opaque: no status/headers, but final URL after redirects).
        const probe = await fetch(target, { method: 'HEAD', mode: 'no-cors', signal: ctrl.signal });
        finalUrl = probe.url || target;
      } finally {
        clearTimeout(t);
      }
      setSignals({
        input: target,
        reachable: true,
        finalUrl,
        upgradedToHttps: startedHttp && finalUrl.startsWith('https://'),
        status,
        contentType,
      });
    } catch {
      setError(`Unreachable from this browser — host down, TLS rejected, or timed out. For header truth: curl -sI ${target} | grep -iE 'strict|x-frame|content-security|referrer|permissions'`);
    } finally {
      setChecking(false);
    }
  };
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!signals) return;
    clipboardWrite([
      `URL: ${signals.input}`,
      `Reachable: yes`,
      `Final URL: ${signals.finalUrl}`,
      signals.status !== null ? `Status: ${signals.status}` : null,
      signals.contentType ? `Content-Type: ${signals.contentType}` : null,
      signals.upgradedToHttps ? 'Upgraded http→https (HSTS-style redirect observed)' : null,
    ].filter(Boolean).join('\n')).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } });
  };
  return (
    <Section title="HTTP Security Headers Checker">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {sitePresets.map(s => <button key={s} onClick={() => { setInput(s); }} className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors">{s.replace('https://', '')}</button>)}
      </div>
      <Input label="Website URL" value={input} onChange={v => { setInput(v); setSignals(null); setError(''); }} placeholder="https://example.com" />
      <button onClick={check} disabled={checking} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">{checking ? 'Analyzing…' : 'Analyze Headers'}</button>
      {error && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-red-500/40">
          <p className="text-sm text-[var(--text-primary)]">{error}</p>
        </div>
      )}
      {signals && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-rose-400 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-bold text-green-600 dark:text-green-400">✓ Reachable</span>
            {signals.upgradedToHttps && <span className="px-2 py-0.5 text-xs font-bold rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">http → https upgrade observed</span>}
            <button onClick={copy} className="ml-auto px-3 py-1.5 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <p className="text-xs font-mono text-[var(--text-secondary)] break-all">Final URL: {signals.finalUrl}</p>
          {signals.status !== null && <p className="text-sm text-[var(--text-primary)]">Status: <strong className="font-mono">{signals.status}</strong></p>}
          {signals.contentType && <p className="text-sm text-[var(--text-primary)]">Content-Type: <strong className="font-mono">{signals.contentType}</strong></p>}
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Reference — verify server-side (browsers can&apos;t read these cross-origin)</p>
            <pre className="whitespace-pre-wrap text-xs font-mono text-[var(--text-muted)]">{`Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY or SAMEORIGIN
Content-Security-Policy: (site-specific)
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: (minimal set)
curl -sI ${signals.input} | grep -iE 'strict|x-frame|content-security|referrer|permissions'`}</pre>
          </div>
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
            <span className="text-sm font-medium text-[var(--text-secondary)] dark:text-[var(--text-muted)]">CSP Header Value</span>
            <button onClick={copy} className="px-2.5 py-1 text-xs bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <div className="bg-[var(--bg-overlay)] rounded-lg p-3 font-mono text-xs break-all text-[var(--text-primary)]">{csp}</div>
          <p className="text-xs text-[var(--text-muted)] mt-2">Directives: {csp.split(';').length} · Length: {csp.length} chars</p>
        </div>
      )}
    </Section>
  );
}


export function CorsInspector() {
  const [origin, setOrigin] = useState('');
  const [methods, setMethods] = useState('');
  const [result, setResult] = useState<{ allowed: boolean; detail: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const originPresets = ['https://example.com', 'https://app.toolzum.com', 'http://localhost:3000'];
  const inspect = async () => {
    const target = origin.trim();
    if (!target) { setError('Enter a URL to test.'); setResult(null); return; }
    let url: URL;
    try {
      url = new URL(target);
      if (!/^https?:$/.test(url.protocol)) throw new Error('bad protocol');
    } catch {
      setError('Enter a valid http(s) URL, e.g. https://api.example.com/data');
      setResult(null);
      return;
    }
    const m = (methods || 'GET, POST, PUT, DELETE, OPTIONS').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    setChecking(true);
    setError('');
    setResult(null);
    try {
      // A REAL preflight: the browser itself enforces CORS. If the fetch
      // resolves, this origin is allowed; a TypeError means the browser
      // blocked it (no ACAO match). Note the page's own origin is the
      // request Origin — configure the server to allow toolzum.com to
      // test other origins, or test same-origin endpoints directly.
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      try {
        await fetch(url.toString(), {
          method: m[0] === 'GET' ? 'GET' : 'OPTIONS',
          signal: ctrl.signal,
          headers: m[0] === 'GET' ? {} : { 'Access-Control-Request-Method': m[0]!, 'Access-Control-Request-Headers': 'content-type' },
        });
        setResult({
          allowed: true,
          detail: `This browser reached ${url.host} for ${m[0]} — the server's CORS policy allows this page's origin. Exact allow-lists (which origins/methods/headers) are only visible server-side; confirm with: curl -X OPTIONS -H "Origin: ${url.origin}" -H "Access-Control-Request-Method: ${m[0]}" ${url.toString()}`,
        });
      } finally {
        clearTimeout(t);
      }
    } catch {
      setResult({
        allowed: false,
        detail: `Blocked: the browser refused the ${m[0]} request to ${url.host} (no matching Access-Control-Allow-Origin for this page). The server must return Access-Control-Allow-Origin covering this origin. Verify server-side: curl -X OPTIONS -H "Origin: ${url.origin}" ${url.toString()} -i`,
      });
    } finally {
      setChecking(false);
    }
  };
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!result) return;
    clipboardWrite(result.detail).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } });
  };
  return (
    <Section title="CORS Inspector">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {originPresets.map(o => <button key={o} onClick={() => { setOrigin(o); }} className="px-2.5 py-1 text-xs rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 border border-[var(--accent)]/20 transition-colors">{o}</button>)}
      </div>
      <Input label="Endpoint URL" value={origin} onChange={v => { setOrigin(v); setResult(null); setError(''); }} placeholder="https://api.example.com/data" />
      <Input label="Methods (comma separated)" value={methods} onChange={setMethods} placeholder="GET, POST, PUT" />
      <button onClick={inspect} disabled={checking} className="px-5 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">{checking ? 'Testing…' : 'Inspect'}</button>
      {error && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-red-500/40">
          <p className="text-sm text-[var(--text-primary)]">{error}</p>
        </div>
      )}
      {result && (
        <div className={`mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 ${result.allowed ? 'border-green-500/50' : 'border-red-500/40'}`}>
          <p className={`text-sm font-bold mb-2 ${result.allowed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {result.allowed ? '✓ Cross-origin request allowed' : '✕ Cross-origin request blocked'}
          </p>
          <pre className="whitespace-pre-wrap text-sm font-mono text-[var(--text-primary)]">{result.detail}</pre>
          <button onClick={copy} className="mt-3 px-3 py-1.5 text-xs bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
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
            <span className="text-sm font-medium text-[var(--text-secondary)] dark:text-[var(--text-muted)]">CORS Response Headers</span>
            <button onClick={copy} className="px-2.5 py-1 text-xs bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm font-mono text-[var(--text-primary)] bg-[var(--bg-overlay)] p-3 rounded-lg">{headers}</pre>
        </div>
      )}
    </Section>
  );
}


interface CveResult {
  id: string;
  summary: string;
  severity: string;
  published: string;
  references: string[];
}

export function CveLookup() {
  const [cveId, setCveId] = useState('');
  const [result, setResult] = useState<CveResult | null>(null);
  const [looking, setLooking] = useState(false);
  const [error, setError] = useState('');
  const cvePresets = ['CVE-2024-21626', 'CVE-2023-44487', 'CVE-2024-27198'];
  const lookup = async () => {
    const id = cveId.trim().toUpperCase();
    if (!/^CVE-\d{4}-\d{4,}$/.test(id)) {
      setError('Enter a valid CVE ID, e.g. CVE-2024-12345');
      setResult(null);
      return;
    }
    setLooking(true);
    setError('');
    setResult(null);
    try {
      // Real lookup via OSV (Google's open vulnerability DB, browser-friendly,
      // no key). Falls back to link-outs when OSV lacks the record.
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      let data: unknown;
      try {
        const res = await fetch(`https://api.osv.dev/v1/vulns/${encodeURIComponent(id)}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
      } finally {
        clearTimeout(t);
      }
      const v = (data || {}) as {
        summary?: string; details?: string; published?: string;
        severity?: { type?: string; score?: string }[];
        references?: { url?: string }[];
      };
      if (!v.summary && !v.details) throw new Error('not found');
      const sev = v.severity?.find(s => s.type === 'CVSS_V3' || s.type === 'CVSS_V2')?.score
        || v.severity?.[0]?.score || 'unscored';
      setResult({
        id,
        summary: v.summary || v.details || '',
        severity: sev,
        published: (v.published || '').slice(0, 10),
        references: (v.references || []).map(r => r.url || '').filter(Boolean).slice(0, 8),
      });
    } catch {
      setError(`No OSV record for ${id} — it may be too new, reserved, or rejected. Check the authoritative sources directly.`);
    } finally {
      setLooking(false);
    }
  };
  const id = cveId.trim().toUpperCase();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!result) return;
    clipboardWrite(`${result.id}\nSeverity: ${result.severity}\nPublished: ${result.published}\n\n${result.summary}`).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else { toast.error('Copy failed — check browser permissions'); } });
  };
  return (
    <Section title="CVE Lookup">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {cvePresets.map(c => <button key={c} onClick={() => { setCveId(c); }} className="px-2.5 py-1 text-xs rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors">{c}</button>)}
      </div>
      <Input label="CVE ID" value={cveId} onChange={v => { setCveId(v); setResult(null); setError(''); }} placeholder="CVE-2024-12345" />
      <button onClick={lookup} disabled={looking} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">{looking ? 'Looking up…' : 'Lookup'}</button>
      {error && id && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-red-400 space-y-2">
          <p className="text-sm text-[var(--text-primary)]">{error}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {[`https://nvd.nist.gov/vuln/detail/${id}`, `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${id}`].map(u => (
              <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--accent)] hover:underline">{new URL(u).hostname}</a>
            ))}
          </div>
        </div>
      )}
      {error && !id && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-red-500/40">
          <p className="text-sm text-[var(--text-primary)]">{error}</p>
        </div>
      )}
      {result && (
        <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-xl border-l-4 border-red-400 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold font-mono text-[var(--text-primary)]">{result.id}</p>
            <span className="px-2 py-0.5 text-xs font-bold rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">{result.severity}</span>
            {result.published && <span className="text-xs text-[var(--text-muted)]">{result.published}</span>}
            <button onClick={copy} className="ml-auto px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{result.summary}</p>
          {result.references.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {result.references.map(u => (
                <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent)] hover:underline break-all">{u}</a>
              ))}
            </div>
          )}
          <p className="text-xs text-[var(--text-muted)]">Source: OSV.dev. For NVD enrichment (CPE, CVSS vector): nvd.nist.gov/vuln/detail/{result.id}</p>
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
                  <span className="text-sm text-[var(--text-primary)]">{d.name}</span>
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
                <span className="text-sm text-[var(--text-primary)]">{c.label}</span>
                <p className="text-xs text-[var(--text-muted)]">{c.desc}</p>
              </div>
              <span className={`text-lg ${c.pass ? 'text-green-500' : 'text-red-500'}`}>{c.pass ? '✓' : '✗'}</span>
            </div>
          ))}
          <div className="p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
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
              <span className="text-xs font-semibold text-[var(--text-muted)] block mb-2">Valid Directives ({report.valid.length})</span>
              {report.valid.map((d, i) => <div key={i} className="text-xs text-green-700 dark:text-green-300 mb-1">✓ {d}</div>)}
            </div>
          )}
          {report.unknown.length > 0 && (
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-red-400">
              <span className="text-xs font-semibold text-[var(--text-muted)] block mb-2">Unknown Directives</span>
              {report.unknown.map((d, i) => <div key={i} className="text-xs text-red-600 dark:text-red-400">⚠ {d}</div>)}
            </div>
          )}
          {report.warnings.length > 0 && (
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border-l-4 border-yellow-400">
              <span className="text-xs font-semibold text-[var(--text-muted)] block mb-2">Warnings</span>
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
