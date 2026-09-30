/**
 * verify-out.ts — build-output crawl gate (closes scorecard gap #10: nothing
 * ever crawled the 2,565 emitted pages). Run AFTER `next build`:
 *
 *   npx tsx scripts/verify-out.ts     (wired into CI build job + npm run verify:out)
 *
 * Walks every URL in out/sitemap.xml and fails the build on structural rot:
 *   1. the page file is emitted (no soft-404s),
 *   2. <title> present, canonical == the sitemap URL (self-canonical),
 *   3. exactly one <h1>,
 *   4. ≥1 JSON-LD block, all blocks parse,
 *   5. og:image present (tool pages + home) and the file exists in out/,
 *   6. tool pages carry SoftwareApplication + FAQPage schema whose questions
 *      AND answers are actually visible on the page (JSON-LD ↔ DOM match —
 *      the check no pre-build unit test can make for all 1,000+ pages).
 *
 * Answer/entity matching: HTML entities are decoded on the DOM side only —
 * registry answers may legitimately contain pre-escaped text like `&amp;`,
 * which reaches JSON-LD raw but the DOM double-escapes. Soft issues
 * (long titles, short answers) print as warnings, never fail.
 */
import fs from "node:fs";
import path from "node:path";

const ORIGIN = "https://toolzum.com";
/** Two-segment sections whose pages are not tool pages (no FAQ schema expected). */
const NON_TOOL_SECTIONS = new Set(["blog"]);
const TITLE_MIN = 10;
const TITLE_WARN = 70;
const ANSWER_WARN = 40;
const MIN_URLS = 1000;

interface Issue {
  page: string;
  kind: string;
  detail: string;
}

/** Single-pass decode; &amp; LAST so `&amp;lt;` does not double-decode. */
function decodeEntities(s: string): string {
  return s
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

const norm = (s: string): string => s.replace(/\s+/g, " ").trim();
const normUrl = (s: string): string => s.replace(/\/$/, "");

/** Page text with <script>/<style> removed (JSON-LD must not self-match), tags stripped. */
function visibleText(html: string): string {
  let x = html.replace(/<script[\s\S]*?<\/script>/g, " ");
  x = x.replace(/<style[\s\S]*?<\/style>/g, " ");
  x = x.replace(/<[^>]+>/g, " ");
  return norm(decodeEntities(x));
}

function jsonLdBlocks(html: string): { raw: string[]; parsed: unknown[]; bad: string[] } {
  const raw = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (m) => m[1] ?? ""
  );
  const parsed: unknown[] = [];
  const bad: string[] = [];
  for (const r of raw) {
    try {
      parsed.push(JSON.parse(r));
    } catch (e) {
      bad.push(e instanceof Error ? e.message : String(e));
    }
  }
  return { raw, parsed, bad };
}

function flatten(parsed: unknown[]): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  for (const p of parsed) {
    if (Array.isArray(p)) out.push(...(p as Record<string, unknown>[]));
    else if (p && typeof p === "object") out.push(p as Record<string, unknown>);
  }
  return out;
}

export function crawlOut(outDir = "out"): { urls: number; issues: Issue[]; warnings: string[] } {
  const sitemapPath = path.join(outDir, "sitemap.xml");
  const xml = fs.readFileSync(sitemapPath, "utf8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1] ?? "")
    .filter(Boolean);
  const issues: Issue[] = [];
  const warnings: string[] = [];

  if (locs.length < MIN_URLS) {
    issues.push({ page: "sitemap.xml", kind: "sitemap-thin", detail: `only ${locs.length} URLs (expected ≥ ${MIN_URLS})` });
  }

  for (const loc of locs) {
    let url: URL;
    try {
      url = new URL(loc);
    } catch {
      issues.push({ page: loc, kind: "bad-loc", detail: "not a URL" });
      continue;
    }
    if (url.origin !== ORIGIN) {
      issues.push({ page: loc, kind: "cross-origin-loc", detail: loc });
      continue;
    }
    const segs = url.pathname.split("/").filter(Boolean);
    const file = segs.length === 0 ? path.join(outDir, "index.html") : path.join(outDir, ...segs, "index.html");
    if (!fs.existsSync(file)) {
      issues.push({ page: loc, kind: "missing-page", detail: path.relative(outDir, file) });
      continue;
    }
    const html = fs.readFileSync(file, "utf8");
    const rel = segs.join("/") || "(home)";

    // 2. title + canonical
    const title = (html.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? "";
    if (title.length < TITLE_MIN) issues.push({ page: loc, kind: "missing-title", detail: title });
    else if (title.length > TITLE_WARN) warnings.push(`${rel}: title ${title.length} chars (> ${TITLE_WARN}): ${title}`);
    const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) ?? [])[1];
    if (!canonical) issues.push({ page: loc, kind: "no-canonical", detail: "" });
    else if (normUrl(canonical) !== normUrl(loc)) issues.push({ page: loc, kind: "canonical-mismatch", detail: `${canonical} != ${loc}` });

    // 3. exactly one h1
    const h1s = (html.match(/<h1[ >]/g) ?? []).length;
    if (h1s !== 1) issues.push({ page: loc, kind: "h1-count", detail: `${h1s} h1 elements` });

    // 4. JSON-LD parses
    const { parsed, bad } = jsonLdBlocks(html);
    if (parsed.length === 0 && bad.length === 0) issues.push({ page: loc, kind: "no-json-ld", detail: "" });
    for (const b of bad) issues.push({ page: loc, kind: "json-ld-parse", detail: b });

    // 5. og:image present (tool pages + home) and the file exists
    const ogRaw = (html.match(/property="og:image" content="([^"]*)"/) ?? [])[1];
    const isHome = segs.length === 0;
    const isTool = segs.length === 2 && !NON_TOOL_SECTIONS.has(segs[0] ?? "");
    if (!ogRaw) {
      if (isHome || isTool) issues.push({ page: loc, kind: "missing-og-image", detail: "" });
    } else {
      try {
        const ogPath = decodeURIComponent(new URL(decodeEntities(ogRaw)).pathname);
        if (!fs.existsSync(path.join(outDir, ogPath))) {
          issues.push({ page: loc, kind: "og-image-404", detail: ogPath });
        }
      } catch {
        issues.push({ page: loc, kind: "og-image-unparseable", detail: ogRaw });
      }
    }

    // 6. tool pages: schema shape + JSON-LD ↔ visible DOM
    if (!isTool) continue;
    const entities = flatten(parsed);
    const faq = entities.find((e) => e["@type"] === "FAQPage");
    const sa = entities.find((e) => e["@type"] === "SoftwareApplication");
    if (!sa) issues.push({ page: loc, kind: "tool-missing-software-app", detail: "" });
    else {
      if (typeof sa.name !== "string" || !sa.name.trim()) issues.push({ page: loc, kind: "sa-missing-name", detail: "" });
      if (typeof sa.description !== "string" || sa.description.trim().length < 20) issues.push({ page: loc, kind: "sa-thin-description", detail: "" });
      if (!sa.offers || typeof sa.offers !== "object") issues.push({ page: loc, kind: "sa-missing-offers", detail: "" });
    }
    if (!faq) {
      issues.push({ page: loc, kind: "tool-missing-faq", detail: "" });
      continue;
    }
    const main = faq.mainEntity;
    if (!Array.isArray(main) || main.length === 0) {
      issues.push({ page: loc, kind: "faq-empty", detail: "" });
      continue;
    }
    const text = visibleText(html);
    for (const q of main as Record<string, unknown>[]) {
      const name = typeof q.name === "string" ? norm(q.name) : "";
      const answerRaw = (q.acceptedAnswer as Record<string, unknown> | undefined)?.text;
      const answer = typeof answerRaw === "string" ? norm(answerRaw) : "";
      const label = name.slice(0, 60) || "(unnamed)";
      if (name.length < 10) issues.push({ page: loc, kind: "faq-thin-question", detail: label });
      if (!answer) issues.push({ page: loc, kind: "faq-missing-answer", detail: label });
      else if (answer.length < ANSWER_WARN) warnings.push(`${rel}: FAQ answer ${answer.length} chars (< ${ANSWER_WARN}): ${label}`);
      // DOM side decoded, JSON side raw (pre-escaped registry data is legal).
      if (name && !text.includes(name)) issues.push({ page: loc, kind: "faq-question-not-visible", detail: label });
      if (answer && !text.includes(answer)) issues.push({ page: loc, kind: "faq-answer-not-visible", detail: `${label} :: ${answer.slice(0, 60)}` });
    }
  }

  return { urls: locs.length, issues, warnings };
}

const { urls, issues, warnings } = crawlOut(process.env.OG_OUT_DIR || "out");
if (warnings.length > 0) {
  console.log(`verify-out: ${warnings.length} warning(s)`);
  for (const w of warnings.slice(0, 20)) console.log(`  ⚠ ${w}`);
}
if (issues.length > 0) {
  const byKind = new Map<string, number>();
  for (const i of issues) byKind.set(i.kind, (byKind.get(i.kind) ?? 0) + 1);
  console.error(`\nverify-out: ${issues.length} issue(s) across ${urls} sitemap URLs`);
  for (const [kind, n] of [...byKind].sort((a, b) => b[1] - a[1])) console.error(`  ${n}× ${kind}`);
  for (const i of issues.slice(0, 40)) console.error(`  ✖ ${i.page} [${i.kind}] ${i.detail}`);
  if (issues.length > 40) console.error(`  … ${issues.length - 40} more`);
  process.exit(1);
}
console.log(`verify-out: ${urls} sitemap URLs OK (titles, canonicals, h1s, JSON-LD, og:images, tool FAQ↔DOM)`);
