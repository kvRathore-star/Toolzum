import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, relative, dirname } from 'node:path';
import { toolsRegistry, TOOL_REDIRECTS, SEO_PERMUTATIONS } from '@/registry/tools';
import { CONVERTER_CONFIG } from '@/components/tools/modules/shared/converterConfig';
import { CATEGORY_SECTIONS } from '@/data/categorySections';

const VALID_CATEGORIES = new Set(Object.keys(CATEGORY_SECTIONS));

function catToUrlSlug(cat: string): string {
  if (cat === "Growth & Marketing") return "growth-metrics";
  return cat.toLowerCase().replace(/\s+/g, '-');
}

const VALID_CATEGORY_SLUGS = new Set([...VALID_CATEGORIES].map(catToUrlSlug));

// Intentional cross-listings: tools listed in a section whose category differs from the
// tool's own category. Keyed as `${sectionCategory}/${sectionId}` -> slug list.
// Any new cross-listing MUST be added here deliberately — that is the point of the gate.
const CROSS_LISTING_WHITELIST: Record<string, string[]> = {
  'Converter/image': [
    'image-format-converter', 'bulk-image-converter', 'png-to-svg', 'gif-to-apng',
    'apng-to-gif', 'bulk-heic-to-jpg', 'raw-image-converter', 'psd-to-jpg-png',
    'bulk-svg-to-png', 'image-bulk-converter',
  ],
  'Converter/audio': ['audio-converter'],
  'Converter/document': [
    'pdf-to-txt', 'pdf-to-png', 'pdf-to-tiff', 'pdf-to-markdown', 'markdown-to-pdf',
    'url-to-pdf', 'eml-to-pdf', 'tiff-to-pdf', 'bulk-image-to-pdf',
  ],
  'Video/convert': ['video-converter'],
};

const sectionIndex: { category: string; id: string; slug: string }[] = [];
for (const [cat, sections] of Object.entries(CATEGORY_SECTIONS)) {
  for (const sec of sections) {
    for (const slug of sec.slugs) sectionIndex.push({ category: cat, id: sec.id, slug });
  }
}

describe('registry integrity #1: categories', () => {
  it('every tool.category is a known, enumerated category (no typo\'d strings)', () => {
    const failures = toolsRegistry
      .filter(t => !VALID_CATEGORIES.has(t.category))
      .map(t => `${t.slug}: category "${t.category}" not in known set`);
    expect(failures, failures.join('\n')).toEqual([]);
  });

  it('registry categories and section categories are identical sets', () => {
    const registryCats = new Set<string>(toolsRegistry.map(t => t.category));
    const missingFromSections = [...registryCats].filter(c => !VALID_CATEGORIES.has(c));
    const orphanSections = [...VALID_CATEGORIES].filter(c => !registryCats.has(c));
    expect(missingFromSections, `registry categories without section config: ${missingFromSections.join(', ')}`).toEqual([]);
    expect(orphanSections, `section configs with no registry tools: ${orphanSections.join(', ')}`).toEqual([]);
  });

  it('every redirect sourceCategory resolves to a known category', () => {
    const failures = Object.entries(TOOL_REDIRECTS)
      .filter(([, t]) => t.sourceCategory && !VALID_CATEGORY_SLUGS.has(catToUrlSlug(t.sourceCategory)))
      .map(([slug, t]) => `${slug}: unknown sourceCategory "${t.sourceCategory}"`);
    expect(failures, failures.join('\n')).toEqual([]);
  });
});

describe('registry integrity #2: visible tools are sectioned once in their own category', () => {
  it('every visible tool appears in exactly one section of its own category', () => {
    const failures: string[] = [];
    for (const tool of toolsRegistry) {
      if (tool.showInCategory === false) continue;
      const ownListings = sectionIndex.filter(s => s.category === tool.category && s.slug === tool.slug);
      if (ownListings.length !== 1) {
        failures.push(`${tool.slug} (${tool.category}): listed in ${ownListings.length} section(s) of own category`);
      }
    }
    expect(failures, failures.join('\n')).toEqual([]);
  });

  it('cross-category listings are only the explicitly whitelisted ones', () => {
    const failures: string[] = [];
    for (const s of sectionIndex) {
      const tool = toolsRegistry.find(t => t.slug === s.slug);
      if (!tool || s.category === tool.category) continue;
      const allowed = CROSS_LISTING_WHITELIST[`${s.category}/${s.id}`] || [];
      if (!allowed.includes(s.slug)) {
        failures.push(`${s.slug} (live category ${tool.category}) listed in ${s.category}/${s.id} without whitelist entry`);
      }
    }
    expect(failures, failures.join('\n')).toEqual([]);
  });
});

describe('registry integrity #3: section listings resolve to visible registry entries', () => {
  it('every listed slug has a registry entry that is not hidden', () => {
    const failures: string[] = [];
    for (const s of sectionIndex) {
      const tool = toolsRegistry.find(t => t.slug === s.slug);
      if (!tool) failures.push(`${s.slug} (in ${s.category}/${s.id}): no registry entry`);
      else if (tool.showInCategory === false) failures.push(`${s.slug} (in ${s.category}/${s.id}): registry entry is hidden (showInCategory:false)`);
    }
    expect(failures, failures.join('\n')).toEqual([]);
  });
});

describe('registry integrity #4: slug uniqueness', () => {
  it('no duplicate slugs across the entire registry', () => {
    const seen = new Map<string, string[]>();
    for (const t of toolsRegistry) {
      const names = seen.get(t.slug) || [];
      names.push(`${t.name} (${t.category})`);
      seen.set(t.slug, names);
    }
    const dups = [...seen.entries()].filter(([, names]) => names.length > 1);
    expect(dups.map(([slug, names]) => `${slug}: ${names.join(', ')}`)).toEqual([]);
  });
});

describe('registry integrity #5: redirects resolve to the live tool in the right category', () => {
  it('every redirect target exists in the registry', () => {
    const failures = Object.entries(TOOL_REDIRECTS)
      .filter(([, t]) => !toolsRegistry.some(tool => tool.slug === t.slug))
      .map(([slug, t]) => `${slug} -> "${t.slug}" not found in registry`);
    expect(failures, failures.join('\n')).toEqual([]);
  });

  it('every redirect category matches the live tool category', () => {
    const failures: string[] = [];
    for (const [slug, t] of Object.entries(TOOL_REDIRECTS)) {
      const live = toolsRegistry.find(tool => tool.slug === t.slug);
      if (!live) continue;
      if (catToUrlSlug(t.category) !== catToUrlSlug(live.category)) {
        failures.push(`${slug} -> "${t.slug}": redirect category "${t.category}" but live category "${live.category}"`);
      }
    }
    expect(failures, failures.join('\n')).toEqual([]);
  });

  it('sourceCategory (old path) differs from the redirect category', () => {
    const failures = Object.entries(TOOL_REDIRECTS)
      .filter(([, t]) => t.sourceCategory && catToUrlSlug(t.sourceCategory) === catToUrlSlug(t.category))
      .map(([slug, t]) => `${slug}: sourceCategory "${t.sourceCategory}" equals category "${t.category}"`);
    expect(failures, failures.join('\n')).toEqual([]);
  });
});

describe('registry integrity #6: category moves require a matching redirect', () => {
  const CHUNK_FILES = [
    'src/registry/tools-chunk-0.ts',
    'src/registry/tools-chunk-1.ts',
    'src/registry/tools-chunk-2.ts',
    'src/registry/tools-chunk-3.ts',
    'src/registry/tools-chunk-4.ts',
    'src/registry/tools-chunk-5.ts',
  ];

  function extractSlugToCategory(content: string): Map<string, string> {
    const map = new Map<string, string>();
    const re = /slug:\s*"([^"]+)",\s*\n\s*category:\s*"([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) map.set(m[1], m[2]);
    return map;
  }

  it('any tool whose category changed in the working tree has a redirect with the new category', () => {
    const moved: { slug: string; old: string; next: string }[] = [];
    for (const file of CHUNK_FILES) {
      let headContent: string;
      try {
        headContent = execSync(`git show HEAD:${file}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      } catch {
        continue; // file not tracked at HEAD — treat as new
      }
      const headMap = extractSlugToCategory(headContent);
      const curMap = extractSlugToCategory(readFileSync(file, 'utf8'));
      for (const [slug, cur] of curMap) {
        const prev = headMap.get(slug);
        if (prev && prev !== cur) moved.push({ slug, old: prev, next: cur });
      }
    }

    // Vacuous pass on a clean tree (e.g. CI) — the gate applies to uncommitted changes.
    if (moved.length === 0) return;

    const failures: string[] = [];
    for (const mv of moved) {
      const redir = TOOL_REDIRECTS[mv.slug];
      if (!redir) {
        failures.push(`${mv.slug}: category changed ${mv.old} -> ${mv.next} but no TOOL_REDIRECTS entry`);
        continue;
      }
      if (catToUrlSlug(redir.category) !== catToUrlSlug(mv.next)) {
        failures.push(`${mv.slug}: redirect category "${redir.category}" != new category "${mv.next}"`);
      }
      if (redir.sourceCategory !== mv.old) {
        failures.push(`${mv.slug}: redirect sourceCategory "${redir.sourceCategory}" != old category "${mv.old}"`);
      }
    }
    expect(failures, failures.join('\n')).toEqual([]);
  });
});

describe('registry integrity #9: routing consistency', () => {
  const SRC_ROOT = resolve(__dirname, '..');

  function walk(dir: string, acc: string[] = []): string[] {
    for (const e of readdirSync(dir)) {
      const p = join(dir, e);
      if (statSync(p).isDirectory()) walk(p, acc);
      else if (/\.(ts|tsx)$/.test(e)) acc.push(p);
    }
    return acc;
  }

  // MODULE_REGISTRY slugs — parsed from the wrapper (it is not exported).
  const wrapperSource = readFileSync(join(SRC_ROOT, 'components/tools/modules/DynamicModuleWrapper.tsx'), 'utf8');
  const moduleRegistrySlugs: string[] = [];
  const regRe = /^\s*'([^']+)':\s*dynamic\(/gm;
  let rm: RegExpExecArray | null;
  while ((rm = regRe.exec(wrapperSource)) !== null) moduleRegistrySlugs.push(rm[1]);

  const configSlugs = Object.keys(CONVERTER_CONFIG);
  const registrySlugSet = new Set(toolsRegistry.map(t => t.slug));
  const permSlugSet = new Set(SEO_PERMUTATIONS.map(p => p.slug));
  const redirectKeySet = new Set(Object.keys(TOOL_REDIRECTS));

  it('no slug is routed by both MODULE_REGISTRY and CONVERTER_CONFIG (single source of truth)', () => {
    const dupes = moduleRegistrySlugs.filter(s => configSlugs.includes(s));
    expect(
      dupes.map(s => `${s}: MODULE_REGISTRY entry shadows CONVERTER_CONFIG entry (${CONVERTER_CONFIG[s].category})`)
    ).toEqual([]);
  });

  it('every CONVERTER_CONFIG slug maps to a real registry tool', () => {
    const failures = configSlugs.filter(s => !registrySlugSet.has(s));
    expect(
      failures.map(s => `${s}: CONVERTER_CONFIG routes a slug with no registry entry`)
    ).toEqual([]);
  });

  it('every MODULE_REGISTRY slug resolves to a real page slug', () => {
    const failures = moduleRegistrySlugs.filter(
      s => !registrySlugSet.has(s) && !permSlugSet.has(s) && !redirectKeySet.has(s)
    );
    expect(
      failures.map(s => `${s}: MODULE_REGISTRY routes a slug that has no page`)
    ).toEqual([]);
  });

  it('no MODULE_REGISTRY slug redirects away to a different slug (route can never render)', () => {
    const failures = moduleRegistrySlugs.filter(s => {
      const r = TOOL_REDIRECTS[s];
      return r && r.slug !== s;
    });
    expect(
      failures.map(s => `${s}: MODULE_REGISTRY route unreachable — slug redirects to "${TOOL_REDIRECTS[s].slug}"`)
    ).toEqual([]);
  });

  it('every visible tool resolves via routing, a redirect, or an SEO permutation (no ComingSoon)', () => {
    const failures: string[] = [];
    for (const tool of toolsRegistry) {
      if (tool.showInCategory === false) continue;
      if (moduleRegistrySlugs.includes(tool.slug) || configSlugs.includes(tool.slug)) continue;
      if (TOOL_REDIRECTS[tool.slug]) continue;
      const perm = SEO_PERMUTATIONS.find(p => p.slug === tool.slug);
      if (perm && registrySlugSet.has(perm.parentSlug)) continue;
      failures.push(`${tool.slug} (${tool.category}): visible but not routed, redirected, or parented`);
    }
    expect(failures, failures.join('\n')).toEqual([]);
  });

  it('every SEO_PERMUTATION parent is a real registry tool', () => {
    const failures = SEO_PERMUTATIONS.filter(p => !registrySlugSet.has(p.parentSlug));
    expect(
      failures.map(p => `${p.slug}: parent "${p.parentSlug}" not in registry`)
    ).toEqual([]);
  });

  it('every component file under modules/ is imported somewhere in src/ (zero orphan components)', () => {
    const MODULES_DIR = join(SRC_ROOT, 'components/tools/modules');

    const moduleFiles = walk(MODULES_DIR);
    const importable = new Map<string, string>();
    for (const f of moduleFiles) {
      const rel = relative(SRC_ROOT, f).replace(/\.(ts|tsx)$/, '');
      importable.set('@/' + rel, f);
    }

    function resolveSpecifier(importer: string, spec: string): string | null {
      if (spec.startsWith('@/')) {
        return importable.get(spec) || importable.get(spec.replace(/\.tsx?$/, '')) || null;
      }
      if (spec.startsWith('.')) {
        const base = resolve(dirname(importer), spec);
        for (const ext of ['', '.tsx', '.ts']) {
          const candidate = importable.get('@/' + relative(SRC_ROOT, base + ext));
          if (candidate) return candidate;
        }
        return null;
      }
      return null;
    }

    const allSrcFiles = walk(SRC_ROOT).filter(f => !f.includes(`${join('__tests__')}`));
    const referenced = new Set<string>();
    const impRe = /(?:from\s+|import\(\s*)['"]([^'"]+)['"]/g;
    for (const f of allSrcFiles) {
      const content = readFileSync(f, 'utf8');
      let m: RegExpExecArray | null;
      while ((m = impRe.exec(content)) !== null) {
        const target = resolveSpecifier(f, m[1]);
        if (target && target !== f) referenced.add(target);
      }
    }

    const orphans = moduleFiles.filter(f => !referenced.has(f));
    expect(
      orphans.map(f => relative(SRC_ROOT, f))
    ).toEqual([]);
  });
});
