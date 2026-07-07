"use client";
import React from 'react';
import { BulkToolShell } from './BulkToolShell';

export default function BulkCsvExcelToJson() {
  return (
    <BulkToolShell
      toolSlug="bulk-csv-excel-to-json"
      title="Bulk CSV/Excel to JSON Converter"
      description="Convert spreadsheets to structured JSON data. Perfect for API ingestion and data migration."
      accept=".csv,.xlsx,.xls"
      processFile={async (file) => {
        if (file.name.endsWith('.csv')) {
          const text = await file.text();
          const lines = text.split('\n').filter(l => l.trim());
          if (lines.length < 2) throw new Error('CSV must have header + data rows');
          const headers = lines[0].split(',').map(h => h.trim());
          const records = lines.slice(1).map(line => {
            const vals = line.split(',').map(v => v.trim());
            const record: Record<string, string> = {};
            headers.forEach((h, i) => { record[h] = vals[i] || ''; });
            return record;
          });
          const json = JSON.stringify(records, null, 2);
          return { name: file.name.replace(/\.csv$/i, '.json'), blob: new Blob([json], { type: 'application/json' }) };
        }
        const { read, utils } = await import('xlsx');
        const data = await file.arrayBuffer();
        const wb = read(data, { type: 'array' });
        const all: Record<string, unknown>[] = [];
        wb.SheetNames.forEach(name => {
          const sheet = wb.Sheets[name];
          const json = utils.sheet_to_json(sheet);
          (json as Record<string, unknown>[]).forEach(r => all.push(r));
        });
        const json = JSON.stringify(all, null, 2);
        return { name: file.name.replace(/\.(xlsx|xls)$/i, '.json'), blob: new Blob([json], { type: 'application/json' }) };
      }}
    />
  );
}
