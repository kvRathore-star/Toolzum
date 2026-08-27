import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders card container', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toBeDefined();
    });

    it('applies default styling', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card.className).toContain('rounded-xl');
      expect(card.className).toContain('border');
    });

    it('accepts custom className', () => {
      render(<Card className="custom" data-testid="card">Content</Card>);
      expect(screen.getByTestId('card').className).toContain('custom');
    });
  });

  describe('CardHeader', () => {
    it('renders header', () => {
      render(<Card><CardHeader data-testid="header">Header</CardHeader></Card>);
      expect(screen.getByTestId('header')).toBeDefined();
    });

    it('applies flex layout', () => {
      render(<Card><CardHeader data-testid="header">Header</CardHeader></Card>);
      expect(screen.getByTestId('header').className).toContain('flex');
    });
  });

  describe('CardTitle', () => {
    it('renders title', () => {
      render(<Card><CardTitle>Title</CardTitle></Card>);
      expect(screen.getByText('Title')).toBeDefined();
    });

    it('renders as h3 element', () => {
      render(<Card><CardTitle>Title</CardTitle></Card>);
      expect(screen.getByRole('heading', { level: 3 })).toBeDefined();
    });
  });

  describe('CardDescription', () => {
    it('renders description', () => {
      render(<Card><CardDescription>Description</CardDescription></Card>);
      expect(screen.getByText('Description')).toBeDefined();
    });
  });

  describe('CardContent', () => {
    it('renders content', () => {
      render(<Card><CardContent data-testid="content">Content</CardContent></Card>);
      expect(screen.getByTestId('content')).toBeDefined();
    });

    it('applies padding', () => {
      render(<Card><CardContent data-testid="content">Content</CardContent></Card>);
      expect(screen.getByTestId('content').className).toContain('p-6');
    });
  });

  describe('CardFooter', () => {
    it('renders footer', () => {
      render(<Card><CardFooter data-testid="footer">Footer</CardFooter></Card>);
      expect(screen.getByTestId('footer')).toBeDefined();
    });

    it('applies flex layout', () => {
      render(<Card><CardFooter data-testid="footer">Footer</CardFooter></Card>);
      expect(screen.getByTestId('footer').className).toContain('flex');
    });
  });

  describe('Card Composition', () => {
    it('renders complete card structure', () => {
      render(
        <Card data-testid="card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Card Content</CardContent>
          <CardFooter>Card Footer</CardFooter>
        </Card>
      );

      expect(screen.getByTestId('card')).toBeDefined();
      expect(screen.getByText('Card Title')).toBeDefined();
      expect(screen.getByText('Card Description')).toBeDefined();
      expect(screen.getByText('Card Content')).toBeDefined();
      expect(screen.getByText('Card Footer')).toBeDefined();
    });
  });
});
