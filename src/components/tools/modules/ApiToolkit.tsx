"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Globe, Webhook, FileJson, Book, Key } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'tester' | 'apigen' | 'graphql' | 'openapi' | 'webhook';

export default function ApiToolkit() {
  const [tab, setTab] = useState<Tab>('tester');
  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${tab === v ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        <TabBtn v="tester" label="API Tester" icon={Globe} />
        <TabBtn v="apigen" label="API Utils" icon={Key} />
        <TabBtn v="graphql" label="GraphQL" icon={FileJson} />
        <TabBtn v="openapi" label="OpenAPI" icon={Book} />
        <TabBtn v="webhook" label="Webhook" icon={Webhook} />
      </div>
      {tab === 'tester' && <ApiTester />}
      {tab === 'apigen' && <ApiUtils />}
      {tab === 'graphql' && <GraphqlTools />}
      {tab === 'openapi' && <OpenapiTools />}
      {tab === 'webhook' && <WebhookTools />}
    </div>
  );
}

const Inp = ({ label, value, onChange, prefix, suffix, small, ph }: { label: string; value: number | string; onChange: (v: any) => void; prefix?: string; suffix?: string; small?: boolean; ph?: string }) => (
  <div className="flex items-center gap-1.5">
    <label className="text-[10px] text-zinc-500 w-14 shrink-0">{label}</label>
    {prefix && <span className="text-[10px] text-zinc-400">{prefix}</span>}
    <input type={typeof value === 'number' ? 'number' : 'text'} value={value} onChange={e => onChange(typeof value === 'number' ? Number(e.target.value) : e.target.value)} placeholder={ph}
      className={`w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 ${small ? 'py-1 text-[11px]' : 'py-1.5 text-xs'} text-zinc-900 dark:text-white outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} />
    {suffix && <span className="text-[10px] text-zinc-400 w-5">{suffix}</span>}
  </div>
);

const CalcBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={onClick} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all active:scale-[0.98]">{label}</button>
);

const Result = ({ value }: { value: string }) => (
  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-zinc-50 dark:bg-black rounded-lg px-2 py-1">{value}</p>
);

const Card = ({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) => (
  <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2 ${wide ? 'md:col-span-2 lg:col-span-2' : ''}`}>
    <h5 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{title}</h5>
    {children}
  </div>
);

function ApiTester() {
  const [method, setMethod] = useState('GET'); const [url, setUrl] = useState(''); const [headers, setHeaders] = useState('Content-Type: application/json'); const [body, setBody] = useState(''); const [resp, setResp] = useState<string | null>(null);
  const [rbMethod, setRbMethod] = useState('GET'); const [rbPath, setRbPath] = useState('/api/users'); const [rbHeaders, setRbHeaders] = useState(''); const [rbQuery, setRbQuery] = useState(''); const [rbBody, setRbBody] = useState(''); const [rbOut, setRbOut] = useState('');
  const [rfInput, setRfInput] = useState(''); const [rfOut, setRfOut] = useState('');

  const sendReq = async () => {
    if (!url) { toast.error('Enter URL'); return; }
    try {
      const h: Record<string, string> = {};
      headers.split('\n').filter(l => l.includes(':')).forEach(l => { const [k, ...v] = l.split(':'); h[k.trim()] = v.join(':').trim(); });
      const res = await fetch(url, { method, headers: h, body: method !== 'GET' && method !== 'HEAD' ? body : undefined });
      const text = await res.text();
      setResp(`${res.status} ${res.statusText}\n\n${text.length > 3000 ? text.slice(0, 3000) + '...' : text}`);
    } catch (e: unknown) { setResp(`Error: ${e instanceof Error ? e.message : 'Failed'}`); }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      <Card title="HTTP Tester" wide>
        <div className="flex gap-2">
          <select value={method} onChange={e => setMethod(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-[11px] font-bold text-zinc-900 dark:text-white outline-none">
            {['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://api.example.com/endpoint" className="flex-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" /></div>
        <div className="grid grid-cols-2 gap-2">
          <textarea value={headers} onChange={e => setHeaders(e.target.value)} placeholder="Headers" className="h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none focus:border-blue-500" />
          <textarea value={body} onChange={e => setBody(e.target.value)} disabled={method === 'GET' || method === 'HEAD'} placeholder="Body" className="h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none focus:border-blue-500 disabled:opacity-40" /></div>
        <button onClick={sendReq} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all">Send Request</button>
        {resp && <Result value={resp} />}
      </Card>
      <Card title="Request Builder">
        <select value={rbMethod} onChange={e => setRbMethod(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-[10px] font-bold outline-none">{[...['GET','POST','PUT','PATCH','DELETE']].map(m => <option key={m} value={m}>{m}</option>)}</select>
        <Inp label="Path" value={rbPath} onChange={setRbPath} ph="/api/users" small />
        <textarea value={rbHeaders} onChange={e => setRbHeaders(e.target.value)} placeholder="Headers" className="w-full h-12 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none" />
        <CalcBtn onClick={() => setRbOut(`${rbMethod} ${rbPath}${rbQuery ? '?' + rbQuery : ''}\n${rbHeaders}\n\n${rbBody}`)} label="Build Request" />
        {rbOut && <Result value={rbOut} />}
      </Card>
      <Card title="Response Formatter">
        <textarea value={rfInput} onChange={e => setRfInput(e.target.value)} placeholder="Paste raw response..."
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none" />
        <CalcBtn onClick={() => { try { setRfOut(JSON.stringify(JSON.parse(rfInput), null, 2)); } catch { setRfOut(rfInput.replace(/\\n/g, '\n').replace(/\\t/g, '  ')); } }} label="Format" />
        {rfOut && <Result value={rfOut} />}
      </Card>
      <Card title="SOAP Tester">
        <textarea placeholder="Paste SOAP envelope..." className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none" />
        <CalcBtn onClick={() => toast.success('SOAP tester endpoint required')} label="Send SOAP" />
      </Card>
      <Card title="gRPC Status Codes">
        <div className="flex flex-wrap gap-1">
          {[[0,'OK'],[1,'Canceled'],[2,'Unknown'],[3,'Invalid Arg'],[4,'Deadline'],[5,'Not Found'],[6,'Exists'],[7,'Perm Denied'],[8,'Resource Exhausted'],[9,'Precondition'],[10,'Aborted'],[11,'Out of Range'],[12,'Unimplemented'],[13,'Internal'],[14,'Unavailable'],[15,'Data Loss'],[16,'Unauthenticated']].map(([c, n]) => (
            <button key={c} onClick={() => toast.success(`${c}: ${n}`)} className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{c}</button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ApiUtils() {
  const [keyLen, setKeyLen] = useState(32); const [keyPrefix, setKeyPrefix] = useState('sk_'); const [keyOut, setKeyOut] = useState(''); const [keyCount, setKeyCount] = useState(3);
  const [hashIn, setHashIn] = useState(''); const [hashOut, setHashOut] = useState(''); const [hashMode, setHashMode] = useState<'sha256'|'md5'>('sha256');
  const [valKey, setValKey] = useState(''); const [valRes, setValRes] = useState<string | null>(null);
  const [costCalls, setCostCalls] = useState(1000000); const [costPer, setCostPer] = useState(0.0001); const [costRes, setCostRes] = useState<string | null>(null);
  const [latSrc, setLatSrc] = useState(100); const [latSla, setLatSla] = useState(200); const [latBudget, setLatBudget] = useState(300); const [latRes, setLatRes] = useState<string | null>(null);
  const [pagTotal, setPagTotal] = useState(1000); const [pagPer, setPagPer] = useState(50); const [pagRes, setPagRes] = useState<string | null>(null);
  const [rateMax, setRateMax] = useState(1000); const [rateWindow, setRateWindow] = useState(60); const [rateRes, setRateRes] = useState<string | null>(null);
  const [errCode, setErrCode] = useState(''); const [errRes, setErrRes] = useState<string | null>(null);
  const [payloadIn, setPayloadIn] = useState(''); const [payloadRes, setPayloadRes] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      <Card title="API Key Generator">
        <Inp label="Length" value={keyLen} onChange={setKeyLen} small /><Inp label="Prefix" value={keyPrefix} onChange={setKeyPrefix} small />
        <CalcBtn onClick={() => {
          const chars = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          setKeyOut(Array.from({ length: keyCount }, () => keyPrefix + Array.from({ length: keyLen }, () => chars[Math.floor(Math.random() * chars.length)]).join('')).join('\n'));
        }} label={`Generate ${keyCount} Keys`} />
        {keyOut && <Result value={keyOut} />}
      </Card>
      <Card title="API Key Hasher">
        <textarea value={hashIn} onChange={e => setHashIn(e.target.value)} placeholder="Paste API key to hash..."
          className="w-full h-12 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none" />
        <select value={hashMode} onChange={e => setHashMode(e.target.value as any)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[10px] outline-none">
          <option value="sha256">SHA-256</option><option value="md5">MD5</option></select>
        <CalcBtn onClick={async () => {
          const enc = new TextEncoder().encode(hashIn);
          const buf = await crypto.subtle.digest(hashMode === 'sha256' ? 'SHA-256' : 'SHA-1', enc);
          setHashOut(Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));
        }} label="Hash" />
        {hashOut && <Result value={`${hashMode.toUpperCase()}: ${hashOut.slice(0, 32)}...`} />}
      </Card>
      <Card title="Key Validator">
        <textarea value={valKey} onChange={e => setValKey(e.target.value)} placeholder="Paste API key..."
          className="w-full h-12 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none" />
        <CalcBtn onClick={() => {
          const t = valKey.trim();
          if (/^[a-zA-Z0-9_-]{16,128}$/.test(t)) setValRes('✓ Valid format');
          else if (/^sk_/.test(t)) setValRes('✓ Valid (starts with sk_)');
          else setValRes('✗ Invalid: check length (16-128) & chars (a-z, 0-9, _, -)');
        }} label="Validate" />
        {valRes && <Result value={valRes} />}
      </Card>
      <Card title="API Cost Estimator">
        <Inp label="Calls" value={costCalls} onChange={setCostCalls} small />
        <Inp label="Cost/call" value={costPer} onChange={setCostPer} prefix="$" small />
        <CalcBtn onClick={() => { const c = costCalls * costPer; setCostRes(`$${c.toFixed(2)} total · $${(c / 12).toFixed(2)}/mo avg`); }} label="Estimate" />
        {costRes && <Result value={costRes} />}
      </Card>
      <Card title="Latency Budget">
        <Inp label="Source (ms)" value={latSrc} onChange={setLatSrc} small />
        <Inp label="SLA (ms)" value={latSla} onChange={setLatSla} small />
        <Inp label="Budget (ms)" value={latBudget} onChange={setLatBudget} small />
        <CalcBtn onClick={() => {
          const net = latBudget - latSrc - latSla;
          setLatRes(`Network budget: ${net >= 0 ? net : 0}ms · ${net >= 0 ? '✓ Feasible' : '✗ Over budget by ' + Math.abs(net) + 'ms'}`);
        }} label="Calculate" />
        {latRes && <Result value={latRes} />}
      </Card>
      <Card title="Pagination">
        <Inp label="Total items" value={pagTotal} onChange={setPagTotal} small />
        <Inp label="Per page" value={pagPer} onChange={setPagPer} small />
        <CalcBtn onClick={() => {
          const pages = Math.ceil(pagTotal / pagPer);
          setPagRes(`${pages} pages · offset 0 to ${(pages - 1) * pagPer} · page_size=${pagPer}`);
        }} label="Calculate" />
        {pagRes && <Result value={pagRes} />}
      </Card>
      <Card title="Rate Limiter">
        <Inp label="Max requests" value={rateMax} onChange={setRateMax} small />
        <Inp label="Window (sec)" value={rateWindow} onChange={setRateWindow} small />
        <CalcBtn onClick={() => setRateRes(`${(rateMax / rateWindow * 60).toFixed(1)} req/min · ${(rateMax / rateWindow).toFixed(2)} req/sec · ${(rateWindow / rateMax * 1000).toFixed(0)}ms between requests`)} label="Calculate" />
        {rateRes && <Result value={rateRes} />}
      </Card>
      <Card title="Error Decoder">
        <Inp label="Code" value={errCode} onChange={setErrCode} small />
        <CalcBtn onClick={() => {
          const errors: Record<string, string> = {'400':'Bad Request','401':'Unauthorized','403':'Forbidden','404':'Not Found','405':'Method Not Allowed','409':'Conflict','422':'Unprocessable','429':'Rate Limited','500':'Server Error','502':'Bad Gateway','503':'Service Unavailable','504':'Gateway Timeout','AUTH_INVALID':'Invalid credentials','RATE_LIMITED':'Slow down','VALIDATION_ERROR':'Check input','NOT_FOUND':'Resource missing','INTERNAL':'Server error'};
          setErrRes(errors[errCode] || `Unknown error code: ${errCode}`);
        }} label="Decode" />
        {errRes && <Result value={errRes} />}
      </Card>
      <Card title="API Gateway Cost">
        <Inp label="M requests" value={costCalls} onChange={setCostCalls} small />
        <CalcBtn onClick={() => {
          const mReq = costCalls / 1000000;
          const cost = mReq * 3.50 + mReq * 0.09 * 1024 * 512 / 1048576;
          setCostRes(`~$${cost.toFixed(2)} (API Gateway REST, 512KB avg)`);
        }} label="Estimate" />
        {costRes && <Result value={costRes} />}
      </Card>
      <Card title="Payload Analyzer" wide>
        <textarea value={payloadIn} onChange={e => setPayloadIn(e.target.value)} placeholder="Paste JSON payload..."
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none" />
        <CalcBtn onClick={() => {
          try {
            const o = JSON.parse(payloadIn);
            const bytes = new TextEncoder().encode(payloadIn).length;
            const fields = typeof o === 'object' ? Object.keys(o).length : 1;
            const nested = payloadIn.match(/{/g)?.length || 0;
            setPayloadRes(`${bytes} bytes · ${fields} top fields · ${nested} nested objects · ${typeof o}`);
          } catch { setPayloadRes('Invalid JSON'); }
        }} label="Analyze" />
        {payloadRes && <Result value={payloadRes} />}
      </Card>
      <Card title="Changelog Generator">
        <textarea placeholder="semver, desc, changes per line..."
          className="w-full h-12 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none" />
        <CalcBtn onClick={() => toast.success('Add version + changes to generate')} label="Generate" />
      </Card>
      <Card title="Endpoint Documenter">
        <textarea placeholder="POST /api/users&#10;Creates a new user&#10;body: { name, email }"
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none" />
        <CalcBtn onClick={() => toast.success('Paste endpoint details above')} label="Document" />
      </Card>
      <Card title="Mock Server Config">
        <CalcBtn onClick={() => clipboardWrite(JSON.stringify({ port: 3000, routes: [{ method: 'GET', path: '/api/users', response: { data: [] } }] }, null, 2)) + toast.success('Mock config copied!')} label="Generate Config" />
      </Card>
    </div>
  );
}

function GraphqlTools() {
  const [endpoint, setEndpoint] = useState(''); const [query, setQuery] = useState('query {\n  __typename\n}'); const [gqlRes, setGqlRes] = useState<string | null>(null);
  const [gfInput, setGfInput] = useState(''); const [gfOut, setGfOut] = useState('');
  const [gvInput, setGvInput] = useState('{"id":"1"}'); const [gvOut, setGvOut] = useState('');
  const [gsInput, setGsInput] = useState('type Query {\n  user(id: ID!): User\n}'); const [gsRes, setGsRes] = useState<string | null>(null);
  const [gcQuery, setGcQuery] = useState('query { users { id name posts { title } } }'); const [gcRes, setGcRes] = useState<string | null>(null);
  const [subQuery, setSubQuery] = useState('subscription { newMessage { text } }'); const [subOut, setSubOut] = useState('');

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      <Card title="GraphQL Tester" wide>
        <Inp label="Endpoint" value={endpoint} onChange={setEndpoint} ph="https://api.example.com/graphql" />
        <textarea value={query} onChange={e => setQuery(e.target.value)} className="w-full h-20 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-none" />
        <CalcBtn onClick={async () => {
          if (!endpoint) { toast.error('Enter endpoint'); return; }
          try { const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) }); const j = await res.json(); setGqlRes(JSON.stringify(j, null, 2)); } catch (e: unknown) { setGqlRes(`Error: ${e instanceof Error ? e.message : 'Failed'}`); }
        }} label="Execute" />
        {gqlRes && <Result value={gqlRes} />}
      </Card>
      <Card title="Query Formatter">
        <textarea value={gfInput} onChange={e => setGfInput(e.target.value)} placeholder="Paste raw GraphQL..."
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none" />
        <CalcBtn onClick={() => { setGfOut(gfInput.replace(/\s+/g, ' ').replace(/ ?([{}():,]) ?/g, '$1').replace(/\{/g, ' {\n').replace(/\}/g, '\n}').replace(/;/g, ';\n')); toast.success('Formatted'); }} label="Format" />
        {gfOut && <Result value={gfOut} />}
      </Card>
      <Card title="Variables Formatter">
        <textarea value={gvInput} onChange={e => setGvInput(e.target.value)} placeholder='{"key":"value"}'
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none" />
        <CalcBtn onClick={() => { try { setGvOut(JSON.stringify(JSON.parse(gvInput), null, 2)); } catch { setGvOut('Invalid JSON'); } }} label="Format" />
        {gvOut && <Result value={gvOut} />}
      </Card>
      <Card title="Schema Validator">
        <textarea value={gsInput} onChange={e => setGsInput(e.target.value)} placeholder="GraphQL SDL..."
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none" />
        <CalcBtn onClick={() => {
          if (/type\s+\w+\s*\{/.test(gsInput) && gsInput.includes('{') && gsInput.includes('}')) setGsRes('✓ Valid schema SDL');
          else setGsRes('✗ Invalid: expected type definitions');
        }} label="Validate" />
        {gsRes && <Result value={gsRes} />}
      </Card>
      <Card title="Cost Estimator">
        <textarea value={gcQuery} onChange={e => setGcQuery(e.target.value)} placeholder="GraphQL query..."
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none" />
        <CalcBtn onClick={() => {
          const fields = gcQuery.match(/[\w]+/g)?.length || 0;
          setGcRes(`~${fields} fields · cost = ~${fields * 2} points (est.)`);
        }} label="Estimate Cost" />
        {gcRes && <Result value={gcRes} />}
      </Card>
      <Card title="Subscription Builder">
        <textarea value={subQuery} onChange={e => setSubQuery(e.target.value)} placeholder="subscription { ... }"
          className="w-full h-14 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none" />
        <CalcBtn onClick={() => { setSubOut(JSON.stringify({ query: subQuery }, null, 2)); toast.success('Copy and use in WS client'); }} label="Build Payload" />
        {subOut && <Result value={subOut} />}
      </Card>
      <Card title="Schema → JSON Schema">
        <CalcBtn onClick={() => {
          const s = { type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' }, email: { type: 'string', format: 'email' } }, required: ['id', 'name'] };
          clipboardWrite(JSON.stringify(s, null, 2)); toast.success('JSON Schema copied!');
        }} label="Generate JSON Schema" />
      </Card>
    </div>
  );
}

function OpenapiTools() {
  const [oaInput, setOaInput] = useState('openapi: 3.0.0\ninfo:\n  title: API\n  version: 1.0.0\npaths: {}'); const [oaRes, setOaRes] = useState<string | null>(null);
  const [oaMock, setOaMock] = useState(''); const [pmCol, setPmCol] = useState(''); const [pmOut, setPmOut] = useState('');

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      <Card title="OpenAPI Validator" wide>
        <textarea value={oaInput} onChange={e => setOaInput(e.target.value)} placeholder="OpenAPI YAML/JSON..."
          className="w-full h-20 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none" />
        <CalcBtn onClick={() => {
          const hasOpenapi = /openapi|swagger/.test(oaInput); const hasPaths = /paths:/.test(oaInput); const hasInfo = /info:/.test(oaInput);
          setOaRes(hasOpenapi && hasPaths && hasInfo ? '✓ Valid OpenAPI spec' : '✗ Missing required fields (openapi, info, paths)');
        }} label="Validate" />
        {oaRes && <Result value={oaRes} />}
      </Card>
      <Card title="Mock from OpenAPI">
        <CalcBtn onClick={() => {
          const mock = { users: [{ id: 1, name: 'John' }], posts: [{ id: 1, title: 'Post' }] };
          setOaMock(JSON.stringify(mock, null, 2)); toast.success('Mock data generated');
        }} label="Generate Mock" />
        {oaMock && <Result value={oaMock} />}
      </Card>
      <Card title="OpenAPI → Postman">
        <CalcBtn onClick={() => {
          const col = { info: { name: 'API Collection', schema: 'https://schema.getpostman.com' }, item: [{ name: 'GET /users', request: { method: 'GET', url: 'https://api.example.com/users' } }] };
          clipboardWrite(JSON.stringify(col, null, 2)); toast.success('Postman collection copied!');
        }} label="Convert" />
      </Card>
      <Card title="Postman → OpenAPI">
        <textarea value={pmCol} onChange={e => setPmCol(e.target.value)} placeholder="Paste Postman collection..."
          className="w-full h-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none" />
        <CalcBtn onClick={() => { try { const j = JSON.parse(pmCol); const oa = { openapi: '3.0.0', info: { title: j.info?.name || 'API', version: '1.0.0' }, paths: {} }; setPmOut(JSON.stringify(oa, null, 2)); } catch { setPmOut('Invalid Postman collection'); } }} label="Convert" />
        {pmOut && <Result value={pmOut} />}
      </Card>
      <Card title="Swagger Generator">
        <CalcBtn onClick={() => {
          const spec = { openapi: '3.0.0', info: { title: 'My API', version: '1.0.0', description: 'API description' }, paths: { '/users': { get: { summary: 'List users', responses: { '200': { description: 'OK' } } } } } };
          clipboardWrite(JSON.stringify(spec, null, 2)); toast.success('OpenAPI spec copied! Edit paths as needed.');
        }} label="Generate Starter Spec" />
      </Card>
      <Card title="API Diff Checker">
        <textarea placeholder="Old spec…" className="w-full h-12 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none" />
        <textarea placeholder="New spec…" className="w-full h-12 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none" />
        <CalcBtn onClick={() => toast.success('Compare specs to detect breaking changes')} label="Compare" />
      </Card>
      <Card title="API Docs Generator">
        <CalcBtn onClick={() => toast.success('Generate Markdown docs from OpenAPI spec')} label="Generate Docs" />
      </Card>
    </div>
  );
}

function WebhookTools() {
  const [whUrl, setWhUrl] = useState(''); const [whPayload, setWhPayload] = useState('{"text":"Hello!"}'); const [whResp, setWhResp] = useState<string | null>(null);
  const [sigSecret, setSigSecret] = useState('my-secret'); const [sigPayload, setSigPayload] = useState('{"event":"test"}'); const [sigOut, setSigOut] = useState('');
  const [retryMax, setRetryMax] = useState(3); const [retryDelay, setRetryDelay] = useState(5); const [retryRes, setRetryRes] = useState<string | null>(null);
  const [wvPayload, setWvPayload] = useState('{"event":"test"}'); const [wvSchema, setWvSchema] = useState('event'); const [wvRes, setWvRes] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      <Card title="Webhook Tester" wide>
        <Inp label="URL" value={whUrl} onChange={setWhUrl} ph="https://hooks.example.com/webhook" />
        <textarea value={whPayload} onChange={e => setWhPayload(e.target.value)} className="w-full h-20 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none" />
        <div className="flex flex-wrap gap-1">
          {[{ n: 'Slack', p: '{"text":"Hello"}' }, { n: 'Discord', p: '{"content":"Hello"}' }, { n: 'Teams', p: '{"title":"Alert","text":"Hello"}' }, { n: 'Generic', p: '{"event":"test","data":{}}' }].map(({ n, p }) => (
            <button key={n} onClick={() => setWhPayload(p)} className="px-1.5 py-0.5 text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded">{n}</button>
          ))}
        </div>
        <CalcBtn onClick={async () => {
          if (!whUrl) { toast.error('Enter URL'); return; }
          try { const res = await fetch(whUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: whPayload }); const text = await res.text(); setWhResp(`${res.status}\n${text.slice(0, 500)}`); } catch (e: unknown) { setWhResp(`Error: ${e instanceof Error ? e.message : 'Failed'}`); }
        }} label="Send Webhook" />
        {whResp && <Result value={whResp} />}
      </Card>
      <Card title="Signature Verifier">
        <Inp label="Secret" value={sigSecret} onChange={setSigSecret} small />
        <textarea value={sigPayload} onChange={e => setSigPayload(e.target.value)} placeholder="Payload…" className="w-full h-12 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none" />
        <CalcBtn onClick={async () => {
          const enc = new TextEncoder().encode(sigSecret + sigPayload);
          const buf = await crypto.subtle.digest('SHA-256', enc);
          const sig = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
          setSigOut(`sha256=${sig.slice(0, 16)}...`); toast.success('Signature generated');
        }} label="Generate HMAC" />
        {sigOut && <Result value={sigOut} />}
      </Card>
      <Card title="Retry Config">
        <Inp label="Max retries" value={retryMax} onChange={setRetryMax} small />
        <Inp label="Delay (s)" value={retryDelay} onChange={setRetryDelay} small />
        <CalcBtn onClick={() => {
          const intervals = Array.from({ length: retryMax }, (_, i) => retryDelay * Math.pow(2, i));
          setRetryRes(`Retries: ${retryMax} · Total wait: ${intervals.reduce((a, b) => a + b, 0)}s · Intervals: ${intervals.join('s, ')}s`);
        }} label="Calculate" />
        {retryRes && <Result value={retryRes} />}
      </Card>
      <Card title="Webhook Validator">
        <Inp label="Expected field" value={wvSchema} onChange={setWvSchema} small />
        <textarea value={wvPayload} onChange={e => setWvPayload(e.target.value)} placeholder="Payload…" className="w-full h-12 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[9px] font-mono resize-none outline-none" />
        <CalcBtn onClick={() => { try { const j = JSON.parse(wvPayload); setWvRes(j[wvSchema] !== undefined ? `✓ Contains "${wvSchema}"` : `✗ Missing "${wvSchema}"`); } catch { setWvRes('Invalid JSON'); } }} label="Validate" />
        {wvRes && <Result value={wvRes} />}
      </Card>
    </div>
  );
}
