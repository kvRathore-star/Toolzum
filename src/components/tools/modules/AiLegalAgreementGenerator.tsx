"use client";

import React, { useState } from 'react';
import { FileText, Copy, Check, Download, Scale, Building2, Home, Users, Briefcase, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAiProvider } from '@/hooks/useAiProvider';
import AiSettings from '@/components/tools/AiSettings';

const AGREEMENT_TYPES = [
  { id: 'rental', label: 'Rental / Lease Agreement', icon: <Home className="w-4 h-4" />, law: 'Rent Control Act, Transfer of Property Act 1882' },
  { id: 'nda', label: 'Non-Disclosure Agreement (NDA)', icon: <FileText className="w-4 h-4" />, law: 'Indian Contract Act 1872' },
  { id: 'freelance', label: 'Freelancer / Contractor Agreement', icon: <Briefcase className="w-4 h-4" />, law: 'Indian Contract Act 1872' },
  { id: 'employment', label: 'Employment / Appointment Letter', icon: <Users className="w-4 h-4" />, law: 'Industrial Disputes Act, Shops & Establishment Act' },
  { id: 'partnership', label: 'Partnership Deed', icon: <Building2 className="w-4 h-4" />, law: 'Indian Partnership Act 1932' },
  { id: 'loan', label: 'Loan Agreement (Promissory Note)', icon: <FileText className="w-4 h-4" />, law: 'Indian Contract Act 1872, NI Act 1881' },
  { id: 'sale', label: 'Sale of Goods Agreement', icon: <Scale className="w-4 h-4" />, law: 'Sale of Goods Act 1930' },
  { id: 'service', label: 'Service / Consultancy Agreement', icon: <Briefcase className="w-4 h-4" />, law: 'Indian Contract Act 1872' },
];

export default function AiLegalAgreementGenerator() {
  const { apiKey, provider, isConfigured } = useAiProvider();
  const [selectedType, setSelectedType] = useState<string>('');
  const [party1, setParty1] = useState('');
  const [party2, setParty2] = useState('');
  const [terms, setTerms] = useState('');
  const [duration, setDuration] = useState('');
  const [consideration, setConsideration] = useState('');
  const [generatedAgreement, setGeneratedAgreement] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const selected = AGREEMENT_TYPES.find(t => t.id === selectedType);

  const generate = async () => {
    if (!selectedType) return toast.error('Select agreement type');
    if (!party1 || !party2) return toast.error('Enter both party names');
    if (!isConfigured || !apiKey) return toast.error('Configure your AI provider first');

    setIsGenerating(true);
    setGeneratedAgreement(null);

    const systemPrompt = 'You are a legal document drafter specializing in Indian law. Draft professional, legally sound agreements in English.';

    const userPrompt = `Draft a ${selected?.label || 'legal agreement'} under Indian law (${selected?.law || 'Indian Contract Act 1872'}).

PARTY 1 (First Party): ${party1}
PARTY 2 (Second Party): ${party2}
KEY TERMS: ${terms || 'Standard terms apply'}
DURATION: ${duration || 'As agreed between parties'}
CONSIDERATION / PAYMENT: ${consideration || 'As mutually agreed'}

Format the agreement as:
1. TITLE (clear, descriptive)
2. DATE
3. PARTIES clause with full names and addresses
4. RECITALS (background/why this agreement)
5. DEFINED TERMS
6. COVENANTS / OBLIGATIONS (detailed clauses for each party)
7. TERM AND TERMINATION
8. PAYMENT / CONSIDERATION terms
9. CONFIDENTIALITY (if applicable)
10. INDEMNIFICATION
11. LIMITATION OF LIABILITY
12. DISPUTE RESOLUTION (with India-specific arbitration clause)
13. GOVERNING LAW (India)
14. JURISDICTION (specify city)
15. EXECUTION block with signature lines

Use proper legal language suitable for Indian courts. Include section numbers where relevant.`;

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
            ...(provider !== 'gemini' ? { Authorization: `Bearer ${apiKey}` } : {}),
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
      setGeneratedAgreement(text);
      toast.success('Agreement generated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedAgreement) return;
    navigator.clipboard.writeText(generatedAgreement);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedAgreement) return;
    const blob = new Blob([generatedAgreement], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedType}_agreement_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Downloaded!');
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Scale className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">AI Legal Agreement Generator</h3>
      </div>

      <AiSettings />

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Generate professionally drafted legal agreements under Indian law. Fill in the details, AI drafts the contract.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {AGREEMENT_TYPES.map(t => (
            <button key={t.id} onClick={() => { setSelectedType(t.id); setGeneratedAgreement(null); }}
              className={`flex items-start gap-2 p-3 rounded-xl border text-left transition-colors ${
                selectedType === t.id
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-zinc-50 dark:bg-black/20'
              }`}>
              <span className={`mt-0.5 ${selectedType === t.id ? 'text-emerald-500' : 'text-zinc-400'}`}>{t.icon}</span>
              <div className="min-w-0">
                <p className={`text-[10px] font-semibold ${selectedType === t.id ? 'text-emerald-700 dark:text-emerald-300' : 'text-zinc-700 dark:text-zinc-300'}`}>{t.label}</p>
              </div>
            </button>
          ))}
        </div>

        {selectedType && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-zinc-50 dark:bg-black/30 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">First Party *</label>
              <input value={party1} onChange={e => setParty1(e.target.value)} placeholder="Name, address of party 1"
                className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Second Party *</label>
              <input value={party2} onChange={e => setParty2(e.target.value)} placeholder="Name, address of party 2"
                className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Duration / Term</label>
              <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 11 months, 2 years"
                className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Consideration / Payment</label>
              <input value={consideration} onChange={e => setConsideration(e.target.value)} placeholder="e.g. ₹5,00,000 total"
                className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Key Terms & Conditions</label>
              <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={3}
                placeholder="Describe the key obligations, scope of work, special conditions, etc."
                className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
            </div>
          </div>
        )}

        <button onClick={generate} disabled={isGenerating || !selectedType}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors">
          {isGenerating ? (
            <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32" strokeLinecap="round" /></svg> Generating...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generate Agreement</>
          )}
        </button>

        {generatedAgreement && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1.5"><FileText className="w-3 h-3" /> Generated Agreement</h5>
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
            <div className="bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 max-h-[500px] overflow-y-auto">
              <pre className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">{generatedAgreement}</pre>
            </div>
          </div>
        )}

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3">
          <p className="text-[10px] text-amber-600 dark:text-amber-400">
            <strong>Disclaimer:</strong> AI-generated draft — not a substitute for lawyer review. For high-value contracts, consult an advocate.
            <span className="block mt-1"><strong>Pro:</strong> 50+ agreement templates, PDF with stamp paper format, e-sign integration, clause library, lawyer review add-on.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
