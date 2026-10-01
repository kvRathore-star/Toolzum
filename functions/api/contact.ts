import { checkRateLimit, recordRateLimit } from "./rate-limit";
import { sendEmail, emailConfigured } from "../../src/lib/email";
import { renderEmail } from "../../src/lib/emailTemplate";

/**
 * Contact form backend (#contact-honesty). The form used to write to
 * localStorage and fake success — messages went nowhere. Now: validate,
 * rate-limit, honeypot-check, relay via Resend (Cloudflare fallback), then
 * send the sender a branded acknowledgment (each category gets its own
 * greeting).
 *
 * Secrets (Pages env, owner-set per docs/ALERTS.md):
 * - RESEND_API_KEY (primary transport — free tier, arbitrary recipients)
 * - CLOUDFLARE_API_TOKEN (legacy/fallback: Email Sending permission)
 * - CONTACT_TO (optional, defaults to kirtivardhan1996@gmail.com)
 * No transport configured: 503 + the client shows a direct-mail fallback.
 * Never a fake success.
 */

interface Env {
  DB: D1Database;
  RESEND_API_KEY?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CONTACT_TO?: string;
}

const MAX_LEN = 2000;

function clean(s: unknown, max = MAX_LEN): string {
  return typeof s === "string" ? s.replace(/<[^>]*>/g, "").slice(0, max) : "";
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

interface CategoryCopy {
  label: string;
  ackHeading: string;
  ackGreeting: string;
  ackBody: string;
}

/** Unique voice per contact category — relay heading + sender acknowledgment. */
const CATEGORY_COPY: Record<string, CategoryCopy> = {
  suggestion: {
    label: "Suggest a Tool",
    ackHeading: "Thanks for suggesting a tool",
    ackGreeting: "Great idea — suggestions shape our roadmap.",
    ackBody:
      "We read every suggestion and follow up if we need one detail before building. 1,000+ tools are already live in your browser in the meantime.",
  },
  bug: {
    label: "Bug / Vulnerability",
    ackHeading: "Thanks for the report",
    ackGreeting: "We're on it — reports like yours keep Toolzum trustworthy.",
    ackBody:
      "Your report is with the team and we'll reply from this address. Security reports are acknowledged within 72 hours, per our published security policy.",
  },
  licensing: {
    label: "Commercial & Licensing",
    ackHeading: "Thanks for reaching out about licensing",
    ackGreeting: "We'll come back to you with options and pricing.",
    ackBody: "A real person reads every licensing inquiry and replies from this address.",
  },
  api: {
    label: "API & Developers",
    ackHeading: "Thanks for writing in about the API",
    ackGreeting: "Your message is with the right people.",
    ackBody: "We'll reply from this address with answers or next steps.",
  },
};

const DEFAULT_COPY: CategoryCopy = {
  label: "General Support",
  ackHeading: "We got your message",
  ackGreeting: "Thanks for writing in — it landed with our team.",
  ackBody:
    "A real person reads every message and replies from this address. Nothing you process in our tools ever leaves your browser.",
};

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { DB, CONTACT_TO } = context.env;
  const ip = context.request.headers.get("cf-connecting-ip") || "unknown";

  const rl = await checkRateLimit(DB, "contact", ip, 5);
  if (rl.limited) return rl.response;
  recordRateLimit(DB, "contact", ip, "/api/contact");

  let body: Record<string, unknown>;
  try {
    body = (await context.request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  if (typeof body.website === "string" && body.website.length > 0) {
    return json({ ok: true });
  }

  const name = clean(body.name, 100);
  const email = clean(body.email, 320);
  const subject = clean(body.subject, 100) || "general";
  const message = clean(body.message, 5000);
  if (!name || !isEmail(email) || !message) {
    return json({ error: "invalid_params — send { name, email, subject?, message }" }, 400);
  }

  if (!emailConfigured(context.env)) {
    return json({ error: "email_unconfigured", to: CONTACT_TO || "kirtivardhan1996@gmail.com" }, 503);
  }

  const to = CONTACT_TO || "kirtivardhan1996@gmail.com";
  const copy = CATEGORY_COPY[subject] ?? DEFAULT_COPY;
  const sent = await sendEmail(
    context.env,
    {
      to,
      subject: `[${copy.label}] ${name}`,
      fromName: "Toolzum Contact",
      text: `From: ${name} <${email}>\nCategory: ${copy.label}\n\n${message}`,
      html: renderEmail({
        heading: `New message: ${copy.label}`,
        greeting: `A new message just landed from ${name} — reply to this email to reach them directly.`,
        paragraphs: message
          .split(/\n+/)
          .map((l) => l.trim())
          .filter(Boolean),
        details: [
          { label: "From", value: `${name} <${email}>` },
          { label: "Category", value: copy.label },
        ],
        note: "Reply directly to this email to answer — the sender's address is set as Reply-To.",
      }),
      replyTo: email,
    }
  );

  if (!sent) {
    return json({ error: "email_failed", to }, 502);
  }

  // Branded receipt to the sender. Best-effort: the relay above is what gates
  // success, so a failed acknowledgment never fails the user's submission.
  await sendEmail(
    context.env,
    {
      to: email,
      subject: copy.ackHeading,
      fromName: "Toolzum Support",
      text: [
        copy.ackGreeting,
        ``,
        copy.ackBody,
        ``,
        `Open Toolzum: https://toolzum.com/tools`,
        ``,
        `Reply to this email to continue the conversation — we answer from contact@toolzum.com.`,
      ].join("\n"),
      html: renderEmail({
        heading: copy.ackHeading,
        greeting: copy.ackGreeting,
        paragraphs: [copy.ackBody],
        details: [
          { label: "Your category", value: copy.label },
          { label: "Sent to", value: "contact@toolzum.com" },
        ],
        cta: { label: "Open Toolzum", url: "https://toolzum.com/tools" },
        note: "Reply to this email anytime — it reaches the same inbox.",
      }),
    }
  );

  return json({ ok: true });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
