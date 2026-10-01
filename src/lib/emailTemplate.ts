/**
 * Branded HTML email renderer.
 *
 * Every Toolzum email ships the same chrome: dark card, indigo accent bar,
 * wordmark header, action button, muted footer — matching the site's standard.
 *
 * Email-client rules this file follows deliberately:
 * - Table layout + inline styles only (no <style> blocks, flex, or grid —
 *   Outlook's Word engine and Gmail's sanitizer strip them).
 * - Absolute https:// URLs (remote images and links break on relative paths).
 * - No SVG logo: raster PNG only; SVG is blocked by most clients.
 * - No emoji anywhere: some clients render tofu, and it cheapens the brand.
 * - The plain-text `text` twin stays authoritative — sendEmail always sends it.
 */

export interface EmailCta {
  label: string;
  url: string;
}

export interface EmailDetail {
  label: string;
  value: string;
}

export interface BrandEmailOptions {
  /** Single-line headline. Sensible default: the subject line. */
  heading: string;
  /** Short personal opener under the headline — unique per email type. */
  greeting?: string;
  /** Hidden inbox-preview line. Defaults to the heading. */
  preheader?: string;
  paragraphs?: string[];
  /** Label/value rows — payment ID, temporary password, balance … */
  details?: EmailDetail[];
  cta?: EmailCta;
  /** Muted closing line, above the footer. */
  note?: string;
}

const FONT_STACK =
  "'Geist','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO_STACK =
  "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace";

const BRAND = {
  bg: "#0b0b10",
  card: "#18181b",
  line: "#27272a",
  text: "#fafafa",
  muted: "#a1a1aa",
  dim: "#71717a",
  accent: "#6366f1",
  accentSoft: "#818cf8",
};

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Wraps bare URLs in a link. Call after escapeHtml — it runs on escaped text. */
function linkify(escaped: string): string {
  return escaped.replace(/https?:\/\/[^\s<>"']+/g, (url) => {
    const trailing = url.match(/[.,;:!?)]+$/)?.[0] ?? "";
    const href = trailing ? url.slice(0, -trailing.length) : url;
    return `<a href="${href}" style="color:${BRAND.accentSoft};text-decoration:underline;">${href}</a>${trailing}`;
  });
}

function paragraphHtml(text: string): string {
  return `<p style="margin:0 0 14px 0;font-size:15px;line-height:24px;color:${BRAND.muted};">${linkify(
    escapeHtml(text)
  )}</p>`;
}

function detailsHtml(details: EmailDetail[]): string {
  const last = details.length - 1;
  const rows = details
    .map(
      (d, i) => `<tr>
        <td style="padding:12px 16px;font-size:13px;color:${BRAND.dim};${
          i < last ? `border-bottom:1px solid ${BRAND.line};` : ""
        }vertical-align:top;">
          ${escapeHtml(d.label)}
        </td>
        <td style="padding:12px 16px;font-size:14px;color:${BRAND.text};font-family:${MONO_STACK};word-break:break-all;${
          i < last ? `border-bottom:1px solid ${BRAND.line};` : ""
        }vertical-align:top;">
          ${linkify(escapeHtml(d.value))}
        </td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;margin:4px 0 18px 0;background:#0f0f14;border:1px solid ${BRAND.line};border-radius:12px;border-collapse:separate;">${rows}</table>`;
}

function ctaHtml(cta: EmailCta): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 4px 0;">
    <tr>
      <td style="border-radius:10px;background:${BRAND.accent};">
        <a href="${escapeHtml(cta.url)}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:${FONT_STACK};border-radius:10px;">${escapeHtml(
          cta.label
        )}</a>
      </td>
    </tr>
  </table>`;
}

function headerHtml(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
    <tr>
      <td align="left" style="padding:24px 32px 4px 32px;">
        <img src="https://toolzum.com/icon-192x192.png" width="40" height="40" alt="" style="display:block;width:40px;height:40px;border-radius:10px;" />
        <div style="font-family:${FONT_STACK};font-size:20px;font-weight:800;line-height:24px;padding-top:12px;">
          <span style="color:#e6edf3;">Tool</span><span style="color:${BRAND.accentSoft};">zum</span>
        </div>
        <div style="font-family:${FONT_STACK};font-size:12px;color:${BRAND.dim};padding-top:4px;">
          Privacy-first browser tools
        </div>
      </td>
    </tr>
  </table>`;
}

function footerHtml(): string {
  const link = (href: string, label: string) =>
    `<a href="${href}" style="color:${BRAND.accentSoft};text-decoration:none;font-family:${FONT_STACK};font-size:13px;">${label}</a>`;
  const sep = `<span style="color:#3f3f46;font-size:13px;">&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid ${BRAND.line};">
    <tr>
      <td style="padding:20px 32px 24px 32px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="padding-bottom:14px;">
          <tr>
            <td style="padding-right:10px;vertical-align:middle;">
              <img src="https://toolzum.com/icon-192x192.png" width="28" height="28" alt="" style="display:block;width:28px;height:28px;border-radius:7px;" />
            </td>
            <td style="vertical-align:middle;font-family:${FONT_STACK};font-size:15px;font-weight:800;">
              <span style="color:#e6edf3;">Tool</span><span style="color:${BRAND.accentSoft};">zum</span>
            </td>
          </tr>
        </table>
        <div style="font-family:${FONT_STACK};font-size:13px;color:${BRAND.dim};line-height:20px;padding-bottom:12px;">
          1,000+ free browser utilities. Most tools run entirely in your browser &mdash;
          nothing you process is ever uploaded.
        </div>
        <div style="padding-bottom:12px;">
          ${link("https://toolzum.com", "Open Toolzum")}${sep}${link(
            "https://toolzum.com/tools",
            "Tools"
          )}${sep}${link("https://toolzum.com/pricing", "Pricing")}${sep}${link(
            "https://toolzum.com/privacy",
            "Privacy"
          )}${sep}${link("https://toolzum.com/contact", "Contact")}
        </div>
        <div style="font-family:${FONT_STACK};font-size:13px;color:${BRAND.muted};line-height:20px;padding-bottom:10px;">
          <a href="mailto:contact@toolzum.com" style="color:${BRAND.muted};text-decoration:underline;">contact@toolzum.com</a>
          <span style="color:#3f3f46;">&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>
          <a href="mailto:support@toolzum.com" style="color:${BRAND.muted};text-decoration:underline;">support@toolzum.com</a>
        </div>
        <div style="font-family:${FONT_STACK};font-size:12px;color:#52525b;line-height:18px;">
          You received this message because it is part of your Toolzum account activity.
          Toolzum &middot; toolzum.com
        </div>
      </td>
    </tr>
  </table>`;
}

export function renderEmail(opts: BrandEmailOptions): string {
  const paragraphs = opts.paragraphs ?? [];
  const preheader = opts.preheader ?? opts.heading;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="dark" />
<meta name="supported-color-schemes" content="dark" />
<title>${escapeHtml(opts.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${escapeHtml(
    preheader
  )}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:${BRAND.bg};border-collapse:collapse;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${BRAND.card};border:1px solid ${BRAND.line};border-radius:16px;border-collapse:separate;overflow:hidden;">
        <tr>
          <td style="height:4px;background:${BRAND.accent};font-size:0;line-height:0;">&nbsp;</td>
        </tr>
        <tr>
          <td>${headerHtml()}</td>
        </tr>
        <tr>
          <td style="padding:8px 32px 32px 32px;">
            <h1 style="margin:12px 0 16px 0;font-family:${FONT_STACK};font-size:24px;line-height:32px;font-weight:700;color:${BRAND.text};letter-spacing:-0.4px;">${escapeHtml(
              opts.heading
            )}</h1>
            ${
              opts.greeting
                ? `<p style="margin:0 0 16px 0;font-family:${FONT_STACK};font-size:16px;line-height:24px;font-weight:600;color:#e4e4e7;">${linkify(
                    escapeHtml(opts.greeting)
                  )}</p>`
                : ""
            }
            ${paragraphs.map(paragraphHtml).join("\n            ")}
            ${opts.details && opts.details.length > 0 ? detailsHtml(opts.details) : ""}
            ${opts.cta ? ctaHtml(opts.cta) : ""}
            ${
              opts.note
                ? `<p style="margin:${opts.cta ? "16px" : "4px"} 0 0 0;font-size:13px;line-height:20px;color:${BRAND.dim};">${linkify(
                    escapeHtml(opts.note)
                  )}</p>`
                : ""
            }
          </td>
        </tr>
        <tr>
          <td>${footerHtml()}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/**
 * Fallback branding for callers that only supply plain text: subject becomes
 * the headline, blank-line-separated blocks become paragraphs (lines split
 * further when a block has no blank lines — receipt-style bodies join with \n).
 * Optional `cta`/`note` render the action button and muted closing line
 * (used by owner replies from the admin panel).
 */
export function brandFromText(
  subject: string,
  text: string,
  opts: { cta?: EmailCta; note?: string } = {}
): string {
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  const paragraphs = blocks.flatMap((block) =>
    block.includes("\n")
      ? block
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
      : [block]
  );
  // Inbox preview: skip the greeting, fall back to the subject.
  const summary =
    paragraphs.find(
      (p) => p.length >= 40 && !/^(hi|hey|hello|dear|good news)\b/i.test(p) && !p.includes("http")
    ) ?? subject;
  return renderEmail({
    heading: subject,
    preheader: summary.length > 140 ? `${summary.slice(0, 137)}…` : summary,
    paragraphs,
    ...(opts.cta ? { cta: opts.cta } : {}),
    ...(opts.note ? { note: opts.note } : {}),
  });
}
