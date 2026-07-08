"use client";

import React, { useState } from 'react';
import { FileText, AlertCircle, Building, Smartphone, ShoppingCart, Shield, Home, Zap, Droplets, Loader2, Download, Copy, Check, Sparkles, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import AiSettings from '@/components/tools/AiSettings';
import { useAiProvider } from '@/hooks/useAiProvider';

const COMPLAINT_TYPES = [
  { id: 'bank', label: 'Bank Fraud', icon: <Building className="w-3.5 h-3.5" />, statute: 'Banking Ombudsman Scheme 2006, RBI Guidelines' },
  { id: 'telecom', label: 'Telecom Issue', icon: <Smartphone className="w-3.5 h-3.5" />, statute: 'TRAI Regulations, Telecom Consumer Protection Rules' },
  { id: 'ecommerce', label: 'E-commerce Fraud', icon: <ShoppingCart className="w-3.5 h-3.5" />, statute: 'Consumer Protection Act 2019, Legal Metrology Act' },
  { id: 'insurance', label: 'Insurance Claim', icon: <Shield className="w-3.5 h-3.5" />, statute: 'IRDAI Guidelines, Consumer Protection Act 2019' },
  { id: 'realestate', label: 'Real Estate/Builder', icon: <Home className="w-3.5 h-3.5" />, statute: 'RERA Act 2016, Consumer Protection Act 2019' },
  { id: 'electricity', label: 'Electricity Bill', icon: <Zap className="w-3.5 h-3.5" />, statute: 'Electricity Act 2003, State Electricity Regulatory Commission' },
  { id: 'water', label: 'Water Supply', icon: <Droplets className="w-3.5 h-3.5" />, statute: 'State Municipal Corporation Act, Consumer Protection Act 2019' },
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
  const { isConfigured, generateCompletion } = useAiProvider();
  const [form, setForm] = useState<FormData>({
    type: 'bank', fullName: '', address: '', email: '', phone: '',
    againstName: '', againstAddress: '', transactionId: '', amount: '',
    date: TODAY, description: '', relief: '',
  });
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);

  const ct = COMPLAINT_TYPES.find(t => t.id === form.type) || COMPLAINT_TYPES[0];

  React.useEffect(() => {
    const data = localStorage.getItem('complaint_letter_count');
    if (data) {
      const { date, count } = JSON.parse(data);
      if (date === new Date().toDateString()) setDailyCount(count);
    }
  }, []);

  const incrementDaily = () => {
    const newCount = dailyCount + 1;
    setDailyCount(newCount);
    localStorage.setItem('complaint_letter_count', JSON.stringify({ date: new Date().toDateString(), count: newCount }));
  };

  const update = (key: keyof FormData, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleGenerate = async () => {
    if (!form.fullName.trim() || !form.description.trim()) return toast.error('Enter your name and complaint details');
    if (dailyCount >= 1 && !isConfigured) return toast.error('Daily free limit (1) reached. Configure AI API key below for unlimited use.');

    setIsGenerating(true);
    setGeneratedLetter(null);

    if (isConfigured) {
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
        incrementDaily();
        toast.success('AI complaint letter generated!');
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to generate letter');
        setGeneratedLetter(getDefaultLetter(form, ct));
      }
    } else {
      setGeneratedLetter(getDefaultLetter(form, ct));
      incrementDaily();
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
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <FileText className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">AI Complaint Letter Generator</h3>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 space-y-5">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Generate legally sound complaint letters citing Indian consumer law. Free: 1 letter/day. AI-powered letter with your API key: unlimited.</p>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3 flex items-center justify-between">
            <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1"><Info className="w-3 h-3" /> Daily free limit: {dailyCount}/1 used{isConfigured ? ' · AI configured → unlimited' : ''}</p>
            <button onClick={() => setShowAiSettings(!showAiSettings)}
              className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
              {isConfigured ? 'Change API Key' : 'Set AI Key for Unlimited'}
            </button>
          </div>

          {showAiSettings && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <AiSettings />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Complaint Type *</label>
              <div className="grid grid-cols-2 gap-1.5">
                {COMPLAINT_TYPES.map(t => (
                  <button key={t.id} onClick={() => update('type', t.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-colors border ${
                      form.type === t.id 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' 
                        : 'bg-zinc-50 dark:bg-black/30 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                    }`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Your Full Name *</label>
                <input value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Rahul Sharma"
                  className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Email</label>
                  <input value={form.email} onChange={e => update('email', e.target.value)} placeholder="rahul@email.com"
                    className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Phone</label>
                  <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="9876543210"
                    className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Against (Company/Person)</label>
              <input value={form.againstName} onChange={e => update('againstName', e.target.value)} placeholder="XYZ Bank / ABC Company"
                className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Transaction/Reference ID</label>
              <input value={form.transactionId} onChange={e => update('transactionId', e.target.value)} placeholder="TXN123456789"
                className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Amount (₹)</label>
                <input type="number" value={form.amount} onChange={e => update('amount', e.target.value)} placeholder="5000"
                  className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Date of Incident</label>
                <input type="date" value={form.date} onChange={e => update('date', e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Your Address</label>
            <input value={form.address} onChange={e => update('address', e.target.value)} placeholder="123, Main Street, New Delhi - 110001"
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Describe Your Complaint in Detail *</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={4}
              placeholder="Describe what happened, when, and who you contacted..."
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Relief Sought (What do you want?)</label>
            <textarea value={form.relief} onChange={e => update('relief', e.target.value)} rows={2}
              placeholder="e.g. Refund of ₹5000, compensation for mental harassment,道歉..."
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
          </div>

          <button onClick={handleGenerate} disabled={isGenerating || !form.fullName.trim() || !form.description.trim()}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors">
            {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Complaint Letter</>}
          </button>

          {generatedLetter && (
            <div className="bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Generated Letter</h4>
                <div className="flex gap-1.5">
                  <button onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg text-[10px] font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button onClick={handleDownload}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-semibold hover:bg-emerald-600 transition-colors">
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              </div>
              <pre className="text-[11px] text-zinc-700 dark:text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">{generatedLetter}</pre>
            </div>
          )}

          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
              <strong>Pro:</strong> Unlimited letters, 50+ legal templates (NCDRC, banking ombudsman, SEBI, IRDA, RERA), download as PDF with professional letterhead, email directly to regulatory body.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
