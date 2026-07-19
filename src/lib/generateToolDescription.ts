import type { ToolMetadata } from "@/registry/tools";
import { requiresCloudApi, classifyDependencies, LOCAL_TRUST_CLAIM, CLOUD_TRUST_CLAIM } from "@/lib/cloudPatterns";

const formatInfo: Record<string, { name: string; fullName: string; quality: string; bestFor: string }> = {
  json: { name: 'JSON', fullName: 'JavaScript Object Notation', quality: 'human-readable structured data', bestFor: 'APIs, configuration files, and data exchange between web services' },
  xml: { name: 'XML', fullName: 'Extensible Markup Language', quality: 'verbose hierarchical markup', bestFor: 'enterprise systems, SOAP APIs, document formats like DOCX and SVG' },
  yaml: { name: 'YAML', fullName: 'YAML Ain\'t Markup Language', quality: 'human-friendly configuration', bestFor: 'Docker, Kubernetes, CI/CD pipelines, and application settings' },
  toml: { name: 'TOML', fullName: 'Tom\'s Obvious Minimal Language', quality: 'explicit key-value configuration', bestFor: 'Rust Cargo, Python pyproject.toml, and modern config files' },
  csv: { name: 'CSV', fullName: 'Comma-Separated Values', quality: 'tabular plain text', bestFor: 'spreadsheets, database exports, and data imports' },
  html: { name: 'HTML', fullName: 'HyperText Markup Language', quality: 'semantic document markup', bestFor: 'web pages, email templates, and content rendering' },
  css: { name: 'CSS', fullName: 'Cascading Style Sheets', quality: 'styling rules', bestFor: 'web design, responsive layouts, and visual presentation' },
  js: { name: 'JavaScript', fullName: 'JavaScript', quality: 'dynamic scripting', bestFor: 'web interactivity, Node.js backends, and browser automation' },
  ts: { name: 'TypeScript', fullName: 'TypeScript', quality: 'typed JavaScript superset', bestFor: 'large-scale applications with type safety and better IDE support' },
  jsx: { name: 'JSX', fullName: 'JavaScript XML', quality: 'component markup', bestFor: 'React component definitions and UI rendering' },
  tsx: { name: 'TSX', fullName: 'TypeScript JSX', quality: 'typed component markup', bestFor: 'React components with TypeScript type checking' },
  py: { name: 'Python', fullName: 'Python', quality: 'readable scripting', bestFor: 'data science, automation, web backends, and machine learning' },
  sql: { name: 'SQL', fullName: 'Structured Query Language', quality: 'database query', bestFor: 'relational database operations, data analysis, and reporting' },
  md: { name: 'Markdown', fullName: 'Markdown', quality: 'lightweight markup', bestFor: 'documentation, README files, and content authoring' },
  svg: { name: 'SVG', fullName: 'Scalable Vector Graphics', quality: 'vector markup', bestFor: 'logos, icons, and resolution-independent graphics' },
  scss: { name: 'SCSS', fullName: 'Sassy CSS', quality: 'preprocessed styles', bestFor: 'large-scale CSS with variables, mixins, and nesting' },
  sass: { name: 'Sass', fullName: 'Syntactically Awesome Style Sheets', quality: 'indented syntax', bestFor: 'concise CSS with minimal punctuation' },
  graphql: { name: 'GraphQL', fullName: 'GraphQL', quality: 'type-safe API query', bestFor: 'efficient data fetching with precise field selection' },
  ini: { name: 'INI', fullName: 'Initialization File', quality: 'simple key-value config', bestFor: 'application settings and legacy configuration' },
  swift: { name: 'Swift', fullName: 'Swift', quality: 'compiled systems language', bestFor: 'iOS/macOS apps and high-performance Apple ecosystem software' },
  java: { name: 'Java', fullName: 'Java', quality: 'compiled bytecode', bestFor: 'enterprise applications, Android apps, and cross-platform systems' },
  c: { name: 'C', fullName: 'C', quality: 'systems programming', bestFor: 'operating systems, embedded firmware, and performance-critical code' },
  cpp: { name: 'C++', fullName: 'C++', quality: 'systems with OOP', bestFor: 'game engines, high-performance computing, and system software' },
  go: { name: 'Go', fullName: 'Go', quality: 'compiled concurrency', bestFor: 'microservices, cloud infrastructure, and network tools' },
  rust: { name: 'Rust', fullName: 'Rust', quality: 'memory-safe systems', bestFor: 'WebAssembly, CLI tools, and performance-critical applications' },
  php: { name: 'PHP', fullName: 'PHP', quality: 'server-side scripting', bestFor: 'WordPress, Laravel, and web backends' },
  ruby: { name: 'Ruby', fullName: 'Ruby', quality: 'dynamic OOP scripting', bestFor: 'Rails applications, scripting, and rapid prototyping' },
  dart: { name: 'Dart', fullName: 'Dart', quality: 'compiled client language', bestFor: 'Flutter mobile apps and web frontends' },
  lua: { name: 'Lua', fullName: 'Lua', quality: 'lightweight scripting', bestFor: 'game scripting, embedded systems, and configuration' },
  mp3: { name: 'MP3', fullName: 'MPEG-1 Audio Layer 3', quality: 'lossy compressed', bestFor: 'universal music playback and sharing across all devices' },
  wav: { name: 'WAV', fullName: 'Waveform Audio File Format', quality: 'uncompressed lossless', bestFor: 'professional audio editing, mastering, and archival in DAWs' },
  flac: { name: 'FLAC', fullName: 'Free Lossless Audio Codec', quality: 'losslessly compressed', bestFor: 'high-fidelity music archives and audiophile listening' },
  ogg: { name: 'OGG', fullName: 'Ogg Vorbis', quality: 'lossy compressed', bestFor: 'open-source software, Linux systems, and game development' },
  m4a: { name: 'M4A', fullName: 'MPEG-4 Audio', quality: 'lossy or lossless', bestFor: 'Apple ecosystem — iTunes, iPhones, and macOS music libraries' },
  aac: { name: 'AAC', fullName: 'Advanced Audio Coding', quality: 'lossy compressed', bestFor: 'modern streaming services, YouTube, and mobile devices' },
  wma: { name: 'WMA', fullName: 'Windows Media Audio', quality: 'lossy compressed', bestFor: 'Windows-based media libraries and legacy devices' },
  opus: { name: 'Opus', fullName: 'Opus Interactive Audio Codec', quality: 'lossy compressed', bestFor: 'voice-over-IP, real-time communication, and low-bitrate streaming' },
  aiff: { name: 'AIFF', fullName: 'Audio Interchange File Format', quality: 'uncompressed lossless', bestFor: 'Apple professional audio — Logic Pro and macOS music production' },
  mp4: { name: 'MP4', fullName: 'MPEG-4 Part 14', quality: 'lossy compressed', bestFor: 'universal video playback on any device — phones, TVs, browsers' },
  mov: { name: 'MOV', fullName: 'QuickTime Movie', quality: 'lossless or lossy', bestFor: 'Apple ecosystem — Final Cut Pro and macOS video editing' },
  webm: { name: 'WebM', fullName: 'WebM Video', quality: 'lossy compressed', bestFor: 'web-optimized video — streaming and HTML5 video tags' },
  avi: { name: 'AVI', fullName: 'Audio Video Interleave', quality: 'uncompressed or lossy', bestFor: 'legacy video compatibility — older software and embedded systems' },
  mkv: { name: 'MKV', fullName: 'Matroska Video', quality: 'lossless container', bestFor: 'advanced video archiving with multiple tracks and subtitles' },
  png: { name: 'PNG', fullName: 'Portable Network Graphics', quality: 'lossless', bestFor: 'graphics with sharp edges, text overlays, and transparent backgrounds' },
  jpg: { name: 'JPEG', fullName: 'Joint Photographic Experts Group', quality: 'lossy compressed', bestFor: 'photographs, web images, and social media content' },
  webp: { name: 'WebP', fullName: 'Web Picture Format', quality: 'lossy or lossless', bestFor: 'modern websites — superior compression for faster page loads' },
  heic: { name: 'HEIC', fullName: 'High Efficiency Image Container', quality: 'lossy or lossless', bestFor: 'Apple device photos — iPhone and Mac default format' },
  avif: { name: 'AVIF', fullName: 'AV1 Image File Format', quality: 'lossy or lossless', bestFor: 'next-gen web images — royalty-free with better compression' },
  gif: { name: 'GIF', fullName: 'Graphics Interchange Format', quality: 'lossy (256 colors)', bestFor: 'simple animations, memes, and social media content' },
  ico: { name: 'ICO', fullName: 'Windows Icon', quality: 'lossless (multiple sizes)', bestFor: 'favicons and app icons for websites and applications' },
  bmp: { name: 'BMP', fullName: 'Bitmap Image File', quality: 'uncompressed', bestFor: 'legacy software compatibility and raw pixel data transfers' },
  tiff: { name: 'TIFF', fullName: 'Tagged Image File Format', quality: 'lossless (supports layers)', bestFor: 'professional photography, print publishing, and document scanning' },
  jxl: { name: 'JPEG XL', fullName: 'JPEG XL', quality: 'lossy or lossless', bestFor: 'next-gen image archival — better compression with HDR support' },
  pdf: { name: 'PDF', fullName: 'Portable Document Format', quality: 'fixed-layout document', bestFor: 'document sharing, printing, and archival with consistent formatting' },
  docx: { name: 'DOCX', fullName: 'Microsoft Word Document', quality: 'editable document', bestFor: 'word processing, collaboration, and document editing' },
  pptx: { name: 'PPTX', fullName: 'Microsoft PowerPoint', quality: 'presentation format', bestFor: 'slide decks, presentations, and visual storytelling' },
  xlsx: { name: 'XLSX', fullName: 'Microsoft Excel Spreadsheet', quality: 'tabular data', bestFor: 'data analysis, calculations, and spreadsheet operations' },
  epub: { name: 'EPUB', fullName: 'Electronic Publication', quality: 'reflowable ebook', bestFor: 'e-readers, mobile devices, and accessible digital books' },
  eml: { name: 'EML', fullName: 'Email Message', quality: 'email archive format', bestFor: 'email backup, archival, and forensic analysis' },
  jsonl: { name: 'JSONL', fullName: 'JSON Lines', quality: 'newline-delimited JSON', bestFor: 'streaming data, log files, and line-by-line processing' },
  pbf: { name: 'Protocol Buffers', fullName: 'Protocol Buffers', quality: 'binary serialization', bestFor: 'gRPC services, efficient data storage, and cross-platform communication' },
  protobuf: { name: 'Protocol Buffers', fullName: 'Protocol Buffers', quality: 'binary serialization', bestFor: 'gRPC services, efficient data storage, and cross-platform communication' },
};

function parseFormatPair(slug: string): { from: string; to: string } | null {
  const match = slug.match(/^([a-z0-9]+)-to-([a-z0-9]+)$/);
  if (!match) return null;
  const [, from, to] = match;
  if (formatInfo[from] && formatInfo[to]) return { from, to };
  return null;
}

interface DescriptionVariants {
  short: string;
  meta: string;
  og: string;
}

const formatterVariants: Record<string, (name: string, deps: string) => DescriptionVariants> = {
  'json': (name, deps) => ({
    short: `Prettifies JSON data with configurable indentation, sorting, and syntax validation — fixes malformed JSON and makes nested structures readable.`,
    meta: `Free online ${name} — Prettifies JSON data with configurable indentation, sorting, and syntax validation. Fixes malformed JSON and makes nested structures readable. ${LOCAL_TRUST_CLAIM}`,
    og: `JSON formatter that prettifies data with configurable indentation and sorting, validates syntax, and fixes malformed JSON — entirely client-side.`,
  }),
  'xml': (name, deps) => ({
    short: `Pretty-prints XML documents with proper tree indentation, validates structure, and reorganizes attributes for maximum readability.`,
    meta: `Free online ${name} — Pretty-prints XML documents with proper tree indentation, validates structure, and reorganizes attributes. ${LOCAL_TRUST_CLAIM}`,
    og: `XML formatter that pretty-prints documents with tree indentation, validates structure, and reorganizes attributes for readability.`,
  }),
  'graphql': (name, deps) => ({
    short: `Formats GraphQL queries and mutations with consistent indentation, argument spacing, and fragment organization for readable API schemas.`,
    meta: `Free online ${name} — Formats GraphQL queries and mutations with consistent indentation and argument spacing. ${LOCAL_TRUST_CLAIM}`,
    og: `GraphQL formatter that applies consistent indentation, argument spacing, and fragment organization to queries and mutations.`,
  }),
  'code': (name, deps) => ({
    short: `Auto-formats source code across 15+ languages — JavaScript, Python, HTML, CSS, SQL, YAML — with language-aware indentation and syntax rules.`,
    meta: `Free online ${name} — Auto-formats source code across 15+ languages with language-aware indentation and syntax rules. ${LOCAL_TRUST_CLAIM}`,
    og: `Multi-language code formatter that applies language-aware indentation and syntax rules to JavaScript, Python, HTML, CSS, SQL, and more.`,
  }),
  'html': (name, deps) => ({
    short: `Indents and structures HTML markup with proper nesting, attribute alignment, and readable indentation for templates and email designs.`,
    meta: `Free online ${name} — Indents and structures HTML markup with proper nesting, attribute alignment, and readable indentation. ${LOCAL_TRUST_CLAIM}`,
    og: `HTML formatter that indents and structures markup with proper nesting, attribute alignment, and readable indentation.`,
  }),
  'css': (name, deps) => ({
    short: `Organizes CSS stylesheets with consistent indentation, property grouping, and selector formatting for maintainable styles.`,
    meta: `Free online ${name} — Organizes CSS stylesheets with consistent indentation, property grouping, and selector formatting. ${LOCAL_TRUST_CLAIM}`,
    og: `CSS formatter that organizes stylesheets with consistent indentation, property grouping, and selector formatting.`,
  }),
  'javascript': (name, deps) => ({
    short: `Formats JavaScript code with proper indentation, consistent spacing, and syntax structure — supports modern ES6+ features and async patterns.`,
    meta: `Free online ${name} — Formats JavaScript code with proper indentation and syntax structure. Supports ES6+ and async patterns. ${LOCAL_TRUST_CLAIM}`,
    og: `JavaScript formatter that applies proper indentation and syntax structure, supporting ES6+ features and async patterns.`,
  }),
  'typescript': (name, deps) => ({
    short: `Formats TypeScript code with type-aware indentation, interface alignment, and consistent syntax structure for large codebases.`,
    meta: `Free online ${name} — Formats TypeScript code with type-aware indentation and interface alignment. ${LOCAL_TRUST_CLAIM}`,
    og: `TypeScript formatter that applies type-aware indentation, interface alignment, and consistent syntax structure.`,
  }),
  'jsx': (name, deps) => ({
    short: `Formats JSX/React component code with proper indentation, prop alignment, and JSX expression structure for readable component definitions.`,
    meta: `Free online ${name} — Formats JSX/React code with proper indentation, prop alignment, and JSX expression structure. ${LOCAL_TRUST_CLAIM}`,
    og: `JSX formatter that applies proper indentation, prop alignment, and JSX expression structure to React components.`,
  }),
  'tsx': (name, deps) => ({
    short: `Formats TSX/React TypeScript components with type-aware indentation, prop type alignment, and clean JSX structure.`,
    meta: `Free online ${name} — Formats TSX/React TypeScript components with type-aware indentation and prop alignment. ${LOCAL_TRUST_CLAIM}`,
    og: `TSX formatter that applies type-aware indentation, prop type alignment, and clean JSX structure to React TypeScript components.`,
  }),
  'scss': (name, deps) => ({
    short: `Organizes SCSS/Sass stylesheets with proper nesting indentation, variable alignment, and mixin formatting for maintainable styles.`,
    meta: `Free online ${name} — Organizes SCSS/Sass stylesheets with proper nesting indentation and variable alignment. ${LOCAL_TRUST_CLAIM}`,
    og: `SCSS formatter that organizes stylesheets with proper nesting indentation, variable alignment, and mixin formatting.`,
  }),
  'python': (name, deps) => ({
    short: `Formats Python code with PEP 8 compliant indentation, consistent spacing, and readable structure for scripts and modules.`,
    meta: `Free online ${name} — Formats Python code with PEP 8 compliant indentation and consistent spacing. ${LOCAL_TRUST_CLAIM}`,
    og: `Python formatter that applies PEP 8 compliant indentation, consistent spacing, and readable structure.`,
  }),
  'yaml': (name, deps) => ({
    short: `Structures YAML configuration files with consistent indentation, proper key alignment, and readable hierarchy for Docker and CI/CD configs.`,
    meta: `Free online ${name} — Structures YAML configuration files with consistent indentation and proper key alignment. ${LOCAL_TRUST_CLAIM}`,
    og: `YAML formatter that structures configuration files with consistent indentation, proper key alignment, and readable hierarchy.`,
  }),
  'markdown': (name, deps) => ({
    short: `Normalizes Markdown formatting with consistent heading spacing, list indentation, and code block structure for readable documentation.`,
    meta: `Free online ${name} — Normalizes Markdown formatting with consistent heading spacing and list indentation. ${LOCAL_TRUST_CLAIM}`,
    og: `Markdown formatter that normalizes formatting with consistent heading spacing, list indentation, and code block structure.`,
  }),
  'swift': (name, deps) => ({
    short: `Formats Swift source code with proper indentation, spacing, and bracing style for readable iOS and macOS development.`,
    meta: `Free online ${name} — Formats Swift source code with proper indentation and bracing style. ${LOCAL_TRUST_CLAIM}`,
    og: `Swift formatter that applies proper indentation, spacing, and bracing style for readable Apple ecosystem code.`,
  }),
  'jsonl': (name, deps) => ({
    short: `Pretty-prints JSON Lines data — formats each line as indented JSON for debugging, log analysis, and streaming data inspection.`,
    meta: `Free online ${name} — Pretty-prints JSON Lines data with formatted JSON per line for debugging and log analysis. ${LOCAL_TRUST_CLAIM}`,
    og: `JSON Lines formatter that pretty-prints each line as indented JSON for debugging, log analysis, and streaming data inspection.`,
  }),
  'sql': (name, deps) => ({
    short: `Formats SQL queries with proper keyword capitalization, indentation, and clause alignment for readable database operations.`,
    meta: `Free online ${name} — Formats SQL queries with proper keyword capitalization, indentation, and clause alignment. ${LOCAL_TRUST_CLAIM}`,
    og: `SQL formatter that applies proper keyword capitalization, indentation, and clause alignment for readable database queries.`,
  }),
  'default': (name, deps) => ({
    short: `Formats and beautifies content with proper indentation, consistent spacing, and readable structure for improved code clarity.`,
    meta: `Free online ${name} — Formats and beautifies content with proper indentation and consistent spacing. ${LOCAL_TRUST_CLAIM}`,
    og: `Content formatter that applies proper indentation, consistent spacing, and readable structure.`,
  }),
};

function identifyFormatterType(name: string, slug: string, description: string): string {
  const text = `${name} ${slug} ${description}`.toLowerCase();

  // Specific languages first (before broad 'code' check)
  if (text.includes('json') && text.includes('xml')) return 'json';
  if (text.includes('graphql')) return 'graphql';
  if (text.includes('html')) return 'html';
  if (text.includes('css') && !text.includes('scss') && !text.includes('sass')) return 'css';
  if (text.includes('tsx')) return 'tsx';
  if (text.includes('jsx') || (text.includes('react') && !text.includes('typescript'))) return 'jsx';
  if (text.includes('typescript') || text.includes('ts ')) return 'typescript';
  if (text.includes('javascript') || text.includes('js ')) return 'javascript';
  if (text.includes('scss') || text.includes('sass')) return 'scss';
  if (text.includes('python')) return 'python';
  if (text.includes('yaml')) return 'yaml';
  if (text.includes('markdown') || text.includes('md ')) return 'markdown';
  if (text.includes('swift')) return 'swift';
  if (text.includes('jsonl') || text.includes('json lines')) return 'jsonl';
  if (text.includes('sql')) return 'sql';
  if (text.includes('json')) return 'json';
  if (text.includes('xml')) return 'xml';

  // Multi-language formatter last
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
  const fromInfo = formatInfo[pair.from];
  const toInfo = formatInfo[pair.to];

  return {
    short: `Converts ${fromInfo.name} files to ${toInfo.name} format — ${fromInfo.bestFor.split(' — ')[0]} to ${toInfo.bestFor.split(' — ')[0]}. All conversion happens locally in your browser with no file size limits.`,
    meta: `Free online ${tool.name} — Converts ${fromInfo.name} (${fromInfo.fullName}) to ${toInfo.name} (${toInfo.fullName}) format. ${fromInfo.quality} to ${toInfo.quality}. ${LOCAL_TRUST_CLAIM}`,
    og: `${tool.name} converts ${fromInfo.name} files to ${toInfo.name} format, transforming ${fromInfo.quality} data to ${toInfo.quality} encoding for ${toInfo.bestFor}.`,
  };
}

function generateGenericDescription(tool: ToolMetadata): DescriptionVariants {
  const category = tool.category;
  const deps = tool.dependencies;
  const requiresInternet = requiresCloudApi(deps);
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
  } else {
    action = 'processes';
    target = 'your data';
  }

  return {
    short: `${tool.name} ${action} ${target} entirely in your browser. ${requiresInternet ? CLOUD_TRUST_CLAIM : LOCAL_TRUST_CLAIM}`,
    meta: `Free online ${tool.name} — ${tool.name.charAt(0).toLowerCase() + tool.name.slice(1)} ${action} ${target}. ${requiresInternet ? CLOUD_TRUST_CLAIM : LOCAL_TRUST_CLAIM}`,
    og: `${tool.name} ${action} ${target} entirely in your browser. ${requiresInternet ? CLOUD_TRUST_CLAIM : LOCAL_TRUST_CLAIM}`,
  };
}

export function generateToolDescription(tool: ToolMetadata): DescriptionVariants {
  const pair = parseFormatPair(tool.slug);

  if (pair) {
    return generateConverterDescription(tool, pair);
  }

  if (isFormatterTool(tool.name, tool.slug, tool.description)) {
    const formatterType = identifyFormatterType(tool.name, tool.slug, tool.description);
    const generator = formatterVariants[formatterType] || formatterVariants['default'];
    return generator(tool.name, tool.dependencies);
  }

  // For non-formatter, non-converter tools: use the tool's own description as the base
  // Only add the "browser-based" suffix if it's not already there
  const depVerdict = classifyDependencies(tool.dependencies);
  const baseDesc = tool.description;

  let suffix: string;
  if (depVerdict === "cloud") {
    suffix = ` ${CLOUD_TRUST_CLAIM}`;
  } else if (depVerdict === "unverified") {
    // Don't make a trust claim we can't back — omit the suffix entirely
    // and flag for manual review via the description audit
    suffix = '';
  } else {
    suffix = ` ${LOCAL_TRUST_CLAIM}`;
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
