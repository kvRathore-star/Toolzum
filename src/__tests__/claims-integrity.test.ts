import { describe, it, expect } from 'vitest';
import { toolsRegistry } from '@/registry/tools';
import { getToolCounts } from '@/registry/tools-helpers';
import { proSlugs } from '@/registry/tools-constants';
import { DOWNLOAD_PRODUCING_SLUGS } from '@/lib/downloadProducingSlugs';
import { classifyDependencies } from '@/lib/cloudPatterns';

const VIOLATION_PATTERNS = /never leave|no upload|100% local|client-side|in your browser/i;

// Absolute signup/free promises (Oct 5 trust audit). Honest framings do NOT
// match these forms: "Sign in free for 2 uses a day", "Free to start with no
// signup — fair daily limits apply", "no account needed to start".
const ABSOLUTE_SIGNUP_FORMS = [
  /No signup or account required\./,
  /No sign-?up needed\./,
  /100% free, no account needed\./,
  /Private, no signup, all local\./,
  /Free, no signup, no watermark\./,
  /No signup, no watermark, edits locally\./,
];

describe('claims-integrity', () => {
  it('no cloud or hybrid tool claims purely local processing in its description', () => {
    const violations = toolsRegistry
      .filter(t => !t.id?.startsWith('seo-'))
      .filter(t => {
        const v = classifyDependencies(t.dependencies);
        return v === "cloud" || v === "hybrid";
      })
      .filter(t => VIOLATION_PATTERNS.test(t.description));

    if (violations.length > 0) {
      console.log('=== Cloud/hybrid tools with false local claims ===');
      for (const t of violations) {
        console.log(`  ${t.slug} | verdict=${classifyDependencies(t.dependencies)} | "${t.description.slice(0, 150)}"`);
      }
    }

    expect(violations.map(t => t.id)).toEqual([]);
  });

  it('no gated tool makes absolute no-signup/free promises (Oct 5 trust audit)', () => {
    // Gated = Pro (anon blocked) OR download-quota OR cloud/hybrid (credit routes 401 for anon).
    // Entry-true claims on truly-free tools (e.g. calculators) are out of scope.
    const pro = new Set(proSlugs as string[]);
    const bad: string[] = [];
    for (const t of toolsRegistry.filter(t => !t.id?.startsWith('seo-'))) {
      const v = classifyDependencies(t.dependencies);
      const gated = pro.has(t.slug) || (DOWNLOAD_PRODUCING_SLUGS as Set<string>).has(t.slug) || v === 'cloud' || v === 'hybrid';
      if (!gated) continue;
      const blob = `${t.description || ''} ||| ${(t as { seoDescription?: string }).seoDescription || ''}`;
      const hit = ABSOLUTE_SIGNUP_FORMS.find((rx) => rx.test(blob));
      if (hit) bad.push(`${t.slug}: ${hit}`);
    }
    expect(bad).toEqual([]);
  });

  it('local / cloud / hybrid / unverified counts sum to total and cloud+hybrid is a small minority', () => {
    const counts = getToolCounts();
    // totalCloud = cloud (pure cloud API) + hybrid (cloud API + local WASM)
    // This guardrail triggers if >10% of all tools send data off-device
    const totalCloud = counts.cloudTools + counts.hybridTools;
    console.log(`local=${counts.localTools} cloud=${counts.cloudTools} hybrid=${counts.hybridTools} unverified=${counts.unverifiedTools} total=${counts.totalImplemented}`);
    expect(counts.localTools + totalCloud + counts.unverifiedTools).toBe(counts.totalImplemented);
    expect(totalCloud).toBeGreaterThan(0);
    expect(totalCloud).toBeLessThan(counts.totalImplemented * 0.1);
  });
});
