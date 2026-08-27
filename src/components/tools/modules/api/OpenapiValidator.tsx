"use client";
import { useState } from 'react';

export default function OpenapiValidator() {
  const [spec, setSpec] = useState('openapi: "3.0.0"\ninfo:\n  title: Test API\n  version: "1.0.0"\npaths:\n  /users:\n    get:\n      responses:\n        "200":\n          description: OK');
  const [result, setResult] = useState<{ valid: boolean; issues: string[] } | null>(null);
  const calc = () => {
    const issues: string[] = [];
    if (!spec.includes('openapi:')) issues.push('Missing openapi version field');
    if (!spec.includes('info:')) issues.push('Missing info section');
    if (!spec.includes('title:')) issues.push('Missing API title');
    if (!spec.includes('version:')) issues.push('Missing API version');
    if (!spec.includes('paths:')) issues.push('Missing paths section');
    if (!spec.includes('/')) issues.push('No endpoint paths defined');
    setResult({ valid: issues.length === 0, issues: issues.length ? issues : ['Schema appears valid'] });
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">OpenAPI Validator</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">OpenAPI Spec (YAML)</label>
          <textarea value={spec} onChange={e => setSpec(e.target.value)} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Validate</button>
        {result && (
          <div className={`p-3 rounded-xl text-sm font-bold ${result.valid ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
            <p>{result.valid ? '✓ Valid Spec' : '✗ Issues Found'}</p>
            {result.issues.map((issue, i) => <p key={i} className="text-xs font-normal mt-1">{issue}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}
