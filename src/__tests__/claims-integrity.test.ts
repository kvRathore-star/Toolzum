import { describe, it, expect } from 'vitest';
import { toolsRegistry } from '@/registry/tools';
import { getToolCounts } from '@/registry/tools-helpers';
import { classifyDependencies } from '@/lib/cloudPatterns';

const VIOLATION_PATTERNS = /never leave|no upload|100% local|client-side|in your browser/i;

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
