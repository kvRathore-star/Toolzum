export interface CategorySection {
  id: string;
  heading: string;
  description: string;
  slugs: string[];
}

export const CATEGORY_SECTIONS: Record<string, CategorySection[]> = {
  Developer: [
    {
      id: "formatters",
      heading: "Code Formatters & Beautifiers",
      description: "Format and prettify your code across languages — JSON, HTML, CSS, JavaScript, TypeScript, Python, and more.",
      slugs: [
        "json-formatter", "code-formatter", "code-beautifier",
        "html-formatter", "css-formatter", "javascript-formatter",
        "typescript-formatter", "jsx-formatter", "tsx-formatter",
        "scss-formatter", "python-formatter", "yaml-formatter",
        "xml-formatter", "markdown-formatter", "sql-formatter",
        "swift-formatter",
        "proto-schema-converter", "protobuf-decoder",
        "tsconfig-analyzer", "string-template-tester",
        "test-data-generator",
        "css-to-scss-converter", "less-to-css-converter",
      ],
    },
    {
      id: "minifiers",
      heading: "Minifiers & Compressors",
      description: "Reduce file sizes of JavaScript, CSS, HTML, and JSON for faster load times.",
      slugs: [
        "js-minifier", "css-minifier", "html-minifier", "json-minifier",
      ],
    },
    {
      id: "css-generators",
      heading: "CSS Generators",
      description: "Generate CSS code visually — box shadows, gradients, grids, animations, filters, and more.",
      slugs: [
        "css-generator", "box-shadow-generator",
        "border-radius-generator", "flexbox-css-generator", "css-grid-generator",
        "text-shadow-generator", "css-transform-generator", "css-animation-generator",
        "css-filter-generator", "border-css-generator",
        "scss-to-css-converter", "stylus-to-css-converter",
        "tailwind-to-css-converter",
        "glassmorphism-generator", "neumorphism-generator",
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
      ],
    },
    {
      id: "security",
      heading: "Security & Encryption",
      description: "Encryption, hashing, key generation, JWT, SSL/TLS, CORS, CSP, and security header tools.",
      slugs: [
        "crypto-kit", "password-entropy-calculator", "two-factor-auth-generator",
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
        "aes-encrypt", "aes-decrypt", "rsa-key-generator",
        "oauth-client-setup", "pkce-verifier", "oauth-scope-builder",
        "oauth-state-validator", "pbkdf2-hash-generator", "cookie-parser",
        "secret-scanner", "security-txt-generator", "robots-txt-validator",
        "oauth-pkce-generator",
      ],
    },
    {
      id: "encoders",
      heading: "Encoders & Decoders",
      description: "Encode and decode data across formats — Base64, URL, HTML entities, hex, ASCII, binary, and more.",
      slugs: [
        "base64-encode-decode", "image-to-base64", "base64-to-image",
        "url-encoder-decoder", "html-entity-encoder", "backslash-escape",
        "encoder-decoder", "hex-ascii-converter",
        "text-to-binary", "binary-to-text", "number-base-converter",
        "base32-encoder", "base64-json-decoder", "hex-text-converter",
        "svg-base64-converter",
      ],
    },
    {
      id: "validators",
      heading: "Validators & Converters",
      description: "Validate, convert, and transform data formats — YAML, JSON, CSV, TOML, XML, HTML, and code.",
      slugs: [
        "diff-checker", "regex-tester", "yaml-json-converter",
        "xlsx-csv-converter", "toml-converter", "json-toon-converter",
        "syntax-validator", "yaml-syntax-validator", "yaml-validator",
        "git-commit-linter", "gitignore-generator", "csv-to-sqlite",
        "json-path-query-builder", "json-diff-checker",
        "json-tree-viewer",
        "html-to-jsx", "svg-to-css", "curl-to-code", "json-to-code",
        "jwt-debugger", "html-preview", "cron-parser",
        "geojson-validator", "rss-feed-validator", "sitemap-validator",
        "xpath-validator", "cron-expression-validator",
        "html-linter", "xml-minifier-validator",
        "character-encoding-converter", "unicode-converter",
        "markdown-slack-converter", "px-rem-converter",
        "ini-json-converter", "toml-converter", "json-toon-converter",
        "msgpack-inspector", "cbor-inspector",
        "avro-schema-generator", "avro-to-json-sample",
        "json-escape-unescape", "json-flattener",
        "json-to-zod", "ndjson-to-json",
        "jsonl-formatter", "json-to-url-params",
        "json-schema-generator", "merge-patch-generator",
        "css-specificity-calculator", "css-validator",
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
      ],
    },
    {
      id: "http-network",
      heading: "HTTP & Network Debugging",
      description: "Analyze HTTP headers, check SSL certificates, look up domains, and debug network configurations.",
      slugs: [
        "http-header-analyzer", "http-headers-generator",
        "http-cache-header-generator", "http-status-code-checker",
        "http-retry-policy-builder", "eslint-config-generator",
        "whois-lookup", "ssl-checker", "domain-availability-checker",
        "web-inspector", "dns-record-validator",
      ],
    },
    {
      id: "generators",
      heading: "Random Generators & Mock Data",
      description: "Generate passwords, UUIDs, tokens, fake identities, coupons, and test data.",
      slugs: [
        "random-color-generator",
        "random-date-generator", "random-time-generator",
        "random-ip-generator", "random-user-agent-generator",
        "random-team-generator", "random-picker-generator",
        "random-decision-maker", "random-username-generator",
        "random-token-generator",
        "random-string-generator", "random-sentence-generator",
        "random-word-generator", "pin-generator", "license-key-generator",
        "dummy-text-generator", "fake-data-generator",
        "fake-identity-generator", "fake-credit-card-generator",
        "sequence-generator", "coupon-code-generator",
        "serial-number-generator", "nickname-generator",         "avatar-generator",
        "uuid-generator",
        "ascii-art-generator",
      ],
    },
    {
      id: "dev-utilities",
      heading: "Developer Utilities",
      description: "Timers, converters, code tools, and everyday utilities for developers.",
      slugs: [
        "timer", "stopwatch", "countdown-tool", "interval-timer",
        "tabata-timer", "world-clock",
        "time-converter", "time-duration-calculator", "time-addition-calculator",
        "time-until-calculator", "meeting-time-planner",
        "date-difference-calculator", "date-addition-calculator",
        "week-number-calculator", "time-since-calculator",
        "time-zone-converter", "daylight-saving-time-checker",
        "work-hours-calculator", "hours-minutes-calculator",
        "minutes-to-hours-converter", "hours-to-minutes-tool",
        "seconds-to-minutes-converter", "unix-time-converter",
        "string-inspector", "url-parser", "line-sorter",
        "text-converter", "list-converter",
        "qr-code-reader", "html-to-image", "php-tools",
        "dev-utilities",
        "random-port-generator", "chmod-calculator", "docker-run-to-compose", "email-normalizer",
        "conventional-commit-generator",
        "har-analyzer", "log-analyzer",
        "package-json-validator", "mime-finder",
        "data-anonymizer",
        "port-number-lookup", "user-agent-parser", "query-string-parser",
        "sse-event-formatter", "rate-limit-header-parser", "pricing-tier-builder",
        "ssh-key-generator",
        "jwk-generator", "json-ld-generator", "json-size-analyzer",
        "image-placeholder-generator", "logo-placeholder-generator",
        "open-graph-generator",
      ],
    },
  ],

  Calculator: [
    {
      id: "finance",
      heading: "Finance Calculators",
      description: "Mortgage, EMI, SIP, GST, ROI, CAGR, salary, loan, and business finance calculators.",
      slugs: [
        "mortgage-calculator", "emi-calculator", "sip-calculator",
        "gst-calculator", "salary-calculator", "roi-calculator",
        "break-even-calculator",
        "ltv-calculator", "cac-calculator", "burn-rate-calculator",
        "customer-acquisition-cost-calculator", "customer-ltv-calculator",
        "arr-calculator", "mrr-calculator", "churn-rate-calculator",
        "revenue-growth-calculator", "runway-calculator",
        "trial-conversion-calculator",
        "car-loan-calculator", "car-lease-calculator",
        "rent-vs-buy-calculator", "inflation-calculator",
        "debt-payoff-calculator", "discount-calculator",
        "hourly-to-salary-calculator",
        "vat-calculator", "tax-calculator", "tds-calculator-india",
        "net-worth-calculator", "saas-pricing-calculator",
        "employee-turnover-calculator", "ab-test-calculator",
        "seat-license-calculator",
      ],
    },
    {
      id: "health-fitness",
      heading: "Health & Fitness Calculators",
      description: "BMI, BMR, calorie, body fat, heart rate, pregnancy, and wellness calculators.",
      slugs: [
        "bmi-calculator", "bmi-calculator-for-kids", "bmr-calculator",
        "body-fat-percentage-calculator", "body-surface-area-calculator",
        "calorie-calculator", "breastfeeding-calorie-calculator",
        "cycling-calorie-calculator", "protein-calculator",
        "macro-calculator", "keto-calculator",
        "ideal-weight-calculator", "lean-body-mass-calculator",
        "heart-rate-zone-calculator", "running-pace-calculator",
        "sleep-calculator", "steps-to-calories-calculator",
        "water-intake-calculator",
        "baby-formula-calculator", "baby-growth-percentile-calculator",
        "baby-sleep-schedule-calculator", "child-height-predictor",
        "ovulation-calculator", "pregnancy-due-date-calculator",
        "blood-alcohol-calculator",
      ],
    },
    {
      id: "math",
      heading: "Math Calculators",
      description: "Algebra, geometry, trigonometry, fractions, percentages, and scientific calculators.",
      slugs: [
        "percentage-calculator",
        "exponent-calculator", "square-root-calculator",
        "fraction-calculator",
        "fraction-to-decimal-calculator", "decimal-to-fraction-calculator",
        "ratio-calculator", "proportion-calculator", "rule-of-three-calculator",
        "probability-calculator",
        "combination-calculator", "permutation-calculator", "factorial-calculator",
        "prime-number-checker", "prime-factorization-calculator",
        "greatest-common-factor-calculator", "least-common-multiple-calculator",
        "modulo-calculator", "logarithm-calculator", "trigonometry-calculator",
        "mean-median-mode-calculator", "standard-deviation-calculator",
        "quadratic-equation-solver", "pythagorean-theorem-calculator",
        "circle-calculator", "rectangle-area-calculator", "triangle-area-calculator",
        "aspect-ratio-calculator",
        "dpi-calculator", "ppi-calculator",
        "scientific-calculator", "fluid-typography-calculator",
        "degree-radian-converter", "scientific-notation-converter",
        "significant-figures-calculator", "rounding-calculator",
        "gas-mileage-calculator", "semver-calculator",
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
      ],
    },
    {
      id: "academic",
      heading: "Academic Calculators",
      description: "Grade, GPA, and academic performance calculators.",
      slugs: [
        "final-grade-calculator", "gpa-calculator",
        "grade-calculator", "college-gpa-calculator",
      ],
    },
    {
      id: "savings",
      heading: "Savings & Investment Calculators",
      description: "Compound interest, simple interest, savings, and retirement planning calculators.",
      slugs: [
        "compound-interest-calculator", "simple-interest-calculator",
        "savings-calculator", "retirement-calculator",
        "profit-margin-calculator", "margin-calculator",
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
        "decision-maker", "yes-no-picker",
        "coin-flipper", "dice-roller", "dice-roller-tool",
        "ulid-generator",
      ],
    },
    {
      id: "games-fun",
      heading: "Games & Fun Tools",
      description: "Interactive games and fun tools — number guessing, rock paper scissors, hangman, and more.",
      slugs: [
        "number-guessing-game", "rock-paper-scissors", "hangman-game",
      ],
    },
    {
      id: "text-converters",
      heading: "Text & Number Converters",
      description: "Convert between text formats — morse code, binary, roman numerals, number to words, and more.",
      slugs: [
        "morse-code-translator", "morse-code-converter",
        "roman-numeral-converter",
        "number-to-words-converter",
        "ical-event-generator",
      ],
    },
    {
      id: "math-tools",
      heading: "Math & Percentage Tools",
      description: "Percentage calculators, tip calculators, currency rates, and everyday math utilities.",
      slugs: [
        "percentage-difference-calculator",
        "tip-calculator", "sales-tax-calculator",
        "markup-calculator", "cagr-calculator",
        "fraction-to-decimal-calculator",
        "decimal-to-fraction-calculator", "ratio-simplifier",
        "proportional-calculator", "rule-of-three-calculator",
        "combination-calculator", "permutation-calculator", "factorial-calculator",
        "prime-number-checker", "prime-factorization-calculator",
        "greatest-common-factor-calculator", "least-common-multiple-calculator",
        "modulo-calculator", "logarithm-calculator", "trigonometry-calculator",
        "degree-radian-converter", "scientific-notation-converter",
        "significant-figures-calculator", "rounding-calculator",
        "math-equation-solver", "algebra-calculator",
        "geometry-calculator", "coordinate-calculator",
        "slope-calculator", "midpoint-calculator", "distance-calculator",
        "eta-calculator",
        "study-time-calculator", "test-score-calculator",
        "words-per-page-calculator", "working-capital-calculator",
        "triangle-area-calculator", "pythagorean-theorem-calculator",
      ],
    },
    {
      id: "unit-converters",
      heading: "Unit Converters",
      description: "Convert between units of speed, length, weight, volume, area, data size, and more.",
      slugs: [
        "unit-converter", "speed-converter", "length-converter",
        "weight-converter", "volume-converter", "area-converter",
        "data-size-converter",
        "temperature-converter", "cooking-measurement-converter",
        "fuel-consumption-converter", "paper-size-converter",
        "clothing-size-converter",
        "hours-to-minutes-converter",
        "vcf-csv-converter", "ics-csv-converter",
        "tsv-csv-converter",
        "speed-converter-advanced", "power-converter", "pressure-converter",
      ],
    },
    {
      id: "data-csv",
      heading: "Data & CSV Tools",
      description: "Analyze, clean, convert, and preview CSV data — sorter, cleaner, statistics, and more.",
      slugs: [
        "csv-data-cleaner", "csv-statistics",
        "csv-html-table-converter",
        "large-text-viewer",
        "column-extractor", "column-renamer", "data-type-converter",
        "deduplicator", "format-validator", "csv-merger",
        "null-value-handler", "pivot-generator", "row-filter",
        "csv-row-sorter", "csv-splitter", "csv-transpose",
        "csv-to-markdown", "csv-to-ndjson", "csv-to-sql",
        "csv-json-row-generator", "csv-analyzer",
      ],
    },
    {
      id: "color-design",
      heading: "Color & Design Tools",
      description: "Pick colors, generate palettes, and check contrast ratios for accessible designs.",
      slugs: [
        "color-picker", "color-palette-generator",
        "gradient-generator", "contrast-checker",
      ],
    },
    {
      id: "everyday",
      heading: "Everyday Utilities",
      description: "Speed test, privacy cleaner, resume builder, bank statement analyzer, and more.",
      slugs: [
        "speed-test", "resume-builder",
        "bank-statement-analyser", "ip-address-lookup",
        "benchmark-builder",
        "numeronym-generator", "mac-vendor-lookup",
        "wifi-qr-generator", "phone-parser", "otp-generator",
        "slugify-tool", "emoji-picker",
        "cidr-calculator", "aws-iam-policy-analyzer",
        "ring-size-converter", "screen-size-converter",
        "shoe-size-converter", "zip-file-extractor",
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
        "image-converter",
        "png-to-svg", "raw-image-converter", "psd-to-jpg-png",
        "gif-to-apng", "apng-to-gif",
        "image-to-ico",
        "bulk-heic-to-jpg", "bulk-svg-to-png",
        "bulk-webp-avif-modernizer",
      ],
    },
    {
      id: "edit",
      heading: "Image Editors",
      description: "Edit images — add text, blur faces, remove backgrounds, apply filters, and enhance photos.",
      slugs: [
        "add-text-to-photo", "batch-image-editor",
        "background-remover", "object-remover",
        "image-enhancer", "photo-retoucher",
        "image-colorizer", "rotate-image",
 "unblur-sharpen",
        "bg-changer",  
        "collage-maker", "chart-maker",
        "gif-editor", "gif-compressor", "gif-resizer",
        "color-converter",
        "bulk-image-watermark", "bulk-face-anonymizer",
        "bulk-exif-stripper-injector", "bulk-app-icon-generator",
        "bulk-image-to-text-ocr",
      ],
    },
    {
      id: "ai-image",
      heading: "AI Image Tools",
      description: "AI-powered image tools — upscale, face swap, background removal, and colorization.",
      slugs: [
        "ai-image-upscaler", "ai-face-swap",
        "meme-generator",
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
        "pdf-page-delete", "pdf-page-manager",
      ],
    },
    {
      id: "convert",
      heading: "PDF Converters",
      description: "Convert PDFs to and from other formats — HTML, Markdown, PNG, TIFF, DOCX, TXT, and more.",
      slugs: [
        "pdf-to-html", "html-to-pdf",
        "pdf-to-markdown", "markdown-to-pdf",
        "pdf-to-png", "pdf-to-tiff", "tiff-to-pdf",
        "pdf-to-docx", "pdf-to-txt",
        "pdf-to-pdfa",
        "url-to-pdf", "eml-to-pdf",
        "document-converter",
        "bulk-image-to-pdf",

      ],
    },
    {
      id: "edit",
      heading: "PDF Editors & Utilities",
      description: "Edit, annotate, sign, watermark, redact, and organize PDF documents.",
      slugs: [
        "unlock-pdf", "protect-pdf", "watermark-pdf",
        "rotate-pdf", "crop-pdf", "redact-pdf",
        "flatten-pdf", "grayscale-pdf", "whiteout-pdf",
        "resize-pdf-pages",
        "add-text-to-pdf", "add-image-to-pdf",
        "add-page-numbers-to-pdf",
        "header-footer-pdf", "nup-pdf",
        "pdf-annotator", "deskew-pdf",
        "extract-images-from-pdf",
        "pdf-metadata-editor",
        "esign-pdf", "pdf-form-filler",
        "pdf-ocr", "scan-to-pdf", "repair-pdf",
        "translate-pdf", "bookmark-pdf",
        "compare-pdf-files",
        "pdf-bates-numbering", "pdf-stamp", "pdf-timestamp",
        "pdf-background-color", "pdf-add-blank-page",
        "pdf-table-of-contents", "pdf-attachments",
        "pdf-info", "pdf-cleanup",
        "pdf-advanced",
        "create-pdf",
        "bulk-pdf-data-extractor", "bulk-pdf-form-extractor",
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
        "video-converter", "video-converter-tool",
        "video-to-gif", "mp4-to-gif", "webm-to-gif",
        "video-to-mp3",
      ],
    },
    {
      id: "trim",
      heading: "Video Trimmers",
      description: "Cut, trim, and crop video files to extract the segments or dimensions you need.",
      slugs: [
        "crop-video",
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
        "subtitle-translator", 
        "bulk-video-subtitle-burner", "bulk-subtitle-time-shifter",
      ],
    },
  ],

  Converter: [
    {
      id: "image",
      heading: "Image Converters",
      description: "Convert images between formats — SVG, PNG, GIF, WebP, ICO, and more.",
      slugs: [
        "website-screenshot",
        "gif-to-webp-webm",
      ],
    },
    {
      id: "audio",
      heading: "Audio Converters",
      description: "Convert audio files between popular formats for playback on any device.",
      slugs: [
        "gif-to-mp4",
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
      ],
    },
    {
      id: "data",
      heading: "Data Converters",
      description: "Convert between data formats — JSON, CSV, XML, Parquet, and more.",
      slugs: [
        "data-converter", "parquet-to-csv-converter",
        "json-toon-converter", "csv-html-table-converter",
        "temperature-converter", "archive-converter",
        "markdown-tools",
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
        "xml-sitemap-generator", "meta-tag-generator",
        "seo-meta-tag-generator", "seo-slug-generator",
        "robots-txt-generator",
      ],
    },
    {
      id: "text-tools",
      heading: "Text Tools for SEO",
      description: "Edit, sort, deduplicate, and convert text content for SEO optimization.",
      slugs: [
        "text-replacer", "text-sorter", "text-deduplicator",
        "duplicate-word-remover", "text-cleaner", "text-splitter",
        "trailing-space-remover",
        "text-to-html-converter", "html-to-text-converter",
        "markdown-previewer",
      ],
    },
  ],

  Health: [
    {
      id: "calculate",
      heading: "Health Calculators",
      description: "BMI, body fat, BMR, calorie intake, macronutrients, and wellness measurements.",
      slugs: [
        "bmi-calculator", "bmr-calculator",
        "body-fat-estimator", "body-fat-calculator",
        "calorie-intake-calculator", "macronutrient-calculator",
        "ideal-weight-calc", "ideal-weight-calculator",
        "heart-rate-zone-calculator",
        "sleep-requirement-calculator",
        "waist-to-hip-ratio-calculator",
      ],
    },
    {
      id: "track",
      heading: "Health Trackers",
      description: "Track calories, water intake, steps, and daily wellness metrics.",
      slugs: [
        "calorie-tracker", "calories-burned-calculator",
        "steps-calculator", "running-pace-calculator",
        "cycling-calorie-calculator",
        "protein-calculator",
      ],
    },
    {
      id: "pregnancy",
      heading: "Pregnancy & Due Date",
      description: "Pregnancy calculators, ovulation trackers, and due date estimators.",
      slugs: [
        "ovulation-tracker",
        "due-date-calculator",
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
        "ai-video-subtitler",
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
      ],
    },
    {
      id: "convert",
      heading: "Text Converters",
      description: "Convert text between formats — case converter, reverse text, braille, and more.",
      slugs: [
        "case-converter", "reverse-text-generator",
        "braille-translator",
        "text-to-handwriting",
      ],
    },
    {
      id: "generate",
      heading: "Text & Font Generators",
      description: "Generate fancy text, cursive fonts, zalgo text, invisible text, and lorem ipsum.",
      slugs: [
        "fancy-text-generator", "font-generator",
        "cursive-text-generator", "zalgo-text-generator",
        "invisible-text-generator",
        "lorem-ipsum-generator",
        "pronunciation-tool",
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
      id: "calculate",
      heading: "Marketing Calculators",
      description: "Calculate CPM, RPM, ROAS, conversion rates, and net promoter scores.",
      slugs: [
        "cpm-calculator",
        "roas-calculator", "conversion-rate-calculator",
        "net-promoter-score-calculator",
      ],
    },
    {
      id: "generate",
      heading: "Brand Utilities",
      description: "Shorten URLs, schedule social media content, and manage brand assets.",
      slugs: [
        "url-shortener", "social-media-calendar",
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
        "color-palette-generator", "color-shades-tints",
        "contrast-ratio-checker", 
        "media-query-generator",
      ],
    },
    {
      id: "typography",
      heading: "Typography & SVG",
      description: "Preview typography, convert fonts, generate border CSS, and edit SVG files.",
      slugs: [
        "typography-preview", "font-converter", "font-subsetter",
        "border-css-generator",
        "svg-editor", "vector-pen-canvas",
        "favicon-generator",
      ],
    },
  ],

  Finance: [
    {
      id: "calculate",
      heading: "Financial Calculators",
      description: "Calculate ROI, ACV, payback period, and other SaaS and business metrics.",
      slugs: [
        "acv-calculator",
        "saas-payback-period", "saas-quick-ratio", "saas-rule-of-40",
      ],
    },
    {
      id: "tax",
      heading: "Tax & Currency",
      description: "Convert currencies, validate IBANs, generate invoices, and manage receipts.",
      slugs: [
        "currency-converter", "iban-validator",
        "invoice-generator", "receipt-generator",
        "bulk-invoice-receipt-parser",
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
        "exif-data-remover", "ip-anonymizer",
      ],
    },
    {
      id: "password",
      heading: "Password & Secure Sharing",
      description: "Check password strength, generate temporary emails, and share notes securely.",
      slugs: [
        "password-strength-checker",
        "temporary-email-generator",
        "secure-note-sharer",
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
      ],
    },
    {
      id: "finance-tax",
      heading: "Finance & Tax Tools",
      description: "Calculate GST, look up GSTIN/IFSC, file ITR, and save on taxes.",
      slugs: [
        "gstin-lookup",

        "tax-saving-calculator", "seller-profit-calculator",
      ],
    },
    {
      id: "documents",
      heading: "Document Generators",
      description: "Generate rental agreements, marriage biodata, complaint letters, and more.",
      slugs: [
        "marriage-biodata-maker", "rental-agreement-generator",
        "complaint-letter-generator",
        "voter-id-form-helper",

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
};

export const CATEGORY_INTROS: Record<string, string> = {
  Developer:
    "Developer tools for formatting, debugging, encoding, API testing, and security analysis — all in your browser. No server uploads, no accounts needed. Whether you're formatting JSON before a code review, testing a REST endpoint, generating a hash, or decoding a JWT token, every tool runs locally on your device.",
  Calculator:
    "Online calculators for finance, health, math, and everyday life — mortgage payments, BMI, compound interest, GPA, and more. Every calculation runs in your browser with nothing sent to a server. No sign-up, no data collection, just fast, accurate results.",
  Utility:
    "Everyday utility tools — random generators, unit converters, color pickers, CSV tools, and fun games. All processing happens locally in your browser. Generate a strong password, convert kilograms to pounds, pick a random team, or analyze a CSV file without uploading anything.",
  Audio:
    "Browser-based audio tools — convert between MP3, WAV, FLAC, OGG, AAC, and more, trim audio clips, reduce noise, merge tracks, and apply effects. Powered by FFmpeg WASM running entirely on your device. No files are ever uploaded to any server.",
  Image:
    "Image tools for compressing, resizing, converting, and editing photos — all in your browser. Crop a profile picture, convert PNG to JPG, remove a background, or compress images for web use. Zero uploads, complete privacy.",
  PDF:
    "PDF tools to compress, merge, split, convert, and edit PDFs locally. No file size limits, no uploads. Combine multiple PDFs, extract pages, add watermarks, fill forms, OCR scanned documents, and convert between PDF and HTML, Markdown, or images.",
  Video:
    "Browser-based video tools — compress, convert, trim, and edit videos using FFmpeg WASM running on your device. Cut a clip, convert MP4 to GIF, add subtitles, or reduce file size. Nothing is uploaded to any server.",
  Converter:
    "File conversion tools for documents, images, audio, video, and data — EPUB to PDF, Markdown to HTML, JSON to CSV, and more. Every conversion happens locally in your browser for complete privacy.",
  SEO:
    "SEO analysis and optimization tools — check keyword density, preview search snippets, generate XML sitemaps, and audit meta tags. All processing is done locally in your browser with no data sent to any server.",
  Health:
    "Health and wellness calculators — BMI, BMR, calorie intake, body fat, heart rate zones, pregnancy due date, and more. All calculations run locally in your browser. Track your fitness journey without uploading personal data.",
  AI:
    "AI-powered tools for generating images, summarizing documents, checking grammar, detecting AI-written content, and enhancing photos. Browser-based AI keeps your data private — nothing is uploaded to any server.",
  Text:
    "Text tools for counting words, converting case, generating fancy fonts, translating to braille, and analyzing content. All processing happens locally in your browser. No sign-up, no limits, no uploads.",
  Branding:
    "Branding and marketing tools — create logos, design business cards, generate email signatures, calculate CPM and ROAS, and schedule social media content. Every tool runs locally in your browser.",
  Design:
    "Design tools for color conversion, typography preview, SVG editing, font subsetting, and CSS code generation. All processing happens locally — no uploads, no accounts, no data collection.",
  Finance:
    "Financial calculators and tools — currency conversion, invoice generation, IBAN validation, SaaS metrics (ACV, payback period, quick ratio), and more. Every calculation runs in your browser.",
  Privacy:
    "Privacy tools for encrypting data, generating PGP keys, removing EXIF metadata from photos, checking password strength, and sharing notes securely. All processing happens locally with nothing uploaded.",
  "indian-utilities":
    "India-specific utility tools — Aadhaar photo cropping and masking, PAN card verification, GST invoice generation, IFSC code lookup, and more. Every tool runs entirely in your browser with no server uploads.",
  Transcription:
    "Browser-based transcription tools — convert speech to text from audio and video files, generate YouTube transcripts, and create meeting minutes. All processing happens locally on your device.",
};
