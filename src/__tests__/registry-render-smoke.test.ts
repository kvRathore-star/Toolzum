import { describe, it, expect, vi, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';

const nav = vi.hoisted(() => ({ slug: 'smoke' }));

vi.mock('next/navigation', () => ({
  useParams: () => ({ tool: nav.slug, category: 'smoke' }),
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {}, back: () => {} }),
  usePathname: () => '/smoke',
  redirect: () => { throw new Error('redirect called'); },
  permanentRedirect: () => { throw new Error('permanentRedirect called'); },
}));

vi.mock('next/image', () => {
  function NextImageMock() {
    return React.createElement('img');
  }
  return { __esModule: true, default: NextImageMock };
});

vi.mock('next/link', () => {
  function NextLinkMock({ href, children }: { href?: unknown; children?: unknown }) {
    return React.createElement('a', { href: String(href ?? '') }, children as React.ReactNode);
  }
  return { __esModule: true, default: NextLinkMock };
});

vi.mock('react-hot-toast', () => {
  const noop = () => 'smoke-noop-toast';
  const toast = new Proxy(noop, { get: () => noop, apply: () => noop() });
  return { __esModule: true, default: toast, toast };
});

vi.mock('@ffmpeg/ffmpeg', () => {
  class FFmpeg {
    loaded = false;
    on() {}
    off() {}
    exec() {}
    writeFile() {}
    readFile() {}
    deleteFile() {}
    load() {}
    terminate() {}
  }
  return { FFmpeg };
});

vi.mock('@ffmpeg/util', () => ({
  toBlobURL: async () => 'blob:mock',
  fetchFile: async (input: unknown) => input,
}));

vi.mock('heic2any', () => ({
  __esModule: true,
  default: async () => new Blob(['smoke']),
}));

vi.mock('openpgp', () => ({
  generateKey: async () => ({ privateKey: 'smoke', publicKey: 'smoke', revocationCertificate: '' }),
  readKey: async () => ({}),
  createMessage: async () => ({}),
  encrypt: async () => ({}),
  decrypt: async () => ({}),
  createCleartextMessage: async () => ({}),
  sign: async () => ({}),
  verify: async () => ({}),
}));

type Entry =
  | { kind: 'default'; path: string }
  | { kind: 'named'; path: string; export: string }
  | { kind: 'closure'; path: string; export: string; props: Record<string, string> };

function parseRegistry(): Record<string, Entry> {
  const file = path.resolve(process.cwd(), 'src/components/tools/modules/DynamicModuleWrapper.tsx');
  const src = fs.readFileSync(file, 'utf8');
  const out: Record<string, Entry> = {};
  // No-options closures (SSR-preserving, e.g. migrated converter slugs) first:
  // strip them from the source so the ssr regex below cannot swallow them while
  // scanning forward for a later `, { ssr: false`.
  const CLOSURE_RE = /'([a-z0-9-]+)': dynamic\(\(\) => import\('([^']+)'\)\.then\(m => \(\{ default: \(\) => <m\.(default|[A-Za-z0-9_]+)((?:\s+[A-Za-z0-9_]+=(?:"[^"]*"|\{[^}]*\}))*) \/> \}\)\)\)/g;
  const closureBlocks: string[] = [];
  for (const match of src.matchAll(CLOSURE_RE)) {
    const [, slug, modPath, exportName, propsStr] = match;
    const props: Record<string, string> = {};
    const propRe = /([A-Za-z0-9_]+)=(?:"([^"]*)"|\{([^}]*)\})/g;
    for (const pm of (propsStr ?? '').matchAll(propRe)) props[pm[1]] = pm[2] ?? pm[3];
    out[slug] = { kind: 'closure', path: modPath, export: exportName, props };
    closureBlocks.push(match[0]);
  }
  const ssgSrc = closureBlocks.reduce((s, b) => s.replace(b, ''), src);
  const SSG_RE = /'([a-z0-9-]+)': dynamic\(\(\) => import\('([^']+)'\)(.*?),\s*\{\s*ssr: false/sg;
  for (const match of ssgSrc.matchAll(SSG_RE)) {
    const [, slug, modPath, rawTail] = match;
    const tail = rawTail.trim();
    let entry: Entry;
    if (tail.startsWith('.then(m => {')) {
      const jsx = tail.match(/<m\.(default|[A-Za-z0-9_]+)((?:\s+[A-Za-z0-9_]+="[^"]*")*)/);
      if (!jsx) throw new Error(`cannot parse closure entry for ${slug}`);
      const props: Record<string, string> = {};
      const propRe = /([A-Za-z0-9_]+)="([^"]*)"/g;
      for (const pm of (jsx[2] ?? '').matchAll(propRe)) props[pm[1]] = pm[2];
      entry = { kind: 'closure', path: modPath, export: jsx[1], props };
    } else {
      const named = tail.match(/\.then\(m => \(\{ default: m\.([A-Za-z0-9_]+) \}\)\)/);
      if (named) entry = { kind: 'named', path: modPath, export: named[1] };
      else entry = { kind: 'default', path: modPath };
    }
    out[slug] = entry;
  }
  return out;
}

async function resolveComponent(entry: Entry): Promise<React.ComponentType<Record<string, unknown>>> {
  const mod = (await import(entry.path)) as Record<string, unknown>;
  const exportName = entry.kind === 'default' ? 'default' : entry.export;
  const comp = mod[exportName] as React.ComponentType<Record<string, unknown>> | undefined;
  if (typeof comp !== 'function' && typeof comp !== 'object') {
    throw new Error(`missing export "${exportName}" in ${entry.path}`);
  }
  const component = comp as React.ComponentType<Record<string, unknown>>;
  if (entry.kind === 'closure' && Object.keys(entry.props).length > 0) {
    const Wrapped = (props: Record<string, unknown>) =>
      React.createElement(component, { ...props, ...entry.props });
    Wrapped.displayName = `${entry.export}(${Object.entries(entry.props).map(([k, v]) => `${k}=${v}`).join(',')})`;
    return Wrapped;
  }
  return component;
}

describe('Tier 2.1 full-registry render smoke test', () => {
  let registry: Record<string, Entry>;
  let converterSlugs: string[];

  beforeAll(async () => {
    registry = parseRegistry();
    const { CONVERTER_CONFIG } = await import('@/components/tools/modules/shared/converterConfig');
    converterSlugs = Object.keys(CONVERTER_CONFIG);
  });

  it('parses every MODULE_REGISTRY slug as resolvable (default / named / closure)', () => {
    expect(Object.keys(registry).length).toBe(970);
    const kinds = Object.values(registry).map((e) => e.kind);
    expect(kinds.filter((k) => k === 'default').length).toBe(320);
    expect(kinds.filter((k) => k === 'named').length).toBe(416);
    expect(kinds.filter((k) => k === 'closure').length).toBe(234);
  });

  it('every MODULE_REGISTRY slug renders its resolved component without throwing', async () => {
    const failures: string[] = [];
    const started = Date.now();
    for (const slug of Object.keys(registry)) {
      nav.slug = slug;
      try {
        const comp = await resolveComponent(registry[slug]);
        renderToString(React.createElement(comp));
      } catch (e) {
        failures.push(`${slug}: ${(e as Error).message.split('\n')[0]}`);
      }
    }
    console.log(`registry render pass took ${((Date.now() - started) / 1000).toFixed(1)}s`);
    expect(failures, `render failures:\n${failures.join('\n')}`).toEqual([]);
  }, 180000);

  it('every CONVERTER_CONFIG slug renders through ConverterRouter without throwing', async () => {
    const { default: ConverterRouter } = await import('@/components/tools/modules/converter/ConverterRouter');
    const failures: string[] = [];
    expect(converterSlugs.length).toBe(70);
    const started = Date.now();
    for (const slug of converterSlugs) {
      nav.slug = slug;
      try {
        renderToString(React.createElement(ConverterRouter, { slug }));
      } catch (e) {
        failures.push(`${slug}: ${(e as Error).message.split('\n')[0]}`);
      }
    }
    console.log(`converter render pass took ${((Date.now() - started) / 1000).toFixed(1)}s`);
    expect(failures, `render failures:\n${failures.join('\n')}`).toEqual([]);
  }, 180000);
});
