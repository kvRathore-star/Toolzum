"use client";
import { useState } from 'react';

export default function ApiErrorDecoder() {
  const [code, setCode] = useState('404');
  const [result, setResult] = useState('');
  const codes: Record<string, { name: string; desc: string; category: string; color: string }> = {
    '100': { name: 'Continue', desc: 'The server has received the request headers and the client should proceed to send the body', category: 'Informational', color: 'blue' },
    '101': { name: 'Switching Protocols', desc: 'The server is switching protocols as requested', category: 'Informational', color: 'blue' },
    '200': { name: 'OK', desc: 'The request has succeeded', category: 'Success', color: 'green' },
    '201': { name: 'Created', desc: 'A new resource has been created successfully', category: 'Success', color: 'green' },
    '204': { name: 'No Content', desc: 'The request succeeded but there is no content to return', category: 'Success', color: 'green' },
    '301': { name: 'Moved Permanently', desc: 'The requested resource has been moved permanently', category: 'Redirection', color: 'yellow' },
    '302': { name: 'Found', desc: 'The requested resource has been found but under a different URI', category: 'Redirection', color: 'yellow' },
    '304': { name: 'Not Modified', desc: 'The resource has not been modified since the last request', category: 'Redirection', color: 'yellow' },
    '400': { name: 'Bad Request', desc: 'The server cannot process the request due to a client error', category: 'Client Error', color: 'red' },
    '401': { name: 'Unauthorized', desc: 'Authentication is required and has failed or has not been provided', category: 'Client Error', color: 'red' },
    '403': { name: 'Forbidden', desc: 'The client does not have access rights to the content', category: 'Client Error', color: 'red' },
    '404': { name: 'Not Found', desc: 'The server cannot find the requested resource', category: 'Client Error', color: 'red' },
    '405': { name: 'Method Not Allowed', desc: 'The request method is not supported by the resource', category: 'Client Error', color: 'red' },
    '408': { name: 'Request Timeout', desc: 'The server timed out waiting for the request', category: 'Client Error', color: 'red' },
    '429': { name: 'Too Many Requests', desc: 'The user has sent too many requests in a given amount of time (rate limiting)', category: 'Client Error', color: 'red' },
    '500': { name: 'Internal Server Error', desc: 'A generic error message when an unexpected condition was met', category: 'Server Error', color: 'red' },
    '502': { name: 'Bad Gateway', desc: 'The server received an invalid response from an upstream server', category: 'Server Error', color: 'red' },
    '503': { name: 'Service Unavailable', desc: 'The server is temporarily unable to handle the request', category: 'Server Error', color: 'red' },
    '504': { name: 'Gateway Timeout', desc: 'The upstream server failed to send a request in the time allowed', category: 'Server Error', color: 'red' },
  };
  const presets = ['200', '201', '301', '400', '401', '403', '404', '429', '500', '502', '503'];
  const calc = () => {
    setResult(code);
  };
  const info = codes[result] || null;
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Error Decoder</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(c => (
            <button key={c} onClick={() => { setCode(c); setResult(''); }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${code === c ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-zinc-900'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status Code</label>
            <input aria-label="Status Code" type="number" value={code} onChange={e => setCode(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div className="flex items-end">
            <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-xs transition-all">Lookup</button>
          </div>
        </div>
        {info && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-4 space-y-3 border border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-black ${info.color === 'green' ? 'text-green-500' : info.color === 'yellow' ? 'text-yellow-500' : info.color === 'blue' ? 'text-blue-700 dark:text-blue-400' : 'text-red-500'}`}>{result}</span>
              <div>
                <p className="text-lg font-bold text-[var(--text-primary)]">{info.name}</p>
                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${info.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : info.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : info.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>{info.category}</span>
              </div>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{info.desc}</p>
          </div>
        )}
      </div>
    </div>
  );
}
