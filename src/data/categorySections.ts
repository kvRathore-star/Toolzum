export interface CategorySection {
  id: string;
  heading: string;
  description: string;
  slugs: string[];
}

export interface CategoryFaq {
  question: string;
  answer: string;
}

export const CATEGORY_SECTIONS: Record<string, CategorySection[]> = {
  Developer: [
    {
      id: "formatters",
      heading: "Code Formatters & Beautifiers",
      description: "Format and prettify your code across languages — JSON, HTML, CSS, JavaScript, TypeScript, Python, and more.",
      slugs: [
        "json-formatter",
        "html-formatter",
        "typescript-formatter",
        "scss-formatter",
        "xml-formatter",
        "swift-formatter",
        "proto-schema-converter",
        "tsconfig-analyzer",
        "bulk-regex-extractor-replacer",
        "trailing-space-remover",
        "sql-formatter", "code-beautifier", "code-formatter",
        "css-formatter", "javascript-formatter", "jsx-formatter",
        "tsx-formatter", "python-formatter", "yaml-formatter",
        "markdown-formatter", "cpp-formatter", "go-formatter",
        "kotlin-formatter", "php-beautifier", "ruby-formatter",
        "rust-formatter",
],
    },
    {
      id: "minifiers",
      heading: "Minifiers & Compressors",
      description: "Reduce file sizes of JavaScript, CSS, HTML, and JSON for faster load times.",
      slugs: [
        "js-minifier",
      ],
    },
    {
      id: "css-generators",
      heading: "CSS Generators",
      description: "Generate CSS code visually — box shadows, gradients, grids, animations, filters, and more.",
      slugs: [
        "css-generator",
        "media-query-generator",
      ],
    },
    {
      id: "api-tools",
      heading: "API & Webhook Tools",
      description: "Build, test, and debug APIs — REST, GraphQL, gRPC, SOAP, OpenAPI, Postman, and webhooks.",
      slugs: [
        "api-request-builder", "api-tester", "api-response-formatter",
        "api-error-decoder", "api-payload-analyzer", "api-mock-data-generator",
        "api-mock-server-config", "mock-api-response-generator", "api-latency-budget",
        "api-pagination-calculator", "api-key-generator", "api-key-hasher",
        "api-key-validator", "api-cost-estimator", "api-gateway-rate-calculator",
        "api-rate-limiter-calculator", "api-changelog-generator",
        "api-documentation-generator", "rest-endpoint-documenter",
        "graphql-cost-estimator", "graphql-query-formatter",
        "graphql-schema-to-json-schema", "graphql-schema-validator",
        "graphql-subscription-builder", "graphql-tester", "graphql-variables-formatter",
        "grpc-status-code-lookup", "soap-api-tester",
        "openapi-mock-generator", "openapi-to-postman", "openapi-validator",
        "postman-collection-generator", "postman-to-openapi-converter",
        "swagger-openapi-generator", "api-docs-generator", "api-diff-checker",
        "webhook-payload-generator", "webhook-retry-config",
        "webhook-signature-verifier", "webhook-tester", "webhook-validator",
        "code-to-curl-converter", "curl-to-code-converter",
        "jsonrpc-builder",
        "api-builder",
        "http-headers-generator",
        "http-status-code-checker", "pricing-tier-builder",
],
    },
    {
      id: "security",
      heading: "Security & Encryption",
      description: "Encryption, hashing, key generation, JWT, SSL/TLS, CORS, CSP, and security header tools.",
      slugs: [
        "password-entropy-calculator", "two-factor-auth-generator",
        "brute-force-time-estimator", "hash-verifier",
        "hash-password-generator", "hash-file-generator", "hmac-generator",
        "md5-hash-generator",
        "ssl-tls-checker", "http-security-checker", "jwt-inspector",
        "content-security-policy-generator",
        "subnet-calculator", "subnet-visualizer", "ip-address-converter", "ip-range-expander", "ipv6-ula-generator", "dns-lookup-generator",
        "cors-inspector", "cors-header-generator",
        "env-file-generator", "env-file-parser", "cve-lookup",
        "sql-injection-detector", "xss-protection-checker", "csrf-token-generator",
        "oauth2-debugger", "saml-decoder", "csp-policy-validator",
        "tls-cipher-checker", "ip-reputation-checker", "url-sanitizer",
        "ssl-certificate-decoder", "subdomain-finder", "email-format-validator",
        "aes-encrypt", "rsa-key-generator",
        "oauth-client-setup", "pkce-verifier", "oauth-scope-builder",
        "oauth-state-validator", "pbkdf2-hash-generator", "cookie-parser",
        "secret-scanner", "security-txt-generator", "robots-txt-validator",
        "oauth-pkce-generator",
        "ip-allowlist-generator",
        "cidr-calculator",
              "aws-iam-policy-analyzer",
        "ssl-checker", "dns-record-validator",
        "jwt-encoder-signer", "domain-availability-checker",
        "rate-limit-header-parser",
],
    },
    {
      id: "encoders",
      heading: "Encoders & Decoders",
      description: "Encode and decode data across formats — Base64, URL, HTML entities, hex, ASCII, binary, and more.",
      slugs: [
        "url-encoder-decoder",
        "hex-ascii-converter",
        "base32-encoder", "base64-json-decoder", "hex-text-converter",
],
    },
    {
      id: "validators",
      heading: "Validators & Converters",
      description: "Validate, convert, and transform data formats — YAML, JSON, CSV, TOML, XML, HTML, and code.",
      slugs: [
        "diff-checker", "regex-tester",
        "syntax-validator", "yaml-validator",
        "git-commit-linter", "gitignore-generator",
        "json-path-query-builder", "json-diff-checker",
        "json-tree-viewer",
        "html-to-jsx", "svg-to-css",
        "jwt-debugger", "html-preview", "cron-parser",
        "geojson-validator", "rss-feed-validator", "sitemap-validator",
        "xpath-validator", "cron-expression-validator",
        "html-linter", "xml-minifier-validator",
        "character-encoding-converter", "unicode-converter",
        "px-rem-converter",
        "msgpack-inspector", "cbor-inspector",
        "avro-schema-generator", "avro-to-json-sample",
        "json-escape-unescape", "json-flattener",
        "json-to-zod", "ndjson-to-json",
        "jsonl-formatter", "json-to-url-params",
        "json-schema-generator", "merge-patch-generator",
        "css-specificity-calculator", "css-validator",
        "json-formatter-tool",
        "url-parser", "protobuf-decoder", "query-string-parser",
        "email-normalizer", "json-ld-generator", "json-size-analyzer",
],
    },
    {
      id: "config-linting",
      heading: "Config & Linting",
      description: "Lint and validate DevOps configs — Docker Compose, Dockerfile, .htaccess, Kubernetes YAML, GitHub Actions, and CI/CD workflows.",
      slugs: [
        "docker-compose-validator", "dockerfile-linter", "htaccess-validator",
        "kubernetes-yaml-validator", "github-actions-validator",
        "code-obfuscator", "code-to-curl-parser",
        "js-syntax-checker", "pug-to-html-converter",
        "nginx-config-generator",
        "eslint-config-generator", "docker-run-to-compose",
      ],
    },
    {
      id: "http-network",
      heading: "HTTP & Network Debugging",
      description: "Analyze HTTP headers, check SSL certificates, look up domains, and debug network configurations.",
      slugs: [
        "http-header-analyzer",
        "http-cache-header-generator",
        "http-retry-policy-builder",
        "whois-lookup",
        "web-inspector",
        "user-agent-parser", "chmod-calculator",
        "ip-address-lookup",
        "mac-vendor-lookup",
      ],
    },
    {
      id: "generators",
      heading: "Random Generators & Mock Data",
      description: "Generate passwords, UUIDs, tokens, fake identities, coupons, and test data.",
      slugs: [
        "random-ip-generator",
        "random-token-generator",
        "dummy-text-generator",
        "fake-identity-generator",
        "serial-number-generator",
        "uuid-generator",
        "test-data-generator",
              "open-graph-generator",
        "fake-data-generator", "fake-credit-card-generator",
        "coupon-code-generator",
        "license-key-generator", "pin-generator",
        "random-user-agent-generator",
        "random-port-generator",
        "memorable-password-generator",
],
    },
    {
      id: "dev-utilities",
      heading: "Developer Utilities",
      description: "Timers, converters, code tools, and everyday utilities for developers.",
      slugs: [
        "string-inspector",
        "qr-code-reader",
        "yaml-reindenter",
        "conventional-commit-generator",
        "har-analyzer",
        "package-json-validator",
        "data-anonymizer",
        "port-number-lookup",
        "sse-event-formatter",
        "ssh-key-generator",
        "jwk-generator",
        "fluid-typography-calculator", "semver-calculator",
        "bulk-font-subsetter",
        "markdown-table-generator",
        "website-screenshot",
        "php-tools", "svg-optimizer", "mime-finder",
        "string-template-tester",
        "log-analyzer",
        "phone-parser", "large-text-viewer",
      ],
    },
  ],

  Calculator: [
    {
      id: "math",
      heading: "Math Calculators",
      description: "Algebra, geometry, trigonometry, fractions, percentages, and scientific calculators.",
      slugs: [
        "percentage-calculator",
        "exponent-calculator",
        "fraction-calculator",
        "fraction-to-decimal-calculator",
        "ratio-calculator",
        "probability-calculator",
        "combination-calculator",
        "prime-number-checker",
        "greatest-common-factor-calculator",
        "modulo-calculator",
        "mean-median-mode-calculator",
        "quadratic-equation-solver",
        "circle-calculator",
        "aspect-ratio-calculator",
        "dpi-calculator",
        "scientific-calculator",
        "degree-radian-converter",
        "significant-figures-calculator",
        "gas-mileage-calculator",
        "percentage-difference-calculator",
        "algebra-calculator",
        "geometry-calculator",
        "slope-calculator",
        "math-equation-solver",
              "screen-size-converter",
        "proportion-calculator", "ppi-calculator",
        "pythagorean-theorem-calculator", "rectangle-area-calculator",
        "square-root-calculator", "standard-deviation-calculator",
        "decimal-to-fraction-calculator",
        "permutation-calculator", "factorial-calculator",
        "prime-factorization-calculator", "least-common-multiple-calculator",
        "logarithm-calculator", "trigonometry-calculator",
        "scientific-notation-converter", "rounding-calculator",
        "coordinate-calculator", "triangle-area-calculator",
],
    },
    {
      id: "date-time",
      heading: "Date & Time Calculators",
      description: "Age calculator, days between dates, day of week, business days, and date arithmetic.",
      slugs: [
        "age-calculator", "business-days-calculator",
        "day-of-week-calculator", "day-of-year-calculator",
        "leap-year-calculator",
              "time-until-calculator",
        "date-difference-calculator",
        "week-number-calculator",
        "work-hours-calculator",
        "eta-calculator",
        "time-duration-calculator", "time-addition-calculator",
        "meeting-time-planner", "date-addition-calculator",
        "time-since-calculator", "daylight-saving-time-checker",
        "hours-minutes-calculator",
],
    },
    {
      id: "academic",
      heading: "Academic Calculators",
      description: "Grade, GPA, and academic performance calculators.",
      slugs: [
        "final-grade-calculator", "gpa-calculator",
        "grade-calculator", "college-gpa-calculator",
        "study-time-calculator", "test-score-calculator",
        "words-per-page-calculator",
      ],
    },
  ],

  Utility: [
    {
      id: "random-generators",
      heading: "Random Generators",
      description: "Generate random numbers, passwords, names, decisions, and more with one click.",
      slugs: [
        "random-number-generator", "password-generator",
        "qr-code-generator", "barcode-generator",
 "wheel-of-names",
        "counter-tool", "list-randomizer", "list-sorter",
        "random-decision-maker",
        "coin-flipper", "dice-roller",
        "ulid-generator",
              "random-color-generator",
        "random-date-generator",
        "random-team-generator",
        "random-string-generator",
        "random-word-generator",
        "sequence-generator",
        "ascii-art-generator",
        "ascii-font-generator",
        "random-picker-generator", "random-username-generator",
        "nickname-generator", "emoji-picker", "otp-generator",
        "random-time-generator",
        "random-sentence-generator",
        "bulk-qr-code-generator",
],
    },
    {
      id: "timers",
      heading: "Timers & Stopwatch",
      description: "Timer, stopwatch, countdown, interval timer, Tabata, and world clock tools.",
      slugs: [
        "timer", "stopwatch", "countdown-tool",
        "interval-timer", "tabata-timer", "world-clock",
      ],
    },
    {
      id: "games-fun",
      heading: "Games & Fun Tools",
      description: "Interactive games and fun tools — number guessing, rock paper scissors, hangman, and more.",
      slugs: [
        "number-guessing-game",
        "rock-paper-scissors",
        "hangman-game",
      ],
    },
    {
      id: "text-converters",
      heading: "Text & Number Converters",
      description: "Convert between text formats — morse code, binary, roman numerals, number to words, and more.",
      slugs: [
        "unicode-viewer",
        "number-to-words-converter",
        "slugify-tool", "numeronym-generator",
      ],
    },
    {
      id: "unit-converters",
      heading: "Unit Converters",
      description: "Convert between units of speed, length, weight, volume, area, data size, and more.",
      slugs: [
        "speed-converter",
        "weight-converter",
        "data-size-converter",
        "cooking-measurement-converter",
        "fuel-consumption-converter",
        "clothing-size-converter",
        "time-converter",
        "temperature-converter",
        "unix-time-converter",
        "unit-converter",
        "power-converter", "pressure-converter",
        "length-converter", "volume-converter", "area-converter",
        "paper-size-converter",
        "ring-size-converter", "shoe-size-converter",
        "time-zone-converter",
      ],
    },
    {
      id: "data-csv",
      heading: "CSV Tools",
      description: "Clean, sort, filter, transform, and analyze CSV data — deduplicate, pivot, rename columns, validate formats, compute statistics, and more.",
      slugs: [
        "column-extractor",
        "deduplicator",
        "null-value-handler",
        "csv-row-sorter",
        "csv-json-row-generator",
        "line-sorter", "list-converter",
        "column-renamer",
        "format-validator", "pivot-generator", "row-filter",
        "csv-merger", "csv-splitter",
        "csv-analyzer",
      ],
    },
    {
      id: "everyday",
      heading: "Everyday Utilities",
      description: "Speed test, resume builder, bank statement analyzer, and more.",
      slugs: [
        "speed-test",
        "benchmark-builder",
        "url-shortener",
        "bulk-url-shortener",
        "resume-builder", "zip-file-extractor",
        "ical-event-generator", "whatsapp-toolkit",
        "bank-statement-analyser",
],
    },
  ],

  Audio: [
    {
      id: "convert",
      heading: "Audio Converters",
      description: "Convert audio files between formats — MP3, WAV, FLAC, OGG, AAC, M4A, and more. 100% browser-based.",
      slugs: [
        "audio-converter", "bulk-audio-converter",
        "apple-music-preview-extractor",
      ],
    },
    {
      id: "compress",
      heading: "Audio Compressors",
      description: "Reduce audio file sizes while maintaining quality. Compress MP3 and other formats.",
      slugs: [
        "mp3-compressor", "audio-compressor",
      ],
    },
    {
      id: "trim",
      heading: "Audio Trim & Cut",
      description: "Cut, trim, and split audio files to extract the segments you need.",
      slugs: [
        "audio-cutter",
      ],
    },
    {
      id: "edit",
      heading: "Audio Editors & Effects",
      description: "Merge, fade, equalize, normalize, and apply effects to your audio files.",
      slugs: [
        "audio-merger", "fade-in-out",
        "noise-reducer", "audio-equalizer",
        "waveform-generator", "vocal-remover",
        "voice-recorder",
        "bulk-audio-normalizer",
      ],
    },
    {
      id: "ai",
      heading: "AI & Speech Tools",
      description: "Text-to-speech, speech-to-text, and Apple Music preview extraction.",
      slugs: [
        "text-to-speech-tts", "speech-to-text",

      ],
    },
  ],

  Image: [
    {
      id: "compress",
      heading: "Image Compressors",
      description: "Reduce image file sizes while preserving quality. Compress JPEG, PNG, WebP, and more.",
      slugs: [
        "image-compressor", "compress-image-to-50kb",
        "bulk-image-compressor",
      ],
    },
    {
      id: "resize",
      heading: "Image Resizers",
      description: "Resize, crop, and transform images to your exact dimensions.",
      slugs: [
        "image-resizer", "crop-image",
        "bulk-image-resizer",
      ],
    },
    {
      id: "convert",
      heading: "Image Format Converters",
      description: "Convert images between formats — PNG, JPG, WebP, SVG, GIF, ICO, RAW, PSD, and more.",
      slugs: [
        "image-format-converter", "image-bulk-converter",
        "png-to-svg", "raw-image-converter", "psd-to-jpg-png",
        "gif-to-apng", "apng-to-gif",
        "image-to-ico",
        "bulk-heic-to-jpg", "bulk-svg-to-png",
        "bulk-image-converter",
        "bulk-heic-converter", "bulk-avif-optimizer",
        "rotate-image",
      ],
    },
    {
      id: "edit",
      heading: "Image Editors",
      description: "Edit images — add text, blur faces, remove backgrounds, apply filters, and enhance photos.",
      slugs: [
        "add-text-to-photo", "batch-image-editor",
 "object-remover",
        "image-enhancer", "photo-retoucher",
        "image-colorizer",
 "unblur-sharpen",
  
        "collage-maker",
        "gif-editor", "gif-compressor", "gif-resizer",
        "meme-generator",
        "bulk-image-watermark", "bulk-face-anonymizer",
        "bulk-exif-stripper-injector", "bulk-app-icon-generator",
        "bulk-image-to-text-ocr",
        "blur-face",
      ],
    },
    {
      id: "ai-image",
      heading: "AI Image Tools",
      description: "AI-powered image tools — upscale, face swap, background removal, and colorization.",
      slugs: [
        "ai-bg-changer", "bulk-bg-changer",
        "gemini-watermark-remover", "bulk-image-upscaler",
      ],
    },
  ],

  PDF: [
    {
      id: "compress",
      heading: "PDF Compressors",
      description: "Reduce PDF file sizes while maintaining quality for easier sharing and storage.",
      slugs: [
        "pdf-compressor", "bulk-pdf-size-reducer",
      ],
    },
    {
      id: "merge",
      heading: "PDF Mergers",
      description: "Combine multiple PDF files into a single document. Merge pages from different files.",
      slugs: [
        "pdf-merger", "bulk-pdf-merger",
      ],
    },
    {
      id: "split",
      heading: "PDF Splitters",
      description: "Split PDF files into separate documents. Extract specific pages from large PDFs.",
      slugs: [
        "pdf-splitter", "extract-pages-from-pdf",
        "pdf-page-delete",
      ],
    },
    {
      id: "convert",
      heading: "PDF Converters",
      description: "Convert PDFs to and from other formats — HTML, Markdown, PNG, TIFF, DOCX, TXT, and more.",
      slugs: [
        "pdf-to-markdown", "markdown-to-pdf",
        "pdf-to-png", "pdf-to-tiff", "tiff-to-pdf",
        "pdf-to-txt",
        "pdf-to-pdfa",
        "url-to-pdf", "eml-to-pdf",
        "pdf-to-html",
        "pdf-to-word", "pdf-to-jpg", "pdf-to-ppt", "pdf-to-excel",
      ],
    },
    {
      id: "edit",
      heading: "Edit & Annotate",
      description: "Edit PDFs in your browser — full editor, text and image stamps, watermarks, page numbers, headers, and stamps.",
      slugs: [
        "pdf-editor",
        "add-text-to-pdf", "add-image-to-pdf",
        "pdf-annotator",
        "watermark-pdf",
        "add-page-numbers-to-pdf",
        "header-footer-pdf", "pdf-stamp",
        "pdf-bates-numbering", "pdf-timestamp",
        "pdf-background-color", "grayscale-pdf", "whiteout-pdf",
        "nup-pdf",
      ],
    },
    {
      id: "pages",
      heading: "Page Management",
      description: "Organize PDF pages — reorder, rotate, crop, delete, add blank pages, and fix scans.",
      slugs: [
        "pdf-page-manager",
        "rotate-pdf", "crop-pdf", "resize-pdf-pages",
        "pdf-add-blank-page", "deskew-pdf",
        "pdf-table-of-contents", "bookmark-pdf",
      ],
    },
    {
      id: "create",
      heading: "Create PDFs",
      description: "Make PDFs from scratch and from other formats — Word, images, HTML, Markdown, and more.",
      slugs: [
        "create-pdf",
        "word-to-pdf", "excel-to-pdf", "ppt-to-pdf",
        "jpg-to-pdf", "heic-to-pdf", "epub-to-pdf",
        "bulk-image-to-pdf",
        "html-to-pdf",
      ],
    },
    {
      id: "security",
      heading: "Security & Privacy",
      description: "Protect, unlock, redact, flatten, sign, and inspect PDF metadata — plus fillable forms.",
      slugs: [
        "unlock-pdf", "protect-pdf",
        "redact-pdf", "flatten-pdf",
        "pdf-metadata-editor",
        "esign-pdf", "pdf-form-filler",
      ],
    },
    {
      id: "ai",
      heading: "AI PDF Tools",
      description: "OCR scans, summarize and chat with documents, compare files, translate, and repair PDFs.",
      slugs: [
        "pdf-ocr", "scan-to-pdf",
        "pdf-ai-summariser", "ai-chat-pdf",
        "compare-pdf-files",
        "translate-pdf", "repair-pdf",
      ],
    },
    {
      id: "utilities",
      heading: "PDF Utilities",
      description: "Inspect, clean up, extract from, and automate PDF workflows.",
      slugs: [
        "extract-images-from-pdf",
        "pdf-info", "pdf-cleanup", "pdf-advanced",
        "generic-pdf-processor",
        "pdf-workflow-builder",
        "bulk-pdf-data-extractor", "bulk-pdf-form-extractor", "bulk-pdf-suite",
        "pdf-attachments",
      ],
    },
  ],

  Video: [
    {
      id: "compress",
      heading: "Video Compressors",
      description: "Reduce video file sizes while maintaining quality. Compress MP4 and other formats.",
      slugs: [
        "video-compressor", "bulk-video-compressor",
        "bulk-video-size-reducer",
      ],
    },
    {
      id: "convert",
      heading: "Video Converters",
      description: "Convert video between formats — MP4, GIF, WebM, and extract audio from video.",
      slugs: [
 "video-converter",
        "video-to-gif",
        "video-to-mp3",
      ],
    },
    {
      id: "trim",
      heading: "Video Trimmers",
      description: "Cut, trim, and crop video files to extract the segments or dimensions you need.",
      slugs: [
        "crop-video", "video-trimmer",
      ],
    },
    {
      id: "edit",
      heading: "Video Editors & Effects",
      description: "Edit videos — change speed, reverse, mute, stabilize, add filters, and take screenshots.",
      slugs: [
        "video-speed-changer", "reverse-video", "mute-video",
        "video-stabilizer", "video-filters", "video-screenshot",

        "screen-recorder",
        "subtitle-translator", "subtitle-generator",
        "bulk-video-subtitle-burner", "bulk-subtitle-time-shifter",
        "video-watermark-adder",
      ],
    },
  ],

  Converter: [
    {
      id: "image",
      heading: "Image Converters",
      description: "Convert images between formats — SVG, PNG, GIF, WebP, ICO, and more.",
      slugs: [
        "image-format-converter",
        "bulk-image-converter",
        "gif-to-webp-webm",
        "png-to-svg",
        "gif-to-apng",
        "apng-to-gif",
        "bulk-heic-to-jpg",
        "raw-image-converter",
        "psd-to-jpg-png",
        "bulk-svg-to-png",
        "image-bulk-converter",
        "html-to-image",
      ],
    },
    {
      id: "audio",
      heading: "Audio & Video Converters",
      description: "Convert audio files between popular formats and convert video to/from various formats for playback on any device.",
      slugs: [
        "audio-converter",
        "video-converter",
        "gif-to-mp4",
        "mp4-to-mp3", "mov-to-mp3", "webm-to-mp3",
      ],
    },
    {
      id: "document",
      heading: "Document Converters",
      description: "Convert between document formats — EPUB, MOBI, CBZ, ODT, RTF, PDF, and more.",
      slugs: [
        "epub-to-pdf", "mobi-converter", "odt-rtf-to-pdf",
        "cbz-to-pdf",
        "bulk-ebook-converter",
        "bulk-markdown-to-pdf-html",
        "pdf-to-txt",
        "pdf-to-png",
        "pdf-to-tiff",
        "pdf-to-markdown",
        "markdown-to-pdf",
        "url-to-pdf",
        "eml-to-pdf",
        "tiff-to-pdf",
        "bulk-image-to-pdf",
        "document-converter",
      ],
    },
    {
      id: "data",
      heading: "Data Converters",
      description: "Convert between data formats — JSON, CSV, XML, Parquet, and more.",
      slugs: [
        "data-format-converter",
        "csv-formatter",
        "import-to-csv",
        "xlsx-csv-converter",
        "json-toon-converter",
        "yaml-json-converter",
        "archive-converter",
        "markdown-tools",
        "roman-numeral-converter",
        "scss-to-css-converter",
        "tailwind-to-css-converter",
        "html-to-text-converter",
        "bulk-csv-excel-to-json",
        "csv-to-sqlite",
        "text-binary-converter",
        "number-base-converter",
        "markdown-slack-converter",
        "image-to-base64",
        "svg-base64-converter",
        "morse-code-translator",
        "nato-phonetic-converter",
        "braille-translator",
        "data-type-converter",
        "json-to-xml",
      ],
    },
  ],

  SEO: [
    {
      id: "analyze",
      heading: "SEO Analyzers",
      description: "Analyze keywords, check density, audit meta tags, and preview search snippets.",
      slugs: [
        "keyword-density-checker", "word-frequency-counter",
        "keyword-planner-tool",
        "seo-preview-generator", "canonical-url-checker",
        "breadcrumb-schema-generator", "utm-builder",
        "seo-headline-analyzer",
        "seo-schema-generator",
        "bulk-url-status-checker",
      ],
    },
    {
      id: "generate",
      heading: "SEO Generators",
      description: "Generate sitemaps, meta tags, SEO slugs, and robots.txt for better search rankings.",
      slugs: [
        "xml-sitemap-generator",
        "seo-meta-tag-generator",
        "robots-txt-generator",
        "seo-slug-generator",
      ],
    },
  ],

  Health: [
    {
      id: "weight-body",
      heading: "Weight & Body Composition",
      description: "BMI, body fat, ideal weight, lean body mass, and body surface area calculators.",
      slugs: [
        "bmi-calculator",
        "body-fat-percentage-calculator",
        "body-fat-calculator",
        "calorie-intake-calculator",
        "ideal-weight-calc",
        "lean-body-mass-calculator",
        "waist-to-hip-ratio-calculator",
        "bmr-calculator", "bmi-calculator-for-kids",
        "body-surface-area-calculator",
      ],
    },
    {
      id: "calorie-nutrition",
      heading: "Calorie & Nutrition",
      description: "Calorie needs, macro targets, keto, protein, and specialized diet calculators.",
      slugs: [
        "calorie-calculator",
        "breastfeeding-calorie-calculator",
        "protein-calculator",
        "keto-calculator", "macro-calculator",
        "macro-split-calculator", "calories-burned-calculator",
        "calorie-tracker", "steps-to-calories-calculator",
      ],
    },
    {
      id: "fitness-exercise",
      heading: "Fitness & Exercise",
      description: "Heart rate zones, running pace, steps, and activity tracking tools.",
      slugs: [
        "heart-rate-zone-calculator",
        "steps-calculator",
        "running-pace-calculator", "cycling-calorie-calculator",
      ],
    },
    {
      id: "pregnancy-baby",
      heading: "Pregnancy & Baby",
      description: "Due date, ovulation, baby growth, formula, sleep, and child height predictors.",
      slugs: [
        "pregnancy-due-date-calculator", "ovulation-tracker",
        "baby-formula-calculator", "baby-growth-percentile-calculator",
        "baby-sleep-schedule-calculator", "child-height-predictor",
      ],
    },
    {
      id: "other",
      heading: "Other Health Tools",
      description: "Blood alcohol estimator and additional wellness calculators.",
      slugs: [
        "blood-alcohol-calculator",
        "sleep-requirement-calculator",
        "water-intake-calculator",
        "sleep-calculator",
      ],
    },
  ],

  AI: [
    {
      id: "generate",
      heading: "AI Generators",
      description: "Generate images, text, thumbnails, cover letters, and social media captions with AI.",
      slugs: [
        "ai-image-generator", "ai-thumbnail-maker",
        "ai-cover-letter-generator",
        "social-caption-generator",
        "article-writer",
      ],
    },
    {
      id: "analyze",
      heading: "AI Analyzers & Summarizers",
      description: "Summarize documents, chat with PDFs, check grammar, and detect AI-written content.",
      slugs: [
        "ai-paraphrasing-tool", "ai-translator",
        "ai-document-chat", "ai-chat-pdf",
        "pdf-ai-summariser",
        "grammar-checker", "ai-humanizer", "ai-detector",
        "resume-ats-score-checker",
      ],
    },
    {
      id: "enhance",
      heading: "AI Enhancement Tools",
      description: "Enhance images, swap faces, upscale resolution, and add subtitles with AI.",
      slugs: [
        "ai-image-upscaler", "ai-face-swap",
      ],
    },
  ],

  Text: [
    {
      id: "count",
      heading: "Text Counters & Analyzers",
      description: "Count words, characters, and analyze text content with detailed statistics.",
      slugs: [
        "word-counter", "character-counter",
        "ascii-table-generator",
        "writing-tools",
        "text-reverser",
      ],
    },
    {
      id: "convert",
      heading: "Text Converters",
      description: "Convert text between formats — case converter, reverse text, deduplicate, split, clean, and more.",
      slugs: [
        "case-converter",
        "text-to-handwriting",
        "text-repeater",
        "markdown-previewer",
        "text-replacer",
        "text-sorter",
        "text-deduplicator",
        "duplicate-word-remover",
        "text-cleaner",
        "text-splitter",
      ],
    },
    {
      id: "generate",
      heading: "Text & Font Generators",
      description: "Generate fancy text, cursive fonts, zalgo text, invisible text, and lorem ipsum.",
      slugs: [
        "fancy-text-generator", "font-generator",
        "cursive-text-generator",
        "invisible-text-generator",
        "lorem-ipsum-generator",
        "pronunciation-tool",
        "small-text-generator", "big-text-generator",
        "citation-generator",
        "upside-down-text", "glitch-text", "invisible-character",
      ],
    },
  ],

  Branding: [
    {
      id: "design",
      heading: "Brand Design Tools",
      description: "Create logos, business cards, email signatures, and social media posts for your brand.",
      slugs: [
        "logo-maker", "business-card-maker",
        "email-signature-generator",
        "social-media-post-maker",
        "brand-color-palette-generator",
        "link-in-bio-builder",
        "brand-kit",
      ],
    },
    {
      id: "generate",
      heading: "Brand Utilities",
      description: "Shorten URLs, schedule social media content, and manage brand assets.",
      slugs: [
        "social-media-calendar",
      ],
    },
  ],

  Design: [
    {
      id: "color",
      heading: "Color Tools",
      description: "Convert HEX to RGB, generate color palettes, and manage design color systems.",
      slugs: [
        "hex-to-rgb-converter",
        "color-shades-tints",
        "contrast-ratio-checker",
        "color-converter",
        "color-blindness-simulator",
        "color-picker", "color-palette-generator",
        "gradient-generator",
],
    },
    {
      id: "typography",
      heading: "Typography & SVG",
      description: "Preview typography, convert fonts, generate border CSS, and edit SVG files.",
      slugs: [
        "typography-preview",
        "svg-editor",
        "favicon-generator",
        "font-converter", "font-subsetter",
        "avatar-generator",
        "logo-placeholder-generator",
        "image-placeholder-generator",
        "vector-pen-canvas",
      ],
    },
  ],

  Finance: [
    {
      id: "loans-mortgages",
      heading: "Loans & Mortgages",
      description: "Mortgage, EMI, car loan, car lease, and rent vs buy calculators.",
      slugs: [
        "mortgage-calculator",
        "car-lease-calculator",
        "emi-calculator", "car-loan-calculator",
      ],
    },
    {
      id: "savings-investment",
      heading: "Savings & Investment",
      description: "Compound interest, SIP, ROI, savings, retirement, and margin calculators.",
      slugs: [
        "compound-interest-calculator",
        "sip-calculator",
        "savings-calculator",
        "profit-margin-calculator",
        "break-even-calculator",
        "cagr-calculator",
        "margin-calculator", "roi-calculator",
        "simple-interest-calculator", "retirement-calculator",
        "rent-vs-buy-calculator", "profit-loss-calculator",
      ],
    },
    {
      id: "tax-salary",
      heading: "Tax & Salary",
      description: "VAT, income tax, TDS, salary, hourly rate, and net worth calculators.",
      slugs: [
        "vat-calculator",
        "net-worth-calculator",
        "debt-payoff-calculator",
        "tip-calculator",
        "salary-calculator", "hourly-to-salary-calculator",
        "tax-calculator", "tds-calculator-india",
        "sales-tax-calculator",
      ],
    },
    {
      id: "invoicing-tools",
      heading: "Invoicing & Currency",
      description: "Invoice generator, receipt generator, currency converter, IBAN validator, and financial utilities.",
      slugs: [
        "currency-converter",
        "invoice-generator",
        "bulk-invoice-receipt-parser",
        "receipt-generator", "iban-validator", "discount-calculator",
        "inflation-calculator",
        "markup-calculator",
      ],
    },
  ],

  "Growth & Marketing": [
    {
      id: "saas-revenue",
      heading: "SaaS Revenue & Growth",
      description: "ARR, MRR, revenue growth, ACV, quick ratio, rule of 40, seat license costs, and SaaS pricing models.",
      slugs: [
        "saas-metrics-dashboard",
        "arr-calculator",
        "mrr-calculator",
        "revenue-growth-calculator",
        "acv-calculator",
        "saas-quick-ratio",
        "saas-rule-of-40",
        "seat-license-calculator",
        "saas-pricing-calculator",
        "saas-payback-period",
      ],
    },
    {
      id: "customer-economics",
      heading: "Customer Economics",
      description: "LTV, CAC, payback period, churn rate, and employee turnover metrics.",
      slugs: [
        "ltv-calculator",
        "customer-ltv-calculator",
        "cac-calculator",
        "churn-rate-calculator",
        "employee-turnover-calculator",
      ],
    },
    {
      id: "cash-runway",
      heading: "Cash & Runway",
      description: "Runway and burn rate calculators for startup financial planning.",
      slugs: [
        "runway-calculator",
        "burn-rate-calculator",
      ],
    },
    {
      id: "marketing-performance",
      heading: "Marketing Performance & Testing",
      description: "A/B test significance, trial conversion rates, CPM, ROAS, conversion rates, and NPS.",
      slugs: [
        "ab-test-calculator",
        "trial-conversion-calculator",
        "conversion-rate-calculator",
        "cpm-calculator",
        "roas-calculator",
        "net-promoter-score-calculator",
      ],
    },
  ],

  Privacy: [
    {
      id: "encrypt",
      heading: "Encryption & Key Tools",
      description: "Generate PGP keys, MAC addresses, and encrypt your sensitive data.",
      slugs: [
        "pgp-key-generator", "mac-address-generator",
      ],
    },
    {
      id: "redact",
      heading: "Privacy Cleaners",
      description: "Remove EXIF data from photos, anonymize IPs, and clean private information.",
      slugs: [
        "exif-data-remover", "ip-anonymizer", "privacy-cleaner",
      ],
    },
    {
      id: "password",
      heading: "Password & Secure Sharing",
      description: "Check password strength, share notes securely, and use disposable inboxes for signups.",
      slugs: [
        "password-strength-checker",
        "secure-note-sharer",
        "temp-email-generator",
      ],
    },
  ],

  "indian-utilities": [
    {
      id: "aadhaar",
      heading: "Aadhaar & ID Tools",
      description: "Crop Aadhaar photos, mask card details, verify PAN, and manage identity documents.",
      slugs: [
        "passport-photo-india", "aadhaar-wallet-cropper",
        "pan-card-resizer", 
        "pan-verification",
        "indian-document-enhancer",
        "aadhaar-card-masker",
        "rental-agreement-generator",
      ],
    },
    {
      id: "finance-tax",
      heading: "Finance & Tax Tools",
      description: "Calculate GST, look up GSTIN/IFSC, file ITR, and save on taxes.",
      slugs: [
        "gst-calculator",
        "gst-invoice-generator",
        "tax-saving-calculator",
        "itr-filing-helper",
        "gstin-lookup",
        "ifsc-code-lookup", "seller-profit-calculator",
      ],
    },
    {
      id: "documents",
      heading: "Document Generators",
      description: "Generate rental agreements, marriage biodata, complaint letters, and more.",
      slugs: [
        "marriage-biodata-maker",
        "voter-id-form-helper",
        "india-pincode-finder",
        "complaint-letter-generator",
      ],
    },
    {
      id: "payments",
      heading: "Payments & Investments",
      description: "Validate UPI IDs, generate payment QR codes, calculate SIP/PPF/EPF returns.",
      slugs: [
        "indian-investment-calculator",
        "upi-id-validator",
      ],
    },
    {
      id: "converters",
      heading: "India-Specific Converters",
      description: "Convert CGPA to percentage, calculate Indian age, generate regional fonts, and more.",
      slugs: [
  "indian-age-calculator",
        "hindi-regional-font-generator",
        "indian-voice-transcriber",
        "cgpa-to-percentage-converter",
        "indian-address-parser",
        "vehicle-registration-checker",
        "aadhaar-number-validator",
      ],
    },
  ],

  Transcription: [
    {
      id: "transcribe",
      heading: "Transcription Tools",
      description: "Convert audio and video to text with automatic transcription. Supports multiple languages.",
      slugs: [
        "audio-to-text-transcription", "video-to-text-transcription",
        "youtube-transcript-generator",
        "podcast-transcription",
        "live-transcription",
        "meeting-minutes-generator",
      ],
    },
  ],

  Extension: [
    {
      id: "record",
      heading: "Browser Extensions",
      description: "Generate browser extensions for screen recording and other browser-level tasks.",
      slugs: [
        "screen-recorder-extension",
      ],
    },
  ],

  Productivity: [
    {
      id: "focus",
      heading: "Focus & Task Management",
      description: "Timers, to-do lists, and productivity tools to help you stay focused and organized.",
      slugs: [
        "pomodoro-timer",
        "to-do-list",
      ],
    },
  ],
};

export const CATEGORY_INTROS: Record<string, string> = {
  Developer:
    "Developer tools for formatting JSON, testing regex, debugging JWTs, parsing cron, encoding Base64, and 240+ more — every tool runs locally in your browser with zero uploads. Paste unformatted code, validate an API response, or generate a UUID without opening a terminal or trusting a random pastebin.",
  Calculator:
    "Online calculators for percentages, fractions, dates, grades, and everyday math — EMI-style precision without the signup. Every calculation runs in your browser; results appear as you type, and nothing you enter is ever sent to a server.",
  Utility:
    "{count} everyday utility tools — password and random generators, unit converters, CSV cleaners, timers, resume builder, QR codes, and more. Generate a strong password, convert kilograms to pounds, or analyze a CSV: all processing happens locally in your browser with nothing uploaded.",
  Audio:
    "{count} browser-based audio tools — convert MP3, WAV, FLAC, OGG, and AAC, trim clips, and synthesize speech in Indian languages. Speech-to-text runs on our transcription API (1 credit/min); everything else processes locally with FFmpeg WASM and files are never uploaded.",
  Image:
    "{count} image tools — compress JPGs 60–80% without visible loss, remove backgrounds with AI, resize to exact pixels, convert PNG to JPG, and crop passport photos. Everything renders in your browser; your photos never leave your device.",
  PDF:
    "{count} PDF tools — edit with the full in-browser editor, merge 20+ files with drag-and-drop, compress for email, convert JPG to PDF and PDF to Word, split chapters, and fill forms. Editing and conversion run locally via pdf-lib; only the optional AI actions (summarize, translate, PII sweep) send page text to our server.",
  Video:
    "{count} browser-based video tools — compress MP4s, convert to GIF, trim clips, extract MP3 audio, and add subtitles using FFmpeg WASM on your device. Nothing is uploaded to any server.",
  Converter:
    "{count} file converters — Markdown to HTML, JSON to CSV, EPUB to PDF, images to PDF, and dozens more. Every conversion happens locally in your browser; documents and data are never uploaded.",
  SEO:
    "{count} SEO tools — check keyword density, preview Google snippets, validate robots.txt, and audit canonical tags locally. The sitemap crawler runs on our server (it must fetch the target site); everything else analyzes in your browser.",
  Health:
    "Health calculators — BMI, BMR via Mifflin-St Jeor, TDEE with activity multipliers, body fat, heart-rate zones, ovulation windows, and calorie needs. All math runs locally; no health data ever leaves your browser.",
  AI:
    "{count} AI tools — generate images, transcribe audio, summarize documents, check grammar, and upscale photos. Cloud AI features are clearly marked; everything else runs on-device with nothing uploaded.",
  Text:
    "{count} text tools — live word counts with Flesch-Kincaid readability, case conversion, fancy Unicode fonts, handwriting rendering, diff checking, and lorem ipsum. All processing happens locally — free to start with no signup, fair daily limits apply.",
  Branding:
    "{count} branding tools — logo maker, business cards, email signatures, link-in-bio pages, and social calendars. Every tool runs locally in your browser; your brand assets stay yours.",
  Design:
    "Design utilities — pick colors with eyedropper precision, generate harmonious palettes, preview typography, edit SVG, and subset fonts. All processing happens locally — free to start with no signup, fair daily limits apply.",
  Finance:
    "{count} financial tools — EMI with reducing-balance math, SIP projections with worked examples, margin vs markup solver, GST invoices, salary take-home, and CAGR. Every calculation runs in your browser; no financial data is transmitted.",
  Privacy:
    "{count} privacy tools — strip GPS EXIF before posting, validate Aadhaar format offline, check password strength, generate PGP keys, and share self-destructing notes. All processing happens locally with nothing uploaded.",
  "indian-utilities":
    "{count} India-specific tools — passport photos (3.5×4.5 cm), PAN resizing, Aadhaar masking and validation, GST calculators and invoices, IFSC lookup, and UPI validation. Built for NSDL, UIDAI, and GST-portal realities; everything runs in your browser.",
  Transcription:
    "Transcription tools — speech-to-text from MP3/WAV/M4A/FLAC, YouTube transcripts from URLs, and meeting-minutes generation. Whisper-grade accuracy with on-device options; recordings stay yours.",
  Extension:
    "Browser extension generator — scaffold screen-recorder extensions and other browser-level utilities from templates. All processing happens locally in your browser.",
  "Growth & Marketing":
    "SaaS metrics calculators — MRR with net-new breakout, ARR, LTV, CAC, churn, runway, CPM, ROAS, and NPS. Worked examples included (e.g., 120 customers × $49 = $5,880 MRR). All math runs in your browser.",
  Productivity:
    "Productivity tools — Pomodoro with void-on-interrupt discipline, to-do lists, countdowns, and world clock. Session counts persist locally; no account, no uploads.",
};

// Per-hub FAQs — 4 unique questions per category, rendered on the category
// page with FAQPage JSON-LD. These are the hub's indexable editorial layer:
// every answer must mention concrete formats, tools, or numbers from this
// category (no template filler — that's what the classifier filters).
export const CATEGORY_FAQS: Record<string, CategoryFaq[]> = {
  Image: [
    {
      question: "How much can I compress a JPG without visible quality loss?",
      answer: "Photos typically shrink 60–80% before artifacts show. Use the quality slider around 70–80 for web uploads, and compare the before/after preview — flat graphics and screenshots compress better as PNG instead.",
    },
    {
      question: "Should I use PNG, JPG, or WebP?",
      answer: "JPG for photos, PNG when you need transparency or crisp text, WebP for the smallest web delivery (about 30% smaller than JPG). The converters here switch between all three in one click.",
    },
    {
      question: "Are my photos uploaded anywhere?",
      answer: "No. Resizing, compression, background removal previews, and format conversion all run in your browser via Canvas and WebAssembly — your images never leave your device.",
    },
    {
      question: "What size should a passport photo be?",
      answer: "India uses 3.5 × 4.5 cm (51 × 51 mm for the US visa). Set exact pixel dimensions for print DPI — e.g., 413 × 531 px at 300 DPI for 3.5 × 4.5 cm — and crop to the required aspect ratio first.",
    },
  ],
  PDF: [
    {
      question: "How do I merge PDFs in a specific page order?",
      answer: "Add your files, then drag the thumbnails into order before merging — the editor supports 20+ files at once. Splitting works the same way: pick page ranges like 1–5, 8, 12–15.",
    },
    {
      question: "How do I shrink a PDF for email attachments?",
      answer: "Compression targets the heaviest parts first: downsampling embedded images and stripping duplicate fonts. A scanned 25 MB document usually lands under the 10 MB Gmail limit with text still selectable.",
    },
    {
      question: "Can I edit existing text inside a PDF?",
      answer: "Yes — the in-browser editor lets you click any text block and retype it in place, preserving fonts and layout. For scanned pages, run OCR first so the page gains a real text layer.",
    },
    {
      question: "What stays private when I use the AI features?",
      answer: "Editing, merging, compression, and conversion run locally via pdf-lib. Only the optional AI actions — summarize, translate, PII sweep — send page text to our server, and each one asks before it runs.",
    },
  ],
  Developer: [
    {
      question: "Which regex flavor does the tester use?",
      answer: "JavaScript (the same engine as your browser), with live match highlighting and capture-group inspection. Patterns you validate here behave identically in Node.js and frontend code.",
    },
    {
      question: "Is it safe to paste a JWT or API key into the decoders?",
      answer: "Yes — decoding and validation happen entirely in your browser; nothing is transmitted. Still, prefer test tokens over production secrets out of habit.",
    },
    {
      question: "Why is my Base64 output ~33% larger than the input?",
      answer: "That's inherent to the encoding: every 3 input bytes become 4 ASCII characters. Use the converter for data URIs, basic-auth headers, and embedding small assets in CSS.",
    },
    {
      question: "How do I read a cron expression like */15 9-17 * * MON-FRI?",
      answer: "Field by field: every 15 minutes, hours 9–17, any day of month/month, weekdays only. The cron parser expands any expression into plain-English schedules and next-run times.",
    },
  ],
  Audio: [
    {
      question: "MP3 vs WAV vs FLAC — which should I choose?",
      answer: "MP3 for portable listening (320 kbps is transparent for most ears), WAV for editing masters, FLAC for lossless archiving at half the WAV size. OGG/Opus wins for voice streaming at low bitrates.",
    },
    {
      question: "What bitrate should I convert to?",
      answer: "128 kbps for podcasts and voice, 192–256 kbps for music sharing, 320 kbps for maximum quality. Re-encoding an already-compressed MP3 to a higher bitrate can't restore lost detail.",
    },
    {
      question: "How does browser audio conversion work?",
      answer: "Files are decoded and re-encoded locally with FFmpeg compiled to WebAssembly — an M4A to MP3 or FLAC to OGG conversion never uploads your audio to any server.",
    },
    {
      question: "Which languages does speech-to-text support?",
      answer: "Major Indian languages plus English, with transcription billed at 1 credit per minute. Everything else on this hub — conversion, trimming, synthesis — is free within fair daily limits.",
    },
  ],
  Converter: [
    {
      question: "How do I convert CSV to JSON?",
      answer: "Paste or drop the CSV — the first row becomes object keys by default. Nested fields, custom delimiters, and arrays are configurable before you copy or download the result.",
    },
    {
      question: "Can I convert Markdown to HTML and back?",
      answer: "Yes, both directions. Markdown to HTML renders tables, code blocks, and task lists; HTML to Markdown strips tags back to clean text you can edit anywhere.",
    },
    {
      question: "How do number-base conversions handle large values?",
      answer: "Binary, octal, decimal, and hex convert with arbitrary precision — long bit strings and 64-bit values stay exact, unlike spreadsheet functions that round past 15 digits.",
    },
    {
      question: "How do I combine images into one PDF?",
      answer: "Add JPG or PNG files in order, set page size and margins, and export — each image becomes one page. Reorder by dragging before converting.",
    },
  ],
  Calculator: [
    {
      question: "How do I calculate a percentage increase?",
      answer: "Subtract old from new, divide by old, multiply by 100. Going from 40 to 50 is a 25% increase — the percentage calculator handles increase, decrease, and reverse-percentage in one place.",
    },
    {
      question: "How are weighted grades averaged?",
      answer: "Multiply each score by its weight, sum those products, and divide by total weight. A 90 on a 60%-weighted exam plus 70 on 40% coursework averages 82, not 80.",
    },
    {
      question: "How do I count days between two dates?",
      answer: "Enter both dates to get exact days, weeks, and months between them — useful for notice periods, warranties, and age calculations. Results account for leap years automatically.",
    },
    {
      question: "Are the calculations precise for money?",
      answer: "Yes — decimal math avoids the floating-point errors that make 0.1 + 0.2 equal 0.30000000000000004 in spreadsheets. Financial figures round correctly to paise and cents.",
    },
  ],
  Utility: [
    {
      question: "How long should a strong password be?",
      answer: "At least 16 random characters mixing upper/lowercase, digits, and symbols — roughly 95 bits of entropy, uncrackable by brute force. The generator uses your browser's cryptographic randomness, never a predictable pattern.",
    },
    {
      question: "What QR error-correction level should I pick?",
      answer: "Medium (M) for clean screen display, High (H) for printed codes that may get dirty or partially covered — H survives up to 30% damage. Higher levels make denser, harder-to-scan codes.",
    },
    {
      question: "How do I clean a messy CSV?",
      answer: "Trim whitespace, normalize delimiters, drop empty rows, and fix inconsistent quoting in one pass — then preview the table before downloading the cleaned file.",
    },
    {
      question: "Do utility tools work offline?",
      answer: "Most do. Password generation, unit conversion, timers, and QR codes run entirely in-page — once loaded, they keep working with no connection.",
    },
  ],
  Text: [
    {
      question: "What counts as a word in the word counter?",
      answer: "Whitespace-separated tokens, with separate tallies for characters (with and without spaces), sentences, paragraphs, and estimated reading time at 200 words per minute.",
    },
    {
      question: "How does Title Case handle small words?",
      answer: "Articles, short prepositions, and conjunctions (a, an, the, of, and) stay lowercase unless they lead the title — matching book-title conventions rather than capitalizing everything.",
    },
    {
      question: "Word-level or line-level diff?",
      answer: "Both: line-level shows which lines changed, word-level highlights the exact edited words inside them — paste two drafts to see insertions in green and deletions in red.",
    },
    {
      question: "Can I preview Markdown as I type?",
      answer: "Yes — the editor renders headings, tables, code blocks with highlighting, and task lists live beside your source, with one-click HTML or file export.",
    },
  ],
  Finance: [
    {
      question: "How is EMI calculated?",
      answer: "On a reducing balance: EMI = P × r × (1+r)^n / ((1+r)^n − 1), where r is the monthly rate. Early payments are mostly interest — the amortization table shows the principal/interest split per month.",
    },
    {
      question: "How does compounding frequency change returns?",
      answer: "More frequent compounding earns slightly more: 8% compounded quarterly beats 8% annual by about 0.2 percentage points a year. The calculators let you compare monthly, quarterly, and annual side by side.",
    },
    {
      question: "How do I make a GST-compliant invoice?",
      answer: "Add line items with HSN codes and GST slabs (5/12/18/28%), plus CGST+SGST for intra-state or IGST for inter-state sales. The GST invoice generator outputs a formatted, printable invoice with totals.",
    },
    {
      question: "SIP vs lump sum — which grows more?",
      answer: "It depends on market timing, which no one controls. SIP smooths entry price through volatility; lump sum wins in steady uptrends. Model both with the same expected return to compare fairly.",
    },
  ],
  Health: [
    {
      question: "Is BMI accurate for muscular people?",
      answer: "Not always — BMI can't distinguish muscle from fat, so athletes can read as overweight. Pair it with body-fat estimate and waist-to-height ratio (keep under 0.5) for a fuller picture.",
    },
    {
      question: "How is BMR calculated?",
      answer: "With the Mifflin-St Jeor equation from weight, height, age, and sex — currently the most validated formula for resting calorie burn. Multiply by an activity factor (1.2–1.9) for TDEE.",
    },
    {
      question: "What are heart-rate zones for cardio?",
      answer: "Zone 2 (60–70% of max) builds aerobic base and burns fat efficiently; Zone 4–5 (80–100%) builds speed. Max is roughly 220 minus age — the calculators derive all five zones from it.",
    },
    {
      question: "Is my health data sent anywhere?",
      answer: "No. Every health calculator runs its math locally in your browser — weight, age, and measurements never leave your device.",
    },
  ],
  AI: [
    {
      question: "What can I generate with the AI image tools?",
      answer: "Concept art, product mockups, avatars, and backgrounds from text prompts — plus upscaling that adds detail to low-resolution photos. Generations are marked as AI-made in the output metadata.",
    },
    {
      question: "How long a document can the summarizer handle?",
      answer: "Multi-page PDFs and long articles condense to key points, with adjustable summary length. Anything you don't want transmitted should use the on-device options instead.",
    },
    {
      question: "Which features cost credits?",
      answer: "Cloud AI features — image generation, transcription, summarization — are marked with their cost before you run them. Browser-local tools are free within fair daily limits.",
    },
    {
      question: "Can the grammar checker handle Indian English?",
      answer: "Yes — it flags spelling, agreement, and punctuation while respecting common Indian-English usage rather than forcing US phrasing on every sentence.",
    },
  ],
  SEO: [
    {
      question: "What is a good keyword density?",
      answer: "There is no magic number — the checker shows your term distribution so you can spot stuffing (same phrase every sentence) or dilution. Natural coverage across headings matters more than any percentage.",
    },
    {
      question: "How long should meta titles and descriptions be?",
      answer: "Titles display fully up to ~60 characters; descriptions truncate around 155–160. The snippet preview shows exactly where Google cuts each one off.",
    },
    {
      question: "What does the robots.txt validator check?",
      answer: "Syntax errors, contradictory Allow/Disallow rules, unreachable sitemap URLs, and whether a given user-agent path is actually crawlable — the three mistakes that accidentally deindex sites.",
    },
    {
      question: "Why does the sitemap crawler run on a server?",
      answer: "It must fetch the target site, which a browser page can't do across origins at scale. Everything else on this hub — density, snippets, validators — analyzes locally.",
    },
  ],
  Privacy: [
    {
      question: "What EXIF data should I strip before posting photos?",
      answer: "GPS coordinates first — phones embed exact latitude/longitude — plus timestamps and device serials. The EXIF stripper removes location and device tags while keeping the image itself untouched.",
    },
    {
      question: "How does Aadhaar masking work?",
      answer: "The first 8 digits become Xs, showing only the last 4 (XXXX-XXXX-1234) per UIDAI's masked-Aadhaar convention — done on a copy, so your original stays intact.",
    },
    {
      question: "What size PGP key should I generate?",
      answer: "RSA 4096 for maximum compatibility with older clients, or Ed25519/Curve25519 for modern, faster keys. Generation uses cryptographic randomness in your browser — the private key never travels.",
    },
    {
      question: "How do self-destructing notes work?",
      answer: "Write a note to get a one-time link: it decrypts on first open and is then destroyed server-side, so forwarding the link later shows nothing.",
    },
  ],
  Productivity: [
    {
      question: "What is the standard Pomodoro split?",
      answer: "25 minutes of focused work, 5-minute break, and a 15–30 minute break after four sessions. The timer voids the session if you interrupt it — that's the discipline mechanism.",
    },
    {
      question: "Where are my to-dos stored?",
      answer: "In your browser's local storage — lists survive refreshes and restarts on the same device, with no account and nothing synced to any server.",
    },
    {
      question: "Does the world clock handle daylight saving?",
      answer: "Yes — zones follow the IANA database, so New York, London, and Sydney shift automatically on their DST dates without manual adjustment.",
    },
    {
      question: "How precise are the countdowns?",
      answer: "Second-level precision with day/hour/minute breakdowns — set a deadline once and the display ticks down live, even across tab switches.",
    },
  ],
  Design: [
    {
      question: "Which color format should I copy — HEX, RGB, or HSL?",
      answer: "HEX for CSS shorthand (#3B82F6), RGB when you need alpha transparency (rgba), HSL when adjusting lightness/saturation systematically. The picker outputs all three plus CSS variables.",
    },
    {
      question: "What contrast ratio passes WCAG?",
      answer: "4.5:1 for normal text (AA), 3:1 for large text and UI components, 7:1 for AAA. The checker tests foreground/background pairs and suggests the nearest passing shade.",
    },
    {
      question: "How do I get CSS for a gradient?",
      answer: "Build it visually with color stops, then copy the linear-gradient or radial-gradient declaration — with fallbacks — straight into your stylesheet.",
    },
    {
      question: "Can I export a palette for Figma?",
      answer: "Yes — palettes export as swatch lists and CSS custom properties you can paste into design tokens, plus PNG strips for mood boards.",
    },
  ],
  Branding: [
    {
      question: "What file formats should a logo kit include?",
      answer: "SVG for infinite scaling (web, print), PNG at 1024px+ with transparency for documents, and ICO/favicon sizes for browser tabs. Export all three from one design.",
    },
    {
      question: "What size should Open Graph images be?",
      answer: "1200 × 630 px — the size WhatsApp, X, and LinkedIn all crop link previews to. Keep key text inside the center 1000 × 500 safe zone.",
    },
    {
      question: "Which favicon sizes do browsers need?",
      answer: "16 × 16 and 32 × 32 ICO for tabs, 180 × 180 Apple touch icon, and 192/512 px PNGs for the web manifest. The generator emits the full set plus the HTML tags.",
    },
    {
      question: "How do I compare two campaign variants?",
      answer: "Run the A/B calculator with visitors and conversions per variant — it reports whether the lift is statistically significant or just noise at 95% confidence.",
    },
  ],
  Video: [
    {
      question: "How do I compress a video for WhatsApp?",
      answer: "WhatsApp caps sharing around 16–100 MB depending on version. Target 720p with moderate bitrate — a 5-minute 1080p clip typically drops from ~400 MB to under 50 MB with no visible loss on phones.",
    },
    {
      question: "Why are my GIFs so large?",
      answer: "GIF stores every frame uncompressed-ish: cut frame rate to 10–15 fps, shrink dimensions, and limit colors. A 10-second 480p clip lands around 3–8 MB — use muted MP4 instead for longer clips.",
    },
    {
      question: "How do I extract MP3 audio from MP4?",
      answer: "Drop the video in — the audio track is demuxed and re-encoded to MP3 without reprocessing the video, so extraction takes seconds even for long files.",
    },
    {
      question: "SRT or VTT subtitles?",
      answer: "SRT for maximum player compatibility, VTT for web players (it supports styling and positioning). The tools convert between both and shift timings in bulk.",
    },
  ],
  Transcription: [
    {
      question: "How accurate is the speech-to-text?",
      answer: "Whisper-grade models hit 90–95% on clear audio; heavy accents, crosstalk, and background noise lower that. Review the editable transcript — timestamps make corrections fast.",
    },
    {
      question: "What is the maximum audio length?",
      answer: "Long files are chunked automatically — hour-long meetings and lectures transcribe in segments that stitch into one timestamped document.",
    },
    {
      question: "How are transcription credits used?",
      answer: "1 credit per minute of audio, counted after processing completes. Failed or empty uploads don't consume credits.",
    },
    {
      question: "Can I transcribe a YouTube video from its URL?",
      answer: "Yes — paste the link to pull captions or transcribe the audio track directly, then export as text, SRT, or meeting minutes.",
    },
  ],
  Extension: [
    {
      question: "What does the extension generator produce?",
      answer: "A ready-to-load project: manifest, icons, popup page, and background boilerplate following current store requirements — load it unpacked in developer mode and extend from there.",
    },
    {
      question: "Can I scaffold a screen-recorder extension?",
      answer: "Yes — the template wires tab capture, recording controls, and WebM download, which you can see working in the screen-recorder-extension reference build.",
    },
    {
      question: "How do I publish to the Chrome Web Store?",
      answer: "Zip the project folder and upload it in the developer dashboard with store icons and screenshots. The scaffold already structures files the way reviewers expect.",
    },
    {
      question: "Do generated extensions phone home?",
      answer: "No — templates contain zero analytics or remote code. Everything they do happens in the browser; add only the permissions your feature actually needs.",
    },
  ],
  "Growth & Marketing": [
    {
      question: "How do I calculate MRR?",
      answer: "Sum this month's recurring revenue: e.g., 120 customers × $49 = $5,880 MRR. Track net-new separately from expansion, contraction, and churned revenue to see true growth.",
    },
    {
      question: "What is a healthy LTV to CAC ratio?",
      answer: "3:1 or better — each customer returns at least three times their acquisition cost. Below 1:1 you lose money on every signup; above 5:1 you're likely under-investing in growth.",
    },
    {
      question: "How does churn compound over a year?",
      answer: "Brutally: 5% monthly churn leaves only ~54% of customers after 12 months (0.95^12). Cutting churn from 5% to 3% keeps ~70% — the calculator shows the retention curve.",
    },
    {
      question: "ROAS vs ROI — what's the difference?",
      answer: "ROAS measures gross revenue per ad dollar (4:1 = $4 back per $1 spent); ROI subtracts all costs including product and overhead. Profitable ROAS can still mean negative ROI — compute both.",
    },
  ],
  "indian-utilities": [
    {
      question: "How do I mask an Aadhaar number?",
      answer: "Replace the first 8 digits with Xs, keeping the last 4 visible (XXXX-XXXX-1234) per UIDAI convention. Masking happens on a copy — never overwrite your original scan.",
    },
    {
      question: "What is the PAN card number format?",
      answer: "10 characters: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F). The 4th letter reveals holder type — P for individual, C for company — which the validator checks.",
    },
    {
      question: "What goes on a GST invoice?",
      answer: "Seller and buyer GSTINs, HSN-coded line items with the right slab (5/12/18/28%), then CGST+SGST split for intra-state or IGST for inter-state sales. The GST invoice generator formats all of it print-ready.",
    },
    {
      question: "How do I find a bank branch from an IFSC?",
      answer: "The 11-character code splits as 4-letter bank code + 0 + 6-character branch code. Enter it to resolve the exact branch, or search any 6-digit pincode with the pincode finder.",
    },
  ],
};


/**
 * Hub upgrades (rival-teardown spec, Oct 2026). All data below is curated,
 * not generated — every slug verified live, every claim honest.
 */

/** Tools shipped recently enough to earn a "New" pill. Reviewed monthly:
 *  add launches, drop anything older than ~60 days. Test-locked: badge
 *  renders ONLY on these slugs (see CategoryPageClient.test). */
export const NEW_TOOL_SLUGS: ReadonlySet<string> = new Set([
  "pdf-editor",
  "gemini-watermark-remover",
  "bulk-avif-optimizer",
  "bulk-heic-converter",
  "bulk-image-upscaler",
]);

/** Cross-category wheel: 3–4 links per hub with the honest reason to cross.
 *  Slugs are URL slugs; every target must resolve (test-locked). */
export const RELATED_CATEGORIES: Record<string, { slug: string; blurb: string }[]> = {
  PDF: [
    { slug: "image", blurb: "JPG flows into PDF and back out" },
    { slug: "developer", blurb: "Validators and format tools" },
    { slug: "ai", blurb: "Summarize and chat with PDFs" },
  ],
  Image: [
    { slug: "pdf", blurb: "Photos merge into PDF documents" },
    { slug: "video", blurb: "GIFs and frames go both ways" },
    { slug: "ai", blurb: "Upscale and backgrounds" },
  ],
  Video: [
    { slug: "audio", blurb: "Extract MP3 from any clip" },
    { slug: "image", blurb: "GIFs plus frame grabs" },
    { slug: "converter", blurb: "Format pairs for video" },
  ],
  Audio: [
    { slug: "video", blurb: "MP3s come from video" },
    { slug: "transcription", blurb: "Speech to text" },
    { slug: "converter", blurb: "Format pairs for audio" },
  ],
  AI: [
    { slug: "transcription", blurb: "Speech and meeting AI" },
    { slug: "image", blurb: "Generate and enhance" },
    { slug: "text", blurb: "Paraphrase and translate" },
  ],
  Converter: [
    { slug: "video", blurb: "Video format pairs" },
    { slug: "audio", blurb: "Audio format pairs" },
    { slug: "pdf", blurb: "Document conversions" },
  ],
  Developer: [
    { slug: "converter", blurb: "Data format pairs" },
    { slug: "seo", blurb: "Audit and meta tools" },
    { slug: "text", blurb: "Diff, format, encode" },
  ],
  Text: [
    { slug: "ai", blurb: "Paraphrase and translate" },
    { slug: "transcription", blurb: "Captions from text" },
    { slug: "seo", blurb: "Density and readability" },
  ],
  Finance: [
    { slug: "calculator", blurb: "The math underneath" },
    { slug: "utility", blurb: "Everyday converters" },
  ],
  Privacy: [
    { slug: "pdf", blurb: "Redact documents" },
    { slug: "image", blurb: "Strip EXIF, blur faces" },
    { slug: "developer", blurb: "Hashes and crypto" },
  ],
  SEO: [
    { slug: "developer", blurb: "Validators and linters" },
    { slug: "text", blurb: "Content analysis" },
    { slug: "utility", blurb: "Link checkers" },
  ],
  Utility: [
    { slug: "converter", blurb: "Unit conversions" },
    { slug: "calculator", blurb: "Quick math" },
    { slug: "text", blurb: "Text helpers" },
  ],
  "indian-utilities": [
    { slug: "finance", blurb: "GST and tax math" },
    { slug: "pdf", blurb: "Aadhaar and forms" },
    { slug: "utility", blurb: "Everyday helpers" },
  ],
  Transcription: [
    { slug: "audio", blurb: "Source audio tools" },
    { slug: "video", blurb: "Video captions" },
    { slug: "ai", blurb: "Meeting AI" },
  ],
  Branding: [
    { slug: "design", blurb: "Colors and type" },
    { slug: "image", blurb: "Assets to design with" },
    { slug: "growth-metrics", blurb: "Measure campaigns" },
  ],
  Productivity: [
    { slug: "utility", blurb: "Timers and helpers" },
    { slug: "text", blurb: "Notes and lists" },
  ],
  Design: [
    { slug: "image", blurb: "Assets to design with" },
    { slug: "branding", blurb: "Logos and posts" },
    { slug: "developer", blurb: "CSS generators" },
  ],
  Health: [
    { slug: "calculator", blurb: "The math underneath" },
    { slug: "utility", blurb: "Converters" },
  ],
  Extension: [
    { slug: "utility", blurb: "Everyday helpers" },
    { slug: "productivity", blurb: "Timers and lists" },
  ],
  Calculator: [
    { slug: "finance", blurb: "Money math" },
    { slug: "converter", blurb: "Unit conversions" },
    { slug: "health", blurb: "Body math" },
  ],
  "Growth & Marketing": [
    { slug: "finance", blurb: "Money math" },
    { slug: "branding", blurb: "Logos and posts" },
    { slug: "seo", blurb: "Audit and rank" },
  ],
};

/** One category-specific proof line per hub. Universal truths (no signup,
 *  AI marked + costed) render beside these — never instead of them. */
export const TRUST_LINES: Record<string, string> = {
  AI: "AI features cost credits and say so before you click — 5 free trial credits, no card.",
  Audio: "FFmpeg runs in your browser — MP3, WAV, FLAC and OGG never upload.",
  Branding: "Logos and posts compose on local Canvas — nothing uploaded.",
  Calculator: "66 calculators, every formula computed locally with steps shown.",
  Converter: "Format pairs convert locally — files never leave the tab.",
  Design: "Colors, fonts and icons generated on-device, free.",
  Developer: "242 dev tools — formatters, validators and encoders run locally; secrets never uploaded.",
  Extension: "Enhancements run locally in your browser — no data collection.",
  Finance: "EMI, tax and ledger math computed locally — figures never uploaded.",
  "Growth & Marketing": "SaaS metrics computed locally from numbers you enter.",
  Health: "Wellness math runs locally; estimates are informational, not medical advice.",
  Image: "Canvas and WebAssembly processing — photos never uploaded.",
  PDF: "pdf-lib runs in your browser — files to 125MB, no signup.",
  Privacy: "Crypto runs locally — secrets never leave your device.",
  Productivity: "Timers and lists run fully offline after load.",
  SEO: "Audits run on pasted content locally — nothing crawled from our servers.",
  Text: "Text tools run on pasted content locally — nothing uploaded.",
  Transcription: "Speech runs on-device or via API with per-minute costs shown first.",
  Utility: "Everyday tools, local-first, free.",
  Video: "FFmpeg WASM in your browser — footage to 250MB never uploads.",
  "indian-utilities": "PAN, Aadhaar and GST formats validated locally — numbers never uploaded.",
};

/** Blog guides wired per hub (slugs in src/lib/blog-posts.ts, /blog/posts/). */
export const CATEGORY_GUIDES: Record<string, string[]> = {
  PDF: ["compress-pdf-without-losing-quality", "merge-pdf-online-free-guide"],
  Image: ["free-online-photo-editor-no-signup", "remove-background-from-image-free", "image-formats-webp-avif-jpg-guide"],
  Video: ["convert-video-to-mp3-audio-free"],
  Privacy: ["privacy-first-browser-tools-guide", "zero-telemetry-privacy"],
  Developer: ["wasm-converters", "webgl-image-tensors"],
  "indian-utilities": ["gst-invoice-guide-india"],
};
