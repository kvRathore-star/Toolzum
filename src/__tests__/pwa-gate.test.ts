import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { clientToolsRegistry } from "@/registry/tools-client-index";

/**
 * PWA ship-gate (#10). Offline support rots silently: the fallback page,
 * the SW rewrite that serves it, and the manifest shortcuts all have to
 * agree, or "offline" means the browser error screen and shortcuts 404.
 */
const ROOT = process.cwd();

function categorySlug(category: string): string {
  if (category === "Growth & Marketing") return "growth-metrics";
  return category.toLowerCase().replace(/\s+/g, "-");
}

describe("PWA offline + install contract (#10)", () => {
  it("ships a standalone offline fallback page", () => {
    const html = fs.readFileSync(path.join(ROOT, "public/offline.html"), "utf8");
    // No Next.js runtime dependency — must render with zero JS/CSS.
    expect(html.includes("_next/")).toBe(false);
    expect(html.includes("safe-area-inset")).toBe(true);
    for (const href of ["/", "/tools/", "/pdf/pdf-compressor/"]) {
      expect(html.includes(`href="${href}"`)).toBe(true);
    }
  });

  it("service worker serves the fallback for navigations (never for APIs)", () => {
    const sw = fs.readFileSync(path.join(ROOT, "scripts/gen-sw.js"), "utf8");
    expect(sw.includes("navigateFallback")).toBe(true);
    expect(sw.includes("offline.html")).toBe(true);
    expect(sw.includes("navigateFallbackDenylist")).toBe(true);
    expect(sw.includes("/api/")).toBe(true);
  });

  it("manifest is installable with working shortcuts", () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(ROOT, "public/manifest.json"), "utf8"),
    ) as {
      id?: string;
      icons: { src: string; sizes: string }[];
      shortcuts: { url: string }[];
    };
    expect(manifest.id).toBe("/");
    expect(
      manifest.icons.some((i) => i.sizes.includes("512")),
      "512px icon required for installability",
    ).toBe(true);
    expect(manifest.shortcuts.length).toBeGreaterThan(0);
    const bySlug = new Map(clientToolsRegistry.map((t) => [t.slug, t]));
    const bad: string[] = [];
    for (const s of manifest.shortcuts) {
      const m = s.url.match(/^\/([^/]+)\/([^/]+)\/?$/);
      const tool = m ? bySlug.get(m[2]!) : undefined;
      if (!tool || categorySlug(tool.category) !== m![1]) bad.push(s.url);
    }
    expect(bad, "manifest shortcuts must resolve to real tools").toEqual([]);
  });
});
