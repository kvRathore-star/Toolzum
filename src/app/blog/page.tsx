import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-posts";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Guides & Engineering",
  description:
    "Read practical how-to guides, technical deep-dives, and privacy analysis for browser-based tools on the Toolzum blog.",
  openGraph: {
    title: "Blog | Toolzum",
    description:
      "Practical how-to guides, technical deep-dives, and privacy analysis for browser-based tools.",
  },
};

const engineeringPosts: Array<{
  slug: string; title: string; excerpt: string; author: string; date: string; isoDate: string; readTime: string; tag: string; tagColor: string;
}> = [
  {
    slug: "wasm-converters",
    title: "How WebAssembly is Replacing Server-Side Converters",
    excerpt: "Explore the compilation of LLVM utilities to WASM binaries that execute file compressions instantly in-browser.",
    author: "Arjun Mehta",
    date: "May 18, 2026",
    isoDate: "2026-05-18",
    readTime: "6 min read",
    tag: "WebAssembly",
    tagColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  {
    slug: "offline-first-web",
    title: "The Future of Offline-First Web Applications",
    excerpt: "How Service Workers, LocalStorage, and local canvas architectures allow complete utility usage without network access.",
    author: "Rohan Sen",
    date: "April 29, 2026",
    isoDate: "2026-04-29",
    readTime: "8 min read",
    tag: "Architecture",
    tagColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    slug: "zero-telemetry-privacy",
    title: "Why Zero-Telemetry is Vital for Document Tools",
    excerpt: "Analyzing the security vulnerabilities of uploading sensitive legal PDFs to third-party server queues, and how to stay isolated.",
    author: "Sanjay Dixit",
    date: "March 15, 2026",
    isoDate: "2026-03-15",
    readTime: "5 min read",
    tag: "Privacy",
    tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    slug: "webgl-image-tensors",
    title: "Optimizing Neural Networks on WebGL Canvas",
    excerpt: "How local execution of background-removal models runs directly on client GPUs using modern WebGL canvas engines.",
    author: "Mira Roy",
    date: "February 4, 2026",
    isoDate: "2026-02-04",
    readTime: "7 min read",
    tag: "AI Engineering",
    tagColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
];

export default function BlogPage() {
  const allPosts = [...blogPosts, ...engineeringPosts].sort(
    (a, b) => new Date(b.isoDate || b.date).getTime() - new Date(a.isoDate || a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none opacity-[0.03]">
        <div className="w-full max-w-[1280px] h-full" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--accent)] mb-6">
            Guides &amp; Engineering Blog
          </div>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-7xl mb-6 tracking-tight leading-tight">
            Read our latest guides.
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)]">
            Practical how-to guides, technical deep-dives, and privacy analysis for browser-based tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24">
          {allPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/posts/${post.slug}`}
              className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/30 rounded-[var(--radius-2xl)] p-6 sm:p-8 flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${post.tagColor}`}>
                    {post.tag}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono">
                    <Clock className="w-3.5 h-3.5" /> {post.readTime}
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-semibold mb-3 group-hover:text-[var(--accent)] transition-colors leading-snug">
                  {post.title}
                </h3>

                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)]">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">{post.author}</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono">{post.date}</div>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] group-hover:translate-x-0.5 transition-transform">
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
