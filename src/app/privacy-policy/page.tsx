import React from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  EyeOff, 
  Database,
  Lock
} from "lucide-react";
import { DocumentSidebar } from "@/components/DocumentSidebar";

const SECTIONS = [
  { id: "intro", title: "1. Introduction" },
  { id: "local-processing", title: "2. Client-Side Processing Pledge" },
  { id: "data-collection", title: "3. Information We Collect" },
  { id: "cookies", title: "4. Cookies and Session Memory" },
  { id: "third-party", title: "5. Third-Party Integrations" },
  { id: "security", title: "6. Security Architecture" },
  { id: "dpdp", title: "7. Data Protection (India DPDP Act)" },
  { id: "gdpr", title: "8. GDPR Rights (European Users)" },
  { id: "ccpa", title: "9. CCPA Rights (California Users)" },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      
      {/* Background Grids */}
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none opacity-[0.03]">
        <div className="w-full max-w-[1280px] h-full" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="max-w-4xl mx-auto mb-16 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-sm font-semibold text-[var(--accent)] mb-6">
            <Lock className="w-4 h-4" /> Privacy & Security
          </span>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-6xl mb-4 tracking-tight leading-tight">
            Privacy Policy
          </h1>
          <p className="text-sm font-mono text-[var(--text-muted)]">
            Last Updated: May 25, 2026
          </p>
        </div>

        {/* Super Strength Statement */}
        <div className="max-w-4xl mx-auto mb-12 p-6 bg-[var(--accent-ink)]/5 border border-[var(--accent)]/20 rounded-[var(--radius-xl)] text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-ink)]/10 text-[var(--accent)] text-[10px] font-mono uppercase tracking-wider mb-3">
            <ShieldAlert className="w-3 h-3" /> Privacy by Architecture, Not Policy
          </div>
          <h3 className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] mb-2">
            Your files never leave your device.
          </h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Unlike traditional services that upload your documents to cloud servers and promise to delete them later,
            Toolzum <strong>never sends your files to our servers for local tools</strong>. Most tools load, process, and output data
            entirely within your browser's memory via WebAssembly. A small number of AI-powered and cloud tools do send your input
            to our server, which forwards it to our AI provider (Google Gemini) — these tools are clearly marked on every tool page,
            and your file is never stored by us.
          </p>
        </div>

        {/* Pillars Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 flex items-start gap-4">
            <EyeOff className="w-8 h-8 text-[var(--accent)] shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">No Server Logs</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">We do not see or retain your upload strings, documents, or image pixels.</p>
            </div>
          </div>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 flex items-start gap-4">
            <Database className="w-8 h-8 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">Local Storage ONLY</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Application states and preferences are cached locally inside IndexedDB.</p>
            </div>
          </div>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 flex items-start gap-4">
            <ShieldAlert className="w-8 h-8 text-purple-700 dark:text-purple-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">Offline Isolation</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">All compiled WebAssembly operations execute without sending outbound API pings.</p>
            </div>
          </div>
        </div>

        {/* Sticky Nav + Legal Layout */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          
          <DocumentSidebar sections={SECTIONS} />

          {/* Legal Text Stream */}
          <div className="md:col-span-8 space-y-12 text-sm leading-relaxed text-[var(--text-secondary)] font-sans">
            
            <section id="intro" className="scroll-mt-28">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">1. Introduction</h3>
              <p className="mb-4">
                Welcome to Toolzum. We value the privacy of our visitors and users above all else. This Privacy Policy details our infrastructure configuration and absolute client-side isolation architecture.
              </p>
              <p>
                By using Toolzum (the "Service"), you accept that all files, images, code, and calculation strings are processed directly inside your device's web browser, and agree to the storage guidelines listed below.
              </p>
            </section>

            <section id="local-processing" className="scroll-mt-28 border-t border-[var(--border-subtle)] pt-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">2. Client-Side Processing Pledge</h3>
              <p className="mb-4">
                <strong>Our Core Philosophy is simple:</strong> We do not upload your media to our servers.
              </p>
              <p className="mb-4">
                Traditional utility sites transmit user documents to backend queues to run formatting scripts. Toolzum compiles C++ libraries and JavaScript tools into WebAssembly binaries that execute locally inside a sandboxed client thread.
              </p>
              <p>
                For the majority of tools, your files (such as confidential business PDFs, identification files, or private photo pixels) never exit your device to traverse the internet. A small number of AI and cloud tools are the exception: your input is sent to our server, which forwards it to our AI provider (Google Gemini) for processing and returns the result. These tools are clearly marked so you always know what happens with your data, and we do not store your file content — only anonymous credit/quota accounting.
              </p>
            </section>

            <section id="data-collection" className="scroll-mt-28 border-t border-[var(--border-subtle)] pt-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">3. Information We Collect</h3>
              <p className="mb-4">
                Because local-tool processing operations occur in your browser, our servers never receive:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Files uploaded to converters, PDF compressors, or image editors (local tools).</li>
                <li>Content, text strings, or inputs entered into developer calculators or humanizers (local tools).</li>
                <li>Cryptographic hashes, passwords, or secure notes generated locally.</li>
              </ul>
              <p className="mb-4">
                <strong>What our servers do receive and store:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Page-view telemetry</strong> — visited path, viewport size, and client type, sent to our first-party <span className="font-mono text-xs">/api/analytics</span> endpoint and stored in our database (no cookies; IP addresses are used only for rate-limiting and never stored alongside page views; disabled when you choose Decline in the consent banner).</li>
                <li><strong>Error reports</strong> — error message, stack trace, tool name, page path, and user-agent string, stored to diagnose crashes. Error text can occasionally contain fragments of what the page was doing — never file contents.</li>
                <li><strong>Zero-result search terms</strong> — only searches that match no tool, truncated, used to improve search synonyms.</li>
                <li><strong>Quota identifiers</strong> — a salted hash of basic browser attributes (user-agent, screen size, language, timezone) used solely to enforce anonymous download/usage limits. It cannot identify you and is never joined to account data.</li>
                <li><strong>AI/cloud tool inputs</strong> — prompts, text, or audio you submit to a marked AI or cloud tool transit our server to our AI provider (Google Gemini). We log only anonymous credit/quota accounting, not your content.</li>
                <li><strong>Account data (signed-in users only)</strong> — email, plan, AI credit balance, favorites, and session tokens.</li>
              </ul>
              <p>
                We also run <strong>Cloudflare Web Analytics</strong> (cookieless, aggregate page metrics) and, unless you Decline, <strong>PostHog</strong> page-view analytics. See our <Link href="/cookies" className="text-[var(--accent)] hover:underline">Cookie Policy</Link> for details and controls.
              </p>
            </section>

            <section id="cookies" className="scroll-mt-28 border-t border-[var(--border-subtle)] pt-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">4. Cookies and Session Memory</h3>
              <p className="mb-4">
                Toolzum utilizes browser storage mechanisms (LocalStorage, SessionStorage, and IndexedDB) to save settings, UI preferences, and user states (such as checklist items, upvotes, and custom styling themes).
              </p>
              <p className="mb-4">
                A small number of functional cookies and storage keys keep the site working: your consent choice (stored locally on your device), sign-in session tokens (signed-in users only), an edge-set 2-letter country code used for regional formatting (<span className="font-mono text-xs">user-country</span>, 24h), and anonymous quota counters. PostHog analytics storage is only set when you Accept analytics.
              </p>
              <p>
                These states remain persistently cached on your browser and can be completely purged at any time by clearing your browser cache. Full details in our <Link href="/cookies" className="text-[var(--accent)] hover:underline">Cookie Policy</Link>.
              </p>
            </section>

            <section id="third-party" className="scroll-mt-28 border-t border-[var(--border-subtle)] pt-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">5. Third-Party Integrations</h3>
              <p className="mb-4">
                We do not sell, rent, or lease any analytical details or user data. We host the Toolzum compiler framework on global CDN edge nodes (Cloudflare/Pages) to deliver files to your browser efficiently.
              </p>
              <p className="mb-4">
                Subprocessors and integrations that may receive limited data:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Google Gemini</strong> — our AI provider. Inputs you submit to marked AI/cloud tools transit our server to Gemini for processing, under Google's API data terms. We store none of your content.</li>
                <li><strong>PostHog</strong> — page-view analytics, active only until you choose Decline in the consent banner.</li>
                <li><strong>Cloudflare Web Analytics</strong> — cookieless aggregate metrics; no personal data.</li>
                <li><strong>Pollinations</strong> — the free AI image engine loads generated images directly from their servers in your browser.</li>
                <li><strong>Library & model CDNs</strong> (jsDelivr, unpkg, cdnjs, Google storage) — deliver open-source processing libraries and on-device AI models to your browser. They see standard download requests (IP, user-agent) like any CDN fetch.</li>
                <li><strong>Cloudflare Turnstile</strong> — bot-protection challenge on email sign-in.</li>
              </ul>
              <p>
                When you initiate payment requests (such as upgraded cloud quotas), your transactions are handled directly through authorized secure portal gateways (e.g. Razorpay or Dodo) under their respective privacy parameters. We never see or store card details.
              </p>
            </section>

            <section id="security" className="scroll-mt-28 border-t border-[var(--border-subtle)] pt-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">6. Security Architecture</h3>
              <p className="mb-4">
                Our code compiles utilizing strict Content Security Policies (CSP) to block arbitrary external scripting injections. We run weekly audits to ensure dependencies remain clear of known vulnerabilities.
              </p>
              <p>
                Should you have any questions regarding privacy audits, please inspect the public developer repository or write to us through our contact form.
              </p>
            </section>

            <section id="dpdp" className="scroll-mt-32">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">7. Data Protection (India DPDP Act 2023)</h3>
              <div className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)] space-y-4">
                <p>Toolzum complies with India's Digital Personal Data Protection Act, 2023.</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li><strong>Data Fiduciary:</strong> Toolzum Inc.</li>
                  <li><strong>Grievance Officer:</strong> Reachable at support@toolzum.com</li>
                  <li><strong>Data we collect:</strong> Usage analytics (anonymised), account email (if logged in).</li>
                  <li><strong>Your rights:</strong> Right to access, correct, and erase your personal data.</li>
                  <li><strong>Retention:</strong> Analytics data retained for 90 days, then automatically purged. Account data retained until deletion.</li>
                  <li><strong>Contact:</strong> For data requests, email support@toolzum.com within 72 hours response SLA.</li>
                </ul>
              </div>
            </section>

            <section id="gdpr" className="scroll-mt-32 border-t border-[var(--border-subtle)] pt-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">8. GDPR Rights (European Users)</h3>
              <div className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)] space-y-4">
                <p>If you are located in the European Economic Area (EEA), UK, or Switzerland, you have the following rights under the General Data Protection Regulation (GDPR):</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
                  <li><strong>Right to Rectification:</strong> Request correction of inaccurate personal data.</li>
                  <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten").</li>
                  <li><strong>Right to Restrict Processing:</strong> Request that we limit how we use your data.</li>
                  <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format.</li>
                  <li><strong>Right to Object:</strong> Object to our processing of your personal data.</li>
                  <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, withdraw it at any time.</li>
                </ul>
                <p className="text-sm"><strong>Legal Basis:</strong> We process data based on (a) consent (analytics, account creation), (b) contractual necessity (providing the service), and (c) legitimate interests (security, fraud prevention).</p>
                <p className="text-sm"><strong>Data Transfers:</strong> Toolzum uses Cloudflare (global CDN) and PostHog (product analytics) and may process data outside the EEA. We rely on Standard Contractual Clauses (SCCs) where required.</p>
                <p className="text-sm"><strong>Contact:</strong> For GDPR requests, email support@toolzum.com. We respond within 30 days. You also have the right to lodge a complaint with your local supervisory authority.</p>
              </div>
            </section>

            <section id="ccpa" className="scroll-mt-32 border-t border-[var(--border-subtle)] pt-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">9. CCPA Rights (California Users)</h3>
              <div className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)] space-y-4">
                <p>If you are a California resident, the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA) grant you the following rights:</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li><strong>Right to Know:</strong> Request disclosure of the categories and specific pieces of personal information we collect, the sources, purposes, and categories of third parties we share it with.</li>
                  <li><strong>Right to Delete:</strong> Request deletion of your personal information, subject to certain exceptions.</li>
                  <li><strong>Right to Correct:</strong> Request correction of inaccurate personal information.</li>
                  <li><strong>Right to Opt-Out of Sale/Sharing:</strong> We do not sell or share your personal information for cross-context behavioral advertising.</li>
                  <li><strong>Right to Limit Use of Sensitive Personal Information:</strong> We do not use sensitive personal information for purposes other than providing the service.</li>
                  <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your privacy rights.</li>
                </ul>
                <p className="text-sm"><strong>Categories Collected:</strong> Identifiers (email, user ID), internet activity (usage analytics), and inferences (tool usage patterns). We do not collect biometric data, geolocation, or financial information beyond payment processing.</p>
                <p className="text-sm"><strong>Disclosure:</strong> In the preceding 12 months, we have not sold personal information of California residents.</p>
                <p className="text-sm"><strong>Contact:</strong> For CCPA requests, email support@toolzum.com. We verify your identity before processing. We respond within 45 days.</p>
              </div>
            </section>

          </div>

        </div>

      </div>
    </div>
  );
}
