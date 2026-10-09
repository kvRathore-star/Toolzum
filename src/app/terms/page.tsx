import React from "react";
import { legalDate, formatLegalDate } from "@/lib/legal-dates.generated";
import { 
  Scale, 
  HelpCircle, 
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: (
      <>
        <p className="mb-3">
          By accessing or using the Toolzum platform, web application, and browser extensions (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms") and all applicable local regulations.
        </p>
        <p>
          If you do not agree to these Terms, you are prohibited from using or accessing the Service. The materials contained in this website are protected by applicable copyright and trademark laws.
        </p>
      </>
    )
  },
  {
    id: "service-description",
    title: "2. Description of Service",
    content: (
      <>
        <p className="mb-3">
          Toolzum is an offline-first browser utility catalog. Most processing (including PDF compilation, code formatting, canvas editing, and image transformation) occurs client-side inside your browser sandbox. AI-powered tools that use cloud processing are clearly marked.
        </p>
        <p>
          We reserve the right to modify, suspend, or terminate any component of the Service (including individual tools) at any time without notice.
        </p>
      </>
    )
  },
  {
    id: "plans",
    title: "3. Plans, Credits & Payments",
    content: (
      <>
        <p className="mb-3">
          Free tier tools are free. <strong>Pro</strong> (monthly) and the <strong>7-Day Project Pass</strong> are paid plans processed by our payment gateways (Razorpay or Dodo Payments). The amount charged is the amount displayed by the gateway at checkout. AI features consume credits (deducted per use as marked on each tool); credits have no cash value, are non-transferable, and reset per plan terms.
        </p>
        <p className="mb-3">
          Plans do <strong>not</strong> auto-renew — access simply continues until the end of the paid period (the Project Pass expires automatically after 7 days). Cancel anytime by emailing <a href="mailto:contact@toolzum.com?subject=Cancel%20Subscription" className="text-[var(--accent)] underline">contact@toolzum.com</a>; requests are processed within 1 business hour and access continues until the period ends.
        </p>
        <p>
          All sales are final: we do <strong>not</strong> offer refunds, but you will never be charged after cancellation.
        </p>
      </>
    )
  },
  {
    id: "prohibited",
    title: "4. Prohibited Conduct",
    content: (
      <>
        <p className="mb-3">When using Toolzum, you agree not to:</p>
        <ul className="list-disc pl-6 space-y-2 mb-3">
          <li>Attempt to scrape, script, or automatedly execute the tools via botting frameworks without a valid API subscription.</li>
          <li>Use local sandboxes to compile malware, construct fraudulent templates (such as fake invoices), or generate illegal materials.</li>
          <li>Interfere with or disrupt the networks hosting the Service CDN resources.</li>
        </ul>
        <p>
          Any violation of these terms may result in immediate suspension of access to our cloud gateways and API services.
        </p>
      </>
    )
  },
  {
    id: "intellectual",
    title: "5. Intellectual Property",
    content: (
      <>
        <p className="mb-3">
          The design, branding, and custom styling systems of Toolzum are the sole property of Toolzum. Individual utilities that implement open-source WebAssembly libraries (such as FFmpeg, Rust decoders, or PDF writers) remain licensed under their respective original open-source boundaries (MIT, GPL, etc.).
        </p>
        <p>
          We grant you a personal, non-exclusive, non-transferable license to execute the compiled code inside your web browser for personal or commercial productivity purposes.
        </p>
      </>
    )
  },
  {
    id: "liability",
    title: "6. Limitation of Liability",
    content: (
      <>
        <div className="flex gap-3 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg p-4 mb-4 text-amber-500 font-mono text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <strong>DISCLAIMER OF WARRANTY:</strong> THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY REPRESENTATION OR WARRANTY, EXPRESS OR IMPLIED.
          </div>
        </div>
        <p className="mb-3">
          Because local-tool file handling runs entirely inside your browser, Toolzum has no control over, and assumes no responsibility for, the outcomes of your locally processed files, calculations, or data. Inputs you submit to clearly-marked AI or cloud tools transit our server to our AI provider as described in our Privacy Policy.
        </p>
        <p className="mb-3">
          In no event shall Toolzum or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the Service.
        </p>
        <p>
          To the maximum extent permitted by law, Toolzum's total aggregate liability for all claims arising from the Service is limited to the fees you paid in the 12 months preceding the claim (or nothing, for free-tier use). Some jurisdictions do not allow certain warranty or liability limitations, so portions of this section may not apply to you.
        </p>
      </>
    )
  },
  {
    id: "security-research",
    title: "7. Security Research & Responsible Disclosure",
    content: (
      <>
        <p className="mb-3">
          Toolzum encourages responsible security research. If you discover a vulnerability in our Service, we will not take legal action against you provided you:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-3">
          <li>Make a good-faith effort to avoid privacy violations, data destruction, service disruption, and destruction of other users' data.</li>
          <li>Only interact with accounts you own or have explicit permission to test — never access another user's data.</li>
          <li>Do not exploit a vulnerability beyond what is necessary to confirm its existence — stop once you have demonstrated impact.</li>
          <li>Report the vulnerability to us promptly via <a href="mailto:contact@toolzum.com" className="text-[var(--accent)] underline">contact@toolzum.com</a> and allow reasonable time for remediation before public disclosure.</li>
        </ul>
        <p>
          We aim to acknowledge receipt of your report within 72 hours and will work with you to understand and resolve the issue. We will not pursue legal action for testing conducted in accordance with this policy.
        </p>
      </>
    )
  },
  {
    id: "copyright",
    title: "8. Copyright Complaints",
    content: (
      <>
        <p className="mb-3">
          If you believe content accessible through the Service infringes your copyright, notify us at <a href="mailto:contact@toolzum.com?subject=Copyright%20Complaint" className="text-[var(--accent)] underline">contact@toolzum.com</a> with: (a) identification of the copyrighted work, (b) the URL or location of the allegedly infringing material, (c) your contact details, and (d) a good-faith statement that the use is unauthorized.
        </p>
        <p>
          We respond to valid notices by removing or disabling access as required under applicable law (including India's Information Technology Act). Counter-notices follow the same channel.
        </p>
      </>
    )
  },
  {
    id: "children",
    title: "9. Children",
    content: (
      <p>
        The Service is not directed at children under 13, and users under 18 should use it only with a parent or guardian's consent (as required under India's DPDP Act for children's data). If you believe a child has provided personal data, contact us and we will delete the account and associated data.
      </p>
    )
  },
  {
    id: "governing-law",
    title: "10. Governing Law & Disputes",
    content: (
      <>
        <p className="mb-3">
          These Terms are governed by the laws of India. Before any formal proceedings, contact <a href="mailto:contact@toolzum.com?subject=Dispute" className="text-[var(--accent)] underline">contact@toolzum.com</a> so we can attempt good-faith resolution within 30 days.
        </p>
        <p>
          Failing resolution, disputes are subject to the exclusive jurisdiction of the competent courts of India.
        </p>
      </>
    )
  },
  {
    id: "changes",
    title: "11. Changes to Terms",
    content: (
      <>
        <p className="mb-3">
          Toolzum may revise these Terms of Service at any time. Material changes are announced in our <Link href="/changelog">changelog</Link> at least 7 days before taking effect; by continuing to use the Service afterward, you accept the updated Terms.
        </p>
        <p>
          We advise reviewing this page periodically for updates.
        </p>
      </>
    )
  }
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      
      {/* Background Grids */}
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none opacity-[0.03]">
        <div className="w-full max-w-[1280px] h-full" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-sm font-semibold text-[var(--accent)] mb-6">
            <Scale className="w-4 h-4" /> Service Agreements
          </span>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-7xl mb-6 tracking-tight leading-tight">
            Terms of Service
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)]">
            Please read these guidelines carefully before using the Toolzum client compilers.
          </p>
          <p className="text-sm font-mono text-[var(--text-muted)] mt-4">
            Last Updated: {formatLegalDate(legalDate("/terms/"))}
          </p>
        </div>

        {/* Accordions Wrapper - using native details/summary */}
        <div className="max-w-3xl mx-auto space-y-4 mb-24">
          
          {SECTIONS.map((sec) => (
            <details 
              key={sec.id}
              className="group bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden"
            >
              {/* Clickable Header */}
              <summary className="w-full px-6 py-5 flex items-center justify-between font-semibold text-sm sm:text-base text-left hover:bg-[var(--bg-overlay)]/40 transition-colors cursor-pointer list-none">
                <span className="text-[var(--text-primary)]">{sec.title}</span>
                <span className="text-[var(--text-muted)] group-open:text-[var(--accent)] transition-colors">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>

              {/* Content Area */}
              <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] font-sans">
                {sec.content}
              </div>
            </details>
          ))}

        </div>

        {/* CTA help info */}
        <div className="max-w-3xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-8 text-center">
          <h3 className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl font-semibold mb-2 flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-[var(--accent)]" /> Have questions?
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto mb-6">
            If you have questions about these terms, feel free to contact us.
          </p>
          <Link href="/contact">
            <Button size="sm">Contact Support</Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
