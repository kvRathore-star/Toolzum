"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import * as XLSX from 'xlsx';
import { getErrorMessage } from '@/utils/error';

type Direction = 'xlsx-to-csv' | 'csv-to-xlsx';
type Delimiter = ',' | '\t' | ';' | '|';

interface FileInfo {
  name: string;
  size: number;
  sheetNames: string[];
  rowCount: number;
  colCount: number;
}

interface PreviewRow {
  [key: string]: string;
}

export default function XlsxCsvConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [direction, setDirection] = useState<Direction>('xlsx-to-csv');
  const [sheetName, setSheetName] = useState('');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [delimiter, setDelimiter] = useState<Delimiter>(',');
  const [includeHeader, setIncludeHeader] = useState(true);
  const [range, setRange] = useState('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [csvSheetName, setCsvSheetName] = useState('Sheet1');

  const resetState = useCallback(() => {
    setOutputUrl(null);
    setError(null);
    setPreviewData([]);
  }, []);

  const processXlsxFile = useCallback(async (f: File, sheet: string, delim: Delimiter, header: boolean, rng: string) => {
    setIsProcessing(true);
    resetState();
    try {
      const data = await f.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const names = wb.SheetNames;
      setSheetNames(names);
      const targetSheet = sheet || names[0];
      setSheetName(targetSheet);
      const ws = wb.Sheets[targetSheet];
      if (!ws) throw new Error(`Sheet "${targetSheet}" not found`);

      const ref = ws['!ref'];
      if (!ref) throw new Error('Empty sheet');
      const [, endStr] = ref.split(':');
      const endCol = endStr.replace(/[0-9]/g, '');
      const endRow = parseInt(endStr.replace(/[A-Z]/g, ''), 10);

      let rowsToProcess = endRow;
      if (rng !== 'all') {
        const [start, end] = rng.split('-').map(Number);
        if (isNaN(start) || isNaN(end)) throw new Error('Invalid range. Use format: 1-100');
        rowsToProcess = Math.min(end, endRow) - start + 1;
      }

      const csv = XLSX.utils.sheet_to_csv(ws, { FS: delim, blankrows: false });
      const lines = csv.split('\n').filter(l => l.trim());
      const headerRow = lines[0]?.split(delim) || [];
      const dataRows = header ? lines.slice(1) : lines;
      const limitedRows = dataRows.slice(0, 20);

      const preview: PreviewRow[] = limitedRows.map(row => {
        const vals = row.split(delim);
        const obj: PreviewRow = {};
        headerRow.forEach((h, i) => { obj[h || `Col${i + 1}`] = vals[i] || ''; });
        return obj;
      });
      setPreviewData(preview);

      const totalRows = dataRows.length;
      const totalCols = header ? headerRow.length : (dataRows[0]?.split(delim).length || 0);
      setFileInfo({ name: f.name, size: f.size, sheetNames: names, rowCount: totalRows, colCount: totalCols });

      const outputContent = header ? csv : lines.join('\n');
      const blob = new Blob([outputContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      toast.success('Converted successfully!');
    } catch (e: unknown) {
      const msg = getErrorMessage(e, 'Conversion failed');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [resetState]);

  const processCsvFile = useCallback(async (f: File, delim: Delimiter, sName: string) => {
    setIsProcessing(true);
    resetState();
    try {
      const text = await f.text();
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length === 0) throw new Error('Empty CSV file');

      const delimChar = delim;
      const data = lines.map(line => line.split(delimChar));
      const maxCols = Math.max(...data.map(r => r.length));
      const padded = data.map(r => {
        while (r.length < maxCols) r.push('');
        return r;
      });

      setFileInfo({ name: f.name, size: f.size, sheetNames: [sName], rowCount: padded.length, colCount: maxCols });

      const preview: PreviewRow[] = padded.slice(0, 20).map((row, ri) => {
        const obj: PreviewRow = {};
        row.forEach((val, ci) => { obj[`Col${ci + 1}`] = val; });
        return obj;
      });
      setPreviewData(preview);

      const ws = XLSX.utils.aoa_to_sheet(padded);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sName);
      const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbOut], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      toast.success('Converted successfully!');
    } catch (e: unknown) {
      const msg = getErrorMessage(e, 'Conversion failed');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [resetState]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    resetState();
    if (direction === 'xlsx-to-csv') {
      processXlsxFile(f, sheetName, delimiter, includeHeader, range);
    } else {
      processCsvFile(f, delimiter, csvSheetName);
    }
    e.target.value = '';
  }, [direction, sheetName, delimiter, includeHeader, range, csvSheetName, processXlsxFile, processCsvFile, resetState]);

  useEffect(() => {
    resetState();
    setFile(null);
    setFileInfo(null);
  }, [direction, resetState]);

  const downloadOutput = useCallback(() => {
    if (!outputUrl) return;
    const ext = direction === 'xlsx-to-csv' ? 'csv' : 'xlsx';
    downloadOrShare(outputUrl, `converted.${ext}`);
  }, [outputUrl, direction]);

  const previewColumns = previewData.length > 0 ? Object.keys(previewData[0]) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
        <strong>100% Client-Side Processing:</strong> Convert between Excel spreadsheets and CSV files. Perfect for data migration and analysis.
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-1">
          <button
            onClick={() => setDirection('xlsx-to-csv')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${direction === 'xlsx-to-csv' ? 'bg-blue-600 text-white shadow' : 'text-zinc-600 dark:text-[var(--text-muted)] hover:text-zinc-900 dark:hover:text-zinc-200'}`}
          >
            XLSX → CSV
          </button>
          <button
            onClick={() => setDirection('csv-to-xlsx')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${direction === 'csv-to-xlsx' ? 'bg-blue-600 text-white shadow' : 'text-zinc-600 dark:text-[var(--text-muted)] hover:text-zinc-900 dark:hover:text-zinc-200'}`}
          >
            CSV → XLSX
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-[var(--text-secondary)] mb-1 font-medium">Upload File</label>
            <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              {file ? file.name : `Choose ${direction === 'xlsx-to-csv' ? '.xlsx/.xls' : '.csv'} file`}
              <input type="file" accept={direction === 'xlsx-to-csv' ? '.xlsx,.xls' : '.csv'} onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {direction === 'xlsx-to-csv' && sheetNames.length > 0 && (
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1 font-medium">Sheet</label>
              <select
                value={sheetName}
                onChange={(e) => { setSheetName(e.target.value); if (file) processXlsxFile(file, e.target.value, delimiter, includeHeader, range); }}
                className="px-3 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm focus:outline-none"
              >
                {sheetNames.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {direction === 'xlsx-to-csv' && (
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1 font-medium">Range</label>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm focus:outline-none"
              >
                <option value="all">All Rows</option>
                <option value="1-100">Rows 1-100</option>
                <option value="1-500">Rows 1-500</option>
                <option value="1-1000">Rows 1-1000</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1 font-medium">Delimiter</label>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value as Delimiter)}
              className="px-3 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm focus:outline-none"
            >
              <option value=",">Comma (,)</option>
              <option value={'\t'}>Tab</option>
              <option value=";">Semicolon (;)</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>

          {direction === 'xlsx-to-csv' && (
            <div className="flex items-center gap-2 pb-1">
              <input
                type="checkbox"
                id="includeHeader"
                checked={includeHeader}
                onChange={(e) => setIncludeHeader(e.target.checked)}
                className="rounded border-zinc-600"
              />
              <label htmlFor="includeHeader" className="text-sm text-zinc-600 dark:text-[var(--text-muted)] cursor-pointer">Include Header</label>
            </div>
          )}

          {direction === 'csv-to-xlsx' && (
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1 font-medium">Sheet Name</label>
              <input
                type="text"
                value={csvSheetName}
                onChange={(e) => setCsvSheetName(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm focus:outline-none w-32"
              />
            </div>
          )}
        </div>

        {fileInfo && (
          <div className="flex flex-wrap gap-4 text-xs text-[var(--text-secondary)] bg-[var(--bg-overlay)]/50 rounded-xl p-3">
            <span>File: <strong className="text-[var(--text-primary)]">{fileInfo.name}</strong></span>
            <span>Sheets: <strong className="text-[var(--text-primary)]">{fileInfo.sheetNames.join(', ')}</strong></span>
            <span>Rows: <strong className="text-[var(--text-primary)]">{fileInfo.rowCount.toLocaleString()}</strong></span>
            <span>Columns: <strong className="text-[var(--text-primary)]">{fileInfo.colCount}</strong></span>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-[var(--text-secondary)] text-sm">Processing...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-950/90 border border-red-500/50 p-4 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div className="font-mono text-sm text-red-200 whitespace-pre-wrap">{error}</div>
          </div>
        </div>
      )}

      {previewData.length > 0 && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-black/40 px-4 py-3 border-b border-zinc-200 dark:border-[var(--border-subtle)] flex justify-between items-center">
            <span className="text-[var(--text-primary)] font-medium text-sm">Preview (first {Math.min(previewData.length, 20)} rows)</span>
            {outputUrl && (
              <button
                onClick={downloadOutput}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download {direction === 'xlsx-to-csv' ? '.csv' : '.xlsx'}
              </button>
            )}
          </div>
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-overlay)]/50">
                  {previewColumns.map((col, i) => (
                    <th key={i} className="px-4 py-2 text-left text-zinc-600 dark:text-[var(--text-muted)] font-medium text-xs border-b border-[var(--border-subtle)] whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, ri) => (
                  <tr key={ri} className="border-b border-[var(--border-subtle)]/50 hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-800/30">
                    {previewColumns.map((col, ci) => (
                      <td key={ci} className="px-4 py-2 text-[var(--text-primary)] text-xs whitespace-nowrap max-w-[200px] truncate">{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
