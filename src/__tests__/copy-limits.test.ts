import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Stale limit copy guard (Oct 2026 generous-limits migration). Every string
 * below was live copy that contradicted the single source of truth
 * (planTiers CATEGORY_CAPS + downloadLimit). If one reappears — in UI,
 * registry FAQs, SEO templates, or emails — this fails. Add new entries
 * here whenever a limit number changes, with the replacement beside it.
 */
const STALE_STRINGS: [string, string][] = [
  // Quota era (unlimited local downloads since Oct 2026)
  ["3/day free", "unlimited local downloads"],
  ["3 downloads/day", "unlimited local downloads"],
  ["5/day + 5 trial", "unlimited local + 5 trial credits"],
  ["unlock 5/day", "unlimited local"],
  ["You've used your 3 free downloads", "Free download paused"],
  ["5 downloads/day", "unlimited local downloads"],
  ["Daily download limit reached", "Daily Pro-tool taste used"],
  // Batch tiers (5 / 25 / 500 since Oct 2026)
  ["Guests process 1 file at a time", "Guests batch up to 5 files"],
  ["Continue with 1 file at a time", "Continue with fewer files"],
  ["10 files/batch", "25 files/batch"],
  ["up to 10 files", "up to 25 files"],
  ["10-file batches", "25-file batches"],
  ["1 / 10 files", "5 / 25 files"],
  ["1 file / 30MB", "generous ceilings"],
  // Size caps (category ceilings since Oct 2026)
  ["30MB guest / 150MB", "category ceilings"],
  ["30MB as guest, 150MB signed in", "category ceilings"],
  ["10-30MB", "per-type ceilings"],
  ["20-150MB", "per-type ceilings"],
  ["Max 20MB per image", "Max 50MB per image"],
  ["up to 20MB per image", "up to 50MB per image"],
  ["30 MB guests, 100 MB signed in", "125MB free"],
];

const SCAN_DIRS = ["src/components", "src/app", "src/registry", "src/lib", "src/utils", "src/hooks", "functions/api"];
const SKIP = [".test.", "__tests__", ".map"];

function* walk(dir: string): Generator<string> {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules") continue;
      yield* walk(fp);
    } else if (/\.(ts|tsx)$/.test(e.name) && !SKIP.some((s) => fp.includes(s))) {
      yield fp;
    }
  }
}

describe("stale limit copy never returns", () => {
  it("no retired limit string survives anywhere user-facing", () => {
    const hits: string[] = [];
    for (const dir of SCAN_DIRS) {
      const root = path.join(process.cwd(), dir);
      if (!fs.existsSync(root)) continue;
      for (const fp of walk(root)) {
        const text = fs.readFileSync(fp, "utf8");
        for (const [stale] of STALE_STRINGS) {
          if (text.includes(stale)) hits.push(`${path.relative(process.cwd(), fp)}: ${stale}`);
        }
      }
    }
    expect(hits, hits.join("\n")).toEqual([]);
  });
});
