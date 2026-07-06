"use client";

import React, { useState } from 'react';
import { FileText, Copy, Check, Download, MessageCircle, Scale, Building2, Banknote, Smartphone, Home, Zap, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAiProvider } from '@/hooks/useAiProvider';
import AiSettings from '@/components/tools/AiSettings';

const COMPLAINT_TYPES = [
  {
    id: 'bank',
    label: 'Bank Fraud / Banking',
    icon: <Banknote className="w-4 h-4" />,
    desc: 'Unauthorized transaction, card fraud, loan harassment, account issues',
    law: 'RBI Banking Ombudsman Scheme 2006, RBI Master Directions',
  },
  {
    id: 'telecom',
    label: 'Telecom / Mobile',
    icon: <Smartphone className="w-4 h-4" />,
    desc: 'Poor network, wrong billing, unwanted SMS/DND violation, porting issues',
    law: 'TRAI regulations, Telecom Consumer Protection Act',
  },
  {
    id: 'ecommerce',
    label: 'E-Commerce / Online Shopping',
    icon: <Building2 className="w-4 h-4" />,
    desc: 'Non-delivery, defective product, refund not processed, fake listing',
    law: 'Consumer Protection Act 2019, Legal Metrology Act',
  },
  {
    id: 'insurance',
    label: 'Insurance Claim',
    icon: <Shield className="w-4 h-4" />,
    desc: 'Claim rejection, delay in settlement, policy mis-selling, premium dispute',
    law: 'IRDAI Protection of Policyholders\' Interests Regulations',
  },
  {
    id: 'realestate',
    label: 'Real Estate / Builder',
    icon: <Home className="w-4 h-4" />,
    desc: 'Delay in possession, poor construction quality, hidden charges',
    law: 'RERA Act 2016, Consumer Protection Act 2019',
  },
  {
    id: 'electricity',
    label: 'Electricity / Utility',
    icon: <Zap className="w-4 h-4" />,
    desc: 'Excessive billing, meter issue, poor supply, connection delay',
    law: 'Electricity Act 2003, Consumer Protection Act 2019',
  },
  {
    id: 'consumer',
    label: 'General Consumer Complaint',
    icon: <Scale className="w-4 h-4" />,
    desc: 'Defective product, poor service, misleading advertisement, overcharging',
    law: 'Consumer Protection Act 2019',
  },
  {
    id: 'legal',
    label: 'Legal / Court Notice',
    icon: <FileText className="w-4 h-4" />,
    desc: 'Formal legal notice, recovery notice, tenancy dispute, cheque bounce',
    law: 'Section 138 NI Act, CPC, Rent Control Act',
  },
];

export default function AiComplaintLetterGenerator() {
  const { apiKey, provider, isConfigured } = useAiProvider();
  const [selectedType, setSelectedType] = useState<string>('');
  const [form, setForm] = useState({
    complainantName: '',
    complainantAddress: '',
    complainantPhone: '',
    complainantEmail: '',
    respondentName: '',
    respondentAddress: '',
    complaintDetails: '',
    amountInvolved: '',
    dateOfIncident: '',
    previousAction: '',
    desiredRelief: '',
  });
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedComplaint = COMPLAINT_TYPES.find(t => t.id === selectedType);

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const generateLetter = async () => {
    if (!selectedType) return toast.error('Select a complaint type');
    if (!form.complainantName || !form.complainantAddress || !form.respondentName) {
      return toast.error('Fill in complainant name, address, and respondent name');
    }
    if (!isConfigured || !apiKey) return toast.error('Configure your AI provider first');

    setIsGenerating(true);
    setGeneratedLetter(null);

    const systemPrompt = `You are a legal document specialist for Indian consumer law. Generate a formal complaint letter in proper legal English format. Use the correct Indian law references based on the complaint type. The letter must be in a formal business letter format with date, subject, salutation, body paragraphs, and closing.`;

    const userPrompt = `Generate a formal complaint letter with the following details:

Complaint Type: ${selectedComplaint?.label || selectedType}
Relevant Law: ${selectedComplaint?.law || 'Consumer Protection Act 2019'}

Complainant: ${form.complainantName}
Address: ${form.complainantAddress}
Phone: ${form.complainantPhone || 'Not provided'}
Email: ${form.complainantEmail || 'Not provided'}

Respondent: ${form.respondentName}
Respondent Address: ${form.respondentAddress}

Details of Complaint: ${form.complaintDetails}
Amount Involved: ${form.amountInvolved || 'Not specified'}
Date of Incident: ${form.dateOfIncident || 'Not specified'}
Previous Action Taken: ${form.previousAction || 'None'}
Desired Relief: ${form.desiredRelief || 'Appropriate compensation and resolution'}

Format the letter as:
1. Sender's details (complainant)
2. Date
3. Recipient's details (respondent)
4. Subject line (clear and specific)
5. Salutation (Dear Sir/Madam,)
6. Body paragraphs explaining the issue chronologically with specific dates and amounts
7. Mention the relevant Indian law under which this complaint is made
8. Request for action with deadline (usually 15-30 days)
9. Closing (Thanking you, Yours faithfully)
10. Signature block with name and contact

Use proper legal language but keep it practical for an Indian consumer. Include specific section numbers of the relevant acts.`;

    try {
      const response = await fetch(
        provider === 'openai'
          ? 'https://api.openai.com/v1/chat/completions'
          : provider === 'gemini'
            ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
            : 'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(provider !== 'gemini' ? { 'Authorization': `Bearer ${apiKey}` } : {}),
          },
          body: JSON.stringify(
            provider === 'gemini'
              ? { contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }] }
              : { model: provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }] }
          ),
        }
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data: any = await response.json();
      const text = provider === 'gemini'
        ? data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
        : data?.choices?.[0]?.message?.content || '';

      if (!text) throw new Error('No response from AI');

      setGeneratedLetter(text);
      toast.success('Complaint letter generated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate letter');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedLetter) return;
    const blob = new Blob([generatedLetter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaint_letter_${selectedType}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Letter downloaded!');
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Scale className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">AI Complaint Letter Generator</h3>
      </div>

      <AiSettings />

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Generate legally correct formal complaint letters citing relevant Indian consumer law. Fill in the details, AI writes the letter.</p>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-400 uppercase">Complaint Type</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {COMPLAINT_TYPES.map(t => (
              <button key={t.id} onClick={() => { setSelectedType(t.id); setGeneratedLetter(null); }}
                className={`flex items-start gap-2 p-3 rounded-xl border text-left transition-colors ${
                  selectedType === t.id
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-zinc-50 dark:bg-black/20'
                }`}>
                <span className={`mt-0.5 ${selectedType === t.id ? 'text-emerald-500' : 'text-zinc-400'}`}>{t.icon}</span>
                <div className="min-w-0">
                  <p className={`text-[11px] font-semibold ${selectedType === t.id ? 'text-emerald-700 dark:text-emerald-300' : 'text-zinc-700 dark:text-zinc-300'}`}>{t.label}</p>
                  <p className="text-[9px] text-zinc-500 mt-0.5 line-clamp-2">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedType && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-zinc-50 dark:bg-black/30 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Your Name *</label>
              <input value={form.complainantName} onChange={e => updateForm('complainantName', e.target.value)} placeholder="Full name"
                className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Your Address *</label>
              <input value={form.complainantAddress} onChange={e => updateForm('complainantAddress', e.target.value)} placeholder="Full address"
                className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Phone</label>
              <input value={form.complainantPhone} onChange={e => updateForm('complainantPhone', e.target.value)} placeholder="+91 98765 43210"
                className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Email</label>
              <input value={form.complainantEmail} onChange={e => updateForm('complainantEmail', e.target.value)} placeholder="email@example.com"
                className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Respondent Name *</label>
              <input value={form.respondentName} onChange={e => updateForm('respondentName', e.target.value)} placeholder="Company / person name"
                className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Respondent Address</label>
              <input value={form.respondentAddress} onChange={e => updateForm('respondentAddress', e.target.value)} placeholder="Company address"
                className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Date of Incident</label>
              <input type="date" value={form.dateOfIncident} onChange={e => updateForm('dateOfIncident', e.target.value)}
                className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Amount Involved (₹)</label>
              <input value={form.amountInvolved} onChange={e => updateForm('amountInvolved', e.target.value)} placeholder="e.g. 25000"
                className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Describe Your Complaint in Detail *</label>
              <textarea value={form.complaintDetails} onChange={e => updateForm('complaintDetails', e.target.value)} rows={3}
                placeholder="Explain what happened, when, and who is responsible. Include specific facts, dates, amounts, and any reference numbers."
                className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Previous Action Taken</label>
              <input value={form.previousAction} onChange={e => updateForm('previousAction', e.target.value)} placeholder="e.g. Called customer care on 5 Mar, emailed on 10 Mar"
                className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Desired Relief / Resolution</label>
              <input value={form.desiredRelief} onChange={e => updateForm('desiredRelief', e.target.value)} placeholder="e.g. Full refund of ₹25,000 + compensation"
                className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
        )}

        <button onClick={generateLetter} disabled={isGenerating || !selectedType}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors">
          {isGenerating ? (
            <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32" strokeLinecap="round" /></svg> Generating...</>
          ) : (
            <><FileText className="w-4 h-4" /> Generate Complaint Letter</>
          )}
        </button>

        {generatedLetter && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Generated Complaint Letter
              </h5>
              <div className="flex gap-2">
                <button onClick={handleCopy}
                  className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-600 transition-colors">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button onClick={handleDownload}
                  className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                  <Download className="w-3 h-3" /> Download
                </button>
              </div>
            </div>
            <div className="bg-white dark:bg-black/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 max-h-[500px] overflow-y-auto">
              <pre className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">{generatedLetter}</pre>
            </div>
          </div>
        )}

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3">
          <p className="text-[10px] text-amber-600 dark:text-amber-400">
            <strong>Disclaimer:</strong> This is a draft complaint letter generated by AI. It is not legal advice. Review carefully before sending. For serious legal matters, consult a qualified advocate. 
            <span className="block mt-1"><strong>Pro:</strong> 50+ templates, PDF with professional letterhead, email directly to regulatory body (RBI, TRAI, NCDRC, RERA), CA-assisted review.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
