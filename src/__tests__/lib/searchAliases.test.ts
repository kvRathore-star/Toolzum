import { describe, it, expect } from "vitest";
import { SEARCH_ALIASES, aliasesForSlug } from "@/lib/searchAliases";
import { clientToolsRegistry } from "@/registry/tools-client-index";

const KNOWN_SLUGS = new Set(clientToolsRegistry.map((t) => t.slug));

describe("SEARCH_ALIASES integrity", () => {
  it("every alias target resolves to a real registry slug (no dead navigation)", () => {
    const missing: string[] = [];
    for (const [term, slugs] of Object.entries(SEARCH_ALIASES)) {
      for (const slug of slugs) {
        if (!KNOWN_SLUGS.has(slug)) missing.push(`${term} -> ${slug}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("stays tight: each alias resolves to at most 3 slugs", () => {
    const loose = Object.entries(SEARCH_ALIASES).filter(([, slugs]) => slugs.length > 3);
    expect(loose.map(([term]) => term)).toEqual([]);
  });

  it("aliasesForSlug inverts the map", () => {
    expect(aliasesForSlug("ai-bg-changer")).toContain("remove background");
    expect(aliasesForSlug("bulk-pdf-merger")).toContain("merge");
    expect(aliasesForSlug("sip-calculator")).toContain("sip");
    expect(aliasesForSlug("no-such-tool")).toEqual([]);
  });
});
