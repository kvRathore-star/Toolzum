import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Beta-label guard (Oct 2026). The release gate in docs/TODO-TRACKER.md
 * says the pdf-editor keeps a beta label until the manual checklist +
 * sign-off pass — but the label had no implementation, so "keep the beta
 * on" was unenforceable. These assertions make removal deliberate:
 * deleting the slug from BETA_SLUGS fails the first test below.
 */
const ROOT = process.cwd();
const layoutPath = path.join(ROOT, "src/components/tools/ToolLayout.tsx");
const layout = fs.readFileSync(layoutPath, "utf8");

describe("beta chip: pdf-editor ships visibly marked", () => {
  it("pdf-editor is listed in BETA_SLUGS", () => {
    const m = layout.match(/const BETA_SLUGS = new Set\(\[([^\]]*)\]\)/);
    expect(m, "BETA_SLUGS declaration missing from ToolLayout.tsx").toBeTruthy();
    expect(m![1]).toContain("'pdf-editor'");
  });

  it("chip renders inside the h1, gated on the slug", () => {
    const h1 = layout.match(/<h1[\s\S]*?<\/h1>/);
    expect(h1, "h1 not found in ToolLayout.tsx").toBeTruthy();
    expect(h1![0]).toContain("BETA_SLUGS.has(slug)");
    expect(h1![0]).toMatch(/>[\s]*Beta[\s]*</);
  });

  it("chip carries a visible tooltip explaining beta status", () => {
    const h1 = layout.match(/<h1[\s\S]*?<\/h1>/);
    expect(h1![0]).toMatch(/title="Beta:[^"]+"/);
  });
});
