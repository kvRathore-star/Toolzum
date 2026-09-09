"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

interface IcsAttendee {
  params?: { CN?: string };
  val?: string;
}

interface IcsEvent {
  type?: string;
  summary?: string;
  dtstart?: Date | string;
  dtend?: Date | string;
  location?: string;
  description?: string;
  organizer?: string;
  attendees?: string | (string | IcsAttendee)[];
  status?: string;
  [key: string]: string | Date | (string | IcsAttendee)[] | undefined;
}

function parseIcs(text: string): IcsEvent[] {
  const events: IcsEvent[] = [];
  const lines = text.split(/\r?\n/);
  let current: IcsEvent | null = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === 'BEGIN:VEVENT') {
      current = {};
    } else if (trimmed === 'END:VEVENT' && current) {
      current.type = 'VEVENT';
      events.push(current);
      current = null;
    } else if (current) {
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx > 0) {
        const key = trimmed.slice(0, colonIdx).split(';')[0].toLowerCase();
        const val = trimmed.slice(colonIdx + 1);
        if (key === 'dtstart' || key === 'dtend') {
          const dt = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/.exec(val);
          if (dt) {
            current[key] = new Date(Date.UTC(+dt[1], +dt[2] - 1, +dt[3], +dt[4], +dt[5], +dt[6]));
          } else {
            current[key] = val;
          }
        } else if (key === 'summary' || key === 'location' || key === 'description' || key === 'organizer') {
          current[key] = val;
        } else if (key === 'attendee') {
          if (!current.attendees) current.attendees = [];
          (current.attendees as string[]).push(val.replace(/^mailto:/i, ''));
        }
      }
    }
  }
  return events;
}

type Direction = 'ics-to-csv' | 'csv-to-ics';
type DateFormat = 'iso' | 'mm-dd-yyyy' | 'dd-mm-yyyy' | 'human';

const ICS_FIELDS = [
  { key: 'summary', label: 'Summary' },
  { key: 'dtstart', label: 'Start Date' },
  { key: 'dtend', label: 'End Date' },
  { key: 'location', label: 'Location' },
  { key: 'description', label: 'Description' },
  { key: 'organizer', label: 'Organizer' },
  { key: 'attendees', label: 'Attendees' },
  { key: 'status', label: 'Status' },
];

const CSV_HEADERS = ['Summary', 'Start Date', 'End Date', 'Location', 'Description', 'Organizer', 'Attendees', 'Status'];

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  for (const line of lines) {
    const row: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    row.push(current.trim());
    if (row.some(c => c.length > 0)) rows.push(row);
  }
  return rows;
}

function generateCsv(rows: string[][]): string {
  return rows.map(row =>
    row.map(cell => {
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')
  ).join('\n');
}

function formatDate(d: Date | string | undefined, format: DateFormat): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return String(d);
  switch (format) {
    case 'iso': return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
    case 'mm-dd-yyyy': {
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${m}/${day}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
    case 'dd-mm-yyyy': {
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${day}/${m}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
    case 'human': {
      return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    default: return date.toISOString();
  }
}

function toIcsDate(dateStr: string, format: DateFormat): string {
  if (!dateStr) return '';
  try {
    let date: Date;
    if (format === 'iso') {
      date = new Date(dateStr);
    } else if (format === 'mm-dd-yyyy' || format === 'dd-mm-yyyy') {
      const parts = dateStr.split(/[/\s:]/).filter(Boolean);
      if (format === 'mm-dd-yyyy') {
        date = new Date(Number(parts[2]), Number(parts[0]) - 1, Number(parts[1]), Number(parts[3] || 0), Number(parts[4] || 0));
      } else {
        date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]), Number(parts[3] || 0), Number(parts[4] || 0));
      }
    } else {
      date = new Date(dateStr);
    }
    if (isNaN(date.getTime())) return dateStr;
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') + 'Z';
  } catch {
    return dateStr;
  }
}

function generateIcs(events: Record<string, string>[], dateFormat: DateFormat): string {
  const lines: string[] = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PROID:-//Toolzum//Calendar Converter//EN');
  for (const ev of events) {
    lines.push('BEGIN:VEVENT');
    if (ev['Summary']) lines.push('SUMMARY:' + ev['Summary']);
    if (ev['Start Date']) lines.push('DTSTART:' + toIcsDate(ev['Start Date'], dateFormat));
    if (ev['End Date']) lines.push('DTEND:' + toIcsDate(ev['End Date'], dateFormat));
    if (ev['Location']) lines.push('LOCATION:' + ev['Location']);
    if (ev['Description']) lines.push('DESCRIPTION:' + ev['Description'].replace(/\n/g, '\\n'));
    if (ev['Organizer']) lines.push('ORGANIZER;CN=' + ev['Organizer'].replace(/.*</, '').replace(/>.*/, '') + ':mailto:' + ev['Organizer']);
    if (ev['Attendees']) lines.push('ATTENDEE;CN=' + ev['Attendees'] + ':mailto:' + ev['Attendees']);
    if (ev['Status']) lines.push('STATUS:' + ev['Status'].toUpperCase());
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function flattenIcsEvent(event: IcsEvent, selectedFields: string[], dateFmt: DateFormat): Record<string, string> {
  const record: Record<string, string> = {};
  if (selectedFields.includes('summary')) record.summary = event.summary || '';
  if (selectedFields.includes('dtstart')) record.dtstart = formatDate(event.dtstart, dateFmt);
  if (selectedFields.includes('dtend')) record.dtend = formatDate(event.dtend, dateFmt);
  if (selectedFields.includes('location')) record.location = event.location || '';
  if (selectedFields.includes('description')) record.description = event.description || '';
  if (selectedFields.includes('organizer')) record.organizer = event.organizer || '';
  if (selectedFields.includes('attendees')) {
    record.attendees = Array.isArray(event.attendees)
      ? event.attendees.map((a) => typeof a === 'string' ? a : a.params?.CN || a.val || '').join('; ')
      : '';
  }
  if (selectedFields.includes('status')) record.status = event.status || '';
  return record;
}

function autoMapColumns(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());
  const headerMap: Record<string, string> = {
    'summary': 'Summary', 'title': 'Summary', 'event': 'Summary', 'name': 'Summary',
    'start date': 'Start Date', 'start': 'Start Date', 'dtstart': 'Start Date', 'date start': 'Start Date',
    'end date': 'End Date', 'end': 'End Date', 'dtend': 'End Date', 'date end': 'End Date', 'duration': 'End Date',
    'location': 'Location', 'venue': 'Location', 'place': 'Location',
    'description': 'Description', 'desc': 'Description', 'notes': 'Description', 'details': 'Description',
    'organizer': 'Organizer', 'organiser': 'Organizer', 'host': 'Organizer',
    'attendees': 'Attendees', 'attendee': 'Attendees', 'guests': 'Attendees', 'participants': 'Attendees',
    'status': 'Status', 'state': 'Status',
  };
  for (let i = 0; i < headers.length; i++) {
    const h = lowerHeaders[i];
    map[headers[i]] = headerMap[h] || headers[i];
  }
  return map;
}

export default function IcsCsvConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [direction, setDirection] = useState<Direction>('ics-to-csv');
  const [selectedFields, setSelectedFields] = useState<string[]>(ICS_FIELDS.map(f => f.key));
  const [dateFormat, setDateFormat] = useState<DateFormat>('iso');
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [events, setEvents] = useState<Record<string, string>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    return () => { if (outputUrl) URL.revokeObjectURL(outputUrl); };
  }, [outputUrl]);

  const handleFileSelect = async (selectedFile: File) => {
    try {
      setError(null);
      setOutputUrl(null);
      setPreview([]);
      setEvents([]);

      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (direction === 'ics-to-csv' && ext !== 'ics') {
        toast.error('Please select an .ics file');
        return;
      }
      if (direction === 'csv-to-ics' && ext !== 'csv') {
        toast.error('Please select a .csv file');
        return;
      }

      const text = await selectedFile.text();

      if (direction === 'ics-to-csv') {
        const data = parseIcs(text);
        const parsedEvents = data.filter((e) => e.type === 'VEVENT');
        if (parsedEvents.length === 0) {
          toast.error('No events found in the ICS file');
          return;
        }
        const flat = parsedEvents.map((e) => flattenIcsEvent(e, selectedFields, dateFormat));
        setEvents(flat);
        setPreview(flat.slice(0, 10));
        setFile(selectedFile);
        const dates = parsedEvents.map((e) => e.dtstart).filter((d): d is Date | string => Boolean(d));
        const dateRange = dates.length > 0
          ? `${new Date(Math.min(...dates.map((d: Date | string) => new Date(d).getTime()))).toLocaleDateString()} - ${new Date(Math.max(...dates.map((d: Date | string) => new Date(d).getTime()))).toLocaleDateString()}`
          : 'N/A';
        toast.success(`Found ${flat.length} event(s) (${dateRange})`);
      } else {
        const rows = parseCsv(text);
        if (rows.length < 2) {
          toast.error('CSV must have a header row and at least one data row');
          return;
        }
        const headers = rows[0];
        setCsvHeaders(headers);
        const mapping = autoMapColumns(headers);
        setColumnMapping(mapping);
        const data = rows.slice(1).map(row => {
          const rec: Record<string, string> = {};
          headers.forEach((h, i) => { rec[h] = row[i] || ''; });
          return rec;
        });
        setEvents(data);
        setPreview(data.slice(0, 10));
        setFile(selectedFile);
        toast.success(`Found ${data.length} row(s)`);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to parse the file. It may be corrupted or in an unsupported format.');
      toast.error('Failed to parse the file');
    }
  };

  const toggleField = (key: string) => {
    setSelectedFields(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    );
  };

  const convert = async () => {
    if (!file || events.length === 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      if (direction === 'ics-to-csv') {
        const displayFields = selectedFields.map(k => ICS_FIELDS.find(f => f.key === k)!.label);
        const rows = [displayFields, ...events.map(ev => displayFields.map(f => ev[selectedFields[displayFields.indexOf(f)]] || ''))];
        const csv = generateCsv(rows);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        setOutputUrl(URL.createObjectURL(blob));
        toast.success(`Converted ${events.length} event(s) to CSV`);
      } else {
        const mapped = events.map(row => {
          const rec: Record<string, string> = {};
          for (const [csvCol, icsField] of Object.entries(columnMapping)) {
            rec[icsField] = row[csvCol] || '';
          }
          return rec;
        });
        const icsContent = generateIcs(mapped, dateFormat);
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        setOutputUrl(URL.createObjectURL(blob));
        toast.success(`Converted ${events.length} row(s) to ICS`);
      }
    } catch (e) {
      console.error(e);
      setError('Conversion failed. Please check your settings and try again.');
      toast.error('Conversion failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>No server uploads — </strong>Convert calendar events between iCalendar (ICS) and CSV formats. Migrate events between Google Calendar, Outlook, Apple Calendar, and any spreadsheet.
        </div>
        <div className="flex gap-3">
          <button onClick={() => setDirection('ics-to-csv')} className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all border ${direction === 'ics-to-csv' ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-blue-300'}`}>
            ICS → CSV
          </button>
          <button onClick={() => setDirection('csv-to-ics')} className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all border ${direction === 'csv-to-ics' ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-blue-300'}`}>
            CSV → ICS
          </button>
        </div>
        <FileUploader accept={direction === 'ics-to-csv' ? '.ics,text/calendar' : '.csv,text/csv'} onFileSelect={handleFileSelect} title={direction === 'ics-to-csv' ? 'Upload ICS File' : 'Upload CSV File'} subtitle="Drag & drop your file here" />
      </div>
    );
  }

  const displayHeaders = direction === 'ics-to-csv'
    ? selectedFields.map(k => ICS_FIELDS.find(f => f.key === k)!.label)
    : Object.values(columnMapping).length > 0 ? Object.values(columnMapping) : csvHeaders;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-[var(--text-secondary)] text-sm">{events.length} event(s) • {(file.size / 1024).toFixed(0)} KB • {direction === 'ics-to-csv' ? 'ICS → CSV' : 'CSV → ICS'}</p>
        </div>
        <button onClick={() => { setFile(null); setOutputUrl(null); setEvents([]); setPreview([]); setError(null); }} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg">Change File</button>
      </div>

      {direction === 'ics-to-csv' && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4">
          <h4 className="text-[var(--text-primary)] font-medium">Fields to Export</h4>
          <div className="flex flex-wrap gap-2">
            {ICS_FIELDS.map(f => (
              <button key={f.key} onClick={() => toggleField(f.key)} className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${selectedFields.includes(f.key) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-blue-300'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">Date Format</label>
            <div className="flex gap-2">
              {([['iso', 'ISO 8601'], ['mm-dd-yyyy', 'MM/DD/YYYY'], ['dd-mm-yyyy', 'DD/MM/YYYY'], ['human', 'Human Readable']] as [DateFormat, string][]).map(([k, lbl]) => (
                <button key={k} onClick={() => setDateFormat(k)} className={`py-1.5 px-3 rounded-lg text-xs font-bold border ${dateFormat === k ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-secondary)]'}`}>{lbl}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {direction === 'csv-to-ics' && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4">
          <h4 className="text-[var(--text-primary)] font-medium">Column Mapping</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {csvHeaders.map(h => (
              <div key={h} className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-secondary)] min-w-[100px]">{h}:</span>
                <select aria-label="Date Format" value={columnMapping[h] || ''} onChange={e => setColumnMapping(prev => ({ ...prev, [h]: e.target.value }))} className="flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100">
                  <option value="">— Skip —</option>
                  {CSV_HEADERS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">Input Date Format</label>
            <div className="flex gap-2">
              {([['iso', 'ISO 8601'], ['mm-dd-yyyy', 'MM/DD/YYYY'], ['dd-mm-yyyy', 'DD/MM/YYYY'], ['human', 'Human Readable']] as [DateFormat, string][]).map(([k, lbl]) => (
                <button key={k} onClick={() => setDateFormat(k)} className={`py-1.5 px-3 rounded-lg text-xs font-bold border ${dateFormat === k ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-secondary)]'}`}>{lbl}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {preview.length > 0 && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-3">
          <h4 className="text-[var(--text-primary)] font-medium">Preview ({preview.length} of {events.length})</h4>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  {displayHeaders.map(h => <th key={h} className="text-left py-2 px-3 text-[var(--text-secondary)] font-medium whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-[var(--border-subtle)]">
                    {displayHeaders.map(h => {
                      const val = direction === 'ics-to-csv'
                        ? row[ICS_FIELDS.find(f => f.label === h)?.key || '']
                        : row[csvHeaders.find(ch => columnMapping[ch] === h) || ''];
                      return <td key={h} className="py-2 px-3 text-[var(--text-primary)] truncate max-w-[200px]">{val || '-'}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-700 dark:text-red-400 text-sm">{error}</div>
      )}

      {outputUrl ? (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
            <h4 className="font-bold text-emerald-500">Conversion Ready</h4>
          </div>
          <div className="bg-emerald-700/10 rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-emerald-500">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="font-bold text-center">{file.name.replace(/\.(ics|csv)$/i, direction === 'ics-to-csv' ? '.csv' : '.ics')}</p>
          </div>
          <button onClick={() => downloadOrShare(outputUrl, file.name.replace(/\.(ics|csv)$/i, direction === 'ics-to-csv' ? '.csv' : '.ics'))} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download
          </button>
        </div>
      ) : (
        <button onClick={convert} disabled={isProcessing || events.length === 0} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          {isProcessing ? 'Converting...' : `Convert to ${direction === 'ics-to-csv' ? 'CSV' : 'ICS'}`}
        </button>
      )}
    </div>
  );
}
