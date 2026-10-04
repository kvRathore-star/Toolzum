/**
 * Pure helpers for the mail-bridge worker — kept free of CF runtime types
 * so they stay trivially unit-testable from src/__tests__.
 */

/**
 * Strip the quoted history from a reply so the admin thread shows what the
 * person actually wrote, not the whole quoted chain. Heuristic (Gmail,
 * Outlook, Apple Mail patterns); when no marker with content before it is
 * found, returns the original text untouched — a false negative is safe,
 * a false positive would drop real content.
 */
export function stripQuoted(text: string): string {
  // Specific reply-history markers ONLY. A bare `>`/`>>` line is NOT a
  // safe cut point: people quote the original mid-reply and continue their
  // answer below — cutting there would silently drop real content (false
  // negatives are safe, false positives are data loss).
  const markers: RegExp[] = [
    /^\s*On .{0,200}?wrote:\s*$/im,
    /^\s*-{2,}\s*(Original Message|Verzenden|Verzonden|Forwarded message).*-{2,}\s*$/im,
    /^\s*From:\s*.+\nSent:\s*.+\nTo:\s*.+/im,
    /^\s*_{5,}\s*$/m,
  ];
  let cut = -1;
  for (const m of markers) {
    const hit = m.exec(text);
    if (hit && hit.index > 0 && (cut === -1 || hit.index < cut)) cut = hit.index;
  }
  if (cut <= 0) return text;
  const sliced = text.slice(0, cut).replace(/\s+$/, "");
  return sliced.length > 0 ? sliced : text;
}

/** Minimal HTML → text for messages that have no text/plain part. */
export function stripHtml(html: string): string {
  return html
    .replace(/<(br|\/p|\/div|\/tr|\/h[1-6])\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** postal-mime attachment content can be string | ArrayBuffer | Uint8Array. */
export function toBytes(content: ArrayBuffer | Uint8Array | string): Uint8Array {
  if (typeof content === "string") {
    // base64 (postal-mime default when no attachmentEncoding requested)
    try {
      return Uint8Array.from(atob(content), (c) => c.charCodeAt(0));
    } catch {
      return new TextEncoder().encode(content);
    }
  }
  return content instanceof Uint8Array ? content : new Uint8Array(content);
}

/** Safe filename for Content-Disposition and KV metadata. */
export function cleanFileName(name: string | null | undefined, index: number): string {
  const base = (name || `attachment-${index + 1}`)
    .replace(/[\r\n<>\\"/]/g, "")
    .trim()
    .slice(0, 200);
  return base || `attachment-${index + 1}`;
}
