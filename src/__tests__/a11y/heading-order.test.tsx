import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { CalculatorShell } from '@/components/tools/modules/shared/CalculatorShell';

// Mocks: no network, no router, no session in unit tests.
vi.mock('@/lib/auth-client', () => ({
  useSession: () => ({ data: null, isPending: false }),
  signOut: vi.fn(),
}));
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));
vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function headingLevels(container: HTMLElement): number[] {
  return Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((el) =>
    Number(el.tagName.slice(1))
  );
}

describe('heading order (A1.5)', () => {
  it('tool page: exactly one h1 and no skipped levels', () => {
    const { container } = render(
      <ToolLayout
        title="EMI Calculator"
        description="Calculates EMI."
        category="Finance"
        slug="emi-calculator"
        proToolCount={64}
        toolCount={1063}
        relatedTools={[
          { name: 'SIP Calculator', slug: 'sip-calculator', category: 'Finance', description: 'SIP.' },
        ]}
      >
        <CalculatorShell
          title="EMI Calculator"
          result="₹12,345"
          onCalculate={() => {}}
        >
          <div>inputs</div>
        </CalculatorShell>
      </ToolLayout>
    );

    const levels = headingLevels(container);
    expect(levels.filter((l) => l === 1)).toHaveLength(1);
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) {
      // Going up any amount is fine; going down must not skip (h1 -> h3).
      expect(levels[i]! - levels[i - 1]!).toBeLessThanOrEqual(1);
    }
  });
});
