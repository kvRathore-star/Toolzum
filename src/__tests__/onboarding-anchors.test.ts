import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Onboarding tour anchor gate (#32). Tour steps anchor to live header
 * elements by selector — a header rename silently orphans the step
 * (the card still shows, just unanchored). Every selector in STEPS must
 * resolve against Header source.
 */
const ROOT = process.cwd();

function tourAnchors(): string[] {
  const src = fs.readFileSync(
    path.join(ROOT, "src/components/OnboardingTour.tsx"),
    "utf8",
  );
  // STEPS block only — the dialog's own aria-label={`...`} template
  // below would otherwise match the anchor pattern. Anchors are
  // single-quoted (they contain double quotes), so match those.
  const block = src.match(/const STEPS[\s\S]*?];/)?.[0] ?? "";
  return [...block.matchAll(/anchor:\s*'([^']+)'/g)].map((m) => m[1]!);
}

describe("onboarding tour anchors (#32)", () => {
  it("every step anchor resolves in the live header", () => {
    const header = fs.readFileSync(
      path.join(ROOT, "src/components/Header.tsx"),
      "utf8",
    );
    const missing = tourAnchors().filter((sel) => {
      const aria = sel.match(/\[aria-label="([^"]+)"\]/);
      if (aria) return !header.includes(`aria-label="${aria[1]}"`);
      if (sel === "header nav") return !header.includes("<nav");
      // Unknown selector shape: fail loud so the gate learns it.
      return true;
    });
    expect(missing, "tour anchors missing from Header").toEqual([]);
    expect(tourAnchors().length).toBeGreaterThan(0);
  });

  it("documents mobile-hidden anchors in code (zero-rect fallback)", () => {
    // `header nav` is display:none on mobile — the component must keep
    // its zero-rect guard, or the card pins to the corner. This asserts
    // the guard survives refactors.
    const src = fs.readFileSync(
      path.join(ROOT, "src/components/OnboardingTour.tsx"),
      "utf8",
    );
    expect(src.includes("width === 0")).toBe(true);
  });
});
