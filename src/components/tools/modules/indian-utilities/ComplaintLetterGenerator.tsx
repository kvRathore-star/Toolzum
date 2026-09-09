"use client";

import React, { useState } from 'react';
import { FileText, AlertCircle, Building, Smartphone, ShoppingCart, Shield, Home, Zap, Droplets, Loader2, Download, Copy, Check, Sparkles, Scale } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import AiSettings from '@/components/tools/AiSettings';
import { useAiProvider } from '@/hooks/useAiProvider';
import { clipboardWrite } from "@/lib/clipboard";
import { AiPrivacyBanner } from '@/components/AiPrivacyBanner';

const COMPLAINT_TYPES = [
  { id: 'bank', label: 'Bank Fraud', icon: Building, statute: 'Banking Ombudsman Scheme 2006, RBI Guidelines', color: 'bg-blue-500' },
  { id: 'telecom', label: 'Telecom Issue', icon: Smartphone, statute: 'TRAI Regulations, Telecom Consumer Protection Rules', color: 'bg-purple-500' },
  { id: 'ecommerce', label: 'E-commerce Fraud', icon: ShoppingCart, statute: 'Consumer Protection Act 2019, Legal Metrology Act', color: 'bg-red-500' },
  { id: 'insurance', label: 'Insurance Claim', icon: Shield, statute: 'IRDAI Guidelines, Consumer Protection Act 2019', color: 'bg-emerald-700' },
  { id: 'realestate', label: 'Real Estate/Builder', icon: Home, statute: 'RERA Act 2016, Consumer Protection Act 2019', color: 'bg-amber-500' },
  { id: 'electricity', label: 'Electricity Bill', icon: Zap, statute: 'Electricity Act 2003, State Electricity Regulatory Commission', color: 'bg-yellow-500' },
  { id: 'water', label: 'Water Supply', icon: Droplets, statute: 'State Municipal Corporation Act, Consumer Protection Act 2019', color: 'bg-cyan-500' },
];

interface FormData {
  type: string; fullName: string; address: string; email: string; phone: string;
  againstName: string; againstAddress: string; transactionId: string; amount: string;
  date: string; description: string; relief: string;
}

const TODAY = new Date().toISOString().slice(0, 10);

function getDefaultLetter(form: FormData, ct: typeof COMPLAINT_TYPES[0]): string {
  return `Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

To,
The Grievance Officer / Nodal Officer
${ct ? ct.statute : ''}
${form.againstAddress || '[Company/Authority Address]'}

Subject: Formal Complaint Regarding ${ct ? ct.label : 'Service Issue'} — ${form.transactionId ? `Ref: ${form.transactionId}` : ''}

Respected Sir/Madam,

I, ${form.fullName || '[Your Name]'}, a resident of ${form.address || '[Your Address]'}, wish to file a formal complaint against ${form.againstName || '[Company/Person Name]'} regarding the following matter.

${form.date ? `Date of Incident: ${form.date}` : ''}
${form.transactionId ? `Transaction/Reference ID: ${form.transactionId}` : ''}
${form.amount ? `Amount Involved: ₹${form.amount}` : ''}

Details of Complaint:
${form.description || '[Please describe your complaint in detail]'}

Despite multiple follow-ups, the concerned party has failed to resolve the issue. I have tried contacting their customer service on multiple occasions but to no avail.

Relief Sought:
${form.relief || '[Please state the resolution you are seeking]'}

I request you to take immediate action on this matter under the applicable consumer protection laws and regulations. Please find attached supporting documents for your reference.

Thanking you,

Yours faithfully,
${form.fullName || '[Your Name]'}
${form.email ? `Email: ${form.email}` : ''}
${form.phone ? `Phone: ${form.phone}` : ''}

Place: [Your City]
Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

Enclosures:
1. Copy of transaction/receipt
2. Previous correspondence (if any)
3. Supporting documents`;
}

export default function ComplaintLetterGenerator() {
  const { generateCompletion } = useAiProvider();
  const [form, setForm] = useState<FormData>({
    type: 'bank', fullName: '', address: '', email: '', phone: '',
    againstName: '', againstAddress: '', transactionId: '', amount: '',
    date: TODAY, description: '', relief: '',
  });
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedStatute, setExpandedStatute] = useState(false);

  const ct = COMPLAINT_TYPES.find(t => t.id === form.type) || COMPLAINT_TYPES[0]!;

  const update = (key: keyof FormData, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleGenerate = async () => {
    if (!form.fullName.trim() || !form.description.trim()) return toast.error('Enter your name and complaint details');

    setIsGenerating(true);
    setGeneratedLetter(null);

    try {
      const prompt = `You are a legal complaint letter drafting assistant for Indian consumer law. Generate a formal complaint letter in English with the following details:

Complainant: ${form.fullName}
Address: ${form.address || '[Not provided]'}
Email: ${form.email || '[Not provided]'}
Phone: ${form.phone || '[Not provided]'}
Complaint Type: ${ct.label}
Against: ${form.againstName || '[Not provided]'}
Against Address: ${form.againstAddress || '[Not provided]'}
Transaction ID: ${form.transactionId || '[Not provided]'}
Amount: ${form.amount ? '₹' + form.amount : '[Not provided]'}
Date of Incident: ${form.date || '[Not provided]'}
Description: ${form.description}
Relief Sought: ${form.relief || '[Not provided]'}

The letter must:
1. Be addressed to the appropriate authority (Grievance Officer / Nodal Officer)
2. Cite relevant Indian consumer law: ${ct.statute}
3. Include subject line, date, salutation, body with numbered paragraphs, relief sought, and signature block
4. Be formal, precise, and legally appropriate
5. Include placeholders in brackets for any missing information

Format as plain text with proper line breaks. Do NOT include markdown.`;

      const letter = await generateCompletion([
        { role: 'system', content: 'You are a legal document assistant specializing in Indian consumer complaint letters. Generate only the letter text, no commentary.' },
        { role: 'user', content: prompt }
      ]);
      setGeneratedLetter(letter);
      toast.success('AI complaint letter generated!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate letter');
      setGeneratedLetter(getDefaultLetter(form, ct));
    }
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (!generatedLetter) return;
    const blob = new Blob([generatedLetter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `complaint_letter_${Date.now()}.txt`);
    toast.success('Letter downloaded!');
  };

  const handleCopy = () => {
    if (!generatedLetter) return;
    clipboardWrite(generatedLetter);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-5">
      <AiPrivacyBanner />
      <div className="flex items-center gap-2 mb-1">
        <FileText className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">AI Complaint Letter Generator</h3>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 space-y-5">
          <p className="text-xs text-[var(--text-secondary)]">Generate legally sound complaint letters citing Indian consumer law, powered by AI.</p>

          <AiSettings />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Complaint Category *</label>
              <div className="grid grid-cols-2 gap-1.5">
                {COMPLAINT_TYPES.map(t => (
                  <button key={t.id} onClick={() => update('type', t.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[11px] font-semibold transition-all border ${
                      form.type === t.id 
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 shadow-sm shadow-red-500/10'
                        : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-red-300'
                    }`}>
                    <t.icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t.label}</span>
                    {form.type === t.id && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center">
                        <Check className="w-2 h-2 text-white" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Your Full Name *</label>
                <input aria-label="Your Full Name *" value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Rahul Sharma"
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-red-500/30 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Email</label>
                  <input aria-label="Email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="rahul@email.com"
                    className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-red-500/30 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Phone</label>
                  <input aria-label="Phone" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="9876543210"
                    className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-red-500/30 transition-all" />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Against (Company/Person)</label>
              <input aria-label="Against (Company/Person)" value={form.againstName} onChange={e => update('againstName', e.target.value)} placeholder="XYZ Bank / ABC Company"
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-red-500/30 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Transaction/Reference ID</label>
              <input aria-label="Transaction/Reference ID" value={form.transactionId} onChange={e => update('transactionId', e.target.value)} placeholder="TXN123456789"
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-red-500/30 transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Amount (₹)</label>
                <input aria-label="Amount (₹)" type="number" value={form.amount} onChange={e => update('amount', e.target.value)} placeholder="5000"
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-red-500/30 transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Date of Incident</label>
                <input aria-label="Date of Incident" type="date" value={form.date} onChange={e => update('date', e.target.value)}
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-red-500/30 transition-all" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Your Address</label>
            <input aria-label="Your Address" value={form.address} onChange={e => update('address', e.target.value)} placeholder="123, Main Street, New Delhi - 110001"
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-red-500/30 transition-all" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Describe Your Complaint in Detail *</label>
            <textarea aria-label="Describe Your Complaint in Detail *" value={form.description} onChange={e => update('description', e.target.value)} rows={4}
              placeholder="Describe what happened, when, and who you contacted..."
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-red-500/30 transition-all resize-none" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Relief Sought (What do you want?)</label>
            <textarea aria-label="Relief Sought (What do you want?)" value={form.relief} onChange={e => update('relief', e.target.value)} rows={2}
              placeholder="e.g. Refund of ₹5000, compensation for mental harassment..."
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-red-500/30 transition-all resize-none" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg">
              <Scale className="w-3 h-3 text-red-500" />
              <span className="text-[9px] font-semibold text-red-700 dark:text-red-300">{ct.statute}</span>
            </div>
            <button onClick={() => setExpandedStatute(!expandedStatute)}
              className="text-[9px] text-red-500 hover:text-red-700 dark:hover:text-red-400 font-semibold underline">
              {expandedStatute ? 'Less info' : 'More info'}
            </button>
          </div>

          <button onClick={handleGenerate} disabled={isGenerating || !form.fullName.trim() || !form.description.trim()}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]">
            {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Complaint Letter</>}
          </button>

          {generatedLetter && (
            <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-[var(--text-primary)]">Generated Letter</h4>
                <div className="flex gap-1.5">
                  <button onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-200 dark:bg-[var(--bg-surface)] hover:bg-zinc-300 dark:hover:bg-[var(--bg-elevated)] text-zinc-600 dark:text-[var(--text-muted)] rounded-lg text-[10px] font-semibold transition-all active:scale-95">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button onClick={handleDownload}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg text-[10px] font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95">
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              </div>
              <pre className="text-[11px] text-[var(--text-primary)] font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">{generatedLetter}</pre>
            </div>
          )}

          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
            <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]">
              <strong>Pro:</strong> Unlimited letters, 50+ legal templates (NCDRC, banking ombudsman, SEBI, IRDA, RERA), download as PDF with professional letterhead, email directly to regulatory body.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
