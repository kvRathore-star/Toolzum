import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-posts";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.isoDate,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <article className="max-w-3xl mx-auto pt-24 pb-24 px-4 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        <div className="mb-10">
          <span className={`text-xs font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${post.tagColor} mb-4 inline-block`}>
            {post.tag}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">{post.title}</h1>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
            {post.excerpt}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] font-mono">
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {post.author} &mdash; {post.authorTitle}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
          </div>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none text-[var(--text-secondary)] leading-relaxed space-y-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[var(--text-primary)] [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[var(--text-primary)] [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:text-sm [&_p]:leading-relaxed [&_ul]:text-sm [&_ul]:space-y-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:text-sm [&_ol]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:text-[var(--text-secondary)] [&_strong]:text-[var(--text-primary)]">
          {post.content.split("\n").map((line, i) => {
            if (line.startsWith("## ")) {
              return <h2 key={i}>{line.replace("## ", "")}</h2>;
            }
            if (line.startsWith("### ")) {
              return <h3 key={i}>{line.replace("### ", "")}</h3>;
            }
            if (line.startsWith("- ")) {
              return <li key={i} className="text-sm text-[var(--text-secondary)]">{line.replace("- ", "")}</li>;
            }
            if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ") || line.startsWith("4. ") || line.startsWith("5. ")) {
              return <li key={i} className="text-sm text-[var(--text-secondary)]">{line.replace(/^\d+\.\s+/, "")}</li>;
            }
            if (line.match(/^\*\*.+\*\*/)) {
              return <p key={i} className="text-sm font-semibold text-[var(--text-primary)]">{line.replace(/\*\*/g, "")}</p>;
            }
            if (line.trim() === "") return <div key={i} className="h-2" />;
            if (line.startsWith("**")) {
              return <p key={i} className="text-sm font-semibold text-[var(--text-primary)]">{line.replace(/\*\*/g, "")}</p>;
            }
            return <p key={i} className="text-sm leading-relaxed">{line}</p>;
          })}
        </div>

        <div className="mt-16 pt-8 border-t border-[var(--border-subtle)]">
          <Link
            href="/blog"
            className="text-sm text-[var(--accent)] hover:underline inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to all articles
          </Link>
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            author: { "@type": "Person", name: post.author },
            datePublished: post.isoDate,
            dateModified: post.isoDate,
            publisher: { "@type": "Organization", name: "ToolHub" },
          }),
        }}
      />
    </div>
  );
}
