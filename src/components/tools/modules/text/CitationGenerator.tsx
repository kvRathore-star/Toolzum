"use client";

import React, { useState } from 'react';
import { BookOpen, Copy, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

interface CitationForm {
  sourceType: 'book' | 'website' | 'journal' | 'article' | 'video';
  authors: string;
  title: string;
  publisher: string;
  year: string;
  url: string;
  accessed: string;
  volume: string;
  issue: string;
  pages: string;
  doi: string;
  city: string;
  edition: string;
  translator: string;
  accessedDate: string;
}

const FORMATS = ['APA 7th', 'MLA 9th', 'Chicago 17th', 'Harvard', 'IEEE', 'AMA', 'Vancouver'] as const;
type CitationFormat = typeof FORMATS[number];
const SOURCE_TYPES = ['book', 'website', 'journal', 'article', 'video'] as const;

const INITIAL_FORM: CitationForm = {
  sourceType: 'book',
  authors: '',
  title: '',
  publisher: '',
  year: new Date().getFullYear().toString(),
  url: '',
  accessed: new Date().toISOString().split('T')[0],
  volume: '',
  issue: '',
  pages: '',
  doi: '',
  city: '',
  edition: '',
  translator: '',
  accessedDate: new Date().toISOString().split('T')[0],
};

function generateCitation(form: CitationForm, format: CitationFormat): string {
  const authors = form.authors.split(',').map(a => a.trim()).filter(Boolean);
  const year = form.year || '(n.d.)';
  const title = form.title || '[Untitled]';

  const formatAuthorsAPA = () => {
    if (authors.length === 0) return '';
    if (authors.length === 1) return `${authors[0]}.`;
    if (authors.length === 2) return `${authors[0]} & ${authors[1]}.`;
    return `${authors[0]}, et al.`;
  };

  const formatAuthorsMLA = () => {
    if (authors.length === 0) return '';
    const first = authors[0];
    if (authors.length === 1) return `${first}.`;
    if (authors.length === 2) return `${first} and ${authors[1]}.`;
    return `${first}, et al.`;
  };

  const formatAuthorsHarvard = () => {
    if (authors.length === 0) return '';
    if (authors.length === 1) return `${authors[0]}.`;
    if (authors.length === 2) return `${authors[0]} and ${authors[1]}.`;
    return `${authors[0]}, et al.`;
  };

  const formatAuthorsIEEE = () => {
    if (authors.length === 0) return '';
    return authors.join(', ');
  };

  const formatAuthorsChicago = () => {
    if (authors.length === 0) return '';
    if (authors.length === 1) return `${authors[0]}.`;
    if (authors.length <= 3) return authors.join(', ') + '.';
    return `${authors[0]}, et al.`;
  };

  const italic = (s: string) => s;

  switch (format) {
    case 'APA 7th': {
      switch (form.sourceType) {
        case 'book':
          return `${formatAuthorsAPA()} (${year}). *${italic(title)}*. ${form.publisher}${form.edition ? ` (${form.edition} ed.)` : ''}.`;
        case 'website':
          return `${formatAuthorsAPA()} (${year}). *${italic(title)}*. ${form.publisher || 'Website'}. ${form.url}${form.accessedDate ? ` Accessed ${form.accessedDate}` : ''}.`;
        case 'journal':
          return `${formatAuthorsAPA()} (${year}). ${title}. *${italic(form.publisher)}*, ${form.volume}${form.issue ? `(${form.issue})` : ''}, ${form.pages || ''}. ${form.doi ? `https://doi.org/${form.doi}` : ''}`;
        case 'article':
          return `${formatAuthorsAPA()} (${year}, ${form.accessed}). ${title}. *${italic(form.publisher)}*. ${form.url}`;
        case 'video':
          return `${formatAuthorsAPA()} (${year}). *${italic(title)}* [Video]. ${form.publisher}. ${form.url}`;
        default:
          return '';
      }
    }
    case 'MLA 9th': {
      switch (form.sourceType) {
        case 'book':
          return `${formatAuthorsMLA()} *${italic(title)}*. ${form.publisher}, ${year}.`;
        case 'website':
          return `${formatAuthorsMLA()} "${title}." *${italic(form.publisher || 'Website')}*, ${year}, ${form.url}. Accessed ${form.accessedDate}.`;
        case 'journal':
          return `${formatAuthorsMLA()} "${title}." *${italic(form.publisher)}*, vol. ${form.volume}${form.issue ? `, no. ${form.issue}` : ''}, ${year}, pp. ${form.pages || 'n.p.'}.${form.doi ? ` doi:${form.doi}` : ''}`;
        case 'article':
          return `${formatAuthorsMLA()} "${title}." *${italic(form.publisher)}*, ${year}, ${form.url}.`;
        case 'video':
          return `${formatAuthorsMLA()} "${title}." *${italic(form.publisher)}*, ${year}, ${form.url}.`;
        default:
          return '';
      }
    }
    case 'Chicago 17th': {
      const yearFull = form.year || 'n.d.';
      switch (form.sourceType) {
        case 'book':
          return `${formatAuthorsChicago()} *${italic(title)}*. ${form.city || 'N.p.'}: ${form.publisher}, ${yearFull}.`;
        case 'website':
          return `${formatAuthorsChicago()} "${title}." *${italic(form.publisher || 'Website')}*. Accessed ${form.accessedDate}. ${form.url}.`;
        case 'journal':
          return `${formatAuthorsChicago()} "${title}." *${italic(form.publisher)}* ${form.volume}, no. ${form.issue || 'n.p.'} (${yearFull}): ${form.pages || 'n.p.'}.${form.doi ? ` https://doi.org/${form.doi}` : ''}`;
        case 'article':
          return `${formatAuthorsChicago()} "${title}." *${italic(form.publisher)}*, ${yearFull}. ${form.url}.`;
        case 'video':
          return `${formatAuthorsChicago()} "${title}." ${form.publisher}, ${yearFull}. ${form.url}.`;
        default:
          return '';
      }
    }
    case 'Harvard': {
      switch (form.sourceType) {
        case 'book':
          return `${formatAuthorsHarvard()} (${year}) *${italic(title)}*. ${form.city || 'N.p.'}: ${form.publisher}.`;
        case 'website':
          return `${formatAuthorsHarvard()} (${year}) ${title}. ${form.publisher || 'Website'}. Available at: ${form.url} (Accessed: ${form.accessedDate}).`;
        case 'journal':
          return `${formatAuthorsHarvard()} (${year}) '${title}', *${italic(form.publisher)}*, ${form.volume}${form.issue ? `(${form.issue})` : ''}, pp. ${form.pages || 'n.p.'}.${form.doi ? ` doi:${form.doi}` : ''}`;
        case 'article':
          return `${formatAuthorsHarvard()} (${year}) '${title}', *${italic(form.publisher)}*. Available at: ${form.url} (Accessed: ${form.accessedDate}).`;
        case 'video':
          return `${formatAuthorsHarvard()} (${year}) *${italic(title)}*, ${form.publisher}. Available at: ${form.url} (Accessed: ${form.accessedDate}).`;
        default:
          return '';
      }
    }
    case 'IEEE': {
      const authStr = formatAuthorsIEEE();
      switch (form.sourceType) {
        case 'book':
          return `${authStr}, *${italic(title)}*, ${form.edition ? `${form.edition} ed.` : ''} ${form.city || 'N.p.'}: ${form.publisher}, ${year}.`;
        case 'website':
          return `${authStr}, "${title}," ${form.publisher || 'Website'}, ${year}. [Online]. Available: ${form.url}. [Accessed: ${form.accessedDate}].`;
        case 'journal':
          return `${authStr}, "${title}," *${italic(form.publisher)}*, vol. ${form.volume}, no. ${form.issue || 'n.p.'}, pp. ${form.pages || 'n.p.'}, ${year}.${form.doi ? ` doi: ${form.doi}` : ''}`;
        case 'article':
          return `${authStr}, "${title}," ${form.publisher}, ${year}. [Online]. Available: ${form.url}. [Accessed: ${form.accessedDate}].`;
        case 'video':
          return `${authStr}, "${title}," ${form.publisher}, ${year}. [Online]. Available: ${form.url}. [Accessed: ${form.accessedDate}].`;
        default:
          return '';
      }
    }
    case 'AMA': {
      const authStr = authors.join(', ');
      switch (form.sourceType) {
        case 'book':
          return `${authStr}. *${italic(title)}*. ${form.edition ? `${form.edition} ed.` : ''} ${form.city || 'N.p.'}: ${form.publisher}; ${year}.`;
        case 'website':
          return `${authStr}. ${title}. ${form.publisher || 'Website'}. ${form.url}. Published ${year}. Accessed ${form.accessedDate}.`;
        case 'journal':
          return `${authStr}. ${title}. *${italic(form.publisher)}*. ${year};${form.volume}${form.issue ? `(${form.issue})` : ''}:${form.pages || 'n.p.'}.${form.doi ? ` doi:${form.doi}` : ''}`;
        case 'article':
          return `${authStr}. ${title}. *${italic(form.publisher)}*. ${year}. ${form.url}.`;
        case 'video':
          return `${authStr}. ${title}. ${form.publisher}. ${year}. ${form.url}.`;
        default:
          return '';
      }
    }
    case 'Vancouver': {
      const authStr = authors.join(', ');
      switch (form.sourceType) {
        case 'book':
          return `${authStr}. *${italic(title)}*. ${form.edition ? `${form.edition} ed.` : ''} ${form.city || 'N.p.'}: ${form.publisher}; ${year}.`;
        case 'website':
          return `${authStr}. ${title} [Internet]. ${form.publisher || 'Website'}. ${year} [cited ${form.accessedDate}]. Available from: ${form.url}`;
        case 'journal':
          return `${authStr}. ${title}. *${italic(form.publisher)}*. ${year};${form.volume}${form.issue ? `(${form.issue})` : ''}:${form.pages || 'n.p.'}.${form.doi ? ` doi:${form.doi}` : ''}`;
        case 'article':
          return `${authStr}. ${title}. *${italic(form.publisher)}*. ${year}. Available from: ${form.url}`;
        case 'video':
          return `${authStr}. ${title}. ${form.publisher}; ${year}. Available from: ${form.url}`;
        default:
          return '';
      }
    }
    default:
      return '';
  }
}

export default function CitationGenerator() {
  const [form, setForm] = useState<CitationForm>(INITIAL_FORM);
  const [selectedFormats, setSelectedFormats] = useState<Set<CitationFormat>>(new Set(['APA 7th']));

  const toggleFormat = (f: CitationFormat) => {
    setSelectedFormats(prev => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  const updateField = (field: keyof CitationForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const citations = Array.from(selectedFormats).map(format => ({
    format,
    text: generateCitation(form, format),
  }));

  const handleCopy = (text: string) => {
    if (!text) return;
    clipboardWrite(text);
    toast.success('Citation copied!');
  };

  const handleCopyAll = () => {
    const all = citations.map(c => `${c.format}:\n${c.text}`).join('\n\n---\n\n');
    clipboardWrite(all);
    toast.success('All citations copied!');
  };

  const handleDownload = () => {
    const content = citations.map(c => `--- ${c.format} ---\n${c.text}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'citations.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Citations downloaded!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
          <BookOpen className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Citation Generator</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Source Type</label>
              <div className="flex flex-wrap gap-1.5">
                {SOURCE_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => updateField('sourceType', t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer capitalize ${
                      form.sourceType === t
                        ? 'bg-[var(--accent-ink)] text-white'
                        : 'bg-[var(--bg-overlay)] text-[var(--text-muted)] border border-[var(--border-subtle)] hover:bg-[var(--border-subtle)]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Authors (comma-separated)</label>
              <input
                value={form.authors}
                onChange={e => updateField('authors', e.target.value)}
                placeholder="Last, F., Last, F."
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Title</label>
              <input
                value={form.title}
                onChange={e => updateField('title', e.target.value)}
                placeholder="Title of the work"
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Publisher/Journal</label>
                <input
                  value={form.publisher}
                  onChange={e => updateField('publisher', e.target.value)}
                  placeholder="Publisher"
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Year</label>
                <input
                  value={form.year}
                  onChange={e => updateField('year', e.target.value)}
                  placeholder="2024"
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                />
              </div>
            </div>

            {form.sourceType === 'journal' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Volume</label>
                  <input value={form.volume} onChange={e => updateField('volume', e.target.value)} placeholder="Vol" className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Issue</label>
                  <input value={form.issue} onChange={e => updateField('issue', e.target.value)} placeholder="No." className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Pages</label>
                  <input value={form.pages} onChange={e => updateField('pages', e.target.value)} placeholder="1-10" className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
                </div>
              </div>
            )}

            {(form.sourceType === 'website' || form.sourceType === 'article' || form.sourceType === 'video') && (
              <div className="space-y-1">
                <label className="text-xs text-[var(--text-muted)] font-bold uppercase">URL</label>
                <input
                  value={form.url}
                  onChange={e => updateField('url', e.target.value)}
                  placeholder="https://"
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Access Date</label>
              <input
                type="date"
                value={form.accessedDate}
                onChange={e => updateField('accessedDate', e.target.value)}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[var(--text-muted)] font-bold uppercase">DOI (for journals)</label>
              <input
                value={form.doi}
                onChange={e => updateField('doi', e.target.value)}
                placeholder="10.1000/xyz123"
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Citation Formats</label>
              <div className="flex flex-wrap gap-1.5">
                {FORMATS.map(f => (
                  <button
                    key={f}
                    onClick={() => toggleFormat(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selectedFormats.has(f)
                        ? 'bg-[var(--accent-ink)] text-white'
                        : 'bg-[var(--bg-overlay)] text-[var(--text-muted)] border border-[var(--border-subtle)] hover:bg-[var(--border-subtle)]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {citations.map(({ format, text }) => (
                <div key={format} className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[var(--accent)]">{format}</span>
                    <button onClick={() => handleCopy(text)} disabled={!text} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer" title="Copy">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed">{text || 'Fill in the fields to generate a citation.'}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={handleCopyAll} disabled={citations.length === 0} className="flex-1 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 cursor-pointer">
                <Copy className="w-4 h-4" /> Copy All
              </button>
              <button onClick={handleDownload} disabled={citations.length === 0} className="flex-1 bg-[var(--bg-overlay)] hover:bg-[var(--border-subtle)] disabled:opacity-50 text-[var(--text-primary)] font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 border border-[var(--border-subtle)] cursor-pointer">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
