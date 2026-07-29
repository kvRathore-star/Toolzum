"use client";
import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';

export default function BulkUrlStatusChecker() {
  return (
    <BulkToolShell
      toolSlug="bulk-url-status-checker"
      title="Bulk URL Status Checker"
      description="Check HTTP status codes for hundreds of URLs at once. Find broken links and redirects."
      accept=".csv,.txt"
      processFile={async (file) => {
        const text = await file.text();
        const urls = text.split('\n').map(l => l.trim()).filter(l => l.startsWith('http'));
        if (urls.length === 0) throw new Error('No valid URLs found');
        const results: { url: string; status: number; ok: boolean }[] = [];
        for (const url of urls) {
          try {
            const res = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
            results.push({ url, status: res.status, ok: res.ok });
          } catch {
            results.push({ url, status: 0, ok: false });
          }
        }
        const csv = 'URL,Status,OK\n' + results.map(r => `${r.url},${r.status},${r.ok}`).join('\n');
        return { name: file.name.replace(/\.[^.]+$/, '-results.csv'), blob: new Blob([csv], { type: 'text/csv' }) };
      }}
    />
  );
}
