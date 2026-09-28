"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { downloadOrShare } from "@/utils/nativeShare";

const outputFormats = [
  { label: 'JSON', value: 'json' },
  { label: 'JSON Lines', value: 'jsonl' },
  { label: 'CSV→JSON', value: 'csv-json' },
];

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(result, flattenObject(obj[key] as Record<string, unknown>, newKey));
    } else {
      result[newKey] = obj[key];
    }
  }
  return result;
}

export default function BulkCsvExcelToJson() {
  const [outputFormat, setOutputFormat] = useState('json');
  const [flattenNested, setFlattenNested] = useState(false);
  const [preview, setPreview] = useState<Record<string, unknown>[]>([]);
  const [resultJson, setResultJson] = useState('');
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);
    try {
      let records: Record<string, unknown>[] = [];

      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) throw new Error('CSV must have header + data rows');
        const headers = lines[0]!.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        records = lines.slice(1).map(line => {
          const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const record: Record<string, unknown> = {};
          headers.forEach((h, i) => { record[h] = vals[i] || ''; });
          return record;
        });
      } else {
        const { read, utils } = await import('xlsx');
        const data = await file.arrayBuffer();
        const wb = read(data, { type: 'array' });
        wb.SheetNames.forEach(name => {
          const sheet = wb.Sheets[name];
          const json = utils.sheet_to_json(sheet!);
          (json as Record<string, unknown>[]).forEach(r => records.push(r));
        });
      }

      if (flattenNested) {
        records = records.map(r => flattenObject(r));
      }

      setPreview(records.slice(0, 5));

      let output: string;
      if (outputFormat === 'jsonl') {
        output = records.map(r => JSON.stringify(r)).join('\n');
      } else {
        output = JSON.stringify(records, null, 2);
      }
      setResultJson(output);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [outputFormat, flattenNested]);

  const copyJson = () => {
    clipboardWrite(resultJson).then(ok => { if (ok) toast.success('JSON copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); });
  };

  const downloadJson = async () => {
    const blob = new Blob([resultJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    // Quota-gated save (1 unit) — block shows the limit modal, so only toast on success.
    if (await downloadOrShare(url, fileName ? fileName.replace(/\.(csv|xlsx|xls)$/i, '.json') : 'output.json')) {
      toast.success('Downloaded!');
    } else {
      URL.revokeObjectURL(url);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {outputFormats.map((f) => (
            <button key={f.value} onClick={() => setOutputFormat(f.value)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${outputFormat === f.value ? 'bg-[var(--accent-ink)] text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
            <input type="checkbox" checked={flattenNested} onChange={(e) => setFlattenNested(e.target.checked)} className="w-3.5 h-3.5 rounded border-[var(--border-subtle)]" />
            Flatten nested objects
          </label>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          role="group"
          aria-label="Drop a spreadsheet file here, or tab to the file picker below"
          className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-8 text-center hover:border-[var(--accent)] transition-colors cursor-pointer"
        >
          <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileInput} className="sr-only" id="csv-upload" />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <div className="text-3xl mb-2">📄</div>
            <p className="text-sm text-[var(--text-secondary)]">Drop a CSV/Excel file here or click to browse</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Supports .csv, .xlsx, .xls</p>
          </label>
        </div>

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            Processing...
          </div>
        )}

        {preview.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Preview (first {preview.length} rows)</h4>
            <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[var(--bg-surface)]">
                    {Object.keys(preview[0]!).map((key) => (
                      <th key={key} className="px-3 py-2 text-left font-medium text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-b border-[var(--border-subtle)] last:border-0">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-3 py-2 text-[var(--text-primary)]">{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {resultJson && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Output</h4>
              <div className="flex gap-3">
                <button onClick={copyJson} className="text-xs text-[var(--accent)] hover:underline font-medium">Copy JSON</button>
                <button onClick={downloadJson} className="text-xs text-[var(--accent)] hover:underline font-medium">Download .json</button>
              </div>
            </div>
            <pre className="w-full h-[300px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 text-xs font-mono text-[var(--text-primary)] overflow-auto whitespace-pre-wrap">
              {resultJson}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
