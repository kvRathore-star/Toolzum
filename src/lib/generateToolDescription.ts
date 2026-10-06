import type { ToolMetadata } from "@/registry/tools";
import { classifyDependencies, LOCAL_TRUST_CLAIM, localTrustClaim, CLOUD_TRUST_CLAIM, HYBRID_TRUST_CLAIM, FORMAT_INFO } from "@/lib/cloudPatterns";

function parseFormatPair(slug: string): { from: string; to: string } | null {
  const match = slug.match(/^([a-z0-9]+)-to-([a-z0-9]+)$/);
  if (!match) return null;
  const [, from = "", to = ""] = match;
  if (FORMAT_INFO[from] && FORMAT_INFO[to]) return { from, to };
  return null;
}

interface DescriptionVariants {
  short: string;
  meta: string;
  og: string;
}

const formatterVariants: Record<string, (name: string, deps: string, category?: string) => DescriptionVariants> = {
  'json': (name, deps, category) => ({
    short: `Prettifies JSON and API response data with configurable indentation, sorting, and syntax validation — fixes malformed JSON and makes nested structures readable.`,
    meta: `Free online ${name} — Prettifies JSON data with configurable indentation, sorting, and syntax validation. Fixes malformed JSON and makes nested structures readable. ${localTrustClaim(category)}`,
    og: `JSON formatter that prettifies data with configurable indentation and sorting, validates syntax, and fixes malformed JSON — entirely client-side.`,
  }),
  'xml': (name, deps, category) => ({
    short: `Pretty-prints XML documents with proper tree indentation, validates structure, and reorganizes attributes for maximum readability.`,
    meta: `Free online ${name} — Pretty-prints XML documents with proper tree indentation, validates structure, and reorganizes attributes. ${localTrustClaim(category)}`,
    og: `XML formatter that pretty-prints documents with tree indentation, validates structure, and reorganizes attributes for readability.`,
  }),
  'graphql': (name, deps, category) => ({
    short: `Formats GraphQL queries and mutations with consistent indentation, argument spacing, and fragment organization for readable API schemas.`,
    meta: `Free online ${name} — Formats GraphQL queries and mutations with consistent indentation and argument spacing. ${localTrustClaim(category)}`,
    og: `GraphQL formatter that applies consistent indentation, argument spacing, and fragment organization to queries and mutations.`,
  }),
  'code': (name, deps, category) => ({
    short: `Auto-formats source code across 15+ languages — JavaScript, Python, HTML, CSS, SQL, YAML — with language-aware indentation and syntax rules.`,
    meta: `Free online ${name} — Auto-formats source code across 15+ languages with language-aware indentation and syntax rules. ${localTrustClaim(category)}`,
    og: `Multi-language code formatter that applies language-aware indentation and syntax rules to JavaScript, Python, HTML, CSS, SQL, and more.`,
  }),
  'html': (name, deps, category) => ({
    short: `Indents and structures HTML markup with proper nesting, attribute alignment, and readable indentation for templates and email designs.`,
    meta: `Free online ${name} — Indents and structures HTML markup with proper nesting, attribute alignment, and readable indentation. ${localTrustClaim(category)}`,
    og: `HTML formatter that indents and structures markup with proper nesting, attribute alignment, and readable indentation.`,
  }),
  'css': (name, deps, category) => ({
    short: `Organizes CSS stylesheets with consistent indentation, property grouping, and selector formatting for maintainable styles.`,
    meta: `Free online ${name} — Organizes CSS stylesheets with consistent indentation, property grouping, and selector formatting. ${localTrustClaim(category)}`,
    og: `CSS formatter that organizes stylesheets with consistent indentation, property grouping, and selector formatting.`,
  }),
  'javascript': (name, deps, category) => ({
    short: `Formats JavaScript code with proper indentation, consistent spacing, and syntax structure — supports modern ES6+ features and async patterns.`,
    meta: `Free online ${name} — Formats JavaScript code with proper indentation and syntax structure. Supports ES6+ and async patterns. ${localTrustClaim(category)}`,
    og: `JavaScript formatter that applies proper indentation and syntax structure, supporting ES6+ features and async patterns.`,
  }),
  'typescript': (name, deps, category) => ({
    short: `Formats TypeScript code with type-aware indentation, interface alignment, and consistent syntax structure for large codebases.`,
    meta: `Free online ${name} — Formats TypeScript code with type-aware indentation and interface alignment. ${localTrustClaim(category)}`,
    og: `TypeScript formatter that applies type-aware indentation, interface alignment, and consistent syntax structure.`,
  }),
  'jsx': (name, deps, category) => ({
    short: `Formats JSX/React component code with proper indentation, prop alignment, and JSX expression structure for readable component definitions.`,
    meta: `Free online ${name} — Formats JSX/React code with proper indentation, prop alignment, and JSX expression structure. ${localTrustClaim(category)}`,
    og: `JSX formatter that applies proper indentation, prop alignment, and JSX expression structure to React components.`,
  }),
  'tsx': (name, deps, category) => ({
    short: `Formats TSX/React TypeScript components with type-aware indentation, prop type alignment, and clean JSX structure.`,
    meta: `Free online ${name} — Formats TSX/React TypeScript components with type-aware indentation and prop alignment. ${localTrustClaim(category)}`,
    og: `TSX formatter that applies type-aware indentation, prop type alignment, and clean JSX structure to React TypeScript components.`,
  }),
  'scss': (name, deps, category) => ({
    short: `Organizes SCSS/Sass stylesheets with proper nesting indentation, variable alignment, and mixin formatting for maintainable styles.`,
    meta: `Free online ${name} — Organizes SCSS/Sass stylesheets with proper nesting indentation and variable alignment. ${localTrustClaim(category)}`,
    og: `SCSS formatter that organizes stylesheets with proper nesting indentation, variable alignment, and mixin formatting.`,
  }),
  'python': (name, deps, category) => ({
    short: `Formats Python code with PEP 8 compliant indentation, consistent spacing, and readable structure for scripts and modules.`,
    meta: `Free online ${name} — Formats Python code with PEP 8 compliant indentation and consistent spacing. ${localTrustClaim(category)}`,
    og: `Python formatter that applies PEP 8 compliant indentation, consistent spacing, and readable structure.`,
  }),
  'yaml': (name, deps, category) => ({
    short: `Structures YAML configuration files with consistent indentation, proper key alignment, and readable hierarchy for Docker and CI/CD configs.`,
    meta: `Free online ${name} — Structures YAML configuration files with consistent indentation and proper key alignment. ${localTrustClaim(category)}`,
    og: `YAML formatter that structures configuration files with consistent indentation, proper key alignment, and readable hierarchy.`,
  }),
  'markdown': (name, deps, category) => ({
    short: `Normalizes Markdown formatting with consistent heading spacing, list indentation, and code block structure for readable documentation.`,
    meta: `Free online ${name} — Normalizes Markdown formatting with consistent heading spacing and list indentation. ${localTrustClaim(category)}`,
    og: `Markdown formatter that normalizes formatting with consistent heading spacing, list indentation, and code block structure.`,
  }),
  'swift': (name, deps, category) => ({
    short: `Formats Swift source code with proper indentation, spacing, and bracing style for readable iOS and macOS development.`,
    meta: `Free online ${name} — Formats Swift source code with proper indentation and bracing style. ${localTrustClaim(category)}`,
    og: `Swift formatter that applies proper indentation, spacing, and bracing style for readable Apple ecosystem code.`,
  }),
  'jsonl': (name, deps, category) => ({
    short: `Pretty-prints JSON Lines data — formats each line as indented JSON for debugging, log analysis, and streaming data inspection.`,
    meta: `Free online ${name} — Pretty-prints JSON Lines data with formatted JSON per line for debugging and log analysis. ${localTrustClaim(category)}`,
    og: `JSON Lines formatter that pretty-prints each line as indented JSON for debugging, log analysis, and streaming data inspection.`,
  }),
  'sql': (name, deps, category) => ({
    short: `Formats SQL queries with proper keyword capitalization, indentation, and clause alignment for readable database operations.`,
    meta: `Free online ${name} — Formats SQL queries with proper keyword capitalization, indentation, and clause alignment. ${localTrustClaim(category)}`,
    og: `SQL formatter that applies proper keyword capitalization, indentation, and clause alignment for readable database queries.`,
  }),
  'default': (name, deps, category) => ({
    short: `Formats and beautifies content with proper indentation, consistent spacing, and readable structure for improved code clarity.`,
    meta: `Free online ${name} — Formats and beautifies content with proper indentation and consistent spacing. ${localTrustClaim(category)}`,
    og: `Content formatter that applies proper indentation, consistent spacing, and readable structure.`,
  }),
};

function identifyFormatterType(name: string, slug: string, description: string): string {
  const text = `${name} ${slug} ${description}`.toLowerCase();
  const nameSlug = `${name} ${slug}`.toLowerCase();

  // Multi-language / general formatters first (name/slug takes priority over description)
  if (nameSlug.includes('code') && nameSlug.includes('formatter')) return 'code';
  if (nameSlug.includes('beautifier') || nameSlug.includes('prettifier')) return 'code';
  if (nameSlug.includes('multi')) return 'code';

  // Specific languages — match against description (which best reflects actual capability)
  if (text.includes('json') && text.includes('xml')) return 'json';
  if (text.includes('graphql')) return 'graphql';
  if (text.includes('html')) return 'html';
  if (text.includes('css') && !text.includes('scss') && !text.includes('sass')) return 'css';
  if (text.includes('tsx')) return 'tsx';
  if (text.includes('jsx') || (text.includes('react') && !text.includes('typescript'))) return 'jsx';
  if (text.includes('typescript') || /\bts\b/.test(text)) return 'typescript';
  if (text.includes('javascript') || /\bjs\b/.test(text)) return 'javascript';
  if (text.includes('scss') || text.includes('sass')) return 'scss';
  if (text.includes('python')) return 'python';
  if (text.includes('yaml')) return 'yaml';
  if (text.includes('markdown') || /\bmd\b/.test(text)) return 'markdown';
  if (text.includes('swift')) return 'swift';
  if (text.includes('jsonl') || text.includes('json lines')) return 'jsonl';
  if (text.includes('sql')) return 'sql';
  if (text.includes('json')) return 'json';
  if (text.includes('xml')) return 'xml';

  // Broad description-based fallback
  if (text.includes('code') || text.includes('multi') || text.includes('beautifier')) return 'code';

  return 'default';
}

function isFormatterTool(name: string, slug: string, description: string): boolean {
  const nameL = name.toLowerCase();
  const slugL = slug.toLowerCase();
  const descL = description.toLowerCase();

  // Only match tools whose PRIMARY purpose is formatting
  // Must have "formatter", "beautifier", "prettifier" in name or slug
  if (nameL.includes('formatter') || nameL.includes('beautifier') || nameL.includes('prettifier')) return true;
  if (slugL.includes('formatter') || slugL.includes('beautifier') || slugL.includes('prettifier')) return true;

  // Or description starts with "Format and beautify" / "Format and prettify" (the boilerplate pattern)
  if (descL.startsWith('format and beautify') || descL.startsWith('format and prettify')) return true;

  return false;
}

function generateConverterDescription(tool: ToolMetadata, pair: { from: string; to: string }): DescriptionVariants {
  const fromInfo = FORMAT_INFO[pair.from]!;
  const toInfo = FORMAT_INFO[pair.to]!;

  return {
    short: `Converts ${fromInfo.name} files to ${toInfo.name} format — ${fromInfo.bestFor.split(' — ')[0]} to ${toInfo.bestFor.split(' — ')[0]}. All conversion happens locally in your browser with no file size limits.`,
    meta: `Free online ${tool.name} — Converts ${fromInfo.name} (${fromInfo.fullName}) to ${toInfo.name} (${toInfo.fullName}) format. ${fromInfo.quality} to ${toInfo.quality}. ${trustClaimFor(tool)}`,
    og: `${tool.name} converts ${fromInfo.name} files to ${toInfo.name} format, transforming ${fromInfo.quality} data to ${toInfo.quality} encoding for ${toInfo.bestFor}.`,
  };
}

function generateGenericDescription(tool: ToolMetadata): DescriptionVariants {
  const category = tool.category;
  const deps = tool.dependencies;
  const name = tool.name.toLowerCase();
  const desc = tool.description.toLowerCase();
  const text = `${name} ${desc}`;

  // Detect specific actions and targets from tool name/description
  let action = '';
  let target = '';

  if (text.includes('generate') || text.includes('generator') || text.includes('create')) {
    action = 'generates';
    if (text.includes('password')) target = 'secure random passwords';
    else if (text.includes('uuid')) target = 'unique identifiers';
    else if (text.includes('color')) target = 'random color values';
    else if (text.includes('token')) target = 'cryptographic tokens';
    else if (text.includes('string')) target = 'random strings';
    else if (text.includes('number')) target = 'random numbers';
    else if (text.includes('date')) target = 'random dates';
    else if (text.includes('time')) target = 'random times';
    else if (text.includes('ip')) target = 'random IP addresses';
    else if (text.includes('user-agent')) target = 'browser user-agent strings';
    else if (text.includes('sentence')) target = 'random sentences';
    else if (text.includes('word')) target = 'random words';
    else if (text.includes('nickname')) target = 'creative nicknames';
    else if (text.includes('coupon') || text.includes('discount')) target = 'discount codes';
    else if (text.includes('placeholder')) target = 'placeholder content';
    else if (text.includes('logo')) target = 'logo designs';
    else if (text.includes('svg')) target = 'SVG graphics';
    else target = 'output based on your configuration';
  } else if (text.includes('convert') || text.includes('converter')) {
    action = 'converts';
    // Try to extract from/to from the name
    const fromToMatch = name.match(/(\w+)\s+to\s+(\w+)/);
    if (fromToMatch) {
      target = `${fromToMatch[1]} files to ${fromToMatch[2]} format`;
    } else {
      target = 'data between formats';
    }
  } else if (text.includes('calculate') || text.includes('calculator')) {
    action = 'calculates';
    if (text.includes('age')) target = 'precise age from birth dates';
    else if (text.includes('percentage')) target = 'percentage values';
    else if (text.includes('interest')) target = 'interest calculations';
    else if (text.includes('tip')) target = 'tip amounts';
    else if (text.includes('bmi')) target = 'BMI measurements';
    else target = 'values with precision';
  } else if (text.includes('check') || text.includes('validator') || text.includes('verify')) {
    action = 'validates';
    if (text.includes('password')) target = 'password strength';
    else if (text.includes('email')) target = 'email addresses';
    else if (text.includes('url')) target = 'URLs';
    else if (text.includes('json')) target = 'JSON syntax';
    else if (text.includes('xml')) target = 'XML structure';
    else target = 'input against defined criteria';
  } else if (text.includes('extract')) {
    action = 'extracts';
    if (text.includes('audio')) target = 'audio tracks from video files';
    else if (text.includes('text')) target = 'text content from documents';
    else if (text.includes('image')) target = 'images from documents';
    else if (text.includes('metadata')) target = 'metadata from files';
    else target = 'specific content from your files';
  } else if (text.includes('compress') || text.includes('resize')) {
    action = 'optimizes';
    if (text.includes('image')) target = 'image file sizes';
    else if (text.includes('pdf')) target = 'PDF file sizes';
    else if (text.includes('video')) target = 'video file sizes';
    else if (text.includes('audio')) target = 'audio file sizes';
    else target = 'file sizes while preserving quality';
  } else if (text.includes('merge') || text.includes('combine')) {
    action = 'combines';
    if (text.includes('pdf')) target = 'PDF documents';
    else if (text.includes('image') || text.includes('jpg') || text.includes('png')) target = 'images';
    else target = 'multiple files into one';
  } else if (text.includes('split') || text.includes('separate')) {
    action = 'separates';
    if (text.includes('pdf')) target = 'PDF pages';
    else target = 'content into individual files';
  } else if (text.includes('encrypt') || text.includes('decrypt')) {
    action = 'processes';
    if (text.includes('aes') || text.includes('cipher')) target = 'data with AES encryption';
    else if (text.includes('pgp')) target = 'data with PGP encryption';
    else target = 'data with encryption';
  } else if (text.includes('hash')) {
    action = 'computes';
    if (text.includes('md5')) target = 'MD5 hashes';
    else if (text.includes('sha')) target = 'SHA hashes';
    else if (text.includes('hmac')) target = 'HMAC hashes';
    else target = 'cryptographic hashes';
  } else if (text.includes('password')) {
    action = 'generates';
    target = 'secure random passwords';
  } else if (text.includes('lookup') || text.includes('search')) {
    action = 'looks up';
    if (text.includes('ifsc')) target = 'IFSC codes';
    else if (text.includes('pincode') || text.includes('pin')) target = 'pincodes';
    else if (text.includes('dns')) target = 'DNS records';
    else if (text.includes('ip')) target = 'IP addresses';
    else target = 'information from built-in databases';
  } else if (text.includes('analyze') || text.includes('analysis')) {
    action = 'analyzes';
    if (text.includes('json')) target = 'JSON structure';
    else if (text.includes('log')) target = 'log files';
    else if (text.includes('har')) target = 'HAR files';
    else if (text.includes('package')) target = 'package.json files';
    else target = 'content for insights';
  } else if (text.includes('format') || text.includes('beautify') || text.includes('prettify')) {
    action = 'formats';
    if (text.includes('json')) target = 'JSON data';
    else if (text.includes('xml')) target = 'XML documents';
    else if (text.includes('html')) target = 'HTML markup';
    else if (text.includes('css')) target = 'CSS stylesheets';
    else if (text.includes('javascript') || text.includes('js')) target = 'JavaScript code';
    else if (text.includes('typescript') || text.includes('ts')) target = 'TypeScript code';
    else if (text.includes('python')) target = 'Python code';
    else if (text.includes('sql')) target = 'SQL queries';
    else if (text.includes('yaml')) target = 'YAML files';
    else if (text.includes('markdown')) target = 'Markdown documents';
    else target = 'content with proper structure';
  } else if (text.includes('encode') || text.includes('decode')) {
    action = 'processes';
    if (text.includes('base64')) target = 'Base64 encoding';
    else if (text.includes('url')) target = 'URL encoding';
    else if (text.includes('jwt')) target = 'JWT tokens';
    else target = 'data encoding transformations';
  } else if (text.includes('translate')) {
    action = 'translates';
    target = 'content between languages';
  } else if (text.includes('remove') || text.includes('delete') || text.includes('clear')) {
    action = 'removes';
    if (text.includes('background')) target = 'image backgrounds';
    else if (text.includes('metadata')) target = 'file metadata';
    else if (text.includes('watermark')) target = 'watermarks';
    else target = 'unwanted data';
  } else if (text.includes('scan') || text.includes('detect')) {
    action = 'scans';
    if (text.includes('cookie')) target = 'browser cookies';
    else if (text.includes('malware')) target = 'malware';
    else target = 'for specific patterns or issues';
  } else if (text.includes('measure') || text.includes('test') || text.includes('speed')) {
    action = 'measures';
    if (text.includes('speed') || text.includes('internet')) target = 'internet speed';
    else if (text.includes('font')) target = 'font sizes';
    else target = 'performance metrics';
  } else if (text.includes('draw') || text.includes('paint') || text.includes('sketch')) {
    action = 'creates';
    target = 'visual content';
  } else if (text.includes('play') || text.includes('game')) {
    action = 'provides';
    target = 'interactive entertainment';
  } else if (text.includes('convert') || text.includes('conversion')) {
    action = 'converts';
    target = 'data between formats';
  } else if (text.includes('crop') || text.includes('trim')) {
    action = 'crops';
    target = text.includes('video') ? 'video clips to your desired length and dimensions' : text.includes('audio') ? 'audio segments to remove unwanted silence' : 'images to remove unwanted edges and resize';
  } else if (text.includes('rotate') || text.includes('flip')) {
    action = 'rotates';
    target = 'media files — images, videos, or PDFs — to the correct orientation';
  } else if (text.includes('watermark')) {
    action = 'adds';
    target = 'visible or invisible watermarks to protect your media files';
  } else if (text.includes('cutter') || text.includes('cut') || text.includes('slice')) {
    action = 'cuts';
    target = 'media files into smaller segments or clips';
  } else if (text.includes('normaliz') || text.includes('normalise')) {
    action = 'normalizes';
    target = 'audio volume levels to a consistent standard across your files';
  } else if (text.includes('timer')) {
    action = 'provides';
    target = 'a customizable countdown timer with alerts and presets';
  } else if (text.includes('picker') || text.includes('selector') || (text.includes('color') && text.includes('tool'))) {
    action = 'helps you pick';
    target = 'colors, values, or options with a visual interface';
  } else if (text.includes('editor') || text.includes('edit')) {
    action = 'provides';
    target = 'editing capabilities for modifying and refining your content';
  } else if (text.includes('styling') || text.includes('style') || text.includes('beautify')) {
    action = 'helps style';
    target = 'text with decorative formatting, fonts, and visual effects';
  } else if (text.includes('minif') || text.includes('minify') || text.includes('compress') || text.includes('resize') || text.includes('reduce') || text.includes('optimiz') || text.includes('optimise')) {
    action = 'optimizes';
    target = text.includes('image') ? 'image file sizes while preserving visual quality' : text.includes('pdf') ? 'PDF file sizes for easier sharing' : text.includes('video') ? 'video file sizes with adjustable quality' : text.includes('audio') ? 'audio file sizes with configurable bitrate' : 'file sizes while preserving as much quality as possible';
  } else if (text.includes('linter') || text.includes('lint')) {
    action = 'lints';
    target = 'your code against best practices and style rules';
  } else if (text.includes('finder') || text.includes('find') || text.includes('locate')) {
    action = 'finds';
    target = 'information from your input — domains, patterns, or matching records';
  } else if (text.includes('obfuscat')) {
    action = 'obfuscates';
    target = 'your code to protect it from reverse engineering';
  } else if (text.includes('replac') || text.includes('substitut') || text.includes('switcher')) {
    action = 'replaces';
    target = 'text patterns, values, or characters with your specified alternatives';
  } else if (text.includes('anonymiz') || text.includes('anonymiser')) {
    action = 'anonymizes';
    target = 'sensitive data by masking or removing personal information';
  } else if (text.includes('reverser') || text.includes('reverse')) {
    action = 'reverses';
    target = 'text, strings, or arrays to produce the mirrored output';
  } else if (text.includes('repeater') || text.includes('repeat') || text.includes('duplicate')) {
    action = 'repeats';
    target = 'text or patterns a specified number of times';
  } else if (text.includes('repair') || text.includes('fix')) {
    action = 'repairs';
    target = 'corrupted or malformed files to restore their usability';
  } else if (text.includes('stamp')) {
    action = 'stamps';
    target = 'documents with dates, text, or images for official records';
  } else if (text.includes('annotat')) {
    action = 'annotates';
    target = 'documents with comments, highlights, and markup';
  } else if (text.includes('obfuscat')) {
    action = 'obfuscates';
    target = 'code to make it harder to read while preserving functionality';
  } else {
    const catLower = (tool.category || '').toLowerCase();
    const catTargets: Record<string, [string, string]> = {
      'utility': ['provides', 'everyday tools — generators, converters, calculators, and analyzers'],
      'calculator': ['calculates', 'mathematical, financial, and statistical values with precision'],
      'health': ['calculates', 'health and fitness metrics based on your personal data'],
      'branding': ['helps create', 'brand assets — logos, color palettes, and marketing materials'],
      'design': ['provides', 'design and visualization tools for creative projects'],
      'transcription': ['converts', 'speech and audio content into written text'],
      'productivity': ['helps manage', 'tasks, time, and daily workflows'],
      'converter': ['converts', 'data between different formats and file types'],
      'developer': ['provides', 'development utilities — formatters, validators, and code tools'],
      'image': ['processes', 'images with editing, conversion, and optimization'],
      'audio': ['processes', 'audio files with conversion, editing, and analysis'],
      'video': ['processes', 'video files with conversion, editing, and compression'],
      'pdf': ['processes', 'PDF documents with conversion, editing, and optimization'],
      'text': ['processes', 'text content with transformation, analysis, and conversion'],
      'seo': ['helps optimize', 'website content for search engine performance'],
      'finance': ['calculates', 'financial metrics, rates, and projections'],
      'privacy': ['helps protect', 'sensitive data with encryption and security tools'],
      'ai': ['provides', 'AI-powered content generation and analysis'],
      'indian-utilities': ['provides', 'India-specific utility tools for everyday needs'],
      'extension': ['generates', 'browser extension source code for your needs'],
    };
    if (catLower in catTargets) {
      [action, target] = catTargets[catLower]!;
    } else {
      action = 'processes';
      target = 'your data';
    }
  }

  return {
    short: `${tool.name} ${action} ${target} entirely in your browser. ${trustClaimFor(tool)}`,
    meta: `Free online ${tool.name} — ${tool.name.charAt(0).toLowerCase() + tool.name.slice(1)} ${action} ${target}. ${trustClaimFor(tool)}`,
    og: `${tool.name} ${action} ${target} entirely in your browser. ${trustClaimFor(tool)}`,
  };
}

/**
 * Verdict-gated trust claim (Oct 5 Tier A). Local tools get the
 * category-specific sentence; cloud/hybrid get their honest labels;
 * unverified tools get NO claim (previous code emitted the local sentence
 * for anything that wasn't positively cloud — a false-claim vector).
 */
function trustClaimFor(tool: ToolMetadata): string {
  const v = classifyDependencies(tool.dependencies);
  if (v === "cloud") return ` ${CLOUD_TRUST_CLAIM}`;
  if (v === "hybrid") return ` ${HYBRID_TRUST_CLAIM}`;
  if (v === "unverified") return '';
  return ` ${localTrustClaim(tool.category)}`;
}

export function generateToolDescription(tool: ToolMetadata): DescriptionVariants {
  const pair = parseFormatPair(tool.slug);

  if (pair) {
    return generateConverterDescription(tool, pair);
  }

  if (isFormatterTool(tool.name, tool.slug, tool.description)) {
    const formatterType = identifyFormatterType(tool.name, tool.slug, tool.description);
    const generator = formatterVariants[formatterType] || formatterVariants['default']!;
    return generator(tool.name, tool.dependencies, tool.category);
  }

  // For non-formatter, non-converter tools: use the tool's own description as the base
  // Only add the "browser-based" suffix if it's not already there
  const depVerdict = classifyDependencies(tool.dependencies);
  const baseDesc = tool.description;

  let suffix: string;
  if (depVerdict === "cloud") {
    suffix = ` ${CLOUD_TRUST_CLAIM}`;
  } else if (depVerdict === "hybrid") {
    suffix = ` ${HYBRID_TRUST_CLAIM}`;
  } else if (depVerdict === "unverified") {
    // Don't make a trust claim we can't back — omit the suffix entirely
    // and flag for manual review via the description audit
    suffix = '';
  } else {
    suffix = ` ${localTrustClaim(tool.category)}`;
  }

  // If the original description already mentions browser/local/private, don't append
  // Also skip if suffix is empty (unverified deps — no trust claim made)
  const alreadyMentionsPrivacy = !suffix || baseDesc.toLowerCase().includes('browser') ||
    baseDesc.toLowerCase().includes('local') ||
    baseDesc.toLowerCase().includes('privacy') ||
    baseDesc.toLowerCase().includes('uploaded') ||
    baseDesc.toLowerCase().includes('client-side');

  const short = alreadyMentionsPrivacy ? baseDesc : `${baseDesc}${suffix}`;

  return {
    short,
    meta: tool.seoDescription || `Free online ${tool.name} — ${baseDesc.charAt(0).toLowerCase() + baseDesc.slice(1)}${alreadyMentionsPrivacy ? '' : suffix}`,
    og: short,
  };
}

export function getShortDescription(tool: ToolMetadata): string {
  return generateToolDescription(tool).short;
}

export function getMetaDescription(tool: ToolMetadata): string {
  return tool.seoDescription || generateToolDescription(tool).meta;
}

export function getOgDescription(tool: ToolMetadata): string {
  return generateToolDescription(tool).og;
}

export function getToolTitle(tool: ToolMetadata): string {
  return tool.seoTitle || `${tool.name} – Free Online Tool`;
}

/**
 * Returns all tools whose dependencies are non-empty but don't match
 * any known cloud or local pattern. These need manual verification
 * before a trust claim ("runs locally" / "cloud-based") can be made.
 */
export function getUnverifiedDependencyTools(
  tools: ToolMetadata[]
): { name: string; category: string; slug: string; dependencies: string }[] {
  return tools
    .filter((t) => classifyDependencies(t.dependencies) === "unverified")
    .map((t) => ({
      name: t.name,
      category: t.category,
      slug: t.slug,
      dependencies: t.dependencies,
    }));
}
