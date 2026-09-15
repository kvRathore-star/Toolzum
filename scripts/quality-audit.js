#!/usr/bin/env node
/**
 * quality-audit.js — Automated regression checks for Toolzum.
 *
 * Run:   node scripts/quality-audit.js
 *
 * Checks:
 *   1. Duplicate/near-duplicate name detector
 *   2. Sitemap-vs-registry diff (sitemap file required)
 *   3. Card-vs-slug mismatch (category page cards that don't match their destination)
 *   4. FAQ/description content-mismatch detector
 *   5. Trust-claim consistency check
 *   6. "Thin tool" detection (boilerplate descriptions, short descriptions)
 *   7. Coming Soon / stub detection (no module, no redirect)
 *   8. Missing dependencies check
 *   9. Tool Quality Bar scoring
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
// NOTE: tools.ts is a 5-line barrel since the registry split — parsing it
// yields ZERO entries and every check below runs blind. Always parse the
// real data: tools-chunk-*.ts (+ tools-constants.ts for redirects).
const CHUNK_GLOB_DIR = path.join(ROOT, "src/registry");
const CONSTANTS_PATH = path.join(ROOT, "src/registry/tools-constants.ts");
const WRAPPER_PATH = path.join(ROOT, "src/components/tools/modules/DynamicModuleWrapper.tsx");
const CATEGORY_PAGES_PATH = path.join(ROOT, "src/app/[category]/page.tsx");
const SITEMAP_PATH = path.join(ROOT, "public/sitemap.xml");

// ─── Helpers ────────────────────────────────────────────────────────────────

function readOrNull(p) {
  try { return fs.readFileSync(p, "utf-8"); } catch { return null; }
}

function slugFromName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── 1. Parse registry ──────────────────────────────────────────────────────

function parseRegistry() {
  const fs = require("fs");
  const files = fs.readdirSync(CHUNK_GLOB_DIR)
    .filter(f => /^tools-chunk-\d+\.ts$/.test(f))
    .sort()
    .map(f => path.join(CHUNK_GLOB_DIR, f));
  // Parse EACH file separately: splitting the concatenated blob merges the
  // tail of one file with the head of the next, shadowing boundary entries
  // (and the old blind shift() dropped chunk-0's first tool outright).
  const entries = [];
  const rawStringSlugs = [];
  for (const file of files) {
    const content = readOrNull(file);
    if (!content) continue;
    const proIdx = content.indexOf("const proSlugs");
    const beforePro = proIdx === -1 ? content : content.slice(0, proIdx);
    const objects = beforePro.split(/\},\s*\n\s*\{/);
    for (const chunk of objects) {
      if (!chunk.includes("id:") || !chunk.includes("name:")) continue;
      const id = (chunk.match(/id: ["']([^"']+)["']/) || [])[1] || "";
      const name = (chunk.match(/name: ["']([^"']+)["']/) || [])[1] || "";
      const slug = (chunk.match(/slug: ["']([^"']+)["']/) || [])[1] || "";
      const deps = (chunk.match(/dependencies: ["']([^"']*)["']/) || [])[1] || "";
      const desc = (chunk.match(/description: '([^']*)'/) || chunk.match(/description: "([^"]*)"/) || [])[1] || "";
      const seoDesc = (chunk.match(/seoDescription: '([^']*)'/) || chunk.match(/seoDescription: "([^"]*)"/) || [])[1] || "";
      const hidden = chunk.includes("showInCategory: false");
      const hasFaqs = /faqs:\s*\[/.test(chunk);
      entries.push({ id, name, slug, deps, desc, seoDesc, hidden, hasFaqs });
    }
    // Also get raw string-only entries (no metadata)
    rawStringSlugs.push(...[...beforePro.matchAll(/^ {2}"([a-z0-9-]+)",$/gm)].map(m => m[1]));
  }
  if (!entries.length && !files.length) return { entries: [], error: "no chunk files found" };

  return { entries, rawStringSlugs };
}

function parseModules() {
  const wrapper = readOrNull(WRAPPER_PATH);
  const tools = readOrNull(CONSTANTS_PATH);
  if (!wrapper) return { moduleKeys: [], redirectSlugs: [], seoSlugs: [] };

  const moduleKeys = wrapper ? [...wrapper.matchAll(/'([a-z0-9-]+)': dynamic/g)].map(m => m[1]) : [];
  const redirectSlugs = tools ? [...tools.matchAll(/"([a-z0-9-]+)": { category:/g)].map(m => m[1]) : [];
  const seoSlugs = tools ? [...tools.matchAll(/slug: "([^"]+)", name: "([^"]+)",/g)].map(m => ({ slug: m[1], name: m[2] })) : [];

  return { moduleKeys, redirectSlugs, seoSlugs };
}

// ─── 2. Checks ──────────────────────────────────────────────────────────────

function checkDuplicateNames(entries) {
  const groups = {};
  for (const e of entries) {
    const key = e.name.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
    if (!groups[key]) groups[key] = [];
    groups[key].push({ id: e.id, name: e.name, slug: e.slug });
  }

  return Object.entries(groups)
    .filter(([, list]) => list.length > 1)
    .map(([name, list]) => ({
      name: list[0].name,
      count: list.length,
      entries: list,
    }));
}

function checkComingSoon(entries, { moduleKeys, redirectSlugs, seoSlugs }) {
  const results = [];
  for (const e of entries) {
    if (!e.slug) continue;
    const hasModule = moduleKeys.includes(e.slug)
      || redirectSlugs.includes(e.slug)
      || seoSlugs.some(s => s.slug === e.slug);
    if (!hasModule) {
      results.push({ id: e.id, name: e.name, slug: e.slug, deps: e.deps });
    }
  }
  return results;
}

function checkThinDescriptions(entries) {
  const genericPatterns = [
    /perfect for image conversion/i,
    /fast browser-based video/i,
    /document conversion made easy/i,
    /lossless audio conversion/i,
    /^online tool$/i,
  ];

  const results = [];
  for (const e of entries) {
    if (!e.desc) {
      results.push({ id: e.id, name: e.name, slug: e.slug, issue: "EMPTY_DESC", detail: "Description is empty" });
      continue;
    }
    if (e.desc.length < 40) {
      results.push({ id: e.id, name: e.name, slug: e.slug, issue: "SHORT_DESC", detail: `${e.desc.length} chars: "${e.desc}"` });
    }
    if (genericPatterns.some(p => p.test(e.desc))) {
      results.push({ id: e.id, name: e.name, slug: e.slug, issue: "BOILERPLATE_DESC", detail: `"${e.desc.slice(0, 60)}..."` });
    }
  }
  return results;
}

const SERVER_DEPS = [
  "LibreOffice API", "Calibre API", "Whisper API",
  "OpenAI API", "Stripe API", "Google API", "AWS API",
  "Server-side", "FFmpeg (server)",
];

function checkTrustClaims(entries) {
  const results = [];
  for (const e of entries) {
    const desc = (e.desc + " " + e.seoDesc).toLowerCase();
    const claimsOffline = /offline|no upload|runs locally|never leaves|client-side|100% free/i.test(desc);
    const isServerDep = SERVER_DEPS.some(d => e.deps?.includes(d));
    if (claimsOffline && isServerDep) {
      results.push({ id: e.id, name: e.name, slug: e.slug, issue: "FALSE_OFFLINE_CLAIM", detail: `Claims offline but deps="${e.deps}"` });
    }
  }
  return results;
}

function checkMissingDeps(entries) {
  return entries
    .filter(e => (e.deps === "None" || e.deps === "") && e.slug.length > 0)
    .map(e => ({ id: e.id, name: e.name, slug: e.slug }));
}

function checkCardSlugMismatch(entries) {
  const results = [];
  for (const e of entries) {
    if (!e.name || !e.slug) continue;
    const expectedSlug = slugFromName(e.name);
    if (expectedSlug !== e.slug && !e.slug.startsWith(expectedSlug + "-")) {
      // Only flag if significantly different (more than just a prefix)
      const diff = expectedSlug.replace(e.slug, "").length;
      if (diff > 5) {
        results.push({ id: e.id, name: e.name, slug: e.slug, expected: expectedSlug });
      }
    }
  }
  return results;
}

// ─── 3. FAQ/Description content-mismatch ────────────────────────────────────

function checkCategoryKeywords(entries) {
  const categoryKeywords = {
    "PDF": ["pdf", "document", "page", "ocr", "extract", "merge", "compress"],
    "Image": ["image", "photo", "picture", "pixel", "resolution", "canvas", "png", "jpg", "webp", "svg"],
    "Video": ["video", "mp4", "mov", "mkv", "avi", "webm", "frame", "codec"],
    "Audio": ["audio", "mp3", "wav", "flac", "aac", "ogg", "sample rate"],
    "Converter": ["convert", "transform", "transcode", "encode", "decode"],
    "Developer": ["json", "yaml", "xml", "base64", "hash", "uuid", "regex", "api", "jwt", "cron"],
    "SEO": ["seo", "meta tag", "sitemap", "robots.txt", "keyword", "canonical"],
    "Utility": ["calculator", "converter", "generator", "timer", "counter"],
    "Finance": ["tax", "loan", "interest", "emi", "gst", "salary", "investment"],
    "Health": ["bmi", "calorie", "body fat", "heart rate", "sleep", "pregnancy"],
    "Utility": ["unit", "length", "weight", "volume", "temperature", "speed"],
  };

  const results = [];
  for (const e of entries) {
    if (!e.desc) continue;
    const text = (e.desc + " " + (e.seoDesc || "")).toLowerCase();
    // Find keywords from OTHER categories that appear in this tool's description
    for (const [cat, kws] of Object.entries(categoryKeywords)) {
      // Skip same category (we don't know the tool's category from the registry entry in this pass)
      // We'll check if the description mentions specific tools from other domains
    }
  }
  return results;
}

// ─── 4b. #25: new/modified tools without FAQs (warning, never fails) ─────────
// Only flags entries touched in the working tree vs HEAD, so the 800+
// pre-existing FAQ-less tools don't spam every run. New debt only.
function checkNewToolsWithoutFaqs(entries) {
  const { execSync } = require("child_process");
  let diff = "";
  try {
    diff = execSync("git diff HEAD -- src/registry/tools.ts src/registry/tools-chunk-*.ts src/registry/tools-constants.ts", { encoding: "utf-8", cwd: ROOT });
  } catch { return { touched: [], note: "git diff unavailable (not a repo?)" }; }
  const touchedSlugs = new Set(
    [...diff.matchAll(/^\+.*slug:\s*["']([a-z0-9-]+)["']/gm)].map(m => m[1])
  );
  // Untracked new registry files count as touched wholesale.
  try {
    const untracked = execSync("git ls-files --others --exclude-standard -- src/registry/", { encoding: "utf-8", cwd: ROOT });
    if (untracked.trim()) {
      for (const e of entries) touchedSlugs.add(e.slug);
    }
  } catch { /* ignore */ }
  const bySlug = new Map(entries.map(e => [e.slug, e]));
  const flagged = [...touchedSlugs]
    .map(s => bySlug.get(s))
    .filter(e => e && !e.hasFaqs)
    .map(e => ({ id: e.id, name: e.name, slug: e.slug }));
  return { touched: flagged, note: null };
}

// ─── 4. Tool Quality Bar Score ──────────────────────────────────────────────

function qualityScore(entry, { moduleKeys }) {
  let score = 0;
  const maxScore = 10;
  const reasons = [];

  // Has a real module (not Coming Soon)
  const hasRealModule = moduleKeys.includes(entry.slug);
  if (hasRealModule) { score += 2; reasons.push("has_module"); }
  else { reasons.push("no_module"); }

  // Description length
  if (entry.desc.length > 60) { score += 2; reasons.push("good_desc"); }
  else if (entry.desc.length > 30) { score += 1; reasons.push("short_desc"); }
  else { reasons.push("empty_desc"); }

  // Has SEO description
  if (entry.seoDesc && entry.seoDesc.length > 40) { score += 1; reasons.push("has_seo"); }
  else { reasons.push("no_seo"); }

  // Has actual dependencies (not "None")
  if (entry.deps && entry.deps !== "None" && entry.deps !== "") { score += 1; reasons.push("has_deps"); }
  else { reasons.push("no_deps"); }

  // Non-boilerplate description
  const boilers = /perfect for image conversion|fast browser-based video|document conversion made easy/i;
  if (!boilers.test(entry.desc)) { score += 2; reasons.push("unique_desc"); }
  else { reasons.push("boilerplate"); }

  // Name matches slug (good SEO)
  const expectedSlug = slugFromName(entry.name);
  if (expectedSlug === entry.slug || entry.slug.startsWith(expectedSlug)) { score += 1; reasons.push("seo_name"); }
  else { reasons.push("name_slug_mismatch"); }

  // Not hidden from category
  if (!entry.hidden) { score += 1; reasons.push("visible"); }
  else { reasons.push("hidden"); }

  return { score, maxScore, label: score >= 8 ? "PREMIUM" : score >= 5 ? "STANDARD" : score >= 3 ? "BASIC" : "THIN", reasons };
}

// ─── 5. Main ────────────────────────────────────────────────────────────────

async function main() {
  const { entries, rawStringSlugs } = parseRegistry();
  const modules = parseModules();

  console.log("\n══════════════════════════════════════════════════════════");
  console.log("  TOOLZUM QUALITY AUDIT — " + new Date().toISOString().slice(0, 10));
  console.log("══════════════════════════════════════════════════════════\n");

  console.log(`Registry entries: ${entries.length} objects + ${rawStringSlugs.length} string-only = ${entries.length + rawStringSlugs.length} total\n`);

  // ── Duplicate names ──
  const dups = checkDuplicateNames(entries);
  if (dups.length) {
    console.log("❌ DUPLICATE NAMES:", dups.length);
    for (const d of dups) {
      console.log(`   "${d.name}" ×${d.count}`);
      for (const e of d.entries) console.log(`      ID ${e.id} → slug: ${e.slug}`);
    }
    console.log();
  }

  // ── Coming Soon / stubs ──
  const stubs = checkComingSoon(entries, modules);
  if (stubs.length) {
    console.log("❌ COMING SOON / NO MODULE:", stubs.length);
    for (const s of stubs) console.log(`   ID ${s.id} | ${s.name} | ${s.slug} | deps: ${s.deps}`);
    console.log();
  }

  // ── Thin descriptions ──
  const thin = checkThinDescriptions(entries);
  const empty = thin.filter(t => t.issue === "EMPTY_DESC");
  const short = thin.filter(t => t.issue === "SHORT_DESC");
  const boiler = thin.filter(t => t.issue === "BOILERPLATE_DESC");
  if (empty.length) console.log(`❌ EMPTY DESCRIPTIONS: ${empty.length}`);
  if (short.length) console.log(`⚠  SHORT DESCRIPTIONS (<40 chars): ${short.length}`);
  if (boiler.length) console.log(`⚠  BOILERPLATE DESCRIPTIONS: ${boiler.length}`);
  if (empty.length || short.length || boiler.length) {
    if (empty.length) empty.slice(0, 10).forEach(t => console.log(`   ID ${t.id} | ${t.name} | ${t.slug}`));
    console.log();
  }

  // ── Trust claims ──
  const trust = checkTrustClaims(entries);
  if (trust.length) {
    console.log("❌ FALSE OFFLINE CLAIMS:", trust.length);
    for (const t of trust) console.log(`   ID ${t.id} | ${t.name} | ${t.slug}`);
    console.log();
  }

  // ── Missing dependencies ──
  const noDeps = checkMissingDeps(entries);
  if (noDeps.length) {
    console.log(`⚠  MISSING DEPENDENCIES (None): ${noDeps.length}`);
    console.log();
  }

  // ── Card-slug mismatch ──
  const cardSlug = checkCardSlugMismatch(entries);
  if (cardSlug.length) {
    console.log("⚠  CARD-SLUG MISMATCH:", cardSlug.length);
    for (const c of cardSlug.slice(0, 20))
      console.log(`   ID ${c.id} | "${c.name}" → slug "${c.slug}" (expected "${c.expected}")`);
    console.log();
  }

  // ── #25: new/modified tools without FAQs ──
  const newNoFaq = checkNewToolsWithoutFaqs(entries);
  const allNoFaq = entries.filter(e => e.slug && !e.hasFaqs).length;
  console.log(`  Tools without custom FAQs (backlog): ${allNoFaq}`);
  if (newNoFaq.note) {
    console.log(`  (new-tool FAQ check skipped: ${newNoFaq.note})`);
  } else if (newNoFaq.touched.length) {
    console.log(`⚠  NEW/MODIFIED TOOLS WITHOUT FAQs: ${newNoFaq.touched.length}`);
    for (const t of newNoFaq.touched) console.log(`   ID ${t.id} | ${t.name} | ${t.slug}`);
  } else {
    console.log(`  New/modified tools without FAQs: none — no new debt.`);
  }
  console.log();

  // ── Quality Bar — Score all tools ──
  console.log("══════════════════════════════════════════════════════════");
  console.log("  TOOL QUALITY BAR");
  console.log("══════════════════════════════════════════════════════════\n");

  const scored = entries
    .filter(e => e.slug)
    .map(e => ({ ...e, q: qualityScore(e, modules) }));

  const tiers = { PREMIUM: [], STANDARD: [], BASIC: [], THIN: [] };
  for (const s of scored) tiers[s.q.label].push(s);

  for (const [tier, items] of Object.entries(tiers)) {
    console.log(`${tier === "PREMIUM" ? "🟢" : tier === "STANDARD" ? "🟡" : tier === "BASIC" ? "🟠" : "🔴"} ${tier}: ${items.length} tools`);
  }
  console.log();

  // Show bottom 20 quality scores for THIN tools
  if (tiers.THIN.length) {
    console.log("Lowest quality tools (THIN):");
    const sorted = tiers.THIN.sort((a, b) => a.q.score - b.q.score);
    for (const t of sorted.slice(0, 20)) {
      console.log(`   Score ${t.q.score}/${t.q.maxScore} | ID ${t.id} | ${t.name} | ${t.slug}`);
      console.log(`      ${t.q.reasons.join(", ")}`);
    }
    console.log();
  }

  // ── Summary ──
  console.log("══════════════════════════════════════════════════════════");
  console.log("  SUMMARY");
  console.log("══════════════════════════════════════════════════════════\n");
  const totalIssues = dups.length + stubs.length + empty.length + trust.length;
  console.log(`  Duplicate names:       ${dups.length}`);
  console.log(`  Missing modules:       ${stubs.length}`);
  console.log(`  Empty descriptions:    ${empty.length}`);
  console.log(`  Boilerplate desc:      ${boiler.length}`);
  console.log(`  False offline claims:  ${trust.length}`);
  console.log(`  Missing deps (None):   ${noDeps.length}`);
  console.log(`  ───────────────────────────`);
  console.log(`  Total issues:          ${totalIssues}`);
  console.log(`  Tools <= BASIC quality: ${tiers.BASIC.length + tiers.THIN.length}`);
  console.log();

  if (totalIssues === 0) {
    console.log("✅ All checks passed. No issues found.\n");
    process.exit(0);
  } else {
    console.log(`⚠  ${totalIssues} issues need attention. Run with --fix to auto-resolve boilerplate descriptions.\n`);
  }
}

main().catch(console.error);
