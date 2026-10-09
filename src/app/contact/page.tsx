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
  Lightbulb,
  Share2
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
  const [sendError, setSendError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: ""
  });
  const [suggestText, setSuggestText] = useState("");

  // Per-category on-page acknowledgment (mirrors CATEGORY_COPY in
  // functions/api/contact.ts). This is the RELIABLE ack: outbound email to
  // arbitrary recipients isn't available on the account's Free plan, so the
  // page itself must thank the sender by category — never claim an inbox
  // email was delivered.
  const THANKS = {
    suggestion: {
      heading: "Thanks for suggesting a tool",
      body: "Great idea — suggestions shape our roadmap. We read every suggestion and follow up if we need one detail before building. 1,000+ tools are already live in your browser in the meantime.",
    },
    bug: {
      heading: "Thanks for the report",
      body: "We're on it — reports like yours keep Toolzum trustworthy. Security reports are acknowledged within 72 hours, per our published security policy.",
    },
    licensing: {
      heading: "Thanks for reaching out about licensing",
      body: "A real person reads every licensing inquiry and replies to this address, usually within 24 hours.",
    },
    api: {
      heading: "Thanks for writing in about the API",
      body: "Your message is with the right people — we'll reply to this address with answers or next steps.",
    },
    general: {
      heading: "We got your message",
      body: "Thanks for writing in — it landed with our team. We usually reply within 24 hours. Nothing you process in our tools ever leaves your browser.",
    },
  } satisfies Record<string, { heading: string; body: string }>;
  const thanks =
    THANKS[formData.subject as keyof typeof THANKS] ?? THANKS.general;

  // Deep-link prefill: /contact?subject=suggestion&message=... (from
  // homepage "Suggest a tool"). Read once on mount via location.search
  // (avoids the useSearchParams Suspense requirement).
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const subject = params.get("subject");
      const message = params.get("message");
      const validSubjects = ["general", "api", "licensing", "bug", "suggestion"];
      // Mount-once deep-link prefill; intentionally not reactive.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => ({
        ...prev,
        ...(subject && validSubjects.includes(subject) ? { subject } : {}),
        ...(message ? { message: message.replace(/<[^>]*>/g, "").slice(0, 1000) } : {}),
      }));
    } catch { /* malformed URL — leave defaults */ }
  }, []);

  const sanitize = (s: string) => s.replace(/<[^>]*>/g, "").slice(0, 1000);

  // Suggest-a-tool box: prefill the main form (subject=suggestion) and
  // scroll to it so the user only adds name/email before dispatching.
  const applySuggestion = () => {
    const text = suggestText.trim();
    if (!text) {
      toast.error("Describe the tool you'd like first.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      subject: "suggestion",
      message: prev.message ? prev.message : `Tool suggestion: ${sanitize(text)}`,
    }));
    setSubmitted(false);
    toast.success("Prefilled below — add your name and email, then send.");
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    setSendError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sanitize(formData.name),
          email: sanitize(formData.email),
          subject: formData.subject,
          message: sanitize(formData.message),
          // Honeypot (bots fill it; the input is hidden from humans).
          website: (document.getElementById("lbl-page-website") as HTMLInputElement | null)?.value || "",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; to?: string };
      if (res.ok && data.ok) {
        setSubmitted(true);
      } else if (data.error === "email_unconfigured" || data.error === "email_failed") {
        setSendError(
          `Our mail relay is unavailable right now — please write to us directly at ${data.to || "contact@toolzum.com"} and we'll reply there.`,
        );
      } else if (res.status === 429) {
        setSendError("Too many messages sent recently — please try again in a few minutes.");
      } else {
        setSendError("Couldn't send that — please check the fields and try again.");
      }
    } catch {
      setSendError("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
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
                Notice an issue executing our client-side tools? <a href="https://github.com/kvRathore-star/Toolzum/issues" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-2">Open an issue on GitHub</a> or submit details directly to our developers.
              </p>
            </div>

            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6">
              <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                <Share2 className="w-4.5 h-4.5 text-emerald-700 dark:text-emerald-400" /> Follow Toolzum
              </h3>
              <div className="flex flex-wrap gap-2 text-xs">
                <a href="https://github.com/kvRathore-star/Toolzum" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/40 transition-all">GitHub</a>
                <a href="https://instagram.com/toolzum" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/40 transition-all">Instagram</a>
                <a href="https://x.com/toolzum" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/40 transition-all">X</a>
                <a href="https://linkedin.com/company/toolzum" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/40 transition-all">LinkedIn</a>
              </div>
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
          <div id="contact-form" className="lg:col-span-7 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 sm:p-10 shadow-sm relative">
            
            {submitted ? (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                
                {/* Simulated sending animation and confirmation check */}
                <div className="w-16 h-16 rounded-full bg-emerald-700/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-6 animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                
                <h3 className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl font-semibold mb-2">
                  {thanks.heading}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6">
                  {formData.name ? <strong>{formData.name}</strong> : null}{formData.name ? ", " : ""}
                  {thanks.body}
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
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                
                {/* Honeypot: hidden from humans, bots fill it → silent reject */}
                <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true">
                  <label htmlFor="lbl-page-website">Website</label>
                  <input id="lbl-page-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                </div>

                {sendError && (
                  <div role="alert" className="rounded-[var(--radius-md)] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs px-4 py-3">
                    {sendError}
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="lbl-page-full-name" className="block text-xs font-mono uppercase text-[var(--text-muted)] tracking-wider mb-2">Full Name *</label>
                    <input id="lbl-page-full-name" 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Jane Doe"
                      className="w-full bg-[var(--bg-base)] text-xs border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]" 
                    />
                  </div>
                  <div>
                    <label htmlFor="lbl-page-email-address" className="block text-xs font-mono uppercase text-[var(--text-muted)] tracking-wider mb-2">Email Address *</label>
                    <input id="lbl-page-email-address" 
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
                  <label htmlFor="lbl-page-inquiry-category" className="block text-xs font-mono uppercase text-[var(--text-muted)] tracking-wider mb-2">Inquiry Category</label>
                  <select id="lbl-page-inquiry-category"
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
                  <label htmlFor="lbl-page-message" className="block text-xs font-mono uppercase text-[var(--text-muted)] tracking-wider mb-2">Message *</label>
                  <textarea id="lbl-page-message" 
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
              aria-label="Suggest a tool"
              placeholder="e.g. SVG pattern generator..."
              value={suggestText}
              onChange={(e) => setSuggestText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applySuggestion();
                }
              }}
              className="flex-1 bg-[var(--bg-base)] text-sm border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
            <Button onClick={applySuggestion} className="shrink-0">Submit Request</Button>
          </div>
        </div>

      </div>
    </div>
  );
}
