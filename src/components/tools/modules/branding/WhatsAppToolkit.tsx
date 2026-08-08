"use client";

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { MessageCircle, Link, BarChart3, Image as ImageIcon, Copy, Check, Upload, Download, Users, Calendar, Clock, Bold, Italic, Strikethrough, Type, FileSpreadsheet, QrCode, BookmarkPlus, Archive, Search, Trash2, Edit3, Plus, Smartphone, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import QRCode from 'qrcode';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'link' | 'group' | 'analyzer' | 'status' | 'format' | 'bulk' | 'qr' | 'replies';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'link', label: 'Message Link', icon: <MessageCircle className="w-4 h-4" /> },
  { key: 'group', label: 'Group Link', icon: <Users className="w-4 h-4" /> },
  { key: 'format', label: 'Format Text', icon: <Type className="w-4 h-4" /> },
  { key: 'bulk', label: 'Bulk Links', icon: <FileSpreadsheet className="w-4 h-4" /> },
  { key: 'qr', label: 'QR Code', icon: <QrCode className="w-4 h-4" /> },
  { key: 'replies', label: 'Quick Replies', icon: <BookmarkPlus className="w-4 h-4" /> },
  { key: 'analyzer', label: 'Chat Analyzer', icon: <BarChart3 className="w-4 h-4" /> },
  { key: 'status', label: 'Status Designer', icon: <ImageIcon className="w-4 h-4" /> },
];

function MessageLinkTab() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const whatsappUrl = useMemo(() => {
    const cleaned = phone.replace(/[\s\+\-\(\)]/g, '').replace(/^0+/, '');
    if (!cleaned) return '';
    const base = `https://wa.me/${cleaned}`;
    return message ? `${base}?text=${encodeURIComponent(message)}` : base;
  }, [phone, message]);

  const handleCopy = () => {
    if (!whatsappUrl) return toast.error('Enter a phone number first');
    clipboardWrite(whatsappUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--text-secondary)]">Generate a clickable <code className="text-emerald-500">wa.me</code> link with optional pre-filled message.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Phone Number *</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210"
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Pre-filled Message</label>
          <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Hi, I saw your listing..."
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
      </div>
      {whatsappUrl && (
        <div className="flex items-center gap-2 p-3 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl">
          <code className="flex-1 text-xs text-zinc-600 dark:text-[var(--text-muted)] truncate">{whatsappUrl}</code>
          <button onClick={handleCopy}
            className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="p-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}

function GroupLinkTab() {
  const [groupId, setGroupId] = useState('');
  const [copied, setCopied] = useState(false);

  const groupUrl = useMemo(() => {
    const id = groupId.trim();
    return id ? `https://chat.whatsapp.com/${id}` : '';
  }, [groupId]);

  const handleCopy = () => {
    if (!groupUrl) return toast.error('Enter a group ID first');
    clipboardWrite(groupUrl);
    setCopied(true);
    toast.success('Group link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--text-secondary)]">Format a WhatsApp group invite link from a group ID.</p>
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Group Invite Code / ID</label>
        <div className="flex gap-2">
          <input value={groupId} onChange={e => setGroupId(e.target.value)} placeholder="e.g. IvR5dLkQzP9..."
            className="flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
      </div>
      {groupUrl && (
        <div className="flex items-center gap-2 p-3 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl">
          <code className="flex-1 text-xs text-zinc-600 dark:text-[var(--text-muted)] truncate">{groupUrl}</code>
          <button onClick={handleCopy}
            className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3">
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          <strong>Note:</strong> Group invite links expire after 7+ days of inactivity. Pro: permanent invite links with QR codes.
        </p>
      </div>
    </div>
  );
}

function FormatTextTab() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const formats = useMemo(() => {
    if (!input) return [];
    return [
      { label: 'Bold', syntax: `*${input}*`, desc: 'Wraps text in asterisks' },
      { label: 'Italic', syntax: `_${input}_`, desc: 'Wraps text in underscores' },
      { label: 'Strikethrough', syntax: `~${input}~`, desc: 'Wraps text in tildes' },
      { label: 'Monospace', syntax: `\`\`\`\n${input}\n\`\`\``, desc: 'Wraps text in triple backticks' },
    ];
  }, [input]);

  const handleCopy = (text: string, label: string) => {
    clipboardWrite(text);
    setCopied(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--text-secondary)]">Format your text for WhatsApp. Type below and copy the formatted version.</p>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={3}
        placeholder="Type or paste your text here..."
        className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
      {formats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {formats.map(f => (
            <div key={f.label} className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1">
                  {f.label === 'Bold' && <Bold className="w-3 h-3" />}
                  {f.label === 'Italic' && <Italic className="w-3 h-3" />}
                  {f.label === 'Strikethrough' && <Strikethrough className="w-3 h-3" />}
                  {f.label === 'Monospace' && <Type className="w-3 h-3" />}
                  {f.label}
                </span>
                <span className="text-[9px] text-[var(--text-secondary)]">{f.desc}</span>
              </div>
              <code className="block text-xs text-[var(--text-primary)] bg-zinc-100 dark:bg-black/40 rounded-lg p-2 break-all">{f.syntax}</code>
              <button onClick={() => handleCopy(f.syntax, f.label)}
                className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors">
                {copied === f.label ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied === f.label ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="bg-[var(--bg-overlay)] rounded-xl p-3 border border-[var(--border-subtle)]">
        <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
          <strong>Tip:</strong> WhatsApp supports these formatting shortcuts natively. Paste the formatted text directly into any chat.
          <span className="block mt-1 text-[var(--text-muted)]">Pro: Bulk text formatter (format 100+ lines at once), custom formatting presets.</span>
        </p>
      </div>
    </div>
  );
}

function BulkLinkTab() {
  const [csvData, setCsvData] = useState<{ phone: string; message: string }[]>([]);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [search, setSearch] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) return toast.error('Please upload a CSV file');
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const data: { phone: string; message: string }[] = [];
      for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        if (parts[0]) {
          const phone = parts[0].replace(/[\s\+\-\(\)]/g, '').replace(/^0+/, '');
          if (phone) data.push({ phone, message: parts[1] || '' });
        }
      }
      setCsvData(data);
      toast.success(`Loaded ${data.length} contacts from CSV`);
    };
    reader.readAsText(file);
  };

  const generateLink = (item: { phone: string; message: string }) => {
    const base = `https://wa.me/${item.phone}`;
    return item.message ? `${base}?text=${encodeURIComponent(item.message)}` : base;
  };

  const copyAll = () => {
    const text = filteredData.map(d => generateLink(d)).join('\n');
    clipboardWrite(text);
    setCopiedAll(true);
    toast.success(`Copied ${filteredData.length} links!`);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopy = (index: number) => {
    clipboardWrite(generateLink(csvData[index]));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredData = useMemo(() => {
    if (!search) return csvData;
    const q = search.toLowerCase();
    return csvData.filter(d => d.phone.includes(q) || d.message.toLowerCase().includes(q));
  }, [csvData, search]);

  const downloadCsv = () => {
    const header = 'Phone,Message,WhatsApp Link';
    const rows = filteredData.map(d => `${d.phone},"${d.message}",${generateLink(d)}`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `whatsapp_bulk_links_${Date.now()}.csv`);
    toast.success('CSV exported!');
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--text-secondary)]">Upload a CSV with phone numbers and optional messages to generate bulk WhatsApp links.</p>

      <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-6 text-center hover:border-emerald-500/50 transition-colors cursor-pointer bg-[var(--bg-overlay)]/50 dark:bg-black/20"
        onClick={() => fileInputRef.current?.click()}>
        <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-[var(--text-muted)]" />
        <p className="text-sm font-medium text-zinc-600 dark:text-[var(--text-muted)]">{fileName || 'Upload CSV file'}</p>
        <p className="text-[10px] text-[var(--text-secondary)] mt-1">CSV format: phone,message (one per line)</p>
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
      </div>

      {csvData.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..."
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div className="flex gap-2">
              <button onClick={copyAll}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap">
                {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy All ({filteredData.length})
              </button>
              <button onClick={downloadCsv}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap">
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-1.5 border border-[var(--border-subtle)] rounded-xl p-2">
            {filteredData.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-[var(--bg-overlay)] rounded-lg">
                <span className="text-[10px] text-[var(--text-secondary)] w-6 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--text-primary)]">{item.phone}</p>
                  {item.message && <p className="text-[10px] text-[var(--text-secondary)] truncate">{item.message}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => window.open(generateLink(item), '_blank')}
                    className="p-1.5 bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-lg hover:bg-zinc-300 dark:hover:bg-[var(--bg-elevated)] transition-colors">
                    <MessageCircle className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  </button>
                  <button onClick={() => handleCopy(i)}
                    className="p-1.5 bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-lg hover:bg-zinc-300 dark:hover:bg-[var(--bg-elevated)] transition-colors">
                    {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-[var(--text-secondary)]" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
            <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]">
              <strong>Pro:</strong> Bulk generate 1000+ links, custom short links with tracking, scheduled sending via API, team workspace.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function QrTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phone, setPhone] = useState('919876543210');
  const [message, setMessage] = useState('');
  const [fgColor, setFgColor] = useState('#25D366');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const size = 280;

  const waText = useMemo(() => {
    const base = `https://wa.me/${phone.replace(/[\s\+\-\(\)]/g, '').replace(/^0+/, '')}`;
    return message ? `${base}?text=${encodeURIComponent(message)}` : base;
  }, [phone, message]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waText) return;
    (async () => {
      try {
        await QRCode.toCanvas(canvas, waText, {
          width: size, margin: 2,
          color: { dark: fgColor, light: bgColor },
          errorCorrectionLevel: 'H',
        });
        if (logoImage) {
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          const img = new Image();
          img.src = logoImage;
          await new Promise(r => { img.onload = r; });
          const logoSize = size * 0.2;
          const x = (size - logoSize) / 2;
          const y = (size - logoSize) / 2;
          ctx.fillStyle = bgColor;
          ctx.fillRect(x - 2, y - 2, logoSize + 4, logoSize + 4);
          ctx.drawImage(img, x, y, logoSize, logoSize);
        }
      } catch { toast.error('Failed to generate QR'); }
    })();
  }, [waText, fgColor, bgColor, logoImage, size]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadOrShare(canvas.toDataURL('image/png'), `whatsapp_qr_${Date.now()}.png`);
    toast.success('QR code downloaded!');
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--text-secondary)]">Generate a QR code that opens a WhatsApp chat with your number and optional pre-filled message.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Phone Number *</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="919876543210"
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Pre-filled Message</label>
            <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Hi, I need your services..."
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">QR Color</label>
              <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)}
                className="w-full h-10 rounded-xl border border-[var(--border-subtle)] cursor-pointer" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Background</label>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                className="w-full h-10 rounded-xl border border-[var(--border-subtle)] cursor-pointer" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Logo (optional)</label>
            <input type="file" accept="image/*" onChange={e => {
              const file = e.target.files?.[0];
              if (file) setLogoImage(URL.createObjectURL(file));
            }}
              className="w-full text-xs text-[var(--text-secondary)] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-900/20 file:text-emerald-600 dark:file:text-emerald-400 hover:file:bg-emerald-100 dark:hover:file:bg-emerald-900/30" />
          </div>
          <button onClick={handleDownload}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors">
            <Download className="w-4 h-4" /> Download QR Code
          </button>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
            <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]">
              <strong>Pro:</strong> Custom branding in QR center, dynamic QR (change link without reprinting), scan analytics, batch QR generation.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
          <div className="text-center">
            <canvas ref={canvasRef} width={size} height={size} className="rounded-xl mx-auto" />
            <p className="text-[10px] text-[var(--text-secondary)] mt-2">Scan to start WhatsApp chat</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickRepliesTab() {
  const [templates, setTemplates] = useState<{ id: string; title: string; content: string }[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('whatsapp_quick_replies');
    if (saved) {
      try { // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate quick replies from localStorage on mount
        setTemplates(JSON.parse(saved)); } catch {}
    }
  }, []);

  const saveToStorage = (data: typeof templates) => {
    setTemplates(data);
    localStorage.setItem('whatsapp_quick_replies', JSON.stringify(data));
  };

  const addTemplate = () => {
    if (!newTitle.trim() || !newContent.trim()) return toast.error('Fill in both title and content');
    const id = Date.now().toString();
    saveToStorage([...templates, { id, title: newTitle.trim(), content: newContent.trim() }]);
    setNewTitle('');
    setNewContent('');
    toast.success('Quick reply saved!');
  };

  const deleteTemplate = (id: string) => {
    saveToStorage(templates.filter(t => t.id !== id));
    toast.success('Template deleted');
  };

  const updateTemplate = (id: string, title: string, content: string) => {
    saveToStorage(templates.map(t => t.id === id ? { ...t, title, content } : t));
    setEditingId(null);
    toast.success('Template updated');
  };

  const handleCopy = (id: string, content: string) => {
    clipboardWrite(content);
    setCopiedId(id);
    toast.success('Copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--text-secondary)]">Save and manage frequently sent WhatsApp messages. Copy with one tap.</p>

      <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)] space-y-3">
        <h5 className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1.5"><Plus className="w-3 h-3" /> New Quick Reply</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Template title (e.g. Order Confirmation)"
            className="bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/30" />
          <input value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Message content (e.g. Your order #123 is confirmed!)"
            className="md:col-span-1 bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/30" />
          <button onClick={addTemplate}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Save Template
          </button>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8 text-xs text-[var(--text-secondary)]">
          <BookmarkPlus className="w-8 h-8 mx-auto mb-2 text-[var(--text-muted)]" />
          No quick replies saved yet. Add your first template above.
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map(t => (
            <div key={t.id} className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-3">
              {editingId === t.id ? (
                <div className="space-y-2">
                  <input defaultValue={t.title} id={`edit-title-${t.id}`}
                    className="w-full bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/30" />
                  <textarea defaultValue={t.content} id={`edit-content-${t.id}`} rows={2}
                    className="w-full bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => {
                      const title = (document.getElementById(`edit-title-${t.id}`) as HTMLInputElement).value;
                      const content = (document.getElementById(`edit-content-${t.id}`) as HTMLTextAreaElement).value;
                      updateTemplate(t.id, title, content);
                    }}
                      className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold">Save</button>
                    <button onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 bg-zinc-200 dark:bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] rounded-lg text-xs">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{t.title}</p>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 truncate">{t.content}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleCopy(t.id, t.content)}
                      className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors">
                      {copiedId === t.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => setEditingId(t.id)}
                      className="p-1.5 bg-zinc-200 dark:bg-[var(--bg-surface)] text-[var(--text-secondary)] rounded-lg hover:bg-zinc-300 dark:hover:bg-[var(--bg-elevated)] transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteTemplate(t.id)}
                      className="p-1.5 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
        <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]">
          <strong>Pro:</strong> Unlimited templates, categories, template variables ({'{{name}}'}, {'{{order_id}}'}), team-shared templates, analytics on most-used replies.
        </p>
      </div>
    </div>
  );
}

function ChatAnalyzerTab() {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  interface ChatStats {
    totalMessages: number;
    topSenders: [string, number][];
    messagesByDay: Record<string, number>;
    messagesByHour: Record<number, number>;
    mostActiveDay: string;
    mostActiveHour: string;
    mediaCount: number;
    linkCount: number;
  }

  const [stats, setStats] = useState<ChatStats | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.txt')) return toast.error('Please upload a WhatsApp chat export (.txt file)');
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setFileContent(text);
      analyzeChat(text);
    };
    reader.readAsText(file);
  };

  const analyzeChat = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim());
    const senderCount: Record<string, number> = {};
    const dayCount: Record<string, number> = {};
    const hourCount: Record<number, number> = {};
    let media = 0, links = 0;

    const dateRegex = /^\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}):(\d{2})(?::\d{2})?(?:\s*[APap][Mm])?\]?\s*[-:]\s*(.+?):\s*(.+)/;

    for (const line of lines) {
      const match = line.match(dateRegex);
      if (match) {
        const [, datePart, hourStr] = match;
        const sender = match[4].trim();
        const msg = match[5].trim();

        senderCount[sender] = (senderCount[sender] || 0) + 1;
        dayCount[datePart] = (dayCount[datePart] || 0) + 1;
        const hour = parseInt(hourStr);
        hourCount[hour] = (hourCount[hour] || 0) + 1;

        if (/<(Media omitted|image omitted|video omitted|document omitted|audio omitted)>/i.test(msg)) media++;
        if (/https?:\/\//i.test(msg)) links++;
      }
    }

    const sorted = Object.entries(senderCount).sort((a, b) => b[1] - a[1]);
    const topDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];
    const topHour = Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0];

    setStats({
      totalMessages: lines.length,
      topSenders: sorted.slice(0, 10),
      messagesByDay: dayCount,
      messagesByHour: hourCount,
      mostActiveDay: topDay?.[0] || 'N/A',
      mostActiveHour: topHour ? `${topHour[0]}:00 - ${parseInt(topHour[0]) + 1}:00` : 'N/A',
      mediaCount: media,
      linkCount: links,
    });
  };

  const handleExport = () => {
    if (!stats) return;
    const report = [
      '=== WhatsApp Chat Analysis Report ===',
      `File: ${fileName}`,
      `Total Messages: ${stats.totalMessages.toLocaleString()}`,
      `Media Shared: ${stats.mediaCount}`,
      `Links Shared: ${stats.linkCount}`,
      `Most Active Day: ${stats.mostActiveDay}`,
      `Most Active Hour: ${stats.mostActiveHour}`,
      '',
      '--- Top Senders ---',
      ...stats.topSenders.map(([name, count]) => `${name}: ${count} messages (${(count / stats.totalMessages * 100).toFixed(1)}%)`),
      '',
      'Pro version includes: full timeline, word cloud, sentiment analysis, export as PDF.',
    ].join('\n');
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `whatsapp_analysis_${Date.now()}.txt`);
    toast.success('Report exported!');
  };

  const maxVal = stats ? Math.max(...stats.topSenders.map(([, c]) => c)) : 0;

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--text-secondary)]">Export your WhatsApp chat (without media) and drop the <code className="text-emerald-500">.txt</code> file here to analyze.</p>

      <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-6 text-center hover:border-emerald-500/50 transition-colors cursor-pointer bg-[var(--bg-overlay)]/50 dark:bg-black/20"
        onClick={() => fileInputRef.current?.click()}>
        <Upload className="w-8 h-8 mx-auto mb-2 text-[var(--text-muted)]" />
        <p className="text-sm font-medium text-zinc-600 dark:text-[var(--text-muted)]">{fileName || 'Tap to upload _chat.txt'}</p>
        <p className="text-[10px] text-[var(--text-secondary)] mt-1">WhatsApp → More → Export Chat → Without Media</p>
        <input ref={fileInputRef} type="file" accept=".txt" onChange={handleFile} className="hidden" />
      </div>

      {stats && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[var(--bg-overlay)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
              <p className="text-2xl font-black text-zinc-800 dark:text-white">{stats.totalMessages.toLocaleString()}</p>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase mt-0.5">Total Messages</p>
            </div>
            <div className="bg-[var(--bg-overlay)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
              <p className="text-2xl font-black text-emerald-500">{stats.mediaCount}</p>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase mt-0.5">Media Shared</p>
            </div>
            <div className="bg-[var(--bg-overlay)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
              <p className="text-2xl font-black text-blue-500">{stats.linkCount}</p>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase mt-0.5">Links Shared</p>
            </div>
          </div>

          <div className="bg-[var(--bg-overlay)] rounded-xl p-3 border border-[var(--border-subtle)]">
            <h5 className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2 flex items-center gap-1.5"><Users className="w-3 h-3" /> Top Senders</h5>
            <div className="space-y-1.5">
              {stats.topSenders.map(([name, count], i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[11px] text-[var(--text-secondary)] w-4">{i + 1}.</span>
                  <span className="text-xs text-[var(--text-primary)] flex-1 truncate">{name}</span>
                  <div className="flex-1 max-w-[120px] h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(count / maxVal) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-[var(--text-secondary)] font-mono w-16 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl">
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-600 dark:text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Peak day: <strong>{stats.mostActiveDay}</strong></span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Peak hour: <strong>{stats.mostActiveHour}</strong></span>
            </div>
            <button onClick={handleExport} className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
              <Download className="w-3 h-3" /> Export
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusDesignerTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState('Good Morning!');
  const [bgColor, setBgColor] = useState('#0f172a');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(36);
  const [gradient, setGradient] = useState(false);

  const statusPresets = [
    { bg: '#0f172a', text: '#ffffff', label: 'Dark' },
    { bg: '#f97316', text: '#ffffff', label: 'Orange' },
    { bg: '#8b5cf6', text: '#ffffff', label: 'Purple' },
    { bg: '#06b6d4', text: '#ffffff', label: 'Cyan' },
    { bg: '#ec4899', text: '#ffffff', label: 'Pink' },
    { bg: '#10b981', text: '#ffffff', label: 'Emerald' },
    { bg: '#ffffff', text: '#0f172a', label: 'White' },
    { bg: '#fef2f2', text: '#991b1b', label: 'Rose' },
  ];

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 540;
    canvas.height = 960;

    if (gradient) {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, bgColor);
      grad.addColorStop(1, textColor);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = bgColor;
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${fontSize}px "Inter", system-ui, sans-serif`;

    const words = text.split('\n');
    const lineHeight = fontSize * 1.4;
    const startY = (canvas.height - (words.length - 1) * lineHeight) / 2;

    words.forEach((word, i) => {
      const lines = wrapText(ctx, word, canvas.width - 80, fontSize);
      const ly = startY + i * lineHeight;
      lines.forEach((line, j) => {
        ctx.fillText(line, canvas.width / 2, ly + j * lineHeight);
      });
    });
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] => {
    if (ctx.measureText(text).width <= maxWidth) return [text];
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth) {
        current = test;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  useMemo(() => {
    if (typeof window !== 'undefined') renderCanvas();
  }, [text, bgColor, textColor, fontSize, gradient]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(blob => {
      if (!blob) return toast.error('Failed to generate image');
      const url = URL.createObjectURL(blob);
      downloadOrShare(url, `whatsapp_status_${Date.now()}.png`);
      toast.success('Status image downloaded!');
    }, 'image/png');
  };

  const applyPreset = (preset: typeof statusPresets[0]) => {
    setBgColor(preset.bg);
    setTextColor(preset.text);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--text-secondary)]">Design a WhatsApp status image with custom text and colors.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Status Text</label>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={3}
              placeholder="Type your status message..."
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Background</label>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                className="w-full h-10 rounded-xl border border-[var(--border-subtle)] cursor-pointer" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Text Color</label>
              <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                className="w-full h-10 rounded-xl border border-[var(--border-subtle)] cursor-pointer" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={gradient} onChange={e => setGradient(e.target.checked)}
                className="rounded border-zinc-300 text-emerald-500 focus:ring-emerald-500" />
              <span className="text-[11px] text-[var(--text-secondary)]">Gradient background</span>
            </label>
            <div className="flex-1" />
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase mr-1">Font</label>
            <input type="range" min="20" max="72" value={fontSize} onChange={e => setFontSize(Number(e.target.value))}
              className="w-20 accent-emerald-500" />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {statusPresets.map(p => (
              <button key={p.label} onClick={() => applyPreset(p)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[10px] text-[var(--text-secondary)] hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors">
                <span className="w-3 h-3 rounded-full border border-zinc-300" style={{ backgroundColor: p.bg }} />
                {p.label}
              </button>
            ))}
          </div>

          <button onClick={handleDownload}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors">
            <Download className="w-4 h-4" /> Download Status Image (1080×1920)
          </button>
        </div>

        <div className="flex items-center justify-center bg-[var(--bg-overlay)] rounded-xl p-2 border border-[var(--border-subtle)] min-h-[400px]">
          <canvas ref={canvasRef} className="w-full max-w-[200px] rounded-2xl shadow-lg border-4 border-zinc-800" style={{ aspectRatio: '540/960' }} />
        </div>
      </div>
    </div>
  );
}

export default function WhatsAppToolkit() {
  const [activeTab, setActiveTab] = useState<Tab>('link');

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">WhatsApp Business Toolkit</h3>
        </div>
        <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">8 Tools</span>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
        <div className="flex border-b border-[var(--border-subtle)] overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'text-emerald-500 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10'
                  : 'text-[var(--text-muted)] border-transparent hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'link' && <MessageLinkTab />}
          {activeTab === 'group' && <GroupLinkTab />}
          {activeTab === 'format' && <FormatTextTab />}
          {activeTab === 'bulk' && <BulkLinkTab />}
          {activeTab === 'qr' && <QrTab />}
          {activeTab === 'replies' && <QuickRepliesTab />}
          {activeTab === 'analyzer' && <ChatAnalyzerTab />}
          {activeTab === 'status' && <StatusDesignerTab />}
        </div>
      </div>

      <div className="text-center text-[10px] text-[var(--text-secondary)]">
        WhatsApp is a trademark of Meta. This tool is not affiliated with or endorsed by Meta/WhatsApp.
      </div>
    </div>
  );
}
