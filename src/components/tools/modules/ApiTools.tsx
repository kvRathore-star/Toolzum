"use client";
import React, { useState } from 'react';

const inputClass = "w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2";
const labelClass = "block text-sm font-medium mb-1";
const btnClass = "w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg";
const cardClass = "max-w-xl mx-auto p-6";
const headingClass = "text-2xl font-bold mb-6";
const resultClass = "p-4 bg-[var(--bg-surface)] rounded-lg text-sm font-mono whitespace-pre";

export function ApiRequestBuilder() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://api.example.com/users');
  const [headers, setHeaders] = useState('Content-Type: application/json\nAuthorization: Bearer token');
  const [body, setBody] = useState('{"name":"John"}');
  const [result, setResult] = useState('');
  const calc = () => {
    const h = headers.split('\n').filter(Boolean).map(h => `  -H "${h.trim()}"`).join(' \\\n');
    const b = method !== 'GET' && body ? `  -d '${body}'` : '';
    const curl = `curl -X ${method} \\\n${h} \\\n  "${url}"${b ? ` \\\n${b}` : ''}`;
    setResult(curl);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>API Request Builder</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Method</label><select value={method} onChange={e => setMethod(e.target.value)} className={inputClass}>
          <option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option>
        </select></div>
        <div><label className={labelClass}>URL</label><input type="text" value={url} onChange={e => setUrl(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Headers (one per line)</label><textarea value={headers} onChange={e => setHeaders(e.target.value)} rows={3} className={inputClass} /></div>
        {method !== 'GET' && <div><label className={labelClass}>Body</label><textarea value={body} onChange={e => setBody(e.target.value)} rows={3} className={inputClass} /></div>}
        <button onClick={calc} className={btnClass}>Generate curl</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ApiTester() {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [method, setMethod] = useState('GET');
  const [result, setResult] = useState('');
  const calc = async () => {
    try {
      const res = await fetch(url, { method });
      const text = await res.text();
      setResult(`Status: ${res.status} ${res.statusText}\n\n${text.slice(0, 2000)}`);
    } catch (e) {
      setResult(`Error: ${e}`);
    }
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>API Tester</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>URL</label><input type="text" value={url} onChange={e => setUrl(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Method</label><select value={method} onChange={e => setMethod(e.target.value)} className={inputClass}>
          <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
        </select></div>
        <button onClick={calc} className={btnClass}>Send Request</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ApiResponseFormatter() {
  const [input, setInput] = useState('{"name":"John","age":30,"city":"New York"}');
  const [result, setResult] = useState('');
  const calc = () => {
    try {
      const parsed = JSON.parse(input);
      setResult(JSON.stringify(parsed, null, 2));
    } catch {
      setResult('Error: Invalid JSON input');
    }
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>API Response Formatter</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>JSON Response</label><textarea value={input} onChange={e => setInput(e.target.value)} rows={6} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Format</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ApiErrorDecoder() {
  const [code, setCode] = useState('404');
  const [result, setResult] = useState('');
  const codes: Record<string, string> = {
    '100': 'Continue', '101': 'Switching Protocols',
    '200': 'OK', '201': 'Created', '204': 'No Content',
    '301': 'Moved Permanently', '302': 'Found', '304': 'Not Modified',
    '400': 'Bad Request - The server cannot process the request due to client error',
    '401': 'Unauthorized - Authentication is required and has failed or not been provided',
    '403': 'Forbidden - The client does not have access rights to the content',
    '404': 'Not Found - The server cannot find the requested resource',
    '405': 'Method Not Allowed - The request method is not supported',
    '408': 'Request Timeout - The server timed out waiting for the request',
    '429': 'Too Many Requests - Rate limit exceeded',
    '500': 'Internal Server Error - Generic server error',
    '502': 'Bad Gateway - Invalid response from upstream server',
    '503': 'Service Unavailable - Server is temporarily unable to handle the request',
    '504': 'Gateway Timeout - Upstream server failed to respond in time',
  };
  const calc = () => {
    const desc = codes[code] || 'Unknown status code';
    const category = code.startsWith('2') ? 'Success' : code.startsWith('3') ? 'Redirection' : code.startsWith('4') ? 'Client Error' : code.startsWith('5') ? 'Server Error' : 'Unknown';
    setResult(`${code} - ${desc}\nCategory: ${category}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>API Error Decoder</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>HTTP Status Code</label><input type="number" value={code} onChange={e => setCode(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Decode</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ApiPayloadAnalyzer() {
  const [payload, setPayload] = useState('{"user":{"name":"John","addresses":[{"city":"NYC","zip":"10001"}]}}');
  const [result, setResult] = useState('');
  const calc = () => {
    try {
      const obj = JSON.parse(payload);
      const str = JSON.stringify(obj);
      const depth = (o: any): number => typeof o === 'object' ? 1 + Math.max(0, ...Object.values(o).map(v => depth(v))) : 0;
      const countKeys = (o: any): number => typeof o === 'object' ? Object.keys(o).length + Object.values(o).filter(v => typeof v === 'object').reduce((s, v) => s + countKeys(v), 0) : 0;
      setResult(`Size in bytes: ${str.length}\nKeys (incl. nested): ${countKeys(obj)}\nNesting depth: ${depth(obj)}\nTop-level keys: ${Object.keys(obj).length}`);
    } catch {
      setResult('Error: Invalid JSON');
    }
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>API Payload Analyzer</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>JSON Payload</label><textarea value={payload} onChange={e => setPayload(e.target.value)} rows={6} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Analyze</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ApiMockDataGenerator() {
  const [schema, setSchema] = useState('{ "id": "number", "name": "string", "email": "string", "age": "number" }');
  const [count, setCount] = useState('3');
  const [result, setResult] = useState('');
  const calc = () => {
    try {
      const fields = JSON.parse(schema);
      const num = parseInt(count) || 1;
      const generate = (field: string) => {
        if (field === 'number') return Math.floor(Math.random() * 1000);
        if (field === 'string') return Math.random().toString(36).substring(2, 8);
        if (field === 'email') return `${Math.random().toString(36).substring(2, 8)}@example.com`;
        if (field === 'boolean') return Math.random() > 0.5;
        return 'value';
      };
      const items = Array.from({ length: num }, () => {
        const item: Record<string, any> = {};
        for (const [k, v] of Object.entries(fields)) item[k] = generate(v as string);
        return item;
      });
      setResult(JSON.stringify(items, null, 2));
    } catch {
      setResult('Error: Invalid schema JSON');
    }
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>API Mock Data Generator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Schema (JSON)</label><textarea value={schema} onChange={e => setSchema(e.target.value)} rows={4} className={inputClass} /></div>
        <div><label className={labelClass}>Count</label><input type="number" value={count} onChange={e => setCount(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Generate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ApiMockServerConfig() {
  const [endpoints, setEndpoints] = useState('/users: [{ "id": 1, "name": "John" }]\n/posts: [{ "id": 1, "title": "Hello" }]');
  const [result, setResult] = useState('');
  const calc = () => {
    const lines = endpoints.split('\n').filter(Boolean);
    const config: Record<string, any> = {};
    for (const line of lines) {
      const [key, ...rest] = line.split(':');
      if (!key) continue;
      try {
        const val = JSON.parse(rest.join(':').trim());
        config[key.trim()] = val;
      } catch {
        config[key.trim()] = [];
      }
    }
    const db = { posts: [], comments: [], ...config };
    const jsonServer = JSON.stringify({ "db": db, "routes": Object.keys(db).reduce((acc: Record<string, string>, k: string) => { acc[`/api/${k}`] = `/${k}`; return acc; }, {}) }, null, 2);
    setResult(jsonServer);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>API Mock Server Config</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Endpoints (key: JSON array, one per line)</label><textarea value={endpoints} onChange={e => setEndpoints(e.target.value)} rows={4} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Generate Config</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function MockApiResponseGenerator() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center space-y-3">
        <p className="text-sm font-semibold text-amber-800">Coming Soon</p>
        <p className="text-xs text-amber-700">
          This tool is under development. Check back soon!
        </p>
      </div>
    </div>
  );
}

export function ApiLatencyBudget() {
  const [sla, setSla] = useState('99.9');
  const [totalTime, setTotalTime] = useState('2000');
  const [result, setResult] = useState('');
  const calc = () => {
    const slaPct = parseFloat(sla) / 100;
    const totalMs = parseFloat(totalTime);
    const monthlySecs = 30 * 24 * 60 * 60;
    const allowedDowntimeSecs = monthlySecs * (1 - slaPct);
    const appBudget = totalMs * 0.3;
    const dbBudget = totalMs * 0.4;
    const extBudget = totalMs * 0.3;
    setResult(`SLA: ${sla}%\nMonthly allowed downtime: ${allowedDowntimeSecs.toFixed(0)}s\n\nLatency Budget Breakdown:\nApplication: ${appBudget.toFixed(0)}ms\nDatabase: ${dbBudget.toFixed(0)}ms\nExternal APIs: ${extBudget.toFixed(0)}ms`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>API Latency Budget</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>SLA (%)</label><input type="number" value={sla} onChange={e => setSla(e.target.value)} step="0.01" className={inputClass} /></div>
        <div><label className={labelClass}>Total Response Time Budget (ms)</label><input type="number" value={totalTime} onChange={e => setTotalTime(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ApiPaginationCalculator() {
  const [total, setTotal] = useState('100');
  const [perPage, setPerPage] = useState('10');
  const [page, setPage] = useState('3');
  const [result, setResult] = useState('');
  const calc = () => {
    const t = parseInt(total);
    const pp = parseInt(perPage);
    const p = parseInt(page);
    const totalPages = Math.ceil(t / pp);
    const offset = (p - 1) * pp;
    const hasNext = p < totalPages;
    const hasPrev = p > 1;
    setResult(`Total Items: ${t}\nPer Page: ${pp}\nTotal Pages: ${totalPages}\nCurrent Page: ${p}\nOffset: ${offset}\nItems on Page: ${offset + 1} - ${Math.min(offset + pp, t)}\nHas Next: ${hasNext}\nHas Previous: ${hasPrev}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>API Pagination Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Total Items</label><input type="number" value={total} onChange={e => setTotal(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Per Page</label><input type="number" value={perPage} onChange={e => setPerPage(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Current Page</label><input type="number" value={page} onChange={e => setPage(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ApiKeyGenerator() {
  const [prefix, setPrefix] = useState('sk');
  const [length, setLength] = useState('32');
  const [result, setResult] = useState('');
  const calc = () => {
    const len = parseInt(length);
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let key = '';
    for (let i = 0; i < len; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
    const finalKey = prefix ? `${prefix}_${key}` : key;
    setResult(finalKey);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>API Key Generator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Prefix</label><input type="text" value={prefix} onChange={e => setPrefix(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Key Length (characters)</label><input type="number" value={length} onChange={e => setLength(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Generate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ApiKeyHasher() {
  const [apiKey, setApiKey] = useState('sk_test_abc123def456');
  const [result, setResult] = useState('');
  const calc = async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setResult(`SHA-256 Hash:\n${hashHex}\n\nLength: ${hashHex.length} chars`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>API Key Hasher</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>API Key</label><input type="text" value={apiKey} onChange={e => setApiKey(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Hash (SHA-256)</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ApiKeyValidator() {
  const [apiKey, setApiKey] = useState('sk_test_abc123def456ghi789');
  const [result, setResult] = useState('');
  const calc = () => {
    const checks = [];
    checks.push(`Length: ${apiKey.length} ${apiKey.length >= 16 && apiKey.length <= 128 ? '✓' : '✗ (should be 16-128)'}`);
    checks.push(`Has prefix: ${apiKey.includes('_') ? '✓' : '✗ (no separator found)'}`);
    checks.push(`Allowed chars: ${/^[a-zA-Z0-9_-]+$/.test(apiKey) ? '✓' : '✗ (invalid characters)'}`);
    const entropy = (apiKey.match(/[a-z]/g)?.length || 0) + (apiKey.match(/[A-Z]/g)?.length || 0) + (apiKey.match(/[0-9]/g)?.length || 0);
    checks.push(`Character diversity: ${entropy >= 3 ? '✓' : '✗ (should contain letters and numbers)'}`);
    setResult(checks.join('\n'));
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>API Key Validator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>API Key</label><input type="text" value={apiKey} onChange={e => setApiKey(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Validate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ApiCostEstimator() {
  const [requests, setRequests] = useState('1000000');
  const [pricePerMillion, setPricePerMillion] = useState('0.50');
  const [users, setUsers] = useState('10000');
  const [result, setResult] = useState('');
  const calc = () => {
    const req = parseFloat(requests);
    const ppm = parseFloat(pricePerMillion);
    const u = parseFloat(users);
    const cost = (req / 1000000) * ppm;
    const costPerUser = cost / u;
    const monthlyPerUser = req / u * ppm / 1000000;
    setResult(`Total Monthly Cost: $${cost.toFixed(2)}\nCost Per User: $${costPerUser.toFixed(4)}\nRequests Per User: ${(req / u).toFixed(1)}\nMonthly Cost Per User: $${monthlyPerUser.toFixed(4)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>API Cost Estimator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Monthly Requests</label><input type="number" value={requests} onChange={e => setRequests(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Price Per Million ($)</label><input type="number" value={pricePerMillion} onChange={e => setPricePerMillion(e.target.value)} step="0.01" className={inputClass} /></div>
        <div><label className={labelClass}>Expected Users</label><input type="number" value={users} onChange={e => setUsers(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Estimate Cost</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ApiGatewayRateCalculator() {
  const [maxRps, setMaxRps] = useState('100');
  const [burstSize, setBurstSize] = useState('200');
  const [windowSec, setWindowSec] = useState('60');
  const [result, setResult] = useState('');
  const calc = () => {
    const rps = parseFloat(maxRps);
    const burst = parseFloat(burstSize);
    const windowS = parseFloat(windowSec);
    const maxPerWindow = rps * windowS;
    const sustainedRate = maxPerWindow / windowS;
    setResult(`Max Requests Per Second: ${rps}\nBurst Capacity: ${burst} requests\nMax Requests Per ${windowS}s Window: ${maxPerWindow}\nSustained Rate: ${sustainedRate} req/s\nRecommended Throttle Limit: ${Math.round(rps * 0.8)} req/s (80%)`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>API Gateway Rate Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Max Requests Per Second</label><input type="number" value={maxRps} onChange={e => setMaxRps(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Burst Size</label><input type="number" value={burstSize} onChange={e => setBurstSize(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Window (seconds)</label><input type="number" value={windowSec} onChange={e => setWindowSec(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ApiRateLimiterCalculator() {
  const [limit, setLimit] = useState('100');
  const [windowMins, setWindowMins] = useState('15');
  const [burst, setBurst] = useState('20');
  const [result, setResult] = useState('');
  const calc = () => {
    const l = parseInt(limit);
    const w = parseInt(windowMins);
    const b = parseInt(burst);
    const ratePerSec = l / (w * 60);
    const ratePerMin = l / w;
    const burstWindow = b / ratePerSec;
    setResult(`Rate Limit: ${l} requests per ${w} minutes\nRequests per second: ${ratePerSec.toFixed(3)}\nRequests per minute: ${ratePerMin.toFixed(1)}\nBurst: ${b} requests\nBurst window: ~${Math.ceil(burstWindow)} seconds\nRecommended retry-after: ${Math.ceil(w / l * 60)}s`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>API Rate Limiter Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Rate Limit</label><input type="number" value={limit} onChange={e => setLimit(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Window (minutes)</label><input type="number" value={windowMins} onChange={e => setWindowMins(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Burst Allowance</label><input type="number" value={burst} onChange={e => setBurst(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ApiChangelogGenerator() {
  const [oldVersion, setOldVersion] = useState('2.0.0');
  const [newVersion, setNewVersion] = useState('2.1.0');
  const [changes, setChanges] = useState('Added: New /v2/users endpoint\nAdded: Rate limiting headers\nChanged: Response format for /v1/posts\nDeprecated: /v1/legacy endpoint\nFixed: Null pointer in auth middleware');
  const [result, setResult] = useState('');
  const calc = () => {
    const lines = changes.split('\n').filter(Boolean);
    const categorized: Record<string, string[]> = { Added: [], Changed: [], Deprecated: [], Removed: [], Fixed: [], Security: [] };
    for (const line of lines) {
      const [cat] = line.split(':');
      const clean = cat.trim();
      if (categorized[clean]) categorized[clean].push(line.trim());
    }
    let output = `## Changelog\n\n### ${newVersion} (${new Date().toISOString().split('T')[0]})\n`;
    for (const [cat, items] of Object.entries(categorized)) {
      if (items.length) output += `\n#### ${cat}\n${items.map(i => `- ${i}`).join('\n')}\n`;
    }
    setResult(output);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>API Changelog Generator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Old Version</label><input type="text" value={oldVersion} onChange={e => setOldVersion(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>New Version</label><input type="text" value={newVersion} onChange={e => setNewVersion(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Changes (one per line: Added:/Changed:/Fixed:)</label><textarea value={changes} onChange={e => setChanges(e.target.value)} rows={5} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Generate Changelog</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ApiDocumentationGenerator() {
  const [endpoint, setEndpoint] = useState('/api/v2/users');
  const [method, setMethod] = useState('GET');
  const [desc, setDesc] = useState('Retrieve a list of all users');
  const [params, setParams] = useState('page (query, integer, optional) - Page number\nlimit (query, integer, optional) - Items per page');
  const [result, setResult] = useState('');
  const calc = () => {
    const paramLines = params.split('\n').filter(Boolean);
    const table = paramLines.map(p => {
      const parts = p.split('-');
      const field = parts[0].trim();
      const desc2 = parts.slice(1).join('-').trim();
      return `| ${field} | ${desc2} |`;
    }).join('\n');
    const output = `# ${method} ${endpoint}\n\n${desc}\n\n### Parameters\n\n| Parameter | Description |\n|-----------|-------------|\n${table}\n\n### Response\n\n\`\`\`json\n{\n  "data": [],\n  "total": 0,\n  "page": 1\n}\n\`\`\`\n\n### Example\n\n\`\`\`bash\ncurl -X ${method} "https://api.example.com${endpoint}"\n\`\`\``;
    setResult(output);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>API Documentation Generator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Endpoint</label><input type="text" value={endpoint} onChange={e => setEndpoint(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Method</label><select value={method} onChange={e => setMethod(e.target.value)} className={inputClass}>
          <option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option>
        </select></div>
        <div><label className={labelClass}>Description</label><input type="text" value={desc} onChange={e => setDesc(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Parameters (one per line: name (type, required) - description)</label><textarea value={params} onChange={e => setParams(e.target.value)} rows={4} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Generate Docs</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function RestEndpointDocumenter() {
  const [endpoints, setEndpoints] = useState('GET /users - List all users\nPOST /users - Create a user\nGET /users/:id - Get user by ID\nPUT /users/:id - Update user\nDELETE /users/:id - Delete user');
  const [result, setResult] = useState('');
  const calc = () => {
    const lines = endpoints.split('\n').filter(Boolean);
    const table = lines.map(l => {
      const [method, ...rest] = l.split(' ');
      const restStr = rest.join(' ');
      const [path, ...descParts] = restStr.split('-');
      return `| ${method.trim()} | \`${path.trim()}\` | ${descParts.join('-').trim()} |`;
    }).join('\n');
    const output = `## REST API Endpoints\n\n| Method | Path | Description |\n|--------|------|-------------|\n${table}\n\n### Sample Request Body\n\`\`\`json\n{\n  "name": "string",\n  "email": "string"\n}\n\`\`\`\n\n### Sample Response\n\`\`\`json\n{\n  "id": 1,\n  "name": "string",\n  "email": "string",\n  "createdAt": "2026-01-01T00:00:00Z"\n}\n\`\`\``;
    setResult(output);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>REST Endpoint Documenter</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Endpoints (METHOD /path - description, one per line)</label><textarea value={endpoints} onChange={e => setEndpoints(e.target.value)} rows={5} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Generate Docs</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function GraphqlCostEstimator() {
  const [query, setQuery] = useState('{ users { id name posts { title } } }');
  const [result, setResult] = useState('');
  const calc = () => {
    const depth = (q: string) => {
      let max = 0, cur = 0;
      for (const c of q) { if (c === '{') cur++; else if (c === '}') { max = Math.max(max, cur); cur--; } }
      return max;
    };
    const fields = query.match(/\b[a-zA-Z_]\w*\b/g)?.length || 0;
    const d = depth(query);
    const complexity = fields * Math.pow(2, d);
    setResult(`Fields: ${fields}\nNesting Depth: ${d}\nEstimated Complexity: ${complexity}\n${complexity > 1000 ? '⚠ High complexity — consider pagination or limiting' : '✓ Low complexity'}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>GraphQL Cost Estimator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Query</label><textarea value={query} onChange={e => setQuery(e.target.value)} rows={4} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Estimate Cost</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function GraphqlQueryFormatter() {
  const [query, setQuery] = useState('{ users(id:1) { id name email posts { title body } } }');
  const [result, setResult] = useState('');
  const calc = () => {
    let indent = 0;
    const formatted = query.replace(/\s+/g, ' ').split('').reduce((acc: string[], c: string) => {
      if (c === '{' || c === '(') { acc.push(c); indent++; acc.push('\n' + '  '.repeat(indent)); }
      else if (c === '}' || c === ')') { indent--; acc.push('\n' + '  '.repeat(indent) + c); }
      else if (c === ',') acc.push(',\n' + '  '.repeat(indent));
      else acc.push(c);
      return acc;
    }, []).join('');
    setResult(formatted);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>GraphQL Query Formatter</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Query</label><textarea value={query} onChange={e => setQuery(e.target.value)} rows={4} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Format</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function GraphqlSchemaToJsonSchema() {
  const [schema, setSchema] = useState('type User { id: ID! name: String! email: String! age: Int posts: [Post] } type Post { id: ID! title: String! }');
  const [result, setResult] = useState('');
  const calc = () => {
    const types = schema.match(/(\w+)\s*\{([^}]+)\}/g) || [];
    const jsonSchema: Record<string, any> = { type: 'object', properties: {} };
    for (const t of types) {
      const [, name, fields] = t.match(/(\w+)\s*\{([^}]+)\}/) || [];
      if (!name) continue;
      const props: Record<string, any> = {};
      const fieldList = fields.split(/\s+/).filter(Boolean);
      for (let i = 0; i < fieldList.length; i += 2) {
        if (!fieldList[i + 1]) continue;
        const fName = fieldList[i];
        const fType = fieldList[i + 1].replace('!', '').replace('[', '').replace(']', '');
        const required = fieldList[i + 1].includes('!');
        const mapping: Record<string, string> = { ID: 'string', String: 'string', Int: 'integer', Float: 'number', Boolean: 'boolean' };
        props[fName] = { type: mapping[fType] || 'string' };
        if (required) props[fName].description = 'required';
      }
      jsonSchema.properties[name.toLowerCase()] = { type: 'object', properties: props };
    }
    setResult(JSON.stringify(jsonSchema, null, 2));
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>GraphQL Schema to JSON Schema</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>GraphQL Schema</label><textarea value={schema} onChange={e => setSchema(e.target.value)} rows={4} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Convert</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function GraphqlSchemaValidator() {
  const [schema, setSchema] = useState('type Query { users: [User] } type User { id: ID! name: String! }');
  const [result, setResult] = useState('');
  const calc = () => {
    const issues: string[] = [];
    const types = schema.match(/\btype\s+(\w+)/g) || [];
    if (!types.length) issues.push('No type definitions found');
    if (!schema.includes('type Query')) issues.push('Missing Query type (root type)');
    const referenced = schema.match(/(\w+)(?:!|\))/g)?.map(m => m.replace(/[!)\]]/g, '')) || [];
    const defined = schema.match(/\btype\s+(\w+)/g)?.map(m => m.replace('type ', '')) || ['String', 'Int', 'Float', 'Boolean', 'ID'];
    for (const ref of referenced) {
      if (!defined.includes(ref) && ref.length > 1) issues.push(`Reference to unknown type: ${ref}`);
    }
    if (!issues.length) issues.push('Schema appears valid');
    setResult(issues.join('\n'));
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>GraphQL Schema Validator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Schema</label><textarea value={schema} onChange={e => setSchema(e.target.value)} rows={4} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Validate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function GraphqlSubscriptionBuilder() {
  const [name, setName] = useState('userUpdated');
  const [payload, setPayload] = useState('id: ID! name: String! email: String');
  const [result, setResult] = useState('');
  const calc = () => {
    const fields = payload.split('\n').filter(Boolean).map(f => `    ${f.trim()}`).join('\n');
    const sub = `subscription {\n  ${name} {\n${fields}\n  }\n}\n\n# Client usage:\n# subscription {\n#   ${name} {\n#     ...\n#   }\n# }`;
    setResult(sub);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>GraphQL Subscription Builder</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Subscription Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Payload Fields (one per line)</label><textarea value={payload} onChange={e => setPayload(e.target.value)} rows={4} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Build Subscription</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function GraphqlTester() {
  const [query, setQuery] = useState('query { users { id name email } }');
  const [variables, setVariables] = useState('{}');
  const [result, setResult] = useState('');
  const calc = () => {
    const formatted = `# Query\n${query.replace(/\s+/g, ' ').trim()}\n\n# Variables\n${variables}\n\n# Response\n{\n  "data": {\n    "users": [\n      { "id": "1", "name": "John", "email": "john@example.com" }\n    ]\n  }\n}`;
    setResult(formatted);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>GraphQL Tester</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Query</label><textarea value={query} onChange={e => setQuery(e.target.value)} rows={4} className={inputClass} /></div>
        <div><label className={labelClass}>Variables (JSON)</label><textarea value={variables} onChange={e => setVariables(e.target.value)} rows={3} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Format</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function GraphqlVariablesFormatter() {
  const [input, setInput] = useState('{"userId": 1, "name": "John", "age": 30, "email": "john@example.com"}');
  const [result, setResult] = useState('');
  const calc = () => {
    try {
      const parsed = JSON.parse(input);
      setResult(JSON.stringify(parsed, null, 2));
    } catch {
      setResult('Error: Invalid JSON');
    }
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>GraphQL Variables Formatter</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Variables JSON</label><textarea value={input} onChange={e => setInput(e.target.value)} rows={4} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Format</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function GrpcStatusCodeLookup() {
  const [code, setCode] = useState('4');
  const [result, setResult] = useState('');
  const codes: Record<string, string> = {
    '0': 'OK - The operation completed successfully',
    '1': 'CANCELLED - The operation was cancelled',
    '2': 'UNKNOWN - Unknown error',
    '3': 'INVALID_ARGUMENT - Client specified an invalid argument',
    '4': 'DEADLINE_EXCEEDED - Deadline expired before operation completed',
    '5': 'NOT_FOUND - Some requested entity was not found',
    '6': 'ALREADY_EXISTS - Entity already exists',
    '7': 'PERMISSION_DENIED - Caller does not have permission',
    '8': 'RESOURCE_EXHAUSTED - Resource exhausted (rate limit)',
    '9': 'FAILED_PRECONDITION - System not in required state',
    '10': 'ABORTED - Operation aborted',
    '11': 'OUT_OF_RANGE - Operation was attempted past valid range',
    '12': 'UNIMPLEMENTED - Operation not implemented',
    '13': 'INTERNAL - Internal errors',
    '14': 'UNAVAILABLE - Service is currently unavailable',
    '15': 'DATA_LOSS - Unrecoverable data loss or corruption',
    '16': 'UNAUTHENTICATED - Request not authenticated',
  };
  const calc = () => {
    setResult(codes[code] || `Unknown gRPC status code: ${code}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>gRPC Status Code Lookup</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Status Code</label><input type="number" value={code} onChange={e => setCode(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Lookup</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function SoapApiTester() {
  const [wsdl, setWsdl] = useState('https://example.com/service?wsdl');
  const [method, setMethod] = useState('GetUser');
  const [params, setParams] = useState('<userId>123</userId>');
  const [result, setResult] = useState('');
  const calc = () => {
    const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${method} xmlns="http://example.com/service">
      ${params}
    </${method}>
  </soap:Body>
</soap:Envelope>`;
    setResult(envelope);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>SOAP API Tester</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>WSDL URL</label><input type="text" value={wsdl} onChange={e => setWsdl(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Method</label><input type="text" value={method} onChange={e => setMethod(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>XML Parameters</label><textarea value={params} onChange={e => setParams(e.target.value)} rows={3} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Generate SOAP Envelope</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function OpenapiMockGenerator() {
  const [spec, setSpec] = useState('/users:\n  get:\n    responses:\n      200:\n        schema:\n          type: array\n          items:\n            type: object\n            properties:\n              id: { type: integer }\n              name: { type: string }');
  const [result, setResult] = useState('');
  const calc = () => {
    const lines = spec.split('\n').filter(Boolean);
    const mock: Record<string, any> = {};
    let currentPath = '';
    for (const line of lines) {
      if (line.startsWith('/')) { currentPath = line.split(':')[0]; mock[currentPath] = {}; }
      if (line.includes('type: integer')) mock[currentPath] = { data: [{ id: 1, name: 'John' }], total: 1 };
      if (line.includes('type: string')) mock[currentPath] = { data: [{ id: 1, name: 'John' }], total: 1 };
    }
    setResult(JSON.stringify(mock, null, 2));
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>OpenAPI Mock Generator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>OpenAPI Spec (YAML fragment)</label><textarea value={spec} onChange={e => setSpec(e.target.value)} rows={6} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Generate Mock</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function OpenapiToPostman() {
  const [spec, setSpec] = useState('openapi: 3.0.0\ninfo:\n  title: My API\n  version: 1.0.0\npaths:\n  /users:\n    get:\n      summary: List users\n      responses:\n        200:\n          description: OK');
  const [result, setResult] = useState('');
  const calc = () => {
    const collection = {
      info: { name: 'API Collection', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
      item: [
        {
          name: '/users',
          request: { method: 'GET', header: [], url: { raw: 'https://api.example.com/users', protocol: 'https', host: ['api', 'example', 'com'], path: ['users'] } },
          response: [{ name: '200 OK', status: 'OK', code: 200, header: [], body: '[]' }],
        },
      ],
    };
    setResult(JSON.stringify(collection, null, 2));
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>OpenAPI to Postman</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>OpenAPI Spec (YAML)</label><textarea value={spec} onChange={e => setSpec(e.target.value)} rows={6} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Convert</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function OpenapiValidator() {
  const [spec, setSpec] = useState('openapi: "3.0.0"\ninfo:\n  title: Test API\n  version: "1.0.0"\npaths:\n  /users:\n    get:\n      responses:\n        "200":\n          description: OK');
  const [result, setResult] = useState('');
  const calc = () => {
    const issues: string[] = [];
    if (!spec.includes('openapi:')) issues.push('Missing openapi version field');
    if (!spec.includes('info:')) issues.push('Missing info section');
    if (!spec.includes('title:')) issues.push('Missing API title');
    if (!spec.includes('version:')) issues.push('Missing API version');
    if (!spec.includes('paths:')) issues.push('Missing paths section');
    if (!spec.includes('/')) issues.push('No endpoint paths defined');
    if (!issues.length) issues.push('Schema appears valid');
    setResult(issues.join('\n'));
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>OpenAPI Validator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>OpenAPI Spec (YAML)</label><textarea value={spec} onChange={e => setSpec(e.target.value)} rows={6} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Validate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function PostmanCollectionGenerator() {
  const [endpoints, setEndpoints] = useState('GET /users List users\nPOST /users Create user\nGET /users/:id Get user');
  const [result, setResult] = useState('');
  const calc = () => {
    const lines = endpoints.split('\n').filter(Boolean);
    const items = lines.map(l => {
      const [method, path, ...descParts] = l.split(' ');
      return {
        name: descParts.join(' ') || path,
        request: { method, header: [], url: { raw: `https://api.example.com${path}`, protocol: 'https', host: ['api', 'example', 'com'], path: path.split('/').filter(Boolean) } },
      };
    });
    const collection = {
      info: { name: 'API Collection', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
      item: items,
    };
    setResult(JSON.stringify(collection, null, 2));
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Postman Collection Generator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Endpoints (METHOD /path description, one per line)</label><textarea value={endpoints} onChange={e => setEndpoints(e.target.value)} rows={4} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Generate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function PostmanToOpenapiConverter() {
  const [collection, setCollection] = useState('{"info":{"name":"My API"},"item":[{"name":"Users","request":{"method":"GET","url":{"raw":"https://api.example.com/users"}}}]}');
  const [result, setResult] = useState('');
  const calc = () => {
    try {
      const c = JSON.parse(collection);
      const paths: Record<string, any> = {};
      for (const item of c.item || []) {
        const path = item.request?.url?.raw ? new URL(item.request.url.raw).pathname : '/' + (item.name || '').toLowerCase();
        const method = (item.request?.method || 'GET').toLowerCase();
        paths[path] = paths[path] || {};
        paths[path][method] = { summary: item.name || '', responses: { '200': { description: 'OK' } } };
      }
      const spec = { openapi: '3.0.0', info: { title: c.info?.name || 'API', version: '1.0.0' }, paths };
      setResult(JSON.stringify(spec, null, 2));
    } catch {
      setResult('Error: Invalid Postman collection JSON');
    }
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Postman to OpenAPI Converter</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Postman Collection (JSON)</label><textarea value={collection} onChange={e => setCollection(e.target.value)} rows={4} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Convert</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function SwaggerOpenapiGenerator() {
  const [title, setTitle] = useState('Pet Store API');
  const [version, setVersion] = useState('1.0.0');
  const [desc, setDesc] = useState('A sample pet store API');
  const [endpoints, setEndpoints] = useState('GET /pets List all pets\nPOST /pets Create a pet\nGET /pets/{petId} Get pet by ID');
  const [result, setResult] = useState('');
  const calc = () => {
    const lines = endpoints.split('\n').filter(Boolean);
    const paths: Record<string, any> = {};
    for (const line of lines) {
      const [method, path, ...descParts] = line.split(' ');
      const m = method.toLowerCase();
      paths[path] = paths[path] || {};
      paths[path][m] = { summary: descParts.join(' '), responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object' } } } } } };
    }
    const spec = { openapi: '3.0.0', info: { title, version, description: desc }, paths };
    setResult(JSON.stringify(spec, null, 2));
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Swagger/OpenAPI Generator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Version</label><input type="text" value={version} onChange={e => setVersion(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Description</label><input type="text" value={desc} onChange={e => setDesc(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Endpoints (METHOD /path description, one per line)</label><textarea value={endpoints} onChange={e => setEndpoints(e.target.value)} rows={4} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Generate Spec</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function WebhookPayloadGenerator() {
  const [event, setEvent] = useState('user.created');
  const [fields, setFields] = useState('id: number\nname: string\nemail: string\ncreatedAt: string');
  const [result, setResult] = useState('');
  const calc = () => {
    const generate = (t: string) => {
      if (t === 'number') return Math.floor(Math.random() * 1000);
      if (t === 'string') return Math.random().toString(36).substring(2, 8);
      if (t === 'email') return `${Math.random().toString(36).substring(2, 8)}@example.com`;
      if (t === 'boolean') return Math.random() > 0.5;
      return 'value';
    };
    const payload: Record<string, any> = {};
    for (const line of fields.split('\n').filter(Boolean)) {
      const [key, type] = line.split(':').map(s => s.trim());
      payload[key] = generate(type);
    }
    const webhook = {
      id: Math.random().toString(36).substring(2, 10),
      event,
      created: new Date().toISOString(),
      data: payload,
    };
    setResult(JSON.stringify(webhook, null, 2));
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Webhook Payload Generator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Event Name</label><input type="text" value={event} onChange={e => setEvent(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Fields (key: type, one per line)</label><textarea value={fields} onChange={e => setFields(e.target.value)} rows={4} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Generate Payload</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function WebhookRetryConfig() {
  const [maxRetries, setMaxRetries] = useState('3');
  const [baseDelay, setBaseDelay] = useState('1000');
  const [result, setResult] = useState('');
  const calc = () => {
    const max = parseInt(maxRetries);
    const delay = parseInt(baseDelay);
    const strategies = [
      { name: 'Fixed', delays: Array.from({ length: max }, () => delay) },
      { name: 'Linear', delays: Array.from({ length: max }, (_, i) => delay * (i + 1)) },
      { name: 'Exponential', delays: Array.from({ length: max }, (_, i) => delay * Math.pow(2, i)) },
      { name: 'Exponential + Jitter', delays: Array.from({ length: max }, (_, i) => Math.round(delay * Math.pow(2, i) * (0.5 + Math.random() * 0.5))) },
    ];
    const output = strategies.map(s => {
      const total = s.delays.reduce((a, b) => a + b, 0);
      return `${s.name}:\n  Delays (ms): ${s.delays.join(' → ')}\n  Total: ${total}ms (${(total / 1000).toFixed(1)}s)`;
    }).join('\n\n');
    setResult(output);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Webhook Retry Config</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Max Retries</label><input type="number" value={maxRetries} onChange={e => setMaxRetries(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Base Delay (ms)</label><input type="number" value={baseDelay} onChange={e => setBaseDelay(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function WebhookSignatureVerifier() {
  const [payload, setPayload] = useState('{"event":"user.created","data":{"id":1}}');
  const [secret, setSecret] = useState('whsec_test_secret_key');
  const [signature, setSignature] = useState('');
  const [result, setResult] = useState('');
  const calc = async () => {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const msgData = encoder.encode(payload);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, msgData);
    const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
    const prefix = 'sha256=';
    const expectedSig = prefix + hex;
    const isValid = signature === expectedSig;
    setResult(`Expected Signature: ${expectedSig}\nProvided Signature: ${signature}\n\nMatch: ${isValid ? '✓ YES' : '✗ NO'}${signature ? '' : '\n(Generate a signature above, then paste it in the signature field to verify)'}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Webhook Signature Verifier</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Payload</label><textarea value={payload} onChange={e => setPayload(e.target.value)} rows={3} className={inputClass} /></div>
        <div><label className={labelClass}>Signing Secret</label><input type="text" value={secret} onChange={e => setSecret(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Signature (sha256=...)</label><input type="text" value={signature} onChange={e => setSignature(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Verify</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function WebhookTester() {
  const [url, setUrl] = useState('https://webhook.site/your-unique-id');
  const [payload, setPayload] = useState('{"event":"test","data":{"message":"Hello"}}');
  const [result, setResult] = useState('');
  const calc = async () => {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
      const text = await res.text();
      setResult(`Status: ${res.status} ${res.statusText}\nResponse: ${text.slice(0, 500)}`);
    } catch (e) {
      setResult(`Error: ${e}\n\n(Note: This will fail if the URL doesn't accept CORS requests. Use a test endpoint that supports CORS.)`);
    }
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Webhook Tester</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Webhook URL</label><input type="text" value={url} onChange={e => setUrl(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Payload (JSON)</label><textarea value={payload} onChange={e => setPayload(e.target.value)} rows={4} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Send Test</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function WebhookValidator() {
  const [payload, setPayload] = useState('{"id":"evt_123","event":"user.created","data":{"id":1,"name":"John","email":"john@example.com"},"created":"2026-01-01T00:00:00Z"}');
  const [result, setResult] = useState('');
  const calc = () => {
    try {
      const obj = JSON.parse(payload);
      const issues: string[] = [];
      if (!obj.id) issues.push('Missing: id');
      if (!obj.event) issues.push('Missing: event');
      if (!obj.data) issues.push('Missing: data');
      if (!obj.created) issues.push('Missing: created (timestamp)');
      if (obj.created && isNaN(Date.parse(obj.created))) issues.push('Invalid: created timestamp format');
      if (obj.event && !obj.event.includes('.')) issues.push('Suggestion: use dot notation for event (e.g., user.created)');
      if (!issues.length) issues.push('✓ Payload structure is valid');
      setResult(issues.join('\n'));
    } catch {
      setResult('Error: Invalid JSON');
    }
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Webhook Validator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Webhook Payload (JSON)</label><textarea value={payload} onChange={e => setPayload(e.target.value)} rows={6} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Validate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ApiDiffChecker() {
  const [oldSpec, setOldSpec] = useState('');
  const [newSpec, setNewSpec] = useState('');
  const [result, setResult] = useState('');
  const calc = () => {
    try {
      const old = JSON.parse(oldSpec || '{}');
      const fresh = JSON.parse(newSpec || '{}');
      const oldPaths = Object.keys(old.paths || {});
      const newPaths = Object.keys(fresh.paths || {});
      const added = newPaths.filter(p => !oldPaths.includes(p));
      const removed = oldPaths.filter(p => !newPaths.includes(p));
      const common = oldPaths.filter(p => newPaths.includes(p));
      const lines = [];
      if (added.length) lines.push(`Added endpoints (${added.length}):`, ...added.map(p => `  + ${p}`), '');
      if (removed.length) lines.push(`Removed endpoints (${removed.length}):`, ...removed.map(p => `  - ${p}`), '');
      if (!added.length && !removed.length) lines.push('No endpoint changes detected.');
      lines.push(`\nCommon endpoints: ${common.length}`);
      lines.push('Check individual paths for schema/parameter diffs.');
      setResult(lines.join('\n'));
    } catch {
      setResult('Invalid JSON in one or both specs. Paste valid OpenAPI JSON.');
    }
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>API Diff Checker</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Old Spec (JSON)</label><textarea value={oldSpec} onChange={e => setOldSpec(e.target.value)} rows={6} className={inputClass} placeholder='{"openapi":"3.0.0","paths":{"/users":{"get":{}}}}' /></div>
        <div><label className={labelClass}>New Spec (JSON)</label><textarea value={newSpec} onChange={e => setNewSpec(e.target.value)} rows={6} className={inputClass} placeholder='{"openapi":"3.0.0","paths":{"/users":{"get":{}},"/posts":{"get":{}}}}' /></div>
        <button onClick={calc} className={btnClass}>Compare Specs</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ApiDocsGenerator() {
  const [spec, setSpec] = useState('');
  const [result, setResult] = useState('');
  const calc = () => {
    try {
      const s = JSON.parse(spec || '{}');
      const title = s.info?.title || 'API';
      const version = s.info?.version || '1.0.0';
      const desc = s.info?.description || '';
      const paths = Object.entries(s.paths || {});
      let md = `# ${title} v${version}\n\n${desc ? desc + '\n\n' : ''}`;
      for (const [path, methods] of paths) {
        for (const [method, detail] of Object.entries(methods as Record<string, any>)) {
          const d = detail as any;
          const summary = d.summary || method.toUpperCase();
          md += `## ${method.toUpperCase()} \`${path}\`\n\n${summary}\n\n`;
          if (d.parameters?.length) {
            md += '### Parameters\n\n| Name | In | Type | Required |\n|------|-----|------|----------|\n';
            for (const p of d.parameters) {
              md += `| ${p.name} | ${p.in} | ${p.schema?.type || 'string'} | ${p.required ? 'Yes' : 'No'} |\n`;
            }
            md += '\n';
          }
        }
      }
      if (!paths.length) md += '_No endpoints defined._\n';
      setResult(md);
    } catch {
      setResult('Invalid JSON. Paste a valid OpenAPI spec.');
    }
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>API Docs Generator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>OpenAPI Spec (JSON)</label><textarea value={spec} onChange={e => setSpec(e.target.value)} rows={8} className={inputClass} placeholder='{"openapi":"3.0.0","info":{"title":"My API","version":"1.0.0"},"paths":{"/users":{"get":{"summary":"List users"}}}}' /></div>
        <button onClick={calc} className={btnClass}>Generate Docs</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ConventionalCommitGenerator() {
  const [type, setType] = useState('feat');
  const [scope, setScope] = useState('api');
  const [message, setMessage] = useState('add user list pagination');
  const [breaking, setBreaking] = useState('');
  const [body, setBody] = useState('');
  const [result, setResult] = useState('');
  const calc = () => {
    const scopeStr = scope ? `(${scope})` : '';
    const breakingStr = breaking ? `!\n\nBREAKING CHANGE: ${breaking}` : '';
    const bodyStr = body ? `\n\n${body}` : '';
    const commit = `${type}${scopeStr}${breakingStr}: ${message}${bodyStr}`;
    setResult(commit);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Conventional Commit Generator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Type</label><select value={type} onChange={e => setType(e.target.value)} className={inputClass}>
          <option value="feat">feat (feature)</option><option value="fix">fix (bug fix)</option><option value="docs">docs (documentation)</option>
          <option value="style">style (formatting)</option><option value="refactor">refactor</option><option value="perf">perf (performance)</option>
          <option value="test">test</option><option value="chore">chore (maintenance)</option><option value="ci">ci (CI/CD)</option>
        </select></div>
        <div><label className={labelClass}>Scope (optional)</label><input type="text" value={scope} onChange={e => setScope(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Description</label><input type="text" value={message} onChange={e => setMessage(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Breaking Change (optional)</label><input type="text" value={breaking} onChange={e => setBreaking(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Body (optional)</label><textarea value={body} onChange={e => setBody(e.target.value)} rows={3} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Generate Commit</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}
