// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { MODES as HTML_TEXT_MODES } from '@/components/tools/modules/shared/HtmlTextHub';

const HTML_TEXT_CLOSURE_SLUGS = ['html-to-text-converter', 'text-to-html-converter'];

function routedHtmlTextSlugs(): string[] {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/tools/modules/DynamicModuleWrapper.tsx'),
    'utf8',
  );
  const closureRe = /'([a-z0-9-]+)': dynamic\(\(\) => import\('@\/components\/tools\/modules\/shared\/HtmlTextHub'\)/g;
  return [...src.matchAll(closureRe)].map(m => m[1]);
}

describe('HtmlTextHub slug-closure contract', () => {
  it('routes every html-text MODES tab via MODULE_REGISTRY', () => {
    const routed = routedHtmlTextSlugs().sort();
    expect(routed).toEqual(HTML_TEXT_CLOSURE_SLUGS.slice().sort());
  });

  it('the routed slug set equals the HtmlTextHub MODES tabs exactly', () => {
    expect(routedHtmlTextSlugs().sort()).toEqual([...HTML_TEXT_MODES].sort());
  });
});
