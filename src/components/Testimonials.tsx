"use client";

import React, { useState, useEffect } from "react";

interface Testimonial {
  name: string;
  text: string;
  toolSlug: string;
}

/**
 * Wall of love, honestly sourced: only admin-approved rows from real
 * submissions render. Empty state invites the first review instead of
 * faking social proof. JSON-LD emits the review list only — no
 * aggregateRating, since we collect words, not stars (a hardcoded 5.0
 * would be a lie to crawlers).
 */
export function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: unknown) => {
        const data = d as { ok?: boolean; testimonials?: Testimonial[] } | null;
        if (data && data.ok && Array.isArray(data.testimonials)) setItems(data.testimonials);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), text: text.trim() }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (data.ok) {
        setFeedback("Thanks — your review is in the moderation queue and appears after approval.");
        setName("");
        setText("");
      } else {
        setFeedback(data.error || "Couldn't send. Try again.");
      }
    } catch {
      setFeedback("Couldn't send. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section aria-labelledby="reviews-heading" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto border-t border-[var(--border-subtle)]">
      {items.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: "Toolzum",
              url: "https://toolzum.com",
              review: items.slice(0, 10).map((t) => ({
                "@type": "Review",
                author: { "@type": "Person", name: t.name },
                reviewBody: t.text,
              })),
            }),
          }}
        />
      )}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 id="reviews-heading" className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] mb-3">
          Loved by people who hate uploads
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          {loaded && items.length === 0
            ? "No reviews yet — yours could be the first one here."
            : "Real words from real users. Every review below was written by a visitor and approved by a human."}
        </p>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-12">
          {items.map((t, i) => (
            <figure key={`${t.name}-${i}`} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
              <blockquote className="text-sm text-[var(--text-primary)] leading-relaxed">“{t.text}”</blockquote>
              <figcaption className="mt-3 text-xs font-semibold text-[var(--text-secondary)]">— {t.name}</figcaption>
            </figure>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="max-w-xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6">
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Share your experience</h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">First name only. No links. A human reads every review before it appears.</p>
        <label htmlFor="review-name" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">First name</label>
        <input
          id="review-name"
          aria-label="First name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder="e.g. Priya"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-zinc-400 mb-4"
        />
        <label htmlFor="review-text" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Your review</label>
        <textarea
          id="review-text"
          aria-label="Your review"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Which tool did you use, and what did it save you?"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-zinc-400 resize-y mb-4"
        />
        <button
          type="submit"
          disabled={sending}
          className="px-6 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white font-medium rounded-[var(--radius-lg)] transition-colors text-sm min-h-[40px]"
        >
          {sending ? "Sending…" : "Submit review"}
        </button>
        {feedback && (
          <p role="status" className="mt-3 text-xs text-[var(--text-secondary)]">{feedback}</p>
        )}
      </form>
    </section>
  );
}
