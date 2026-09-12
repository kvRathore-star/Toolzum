import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("public/_headers cache policy (Sep 2026 regression)", () => {
  const raw = fs.readFileSync(path.join(process.cwd(), "public/_headers"), "utf8");
  const lines = raw.split("\n");

  it("has no bare *.ext globs (invalid Pages syntax that matched every response)", () => {
    const bare = lines.filter((l) => /^\*\.[a-z0-9]+$/i.test(l.trim()));
    expect(bare).toEqual([]);
  });

  it("keeps hashed build assets immutable under directory-scoped rules", () => {
    expect(raw).toContain("/_next/static/*");
    expect(raw).toContain("max-age=31536000, immutable");
  });

  it("sets no Cache-Control on HTML/pages (only asset + og rules carry one)", () => {
    const cacheBlocks = raw.split("\n").filter((l) => l.includes("Cache-Control"));
    // every Cache-Control line must belong to an asset rule — none may sit
    // in the global /* security block
    const globalBlock = raw.split("/*")[1]?.split("\n") ?? [];
    expect(globalBlock.some((l) => l.includes("Cache-Control"))).toBe(false);
    expect(cacheBlocks.length).toBeGreaterThan(0);
  });
});

describe("public/_headers CSP third-party surface (Sep 12 2026 live-console regression)", () => {
  const raw = fs.readFileSync(path.join(process.cwd(), "public/_headers"), "utf8");
  const csp = raw.split("\n").find((l) => l.includes("Content-Security-Policy")) ?? "";

  it("allows blob: workers to importScripts FFmpeg cores (script-src blob:)", () => {
    // @ffmpeg/ffmpeg boots via importScripts(blob:coreURL), governed by
    // script-src. Without blob: every video/audio tool fails with
    // "All CDN sources failed" despite healthy CDNs.
    expect(csp).toMatch(/script-src[^;]*blob:/);
  });

  it("allows the Turnstile captcha script, frame, and API (email auth is dead without it)", () => {
    expect(csp).toMatch(/script-src[^;]*challenges\.cloudflare\.com/);
    expect(csp).toMatch(/frame-src[^;]*challenges\.cloudflare\.com/);
    expect(csp).toMatch(/connect-src[^;]*challenges\.cloudflare\.com/);
  });

  it("allows Pollinations image origins (AI Image Generator renders nothing without them)", () => {
    expect(csp).toMatch(/img-src[^;]*image\.pollinations\.ai/);
    expect(csp).toMatch(/connect-src[^;]*image\.pollinations\.ai/);
  });
});

describe("getIncidentMonths rolling window", async () => {
  const { getIncidentMonths } = await import("@/app/status/page");

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders the current month plus 3 prior months", () => {
    vi.setSystemTime(new Date("2026-09-11T12:00:00Z"));
    const labels = getIncidentMonths().map((m) => m.label);
    expect(labels).toEqual(["September 2026", "August 2026", "July 2026", "June 2026"]);
  });

  it("rolls over the year boundary", () => {
    vi.setSystemTime(new Date("2027-01-15T12:00:00Z"));
    const labels = getIncidentMonths().map((m) => m.label);
    expect(labels).toEqual(["January 2027", "December 2026", "November 2026", "October 2026"]);
  });

  it("defaults to no-incidents copy", () => {
    vi.setSystemTime(new Date("2026-09-11T12:00:00Z"));
    for (const m of getIncidentMonths()) {
      expect(m.text).toBe("No incidents reported this month.");
    }
  });
});
