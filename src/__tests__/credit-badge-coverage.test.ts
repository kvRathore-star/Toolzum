import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Credit-badge completeness guard (Sep 12 2026 — five tools deducted
 * silently until this test existed). Every tool module that spends server
 * AI credits must warn in ToolLayout's CREDIT_COST_SLUGS with the right
 * cost, or the deduction happens without user-visible warning.
 *
 * Rules:
 * - files calling submitTranscription or /api/ai/transcribe → cost 20
 * - files calling useAiProvider or /api/ai/generate → cost 1
 * - files calling ONLY /api/ai/generate-image (engine-dependent cost,
 *   shown inline per engine) → must NOT be in the map
 * - files where AI is OPTIONAL (free-first tool, AI behind an explicit
 *   button) → exempt from the flat map ONLY if the cost is disclosed
 *   inline next to the action AND the slug is listed in OPTIONAL_AI_SLUGS
 *   below. A flat page-level badge on a free tool would itself mislead
 *   (implies every use costs); per-button disclosure is more accurate.
 *   Both conditions are required so future tools can't slip through —
 *   they must be deliberately listed AND verifiably labeled.
 */
const OPTIONAL_AI_SLUGS = new Set([
  // pdf-editor: core editing free; Summarize/Fix-grammar buttons carry
  // "· 1 credit" labels + sign-in gate + post-use toast.
  'pdf-editor',
]);
const ROOT = process.cwd();
const MODULES = path.join(ROOT, "src/components/tools/modules");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(e.name)) out.push(full);
  }
  return out;
}

function slugForModule(relPath: string): string | null {
  const wrapper = fs.readFileSync(
    path.join(ROOT, "src/components/tools/modules/DynamicModuleWrapper.tsx"),
    "utf8",
  );
  const modPath = relPath.replace(/\.tsx?$/, "");
  for (const line of wrapper.split("\n")) {
    if (line.includes(modPath)) {
      const m = line.match(/'([\w-]+)'/);
      if (m) return m[1]!;
    }
  }
  return null;
}

function badgeMap(): Record<string, number> {
  const src = fs.readFileSync(
    path.join(ROOT, "src/components/tools/ToolLayout.tsx"),
    "utf8",
  );
  const body = src.match(/CREDIT_COST_SLUGS[^{]*\{([\s\S]*?)\};/)?.[1] ?? "";
  const map: Record<string, number> = {};
  for (const m of body.matchAll(/'([\w-]+)'\s*:\s*(\d+)/g)) {
    map[m[1]!] = Number(m[2]);
  }
  return map;
}

function perMinuteSet(): Set<string> {
  const src = fs.readFileSync(
    path.join(ROOT, "src/components/tools/ToolLayout.tsx"),
    "utf8",
  );
  const body = src.match(/PER_MINUTE_SLUGS\s*=\s*new Set\(\[([\s\S]*?)\]\)/)?.[1] ?? "";
  return new Set([...body.matchAll(/'([\w-]+)'/g)].map((m) => m[1]!));
}

describe("credit badge completeness (no silent deductions)", () => {
  const map = badgeMap();
  const perMinute = perMinuteSet();
  const spenders: { slug: string; expected: number; file: string }[] = [];
  const perMinuteSpenders: { slug: string; file: string }[] = [];
  const imageOnly: string[] = [];

  for (const full of walk(MODULES)) {
    const content = fs.readFileSync(full, "utf8");
    const rel = path.relative(MODULES, full);
    const usesTranscribe =
      content.includes("submitTranscription") || /\/api\/ai\/transcribe['"]/.test(content);
    const usesGenerate =
      /generateCompletion\s*\(/.test(content) || /\/api\/ai\/generate['"]/.test(content);
    // generateImage() = the engine-dependent image endpoint (cost varies by
    // engine, shown inline — must NOT get a flat badge).
    const usesImageGen =
      content.includes("/api/ai/generate-image") || /generateImage\s*\(/.test(content);
    if (!usesTranscribe && !usesGenerate && !usesImageGen) continue;
    const slug = slugForModule(rel);
    if (!slug) continue;
    if (usesImageGen && !usesTranscribe && !usesGenerate) {
      imageOnly.push(slug);
      continue;
    }
    // True audio uploads bill per minute (no flat number is honest) — they
    // must carry the per-minute badge instead of a flat per-use cost.
    if (usesTranscribe) {
      perMinuteSpenders.push({ slug, file: rel });
      continue;
    }
    // Optional-AI tools disclose per-button; the flat map would overclaim.
    if (OPTIONAL_AI_SLUGS.has(slug)) {
      if (!/1 credit/.test(content)) {
        throw new Error(`${slug} (${rel}): optional-AI exemption requires an inline "1 credit" disclosure`);
      }
      continue;
    }
    spenders.push({
      slug,
      expected: 1,
      file: rel,
    });
  }

  it("covers every server-AI spender with the right cost", () => {
    const missing = spenders.filter((s) => map[s.slug] !== s.expected);
    expect(
      missing.map((s) => `${s.slug}=${s.expected} (${s.file})`),
      "tools deducting without a matching badge",
    ).toEqual([]);
  });

  it("covers every per-minute transcribe spender with the per-minute badge", () => {
    const missing = perMinuteSpenders.filter((s) => !perMinute.has(s.slug));
    expect(
      missing.map((s) => `${s.slug} (${s.file})`),
      "transcribe tools must carry the per-minute badge, never a flat cost",
    ).toEqual([]);
    const flatLeak = perMinuteSpenders.filter((s) => s.slug in map);
    expect(
      flatLeak.map((s) => s.slug),
      "transcribe tools must not also carry a flat per-use badge",
    ).toEqual([]);
  });

  it("keeps engine-dependent tools out of the flat map (cost shown inline)", () => {
    expect(
      imageOnly.filter((slug) => slug in map),
      "engine-dependent tools must not carry a flat per-use badge",
    ).toEqual([]);
    expect(imageOnly).toContain("ai-image-generator");
  });

  it("maps at least the known deducting slugs (flat + per-minute)", () => {
    expect(Object.keys(map).length).toBeGreaterThanOrEqual(16);
    expect(perMinute.size).toBeGreaterThanOrEqual(2);
    expect(Object.keys(map).length + perMinute.size).toBeGreaterThanOrEqual(18);
  });

  it("has no duplicate slug keys (later entries silently shadow earlier ones)", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "src/components/tools/ToolLayout.tsx"),
      "utf8",
    );
    const body = src.match(/CREDIT_COST_SLUGS[^{]*\{([\s\S]*?)\};/)?.[1] ?? "";
    const keys = [...body.matchAll(/'([\w-]+)'\s*:/g)].map((m) => m[1]);
    expect(keys.length).toBe(new Set(keys).size);
  });
});
