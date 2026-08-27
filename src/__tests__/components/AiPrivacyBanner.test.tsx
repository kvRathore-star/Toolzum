import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

import { AiPrivacyBanner } from '@/components/AiPrivacyBanner';

describe('AiPrivacyBanner', () => {
  it('renders default service name', () => {
    render(<AiPrivacyBanner />);
    expect(screen.getByText(/Google Gemini/)).toBeInTheDocument();
  });

  it('renders custom service name', () => {
    render(<AiPrivacyBanner service="OpenAI" />);
    expect(screen.getByText(/OpenAI/)).toBeInTheDocument();
  });

  it('renders privacy policy link', () => {
    render(<AiPrivacyBanner />);
    expect(screen.getByText('Privacy policy')).toHaveAttribute('href', '/privacy-policy');
  });

  it('shows data warning', () => {
    render(<AiPrivacyBanner />);
    expect(screen.getByText(/Data leaves your browser/)).toBeInTheDocument();
  });

  it('renders with custom server label', () => {
    render(<AiPrivacyBanner serverLabel="external API" />);
    expect(screen.getByText(/external API/)).toBeInTheDocument();
  });
});
