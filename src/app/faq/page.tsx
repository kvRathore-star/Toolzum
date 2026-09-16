import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description:
    "Answers to common questions about Toolzum — privacy, processing, file storage, supported formats, and more.",
  alternates: { canonical: "https://toolzum.com/faq/" },
  openGraph: {
    title: "FAQ | Toolzum",
  },
};

const faqs = [
  {
    q: "Are my files uploaded to any server?",
    a: "For the majority of tools: no — all processing happens entirely in your browser using WebAssembly and JavaScript. Your files never reach our servers. A small number of AI-powered tools send data directly from your browser to a third-party AI API; these are clearly marked on every tool page. Either way, your files never touch Toolzum's infrastructure.",
  },
  {
    q: "Do I need to create an account?",
    a: "No account is needed for any tool. All free tools work immediately. Signing in free raises limits to 5 downloads/day, 30 AI credits/month, and batches up to 10 files (150MB each). A Pro account adds unlimited downloads, 500-file batches up to 2GB, batch ZIP downloads, and 300 AI credits/month.",
  },
  {
    q: "What file formats are supported?",
    a: "We support hundreds of formats: images (JPG, PNG, WebP, HEIC, SVG, AVIF), documents (PDF, DOCX, PPTX, XLSX), audio (MP3, WAV, FLAC, OGG, M4A), video (MP4, AVI, MOV, MKV, WebM, GIF), and more.",
  },
  {
    q: "Is there a file size limit?",
    a: "Free anonymous users can process files up to 10-30MB depending on file type (images 10MB, PDFs 15MB, audio 20MB, video 30MB). Signing in increases limits to 20-150MB. Pro subscribers can process files up to 2GB with batch support of up to 500 files.",
  },
  {
    q: "How many files can I process?",
    a: "Anonymous users get 3 downloads per day. Signing in free raises the limit to 5 downloads per day with batches up to 10 files. Pro users get unlimited downloads with 6x parallel threads and batches up to 500 files.",
  },
  {
    q: "How do AI credits work?",
    a: "AI text tools (paraphraser, translator, summariser) cost 1 credit per use; voice/video transcription costs 10 credits per use. Signing in free gives 30 credits/month; Pro gives 300/month, resetting monthly. AI image generation and all local tools are free and use no credits. Anonymous users need to sign in to use AI tools.",
  },
  {
    q: "Can I try Pro tools for free?",
    a: "Yes. Guests see a sign-in screen on Pro tools, but signing in free unlocks 2 Pro-tool downloads per day — enough to evaluate any premium tool. Upgrade to Pro for unlimited downloads, 500-file batches, batch ZIP, and 300 AI credits/month.",
  },
  {
    q: "Can I download multiple files as a single ZIP?",
    a: "Batch ZIP download is a Pro feature. Free users download files individually; Pro users get 1-click ZIP archives for entire batches plus saved workflow presets.",
  },
  {
    q: "Is Toolzum accessible on mobile?",
    a: "Yes. All tools work on any modern browser — desktop, tablet, or phone. Some advanced features (like precise cropping) work best on larger screens.",
  },
  {
    q: "Do you support bulk/batch processing?",
    a: "Yes. Free signed-in users can batch up to 10 files at a time (processed one by one, downloaded individually). Pro subscribers batch up to 500 files in parallel with 1-click ZIP download. Select tools like Bulk Image Resizer, Bulk PDF Merger, and Bulk Audio Converter are designed for batch workflows.",
  },
  {
    q: "Is my data tracked or sold?",
    a: "Never. We use privacy-preserving analytics (PostHog page views you can Decline, plus cookieless aggregate metrics) with strictly-necessary storage for sessions and free-tier quota. No advertising trackers, no cross-site profiling, no data sale — IP addresses are used only for rate-limiting, never stored with analytics. Full details in our Privacy Policy.",
  },
  {
    q: "What happens if I close the browser during processing?",
    a: "Processing stops and any results are lost. Since everything runs client-side, there is no server-side job queue. Re-open the tool and start again.",
  },
  {
    q: "Can I use Toolzum offline?",
    a: "Most tools require an initial page load but then work without internet for the actual processing. The service worker caches the app shell for repeat visits.",
  },
  {
    q: "How do I cancel my Pro subscription?",
    a: "You can cancel anytime from the Billing page or by emailing support@toolzum.com. Your Pro access continues until the end of the billing period.",
  },
  {
    q: "Who built Toolzum?",
    a: "Toolzum is built by a small independent team focused on privacy-first, client-side web utilities. We believe powerful tools shouldn't require surrendering your data.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
        <div className="max-w-[800px] mx-auto pt-24 pb-24 px-4 sm:px-6">
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-6xl mb-4 tracking-tight leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-[var(--text-secondary)] text-lg mb-12">
            Everything you need to know about Toolzum.
          </p>

          <div className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6"
              >
                <h2 className="font-semibold text-[var(--text-primary)] mb-2">{faq.q}</h2>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
