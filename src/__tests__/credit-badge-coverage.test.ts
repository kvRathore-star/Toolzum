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
 * - files calling submitTranscription or /api/ai/transcribe → cost 10
 * - files calling useAiProvider or /api/ai/generate → cost 1
 * - files calling ONLY /api/ai/generate-image (engine-dependent cost,
 *   shown inline per engine) → must NOT be in the map
 */
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

describe("credit badge completeness (no silent deductions)", () => {
  const map = badgeMap();
  const spenders: { slug: string; expected: number; file: string }[] = [];
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
    spenders.push({
      slug,
      expected: usesTranscribe ? 10 : 1,
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

  it("keeps engine-dependent tools out of the flat map (cost shown inline)", () => {
    expect(
      imageOnly.filter((slug) => slug in map),
      "engine-dependent tools must not carry a flat per-use badge",
    ).toEqual([]);
    expect(imageOnly).toContain("ai-image-generator");
  });

  it("maps at least the known 18 deducting slugs", () => {
    expect(Object.keys(map).length).toBeGreaterThanOrEqual(18);
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
