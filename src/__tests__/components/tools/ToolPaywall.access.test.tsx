import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToolPaywall } from '@/components/tools/ToolPaywall';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('lucide-react', () => {
  const stub = () => <span />;
  return { Crown: stub, Lock: stub, Sparkles: stub, Zap: stub, Upload: stub };
});

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

describe('ToolPaywall access model (anon hard-lock, signed taste)', () => {
  it('shows children when not locked', () => {
    render(
      <ToolPaywall isLocked={false} showSignInPrompt={false} proToolCount={66} toolCount={1146} title="Demo">
        <div>tool body</div>
      </ToolPaywall>
    );
    expect(screen.getByText('tool body')).toBeDefined();
    expect(screen.queryByText('Sign in to use this Pro tool')).toBeNull();
  });

  it('locks anon visitors behind sign-in-first CTA with blurred tool behind', () => {
    const { container } = render(
      <ToolPaywall isLocked={true} showSignInPrompt={true} proToolCount={66} toolCount={1146} title="Demo">
        <div>tool body</div>
      </ToolPaywall>
    );
    // Tool stays mounted but blurred/pointer-blocked behind the overlay.
    expect(container.querySelector('.blur-md')).not.toBeNull();
    expect(screen.getByText('Sign in to use this Pro tool')).toBeDefined();
    const cta = screen.getByText('Sign in free — 2 Pro downloads/day');
    expect(cta.closest('a')).toHaveAttribute('href', '/sign-in');
  });

  it('falls back to upgrade-first CTA without sign-in prompt', () => {
    render(
      <ToolPaywall isLocked={true} showSignInPrompt={false} proToolCount={66} toolCount={1146} title="Demo">
        <div>tool body</div>
      </ToolPaywall>
    );
    expect(screen.getByText('Pro Feature')).toBeDefined();
    expect(screen.getByText(/Upgrade to Pro/)).toBeDefined();
  });
});
