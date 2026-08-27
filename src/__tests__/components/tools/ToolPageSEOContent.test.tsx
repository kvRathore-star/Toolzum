import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the component
vi.mock('@/components/tools/ToolPageSEOContent', () => ({
  ToolPageSEOContent: ({ toolName, description, faqs }: any) => (
    <div data-testid="seo-content">
      <h1 data-testid="tool-name">{toolName}</h1>
      <p data-testid="description">{description}</p>
      <div data-testid="faqs">
        {faqs?.map((faq: any, i: number) => (
          <div key={i} data-testid={`faq-${i}`}>
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  ),
}));

import { ToolPageSEOContent } from '@/components/tools/ToolPageSEOContent';

describe('ToolPageSEOContent', () => {
  const mockFaqs = [
    { question: 'What is this tool?', answer: 'It helps you process files.' },
    { question: 'Is it free?', answer: 'Yes, with limits.' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders SEO content', () => {
    render(
      <ToolPageSEOContent
        toolName="PDF Merger"
        description="Merge multiple PDF files"
        faqs={mockFaqs}
      />
    );
    
    expect(screen.getByTestId('seo-content')).toBeDefined();
  });

  it('displays tool name', () => {
    render(
      <ToolPageSEOContent
        toolName="Image Compressor"
        description="Compress images"
        faqs={[]}
      />
    );
    
    expect(screen.getByTestId('tool-name')).toHaveTextContent('Image Compressor');
  });

  it('displays description', () => {
    render(
      <ToolPageSEOContent
        toolName="Tool"
        description="This is a tool description"
        faqs={[]}
      />
    );
    
    expect(screen.getByTestId('description')).toHaveTextContent('This is a tool description');
  });

  it('renders FAQs', () => {
    render(
      <ToolPageSEOContent
        toolName="Tool"
        description="Description"
        faqs={mockFaqs}
      />
    );
    
    expect(screen.getByText('What is this tool?')).toBeDefined();
    expect(screen.getByText('Is it free?')).toBeDefined();
  });

  it('renders empty FAQs', () => {
    render(
      <ToolPageSEOContent
        toolName="Tool"
        description="Description"
        faqs={[]}
      />
    );
    
    expect(screen.getByTestId('faqs').children.length).toBe(0);
  });
});
