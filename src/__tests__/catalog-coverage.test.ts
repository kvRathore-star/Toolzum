import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { clientToolsRegistry } from "@/registry/tools-client-index";
import { TOOL_REDIRECTS } from "@/registry/tools-constants";

/**
 * Trust-sweep coverage gate (fast/static companion to the render-smoke
 * suite, which proves the same thing by rendering every slug). Every
 * catalog entry must have a description and resolve to a module —
 * directly or through a redirect alias (e.g. bg-changer → ai-bg-changer).
 */
const ROOT = process.cwd();

describe("catalog coverage (no orphans, no blanks)", () => {
  const wrapper = fs.readFileSync(
    path.join(
      ROOT,
      "src/components/tools/modules/DynamicModuleWrapper.tsx",
    ),
    "utf8",
  );

  it("every slug resolves to a module or a redirect alias", () => {
    const orphans = clientToolsRegistry
      .map((t) => t.slug)
      .filter((slug) => !wrapper.includes(`'${slug}'`) && !(slug in TOOL_REDIRECTS));
    expect(orphans, "slugs with no module and no redirect").toEqual([]);
  });

  it("every redirect alias points at a mapped slug", () => {
    const mapped = new Set(
      clientToolsRegistry.map((t) => t.slug).filter((s) => wrapper.includes(`'${s}'`)),
    );
    const dangling = Object.entries(TOOL_REDIRECTS).filter(
      ([, target]) => !mapped.has((target as { slug: string }).slug),
    );
    expect(
      dangling.map(([from]) => from),
      "redirects pointing at unmapped slugs",
    ).toEqual([]);
  });

  it("every entry carries a description", () => {
    const blanks = clientToolsRegistry
      .filter((t) => !t.description || t.description.trim().length < 20)
      .map((t) => t.slug);
    expect(blanks, "entries with missing/placeholder descriptions").toEqual([]);
  });
});
