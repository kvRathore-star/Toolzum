"use client";
import { useState } from 'react';

export default function OpenapiValidator() {
  const [spec, setSpec] = useState('openapi: "3.0.0"\ninfo:\n  title: Test API\n  version: "1.0.0"\npaths:\n  /users:\n    get:\n      responses:\n        "200":\n          description: OK');
  const [result, setResult] = useState<{ valid: boolean; issues: string[] } | null>(null);
  const calc = () => {
    // Structural checks with values (not mere substring presence): version
    // value, info title/version values, at least one path with an HTTP
    // method that has at least one response with a description.
    const issues: string[] = [];
    const version = spec.match(/^openapi:\s*["']?([\d.]+)["']?/m)?.[1];
    if (!version) issues.push('Missing openapi version field (e.g. openapi: 3.0.0)');
    else if (!version.startsWith('3.')) issues.push(`OpenAPI ${version} — only 3.x is checked here`);
    const title = spec.match(/^\s*title:\s*(.+)$/m)?.[1]?.trim();
    if (!title) issues.push('Missing API title under info:');
    const infoVersion = spec.match(/^\s*version:\s*(.+)$/m)?.[1]?.trim();
    if (!infoVersion) issues.push('Missing API version under info:');
    const pathLines = spec.split('\n').filter(l => /^\s*\/\S*:\s*$/.test(l));
    if (pathLines.length === 0) issues.push('No endpoint paths defined under paths:');
    const methods = spec.match(/^\s{2,}(get|post|put|patch|delete|head|options|trace):\s*$/gim) || [];
    if (pathLines.length > 0 && methods.length === 0) issues.push('Paths exist but no HTTP methods found (get/post/put/… under a path)');
    const responses = spec.match(/^\s{4,}responses:\s*$/gim) || [];
    if (methods.length > 0 && responses.length === 0) issues.push('Methods found but no `responses:` blocks — every operation needs at least one response');
    const descriptions = spec.match(/^\s*description:\s*.+/gim) || [];
    if (responses.length > 0 && descriptions.length === 0) issues.push('Responses exist but none carry a description');
    setResult({ valid: issues.length === 0, issues: issues.length ? issues : ['Basic structure looks OK — heuristic screen only, not a full spec validation'] });
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">OpenAPI Validator</h2>
        <div>
          <label htmlFor="lbl-openapivalidator-openapi-spec-yaml" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">OpenAPI Spec (YAML)</label>
          <textarea id="lbl-openapivalidator-openapi-spec-yaml" aria-label="OpenAPI Spec (YAML)" value={spec} onChange={e => setSpec(e.target.value)} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Validate</button>
        {result && (
          <div className={`p-3 rounded-xl text-sm font-bold ${result.valid ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
            <p>{result.valid ? '✓ Basic Structure OK' : '✗ Issues Found'}</p>
            {result.issues.map((issue, i) => <p key={i} className="text-xs font-normal mt-1">{issue}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}
