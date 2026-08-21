"use client";

import React, { useState } from 'react';
import { Copy, Layout, Sliders, Layers, Sparkles, Check, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { clipboardWrite } from "@/lib/clipboard";

interface SignatureTemplate {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

const TEMPLATES: SignatureTemplate[] = [
  { id: 'corporate', name: 'Classic Corporate', primaryColor: '#1e3a8a', secondaryColor: '#4b5563', fontFamily: 'Arial, sans-serif' },
  { id: 'modern', name: 'Modern Minimal', primaryColor: '#6366f1', secondaryColor: '#10b981', fontFamily: 'Calibri, sans-serif' },
  { id: 'elegant', name: 'Elegant Coral', primaryColor: '#c2410c', secondaryColor: '#78350f', fontFamily: 'Georgia, serif' },
  { id: 'dark', name: 'Dark Mode Clean', primaryColor: '#18181b', secondaryColor: '#a1a1aa', fontFamily: 'sans-serif' }
];

export default function EmailSignatureGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<SignatureTemplate>(TEMPLATES[0]);

  // Details
  const [name, setName] = useState('Sarah Jenkins');
  const [title, setTitle] = useState('Director of Product Design');
  const [company, setCompany] = useState('Apex Digital Corp');
  const [phone, setPhone] = useState('+1 (555) 987-6543');
  const [email, setEmail] = useState('sarah.j@apexdigital.com');
  const [website, setWebsite] = useState('www.apexdigital.com');
  const [address, setAddress] = useState('456 Design Avenue, New York, NY');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'); // Dummy profile photo

  // Generates email-safe inline-styled HTML
  const generateSignatureHtml = () => {
    const { primaryColor, secondaryColor, fontFamily } = selectedTemplate;
    
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family: ${fontFamily}; color: #374151; font-size: 14px; line-height: 1.5; max-width: 500px;">
  <tr>
    <!-- Left: Profile Image -->
    ${logoUrl ? `
    <td valign="top" style="padding-right: 20px; border-right: 2px solid ${primaryColor};">
      <img loading="lazy" src="${logoUrl}" alt="${name}" width="90" height="90" style="border-radius: 50%; display: block; object-fit: cover;" />
    </td>
    ` : ''}
    
    <!-- Right: Text Content -->
    <td valign="top" style="padding-left: 20px;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <div style="font-size: 18px; font-weight: bold; color: ${primaryColor}; margin: 0;">${name}</div>
            <div style="font-size: 13px; color: ${secondaryColor}; font-style: italic; margin-bottom: 8px;">${title} @ <strong>${company}</strong></div>
          </td>
        </tr>
        <tr>
          <td style="font-size: 12px; color: #4b5563; padding-top: 4px;">
            ${phone ? `<div style="margin-bottom: 2px;"><strong>Phone:</strong> <a href="tel:${phone}" style="color: #4b5563; text-decoration: none;">${phone}</a></div>` : ''}
            ${email ? `<div style="margin-bottom: 2px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: ${primaryColor}; text-decoration: none;">${email}</a></div>` : ''}
            ${website ? `<div style="margin-bottom: 2px;"><strong>Web:</strong> <a href="https://${website}" style="color: ${primaryColor}; text-decoration: none;">${website}</a></div>` : ''}
            ${address ? `<div style="margin-top: 6px; font-size: 11px; color: #9ca3af;">${address}</div>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
  };

  const copyRichText = async () => {
    const signatureElement = document.getElementById('signature-preview');
    if (!signatureElement) return;

    try {
      // Create a Selection and range to copy the visual rendered content as Rich Text
      const range = document.createRange();
      range.selectNode(signatureElement);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('copy');
        selection.removeAllRanges();
        toast.success("Signature copied as Rich Text! You can paste it directly into Gmail/Outlook.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy Rich Text.");
    }
  };

  const copyHtmlCode = async () => {
    try {
      await clipboardWrite(generateSignatureHtml());
      toast.success("Raw HTML code copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy HTML code.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Title */}
      <div className="bg-[var(--bg-overlay)] p-5 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-[var(--accent)]" />
          Email Signature Generator
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Design email signatures for Gmail, Outlook, Apple Mail. Copy as rich text or inline HTML.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Editor Settings Panel */}
        <div className="lg:col-span-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 max-h-[680px] overflow-y-auto pr-2">
          
          {/* Templates selection */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5"><Layout className="w-3.5 h-3.5" /> Signatures Templates</h4>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border text-center transition-colors cursor-pointer ${selectedTemplate.id === tpl.id ? 'border-indigo-500 bg-indigo-500/10 text-[var(--accent)]' : 'border-[var(--border-subtle)] bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] text-[var(--text-secondary)]'}`}
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Details Form fields */}
          <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)] dark:border-zinc-800">
            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5" /> Personal Information</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] outline-none text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Job Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] outline-none text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Company Name</label>
                <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] outline-none text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Phone Number</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] outline-none text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] outline-none text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Website URL</label>
                <input type="text" value={website} onChange={e => setWebsite(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] outline-none text-xs" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Office Location</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[var(--text-primary)] outline-none text-xs" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Avatar/Logo Image URL</label>
              <input type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[var(--text-primary)] outline-none text-xs" />
            </div>
          </div>

        </div>

        {/* Live Visual Preview Panel */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[var(--bg-overlay)]/45 border border-zinc-200 dark:border-[var(--border-subtle)] p-6 rounded-2xl min-h-[450px]">
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3 mb-6">
             <span className="text-xs font-bold text-[var(--text-muted)] font-mono">LIVE PREVIEW</span>
          </div>

          {/* Visual Container */}
          <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl shadow-xl min-h-[220px]">
            <div 
              id="signature-preview"
              className="p-4"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(generateSignatureHtml()) }}
            />
          </div>

          {/* Copy Actions */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button 
              onClick={copyRichText}
              className="bg-zinc-900 hover:bg-zinc-800 dark:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2 cursor-pointer text-xs"
            >
              <Copy className="w-4 h-4" />
              Copy for Gmail/Outlook
            </button>
            
            <button 
              onClick={copyHtmlCode}
              className="bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2 cursor-pointer text-xs"
            >
              <Copy className="w-4 h-4" />
              Copy HTML Code
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
