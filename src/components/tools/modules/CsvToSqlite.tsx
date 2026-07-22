"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Play, Trash2, Table, Database, Download, FileText, ChevronDown, ChevronRight, Terminal, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import initSqlJs, { Database as SqlDb, SqlJsStatic } from 'sql.js';
import { downloadOrShare } from '@/utils/nativeShare';

export default function CsvToSqlite() {
  const [db, setDb] = useState<SqlDb | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [query, setQuery] = useState('SELECT * FROM data LIMIT 50;');
  const [results, setResults] = useState<{ columns: string[]; rows: string[][] } | null>(null);
  const [error, setError] = useState('');
  const [queryTime, setQueryTime] = useState<number | null>(null);
  const [schema, setSchema] = useState<{ table: string; columns: { name: string; type: string }[] }[]>([]);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [sqlReady, setSqlReady] = useState(false);
  const [sqlError, setSqlError] = useState('');
  const SQLRef = useRef<SqlJsStatic | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    }).then(SQL => {
      if (cancelled) return;
      SQLRef.current = SQL;
      setSqlReady(true);
    }).catch(err => {
      if (cancelled) return;
      setSqlError(err?.message || 'Failed to load SQL engine. Check your internet connection.');
    });
    const timer = setTimeout(() => {
      if (!cancelled && !SQLRef.current) {
        setSqlError('SQL engine load timed out. Check your internet connection and reload.');
      }
    }, 15000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  const refreshSchema = useCallback((database: SqlDb) => {
    const tbls: string[] = [];
      database.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").forEach((stmt: any) => {
        stmt.values.forEach((row: any[]) => tbls.push(row[0] as string));
      });
    setTables(tbls);

    const schemaInfo: { table: string; columns: { name: string; type: string }[] }[] = [];
    tbls.forEach(t => {
      const cols: { name: string; type: string }[] = [];
      database.exec(`PRAGMA table_info("${t}")`).forEach((stmt: any) => {
        stmt.values.forEach((row: any[]) => {
          cols.push({ name: row[1] as string, type: row[2] as string });
        });
      });
      schemaInfo.push({ table: t, columns: cols });
    });
    setSchema(schemaInfo);
  }, []);

  const handleFile = async (file: File) => {
    const SQL = SQLRef.current;
    if (!SQL) {
      toast.error('SQL engine not ready yet. Please wait for initialization.');
      return;
    }

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.tsv') && !file.name.endsWith('.sqlite') && !file.name.endsWith('.db') && !file.name.endsWith('.sql')) {
      toast.error('Please upload a CSV, TSV, SQLite (.sqlite/.db), or SQL file.');
      return;
    }

    try {
      if (file.name.endsWith('.sqlite') || file.name.endsWith('.db')) {
        const buf = await file.arrayBuffer();
        const database = new SQL.Database(new Uint8Array(buf));
        setDb(database);
        refreshSchema(database);
        toast.success('SQLite database loaded!');
        return;
      }

      if (file.name.endsWith('.sql')) {
        const text = await file.text();
        const database = new SQL.Database();
        database.run(text);
        setDb(database);
        refreshSchema(database);
        toast.success('SQL script executed!');
        return;
      }

      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) {
        toast.error('CSV must have at least a header row and one data row.');
        return;
      }

      const delimiter = file.name.endsWith('.tsv') ? '\t' : ',';
      const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
      const safeHeaders = headers.map(h => h.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^(\d)/, '_$1') || 'col');

      const database = new SQL.Database();
      const colDefs = safeHeaders.map(h => `"${h}" TEXT`).join(', ');
      database.run(`CREATE TABLE data (${colDefs})`);

      const insertStmt = database.prepare(`INSERT INTO data (${safeHeaders.map(h => `"${h}"`).join(', ')}) VALUES (${safeHeaders.map(() => '?').join(', ')})`);

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
        if (values.length > 0) {
          try {
            insertStmt.run(values);
          } catch { }
        }
      }
      insertStmt.free();

      setDb(database);
      refreshSchema(database);
      setExpandedTables(new Set(['data']));
      toast.success(`Loaded ${lines.length - 1} rows from ${file.name}`);

      setQuery('SELECT * FROM data LIMIT 50;');
      executeQuery(database, 'SELECT * FROM data LIMIT 50;');
    } catch (err: any) {
      toast.error(err.message || 'Failed to load file.');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const executeQuery = (database: SqlDb | null, sqlQuery: string) => {
    const targetDb = database || db;
    if (!targetDb) return;

    setError('');
    setResults(null);
    setQueryTime(null);

    try {
      const start = performance.now();
      const stmt = targetDb.exec(sqlQuery);
      const elapsed = performance.now() - start;
      setQueryTime(elapsed);

      if (stmt.length > 0) {
        setResults({ columns: stmt[0].columns, rows: stmt[0].values.map((r: any[]) => r.map((v: any) => v === null ? 'NULL' : String(v))) });
        toast.success(`Query returned ${stmt[0].values.length} rows in ${elapsed.toFixed(1)}ms`);
      } else {
        const modified = targetDb.getRowsModified();
        setResults({ columns: ['Result'], rows: [[modified > 0 ? `${modified} row(s) affected.` : 'Query executed successfully (no results).']] });
        refreshSchema(targetDb);
        toast.success(`Query executed. ${modified} row(s) affected.`);
      }
    } catch (err: any) {
      setError(err.message || 'SQL execution error.');
      toast.error(err.message || 'SQL execution error.');
    }
  };

  const handleExecute = () => {
    if (!db) { toast.error('No database loaded. Upload a CSV first.'); return; }
    if (!query.trim()) { toast.error('Enter a SQL query.'); return; }
    executeQuery(db, query);
  };

  const handleReset = () => {
    setDb(null);
    setTables([]);
    setResults(null);
    setSchema([]);
    setError('');
    setQuery('SELECT * FROM data LIMIT 50;');
    setQueryTime(null);
    toast.success('Database cleared.');
  };

  const handleExportDb = () => {
    if (!db) return;
    const data = db.export();
    const blob = new Blob([data as BlobPart], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, 'database.sqlite');
    toast.success('Database exported!');
  };

  const handleDownloadCsv = () => {
    if (!results || !results.columns.length) { toast.error('No results to export.'); return; }
    const csv = [results.columns.join(','), ...results.rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, 'query_results.csv');
    toast.success('Results exported!');
  };

  const insertSampleQuery = (sql: string) => {
    setQuery(sql);
    if (queryInputRef.current) queryInputRef.current.focus();
  };

  const toggleTableExpand = (t: string) => {
    setExpandedTables(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-5 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-[var(--accent)]" />
            CSV to SQLite Web Terminal
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Upload a CSV and run SQL queries in your browser. All processing stays on your device.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left sidebar - Schema */}
        <div className="lg:col-span-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)] font-bold uppercase flex items-center gap-1.5"><Table className="w-3.5 h-3.5" /> Schema</span>
            {db && <button onClick={handleReset} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Reset</button>}
          </div>

          {sqlError && (
            <div className="text-xs text-red-400 flex items-center gap-2 py-4 bg-red-500/10 rounded-xl px-3">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {sqlError}
            </div>
          )}

          {!sqlReady && !sqlError && (
            <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2 py-4">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              Loading SQL engine...
            </div>
          )}

          {!db && sqlReady && !sqlError && (
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors"
            >
              <Upload className="w-8 h-8 mx-auto text-[var(--text-muted)] mb-2" />
              <p className="text-xs text-[var(--text-secondary)] font-medium">Drop CSV/TSV/SQLite file here</p>
              <p className="text-[10px] text-zinc-600 mt-1">or click to browse</p>
              <input ref={fileInputRef} type="file" accept=".csv,.tsv,.sqlite,.db,.sql" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
          )}

          {db && (
            <div className="space-y-2">
              {schema.length === 0 && <p className="text-xs text-[var(--text-secondary)]">No tables found.</p>}
              {schema.map(s => (
                <div key={s.table} className="border border-[var(--border-subtle)] rounded-lg overflow-hidden">
                  <button onClick={() => toggleTableExpand(s.table)} className="w-full flex items-center justify-between px-3 py-2 text-xs font-mono text-zinc-300 hover:bg-zinc-800/50">
                    <span className="flex items-center gap-1.5">{expandedTables.has(s.table) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}{s.table}</span>
                    <span className="text-[10px] text-zinc-600">{s.columns.length} cols</span>
                  </button>
                  {expandedTables.has(s.table) && (
                    <div className="px-3 pb-2 space-y-1">
                      {s.columns.map(col => (
                        <div key={col.name} className="flex justify-between text-[10px] font-mono">
                          <span className="text-zinc-300">{col.name}</span>
                          <span className="text-zinc-600">{col.type}</span>
                        </div>
                      ))}
                      <button onClick={() => insertSampleQuery(`SELECT * FROM "${s.table}" LIMIT 50;`)} className="text-[10px] text-[var(--accent)] hover:text-indigo-300 mt-1">SELECT *</button>
                      <button onClick={() => insertSampleQuery(`SELECT COUNT(*) FROM "${s.table}";`)} className="text-[10px] text-[var(--accent)] hover:text-indigo-300 ml-2">COUNT</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {db && (
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <button onClick={handleExportDb} className="w-full text-xs text-[var(--text-muted)] hover:text-white border border-zinc-800 rounded-lg py-2 flex items-center justify-center gap-1.5">
                <Download className="w-3 h-3" /> Export .sqlite
              </button>
            </div>
          )}
        </div>

        {/* Right main area - Query editor + Results */}
        <div className="lg:col-span-9 space-y-6">
          {/* Query Editor */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[var(--text-muted)] font-bold uppercase flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> SQL Query</span>
              {db && (
                <div className="flex gap-2">
                  <button onClick={() => insertSampleQuery('SELECT name FROM sqlite_master WHERE type=\'table\';')} className="text-[10px] text-[var(--text-secondary)] hover:text-white border border-zinc-800 rounded px-2 py-1">Tables</button>
                  <button onClick={() => insertSampleQuery('SELECT sql FROM sqlite_master WHERE type=\'table\';')} className="text-[10px] text-[var(--text-secondary)] hover:text-white border border-zinc-800 rounded px-2 py-1">Schema SQL</button>
                </div>
              )}
            </div>
            <div className="relative">
              <textarea
                ref={queryInputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleExecute(); }}
                placeholder="SELECT * FROM data LIMIT 50;"
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] font-mono h-28 outline-none text-xs resize-none"
                spellCheck={false}
              />
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] text-zinc-600">Cmd+Enter to execute</span>
              <button
                onClick={handleExecute}
                disabled={!db}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-2 px-6 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <Play className="w-3.5 h-3.5" /> Execute
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[var(--text-muted)] font-bold uppercase flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Results</span>
              <div className="flex items-center gap-3">
                {queryTime !== null && <span className="text-[10px] text-zinc-600 font-mono">{queryTime.toFixed(1)}ms</span>}
                {results && results.columns.length > 0 && results.columns[0] !== 'Result' && (
                  <button onClick={handleDownloadCsv} className="text-[10px] text-[var(--text-secondary)] hover:text-white border border-zinc-800 rounded px-2 py-1 flex items-center gap-1">
                    <Download className="w-3 h-3" /> CSV
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 font-mono">{error}</div>
            )}

            {results && !error && (
              results.columns[0] === 'Result' ? (
                <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-xs text-[var(--text-muted)] font-mono">{results.rows[0][0]}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)]">
                        <th className="text-left px-3 py-2 text-[var(--text-secondary)] font-semibold">#</th>
                        {results.columns.map(col => (
                          <th key={col} className="text-left px-3 py-2 text-[var(--text-secondary)] font-semibold whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.rows.map((row, ri) => (
                        <tr key={ri} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-800/50">
                          <td className="px-3 py-1.5 text-zinc-600">{ri + 1}</td>
                          {row.map((val, vi) => (
                            <td key={vi} className="px-3 py-1.5 text-zinc-300 whitespace-nowrap max-w-[300px] overflow-hidden text-ellipsis">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {results.rows.length === 0 && <p className="text-xs text-zinc-600 text-center py-4">No rows returned.</p>}
                </div>
              )
            )}

            {!results && !error && (
              <p className="text-xs text-zinc-600 text-center py-8">Upload a CSV or SQLite database, then execute a query to see results here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
