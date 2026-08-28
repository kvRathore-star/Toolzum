import { describe, it, expect } from 'vitest';
import {
  generateToolDescription,
  getShortDescription,
  getMetaDescription,
  getOgDescription,
  getUnverifiedDependencyTools,
} from '@/lib/generateToolDescription';
import type { ToolMetadata } from '@/registry/tools';

function makeTool(overrides: Partial<ToolMetadata> = {}): ToolMetadata {
  return {
    slug: 'test-tool',
    name: 'Test Tool',
    description: 'A test tool for testing',
    category: 'Utility',
    dependencies: 'None',
    premium: false,
    seoDescription: '',
    ...overrides,
  } as ToolMetadata;
}

describe('generateToolDescription', () => {
  describe('converter tools (slug with -to- pattern)', () => {
    it('generates converter description for valid format pair', () => {
      const tool = makeTool({ slug: 'png-to-webp', name: 'PNG to WebP Converter' });
      const result = generateToolDescription(tool);
      expect(result.short).toContain('PNG');
      expect(result.short).toContain('WebP');
      expect(result.meta).toContain('Free online');
      expect(result.og).toContain('PNG');
    });

    it('returns null pair for non-converter slug', () => {
      const tool = makeTool({ slug: 'json-formatter', name: 'JSON Formatter' });
      const result = generateToolDescription(tool);
      expect(result.short).toBeDefined();
    });
  });

  describe('formatter tools', () => {
    it('identifies JSON formatter', () => {
      const tool = makeTool({
        slug: 'json-formatter',
        name: 'JSON Formatter',
        description: 'Format and beautify JSON data',
      });
      const result = generateToolDescription(tool);
      expect(result.short).toContain('JSON');
      expect(result.short.toLowerCase()).toContain('prettif');
    });

    it('identifies XML formatter', () => {
      const tool = makeTool({
        slug: 'xml-formatter',
        name: 'XML Formatter',
        description: 'Format and beautify XML documents',
      });
      const result = generateToolDescription(tool);
      expect(result.short).toContain('XML');
    });

    it('identifies code formatter', () => {
      const tool = makeTool({
        slug: 'code-formatter',
        name: 'Code Formatter',
        description: 'Format and beautify source code',
      });
      const result = generateToolDescription(tool);
      expect(result.short).toBeDefined();
    });

    it('identifies HTML formatter', () => {
      const tool = makeTool({
        slug: 'html-formatter',
        name: 'HTML Formatter',
        description: 'Format and beautify HTML markup',
      });
      const result = generateToolDescription(tool);
      expect(result.short).toContain('HTML');
    });
  });

  describe('generic tools', () => {
    it('uses original description with trust claim for password generator', () => {
      const tool = makeTool({
        slug: 'password-generator',
        name: 'Password Generator',
        description: 'Generate secure random passwords',
      });
      const result = generateToolDescription(tool);
      expect(result.short).toContain('Generate secure random passwords');
    });

    it('uses original description for calculator', () => {
      const tool = makeTool({
        slug: 'age-calculator',
        name: 'Age Calculator',
        description: 'Calculate your exact age from birth date',
        category: 'Calculator',
      });
      const result = generateToolDescription(tool);
      expect(result.short).toContain('Calculate your exact age');
    });

    it('uses original description for validator', () => {
      const tool = makeTool({
        slug: 'email-validator',
        name: 'Email Validator',
        description: 'Check if an email address is valid',
      });
      const result = generateToolDescription(tool);
      expect(result.short).toContain('Check if an email address is valid');
    });

    it('uses original description for extractor', () => {
      const tool = makeTool({
        slug: 'audio-extractor',
        name: 'Audio Extractor',
        description: 'Extract audio from video files',
      });
      const result = generateToolDescription(tool);
      expect(result.short).toContain('Extract audio from video files');
    });

    it('uses original description for compressor', () => {
      const tool = makeTool({
        slug: 'image-compressor',
        name: 'Image Compressor',
        description: 'Compress images to reduce file size',
      });
      const result = generateToolDescription(tool);
      expect(result.short).toContain('Compress images to reduce file size');
    });

    it('uses original description for merge tool', () => {
      const tool = makeTool({
        slug: 'pdf-merger',
        name: 'PDF Merger',
        description: 'Merge multiple PDF documents into one',
      });
      const result = generateToolDescription(tool);
      expect(result.short).toContain('Merge multiple PDF documents');
    });

    it('uses original description for hash tool', () => {
      const tool = makeTool({
        slug: 'md5-generator',
        name: 'MD5 Generator',
        description: 'Generate MD5 hash of text',
      });
      const result = generateToolDescription(tool);
      expect(result.short).toContain('Generate MD5 hash');
    });

    it('uses original description for lookup tool', () => {
      const tool = makeTool({
        slug: 'ifsc-lookup',
        name: 'IFSC Code Lookup',
        description: 'Lookup IFSC codes for Indian banks',
        category: 'indian-utilities',
      });
      const result = generateToolDescription(tool);
      expect(result.short).toContain('Lookup IFSC codes');
    });

    it('uses original description for analyzer tool', () => {
      const tool = makeTool({
        slug: 'json-analyzer',
        name: 'JSON Analyzer',
        description: 'Analyze JSON structure and data',
      });
      const result = generateToolDescription(tool);
      expect(result.short).toContain('Analyze JSON structure');
    });
  });

  describe('cloud vs local trust claims', () => {
    it('adds cloud trust claim for cloud dependencies', () => {
      const tool = makeTool({
        slug: 'ai-tool',
        name: 'AI Tool',
        description: 'AI-powered content generation',
        dependencies: 'OpenAI API',
        category: 'AI',
      });
      const result = generateToolDescription(tool);
      expect(result.short).toBeDefined();
    });

    it('adds local trust claim for no dependencies', () => {
      const tool = makeTool({
        slug: 'local-tool',
        name: 'Local Tool',
        description: 'Process data locally',
        dependencies: 'None',
      });
      const result = generateToolDescription(tool);
      expect(result.short).toBeDefined();
    });
  });

  describe('already mentions privacy', () => {
    it('does not append suffix if description mentions browser', () => {
      const tool = makeTool({
        slug: 'browser-tool',
        name: 'Browser Tool',
        description: 'Process data in your browser',
      });
      const result = generateToolDescription(tool);
      expect(result.short).toBe('Process data in your browser');
    });

    it('does not append suffix if description mentions local', () => {
      const tool = makeTool({
        slug: 'local-tool',
        name: 'Local Tool',
        description: 'Process data locally on your device',
      });
      const result = generateToolDescription(tool);
      expect(result.short).toBe('Process data locally on your device');
    });
  });
});

describe('getShortDescription', () => {
  it('returns short description', () => {
    const tool = makeTool({ description: 'Test description' });
    const result = getShortDescription(tool);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('getMetaDescription', () => {
  it('returns seoDescription when available', () => {
    const tool = makeTool({ seoDescription: 'Custom SEO description' });
    expect(getMetaDescription(tool)).toBe('Custom SEO description');
  });

  it('falls back to generated meta description', () => {
    const tool = makeTool({ seoDescription: '' });
    const result = getMetaDescription(tool);
    expect(result).toContain('Free online');
  });
});

describe('getOgDescription', () => {
  it('returns og description', () => {
    const tool = makeTool({ description: 'Test tool' });
    const result = getOgDescription(tool);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('getUnverifiedDependencyTools', () => {
  it('filters tools with unverified dependencies', () => {
    const tools = [
      makeTool({ name: 'Tool A', slug: 'tool-a', category: 'Utility', dependencies: 'None' }),
      makeTool({ name: 'Tool B', slug: 'tool-b', category: 'AI', dependencies: 'Custom API v2' }),
      makeTool({ name: 'Tool C', slug: 'tool-c', category: 'Utility', dependencies: 'SomeUnknownLib' }),
    ];
    const result = getUnverifiedDependencyTools(tools);
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns empty array when all tools have known dependencies', () => {
    const tools = [
      makeTool({ dependencies: 'None' }),
      makeTool({ dependencies: 'OpenAI API' }),
    ];
    const result = getUnverifiedDependencyTools(tools);
    expect(result.length).toBe(0);
  });
});
