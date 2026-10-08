import Link from "next/link";
import { getCachedToolCounts } from "@/registry/tools-helpers";

const { totalImplemented } = getCachedToolCounts();

export const metadata = {
  title: "Press — Toolzum",
  description: `Press kit for Toolzum: ${totalImplemented}+ free privacy-first browser tools. Brand assets, company facts, and contact for journalists and bloggers.`,
  alternates: { canonical: "https://toolzum.com/press/" },
};

const FACTS: [string, string][] = [
  ["What", "1,000+ free online tools (PDF, image, video, audio, AI, text, developer, finance and more) that run in the browser."],
  ["Privacy model", "Local tools never upload files; cloud AI features are marked and cost credits."],
  ["Price", "Free tier with unlimited local tools; Pro unlocks 500-file batches, 2GB files and AI credits."],
  ["Launched", "2026. Privacy-first from day one."],
  ["Contact", "See /contact for press inquiries. Logo: /favicon.svg (SVG), /favicon.png (PNG)."],
];

export default function PressPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--text-primary)]">Home</Link>
        <span aria-hidden="true"> / </span>
        <span>Press</span>
      </nav>
      <h1 className="text-3xl font-bold text-[var(--text-primary)]">Press kit</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-secondary)]">
        Toolzum builds {totalImplemented}+ free online tools that respect privacy: files
        are processed in your browser and never uploaded, no signup needed to start.
        Journalists and bloggers covering free software, privacy tools, or PDF/image
        utilities — everything below is quotable, and logos are linked for download.
      </p>
      <h2 className="mt-10 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Company facts
      </h2>
      <dl className="mt-4 space-y-4">
        {FACTS.map(([term, def]) => (
          <div key={term}>
            <dt className="font-semibold text-[var(--text-primary)]">{term}</dt>
            <dd className="text-sm leading-relaxed text-[var(--text-secondary)]">{def}</dd>
          </div>
        ))}
      </dl>
      <h2 className="mt-10 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Brand assets
      </h2>
      <ul className="mt-4 space-y-2 text-sm">
        <li>
          <a className="underline hover:text-[var(--text-primary)]" href="/favicon.svg" download>Logo (SVG)</a>
          <span className="text-[var(--text-muted)]"> — use on light or dark backgrounds with clear space equal to the mark height.</span>
        </li>
        <li>
          <a className="underline hover:text-[var(--text-primary)]" href="/favicon.png" download>Logo (PNG)</a>
        </li>
      </ul>
      <p className="mt-10 text-sm text-[var(--text-secondary)]">
        Reviewing us in a roundup? Link the exact tool, not the homepage — e.g.{" "}
        <Link className="underline hover:text-[var(--text-primary)]" href="/pdf/pdf-editor/">
          the PDF editor
        </Link>
        . That&apos;s the page your readers need.
      </p>
    </main>
  );
}
