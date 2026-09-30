// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync, readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateAll, type ToolInfo } from '../../scripts/generate-og-images';
import { toolsRegistry } from '@/registry/tools';

const PNG_MAGIC = '89504e470d0a1a0a';

// Sharp renders ~1s/image; under full-suite load the 5s default flakes.
// Timeout covers slowness only — every assertion still runs in full.
vi.setConfig({ testTimeout: 60000 });

function mkTool(name: string, slug: string, category: string, description: string): ToolInfo {
  return { name, slug, category, description };
}

function sha1(file: string): string {
  return createHash('sha1').update(readFileSync(file)).digest('hex');
}

function hashDir(dir: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const cat of readdirSync(dir)) {
    const catPath = join(dir, cat);
    if (!statSync(catPath).isDirectory()) continue;
    for (const f of readdirSync(catPath)) map.set(`${cat}/${f}`, sha1(join(catPath, f)));
  }
  return map;
}

function changedFiles(before: Map<string, string>, after: Map<string, string>): string[] {
  return [...after.entries()]
    .filter(([p, h]) => !before.has(p) || before.get(p) !== h)
    .map(([p]) => p)
    .sort();
}

describe('OG image generation: per-tool images are decoupled from the global tool count', () => {
  it('modifying one tool description regenerates exactly that tool PNG and nothing else', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'og-test-'));
    try {
      const tools = [
        mkTool('Alpha Tool', 'alpha', 'Converter', 'Original description A'),
        mkTool('Beta Tool', 'beta', 'Converter', 'Original description B'),
        mkTool('Gamma Tool', 'gamma', 'Text', 'Original description C'),
      ];
      await generateAll(tools, ['Converter', 'Text'], dir);
      const before = hashDir(dir);

      tools[0] = { ...tools[0], description: 'Changed description A' };
      await generateAll(tools, ['Converter', 'Text'], dir);

      expect(changedFiles(before, hashDir(dir))).toEqual(['converter/alpha.png', 'converter/alpha.webp']);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('changing the catalog size in another category does not regenerate existing images (global-count badge regression)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'og-test-'));
    try {
      const firstRun = [
        mkTool('Alpha Tool', 'alpha', 'Converter', 'A'),
        mkTool('Beta Tool', 'beta', 'Converter', 'B'),
      ];
      await generateAll(firstRun, ['Converter'], dir);
      const before = hashDir(dir);

      const biggerCatalog = [
        ...firstRun,
        mkTool('Delta Tool', 'delta', 'Text', 'D'),
        mkTool('Epsilon Tool', 'epsilon', 'Text', 'E'),
      ];
      await generateAll(biggerCatalog, ['Converter', 'Text'], dir);

      const after = hashDir(dir);
      for (const [p, h] of before) {
        expect(after.get(p), `${p} must be byte-identical when tools are added elsewhere`).toBe(h);
      }
      expect(after.has('text/delta.png')).toBe(true);
      expect(after.has('text/epsilon.png')).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('adding a tool to a category regenerates only that tool PNG and that category index (bounded)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'og-test-'));
    try {
      const tools = [mkTool('Alpha Tool', 'alpha', 'Converter', 'A')];
      await generateAll(tools, ['Converter'], dir);
      const before = hashDir(dir);

      tools.push(mkTool('Beta Tool', 'beta', 'Converter', 'B'));
      await generateAll(tools, ['Converter'], dir);

      expect(changedFiles(before, hashDir(dir))).toEqual(['converter/beta.png', 'converter/beta.webp', 'converter/index.png', 'converter/index.webp']);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('renders valid PNG output for a real registry tool (smoke)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'og-test-'));
    try {
      const real = toolsRegistry[0];
      const tool = mkTool(real.name, real.slug, real.category, real.description);
      await generateAll([tool], [tool.category], dir);

      const png = readFileSync(join(dir, tool.category.toLowerCase(), `${tool.slug}.png`));
      expect(png.length).toBeGreaterThan(1000);
      expect(png.subarray(0, 8).toString('hex')).toBe(PNG_MAGIC);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('writes a cache manifest that survives a fully-skipped re-run (no cache wipe)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'og-test-'));
    const cacheFile = join(dir, 'og-cache.json');
    try {
      const tools = [mkTool('Alpha Tool', 'alpha', 'Converter', 'A')];
      await generateAll(tools, ['Converter'], dir);
      const cacheAfterCold = JSON.parse(readFileSync(cacheFile, 'utf8'));
      expect(Object.keys(cacheAfterCold).length).toBe(3); // alpha.png + index.png + home/index.png

      await generateAll(tools, ['Converter'], dir);
      const cacheAfterWarm = JSON.parse(readFileSync(cacheFile, 'utf8'));
      expect(cacheAfterWarm).toEqual(cacheAfterCold);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('invalidates only the changed tool hash in the cache', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'og-test-'));
    const cacheFile = join(dir, 'og-cache.json');
    try {
      const tools = [
        mkTool('Alpha Tool', 'alpha', 'Converter', 'A'),
        mkTool('Beta Tool', 'beta', 'Converter', 'B'),
      ];
      await generateAll(tools, ['Converter'], dir);

      tools[0] = { ...tools[0], description: 'Changed A' };
      await generateAll(tools, ['Converter'], dir);

      const cache = JSON.parse(readFileSync(cacheFile, 'utf8'));
      expect(cache['converter/beta.png']).toBeTruthy();
      expect(cache['converter/alpha.png']).not.toBe(sha1(join(dir, 'converter/alpha.png')));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('deletes orphaned PNG files not in the live set (stale image cleanup)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'og-test-'));
    try {
      const tools = [
        mkTool('Alpha Tool', 'alpha', 'Converter', 'A'),
        mkTool('Beta Tool', 'beta', 'Converter', 'B'),
      ];
      await generateAll(tools, ['Converter'], dir);

      const stray = join(dir, 'converter', 'stale-tool.png');
      writeFileSync(stray, readFileSync(join(dir, 'converter', 'alpha.png')));

      await generateAll([tools[0]], ['Converter'], dir);
      expect(existsSync(stray)).toBe(false);
      expect(existsSync(join(dir, 'converter', 'alpha.png'))).toBe(true);
      expect(existsSync(join(dir, 'converter', 'index.png'))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('Homepage share card', () => {
  it('root layout + homepage metadata point at the dedicated home card, not a category card', () => {
    const layout = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8');
    const home = readFileSync(join(process.cwd(), 'src/app/page.tsx'), 'utf8');
    for (const [file, src] of [
      ['src/app/layout.tsx', layout],
      ['src/app/page.tsx', home],
    ] as const) {
      expect(src, `${file} must use /og/home/index.webp as its OG image`).toContain('/og/home/index.webp');
      // Scoped to og/twitter image arrays — the JSON-LD Organization logo is a
      // separate field (allowed to reference the branding art).
      expect(src, `${file} must not fall back to a category card`).not.toMatch(/images:.*og\/branding/);
    }
  });

  it('the home card image actually exists in public/og', () => {
    expect(existsSync(join(process.cwd(), 'public/og/home/index.png'))).toBe(true);
    expect(existsSync(join(process.cwd(), 'public/og/home/index.webp'))).toBe(true);
  });
});

describe('OG template helpers (word-boundary truncation + category accents)', () => {
  it('never cuts a word in half', async () => {
    const { truncateWords } = await import('../../scripts/generate-og-images');
    expect(truncateWords('short', 80)).toBe('short');
    expect(truncateWords('Reduces PDF file size by compressing embedded images, removing redundant metadata, and more', 80)).toBe(
      'Reduces PDF file size by compressing embedded images, removing redundant...',
    );
    expect(truncateWords('a'.repeat(100), 80)).toBe(`${'a'.repeat(80)}...`);
  });

  it('resolves every registry category to a hex accent', async () => {
    const { accentFor, CATEGORY_ACCENT } = await import('../../scripts/generate-og-images');
    const { toolsRegistry } = await import('@/registry/tools');
    const cats = [...new Set(toolsRegistry.map((t) => t.category))];
    expect(cats.length).toBeGreaterThan(15);
    const unmapped = cats.filter((c) => !(c in CATEGORY_ACCENT));
    expect(unmapped, 'categories falling back to default accent').toEqual([]);
    for (const c of cats) {
      expect(accentFor(c)).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
    expect(accentFor('No Such Category')).toBe('#6366f1');
  });
});
