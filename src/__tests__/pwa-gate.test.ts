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
    const src = fs.readFileSync(path.join(ROOT, "scripts/sw-source.js"), "utf8");
    const gen = fs.readFileSync(path.join(ROOT, "scripts/gen-sw.js"), "utf8");
    // Canonical /offline: /offline.html 308-redirects on Pages pretty URLs
    // and a redirected precache-put throws — the fallback must be the 200 URL.
    expect(src.includes("createHandlerBoundToURL('/offline')")).toBe(true);
    // Fallback is a *catch* handler guarded to navigations: a route that
    // intercepts navigations first (workbox navigateFallback's
    // NavigationRoute) serves /offline even while online — never again.
    expect(src.includes("setCatchHandler")).toBe(true);
    expect(src.includes("request.mode === 'navigate'")).toBe(true);
    expect(src.includes("new NavigationRoute")).toBe(false);
    // APIs must fail honestly — never HTML: excluded from the fallback,
    // same-origin API path kept in the route set.
    expect(src.includes("Response.error()")).toBe(true);
    expect(src.includes("/api/")).toBe(true);
    expect(gen.includes("additionalManifestEntries")).toBe(true);
  });

  it("precache install cannot hang forever on a stalled fetch", () => {
    const src = fs.readFileSync(path.join(ROOT, "scripts/sw-source.js"), "utf8");
    // Prod measured install stalling forever (759/782) with no fetch
    // timeout in the stock workbox template — every fetch is raced
    // against a timeout with retries.
    expect(src.includes("sw fetch timeout")).toBe(true);
    expect(src.includes("attempt(3)")).toBe(true);
  });

  it("versioned CDN engines get a long-lived cache (offline tools)", () => {
    const src = fs.readFileSync(path.join(ROOT, "scripts/sw-source.js"), "utf8");
    expect(src.includes("immutable-cdn")).toBe(true);
    for (const origin of ["cdn\\.jsdelivr\\.net", "unpkg\\.com", "storage\\.googleapis\\.com"]) {
      expect(src.includes(origin)).toBe(true);
    }
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
