"use client";
import React from 'react';
import { LinkCard } from '@/components/tools/LinkCard';

const tools = [
  // CSV Tools (Utility)
  { slug: 'column-extractor', name: 'Column Extractor', description: 'Extract specific columns from CSV by header name.', category: 'utility' },
  { slug: 'column-renamer', name: 'Column Renamer', description: 'Rename CSV column headers in bulk using old:new mapping.', category: 'utility' },
  { slug: 'data-type-converter', name: 'Data Type Converter', description: 'Convert CSV column data types between number, string, integer, and float.', category: 'utility' },
  { slug: 'deduplicator', name: 'CSV Deduplicator', description: 'Remove duplicate rows from CSV data based on a specific column.', category: 'utility' },
  { slug: 'format-validator', name: 'CSV Format Validator', description: 'Validate CSV formatting and detect malformed rows.', category: 'utility' },
  { slug: 'csv-merger', name: 'CSV Merger', description: 'Merge two CSV files on a common column like a SQL JOIN.', category: 'utility' },
  { slug: 'null-value-handler', name: 'Null Value Handler', description: 'Replace empty/null/NA values in CSV with a custom fill.', category: 'utility' },
  { slug: 'pivot-generator', name: 'CSV Pivot Generator', description: 'Generate pivot tables from CSV data by group and value columns.', category: 'utility' },
  { slug: 'row-filter', name: 'CSV Row Filter', description: 'Filter CSV rows by column value with multiple operators.', category: 'utility' },
  { slug: 'csv-row-sorter', name: 'CSV Row Sorter', description: 'Sort CSV rows by any column ascending or descending.', category: 'utility' },
  { slug: 'csv-splitter', name: 'CSV Splitter', description: 'Split a large CSV into multiple smaller files.', category: 'utility' },
  { slug: 'csv-transpose', name: 'CSV Transpose', description: 'Swap rows and columns in CSV data.', category: 'utility' },
  { slug: 'csv-to-markdown', name: 'CSV to Markdown Table', description: 'Convert CSV to GitHub-flavored Markdown tables.', category: 'utility' },
  { slug: 'csv-to-ndjson', name: 'CSV to NDJSON', description: 'Convert CSV rows to Newline Delimited JSON objects.', category: 'utility' },
  { slug: 'csv-to-sql', name: 'CSV to SQL INSERT', description: 'Generate SQL INSERT statements from CSV data.', category: 'utility' },
  // JSON Tools (Developer)
  { slug: 'json-escape-unescape', name: 'JSON Escape/Unescape', description: 'Escape or unescape JSON special characters.', category: 'developer' },
  { slug: 'json-flattener', name: 'JSON Flattener', description: 'Flatten nested JSON objects into dot-notation key-value pairs.', category: 'developer' },
  { slug: 'json-ld-generator', name: 'JSON-LD Generator', description: 'Wrap JSON data in schema.org-compatible JSON-LD structure.', category: 'developer' },
  { slug: 'merge-patch-generator', name: 'Merge Patch Generator', description: 'Generate JSON Merge Patch (RFC 7396) from two JSON objects.', category: 'developer' },
  { slug: 'json-schema-generator', name: 'JSON Schema Generator', description: 'Generate JSON Schema (draft-07) from sample JSON data.', category: 'developer' },
  { slug: 'json-size-analyzer', name: 'JSON Size Analyzer', description: 'Analyze JSON size, key count, and nesting depth.', category: 'developer' },
  { slug: 'json-to-zod', name: 'JSON to Zod Schema', description: 'Generate Zod validation schemas from sample JSON.', category: 'developer' },
  { slug: 'jwk-generator', name: 'JWK Generator', description: 'Generate RSA JSON Web Keys (JWK) for encryption.', category: 'developer' },
  { slug: 'jsonl-formatter', name: 'JSONL Formatter', description: 'Pretty-print JSON Lines data for readability.', category: 'developer' },
  { slug: 'ndjson-to-json', name: 'NDJSON to JSON Array', description: 'Convert NDJSON lines to a standard JSON array.', category: 'developer' },
  // Data Converters (Developer)
  { slug: 'json-to-url-params', name: 'JSON to URL Parameters', description: 'Convert JSON objects to URL query string format.', category: 'developer' },
  // Data Generator (Utility)
  { slug: 'csv-json-row-generator', name: 'CSV Row / JSON Generator', description: 'Generate realistic dummy CSV rows or JSON objects.', category: 'utility' },
  // Existing standalone CSV tools
  { slug: 'csv-data-cleaner', name: 'CSV Data Cleaner', description: 'Clean and normalize CSV data with powerful transformations.', category: 'utility' },
  { slug: 'csv-statistics', name: 'CSV Statistics', description: 'Compute descriptive statistics from CSV columns.', category: 'utility' },
  { slug: 'csv-html-table-converter', name: 'CSV ↔ HTML Table', description: 'Convert between CSV and HTML table formats.', category: 'utility' },
  { slug: 'tsv-csv-converter', name: 'TSV ↔ CSV Converter', description: 'Convert between TSV and CSV tabular formats.', category: 'utility' },
  { slug: 'xlsx-csv-converter', name: 'Excel (XLSX) ↔ CSV', description: 'Convert between Excel XLSX and CSV formats.', category: 'utility' },
  { slug: 'vcf-csv-converter', name: 'VCF ↔ CSV Converter', description: 'Convert between VCF contacts and CSV formats.', category: 'utility' },
  { slug: 'ics-csv-converter', name: 'ICS ↔ CSV Converter', description: 'Convert between ICS calendar and CSV formats.', category: 'utility' },
  { slug: 'yaml-json-converter', name: 'YAML ↔ JSON Converter', description: 'Convert between YAML and JSON data formats.', category: 'utility' },
  { slug: 'json-to-csv', name: 'JSON to CSV', description: 'Convert JSON data to CSV spreadsheet format.', category: 'converter' },
  { slug: 'csv-to-json', name: 'CSV to JSON', description: 'Convert CSV data to JSON objects.', category: 'converter' },
  { slug: 'csv-to-xml', name: 'CSV to XML', description: 'Convert CSV data to well-formed XML documents.', category: 'converter' },
  { slug: 'xml-to-csv', name: 'XML to CSV', description: 'Convert XML documents to CSV format.', category: 'converter' },
  { slug: 'xml-to-json', name: 'XML to JSON', description: 'Convert XML documents to JSON format.', category: 'converter' },
  { slug: 'json-to-xml', name: 'JSON to XML', description: 'Convert JSON to XML with configuration.', category: 'converter' },
  { slug: 'toml-converter', name: 'TOML Converter', description: 'Convert TOML to/from JSON, YAML, and other formats.', category: 'developer' },
];

export default function DataToolkit() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Data Toolkit</h1>
        <p className="text-zinc-400 mt-2">CSV transformers, JSON utilities, data converters, and generators — all in one place.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(tool => (
          <LinkCard key={tool.slug} {...tool} />
        ))}
      </div>
    </div>
  );
}
