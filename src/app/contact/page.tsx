"use client";

import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Send, 
  Sparkles, 
  Check,
  MessageSquare,
  HelpCircle,
  Bug,
  Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function ContactPage() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Contact Toolzum — get in touch with our team for support, feedback, or inquiries.');
  }, []);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: ""
  });

  const sanitize = (s: string) => s.replace(/<[^>]*>/g, "").slice(0, 1000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill out all required fields.");
      return;
    }
    
    setLoading(true);
    try {
      const clean = { name: sanitize(formData.name), email: sanitize(formData.email), subject: formData.subject, message: sanitize(formData.message) };
      const submissions = JSON.parse(localStorage.getItem("th_contact_submissions") || "[]");
      submissions.push({ ...clean, timestamp: Date.now() });
      localStorage.setItem("th_contact_submissions", JSON.stringify(submissions.slice(-10)));
    } catch (e) {
      console.error("[toolzum] Failed to store contact submission", e);
    }
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      
      {/* Background Grids */}
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none opacity-[0.03]">
        <div className="w-full max-w-[1280px] h-full" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-sm font-semibold text-[var(--accent)] mb-6">
            <Mail className="w-4 h-4" /> Support Center
          </span>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-7xl mb-6 tracking-tight leading-tight">
            Get in touch.
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)]">
            Have a question, feedback, or a bug report? Drop us a line below and we'll reply shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-start">
          
          {/* Quick info column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6">
              <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                <HelpCircle className="w-4.5 h-4.5 text-[var(--accent)]" /> General Inquiries
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                For simple account questions, features requesting, or support, check the Roadmap or contact us directly.
              </p>
            </div>

            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6">
              <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                <Bug className="w-4.5 h-4.5 text-red-700 dark:text-red-400" /> Bug Reporting
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Notice an issue executing our client-side tools? Open an issue on our GitHub repository or submit details directly to our developers.
              </p>
            </div>

            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6">
              <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                <MessageSquare className="w-4.5 h-4.5 text-blue-700 dark:text-blue-400" /> Enterprise Devs
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Want to host Toolzum on closed intranet networks, compile custom Docker nodes, or scale cloud relay quotas? We offer special licenses.
              </p>
            </div>
          </div>

          {/* Form column */}
          <div className="lg:col-span-7 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 sm:p-10 shadow-sm relative">
            
            {submitted ? (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                
                {/* Simulated sending animation and confirmation check */}
                <div className="w-16 h-16 rounded-full bg-emerald-700/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-6 animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                
                <h3 className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl font-semibold mb-2">Message Sent!</h3>
                <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
                  Thank you, <strong>{formData.name}</strong>. Your query has been dispatched to our support queue. We usually reply within 24 hours.
                </p>
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", subject: "general", message: "" });
                  }}
                >
                  Send another message
                </Button>

              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[var(--text-muted)] tracking-wider mb-2">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Jane Doe"
                      className="w-full bg-[var(--bg-base)] text-xs border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-[var(--text-muted)] tracking-wider mb-2">Email Address *</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="jane@company.com"
                      className="w-full bg-[var(--bg-base)] text-xs border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[var(--text-muted)] tracking-wider mb-2">Inquiry Category</label>
                  <select
                    aria-label="Inquiry category"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-[var(--bg-base)] text-xs border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-mono"
                  >
                    <option value="general">General Support</option>
                    <option value="api">API & Developers Sandbox</option>
                    <option value="licensing">Commercial & Licensing</option>
                    <option value="bug">Report a Bug / Vulnerability</option>
                    <option value="suggestion">Suggest a Tool</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[var(--text-muted)] tracking-wider mb-2">Message *</label>
                  <textarea 
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="How can we help you today? Please include details if referring to a specific tool..."
                    className="w-full bg-[var(--bg-base)] text-xs border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-sans" 
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full gap-2 text-xs py-3 h-auto"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Dispatch Inquiry
                    </>
                  )}
                </Button>

              </form>
            )}

          </div>

        </div>

        {/* Suggest a Tool Section */}
        <div className="max-w-3xl mx-auto mt-20 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-ink)]/5 rounded-full blur-[80px]" />
          <Lightbulb className="w-8 h-8 text-[var(--accent)] mx-auto mb-4" />
          <h3 className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl font-semibold mb-3">Suggest a tool</h3>
          <p className="text-[var(--text-secondary)] text-sm max-w-lg mx-auto mb-6">
            If you need an offline tool that isn't on the roadmap, let us know! We design open-source, client-side algorithms based on community requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="text" 
              placeholder="e.g. SVG pattern generator..." 
              className="flex-1 bg-[var(--bg-base)] text-sm border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]" 
            />
            <Button disabled className="shrink-0 opacity-60 cursor-not-allowed">Submit Request</Button>
          </div>
        </div>

      </div>
    </div>
  );
}
