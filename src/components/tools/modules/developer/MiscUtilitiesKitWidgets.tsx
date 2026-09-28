"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { DualPanel } from '../shared/DualPanel';
import { CalcActions } from '../shared/CalcActions';

export function CidrCalculator() {
  const [cidr, setCidr] = useState('192.168.1.0/24');
  const [result, setResult] = useState('');

  const calc = () => {
    const parts = cidr.split('/');
    if (parts.length !== 2) { toast.error('Invalid CIDR format (e.g. 192.168.1.0/24)'); return; }
    const prefix = parseInt(parts[1] ?? "");
    if (isNaN(prefix) || prefix < 0 || prefix > 32) { toast.error('Prefix must be 0-32'); return; }
    const octets = parts[0]!.split('.').map(Number);
    if (octets.length !== 4 || octets.some(o => isNaN(o) || o < 0 || o > 255)) { toast.error('Invalid IP address'); return; }
    const ipInt = octets.reduce((acc, o) => (acc << 8) + o, 0) >>> 0;
    const mask = ~(2 ** (32 - prefix) - 1) >>> 0;
    const network = ipInt & mask;
    const broadcast = network | ~mask >>> 0;
    const firstHost = prefix < 31 ? network + 1 : network;
    const lastHost = prefix < 31 ? broadcast - 1 : broadcast;
    const totalHosts = prefix < 31 ? 2 ** (32 - prefix) - 2 : 2 ** (32 - prefix);
    const fmt = (n: number) => [24, 16, 8, 0].map(s => (n >>> s) & 255).join('.');
    setResult(
      `Network:   ${fmt(network)}/${prefix}\n` +
      `Broadcast: ${fmt(broadcast)}\n` +
      `First Host: ${fmt(firstHost)}\n` +
      `Last Host:  ${fmt(lastHost)}\n` +
      `Total Hosts: ${totalHosts}\n` +
      `Netmask:   ${fmt(mask)}`
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">CIDR Calculator</h2>
        <DualPanel
          input={<>
        <input aria-label="CIDR notation, e.g. 192.168.1.0/24" type="text" value={cidr} onChange={e => setCidr(e.target.value)} placeholder="192.168.1.0/24"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-mono" />
        <button onClick={calc} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Calculate</button>
          </>}
          output={<>
            <textarea aria-label="CIDR calculation result" readOnly rows={7} value={result} placeholder="Result appears here" className="w-full bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-xs font-mono mt-2 placeholder:text-[var(--text-muted)]" />
          </>}
          actions={<CalcActions result={result} downloadData={result} downloadFilename='cidr-calc.txt' />}
        />
      </div>
    </div>
  );
}

export function AwsIamPolicyAnalyzer() {
  const [policy, setPolicy] = useState('{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"s3:ListBucket","Resource":"arn:aws:s3:::example-bucket"},{"Effect":"Allow","Action":["s3:GetObject","s3:PutObject"],"Resource":"arn:aws:s3:::example-bucket/*"}]}');
  const [analysis, setAnalysis] = useState('');

  const analyze = () => {
    try {
      const p = JSON.parse(policy);
      const statements: Array<{ Action: string | string[]; Resource: string | string[]; Effect?: string; Sid?: string; Condition?: unknown }> = p.Statement || [];
      const issues: string[] = [];
      let actions: string[] = [];
      let resources: string[] = [];

      statements.forEach((s, i) => {
        const acts = Array.isArray(s.Action) ? s.Action : [s.Action];
        const ress = Array.isArray(s.Resource) ? s.Resource : [s.Resource];
        actions = [...actions, ...acts];
        resources = [...resources, ...ress];

        if (s.Effect === 'Allow' && ress.some((r: string) => r === '*')) issues.push(`Statement ${i + 1}: Wildcard resource '*'`);
        if (ress.some((r: string) => r === '*') && acts.some((a: string) => a === '*')) issues.push(`Statement ${i + 1}: Full admin access (*:* on *)`);
        if (acts.some((a: string) => a === 's3:*')) issues.push(`Statement ${i + 1}: Broad s3:* action - consider scoping`);
      });

      const uniqueActions = [...new Set(actions)];
      const uniqueResources = [...new Set(resources)];

      setAnalysis(
        `Statements: ${statements.length}\n` +
        `Unique Actions: ${uniqueActions.length}\n` +
        `Unique Resources: ${uniqueResources.length}\n` +
        `\nActions:\n${uniqueActions.map(a => `  - ${a}`).join('\n')}\n` +
        `\nResources:\n${uniqueResources.map(r => `  - ${r}`).join('\n')}\n` +
        (issues.length > 0 ? `\nIssues:\n${issues.join('\n')}` : '\nNo obvious issues found.')
      );
    } catch { toast.error('Invalid IAM policy JSON'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">AWS IAM Policy Analyzer</h2>
        <DualPanel
          input={<>
        <textarea aria-label="IAM policy JSON" rows={6} value={policy} onChange={e => setPolicy(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={analyze} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2 rounded-lg text-sm">Analyze</button>
          </>}
          output={<>
            <textarea aria-label="IAM analysis result" readOnly rows={10} value={analysis || 'Result appears here'} className="w-full bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-xs font-mono mt-2" />
          </>}
          actions={<CalcActions result={analysis} downloadData={analysis} downloadFilename='iam-analysis.txt' />}
        />
      </div>
    </div>
  );
}
