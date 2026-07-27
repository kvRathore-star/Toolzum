const CONTENT = {
  // ===========================================================================
  // GENERATORS (69)
  // ===========================================================================

  "uuid-generator": {
    instructions: [
      { title: "1. Specify UUID Version", desc: "Select UUID version (v1, v4, v5) — v4 generates random UUIDs, v1 uses timestamp + MAC, v5 uses SHA-1 namespace hash. Default to v4 for most use cases." },
      { title: "2. Set Output Count", desc: "Choose how many UUIDs to generate in a single batch (1–10,000). For bulk generation, consider the 5,000 batch limit to avoid browser lag." },
      { title: "3. Copy and Verify", desc: "Click the Copy button to copy all generated UUIDs to clipboard. Paste into your database or config and verify uniqueness — collisions are astronomically rare for v4." }
    ],
    faqs: [
      { question: "Can I generate time-ordered UUIDs (v7) with this tool?", answer: "This tool supports UUID v1, v4, and v5. UUID v7 (time-ordered with random suffix) is not yet supported. For time-sorted UUIDs, consider PostgreSQL's gen_random_uuid() or a dedicated v7 library. v4 remains the most widely supported version across databases and programming languages." },
      { question: "How do UUID v5 namespace UUIDs work?", answer: "UUID v5 generates a deterministic UUID from a namespace UUID and a name string using SHA-1 hashing. This tool provides predefined namespaces (DNS, URL, OID, X500) plus a custom option. The same namespace + name always produces identical UUIDs, making v5 useful for generating consistent identifiers without a central authority." },
      { question: "What is the difference between UUID v1 and v4 regarding privacy?", answer: "UUID v1 encodes the generating machine's MAC address and timestamp, which can be a privacy concern in client-facing applications. UUID v4 uses purely random bits (122 bits of entropy) and reveals nothing about the source machine. For security-sensitive or user-facing identifiers, always prefer v4 over v1." }
    ]
  },

  "md5-hash-generator": {
    instructions: [
      { title: "1. Input Your Data", desc: "Type or paste the string you want to hash into the input field. The tool supports plain text, with sizes up to 10 MB for file uploads." },
      { title: "2. Enable HMAC (Optional)", desc: "Toggle HMAC mode and provide a secret key to produce an HMAC-MD5 hash instead of a plain MD5. This prevents rainbow table attacks on the output." },
      { title: "3. Compare Hash Output", desc: "The 32-character hex digest appears instantly. Use the Compare feature to check if two strings produce the same MD5 hash, useful for verifying file integrity." }
    ],
    faqs: [
      { question: "Why is MD5 considered cryptographically broken?", answer: "MD5 is vulnerable to collision attacks — researchers have demonstrated that two different inputs can produce the same 128-bit hash. In 2008, researchers used MD5 collisions to forge SSL certificates. For security-sensitive hashing (passwords, signatures), use SHA-256 or bcrypt instead. MD5 remains acceptable for non-security checksums like file integrity verification." },
      { question: "Can I hash files larger than 10 MB with this tool?", answer: "The browser-based limit is 10 MB per file upload. For larger files, use a command-line tool like md5sum (Linux/macOS) or certutil (Windows). The tool processes files entirely in memory, so excessively large files may crash your browser tab." },
      { question: "What does the uppercase/lowercase toggle do?", answer: "MD5 hashes are case-insensitive in hex representation, but some systems expect uppercase digest format (e.g., Windows certutil outputs uppercase by default). The toggle lets you switch between 32-character lowercase (a-f) and uppercase (A-F) without recomputing the hash." }
    ]
  },

  "rsa-key-generator": {
    instructions: [
      { title: "1. Select Key Bit Length", desc: "Choose the RSA key size from 1024, 2048, 4096, or 8192 bits. 2048-bit is the current industry minimum for security; 4096-bit provides stronger security at slower generation and encryption speed." },
      { title: "2. Choose Output Format", desc: "Select PEM (base64-encoded with headers) or DER (binary ASN.1) format. PEM is human-readable and widely compatible with OpenSSL, SSH, and most programming languages." },
      { title: "3. Generate and Download Keys", desc: "Click Generate to create a public/private key pair. Download each key separately or copy them individually. Store the private key securely — it cannot be recovered if lost." }
    ],
    faqs: [
      { question: "Can I protect the private key with a passphrase?", answer: "Yes, the tool supports optional AES-256 encryption of the private key using a passphrase. When enabled, the private key is wrapped in OpenSSL's ENCRYPTED PRIVATE KEY PEM format. You must provide the passphrase every time the private key is used. Without the passphrase, the encrypted key file is useless." },
      { question: "What is the difference between PKCS#1 and PKCS#8 key formats?", answer: "PKCS#1 is the older RSA-specific format (BEGIN RSA PRIVATE KEY), while PKCS#8 is a more flexible, standard container (BEGIN PRIVATE KEY) that stores key type, algorithm parameters, and the key material together. PKCS#8 is the modern recommended format and supports encryption at the container level. Most libraries accept both, but PKCS#8 is preferred for new applications." },
      { question: "How does the Java/.NET compatibility mode affect the output?", answer: "When enabled, the tool outputs the private key in PKCS#8 format (required by Java's KeyFactory and .NET's RSACryptoServiceProvider by default) and the public key as a SubjectPublicKeyInfo structure. Without this mode, keys use OpenSSL's traditional format which may require conversion before use in these frameworks." }
    ]
  },

  "pbkdf2-hash-generator": {
    instructions: [
      { title: "1. Enter Password and Salt", desc: "Input the password you want to hash and provide either a custom salt or let the tool generate a cryptographically random 16-byte salt. The salt prevents rainbow table precomputation." },
      { title: "2. Configure Iterations and Algorithm", desc: "Set the iteration count (recommended minimum 600,000 for SHA-256 as of 2024) and select the underlying hash algorithm: SHA-1, SHA-256, or SHA-512. Higher iterations increase brute-force cost." },
      { title: "3. Select Output Length and Encoding", desc: "Choose the derived key length in bytes (default 32) and output encoding — hex (64 chars for 32 bytes) or base64. Copy the salt and hash together for storage, as both are needed for verification." }
    ],
    faqs: [
      { question: "Why do I need to store the salt alongside the PBKDF2 hash?", answer: "PBKDF2 is deterministic — the same password + salt + iterations always produces the same derived key. The salt must be unique per user and stored in plaintext alongside the hash. During login, you retrieve the stored salt, re-run PBKDF2 with the provided password, and compare the computed hash against the stored hash. Without the salt, verification is impossible." },
      { question: "How many PBKDF2 iterations should I use for password hashing in 2024?", answer: "OWASP recommends at least 720,000 iterations for PBKDF2-HMAC-SHA256 and 600,000 for PBKDF2-HMAC-SHA512 as of 2024. These numbers derive from the time it takes to compute the hash on modern hardware — aim for approximately 0.5 seconds of computation time on your production server. Higher is always better within acceptable latency." },
      { question: "What is the difference between PBKDF2 and bcrypt/argon2?", answer: "PBKDF2 is a key derivation function designed by RSA Laboratories and is FIPS-140 compliant. Unlike bcrypt (which includes adaptive cost and is GPU-resistant) and argon2 (which adds memory-hardness to resist ASIC attacks), PBKDF2 has relatively low memory requirements and is more vulnerable to GPU-based brute force at equivalent iteration counts. Argon2id is the OWASP-recommended choice for new password hashing implementations." }
    ]
  },

  "media-query-generator": {
    instructions: [
      { title: "1. Define Breakpoint Ranges", desc: "Configure min-width and max-width values for each breakpoint (e.g., mobile: 0–576px, tablet: 577–768px). The tool supports up to 10 named breakpoints." },
      { title: "2. Select Media Type and Features", desc: "Choose the target media type (screen, print, all) and optional features like resolution, orientation (portrait/landscape), or aspect-ratio for more precise targeting." },
      { title: "3. Generate and Export CSS", desc: "Review the generated @media rule blocks. You can copy individual queries or export the entire stylesheet. Each query includes the appropriate min/max width syntax." }
    ],
    faqs: [
      { question: "Should I use min-width or max-width queries for mobile-first design?", answer: "Mobile-first design uses min-width queries exclusively — the base styles target the smallest screen, and each @media (min-width: ...px) block adds enhancements as viewport grows. This is simpler, performs better, and avoids the specificity cascading issues of max-width overrides. The tool defaults to min-width but lets you toggle to max-width as needed." },
      { question: "How do I handle high-DPI (Retina) screens with media queries?", answer: "Use the resolution media feature with -webkit-min-device-pixel-ratio: 2 or min-resolution: 192dpi for Retina targeting. The tool includes a dedicated Retina toggle that generates the vendor-prefixed and standard syntax. This is essential for delivering @2x images or different CSS for high-density displays." },
      { question: "Can I generate container queries instead of media queries?", answer: "This tool generates traditional @media queries, not @container queries. Container queries respond to the size of a parent container rather than the viewport. For container query support, you would need a separate tool — they follow a different syntax (@container (min-width: ...)) and require a contain property on the parent element." }
    ]
  },

  "markdown-table-generator": {
    instructions: [
      { title: "1. Enter Table Dimensions", desc: "Specify the number of rows (including header) and columns. The tool supports tables up to 50×50 cells for practical markdown rendering limits." },
      { title: "2. Fill Cell Content", desc: "Click into each cell and type your content directly in the interactive grid. You can paste tabular data from spreadsheets using the Paste from Clipboard button." },
      { title: "3. Choose Alignment and Generate", desc: "Set column alignment (left/center/right) using the column header controls. The tool generates the separator row with colons (:---, :---:, ---:) accordingly." }
    ],
    faqs: [
      { question: "How do I handle multiline content in a markdown table cell?", answer: "Markdown tables do not natively support multiline cells. The workaround is to use <br> HTML tags within cells for line breaks. The tool automatically wraps cell content containing <br> to render correctly. Alternatively, you can split the row into multiple rows with repeating first-column content." },
      { question: "What is the maximum table size that renders well in markdown?", answer: "Most markdown renderers (GitHub, GitLab, Stack Overflow) handle tables up to 20–30 columns and several hundred rows. Beyond that, the raw markdown becomes unreadable and rendering may be slow. This tool limits to 50×50 to maintain performance and output quality." },
      { question: "Can I import a CSV file directly into the table grid?", answer: "Yes, the tool includes a CSV import feature. Paste comma-separated or tab-separated data, and the tool automatically detects the delimiter and populates the grid. The first row is treated as the table header." }
    ]
  },

  "nginx-config-generator": {
    instructions: [
      { title: "1. Set Server and Domain", desc: "Enter your domain name(s), server IP/port (default :80 or :443), and server_name (supports wildcard *.example.com). Configure the root directory path for serving static files." },
      { title: "2. Configure SSL and Redirects", desc: "Toggle HTTPS enforcement, upload or paste your SSL certificate paths (ssl_certificate, ssl_certificate_key), and set HTTP-to-HTTPS redirect behavior (301 or 308)." },
      { title: "3. Define Location Blocks and Caching", desc: "Add location blocks (/, /api, /static) with proxy_pass, try_files, or fastcgi_pass directives. Configure caching headers, gzip compression, and rate limiting per location." }
    ],
    faqs: [
      { question: "What is the difference between proxy_pass and fastcgi_pass in the generated config?", answer: "proxy_pass forwards HTTP requests to an upstream server (Node.js, Python, etc.) and preserves the original Host header when proxy_set_header is configured. fastcgi_pass forwards requests to a FastCGI backend (PHP-FPM) and requires separate fastcgi_param directives for environment variables." },
      { question: "How does the tool generate rate limiting directives?", answer: "When you enable rate limiting, the tool creates a limit_req_zone in the http block defining the shared memory zone (e.g., 10m), rate (e.g., 10r/s with burst=20), and key ($binary_remote_addr). The limit_req directive is placed in the relevant location block." },
      { question: "Can I generate config for Nginx Plus features like active health checks?", answer: "The free open-source version of Nginx does not support active health checks (only passive via max_fails). This tool generates config compatible with the open-source Nginx. For Nginx Plus features, you would need to add proprietary directives manually after generation." }
    ]
  },

  "ip-allowlist-generator": {
    instructions: [
      { title: "1. Add IP Addresses or CIDR Ranges", desc: "Enter individual IPv4/IPv6 addresses (e.g., 203.0.113.1) or CIDR notation ranges (e.g., 203.0.113.0/24). The tool accepts up to 500 entries per allowlist." },
      { title: "2. Select Output Format", desc: "Choose the target format — Nginx allow/deny directives, Apache htaccess require lines, AWS Security Group JSON, Cloudflare IP Access Rules, or plain newline-separated list." },
      { title: "3. Add Description Tags", desc: "Optionally annotate each entry with a description (e.g., 'Office VPN', 'CI/CD Runner'). Tags are included as comments in Nginx/Apache output." }
    ],
    faqs: [
      { question: "How does the AWS Security Group format differ from the Nginx format?", answer: "The AWS format generates a JSON structure with IpRanges and Ipv6Ranges arrays under an IpPermission object, specifying EC2-VPC security group rules. The Nginx format uses `allow x.x.x.x;` and `deny all;` directives. AWS requires CIDR notation only while Nginx accepts both individual IPs and CIDR ranges." },
      { question: "Can I generate both an allowlist and a blocklist simultaneously?", answer: "Yes, the tool supports dual-mode output. You designate entries as either allowed or blocked, and the tool generates the appropriate directives — allow/deny for Nginx, Require ip/Require not ip for Apache. Blocklist entries are always placed after allowlist entries." },
      { question: "What happens when an IP address falls within multiple CIDR ranges?", answer: "The allowlist is evaluated in order — the first matching rule applies. For Nginx and Apache, the tool outputs the most specific (smallest CIDR) entries first, then broader ranges. If you include overlapping CIDR ranges, the tool warns about the overlap and suggests removing redundant entries." }
    ]
  },

  "test-data-generator": {
    instructions: [
      { title: "1. Define Schema Structure", desc: "Add fields with names and data types (string, number, boolean, email, date, uuid, custom). For each field, set constraints like min/max length, value ranges, or regex patterns." },
      { title: "2. Set Record Quantity", desc: "Specify how many rows of test data to generate (1–100,000). For large datasets, the tool streams results in chunks to avoid browser memory issues." },
      { title: "3. Export in Desired Format", desc: "Export the generated dataset as JSON (array or newline-delimited), CSV with configurable delimiter, SQL INSERT statements, or Excel-compatible TSV." }
    ],
    faqs: [
      { question: "How does the tool generate realistic-looking email addresses?", answer: "The email generator combines randomly selected first names, last names, and domains from a built-in corpus of 10,000+ common names and 200+ domains. The generated emails follow common patterns (firstname.lastname@domain.com) and include occasional numeric suffixes for variety." },
      { question: "Can I create relational test data across multiple tables?", answer: "Yes, the tool supports foreign key relationships — you define a primary key field in one table and reference it as a foreign key in another. The tool generates the parent table first and uses its actual generated IDs as foreign key values in child tables." },
      { question: "How does the distribution control work for numeric fields?", answer: "Each numeric field supports distribution models: uniform (equal probability across range), normal (bell curve centered on a mean), or weighted (you provide percentile weights). For example, a normal distribution with mean 50 and stddev 15 generates most values between 35 and 65." }
    ]
  },

  "api-mock-data-generator": {
    instructions: [
      { title: "1. Define Endpoint Structure", desc: "Configure REST endpoints with HTTP methods (GET, POST, PUT, DELETE, PATCH) and path parameters. For each endpoint, specify the request body schema and query parameters." },
      { title: "2. Set Response Templates", desc: "For each endpoint, define the response schema — field names, types, and constraints. Set HTTP status codes (200, 201, 400, 404, 500) and simulate error responses." },
      { title: "3. Configure Dynamic Behavior", desc: "Enable query filtering, pagination (page/limit), sorting, and conditional responses based on request parameters. Set response delay (50–5000ms) to simulate realistic latency." }
    ],
    faqs: [
      { question: "How does the tool handle nested JSON responses with arrays of objects?", answer: "The schema editor supports nested objects and arrays up to 5 levels deep. For array fields, you define the object schema for each element and specify min/max array length. The generator produces consistent nested structures where object IDs are coherent across the response." },
      { question: "Can I mock authenticated endpoints that require JWT or API keys?", answer: "Yes, the tool includes an authentication configuration panel. You can require a Bearer token, API key (header or query param), or basic auth for specific endpoints. The tool validates credentials and returns 401 for missing or invalid tokens." },
      { question: "How do conditional responses work based on request body content?", answer: "You define conditional rules using JSONPath expressions against the request body. For instance, if the request body contains a 'status' field equal to 'cancelled', the tool returns a 200 with a cancellation-specific response body. You can chain up to 10 conditional rules per endpoint." }
    ]
  },

  "mock-api-response-generator": {
    instructions: [
      { title: "1. Enter Raw Response Data", desc: "Paste an example API response (JSON, XML, or plain text) or define a schema interactively. The tool parses existing JSON to auto-generate a schema template." },
      { title: "2. Customize Mock Variables", desc: "Replace static values with dynamic generators — random strings, incremental IDs, timestamps (current date or relative), or enumerated lists." },
      { title: "3. Configure Status Code and Headers", desc: "Set the HTTP response status code (200, 201, 204, 400, 403, 404, 500) and custom response headers like Content-Type, X-RateLimit-Remaining, and Retry-After." }
    ],
    faqs: [
      { question: "How does the tool handle different response types for the same endpoint?", answer: "You can define multiple response variants (success, error, empty, partial) for a single endpoint and assign each a probability weight. The tool randomly selects a variant on each request according to the weight distribution." },
      { question: "Can I embed JavaScript expressions in the mock response template?", answer: "Yes, the template engine supports embedded JavaScript expressions using {{ }} delimiters. You can access request parameters via {{request.params}}, {{request.query}}, and {{request.body}}." },
      { question: "What is the maximum response body size the generator can produce?", answer: "The generator is capped at 5 MB per response. If your schema produces responses larger than 5 MB, the tool truncates array fields from the end. For very large mock responses, enable compression in the mock server config." }
    ]
  },

  "api-key-generator": {
    instructions: [
      { title: "1. Select Key Format", desc: "Choose a format — random alphanumeric (32/64 chars), UUID-based, hashed (SHA-256), or custom prefix-based (e.g., sk_live_...). Prefixes help identify key types in logs." },
      { title: "2. Set Entropy and Character Set", desc: "Configure the character set (uppercase, lowercase, digits, symbols) and key length (16–128 characters). Higher entropy keys are more secure but harder to type manually." },
      { title: "3. Generate and View Metadata", desc: "Generate one or multiple keys (up to 100 at once). The tool shows the creation timestamp, entropy bits, and a SHA-256 hash of each key." }
    ],
    faqs: [
      { question: "What is the recommended key length for production API keys?", answer: "For production systems, 32 bytes (256 bits) of random data encoded as base64 produces a 44-character key with ~256 bits of entropy. This exceeds the Stripe and GitHub standard. Shorter keys (16 bytes) are acceptable for low-security internal tools only." },
      { question: "How should I store API keys in my database?", answer: "You should store only a SHA-256 hash of the API key, never the plaintext key. When a key is generated, display it once to the user and store the hash. On API requests, hash the provided key and compare against stored hashes." },
      { question: "Why do some generated keys include prefix like sk_live_ or pk_test_?", answer: "Prefixes make keys visually identifiable in logs, error messages, and configuration files. They allow you to distinguish between environments, key types (secret vs. publishable), and permission levels. The prefix is prepended before the random portion." }
    ]
  },

  "api-changelog-generator": {
    instructions: [
      { title: "1. Add Changelog Entries", desc: "Enter version number (semver), release date, and a list of changes categorized by type: Added, Changed, Deprecated, Removed, Fixed, Security." },
      { title: "2. Mark Breaking Changes", desc: "Toggle the breaking change flag for each entry. Breaking changes are highlighted in red. The tool auto-increments the major version if any breaking change is marked." },
      { title: "3. Select Output Format", desc: "Export as Markdown (Keep a Changelog standard) with a table of contents, or as plain HTML." }
    ],
    faqs: [
      { question: "How does the tool determine version bumps based on change types?", answer: "The tool follows semantic versioning rules: a Breaking Change triggers a major version bump (1.0.0 to 2.0.0), new Added entries trigger a minor bump (1.0.0 to 1.1.0), and only Fixed/Changed entries trigger a patch bump (1.0.0 to 1.0.1)." },
      { question: "Can I import an existing CHANGELOG.md to continue editing?", answer: "Yes, the tool parses Keep a Changelog-formatted markdown files. It extracts version sections, change categories, dates, and breaking change indicators. Parsed entries populate the editor grid where you can modify or add new entries." },
      { question: "What does the RSS/Atom feed output include?", answer: "The generated feed XML includes the last 20 changelog entries with titles, descriptions, publication dates, and version tags. Each entry links to a URL you specify (e.g., your API docs site)." }
    ]
  },

  "api-documentation-generator": {
    instructions: [
      { title: "1. Define Endpoints and Methods", desc: "Add API endpoints with their HTTP methods, path parameters, query parameters, and request body schemas. Use JSON Schema to define request and response structures." },
      { title: "2. Add Descriptions and Examples", desc: "Write human-readable descriptions for each endpoint, parameter, and field. Provide example request bodies and response bodies that demonstrate real usage." },
      { title: "3. Configure Authentication Section", desc: "Document the auth method (API key, Bearer JWT, OAuth 2.0, Basic Auth) with example headers. Include token acquisition instructions." }
    ],
    faqs: [
      { question: "What documentation output formats does this tool support?", answer: "The tool generates a single-page HTML documentation site with interactive collapsible sections, copy-to-clipboard, and a table of contents. You can also export as raw Markdown files or as a Postman collection JSON." },
      { question: "How does the tool handle enum values and validation rules for parameters?", answer: "For any parameter defined with an enum constraint, the tool generates a bullet list of allowed values. Validation rules (minimum, maximum, minLength, maxLength, pattern) are displayed as metadata badges next to each parameter." },
      { question: "Can the documentation include code samples in multiple programming languages?", answer: "Yes, the tool auto-generates code samples for curl, Python (requests), JavaScript (fetch), Node.js (axios), Java (OkHttp), Go (net/http), and Ruby (Net::HTTP)." }
    ]
  },

  "openapi-mock-generator": {
    instructions: [
      { title: "1. Upload OpenAPI Specification", desc: "Upload an OpenAPI 3.0 or 3.1 YAML/JSON spec file, or paste the contents directly. The tool parses all paths, schemas, and components." },
      { title: "2. Configure Mocking Rules", desc: "Override default response generation — set specific status codes to use per endpoint, choose which schema examples to use, and configure random vs. deterministic output." },
      { title: "3. Generate Mock Server URL", desc: "The tool provides a temporary mock server URL (valid for 48 hours) or downloadable server configuration for hosting your own mock server." }
    ],
    faqs: [
      { question: "How does the mock server handle oneOf/anyOf/allOf schema compositions?", answer: "For anyOf and oneOf, the mock server randomly selects one of the schemas in the composition for each generated response. For allOf, it merges all referenced schemas deeply, with later properties overriding earlier ones on conflict." },
      { question: "Does the mock server validate request bodies against the OpenAPI schema?", answer: "Yes, the mock server optionally validates incoming request bodies against the requestBody schema. When validation fails, it returns a 400 error with detailed JSON describing which fields violated the schema." },
      { question: "What happens when my OpenAPI spec uses $ref references to external files?", answer: "The tool resolves local $ref references (pointing to components/schemas within the same file) automatically. For external $ref references, you must bundle the spec first into a single document." }
    ]
  },

  "postman-collection-generator": {
    instructions: [
      { title: "1. Enter API Request Details", desc: "Define each API endpoint with its method, URL (supports variables like {{base_url}}), headers, query parameters, and request body." },
      { title: "2. Organize into Folders", desc: "Group related requests into folders (e.g., Users, Products, Auth). Folders can have their own pre-request scripts and test snippets." },
      { title: "3. Export Postman Collection v2.1", desc: "Export as Postman Collection JSON v2.1 format. You can also include environment variables in a separate environment file." }
    ],
    faqs: [
      { question: "How does the tool handle Postman dynamic variables like {{$guid}} or {{$timestamp}}?", answer: "The tool recognizes Postman's built-in dynamic variables and preserves them in the exported collection. You can insert {{$guid}}, {{$timestamp}}, {{$randomInt}}, and {{$randomEmail}} into request URLs, headers, or bodies." },
      { question: "Can I import an existing Postman collection to edit it further?", answer: "Yes, the tool can parse and import Postman Collection v2.0 and v2.1 JSON files. It reconstructs the folder structure, request details, and authentication settings." },
      { question: "What Postman-specific features are excluded from the exported collection?", answer: "Collection runner configurations, monitor schedules, documentation comments, and workspace-level settings are not included in the export. Pre-request scripts and test scripts are preserved." }
    ]
  },

  "swagger-openapi-generator": {
    instructions: [
      { title: "1. Fill API Metadata", desc: "Enter the API title, description, version, base URL (servers), and contact information. Set the license type and terms of service URL for public APIs." },
      { title: "2. Define Paths and Operations", desc: "Add each endpoint path and its operations. For each operation, define parameters (path, query, header, cookie), request bodies, and response schemas." },
      { title: "3. Add Components and Security Schemes", desc: "Define reusable schemas in the #/components/schemas section. Configure security schemes — API Key, HTTP (Bearer, Basic), OAuth 2.0 flows." }
    ],
    faqs: [
      { question: "Should I use OpenAPI 3.0 or 3.1 for my new API specification?", answer: "OpenAPI 3.1 introduced full JSON Schema 2020-12 alignment, allowing nullable as a JSON Schema type instead of the nullable: true keyword. However, many tools have incomplete 3.1 support. Use 3.0 for maximum compatibility now." },
      { question: "How does the tool handle circular $ref references in schemas?", answer: "The tool detects circular references (e.g., Category -> Products -> Category) and prevents infinite recursion by limiting the depth to 5 levels. Circular references are preserved as $ref with an x-circular-depth extension." },
      { question: "Can I generate the OpenAPI spec from live code annotations?", answer: "This tool generates OpenAPI specs from a form-based UI, not from code annotations. For code-first approaches, use framework decorators (Swashbuckle, Springfox, FastAPI) that auto-generate OpenAPI specs." }
    ]
  },

  "webhook-payload-generator": {
    instructions: [
      { title: "1. Select Webhook Provider Template", desc: "Choose from built-in templates for common providers: Stripe, GitHub, Slack, Twilio, SendGrid, PayPal, or start from scratch." },
      { title: "2. Customize Event Type and Fields", desc: "Select or enter the event type (e.g., invoice.paid, push, message.received). Modify payload fields to match your webhook handler's expectations." },
      { title: "3. Configure Headers and Signing", desc: "Set webhook headers (Content-Type, User-Agent, X-Webhook-ID). Optionally enable HMAC-SHA256 signing with a secret key for validation testing." }
    ],
    faqs: [
      { question: "How does the Stripe webhook template differ from GitHub's in structure?", answer: "Stripe webhooks are nested objects with a data.object structure containing the resource, while GitHub webhooks have a flat structure with top-level fields like action, repository, and sender." },
      { question: "Can I schedule the webhook payload to be delivered after a delay?", answer: "Yes, the tool includes a delayed delivery mode. You specify a delay in seconds (10–3600), and the mock webhook server waits before delivering the payload to the target URL." },
      { question: "How do I verify the generated HMAC signature matches my handler's calculation?", answer: "The tool computes the HMAC-SHA256 signature using your secret key over the raw request body. To verify, your handler should compute HMAC-SHA256 of the received body with the same secret." }
    ]
  },

  "api-docs-generator": {
    instructions: [
      { title: "1. Import API Specification", desc: "Upload an OpenAPI 3.0/3.1 spec, a Postman collection, or paste a curl command to extract endpoint details." },
      { title: "2. Customize Documentation Theme", desc: "Choose from 5 color themes (Light, Dark, Corporate, Monokai, Custom). Configure the logo, favicon, and page title." },
      { title: "3. Generate Static Documentation Site", desc: "Export as a self-contained HTML file or a zip archive of static assets (HTML + CSS + JS)." }
    ],
    faqs: [
      { question: "How does the generated documentation site handle API versioning?", answer: "The site groups endpoints by API version if your spec uses a version prefix (e.g., /v1/, /v2/). Each version appears as a collapsible section in the sidebar." },
      { question: "Can I embed the generated docs into an existing website via iframe or widget?", answer: "Yes, the generated HTML file can be embedded in an iframe. The output includes a widget mode — a floating button that opens a documentation drawer overlaying your app." },
      { question: "What happens if my OpenAPI spec has internal-only endpoints?", answer: "The tool allows you to tag endpoints as internal using the x-internal extension. Internal endpoints can be excluded from the generated output via a toggle." }
    ]
  },

  "conventional-commit-generator": {
    instructions: [
      { title: "1. Choose Commit Type", desc: "Select from conventional commit types: feat (feature), fix (bug fix), docs, style, refactor, perf, test, build, ci, chore, revert." },
      { title: "2. Write Scope and Description", desc: "Optionally add a scope in parentheses (e.g., feat(api):). Write a concise description in imperative mood, no period at end." },
      { title: "3. Add Body and Footer", desc: "Write a detailed body explaining what and why. Add footer for breaking changes or issue references (Closes #123)." }
    ],
    faqs: [
      { question: "How does the commit type map to semantic versioning bumps?", answer: "fix types trigger a patch version bump, feat types trigger a minor bump, and the BREAKING CHANGE footer triggers a major bump. Types like docs, style, and refactor do not bump the version." },
      { question: "Can I configure custom commit types for my project's workflow?", answer: "Yes, the tool supports custom type definitions. You can add new types (e.g., wip, dx, i18n) and assign each a semver bump behavior (none, patch, minor, major)." },
      { question: "What is the correct format for the breaking change footer?", answer: "The footer must start with 'BREAKING CHANGE:' followed by a space and a description of what broke and how to migrate." }
    ]
  },

  "css-generator": {
    instructions: [
      { title: "1. Select Property to Generate", desc: "Choose a CSS property from the dropdown — background, typography, layout, border, animation, or transform." },
      { title: "2. Adjust Visual Controls", desc: "Use sliders, color pickers, and dropdowns to set values. Live preview updates in real time as you adjust." },
      { title: "3. Copy Generated CSS", desc: "The generated CSS code block shows the completed declaration(s). Copy the standalone CSS or the full rule including the selector." }
    ],
    faqs: [
      { question: "Does the CSS generator automatically add vendor prefixes (-webkit-, -moz-)?", answer: "Yes, the tool automatically generates vendor-prefixed versions for properties that need them. You can disable prefix generation if you use Autoprefixer in your build pipeline." },
      { question: "How do I convert the generated CSS into a CSS-in-JS object?", answer: "The tool has a format toggle that converts CSS declarations to a JavaScript object (camelCase property names). This output works with styled-components, Emotion, and JSS." },
      { question: "Can I combine multiple generated CSS blocks into a single stylesheet?", answer: "Yes, use the Collection mode to accumulate multiple CSS rules. The final export combines all collected rules into one stylesheet with your preferred formatting." }
    ]
  },

  "box-shadow-generator": {
    instructions: [
      { title: "1. Set Horizontal and Vertical Offset", desc: "Use the H-offset and V-offset sliders to control shadow position. Positive V-offset moves the shadow down; negative moves it up." },
      { title: "2. Adjust Blur, Spread, and Color", desc: "Blur controls softness (0 = sharp edge), spread expands/shrinks the shadow size. Choose the shadow color with the color picker." },
      { title: "3. Layer Multiple Shadows", desc: "Click 'Add Shadow' to create layered box-shadow effects. Each layer has independent controls. Reorder layers by drag-and-drop." }
    ],
    faqs: [
      { question: "What is the difference between box-shadow and filter: drop-shadow()?", answer: "box-shadow creates a rectangular shadow following the element's bounding box. filter: drop-shadow() follows the actual alpha channel, creating shadows that conform to irregular shapes." },
      { question: "How does the inset keyword change the shadow behavior?", answer: "Inset box-shadow renders the shadow inside the element's border box, creating a recessed appearance. The shadow is clipped by border-radius and appears behind the background." },
      { question: "Can I export the box-shadow as a Sass/SCSS mixin variable?", answer: "Yes, the tool has an export format option for SCSS. It generates a variable like $shadow-1 and optionally wraps it in a @mixin for reuse." }
    ]
  },

  "border-radius-generator": {
    instructions: [
      { title: "1. Set Uniform or Per-Corner Radius", desc: "Toggle between uniform radius (single slider for all corners) and per-corner mode where each corner has an independent slider." },
      { title: "2. Use Percentage vs. Pixel Values", desc: "Choose px for fixed rounded corners or % for elliptical corners. Percentage values are relative to the element's dimensions." },
      { title: "3. Preview and Copy the Code", desc: "A live preview element shows the exact border-radius effect. Copy the generated CSS declaration." }
    ],
    faqs: [
      { question: "How do I create a pill-shaped button using border-radius?", answer: "Set border-radius to a large fixed pixel value (e.g., 9999px) that exceeds the button's height. This produces a fully rounded rectangle where the ends are perfect semicircles." },
      { question: "What do the four slash-separated values in border-radius do?", answer: "The slash syntax sets different horizontal and vertical radii for elliptical corners. Values before the slash are horizontal radii, values after are vertical radii." },
      { question: "Why does border-radius not clip the background of my element on some browsers?", answer: "border-radius clips the background by default in modern browsers, but older WebKit browsers (Safari < 5) and IE (< 9) do not. Adding overflow: hidden resolves most cases." }
    ]
  },

  "flexbox-css-generator": {
    instructions: [
      { title: "1. Configure Container Properties", desc: "Set display: flex, flex-direction (row/column), flex-wrap (nowrap/wrap), justify-content, and align-items." },
      { title: "2. Add and Configure Flex Items", desc: "Add up to 10 flex items. For each item, set flex-grow, flex-shrink, flex-basis, align-self, and order." },
      { title: "3. Preview Layout and Export", desc: "The live preview shows the exact flex layout. Copy the generated HTML and CSS." }
    ],
    faqs: [
      { question: "What is the difference between align-items and align-content?", answer: "align-items aligns individual flex items along the cross axis within each line. align-content distributes space between entire lines when there are multiple lines (flex-wrap: wrap)." },
      { question: "How does flex: 1 differ from flex-grow: 1?", answer: "flex: 1 is shorthand for flex: 1 1 0 — flex-grow: 1, flex-shrink: 1, flex-basis: 0. flex-grow: 1 alone keeps flex-basis: auto, meaning the item starts at its content width." },
      { question: "Why does gap not work in flexbox on older Safari versions?", answer: "Safari 13 and earlier do not support flex gap. The workaround is to use margin on flex items with negative margin on the container (margin hack)." }
    ]
  },

  "css-grid-generator": {
    instructions: [
      { title: "1. Define Grid Container", desc: "Set display: grid with column and row track sizes using px, fr, %, auto, min-content, max-content, or minmax()." },
      { title: "2. Place Grid Items", desc: "Add items and use grid-column / grid-row with span syntax or named grid lines. Use grid-area with template areas." },
      { title: "3. Adjust Gap and Alignment", desc: "Set row-gap and column-gap. Use align-items, justify-items, align-content, and justify-content." }
    ],
    faqs: [
      { question: "What is the difference between auto-fill and auto-fit in repeat()?", answer: "auto-fill keeps empty track spaces, preserving track sizing even without items. auto-fit collapses empty tracks to 0 width, causing remaining items to stretch." },
      { question: "How does the grid-template-areas property work with named grid areas?", answer: "grid-template-areas uses ASCII-art strings where each line represents a row. A period (.) creates an empty cell. Areas must form a rectangular shape." },
      { question: "Why does my grid item overflow the container with fractional units?", answer: "Adding minmax(0, 1fr) instead of 1fr prevents overflow by allowing tracks to shrink below their content's minimum size, resolving the common grid overflow issue." }
    ]
  },

  "text-shadow-generator": {
    instructions: [
      { title: "1. Set Shadow Offsets and Blur", desc: "Use the H-shadow and V-shadow sliders to position the shadow relative to the text. Blur radius controls softness." },
      { title: "2. Choose Shadow Color", desc: "Pick a color using the color picker. Use rgba/hsla values for semi-transparent shadows." },
      { title: "3. Add Multiple Shadow Layers", desc: "Stack multiple text-shadow layers separated by commas. Layer order is left-to-right, first shadow renders on top." }
    ],
    faqs: [
      { question: "How does text-shadow differ from box-shadow in CSS?", answer: "text-shadow applies to text glyphs, not the element box. It has no spread option, no inset keyword, and layers render front-to-back instead of back-to-front." },
      { question: "Can I create a neon glow effect using text-shadow?", answer: "Yes, a neon glow uses 2–4 shadow layers with increasing blur radius and the same color. The tool's Neon preset creates this automatically." },
      { question: "Why does text-shadow performance lag with large blur values?", answer: "Each shadow layer renders as a separate blur operation. Large blur radii (50px+) with 3+ layers cause significant painting overhead, especially on mobile." }
    ]
  },

  "css-transform-generator": {
    instructions: [
      { title: "1. Select Transform Functions", desc: "Choose from translate(), rotate(), scale(), skew(), and matrix(). Add multiple functions in sequence." },
      { title: "2. Set Transform Values", desc: "For translate: enter X and Y distances. For rotate: enter angle. For scale: enter multiplier." },
      { title: "3. Set Transform Origin", desc: "Choose the transform-origin point (center, top-left, etc.). The origin affects rotation and scale axes." }
    ],
    faqs: [
      { question: "What is the difference between rotate() and rotateZ()?", answer: "rotate() is a 2D function that rotates around the Z axis — it is equivalent to rotateZ(). rotateX() and rotateY() tilt the element and are 3D transforms." },
      { question: "How does the matrix() transform function work mathematically?", answer: "matrix(a, b, c, d, tx, ty) is shorthand for combining scale, rotate, and translate in one 2x3 affine transformation matrix." },
      { question: "Why does transform: translate(-50%, -50%) commonly center elements?", answer: "left: 50% positions the left edge at 50%. translate(-50%, -50%) moves the element left by 50% of its own width, centering it regardless of size." }
    ]
  },

  "css-animation-generator": {
    instructions: [
      { title: "1. Define @keyframes", desc: "Create keyframe steps (from/to or percentage points 0%–100%). For each step, define CSS properties like opacity and transform." },
      { title: "2. Configure Animation Properties", desc: "Set animation-name, duration, timing-function, delay, iteration-count, direction, and fill-mode." },
      { title: "3. Preview and Export", desc: "Play the animation in the preview panel. Export the CSS keyframes plus animation declaration." }
    ],
    faqs: [
      { question: "What is the difference between animation and transition in CSS?", answer: "Transitions require a trigger (hover) and interpolate between two states. Animations run independently using @keyframes with multiple stops and can loop infinitely." },
      { question: "How does the steps() timing function differ from cubic-bezier()?", answer: "cubic-bezier() creates smooth interpolated acceleration curves. steps(n) divides the animation into n discrete frames with no interpolation." },
      { question: "Why is my animation not running on page load?", answer: "Common issues: animation-name doesn't match the @keyframes name, display: none prevents animation, or the element isn't in the DOM when the page loads." }
    ]
  },

  "css-filter-generator": {
    instructions: [
      { title: "1. Apply Base Filters", desc: "Adjust the 10 available CSS filter functions: blur, brightness, contrast, drop-shadow, grayscale, hue-rotate, invert, opacity, saturate, and sepia." },
      { title: "2. Layer and Reorder Filters", desc: "Add multiple filters — order matters. Drag to reorder filter functions in the stack." },
      { title: "3. Preview and Compare", desc: "The live preview shows the filtered result side by side with the original. Toggle individual filters on/off." }
    ],
    faqs: [
      { question: "What is the performance impact of CSS filters on scrolling?", answer: "filter: blur() and filter: drop-shadow() are the most GPU-intensive. blur() with large radii on full-page elements is particularly expensive." },
      { question: "How does hue-rotate() affect the color space of an image?", answer: "hue-rotate(deg) shifts all colors by the specified angle on the HSL color wheel. For example, hue-rotate(180deg) inverts the color wheel." },
      { question: "Can CSS filters be animated for a smooth transition effect?", answer: "Yes, all filter functions are animatable. Use CSS transitions or @keyframes to smoothly transition between filter states." }
    ]
  },

  "random-token-generator": {
    instructions: [
      { title: "1. Set Token Length", desc: "Choose the token length from 8 to 256 characters. 32 characters (192 bits) is the recommended minimum for security tokens." },
      { title: "2. Choose Character Set", desc: "Select character groups: uppercase, lowercase, digits, and special characters. For URL-safe tokens, exclude special characters." },
      { title: "3. Generate and Copy Tokens", desc: "Generate 1–50 tokens at once using crypto.getRandomValues(). Click any token to copy it individually." }
    ],
    faqs: [
      { question: "How does this token generator ensure cryptographic randomness?", answer: "The tool uses the Web Crypto API's crypto.getRandomValues(), drawing entropy from the OS CSPRNG. This is the same source used for TLS key generation." },
      { question: "What is the difference between a random token and a hash?", answer: "A random token is pure entropy — each bit is randomly chosen. A hash is deterministic — the same input always produces the same output." },
      { question: "Are the generated tokens URL-safe and can they contain ambiguous characters?", answer: "The tool has a URL-safe mode excluding special characters. Ambiguity-free mode excludes visually similar characters (0/O, 1/l/I)." }
    ]
  },

  "dummy-text-generator": {
    instructions: [
      { title: "1. Select Generation Mode", desc: "Choose between Lorem Ipsum (Latin filler), Cicero, or Custom text with your own word list." },
      { title: "2. Set Output Parameters", desc: "Specify paragraphs (1–100), sentences per paragraph (3–20), and words per sentence (5–30)." },
      { title: "3. Include HTML Markup", desc: "Toggle HTML tags — wraps paragraphs in <p>, adds <h2> headings, and optionally includes lists." }
    ],
    faqs: [
      { question: "Where does the traditional Lorem Ipsum text originate from?", answer: "The standard Lorem Ipsum passage derives from Cicero's de Finibus Bonorum et Malus (45 BC), specifically sections 1.10.32–33. The text is intentionally scrambled Latin." },
      { question: "Can I generate text with specific word count instead of paragraph count?", answer: "Yes, the tool has a Target word count mode. Enter a specific number (50–5000 words), and it generates exactly that many words." },
      { question: "How does the Custom mode allow me to create branded placeholder text?", answer: "In Custom mode, you provide a comma-separated list of words or phrases (product names, features, industry terms). The tool constructs sentences using your vocabulary." }
    ]
  },

  "fake-data-generator": {
    instructions: [
      { title: "1. Select Data Categories", desc: "Choose types — personal info (names, emails, phones), addresses, company data, dates, financial data, or internet data." },
      { title: "2. Choose Locale", desc: "Select a locale for region-specific formats. en-US yields American formats; de-DE returns German; fr-FR returns French." },
      { title: "3. Set Row Count and Export", desc: "Generate 1–10,000 rows. Export as JSON, CSV, or SQL INSERT statements." }
    ],
    faqs: [
      { question: "How does locale selection affect phone number generation?", answer: "Each locale has a phone number format template (e.g., en-US uses (555) XXX-XXXX, en-GB uses +44 7XXX XXXXXX). Generated numbers follow area code rules." },
      { question: "Can I generate data that matches a specific database schema?", answer: "Yes, the Schema Match mode parses a CREATE TABLE statement or JSON schema and generates matching data based on column names and types." },
      { question: "What is the data source for the name and street databases?", answer: "The tool includes 50,000+ first and last names from 40 countries, 200,000+ street names from public census datasets, and 100,000+ city names." }
    ]
  },

  "fake-identity-generator": {
    instructions: [
      { title: "1. Select Identity Components", desc: "Choose which identity fields to include: full name, DOB, gender, SSN/National ID, passport number, driver's license, address, phone, email, username." },
      { title: "2. Set Nationality and Age Range", desc: "Select a nationality that determines document formats (SSN for US, NIN for UK). Set a min/max age range (18–99)." },
      { title: "3. Generate Complete Identities", desc: "Click Generate to create a single coherent fake identity. All fields are internally consistent — SSN issue date precedes expiration." }
    ],
    faqs: [
      { question: "Are the generated SSN/passport numbers from valid number series?", answer: "The generated SSN numbers follow US SSA format but use unassigned area numbers (000 or 900+ series) to avoid matching real SSNs. Passport numbers use correct country-specific formats with random generation." },
      { question: "How does the tool ensure internal consistency of identity data?", answer: "The generator creates a persona with a single seed value. The email derives from the generated name, the phone area code matches the city, and the SSN area number matches the state of issuance." },
      { question: "Can I export identities in a format suitable for user testing databases?", answer: "Yes, export formats include SQL INSERT statements matching common user table schemas, JSON for MongoDB/Firestore, and CSV for spreadsheet import." }
    ]
  },

  "fake-credit-card-generator": {
    instructions: [
      { title: "1. Select Card Networks", desc: "Choose networks: Visa (starts with 4), Mastercard (51–55), Amex (34/37, 15 digits), Discover (6011/65), or Diners Club." },
      { title: "2. Set Card Details", desc: "Optionally set a specific BIN prefix. Choose the expiration year range and CVV length (3 for most, 4 for Amex)." },
      { title: "3. Generate and Validate", desc: "Generated cards pass Luhn algorithm validation. The tool displays the complete card number, expiry, CVV, and cardholder name." }
    ],
    faqs: [
      { question: "How does the Luhn algorithm ensure generated card numbers are structurally valid?", answer: "The Luhn algorithm (mod 10) is the checksum formula used by all major payment networks. The generator produces a partial number, computes the Luhn check digit, and appends it." },
      { question: "Can I generate cards from specific BIN (Bank Identification Number) ranges?", answer: "Yes, the Custom BIN mode lets you enter a 6- or 8-digit BIN prefix. The tool completes the card number using the selected network's length rules." },
      { question: "Are the generated Amex cards different from Visa/Mastercard in format?", answer: "American Express uses 15-digit numbers versus 16 for Visa/Mastercard. Amex uses 4-digit CVV on the front. The tool adjusts all formatting per card network." }
    ]
  },

  "coupon-code-generator": {
    instructions: [
      { title: "1. Set Code Pattern", desc: "Choose a pattern: random alphanumeric, word-based (e.g., SUMMER2024), or prefix-based (e.g., WELCOME10)." },
      { title: "2. Configure Generation Rules", desc: "Set character groups to include. Optionally exclude ambiguous characters like O/0 and I/1." },
      { title: "3. Set Quantity and Batch Export", desc: "Generate 1–1000 codes at once. Export as CSV, plain text, or JSON array." }
    ],
    faqs: [
      { question: "How does the prefix-based mode help organize coupon campaigns?", answer: "Prefixes let you categorize codes by campaign or discount tier. For example, EMAIL10 for email campaigns, SOCIAL20 for social media. The tool appends a random suffix after the prefix." },
      { question: "What is the optimal code length for readability vs. security?", answer: "8 characters provides 47.6 trillion combinations with uppercase + digits, sufficient for most campaigns. 10-character codes are preferred for high-value discounts." },
      { question: "Can I generate codes that spell out words or follow a pronounceable pattern?", answer: "Yes, the Pronounceable mode alternates consonants and vowels (CVCVCV pattern), creating human-readable pseudo-words like BATEMU or KOLISA." }
    ]
  },

  "serial-number-generator": {
    instructions: [
      { title: "1. Define Serial Format Template", desc: "Create a template using placeholders: # = random digit, @ = random letter, ? = random alphanumeric." },
      { title: "2. Set Generation Options", desc: "Configure the separator character, segment length, and whether to use uppercase only. Toggle checksum digit mode." },
      { title: "3. Generate and Validate", desc: "Generate 1–5000 unique serial numbers. Export as CSV, TXT, or JSON array." }
    ],
    faqs: [
      { question: "How does the checksum digit mode prevent manual entry errors?", answer: "The tool appends a check digit computed using the Luhn mod-10 algorithm or custom weighted-sum algorithm. This catches single-digit errors and transpositions." },
      { question: "What is the maximum number of unique serial numbers from a given template?", answer: "The template's total combinations = (character set size per placeholder) ^ (number of variable placeholders). The tool estimates capacity and warns about birthday problem risks." },
      { question: "Can I generate serial numbers that encode specific data like date or batch ID?", answer: "Yes, the template supports fixed groups (e.g., BATCH42-####) and date-based placeholders: YYYY = current year, MM = month, DD = day." }
    ]
  },

  "avatar-generator": {
    instructions: [
      { title: "1. Choose Avatar Style", desc: "Select from initials-based, generated pixel art (8x8 or 16x16 grid), abstract geometric shapes, or identicon-style." },
      { title: "2. Customize Appearance", desc: "For initials: pick background color, text color, and shape. For pixel art: choose color palette and symmetry mode." },
      { title: "3. Generate and Download", desc: "Generate the avatar as SVG or PNG (64x64 to 512x512). Download individually or generate a batch from a list of names." }
    ],
    faqs: [
      { question: "How does the identicon algorithm generate unique avatars from a string?", answer: "The identicon takes an input string, computes its MD5 hash, and uses bytes to determine the mirrored pattern, hue, and saturation. The same input always produces the same identicon." },
      { question: "Can I generate avatars that are real-time rendered as SVG instead of PNG?", answer: "Yes, SVG output is resolution-independent and typically under 2KB per avatar. Ideal for web applications where you want lightweight avatar placeholders." },
      { question: "What color palettes are available for the pixel art style?", answer: "12 curated palettes: Classic (8-bit NES), Game Boy (4-shade green), Pastel, Vibrant, Monochrome, Ocean, Sunset, Forest, Neon, Grayscale, and Custom." }
    ]
  },

  "two-factor-auth-generator": {
    instructions: [
      { title: "1. Select TOTP Parameters", desc: "Choose the time step (30 seconds recommended), HMAC algorithm (SHA-1, SHA-256, SHA-512), and OTP digit length (6 or 8 digits)." },
      { title: "2. Enter or Generate a Secret", desc: "Generate a random base32-encoded secret (16–32 characters) or enter your own." },
      { title: "3. Generate QR Code and Codes", desc: "The tool generates the otpauth:// URL and renders a QR code for scanning into authenticator apps." }
    ],
    faqs: [
      { question: "How does time-based one-time password (TOTP) synchronization work?", answer: "TOTP uses the Unix epoch time divided by the time step as input to HMAC-SHA1 with the shared secret. Both server and authenticator must have synchronized clocks within +/-30 seconds." },
      { question: "What is the difference between TOTP and HOTP for two-factor authentication?", answer: "HOTP uses a counter that increments with each authentication. TOTP uses time as the counter. TOTP is more common (Google Authenticator, Authy)." },
      { question: "Can I generate backup codes alongside the TOTP configuration?", answer: "Yes, the tool generates 5–10 single-use backup codes (10-character alphanumeric) displayed alongside the QR code for when the user loses access to their device." }
    ]
  },

  "hash-password-generator": {
    instructions: [
      { title: "1. Enter Password", desc: "Type or paste the password to hash. The input is masked for security. All processing happens in your browser." },
      { title: "2. Select Hash Algorithm", desc: "Choose from bcrypt (cost factor 4–31), argon2 (argon2id), scrypt, or PBKDF2." },
      { title: "3. Review Salt and Hash Output", desc: "The tool auto-generates a salt. The output includes the algorithm identifier, cost parameters, salt, and resulting hash." }
    ],
    faqs: [
      { question: "What is the modular crypt format and why is it important?", answer: "Modular crypt format ($identifier$parameter$salt$hash) encodes algorithm, cost factors, salt, and hash in one string. Libraries like PHP's password_hash() and Python's passlib use this format." },
      { question: "Why should I use argon2id over bcrypt for new password hashing?", answer: "Argon2id is memory-hard, resisting GPU and ASIC attacks by requiring configurable memory (typically 19 MiB+) per hash computation. Bcrypt is acceptable but considered legacy." },
      { question: "How does the bcrypt cost factor affect hash time and security?", answer: "Cost factor 2^10 = 1,024 rounds (~100ms), cost 2^12 = 4,096 rounds (~400ms). Each increment of 1 doubles compute time. Recommended minimum as of 2024 is cost 10–12." }
    ]
  },

  "hash-file-generator": {
    instructions: [
      { title: "1. Upload a File", desc: "Drag and drop a file or click to browse. Supports files up to 1 GB. File is processed in-browser — never uploaded." },
      { title: "2. Select Hash Algorithms", desc: "Choose from MD5, SHA-1, SHA-256, SHA-384, SHA-512, SHA-3, or Blake2b. Multi-select for simultaneous computation." },
      { title: "3. View and Compare Hash Results", desc: "The computed hash(es) display in hex format. Use the Compare panel to paste a provided hash and check for match." }
    ],
    faqs: [
      { question: "How does the tool handle files larger than browser memory?", answer: "The tool uses the File API's .slice() method to read the file in 64 MB chunks, feeding each to the Web Crypto API incrementally. A progress bar updates as each chunk processes." },
      { question: "Can I verify a downloaded file's checksum against a provided hash?", answer: "Yes, the Compare mode lets you paste a known hash. The tool computes the file's hash and performs a case-insensitive comparison with green (match) or red (mismatch) indicator." },
      { question: "What is the difference between SHA-2 and SHA-3 families?", answer: "SHA-2 uses Merkle-Damgard structure and is the most widely adopted. SHA-3 (Keccak) uses a sponge construction, designed as a backup in case SHA-2 is broken." }
    ]
  },

  "hmac-generator": {
    instructions: [
      { title: "1. Enter Message and Secret Key", desc: "Input the message string and a secret key. The key should be at least as long as the hash output for maximum security." },
      { title: "2. Select Hash Algorithm", desc: "Choose the underlying hash function: MD5, SHA-1, SHA-256, SHA-384, SHA-512, SHA3-256, or SHA3-512." },
      { title: "3. Choose Output Format", desc: "Select between hex (lowercase), hex (uppercase), base64, or base64-url. Copy the resulting HMAC tag." }
    ],
    faqs: [
      { question: "How is HMAC different from regular hashing (e.g., just SHA-256 of message + key)?", answer: "HMAC uses a specific two-pass construction with ipad and opad to prevent length-extension attacks that affect plain SHA-256(message + key) constructions." },
      { question: "What is the purpose of HMAC in API authentication?", answer: "HMAC creates a message authentication code proving both integrity and authenticity. In API auth (AWS Signature V4), the client computes HMAC of the request and sends it in a header." },
      { question: "How does key length affect HMAC security?", answer: "If the key is shorter than the hash output length, security degrades to the key's brute-force space. The recommended key length equals the hash output length (32 bytes for SHA-256)." }
    ]
  },

  "content-security-policy-generator": {
    instructions: [
      { title: "1. Define Resource Directives", desc: "Configure directives: default-src, script-src, style-src, img-src, font-src, connect-src, media-src, object-src, frame-src." },
      { title: "2. Set Allowed Sources", desc: "Specify sources: 'self', 'none', specific domains, scheme, inline (with nonce or hash), and 'unsafe-inline'/'unsafe-eval'." },
      { title: "3. Add Reporting", desc: "Configure report-uri or report-to. Toggle between enforcing and Report-Only headers." }
    ],
    faqs: [
      { question: "What is the difference between 'unsafe-inline' and using a nonce in CSP?", answer: "unsafe-inline allows ALL inline scripts, defeating XSS protection. A nonce allows only tags with the matching nonce attribute. Strict CSP using nonces is vastly more secure." },
      { question: "How does 'strict-dynamic' change script-src behavior?", answer: "strict-dynamic tells the browser to trust scripts dynamically loaded by already-trusted scripts, eliminating the need to list every third-party domain in script-src." },
      { question: "Can I test a CSP policy before deploying to production?", answer: "Yes, generate a report-only header with Content-Security-Policy-Report-Only and a report-uri endpoint. Monitor reports before switching to enforcement." }
    ]
  },

  "ipv6-ula-generator": {
    instructions: [
      { title: "1. Generate ULA Prefix", desc: "The tool generates a random fdXX:XXXX:XXXX::/48 prefix per RFC 4193. The 8-bit fd prefix identifies ULA." },
      { title: "2. Set Subnet ID", desc: "Optionally extend to a /64 or /56 by specifying a subnet ID. The tool shows the expanded subnet range." },
      { title: "3. Copy and Document", desc: "Copy the generated ULA prefix. Document in your IPAM system — ULAs are not globally routable." }
    ],
    faqs: [
      { question: "What is the purpose of Unique Local Addresses (ULA) in IPv6?", answer: "ULA (fc00::/7) is the IPv6 equivalent of private IPv4 addresses. They are for internal network communication and are not routable on the public internet." },
      { question: "How does the random global ID in ULA ensure uniqueness?", answer: "RFC 4193 requires the 40-bit global ID to be generated from a sufficiently random source. The probability of two networks generating the same /48 is approximately 1 in 1.1 trillion." },
      { question: "Can I use ULA addresses alongside global unicast addresses on the same interface?", answer: "Yes, IPv6 interfaces commonly have multiple addresses — GUA for internet, ULA for internal, and link-local for neighbor discovery." }
    ]
  },

  "dns-lookup-generator": {
    instructions: [
      { title: "1. Enter Domain Name", desc: "Type the domain name to query. Supports internationalized domain names (IDN) with Punycode conversion." },
      { title: "2. Select Record Types", desc: "Choose record types: A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA, DS, DNSKEY, or ALL." },
      { title: "3. View Results with TTL", desc: "The tool performs queries via DNS-over-HTTPS (DoH) and displays each record with type, value, and TTL." }
    ],
    faqs: [
      { question: "How does DNS-over-HTTPS (DoH) lookup differ from a traditional nslookup?", answer: "Traditional nslookup sends UDP packets to port 53. DoH encrypts the query within HTTPS POST to a resolver endpoint (e.g., Cloudflare 1.1.1.1)." },
      { question: "Why do some DNS lookups return different results from different locations?", answer: "GeoDNS returns different IPs based on the requester's region. CDNs like Cloudflare and Akamai use this to route users to the nearest edge server." },
      { question: "What does the SOA record's serial number indicate?", answer: "The SOA serial number is a version counter for the zone's DNS records. Secondary servers use this to determine if a zone transfer is needed." }
    ]
  },

  "cors-header-generator": {
    instructions: [
      { title: "1. Set Allowed Origins", desc: "Enter one or more allowed origins. Use * for public APIs but note this disables credentials." },
      { title: "2. Configure Methods and Headers", desc: "Select allowed HTTP methods and allowed request headers (Content-Type, Authorization, X-Requested-With)." },
      { title: "3. Set Preflight Options", desc: "Configure Access-Control-Max-Age, allow credentials, and exposed response headers." }
    ],
    faqs: [
      { question: "Why does the browser send a preflight OPTIONS request before some cross-origin requests?", answer: "The browser sends a preflight when the request uses non-simple methods, includes custom headers, or has a non-safelisted Content-Type." },
      { question: "What is the Vary: Origin header and why is it critical for CORS?", answer: "When Access-Control-Allow-Origin is dynamic, Vary: Origin tells caches the response varies by Origin. Without it, cached responses may be served to wrong origins." },
      { question: "How do I handle CORS with credentials (cookies) across origins?", answer: "Set Access-Control-Allow-Credentials: true, Access-Control-Allow-Origin must be a specific origin (not *), and client must set withCredentials: true." }
    ]
  },

  "env-file-generator": {
    instructions: [
      { title: "1. Add Environment Variables", desc: "Enter key-value pairs. Keys must be uppercase with underscores (e.g., DATABASE_URL)." },
      { title: "2. Organize by Environment", desc: "Organize variables by environment — development, staging, production. The tool generates separate .env files per environment." },
      { title: "3. Export in Multiple Formats", desc: "Download as .env, JSON, or YAML. The tool also generates .env.example with dummy values." }
    ],
    faqs: [
      { question: "What are the rules for valid .env file syntax?", desc: "Each line follows KEY=VALUE format. Lines starting with # are comments. Values can be quoted. Multi-line values use backslash escaping." },
      { question: "How should I differentiate between development and production environment variables?", answer: "The tool creates .env (shared defaults), .env.development, and .env.production. Libraries like dotenv load .env first, then environment-specific overrides." },
      { question: "Can I generate .env files with type validation?", answer: "Yes, the .env.schema output includes type constraints (string, number, boolean, url) and required/optional flags compatible with envalid." }
    ]
  },

  "csrf-token-generator": {
    instructions: [
      { title: "1. Choose Token Generation Method", desc: "Select random bytes (crypto.getRandomValues), HMAC-based, or double-submit cookie pattern." },
      { title: "2. Configure Token Parameters", desc: "Set token length (16–64 bytes), encoding (base64, hex, base64url), and optional timestamp prefix." },
      { title: "3. Generate and Test", desc: "Generate a new CSRF token. Shows the token value, expected header name, and form embedding method." }
    ],
    faqs: [
      { question: "What is the double-submit cookie pattern and how does it differ from session-based CSRF tokens?", answer: "Double-submit sends a CSRF token in both a cookie (non-httponly) and a request header. The server validates both match, requiring no server-side storage." },
      { question: "Why can't I just use the Origin header instead of CSRF tokens?", answer: "The Origin header can be absent in some browsers or navigation scenarios. CSRF tokens are the most robust defense as they don't rely on potentially absent headers." },
      { question: "How often should CSRF tokens be rotated for security?", answer: "Per-session rotation (at login/logout) is recommended. Per-request rotation is most secure but causes issues with back-button navigation and multiple tabs." }
    ]
  },

  "gitignore-generator": {
    instructions: [
      { title: "1. Select Project Type", desc: "Choose from 100+ templates: Node, Python, Java, Go, Rust, React, Vue, Angular, Django, Rails." },
      { title: "2. Add Custom Entries", desc: "Extend with custom patterns for your specific project. Use the interactive glob builder." },
      { title: "3. Merge and Export", desc: "The tool merges selected templates, removes duplicates, and orders entries logically. Download or copy." }
    ],
    faqs: [
      { question: "How does the tool handle template merging when multiple technologies are selected?", answer: "The tool unifies all entries, deduplicates identical patterns, and flags conflicting entries in orange. The final output is alphabetically sorted by category." },
      { question: "Why are some entries like .env and .DS_Store always included by default?", answer: ".env files contain secrets and must never be committed. .DS_Store and Thumbs.db are OS files that clutter repositories. These are locked against removal." },
      { question: "Can I create a custom .gitignore template and save it for my team?", answer: "Yes, the Team Templates feature lets you create and save custom configurations to browser localStorage, exportable as JSON for team sharing." }
    ]
  },

  "http-headers-generator": {
    instructions: [
      { title: "1. Select Header Category", desc: "Choose from General, Entity, Request, Response, or Security headers." },
      { title: "2. Configure Header Values", desc: "For each selected header, set its value. Cache-Control supports max-age, no-cache, no-store, public/private." },
      { title: "3. Generate Header Block", desc: "Generate the complete HTTP header block as plain text, raw HTTP response, or server configuration snippet." }
    ],
    faqs: [
      { question: "What is the correct order of HTTP headers in a response?", answer: "HTTP does not require specific order, but convention is: general headers, response headers, entity headers, security headers. The tool follows this convention." },
      { question: "How does the Link header work in HTTP for preloading resources?", answer: "The Link header tells the browser about related resources before parsing HTML. Supported rel types: preload, prefetch, preconnect, dns-prefetch, modulepreload." },
      { question: "How should Set-Cookie headers be configured for secure cross-site usage?", answer: "Include SameSite=Lax (default) or SameSite=Strict, Secure flag, HttpOnly flag, and Path attribute. For third-party cookies, use SameSite=None; Secure." }
    ]
  },

  "http-cache-header-generator": {
    instructions: [
      { title: "1. Set Cache-Control Directive", desc: "Choose no-cache, no-store, public, private, or max-age with a duration in seconds." },
      { title: "2. Configure ETag and Last-Modified", desc: "Toggle ETag generation (strong or weak) and set Last-Modified date for conditional requests." },
      { title: "3. Add Cache Busting Strategy", desc: "Configure Vary header, stale-while-revalidate, and stale-if-error directives." }
    ],
    faqs: [
      { question: "What is the difference between no-cache and no-store in Cache-Control?", answer: "no-cache allows caching but requires revalidation with the server before use. no-store prevents any storage of the response at all, including in memory." },
      { question: "How does the Vary header interact with CDN caching?", answer: "Vary tells caches the response varies based on request headers. A broad Vary: * effectively disables caching." },
      { question: "What is the stale-while-revalidate directive and when should I use it?", answer: "It allows serving stale content while revalidating asynchronously, eliminating the cache stampede problem. Configurable with age windows." }
    ]
  },

  "eslint-config-generator": {
    instructions: [
      { title: "1. Select Project Environment", desc: "Choose browser, Node.js, ES modules, or combination. Sets env.browser, env.node, etc." },
      { title: "2. Configure Rules and Plugins", desc: "Select rules from categories. Add plugins like @typescript-eslint, react, react-hooks, import, prettier." },
      { title: "3. Set Parser and Export", desc: "Choose parser (Espree, @typescript-eslint/parser). Export as .eslintrc.json, .js, .yaml, or flat config." }
    ],
    faqs: [
      { question: "What is the difference between the old .eslintrc format and the new flat config?", answer: "Flat config exports an array of objects from eslint.config.js with no extends, env, or parserOptions. These are replaced by languageOptions." },
      { question: "How should I configure @typescript-eslint/no-unused-vars for TypeScript?", answer: "Disable the base no-unused-vars and enable @typescript-eslint/no-unused-vars with argsIgnorePattern: '^_' and varsIgnorePattern: '^_'." },
      { question: "Can I generate an ESLint config that integrates with Prettier?", answer: "Yes, enable Prettier integration to include eslint-config-prettier as an override that disables conflicting rules. Prettier must be last in extends." }
    ]
  },

  "ssh-key-generator": {
    instructions: [
      { title: "1. Select Key Algorithm", desc: "Choose RSA (2048/4096/8192), ECDSA (256/384/521), Ed25519 (recommended), or DSA (deprecated)." },
      { title: "2. Set Comment and Passphrase", desc: "Enter a comment (usually user@host). Set an optional passphrase for encrypting the private key." },
      { title: "3. Generate and Download Keys", desc: "Generate the key pair. The public key is ready for authorized_keys. Private key in OpenSSH format." }
    ],
    faqs: [
      { question: "Why is Ed25519 recommended over RSA for SSH keys?", answer: "Ed25519 provides equivalent security to RSA-3072 with a fixed 256-bit key, faster generation and signing, and resistance to side-channel attacks." },
      { question: "How do I use the generated public key on a server?", answer: "Append the public key to ~/.ssh/authorized_keys with chmod 600. The private key goes on your client at ~/.ssh/id_ed25519 with chmod 600." },
      { question: "What is the difference between PEM and OpenSSH private key formats?", answer: "OpenSSH format (BEGIN OPENSSH PRIVATE KEY) is modern and flexible. PEM format (BEGIN RSA PRIVATE KEY) is older and limited to RSA/DSA keys." }
    ]
  },

  "security-txt-generator": {
    instructions: [
      { title: "1. Enter Contact Information", desc: "Provide contact URIs (mailto:security@example.com, https://example.com/hall-of-fame)." },
      { title: "2. Set Policy and Dates", desc: "Add a link to your security policy page. Set expiration date and preferred languages." },
      { title: "3. Generate security.txt File", desc: "Generate the complete security.txt with Canonical, Encryption, Hiring, and Acknowledgments fields." }
    ],
    faqs: [
      { question: "What is the purpose of a security.txt file on a website?", answer: "security.txt (RFC 9116) standardizes security contact information at /.well-known/security.txt, helping researchers find proper vulnerability reporting channels." },
      { question: "What fields are required in a valid security.txt file?", answer: "RFC 9116 only requires Contact. Strongly recommended: Expires, Preferred-Languages, Canonical, and Encryption." },
      { question: "Should the security.txt file be signed with OpenPGP?", answer: "Signing is recommended to prevent attackers from redirecting reports. The tool generates the unsigned file and provides the gpg command to sign it." }
    ]
  },

  "random-ip-generator": {
    instructions: [
      { title: "1. Select IP Version and Scope", desc: "Choose IPv4 or IPv6, and whether to generate public IPs, private IPs, or all." },
      { title: "2. Exclude Specific Ranges", desc: "Optionally exclude multicast, loopback, link-local, or documentation ranges." },
      { title: "3. Generate Batch Results", desc: "Generate 1–1000 IP addresses. Results show version and classification." }
    ],
    faqs: [
      { question: "How does the geographic restriction filter IP addresses by country?", answer: "The tool includes a simplified GeoIP database. When you select a country, it generates IPs from ranges registered to that country's regional internet registry." },
      { question: "What is the difference between public, private, and reserved IP addresses?", answer: "Public IPs are globally routable. Private IPs (RFC 1918) are for internal networks. Reserved includes multicast, loopback, and documentation ranges." },
      { question: "Can I generate IPs guaranteed to be unreachable for documentation?", answer: "Yes, the Documentation/Test Only mode restricts to RFC 5737 ranges (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24) reserved for documentation." }
    ]
  },

  "random-user-agent-generator": {
    instructions: [
      { title: "1. Select Browser and Version", desc: "Choose Chrome, Firefox, Safari, Edge, or Opera. Optionally specify a version range." },
      { title: "2. Choose Device Type", desc: "Select Desktop (macOS, Windows, Linux), Mobile (iOS, Android), or Tablet." },
      { title: "3. Generate and Copy", desc: "Generate a random user agent. Shows parsed components for verification. Copy the raw string." }
    ],
    faqs: [
      { question: "Why do modern user agent strings have such complex structures?", answer: "User agents grew complex due to backwards compatibility — browsers add tokens from other browsers to avoid legacy sniffer blocks. Chrome includes 'Safari' and 'Gecko' tokens." },
      { question: "How does the tool generate realistic Apple device user agents?", answer: "For Safari on iOS, the generator creates strings matching real iPhone/iPad models (e.g., iPhone15,2) with correct WebKit build numbers and OS versioning." },
      { question: "Can I generate user agents for legacy compatibility testing?", answer: "Yes, the Historical mode includes strings from browsers dating back to 2010, including IE 6 on Windows XP and Safari 5 on Snow Leopard." }
    ]
  },

  "pin-generator": {
    instructions: [
      { title: "1. Set PIN Length", desc: "Choose 4–12 digits. 6+ digit PINs offer significantly more security." },
      { title: "2. Configure Generation Rules", desc: "Optionally disallow sequential digits, repeated digits, patterns, and leading zeros." },
      { title: "3. Generate and Evaluate Strength", desc: "Generate 1–100 PINs. Each is evaluated for strength and flagged if weak." }
    ],
    faqs: [
      { question: "What PIN patterns are considered weak and automatically rejected?", answer: "Sequential (1234), repeated (1111), common years (1984), palindromes (1221), keypad patterns (2580), and 5000+ breached PINs from data breaches." },
      { question: "How much does PIN entropy increase with each additional digit?", answer: "Each digit multiplies the search space by 10. 4-digit = 10^4, 6-digit = 10^6, 8-digit = 10^8, 12-digit = 10^12 combinations." },
      { question: "Can I generate pronounceable PINs that are easy to remember?", answer: "Yes, the Memorable mode converts digits to telephone keypad words (2668 = BOOT). Includes a 10,000-word dictionary for easy-to-remember secure PINs." }
    ]
  },

  "license-key-generator": {
    instructions: [
      { title: "1. Choose License Key Format", desc: "Select alphanumeric groups, numeric groups, or base32-encoded. Set groups and characters per group." },
      { title: "2. Configure Embedded Data", desc: "Embed product ID, license tier, expiration date, or seat count in specific positions." },
      { title: "3. Add Validation Features", desc: "Enable checksum digit for typo detection. Generate validation algorithm snippet." }
    ],
    faqs: [
      { question: "How does checksum validation prevent fraudulent license key generation?", answer: "The checksum creates a self-validating key. Without knowing the algorithm and secret (for HMAC mode), attackers cannot generate valid keys." },
      { question: "Can license keys be revoked or verified online?", answer: "The tool generates offline-validable keys and optionally a JSON payload for online verification against your server database." },
      { question: "What is the recommended format for embedding product ID and tier in a key?", answer: "Embed in fixed positions: chars 0–3 for product ID (base36), 4–5 for tier, 6–9 for expiration (MMYY). The tool provides an interactive encoder." }
    ]
  },

  "image-placeholder-generator": {
    instructions: [
      { title: "1. Set Image Dimensions", desc: "Enter width and height in pixels (10–2000). Supports common aspect ratios." },
      { title: "2. Configure Background and Text", desc: "Choose background and text colors. Toggle the dimension label overlay." },
      { title: "3. Generate and Copy URL or Download", desc: "Get SVG data URI or hosted PNG URL. Copy HTML img tag or CSS background URL." }
    ],
    faqs: [
      { question: "Why does the tool use SVG for placeholder images instead of raster PNG?", answer: "SVG is resolution-independent, has tiny file sizes (200–500 bytes), and can include inline CSS and styled text without external requests." },
      { question: "Can I generate a gradient placeholder instead of a solid color?", answer: "Yes, the Gradient mode offers linear and radial presets with up to 3 color stops. Duotone mode blends two colors with mix-blend-mode." },
      { question: "How do I use the placeholder in a responsive img tag?", answer: "Enable responsive mode to generate srcset and sizes attributes with multiple versions (400x300, 800x600, 1200x900)." }
    ]
  },

  "logo-placeholder-generator": {
    instructions: [
      { title: "1. Enter Company/Product Name", desc: "Type the name (up to 30 chars). The tool extracts initials for icon variations." },
      { title: "2. Choose Logo Style", desc: "Select text-only, initial-circle, icon + text, or geometric shape." },
      { title: "3. Customize Colors and Export", desc: "Pick from preset palettes. Download as SVG, PNG, or ICO." }
    ],
    faqs: [
      { question: "How does the initial-circle style choose colors and size for each letter?", answer: "Two-letter initials split the circle into half-circles with complementary colors. Single letters use the full circle. Letter spacing and centering are computed optimally." },
      { question: "Can I customize the icon by uploading my own SVG?", answer: "Yes, upload an SVG path or choose from 100+ built-in business icons. The icon is embedded inline for self-contained output." },
      { question: "What typography options are available for text-based logos?", answer: "20+ Google Fonts categorized by industry: sans-serif for tech, serif for luxury, display for creative, monospace for developer tools." }
    ]
  },

  "open-graph-generator": {
    instructions: [
      { title: "1. Set OG Meta Fields", desc: "Enter og:title, og:description, og:url, og:type (website, article, product), og:site_name." },
      { title: "2. Configure Image and Video", desc: "Set og:image (1200x630 recommended) with alt text. For video, add og:video with secure_url." },
      { title: "3. Generate Meta Tags", desc: "Generate the complete OG tag block including Twitter Cards and optional JSON-LD." }
    ],
    faqs: [
      { question: "What is the difference between Open Graph and Twitter Cards?", answer: "OG is Facebook's protocol for URL previews. Twitter Cards are a separate format. Twitter falls back to OG tags if Twitter Card tags are absent." },
      { question: "How do I debug why my OG tags don't show correctly on Facebook?", answer: "Use Facebook's Sharing Debugger. Common issues: og:image must use absolute URL, image minimum 600x315px, page must not block facebookexternalhit crawler." },
      { question: "What OG type should I use for product pages vs article pages?", answer: "Use og:type=product for e-commerce (enables product:price:amount, product:availability). Use og:type=article for blog posts (enables article:published_time)." }
    ]
  },

  "oauth-pkce-generator": {
    instructions: [
      { title: "1. Generate Code Verifier", desc: "Generate a cryptographically random code_verifier (43–128 chars using unreserved characters)." },
      { title: "2. Compute Code Challenge", desc: "Choose S256 (SHA-256 hash then base64url, recommended) or plain method." },
      { title: "3. Copy Configuration", desc: "Copy the verifier, challenge, authorization URL, and token exchange POST body." }
    ],
    faqs: [
      { question: "What problem does PKCE solve in the OAuth 2.0 authorization code flow?", answer: "PKCE (RFC 7636) prevents authorization code interception attacks by binding the code to the client session. An attacker who intercepts the code cannot exchange it without the verifier." },
      { question: "Why is S256 recommended over the plain method for code challenge?", answer: "S256 ensures that even if the challenge is intercepted, the attacker cannot derive the verifier. With plain method, the challenge IS the verifier." },
      { question: "How do the verifier and challenge flow through the OAuth handshake?", answer: "Your app sends the challenge in the authorization request. After receiving the code, your app sends the original verifier to the token endpoint. The server hashes the verifier and compares to the stored challenge." }
    ]
  },

  "avro-schema-generator": {
    instructions: [
      { title: "1. Define Schema Name and Namespace", desc: "Enter the schema name and namespace (e.g., com.example.user). These define the fully qualified name." },
      { title: "2. Add Fields with Types", desc: "Add fields with Avro types: null, boolean, int, long, float, double, bytes, string, record, enum, array, map, union, fixed." },
      { title: "3. Set Field Properties", desc: "For each field, set default values, doc strings, order (ascending/descending/ignore), and aliases." }
    ],
    faqs: [
      { question: "What is the difference between Avro's record and enum types?", answer: "A record is a complex type with multiple named fields of various types. An enum is a type restricted to a set of symbolic names (strings). Enums support aliases for schema evolution." },
      { question: "How does Avro handle schema evolution with default values?", answer: "Fields can have default values, allowing readers with a newer schema to process older data. A field added with a default value is backward-compatible. Removing a field or making it required is a breaking change." },
      { question: "Can I generate Avro schema from an existing JSON object?", answer: "Yes, the tool has a JSON-to-Avro inference mode. Paste a sample JSON record, and the tool infers the Avro schema with appropriate types: string, int, long, double, boolean, array, and record." }
    ]
  },

  "json-ld-generator": {
    instructions: [
      { title: "1. Set Context and Type", desc: "Enter the @context URL (e.g., https://schema.org) and @type (e.g., Product, Article, Person, Organization, Event)." },
      { title: "2. Add Structured Properties", desc: "Add properties relevant to the selected type. For Product: name, description, brand, offers, aggregateRating. For Article: headline, author, datePublished." },
      { title: "3. Generate and Validate", desc: "Generate the JSON-LD script block. The tool validates the structure against schema.org vocabulary and common errors." }
    ],
    faqs: [
      { question: "What is the difference between JSON-LD and microdata for structured data?", answer: "JSON-LD is a script tag in the head/body that doesn't alter visible HTML. Microdata adds itemprop attributes to existing HTML elements. JSON-LD is Google's recommended format as it's easier to maintain." },
      { question: "How does the tool validate JSON-LD against schema.org types?", answer: "The tool checks that all properties used are defined in schema.org for the specified type. It flags unknown properties, missing required properties (per Google's guidelines), and type mismatches." },
      { question: "Can JSON-LD be used for breadcrumb and FAQ rich results?", answer: "Yes, the tool supports BreadcrumbList (WebPage > itemListElement > ListItem) and FAQPage (mainEntity > Question > acceptedAnswer) types for Google rich snippets." }
    ]
  },

  "merge-patch-generator": {
    instructions: [
      { title: "1. Enter Original JSON", desc: "Paste the original JSON document that will be the base for the merge patch." },
      { title: "2. Enter Modified JSON", desc: "Paste the modified JSON document (the desired state after patching)." },
      { title: "3. Generate Merge Patch", desc: "The tool computes the RFC 7396 Merge Patch — a JSON document describing the differences. Fields with new values are included, removed fields are set to null." }
    ],
    faqs: [
      { question: "How does JSON Merge Patch (RFC 7396) differ from JSON Patch (RFC 6902)?", answer: "Merge Patch is a simple diff where null means remove the field. JSON Patch is an explicit list of operations (add, remove, replace, move, copy, test) in a specific order." },
      { question: "What happens when the original and modified documents have nested objects?", answer: "The merge patch recursively diffs nested objects. Only the changed nested fields appear in the patch output, not the entire nested structure." },
      { question: "Can I apply a merge patch to see the resulting document?", answer: "Yes, the tool has an Apply mode. Paste an original document and a merge patch to preview the resulting merged document before committing the patch." }
    ]
  },

  "json-schema-generator": {
    instructions: [
      { title: "1. Input JSON Sample", desc: "Paste a JSON object or array that represents your data. The tool analyzes the structure." },
      { title: "2. Select Schema Version", desc: "Choose JSON Schema draft-04, draft-07, 2020-12, or OpenAPI-compatible mode." },
      { title: "3. Customize Constraints", desc: "Add constraints: required fields, minimum/maximum values, regex patterns, enum values, and array length limits." }
    ],
    faqs: [
      { question: "How does the tool infer types from a JSON sample?", answer: "The tool recursively walks the JSON structure: strings become {type: string}, numbers become {type: number}, objects become {type: object, properties}, arrays become {type: array, items}." },
      { question: "Can I generate schema for nullable fields?", answer: "Yes, toggle nullable mode. For draft-07, this adds 'nullable: true'. For 2020-12, it uses type: ['string', 'null'] (JSON Schema union types)." },
      { question: "What is the difference between allOf, anyOf, and oneOf in JSON Schema?", answer: "allOf requires all schemas to match (intersection). anyOf requires at least one to match (union). oneOf requires exactly one to match (exclusive union)." }
    ]
  },

  "jwk-generator": {
    instructions: [
      { title: "1. Select Key Type", desc: "Choose the JWK key type: RSA, EC (P-256, P-384, P-521), oct (symmetric), or OKP (Ed25519, X25519)." },
      { title: "2. Set Key Parameters", desc: "For RSA: set modulus size. For EC: select curve. For oct: set key length. Add key ID (kid) and key usage (sig/enc)." },
      { title: "3. Generate JWK Set", desc: "Generate the JWK with public and private key parameters. Copy as compact JWK or JWK Set (keys array) format." }
    ],
    faqs: [
      { question: "What is the JWK format and how does it differ from PEM?", answer: "JWK (JSON Web Key, RFC 7517) represents cryptographic keys as JSON objects with base64url-encoded parameters. PEM is base64-encoded DER with header/footer lines. JWK is directly usable in JavaScript/TypeScript." },
      { question: "How does the tool handle the JWK Thumbprint (RFC 7638)?", answer: "The tool computes the JWK Thumbprint by canonicalizing the required members (crv, kty, x, y for EC), constructing a JSON object, and computing its SHA-256 digest as base64url." },
      { question: "Can I convert an existing PEM key to JWK format?", answer: "Yes, the tool accepts PEM input for RSA and EC keys and extracts the base64url-encoded parameters (n, e, d, p, q, dp, dq, qi for RSA; crv, x, y, d for EC)." }
    ]
  },

  "glassmorphism-generator": {
    instructions: [
      { title: "1. Set Background Blur", desc: "Adjust the backdrop-filter: blur() value (1–50px). Higher values create more frosted glass effect." },
      { title: "2. Configure Glass Colors", desc: "Set the background color with opacity (rgba with alpha 0.1–0.5). Choose border color for the subtle glass edge." },
      { title: "3. Add Shadow and Radius", desc: "Set border-radius for the card and box-shadow for depth. Copy the generated CSS with all vendor prefixes." }
    ],
    faqs: [
      { question: "What is glassmorphism and which CSS properties make it work?", answer: "Glassmorphism creates a frosted glass effect using backdrop-filter: blur(), semi-transparent background (rgba with alpha), light border, and layered box-shadow." },
      { question: "Why does backdrop-filter not work in Firefox without a background?", answer: "Firefox requires a background with some opacity (use rgba) for backdrop-filter to render. A fully transparent background prevents the blur effect." },
      { question: "Can glassmorphism be used on elements with dark backgrounds?", answer: "Yes, the tool has a dark mode toggle. Use lighter glass overlay colors (white with alpha 0.05–0.15) on dark backgrounds for the frosted effect." }
    ]
  },

  "neumorphism-generator": {
    instructions: [
      { title: "1. Choose Shape Type", desc: "Select convex (raised button) or concave (inset field) neumorphic style." },
      { title: "2. Set Base Color", desc: "Choose the base color. Neumorphism works best with pastel/neutral backgrounds (#e0e0e0 family)." },
      { title: "3. Adjust Shadow Distance", desc: "Set the shadow offset and blur. Larger values create more pronounced neumorphic depth." }
    ],
    faqs: [
      { question: "What is the core principle behind neumorphic design?", answer: "Neumorphism (soft UI) uses two shadows — a light shadow (top-left, from a light source) and a dark shadow (bottom-right) — on the same element to simulate extruded/inset plastic." },
      { question: "Why does neumorphism require a specific background color to work?", answer: "The illusion depends on the element color matching the background color. The two shadows create the 3D impression only when there's no contrast between the element and its background." },
      { question: "Does neumorphism have accessibility concerns?", answer: "Yes, the low contrast between elements and backgrounds can fail WCAG AA standards. The tool includes a contrast checker that warns when foreground text fails accessibility guidelines." }
    ]
  },

  "memorable-password-generator": {
    instructions: [
      { title: "1. Choose Password Strategy", desc: "Select word-based (XKCD-style: correct-horse-battery-staple), passphrase, or pattern-based." },
      { title: "2. Configure Words and Separators", desc: "Set number of words (3–8), word length range (4–10 chars), and separator (hyphen, dot, space, number)." },
      { title: "3. Add Complexity", desc: "Toggle capitalize words, add digits, add special chars, or leet-speak substitutions for additional entropy." }
    ],
    faqs: [
      { question: "How does the XKCD-style password strategy achieve security with memorability?", answer: "Four random common words from a 7776-word dictionary (Diceware) create ~52 bits of entropy. Each word is a memorable unit, making the password easier to remember than a random 8-character string with similar entropy." },
      { question: "What word list does the tool use for generating memorable passwords?", answer: "The tool uses the EFF large wordlist (7776 words), the EFF short wordlist (1296 words), and Diceware. You can also import a custom word list." },
      { question: "How does adding a single random digit affect entropy?", answer: "Adding one random digit at a random position multiplies the search space by 10× (position) × 10× (digit value) = 100×, adding ~6.6 bits of entropy. The tool shows the entropy contribution of each complexity option." }
    ]
  },

  // ===========================================================================
  // VALIDATORS & CHECKERS (55)
  // ===========================================================================

  "diff-checker": {
    instructions: [
      { title: "1. Paste Original Text", desc: "Enter the original/left version of your text in the first panel. Supports plain text, code, JSON, or configuration files." },
      { title: "2. Paste Modified Text", desc: "Enter the modified/right version in the second panel. The tool compares character by character on paste." },
      { title: "3. Review Differences", desc: "View highlighted additions (green) and deletions (red). Toggle unified diff, side-by-side, or inline view." }
    ],
    faqs: [
      { question: "What diff algorithm does this tool use?", answer: "The tool uses Myers' diff algorithm for optimal line-level diffs and a refined word-level diff for inline highlighting. It handles large files up to 500 KB efficiently." },
      { question: "Can I ignore whitespace differences in the comparison?", answer: "Yes, enable the 'Ignore whitespace' toggle to strip trailing/leading whitespace, normalize line endings, and collapse multiple spaces before computing the diff." },
      { question: "How do I export the diff as a unified patch file?", answer: "Click Export and select 'Unified Patch' format. The output follows the standard diff -u format with context lines, usable with git apply or patch." }
    ]
  },

  "regex-tester": {
    instructions: [
      { title: "1. Enter Regular Expression", desc: "Type your regex pattern (without delimiters). Select flags: g (global), i (case-insensitive), m (multiline), s (dotall), u (unicode), y (sticky)." },
      { title: "2. Enter Test String", desc: "Paste your test string in the input area. Matches are highlighted in real time as you type the regex." },
      { title: "3. Analyze Match Groups", desc: "View each match with its capturing groups, named groups, and positions. The tool also shows the match explanation in plain English." }
    ],
    faqs: [
      { question: "What regex engine does this tester use?", answer: "The tool uses the JavaScript (ECMAScript) regex engine via RegExp. This supports lookahead (?=), lookbehind (?<=), named groups (?<name>), and Unicode property escapes (\\p{L})." },
      { question: "How do backreferences work differently in JS vs PCRE?", answer: "JavaScript supports backreferences to capturing groups (\\1, \\2) but does not support subroutine calls or recursive patterns (?R) that PCRE supports." },
      { question: "Can I test regex against multiple strings at once?", answer: "Yes, use the multi-line mode where each line of the test area is treated as a separate test string. The tool shows per-line match/no-match results." }
    ]
  },

  "api-builder": {
    instructions: [
      { title: "1. Set Request Method and URL", desc: "Choose the HTTP method (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS). Enter the full URL including query parameters." },
      { title: "2. Configure Headers and Body", desc: "Add headers as key-value pairs. For POST/PUT, select body format (JSON, form-data, x-www-form-urlencoded, raw text, binary)." },
      { title: "3. Send and Inspect Response", desc: "Click Send to execute the request. View the response status code, headers, body, and timing information." }
    ],
    faqs: [
      { question: "How does the API builder handle authentication (Bearer, Basic, API Key)?", answer: "The tool has an Auth tab where you select Bearer Token, Basic Auth, or API Key. The credentials are automatically added to the request headers." },
      { question: "Can I save requests for later reuse?", answer: "Yes, save requests as named presets in browser localStorage. Organize into collections with folders. Export/import collections as JSON." },
      { question: "Does the tool support GraphQL queries in the request body?", answer: "Yes, select GraphQL as the body type. The tool provides separate fields for the query string and variables, and auto-sets Content-Type: application/json." }
    ]
  },

  "domain-availability-checker": {
    instructions: [
      { title: "1. Enter Domain Name", desc: "Type the domain name (e.g., example.com). The tool checks the TLD and queries DNS for existing records." },
      { title: "2. Select TLDs to Check", desc: "Choose from popular TLDs (.com, .org, .net, .io, .dev, .app) or enter custom TLDs. Bulk check up to 20 TLDs." },
      { title: "3. View Availability Results", desc: "Each domain shows Available (green) or Registered (red). Registered domains include the registrar and expiration date if available via WHOIS." }
    ],
    faqs: [
      { question: "How does the tool determine if a domain is available?", answer: "The tool performs a DNS lookup for NS records. If no nameservers are found and the domain is not in WHOIS, it's likely available. DNS-based checking is faster than WHOIS but may have false negatives for recently registered domains." },
      { question: "Why might a domain show as available but actually be registered?", answer: "DNS caching, propagation delays (new registrations can take 24–48 hours to appear in all DNS servers), and WHOIS throttling can cause false availability. The tool recommends verifying with a registrar." },
      { question: "Can I check domain availability for premium TLDs like .ai or .io?", answer: "Yes, the tool supports 1500+ TLDs. Premium TLDs use the same DNS-based check but may have different registration requirements or pricing." }
    ]
  },

  "ssl-checker": {
    instructions: [
      { title: "1. Enter Server URL", desc: "Type the HTTPS URL (https://example.com) or hostname:port. The tool connects to the server and retrieves the SSL certificate." },
      { title: "2. View Certificate Details", desc: "Review the certificate issuer, subject, validity period (not before/not after), SANs, and signature algorithm." },
      { title: "3. Check Chain and Security", desc: "Verify the certificate chain is complete, check for weak signature algorithms, and ensure the server supports modern TLS protocols." }
    ],
    faqs: [
      { question: "What does the SSL checker validate in a certificate?", answer: "It validates the certificate chain (each cert signed by the next), expiration dates, hostname match (SAN coverage), key strength, and revocation status via CRL/OCSP." },
      { question: "How does the tool detect weak cipher suites?", answer: "The tool attempts connections using known weak ciphers (RC4, 3DES, export-grade) and reports which insecure protocols (SSLv2, SSLv3, TLS 1.0) are enabled." },
      { question: "Can I check if a certificate supports ECC or is ECDSA-signed?", answer: "Yes, the tool displays the public key algorithm (RSA, ECDSA, Ed25519) and curve type (P-256, P-384, P-521) for ECC certificates." }
    ]
  },

  "oauth-state-validator": {
    instructions: [
      { title: "1. Enter State Parameter", desc: "Paste the state parameter value sent in the OAuth authorization request." },
      { title: "2. Enter Returned State", desc: "Paste the state parameter value received in the callback URL after the authorization redirect." },
      { title: "3. Validate Match", desc: "The tool performs a constant-time string comparison to prevent timing attacks. Shows Match or Mismatch result." }
    ],
    faqs: [
      { question: "Why is the OAuth state parameter important for security?", answer: "The state parameter prevents CSRF attacks on OAuth flows. It binds the authorization request to the callback, ensuring that the response corresponds to a request the client initiated." },
      { question: "What is constant-time comparison and why is it used?", answer: "Constant-time comparison ensures the comparison takes the same duration regardless of how many characters match, preventing timing side-channel attacks that could leak the state value character by character." },
      { question: "Can the tool generate a cryptographically random state parameter?", answer: "Yes, the tool has a Generate button that creates a random state using crypto.getRandomValues(), base64url-encoded, suitable for OAuth 2.0 authorization requests." }
    ]
  },

  "cookie-parser": {
    instructions: [
      { title: "1. Paste Cookie Header", desc: "Paste the Cookie or Set-Cookie header string from an HTTP request or response." },
      { title: "2. Auto-Parse Cookies", desc: "The tool automatically parses each cookie name-value pair and extracts attributes (Expires, Max-Age, Domain, Path, Secure, HttpOnly, SameSite)." },
      { title: "3. Inspect Cookie Properties", desc: "Review each cookie's parsed details in a table. Expired cookies are flagged. Security issues (missing Secure, missing HttpOnly on session cookies) are warned." }
    ],
    faqs: [
      { question: "How does the cookie parser handle multiple Set-Cookie headers?", answer: "The tool supports multiple Set-Cookie headers by splitting on newlines or concatenated headers. Each cookie is parsed independently and displayed in its own row." },
      { question: "What is the difference between a session cookie and a persistent cookie?", answer: "A session cookie has no Expires or Max-Age attribute and is deleted when the browser closes. A persistent cookie has an Expires or Max-Age attribute defining its lifetime." },
      { question: "Does the tool detect security misconfigurations in cookies?", answer: "Yes, it flags cookies missing the Secure flag (sent over HTTP), missing HttpOnly (accessible to JavaScript), SameSite=None without Secure, and cookies with overly broad Domain attributes." }
    ]
  },

  "html-linter": {
    instructions: [
      { title: "1. Paste HTML Source", desc: "Paste your HTML code into the editor. The tool supports HTML5, XHTML, and legacy HTML doctypes." },
      { title: "2. Run Lint Check", desc: "Click Lint to analyze the HTML. The tool checks for unclosed tags, duplicate IDs, invalid nesting, deprecated attributes, and accessibility violations." },
      { title: "3. Fix Errors", desc: "Each error links to the problematic line. Use the Auto-fix button for common issues like unclosed tags or incorrect boolean attributes." }
    ],
    faqs: [
      { question: "What HTML linting rules does this tool enforce?", answer: "Rules include: void elements must not have content, ID uniqueness, valid ARIA attributes, heading hierarchy (h1-h6), img alt text, label-for associations, and deprecated tag detection." },
      { question: "Does the linter check for accessibility (a11y) issues?", answer: "Yes, it checks WCAG 2.1 AA requirements: missing alt text on images, missing form labels, insufficient color contrast (when CSS is included), missing lang attribute, and non-semantic structure." },
      { question: "Can I customize which linting rules to enable or disable?", answer: "Yes, the tool has a Rules panel where you can toggle individual rules on/off. Rule configurations can be saved as presets for different projects." }
    ]
  },

  "har-analyzer": {
    instructions: [
      { title: "1. Upload HAR File", desc: "Upload a .har file exported from Chrome DevTools, Firefox, or other browser devtools." },
      { title: "2. Review Request Timeline", desc: "View each request's waterfall timeline showing DNS lookup, TCP connect, TLS handshake, request send, waiting (TTFB), content download." },
      { title: "3. Analyze Performance Metrics", desc: "Review page load time, total requests, total size, slowest requests, and blocking time. Red-highlighted requests exceed recommended thresholds." }
    ],
    faqs: [
      { question: "What is a HAR file and how do I export it from a browser?", answer: "HAR (HTTP Archive) is a JSON-formatted log of all network requests. In Chrome DevTools, go to Network tab, right-click any request, and select 'Save all as HAR with content'." },
      { question: "How does the tool calculate the critical rendering path?", answer: "It identifies render-blocking resources (CSS, fonts, synchronous JS in the head) and calculates how much of the page load is consumed by blocking requests." },
      { question: "Can I compare two HAR files to find performance regressions?", answer: "Yes, load two HAR files and enable Compare Mode. The tool shows per-resource differences in load time, size, and timing breakdowns." }
    ]
  },

  "log-analyzer": {
    instructions: [
      { title: "1. Upload or Paste Log File", desc: "Paste log text or upload a .log/.txt file. The tool supports common log formats: Apache, Nginx, Syslog, JSON logs, and custom formats." },
      { title: "2. Set Log Format Pattern", desc: "Select from predefined formats (Common Log Format, Combined Log Format) or define a custom regex pattern to parse each line." },
      { title: "3. Review Parsed Entries", desc: "View each parsed log entry with extracted fields (timestamp, level, source, message). Use filters to isolate errors, warnings, or specific sources." }
    ],
    faqs: [
      { question: "What log formats does the analyzer support out of the box?", answer: "Pre-built parsers for: Apache/Nginx combined and common log format, Syslog (RFC 3164 and 5424), JSON line logs, Docker container logs, and Python logging format." },
      { question: "Can I search and filter logs by date range or severity?", answer: "Yes, the tool provides date range pickers, severity level filters (INFO, WARN, ERROR, FATAL), source filters, and full-text search with regex support." },
      { question: "How does the tool handle very large log files?", answer: "Files up to 50 MB are processed in chunks with a streaming parser. The UI shows a progress bar. For larger files, it suggests command-line alternatives." }
    ]
  },

  "package-json-validator": {
    instructions: [
      { title: "1. Paste package.json Content", desc: "Paste the contents of your package.json file or upload the file directly." },
      { title: "2. Run Validation", desc: "Click Validate to check the JSON structure, required fields (name, version), and dependency declarations." },
      { title: "3. Review Issues and Suggestions", desc: "View validation errors (red), warnings (yellow), and suggestions (blue). Common issues: missing repository, outdated dependencies, invalid semver ranges." }
    ],
    faqs: [
      { question: "What fields are required in a valid package.json?", answer: "The required fields are name (lowercase, no spaces) and version (valid semver). Strongly recommended: description, main, scripts, license, and repository." },
      { question: "Does the validator check dependency version ranges for security?", answer: "Yes, it flags dependencies using overly broad ranges (*, >1.0.0), dependencies without lockfile entries, and deprecated packages based on npm registry data." },
      { question: "Can the tool validate package-lock.json consistency with package.json?", answer: "Yes, upload both files. The tool checks that every dependency in package.json has a matching entry in package-lock.json." }
    ]
  },

  "aws-iam-policy-analyzer": {
    instructions: [
      { title: "1. Paste IAM Policy JSON", desc: "Paste the AWS IAM policy document (the Statement block or full policy with Version and Statement)." },
      { title: "2. Run Analysis", desc: "Click Analyze to evaluate the policy against AWS best practices. The tool checks for overly permissive statements, wildcard actions, and NotAction misuse." },
      { title: "3. Review Risk Ratings", desc: "Each statement receives a risk rating: Low (restricted), Medium (some wildcards), High (full admin-like access), Critical (star-star)." }
    ],
    faqs: [
      { question: "What does the analyzer flag as overly permissive in IAM policies?", answer: "It flags 'Effect: Allow' with 'Action: *' or 'Action: s3:*' without a specific resource condition, 'Resource: *' with high-privilege actions, and wildcards in the Principal element." },
      { question: "Does the tool check for IAM policy condition key best practices?", answer: "Yes, it recommends using Condition blocks with aws:SourceIp, aws:SourceVpce, aws:MultiFactorAuthPresent, and aws:RequestedRegion for restrictive access." },
      { question: "Can I validate my policy against the AWS IAM policy grammar?", answer: "Yes, the tool validates the JSON structure and checks that Action, Resource, Effect, and Condition use valid values and proper types per the IAM policy language specification." }
    ]
  },

  "tsconfig-analyzer": {
    instructions: [
      { title: "1. Paste tsconfig.json", desc: "Paste your tsconfig.json file or upload it. The tool parses the compilerOptions, include, exclude, and references." },
      { title: "2. Run Analysis", desc: "Click Analyze to evaluate compiler settings against TypeScript best practices for your target." },
      { title: "3. Review Recommendations", desc: "Suggests optimal settings: strict mode, module resolution strategy, target/esModuleInterop, and composite builds for project references." }
    ],
    faqs: [
      { question: "What does the tsconfig analyzer check for common misconfigurations?", answer: "It flags missing strict: true, overly loose target (ES3/ES5 for modern projects), module: 'CommonJS' without esModuleInterop, and missing outDir/rootDir mismatches." },
      { question: "Does the tool suggest TypeScript version-appropriate configurations?", answer: "Yes, it detects the TypeScript version from your config and suggests options appropriate for that version, like verbatimModuleSyntax for TS 5.0+." },
      { question: "Can the analyzer validate project references in composite builds?", answer: "Yes, it checks that referenced projects have composite: true, have correct paths, and that the root tsconfig correctly references sub-projects." }
    ]
  },

  "string-template-tester": {
    instructions: [
      { title: "1. Enter Template String", desc: "Paste your template string with placeholders ({{name}}, {0}, %s, $variable, or custom syntax)." },
      { title: "2. Provide Test Variables", desc: "Enter variable values as JSON or key-value pairs. The tool supports multiple template syntaxes." },
      { title: "3. Render and Compare", desc: "Click Render to see the filled template. The side-by-side view shows the template and the rendered result." }
    ],
    faqs: [
      { question: "What template syntaxes does this tester support?", answer: "It supports Mustache/Handlebars ({{var}}), sprintf (%s, %d), ES6 template literals (${var}), Python format ({0}, {name}), Go templates, and custom delimiters." },
      { question: "How does the tool handle undefined or missing variables?", answer: "Missing variables are highlighted in the output with a red badge. You can configure the behavior: throw error, leave placeholder, or substitute empty string." },
      { question: "Can I test nested template expressions?", answer: "Yes, but only for syntaxes that support them (Handlebars with dot notation {{user.name}}, ES6 with expression support). The tool shows a parse tree of nested placeholders." }
    ]
  },

  "api-tester": {
    instructions: [
      { title: "1. Configure Request", desc: "Set HTTP method, URL, headers, query parameters, and body. Import from curl command." },
      { title: "2. Set Authentication", desc: "Configure Auth: Bearer Token, Basic Auth, API Key (header or query param), OAuth 2.0, or digest auth." },
      { title: "3. Send and Validate Response", desc: "Click Send. View status code, response headers, body, and timing. Run automated assertions on the response." }
    ],
    faqs: [
      { question: "How does the API tester support environment variables?", answer: "Define environment variables ({{base_url}}, {{token}}) and switch between environments (dev, staging, prod) without changing request configurations." },
      { question: "Can I chain requests where the response of one feeds into another?", answer: "Yes, use the Post-request Script tab to extract values from the response (JSONPath or regex) and store them as variables for subsequent requests." },
      { question: "Does the tool support WebSocket or SSE endpoints?", answer: "The REST API tester supports HTTP only. For WebSocket testing, use the dedicated WebSocket tool. SSE (Server-Sent Events) are partially supported via EventSource." }
    ]
  },

  "api-payload-analyzer": {
    instructions: [
      { title: "1. Paste API Request/Response Body", desc: "Paste the JSON, XML, or form-data payload from an API request or response." },
      { title: "2. Analyze Structure", desc: "The tool dissects the payload: total size, nesting depth, number of fields, data types, array sizes, and null values." },
      { title: "3. Review Optimization Hints", desc: "Get suggestions: large arrays that could be paginated, deeply nested objects that could be flattened, duplicate data, oversized numeric precision." }
    ],
    faqs: [
      { question: "What payload format analysis does this tool perform?", answer: "It calculates payload size (bytes), field count, nesting depth, array lengths, null/empty value ratios, and type distribution across the payload." },
      { question: "How does the tool identify redundant or duplicated data?", answer: "It compares values across sibling objects in arrays and reports fields with identical values for all records (potential normalization candidates)." },
      { question: "Can the analyzer estimate the performance impact of the payload?", answer: "Yes, it estimates parse time based on field count, serialization/deserialization overhead, and bandwidth cost at different API call volumes." }
    ]
  },

  "api-key-validator": {
    instructions: [
      { title: "1. Enter API Key", desc: "Paste the API key string to validate. The tool checks format, length, and character set." },
      { title: "2. Select Key Format", desc: "Choose the expected format: Stripe-style (sk_live_...), UUID, base64, hex, JWT, or custom regex pattern." },
      { title: "3. Validate and Verify", desc: "The tool validates structural correctness. If a checksum is present (e.g., Luhn), it's verified. Entropy is calculated and displayed." }
    ],
    faqs: [
      { question: "What makes an API key structurally valid but not necessarily active?", answer: "Structural validation checks format (length, character set, prefix, checksum) but does not check against a live database. A key can be structurally valid but revoked." },
      { question: "How does the tool calculate and display key entropy?", answer: "Entropy is calculated as log2(character_set_size^length). The tool shows bits of entropy and compares it to the recommended minimum (128 bits for security keys)." },
      { question: "Can the tool detect API key prefixes from known providers?", answer: "Yes, it maintains a database of known prefixes: sk_live_ (Stripe), gh_ (GitHub), AKIA (AWS), pk_ (Stripe publishable), and more." }
    ]
  },

  "graphql-schema-validator": {
    instructions: [
      { title: "1. Paste GraphQL Schema", desc: "Paste your GraphQL schema in SDL (Schema Definition Language) format." },
      { title: "2. Run Validation", desc: "Click Validate to check the schema against the GraphQL specification rules." },
      { title: "3. Review Errors", desc: "See validation errors like duplicate types, missing input types, invalid directive usage, unresolvable field types." }
    ],
    faqs: [
      { question: "What GraphQL spec rules does this validator check?", answer: "It checks type name uniqueness, field name collisions (within a type), interface implementation completeness, valid default values, and circular reference detection." },
      { question: "Does the validator check for schema federation compatibility?", answer: "Yes, in Federation mode it validates @key, @external, @provides, @requires directives and checks entity type definitions for Apollo Federation compatibility." },
      { question: "Can the tool suggest performance improvements for the schema?", answer: "Yes, it flags types without pagination arguments, fields returning large lists without max results, and nested query depths that could cause expensive joins." }
    ]
  },

  "graphql-tester": {
    instructions: [
      { title: "1. Enter GraphQL Endpoint", desc: "Type the GraphQL API endpoint URL (e.g., https://api.example.com/graphql)." },
      { title: "2. Write Query or Mutation", desc: "Enter the GraphQL query/mutation string and variables (JSON). Use the schema explorer to autocomplete fields." },
      { title: "3. Execute and View Response", desc: "Click Execute to run the query. View formatted JSON response, response time, and query complexity estimation." }
    ],
    faqs: [
      { question: "How does the tester estimate query complexity?", answer: "It estimates complexity based on field count, nesting depth, list sizes, and the query cost per field (default cost 1, configurable via directives)." },
      { question: "Can I test subscriptions with this tool?", answer: "Yes, the tool supports WebSocket-based GraphQL subscriptions. Connect to the subscription endpoint, send the subscription query, and view real-time events." },
      { question: "Does the tool generate query documentation from the schema?", answer: "Yes, it introspects the schema and generates field documentation including types, descriptions, deprecation notices, and argument definitions." }
    ]
  },

  "soap-api-tester": {
    instructions: [
      { title: "1. Enter WSDL URL", desc: "Provide the WSDL URL of the SOAP web service. The tool fetches and parses the WSDL to extract operations." },
      { title: "2. Select Operation", desc: "Choose a SOAP operation from the parsed list. The tool generates the SOAP envelope XML with placeholders." },
      { title: "3. Fill Parameters and Send", desc: "Enter values for the SOAP request parameters. Click Send to execute. View the SOAP response XML and HTTP status." }
    ],
    faqs: [
      { question: "How does the SOAP tester handle WS-Security headers?", answer: "It supports UsernameToken, X.509 certificate, and SAML assertion security headers. Configure them in the Security tab before sending." },
      { question: "What XML namespaces does the tester handle automatically?", answer: "It processes SOAP 1.1 (http://schemas.xmlsoap.org/soap/envelope/) and SOAP 1.2 (http://www.w3.org/2003/05/soap-envelope) namespaces." },
      { question: "Can the tool validate SOAP responses against the WSDL schema?", answer: "Yes, it performs XML schema validation of the response against the types defined in the WSDL's schema section." }
    ]
  },

  "openapi-validator": {
    instructions: [
      { title: "1. Upload OpenAPI Spec", desc: "Upload or paste your OpenAPI 3.0/3.1 specification in YAML or JSON format." },
      { title: "2. Run Validation", desc: "Click Validate to check the spec against the OpenAPI specification rules." },
      { title: "3. Review Issues", desc: "See errors (missing fields, invalid types), warnings (missing descriptions, unused components), and suggestions." }
    ],
    faqs: [
      { question: "What does the OpenAPI validator check beyond JSON schema validity?", answer: "It checks path uniqueness, operationId uniqueness, parameter name collision prevention, valid HTTP status codes, response structure completeness, and security scheme definitions." },
      { question: "Does the validator catch circular $ref issues?", answer: "Yes, it detects circular $ref chains that could cause infinite loops in code generators and reports the path of the circular dependency." },
      { question: "Can the tool validate that all examples match their declared schemas?", answer: "Yes, it checks that example values in parameters, request bodies, and responses are valid against their declared schemas." }
    ]
  },

  "webhook-tester": {
    instructions: [
      { title: "1. Generate Webhook URL", desc: "Click to generate a unique webhook testing URL. This URL receives incoming webhook requests." },
      { title: "2. Send Webhook Payload", desc: "Send a POST request from your application to the generated URL. The tool captures the raw request." },
      { title: "3. Inspect Captured Webhook", desc: "View the request method, headers, body, timestamp, and source IP of each received webhook." }
    ],
    faqs: [
      { question: "How long does the generated webhook URL remain active?", answer: "The URL is valid for 1 hour from creation. All captured requests are deleted after that. You can extend the lifetime or generate a new URL anytime." },
      { question: "Can I simulate delayed or failed webhook deliveries?", answer: "Yes, the tool has a simulation mode that sends webhooks with configurable delays, retry attempts, and failure responses for testing your retry logic." },
      { question: "Does the webhook tester provide request inspection with highlighting?", answer: "Yes, captured requests are displayed with syntax-highlighted JSON/XML bodies, parsed headers in table format, and timing information." }
    ]
  },

  "webhook-validator": {
    instructions: [
      { title: "1. Paste Webhook Payload", desc: "Paste the webhook request body (raw JSON or XML) received from the provider." },
      { title: "2. Enter Signature Details", desc: "Enter the signature header value (X-Signature, X-Hub-Signature, etc.) and the shared secret." },
      { title: "3. Validate Signature", desc: "Click Validate to compute the expected signature and compare against the provided value." }
    ],
    faqs: [
      { question: "What webhook signing schemes does this tool support?", answer: "It supports HMAC-SHA256 (Stripe, GitHub, SendGrid), HMAC-SHA1 (GitHub legacy), HMAC-SHA512, and RSA signatures with configurable encoding (hex, base64)." },
      { question: "How does timestamp tolerance in webhook signatures work?", answer: "Many providers include a timestamp in the signature payload to prevent replay attacks. The tool checks if the timestamp is within a configurable tolerance window." },
      { question: "What is the correct way to extract the signing payload from the request body?", answer: "The tool shows the exact signing string construction for each provider, including whether the raw body is used or a specific subset of fields." }
    ]
  },

  "api-diff-checker": {
    instructions: [
      { title: "1. Paste Original API Spec", desc: "Paste the original/old version of your OpenAPI spec (YAML or JSON)." },
      { title: "2. Paste New API Spec", desc: "Paste the modified/new version of your OpenAPI spec." },
      { title: "3. View Diff Report", desc: "The tool compares both specs and generates a diff categorized as: Added, Removed, or Changed endpoints and schemas." }
    ],
    faqs: [
      { question: "How does the diff checker categorize API changes?", answer: "Changes are classified as: Breaking (removed endpoint, removed required field, changed type), Non-breaking (added endpoint, added optional field), and Unclassified (description changes)." },
      { question: "Can the tool detect if a change is backward-compatible?", answer: "Yes, it applies OpenAPI backward-compatibility rules: adding optional fields is safe, removing any field is breaking, narrowing a type is breaking." },
      { question: "Does the diff checker support both OpenAPI 3.0 and 3.1?", answer: "Yes, it detects the OpenAPI version from each spec and normalizes them to a common representation for comparison." }
    ]
  },

  "csv-analyzer": {
    instructions: [
      { title: "1. Upload or Paste CSV Data", desc: "Paste CSV text or upload a .csv file. The tool auto-detects the delimiter (comma, tab, semicolon, pipe)." },
      { title: "2. View Column Analysis", desc: "For each column, the tool shows: data type, unique values, null count, min/max (for numbers), and distribution." },
      { title: "3. Generate Summary Statistics", desc: "View row count, column count, memory estimate, and per-column statistics." }
    ],
    faqs: [
      { question: "How does the CSV analyzer detect column data types?", answer: "It samples the first 100 rows and attempts to parse each column as number, date, boolean, or string. The type with the highest successful parse rate is assigned." },
      { question: "Does the tool detect encoding issues in CSV files?", answer: "Yes, it detects UTF-8, UTF-16, Latin-1, and common encoding mismatches. Invalid characters are highlighted and the tool suggests the correct encoding." },
      { question: "Can the analyzer handle CSV files with quoted fields containing delimiters?", answer: "Yes, it properly parses RFC 4180 CSV format including quoted fields, escaped quotes (\"\"), and multiline quoted fields." }
    ]
  },

  "json-diff-checker": {
    instructions: [
      { title: "1. Paste Original JSON", desc: "Paste the original JSON document in the left panel." },
      { title: "2. Paste Modified JSON", desc: "Paste the modified JSON document in the right panel." },
      { title: "3. View Structural Diff", desc: "See added fields (green), removed fields (red), and changed values (yellow) with path locations." }
    ],
    faqs: [
      { question: "How does the JSON diff checker handle array ordering?", answer: "By default it uses index-based comparison. Toggle 'Smart Array Diff' to match objects by ID key fields and show moved/reordered items." },
      { question: "Can the tool ignore specified paths during comparison?", answer: "Yes, use the ignore path feature (e.g., $.metadata.timestamp, $.version) to exclude volatile fields like timestamps from the diff." },
      { question: "What JSON depth does the diff checker support?", answer: "It handles arbitrarily nested JSON up to 100 levels deep. Circular references are detected and flagged with a warning." }
    ]
  },

  "ssl-tls-checker": {
    instructions: [
      { title: "1. Enter Hostname and Port", desc: "Type the server hostname (example.com) and port (default 443 for HTTPS)." },
      { title: "2. Run TLS Scan", desc: "Click Scan to test the server's TLS configuration. The tool connects using various protocol versions and cipher suites." },
      { title: "3. Review Security Grade", desc: "View a grade (A+ to F) based on protocol support, cipher strength, key exchange, and known vulnerability status." }
    ],
    faqs: [
      { question: "What TLS protocols does the checker test for?", answer: "It tests for SSL 2.0, SSL 3.0, TLS 1.0, TLS 1.1, TLS 1.2, and TLS 1.3 support. Modern servers should only support TLS 1.2 and 1.3." },
      { question: "How does the tool check for known TLS vulnerabilities?", answer: "It tests for Heartbleed (CVE-2014-0160), POODLE (CVE-2014-3566), BEAST, CRIME, Logjam, FREAK, and ROBOT vulnerabilities." },
      { question: "Can the tool test SMTP, IMAP, or POP3 TLS configurations?", answer: "Yes, select from STARTTLS for SMTP (port 587), IMAP (port 143), POP3 (port 110), or direct TLS modes." }
    ]
  },

  "http-security-checker": {
    instructions: [
      { title: "1. Enter Website URL", desc: "Type the full URL (https://example.com) to check its HTTP security headers." },
      { title: "2. Scan Headers", desc: "The tool sends a request to the URL and analyzes the response headers for security configurations." },
      { title: "3. Review Security Report", desc: "Each header gets a pass/fail/warning status with explanation and remediation steps for missing or misconfigured headers." }
    ],
    faqs: [
      { question: "What HTTP security headers does the checker validate?", answer: "It checks: Strict-Transport-Security (HSTS), X-Frame-Options, X-Content-Type-Options, Content-Security-Policy, X-XSS-Protection, Referrer-Policy, Permissions-Policy, and Cache-Control." },
      { question: "How does the tool grade the HSTS configuration?", answer: "It checks max-age (recommended >= 1 year = 31536000), includeSubDomains, preload directive, and whether the header is sent on HTTP first." },
      { question: "Does the checker provide remediation code snippets?", answer: "Yes, each failed check includes a code snippet showing the correct header configuration for Nginx, Apache, and application-level frameworks." }
    ]
  },

  "xss-protection-checker": {
    instructions: [
      { title: "1. Enter Input String", desc: "Paste the user input string or HTML fragment you want to test for XSS vulnerabilities." },
      { title: "2. Select Context", desc: "Choose where the input appears: HTML body, HTML attribute, JavaScript string, CSS value, or URL parameter." },
      { title: "3. Test Escape Methods", desc: "Apply different encoding/escaping methods (HTML entity, JS string, URL encoding) and see if the input can break out." }
    ],
    faqs: [
      { question: "What types of XSS does this checker simulate?", answer: "It tests for Reflected XSS (input echoed immediately), Stored XSS (persistent injection), DOM-based XSS (client-side execution), and Mutation XSS." },
      { question: "How does the context selector affect the escaping requirements?", answer: "Each context has different escaping rules: HTML body needs &<>\" escaping, JavaScript string needs \\n\\'\\\" escaping, URL needs percent encoding." },
      { question: "Can the tool generate safe output examples with proper escaping?", answer: "Yes, after detecting the context, it shows the correctly escaped output using the appropriate encoding scheme for that context." }
    ]
  },

  "csp-policy-validator": {
    instructions: [
      { title: "1. Paste CSP Header Value", desc: "Paste the Content-Security-Policy header value (the policy directive string)." },
      { title: "2. Run Validation", desc: "Click Validate to check the policy syntax against the CSP specification." },
      { title: "3. Review Issues", desc: "See syntax errors, deprecated directives, missing required directives, and overly permissive source expressions." }
    ],
    faqs: [
      { question: "What CSP syntax errors does the validator detect?", answer: "It detects invalid directive names, missing semicolons, invalid source expressions (e.g., 'self' instead of 'self'), unquoted nonce values, and malformed hash sources." },
      { question: "Does the tool check for CSP bypass techniques?", answer: "Yes, it warns about known bypass issues: script-src with 'unsafe-inline', JSONP endpoints in script-src, and overly broad CDN origins." },
      { question: "Can the validator suggest a stricter CSP based on current usage?", answer: "Yes, the 'Suggest Strict CSP' feature generates a nonce-based strict CSP from your current policy, removing all unsafe expressions." }
    ]
  },

  "tls-cipher-checker": {
    instructions: [
      { title: "1. Enter Hostname", desc: "Type the server hostname to check supported cipher suites." },
      { title: "2. Run Cipher Scan", desc: "The tool attempts connections using cipher suites from multiple categories (modern, intermediate, legacy)." },
      { title: "3. View Supported Ciphers", desc: "Each cipher is listed with its status (supported/not supported), key exchange, authentication, encryption, and MAC algorithm." }
    ],
    faqs: [
      { question: "What cipher categories does the tool test against?", answer: "It tests against Mozilla's recommended sets: Modern (TLS 1.3 only, AEAD ciphers), Intermediate (compatible with most clients), and Old (legacy support)." },
      { question: "How does the checker identify weak or deprecated ciphers?", answer: "It flags ciphers using RC4, DES, 3DES, CBC mode in TLS 1.0/1.1, export-grade ciphers, and those vulnerable to Lucky13, BEAST, or POODLE attacks." },
      { question: "Can the tool test both TLS 1.2 and TLS 1.3 cipher suites?", answer: "Yes, TLS 1.2 ciphers are tested individually. TLS 1.3 uses a fixed set (TLS_AES_128_GCM_SHA256, TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256)." }
    ]
  },

  "ip-reputation-checker": {
    instructions: [
      { title: "1. Enter IP Address", desc: "Type an IPv4 or IPv6 address to check its reputation." },
      { title: "2. Run Reputation Check", desc: "The tool queries multiple threat intelligence sources and DNS blocklists." },
      { title: "3. Review Report", desc: "View the IP's reputation score, blocklist status, geolocation, ASN, and any associated threat categories." }
    ],
    faqs: [
      { question: "What reputation data sources does this tool query?", answer: "It checks against DNSBLs (Spamhaus, Barracuda, SURBL), known botnet lists, open proxy lists, and IP reputation databases." },
      { question: "How is the reputation score calculated?", answer: "The score (0–100) is calculated from: number of blocklists the IP appears on (weighted by list credibility), historical abuse data, and ASN-level reputation." },
      { question: "Does the tool show the IP's ASN and hosting provider?", answer: "Yes, it performs a WHOIS and ASN lookup to identify the ISP or hosting provider, data center, and IP allocation date." }
    ]
  },

  "email-format-validator": {
    instructions: [
      { title: "1. Enter Email Address", desc: "Type or paste one or more email addresses to validate (one per line)." },
      { title: "2. Run Validation", desc: "Click Validate to check each address against RFC 5321/5322 syntax rules." },
      { title: "3. Review Results", desc: "Each email shows valid/invalid status with specific error messages for invalid addresses." }
    ],
    faqs: [
      { question: "What RFC rules does the email validator check?", answer: "It checks local part rules (allowed characters, dot handling, quoted strings), domain rules (valid labels, TLD existence, DNS MX records), and total length." },
      { question: "Does the validator check if the email domain has an MX record?", answer: "Yes, optionally perform DNS MX record lookup to verify the domain can receive mail. This is an extra check beyond syntax validation." },
      { question: "How does the tool handle internationalized email addresses (EAI)?", answer: "It validates UTF-8 characters in the local part (RFC 6531) and converts IDN domains to Punycode for DNS checking." }
    ]
  },

  "syntax-validator": {
    instructions: [
      { title: "1. Select Programming Language", desc: "Choose the language: JavaScript, TypeScript, Python, Ruby, PHP, Go, Rust, Java, C++, or C." },
      { title: "2. Paste Source Code", desc: "Paste your code into the editor. The tool parses it using the appropriate parser." },
      { title: "3. Run Validation", desc: "Click Validate to check for syntax errors. Errors include line number, column, and error message." }
    ],
    faqs: [
      { question: "What parsers does the syntax validator use for each language?", answer: "JavaScript/TypeScript uses acorn, Python uses a CPython-compatible parser, Ruby uses MRI parser, Go uses Go's own parser, Rust uses syn." },
      { question: "Does the validator check for more than just syntax errors?", answer: "Yes, it also flags unused variables, unreachable code, missing imports, and potential type errors for TypeScript." },
      { question: "Can the tool validate code against a specific language version (ES2020, Python 3.12)?", answer: "Yes, select the language version. The parser uses the appropriate grammar rules for that version." }
    ]
  },

  "yaml-syntax-validator": {
    instructions: [
      { title: "1. Paste YAML Content", desc: "Paste your YAML content into the editor. The tool supports YAML 1.1 and 1.2." },
      { title: "2. Run Validation", desc: "Click Validate to check the YAML for syntax errors." },
      { title: "3. Review Issues", desc: "Errors show line number, column, and description. Common issues: incorrect indentation, tab usage, unresolved aliases." }
    ],
    faqs: [
      { question: "What YAML syntax errors does this validator detect?", answer: "It detects: inconsistent indentation, tabs (not allowed in YAML), duplicate keys, unresolved anchors/aliases, invalid scalars, and improper quoting." },
      { question: "Does the validator distinguish between YAML 1.1 and 1.2 behavior?", answer: "Yes, YAML 1.1 treats yes/no/true/false as booleans, while 1.2 only treats true/false as booleans. The validator flags these differences." },
      { question: "Can the tool convert the validated YAML to JSON?", answer: "Yes, after validation, click 'Convert to JSON' to see the equivalent JSON representation of your YAML document." }
    ]
  },

  "git-commit-linter": {
    instructions: [
      { title: "1. Enter Commit Message", desc: "Paste your git commit message (subject line and optional body)." },
      { title: "2. Select Lint Rules", desc: "Choose rules to apply: conventional commits format, subject line length (50 chars), body wrap (72 chars), imperative mood." },
      { title: "3. Review Lint Results", desc: "Each rule shows pass/fail with suggestion for fixing violations." }
    ],
    faqs: [
      { question: "What commit message conventions does this linter check?", answer: "It checks: Conventional Commits (type(scope): description), Git standard (subject ≤50 chars, body wrap at 72), and Angular commit convention." },
      { question: "How does the linter validate the imperative mood?", answer: "It checks that the subject line starts with a verb in imperative tense (Add, Fix, Update, Remove) rather than past tense (Added, Fixed) or gerunds (Adding, Fixing)." },
      { question: "Can the tool auto-fix commit message formatting issues?", answer: "Yes, individual violations have auto-fix buttons that reformat the message to comply with the selected convention." }
    ]
  },

  "http-header-analyzer": {
    instructions: [
      { title: "1. Paste HTTP Headers", desc: "Paste the raw HTTP request or response headers as a string." },
      { title: "2. Parse and Analyze", desc: "The tool parses each header, identifies security implications, and checks for proper formatting." },
      { title: "3. Review Header Map", desc: "Each header is displayed with its parsed value, RFC reference, and security recommendation." }
    ],
    faqs: [
      { question: "What analysis does the HTTP header analyzer perform on each header?", answer: "It validates header syntax, checks for deprecated headers (P3P, X-XSS-Protection), recommends replacements, and identifies security misconfigurations." },
      { question: "Does the tool detect malformed or duplicate headers?", answer: "Yes, it flags duplicate header names, malformed header line format (missing colon), and invalid characters in header names." },
      { question: "Can the analyzer suggest cache optimization headers?", answer: "Yes, it recommends Cache-Control directives based on the content type and suggests ETag/Last-Modified configuration." }
    ]
  },

  "http-status-code-checker": {
    instructions: [
      { title: "1. Enter URL or Status Code", desc: "Enter a URL to check its response status code, or type a specific status code number to see its details." },
      { title: "2. Scan URL (Optional)", desc: "If a URL is provided, the tool sends a HEAD/GET request and displays the status code." },
      { title: "3. View Status Code Details", desc: "For any code, view its class (1xx–5xx), RFC reference, standard description, and common causes." }
    ],
    faqs: [
      { question: "How does the tool categorize HTTP status codes?", answer: "It categorizes by class: 1xx (Informational), 2xx (Success), 3xx (Redirection), 4xx (Client Error), 5xx (Server Error), with specific notes for each." },
      { question: "Does the checker follow redirects to determine the final status code?", answer: "Optionally, enable 'Follow Redirects' to trace the redirect chain and show the final status code with each intermediate redirect." },
      { question: "Can the tool suggest fixes for non-200 status codes?", answer: "Yes, for common error codes (404, 403, 500, 502, 503), it provides troubleshooting steps and configuration advice." }
    ]
  },

  "yaml-validator": {
    instructions: [
      { title: "1. Paste YAML Data", desc: "Paste your YAML content. The tool supports anchors, aliases, multi-line strings, and complex mappings." },
      { title: "2. Run Validation", desc: "Click Validate to check syntax and structure according to YAML spec." },
      { title: "3. View Errors and Warnings", desc: "Errors include line and column numbers. Warnings cover best practices like implicit typing concerns." }
    ],
    faqs: [
      { question: "What is the difference between this YAML validator and the syntax validator?", answer: "This validator focuses on YAML-specific constructs: anchor resolution, tag handling, schema validation, and type coercion warnings." },
      { question: "Does the tool validate YAML against a JSON Schema?", answer: "Yes, paste a JSON Schema alongside your YAML to validate the structure, required fields, and data types." },
      { question: "Can the validator handle multi-document YAML (--- separator)?", answer: "Yes, it parses and validates each document in a multi-document YAML stream independently." }
    ]
  },

  "robots-txt-validator": {
    instructions: [
      { title: "1. Paste robots.txt Content", desc: "Paste the contents of your robots.txt file or enter a URL to fetch it." },
      { title: "2. Run Validation", desc: "Click Validate to check the file against the Robots Exclusion Protocol standard." },
      { title: "3. Review Validation Report", desc: "See errors (invalid directives), warnings (missing sitemap), and a summary of which paths are blocked for each user-agent." }
    ],
    faqs: [
      { question: "What robots.txt syntax does the validator check?", answer: "It validates User-agent, Disallow, Allow, Sitemap, Crawl-delay directives, and wildcard pattern syntax." },
      { question: "Does the tool simulate how specific search engine bots interpret the file?", answer: "Yes, select a user-agent (Googlebot, Bingbot, etc.) to see which paths are blocked/allowed for that specific crawler." },
      { question: "Can the validator detect accidentally disallowing important paths?", answer: "Yes, it flags common mistakes: Disallow: / (blocks everything), blocking CSS/JS files (renders poorly in search results), and conflicting directives." }
    ]
  },

  "dns-record-validator": {
    instructions: [
      { title: "1. Enter DNS Record Data", desc: "Paste DNS record values to validate: A, AAAA, CNAME, MX, TXT, SRV, or SOA records." },
      { title: "2. Select Record Type", desc: "Choose the record type you want to validate." },
      { title: "3. Validate Format", desc: "The tool checks that the record value follows the correct format for the selected type." }
    ],
    faqs: [
      { question: "What format validation does the tool perform for each DNS record type?", answer: "A records must be valid IPv4, AAAA must be valid IPv6, CNAME must be a valid domain, MX must have priority + domain, TXT must be properly quoted." },
      { question: "Does the validator check that CNAME records don't coexist with other records?", answer: "Yes, it warns when a CNAME would conflict with other record types at the same name per RFC 1912." },
      { question: "Can the tool validate SPF and DKIM DNS records specifically?", answer: "Yes, for TXT records it can parse SPF syntax (ip4, include, a, mx, all mechanisms) and DKIM tag=value format." }
    ]
  },

  "docker-compose-validator": {
    instructions: [
      { title: "1. Paste docker-compose.yml", desc: "Paste your docker-compose file content (YAML format). Supports version 2 and 3 formats." },
      { title: "2. Run Validation", desc: "Click Validate to check the file against the Docker Compose specification." },
      { title: "3. Review Issues", desc: "Errors include missing required fields, invalid service names, and unsupported options for the specified version." }
    ],
    faqs: [
      { question: "What Docker Compose validation rules does this tool check?", answer: "It checks service definition completeness, valid image names, correct port mapping format (host:container), valid volume syntax, and network references." },
      { question: "Does the validator check for deprecated Compose file options?", answer: "Yes, it flags deprecated options like 'links' (use networks), 'volumes_from' (use named volumes), and version 1 format usage." },
      { question: "Can the tool validate environment variable interpolation?", answer: "Yes, it checks that ${VAR} references resolve to defined variables in the environment section or .env file." }
    ]
  },

  "dockerfile-linter": {
    instructions: [
      { title: "1. Paste Dockerfile Content", desc: "Paste your Dockerfile content. The tool supports all Dockerfile instructions." },
      { title: "2. Run Lint Check", desc: "Click Lint to analyze the Dockerfile against best practices." },
      { title: "3. Review Recommendations", desc: "Suggestions cover layer optimization, instruction ordering, security practices, and base image selection." }
    ],
    faqs: [
      { question: "What Dockerfile best practices does the linter enforce?", answer: "It checks: pinning base image tags (not using latest), combining RUN commands to reduce layers, ordering instructions by cacheability, and using .dockerignore." },
      { question: "Does the tool detect security issues in Dockerfiles?", answer: "Yes, it flags: running as root (missing USER instruction), exposing ports without EXPOSE, hardcoded secrets via ENV, and installing unnecessary packages." },
      { question: "Can the linter suggest multi-stage build optimizations?", answer: "Yes, it recommends separating build-time dependencies from runtime dependencies using multi-stage builds and using distroless or alpine base images." }
    ]
  },

  "htaccess-validator": {
    instructions: [
      { title: "1. Paste .htaccess Content", desc: "Paste your .htaccess file content. The tool supports Apache 2.2 and 2.4 directives." },
      { title: "2. Run Validation", desc: "Click Validate to check the syntax against Apache configuration rules." },
      { title: "3. Review Errors", desc: "Errors show line numbers with descriptions. Warnings cover deprecated directives and common misconfigurations." }
    ],
    faqs: [
      { question: "What Apache directives does the htaccess validator check?", answer: "It validates RewriteRule/RewriteCond syntax, Redirect/RedirectMatch, Header directives, ExpiresDefault, and auth directives (Require, AuthType)." },
      { question: "Does the tool detect conflicts between multiple directives?", answer: "Yes, it flags when RewriteRule patterns conflict, when multiple Header directives set the same header, and when allow/deny rules overlap." },
      { question: "Can the validator distinguish between Apache 2.2 and 2.4 syntax?", answer: "Yes, it checks for 2.2-style allow/deny/order vs 2.4-style Require directives, and warns if the syntax doesn't match the selected version." }
    ]
  },

  "kubernetes-yaml-validator": {
    instructions: [
      { title: "1. Paste Kubernetes YAML", desc: "Paste your Kubernetes manifest YAML (Pod, Deployment, Service, Ingress, etc.)." },
      { title: "2. Run Validation", desc: "Click Validate to check against the Kubernetes API schema for the specified apiVersion." },
      { title: "3. Review Errors", desc: "Errors include unknown fields, missing required fields, invalid values, and deprecated apiVersions." }
    ],
    faqs: [
      { question: "What Kubernetes API resources does the validator support?", answer: "It validates all built-in resource types: Pod, Deployment, Service, Ingress, ConfigMap, Secret, PersistentVolume, Namespace, RBAC resources, CRDs." },
      { question: "Does the tool check for Kubernetes security best practices?", answer: "Yes, it flags: containers running as root, privileged containers, missing resource limits, hostPath volumes, and containers with overly broad capabilities." },
      { question: "Can the validator detect deprecated apiVersions?", answer: "Yes, it checks the apiVersion against the current Kubernetes version and warns about deprecated versions like extensions/v1beta1 for Ingress." }
    ]
  },

  "github-actions-validator": {
    instructions: [
      { title: "1. Paste Workflow YAML", desc: "Paste your GitHub Actions workflow YAML content from .github/workflows/." },
      { title: "2. Run Validation", desc: "Click Validate to check the workflow syntax and structure." },
      { title: "3. Review Results", desc: "Errors include invalid trigger events, missing job dependencies, invalid step syntax, and expression parsing errors." }
    ],
    faqs: [
      { question: "What GitHub Actions syntax does this validator check?", answer: "It validates: on triggers (push, pull_request, schedule, workflow_dispatch), job structure, step syntax (uses, run, with), and expression syntax (${{ }})." },
      { question: "Does the tool check for GitHub Actions security best practices?", answer: "Yes, it flags: pinning actions to mutable tags (use SHA instead), overly broad permissions, untrusted input in expressions, and missing checkout step." },
      { question: "Can the validator check if referenced actions exist?", answer: "Yes, it verifies that uses references (actions/checkout@v4) use valid formats and warns if the version or action name looks incorrect." }
    ]
  },

  "geojson-validator": {
    instructions: [
      { title: "1. Paste GeoJSON Data", desc: "Paste your GeoJSON content (Feature, FeatureCollection, or Geometry object)." },
      { title: "2. Run Validation", desc: "Click Validate to check against the GeoJSON specification (RFC 7946)." },
      { title: "3. Review Validation Report", desc: "Errors include invalid geometry types, malformed coordinates, and missing required properties." }
    ],
    faqs: [
      { question: "What GeoJSON validation rules does this tool apply?", answer: "It validates: geometry type (Point, LineString, Polygon, etc.), coordinate array structure, coordinate ranges (lon -180 to 180, lat -90 to 90), and required type/coordinates fields." },
      { question: "Does the tool check for self-intersecting polygons?", answer: "Yes, it validates that polygon rings don't self-intersect and that the exterior ring is oriented counter-clockwise per RFC 7946." },
      { question: "Can the validator visualize the GeoJSON on a map?", answer: "Yes, after validation, click 'Preview on Map' to render the GeoJSON on an interactive map using Leaflet." }
    ]
  },

  "rss-feed-validator": {
    instructions: [
      { title: "1. Paste RSS Feed XML", desc: "Paste your RSS 2.0 or Atom feed XML content." },
      { title: "2. Run Validation", desc: "Click Validate to check against the RSS 2.0 or Atom specification." },
      { title: "3. Review Feed Health", desc: "Errors include missing required elements, invalid date formats, and encoding issues." }
    ],
    faqs: [
      { question: "What RSS validation checks does the tool perform?", answer: "RSS 2.0 checks: required channel elements (title, link, description), item requirements, valid pubDate format, enclosure correctness. Atom checks: feed/entry structure." },
      { question: "Does the validator check feed content against XML well-formedness rules?", answer: "Yes, it validates XML structure including proper nesting, character encoding (UTF-8 required), and CDATA section usage." },
      { question: "Can the tool suggest improvements for feed discoverability?", answer: "Yes, it suggests adding an author element (RSS) or contributor (Atom), language specification, and image/logo for better feed reader display." }
    ]
  },

  "sitemap-validator": {
    instructions: [
      { title: "1. Paste Sitemap XML or URL", desc: "Paste sitemap XML content or enter a sitemap URL to fetch it." },
      { title: "2. Run Validation", desc: "Click Validate to check against the sitemaps.org protocol." },
      { title: "3. Review Sitemap Health", desc: "Errors include invalid URLs, missing required fields, exceeded URL limits, and incorrect date formats." }
    ],
    faqs: [
      { question: "What sitemap validation rules does this tool enforce?", answer: "It validates: XML namespace declaration, location URL validity (absolute URL required), lastmod date format (W3C Datetime), changefreq values, and priority range (0.0–1.0)." },
      { question: "Does the validator check for sitemap index files?", answer: "Yes, it detects sitemap index files (sitemapindex) and validates the child sitemap URLs. It also checks that no sitemap exceeds 50,000 URLs." },
      { question: "Can the tool verify that sitemap URLs are accessible?", answer: "Yes, optionally perform HTTP HEAD/GET on each listed URL to check for 200 OK, 3xx redirects, or 4xx/5xx errors." }
    ]
  },

  "xpath-validator": {
    instructions: [
      { title: "1. Enter XML Content", desc: "Paste your XML document into the XML input field." },
      { title: "2. Enter XPath Expression", desc: "Type the XPath expression (version 1.0 or 2.0 syntax)." },
      { title: "3. Evaluate and View Results", desc: "Click Evaluate to apply the XPath. Results are highlighted in the XML and listed as extracted nodes or values." }
    ],
    faqs: [
      { question: "What XPath versions does the validator support?", answer: "It supports XPath 1.0 (axes, predicates, node tests) and partial XPath 2.0 (sequence types, some functions)." },
      { question: "Does the tool support XPath function library?", answer: "Yes, common functions: string(), concat(), contains(), starts-with(), normalize-space(), count(), sum(), not(), and position()/last()." },
      { question: "Can the validator test multiple XPaths against the same XML?", answer: "Yes, enter multiple XPath expressions (one per line) and see results for each simultaneously." }
    ]
  },

  "cron-expression-validator": {
    instructions: [
      { title: "1. Enter Cron Expression", desc: "Type the cron expression with 5 (standard) or 6 (with seconds) fields separated by spaces." },
      { title: "2. Run Validation", desc: "Click Validate to check the syntax and field values." },
      { title: "3. View Human-Readable Description", desc: "The tool translates the cron expression into plain English (e.g., 'At 14:30 every Monday through Friday')." }
    ],
    faqs: [
      { question: "What cron expression formats does the validator accept?", answer: "It accepts standard Unix (minute hour day month weekday), with seconds (second minute hour day month weekday), and shortcut strings (@yearly, @monthly, @weekly, @daily, @hourly)." },
      { question: "Does the tool validate field ranges correctly?", answer: "Yes, it validates: minute (0–59), hour (0–23), day of month (1–31), month (1–12 or JAN–DEC), day of week (0–7 or SUN–SAT)." },
      { question: "Can the tool generate upcoming fire times for the expression?", answer: "Yes, after validation, click 'View Next 10 Runs' to see the calculated future execution times based on the expression." }
    ]
  },

  "json-size-analyzer": {
    instructions: [
      { title: "1. Paste JSON Data", desc: "Paste your JSON data or upload a .json file." },
      { title: "2. Run Size Analysis", desc: "The tool calculates the size in bytes, characters, and identifies the largest fields and arrays." },
      { title: "3. Review Breakdown", desc: "A treemap or table shows which parts of the JSON contribute most to the total size, helping identify optimization targets." }
    ],
    faqs: [
      { question: "What metrics does the JSON size analyzer calculate?", answer: "It calculates total byte size (raw and minified), number of keys at each level, largest key names, largest values, and array element counts." },
      { question: "Can the tool estimate bandwidth costs at scale?", answer: "Yes, it estimates monthly bandwidth cost based on payload size and request volume (configurable RPM) using typical cloud pricing tiers." },
      { question: "Does the analyzer suggest size reduction strategies?", answer: "Yes, it suggests: shortening key names, removing null/empty fields, deduplicating repeated data, and enabling GZIP/Brotli compression." }
    ]
  },

  "css-validator": {
    instructions: [
      { title: "1. Paste CSS Code", desc: "Paste your CSS code. The tool supports CSS3 and CSS4 (draft) properties." },
      { title: "2. Run Validation", desc: "Click Validate to check property names, values, and syntax against W3C CSS specifications." },
      { title: "3. Review Errors and Warnings", desc: "Errors cover invalid properties or values. Warnings cover vendor prefixes, deprecated properties, and browser compatibility." }
    ],
    faqs: [
      { question: "What CSS validation rules does this tool check?", answer: "It validates: property name existence, value type correctness (e.g., color values, lengths, percentages), shorthand expansion, and at-rule syntax." },
      { question: "Does the validator check browser compatibility for CSS properties?", answer: "Yes, it flags properties with limited browser support and suggests vendor-prefixed alternatives for compatibility." },
      { question: "Can the tool validate CSS custom properties (variables)?", answer: "Yes, it validates var() function syntax, fallback values, and detects undefined custom property references." }
    ]
  },

  "js-syntax-checker": {
    instructions: [
      { title: "1. Paste JavaScript Code", desc: "Paste your JavaScript code. The tool uses acorn for parsing." },
      { title: "2. Select ECMAScript Version", desc: "Choose the ECMAScript version (ES5, ES6/2015, ES2016+, ES2022, or ES2024)." },
      { title: "3. Run Syntax Check", desc: "Click Check Syntax to parse the code. Errors include line and column numbers for each syntax violation." }
    ],
    faqs: [
      { question: "What JavaScript syntax features are checked based on the selected ECMAScript version?", answer: "For ES5: no let/const, no arrow functions, no classes. For ES6+: checks destructuring, spread, generators, modules. For ES2022+: top-level await, class static blocks." },
      { question: "Does the checker detect ASI (automatic semicolon insertion) pitfalls?", answer: "Yes, it flags lines where ASI may cause unexpected behavior: starting with (, [, or ` after a line break without semicolon." },
      { question: "Can the tool detect module import/export syntax issues?", answer: "Yes, it validates import/export declarations, named vs default exports, and module specifier syntax." }
    ]
  },

  "validator-kit": {
    instructions: [
      { title: "1. Select Validator Tool", desc: "Choose from the validator kit: email, phone, URL, credit card, ISBN, UUID, JWT, hex color, or date." },
      { title: "2. Enter Value to Validate", desc: "Type or paste the value to validate against the selected format." },
      { title: "3. View Validation Result", desc: "The tool shows valid/invalid with detailed explanation of the validation rules applied." }
    ],
    faqs: [
      { question: "What validation formats are included in the validator kit?", answer: "Email (RFC 5322), phone (E.164 and national formats), URL (WHATWG URL spec), credit card (Luhn + network detection), ISBN-10/13, UUID v1-v5, JWT (three base64url segments), hex colors, and ISO 8601 dates." },
      { question: "Can the kit validate values in batch mode (multiple values at once)?", answer: "Yes, switch to Batch mode and paste multiple values (one per line). Each value is validated independently with a pass/fail per row." },
      { question: "Does the validator kit suggest auto-corrections for common format mistakes?", answer: "Yes, for some validators (phone, URL, date), it suggests the correct format when the input has a common formatting error." }
    ]
  },

  // ===========================================================================
  // OTHER (38)
  // ===========================================================================

  "chmod-calculator": {
    instructions: [
      { title: "1. Set Permissions via Toggle", desc: "Toggle read/r(4), write/w(2), execute/x(1) for Owner, Group, and Others using checkboxes." },
      { title: "2. View Numeric and Symbolic Modes", desc: "The tool displays the numeric (e.g., 755) and symbolic (e.g., u=rwx,g=rx,o=rx) representations." },
      { title: "3. Set Special Permissions", desc: "Toggle SUID (4), SGID (2), and Sticky bit (1) which modify the leading digit (e.g., 4755 for SUID)." }
    ],
    faqs: [
      { question: "What is the difference between chmod 755 and chmod +x?", answer: "chmod 755 sets exact permissions (owner: rwx, group: rx, others: rx). chmod +x adds execute to the current permissions without changing other bits. 755 is absolute, +x is relative." },
      { question: "What does the SUID bit (chmod 4xxx) do?", answer: "SUID (Set User ID) makes an executable run with the file owner's privileges, not the executing user's. Common on /usr/bin/passwd. The calculator shows the leading digit." },
      { question: "How do sticky bits work on directories?", answer: "The sticky bit (chmod 1xxx) on directories restricts deletion — only the file owner, directory owner, or root can delete files. Commonly used on /tmp." }
    ]
  },

  "email-normalizer": {
    instructions: [
      { title: "1. Enter Email Address", desc: "Type or paste an email address. The tool will apply normalization rules." },
      { title: "2. Select Normalization Rules", desc: "Choose: lowercase domain, remove dots from Gmail local part, remove +tag suffixes, trim whitespace." },
      { title: "3. View Normalized Result", desc: "The tool shows the original and normalized addresses side by side." }
    ],
    faqs: [
      { question: "Why does Gmail ignore dots in the local part of email addresses?", answer: "Gmail treats 'first.last@gmail.com' and 'firstlast@gmail.com' as identical because dots are ignored in Gmail addresses. This tool strips dots from @gmail.com and @googlemail.com addresses." },
      { question: "How does the tool handle +tag suffixes in email addresses?", answer: "Text after a plus sign in the local part (e.g., user+tag@domain.com) is treated as a tag. The normalizer strips tags to get the base address for deduplication." },
      { question: "Does the normalizer convert internationalized domains to Punycode?", answer: "Yes, domains with non-ASCII characters are converted to Punycode (xn--) representation, allowing comparison between Unicode and ASCII versions of the same domain." }
    ]
  },

  "bulk-font-subsetter": {
    instructions: [
      { title: "1. Upload Font File", desc: "Upload a .ttf, .otf, .woff, or .woff2 font file. Max file size is 10 MB." },
      { title: "2. Enter Characters to Keep", desc: "Type or paste the specific characters/unicodes you want to keep in the subset font." },
      { title: "3. Generate Subset", desc: "Click Subset to create a reduced font file containing only the specified characters, significantly reducing file size." }
    ],
    faqs: [
      { question: "How much can font subsetting reduce file size?", answer: "Subsetting a full CJK font (several MB) to include only 100 common characters can reduce file size by 90-95%. Even Latin fonts with full character sets (100+ KB) can be reduced to 5-15 KB." },
      { question: "What font formats does the subsetter support for output?", answer: "Output formats: WOFF2 (best compression, modern browsers), WOFF (legacy support), and TTF (raw TrueType). WOFF2 is recommended for web use." },
      { question: "Does the tool preserve OpenType features in the subset?", answer: "Yes, it preserves selected OpenType features: kerning, ligatures, alternates, and small caps. You can toggle which features to retain before subsetting." }
    ]
  },

  "website-screenshot": {
    instructions: [
      { title: "1. Enter Website URL", desc: "Type the full URL (including https://) of the website to capture." },
      { title: "2. Set Viewport Dimensions", desc: "Choose the viewport size: desktop (1920x1080), tablet (768x1024), mobile (375x667), or custom." },
      { title: "3. Capture and Download", desc: "Click Capture to render the page and generate a screenshot. Download as PNG or JPEG." }
    ],
    faqs: [
      { question: "How does the screenshot tool render JavaScript-heavy websites?", answer: "It uses a headless browser that fully executes JavaScript before capturing. The tool waits for network idle (2 seconds) or until a configurable delay." },
      { question: "Can I capture a full-page screenshot (scrolling)?", answer: "Yes, enable Full Page mode to capture the entire page height, not just the viewport. This scrolls through the page and stitches the sections together." },
      { question: "Does the tool support setting custom cookies for authenticated pages?", answer: "Yes, add cookies as key-value pairs in the Advanced section before capturing. Cookies are injected into the browser session before rendering." }
    ]
  },

  "qr-code-reader": {
    instructions: [
      { title: "1. Upload QR Code Image", desc: "Upload a PNG, JPEG, or WEBP image containing a QR code, or paste from clipboard." },
      { title: "2. Auto-Decode", desc: "The tool automatically detects the QR code in the image and decodes its content." },
      { title: "3. View Decoded Content", desc: "The decoded text, URL, or other data is displayed. If it's a URL, a clickable link is shown." }
    ],
    faqs: [
      { question: "What QR code versions does this reader support?", answer: "It supports QR code versions 1–40 (21×21 to 177×177 modules) including micro QR codes and all error correction levels (L, M, Q, H)." },
      { question: "Can the reader decode damaged or partially obscured QR codes?", answer: "Yes, the error correction built into QR codes (up to 30% with level H) allows decoding partially damaged codes. The tool reports the error correction level used." },
      { question: "Does the tool support batch scanning multiple QR codes in one image?", answer: "Yes, if the image contains multiple QR codes, the tool decodes all of them and lists each with its content and position in the image." }
    ]
  },

  "whois-lookup": {
    instructions: [
      { title: "1. Enter Domain or IP", desc: "Type a domain name (example.com) or IP address to look up." },
      { title: "2. Perform Lookup", desc: "Click Lookup to query the WHOIS database for registration information." },
      { title: "3. Review Details", desc: "View registrar, registration/expiration dates, name servers, and registrant contact information." }
    ],
    faqs: [
      { question: "What WHOIS data fields are typically returned?", answer: "Fields include: domain name, registrar, registrant contact (often redacted with GDPR), administrative/technical contacts, name servers, creation/expiration dates, and DNSSEC status." },
      { question: "Why is registrant information often hidden in WHOIS results?", answer: "GDPR and similar privacy regulations require registrars to redact personal contact information. The tool shows 'Redacted for Privacy' or the registrar's proxy/privately-registered service name." },
      { question: "Can the tool differentiate between domain WHOIS and IP WHOIS?", answer: "Yes, domain WHOIS returns domain registration data, while IP WHOIS returns the RIR (ARIN, RIPE, APNIC, LACNIC, AFRINIC) allocation information." }
    ]
  },

  "string-inspector": {
    instructions: [
      { title: "1. Enter String", desc: "Type or paste any string into the input field." },
      { title: "2. View Inspection Results", desc: "The tool displays: length, character count, word count, line count, byte size (UTF-8, UTF-16), and character composition." },
      { title: "3. Review Unicode Details", desc: "See each character's code point, hex representation, Unicode category, and any combining characters." }
    ],
    faqs: [
      { question: "What Unicode properties does the string inspector reveal?", answer: "It shows: code points (U+XXXX), UTF-8/UTF-16/UTF-32 byte representations, Unicode block, general category (L, N, P, S, etc.), and bidirectional class." },
      { question: "Does the tool detect zero-width characters or hidden Unicode?", answer: "Yes, it flags zero-width characters (U+200B, U+200C), bidirectional override characters (U+202E), and other invisible Unicode characters that can be used for homograph attacks." },
      { question: "Can the inspector find duplicate characters or analyze character frequency?", answer: "Yes, it generates a character frequency histogram showing how often each character appears, sorted by frequency." }
    ]
  },

  "php-tools": {
    instructions: [
      { title: "1. Select PHP Tool Mode", desc: "Choose from: PHP syntax checker, serialize/unserialize, base64 encode/decode, or var_dump formatter." },
      { title: "2. Enter PHP Code or Data", desc: "Paste your PHP code, serialized string, or data depending on the selected mode." },
      { title: "3. Process and View Output", desc: "The tool processes the input and shows the result with syntax highlighting." }
    ],
    faqs: [
      { question: "What PHP tools are included in this utility pack?", answer: "PHP syntax linting (parse error detection), serialization format converter, base64 PHP-style encoding (base64_encode/base64_decode), and pretty-print for var_dump output." },
      { question: "How does the PHP serialization tool work?", answer: "It parses PHP serialized strings (a:3:{i:0;s:4:\"test\";...}) and converts them to readable JSON. It also generates PHP serialization from JSON input." },
      { question: "Does the syntax checker validate against specific PHP versions?", answer: "Yes, select PHP 7.4, 8.0, 8.1, 8.2, or 8.3. Each version checks for version-specific syntax (named arguments, readonly properties, enums)." }
    ]
  },

  "pkce-verifier": {
    instructions: [
      { title: "1. Enter Code Verifier", desc: "Paste the code_verifier used in the OAuth PKCE flow." },
      { title: "2. Enter Code Challenge", desc: "Paste the code_challenge received from the authorization request." },
      { title: "3. Verify Match", desc: "Select the challenge method (S256 or plain) and click Verify to confirm the verifier matches the challenge." }
    ],
    faqs: [
      { question: "How does the PKCE verifier confirm a code_challenge matches a code_verifier?", answer: "For S256, the tool computes SHA-256 of the verifier and base64url-encodes it, then compares to the challenge. For plain, it compares strings directly." },
      { question: "What should I do if the verifier doesn't match the challenge?", answer: "Check that both values were copied completely (no truncation), verify the challenge method (S256 vs plain), and ensure the verifier uses unreserved characters only." },
      { question: "Does the verifier check the code_verifier's RFC 7636 compliance?", answer: "Yes, it validates: minimum 43 characters, maximum 128 characters, and only unreserved characters (A-Z, a-z, 0-9, -, ., _, ~)." }
    ]
  },

  "msgpack-inspector": {
    instructions: [
      { title: "1. Upload or Paste MessagePack Data", desc: "Upload a .msgpack file or paste base64-encoded MessagePack data." },
      { title: "2. Decode MessagePack", desc: "The tool decodes the binary MessagePack into a readable JSON structure." },
      { title: "3. Inspect Structure", desc: "View the decoded data as formatted JSON with type annotations showing the original MessagePack types." }
    ],
    faqs: [
      { question: "What is MessagePack and how does it differ from JSON?", answer: "MessagePack is a binary serialization format that is more compact than JSON. It represents the same data types (map, array, string, number, nil, boolean) in binary form." },
      { question: "What MessagePack types does the inspector support?", answer: "It supports all MessagePack format types: nil, boolean, int (8/16/32/64 signed/unsigned), float (32/64), string, binary, array, map, timestamp, and extension types." },
      { question: "Can the tool convert JSON to MessagePack format?", answer: "Yes, paste JSON and click 'Convert to MessagePack' to generate the binary MessagePack representation, downloadable as .msgpack." }
    ]
  },

  "cbor-inspector": {
    instructions: [
      { title: "1. Upload or Paste CBOR Data", desc: "Upload a .cbor file or paste hex/base64-encoded CBOR data." },
      { title: "2. Decode CBOR", desc: "The tool decodes the binary CBOR into a readable JSON structure." },
      { title: "3. Inspect Structure", desc: "View type annotations, tag numbers, and byte lengths for each CBOR data item." }
    ],
    faqs: [
      { question: "What is CBOR and how does it relate to MessagePack?", answer: "CBOR (Concise Binary Object Representation, RFC 7049) is another binary JSON format. Unlike MessagePack, CBOR has a standard tag system for semantic annotations." },
      { question: "What CBOR tags does the inspector recognize?", answer: "It recognizes standard tags: 1 (date/time string), 0 (date/time string, RFC 3339), 32–34 (URI, base64, base64url), 24 (encoded CBOR), 32 (URI), 36 (MIME message)." },
      { question: "Does CBOR support indefinite-length arrays and maps?", answer: "Yes, CBOR supports indefinite-length encoding where the number of items is unknown ahead of time. The inspector handles these break-terminated sequences." }
    ]
  },

  "data-anonymizer": {
    instructions: [
      { title: "1. Paste Data with Sensitive Fields", desc: "Paste JSON, CSV, or text containing personally identifiable information (PII)." },
      { title: "2. Select Fields to Anonymize", desc: "Choose which fields to anonymize by field name or regex pattern. Options: email, phone, SSN, name, IP address, credit card." },
      { title: "3. Choose Anonymization Method", desc: "Select: mask (show first/last chars), hash (SHA-256), replace (with fake data), or redact (remove entirely)." }
    ],
    faqs: [
      { question: "What PII patterns does the anonymizer detect automatically?", answer: "It auto-detects: email addresses (regex), phone numbers (E.164 and national), SSN (XXX-XX-XXXX), credit card numbers (Luhn-valid), IP addresses (IPv4/IPv6), and dates of birth." },
      { question: "How does the hash anonymization method work?", answer: "Hash mode replaces each value with a SHA-256 hash of the original value. The same input always produces the same hash, preserving referential integrity across datasets." },
      { question: "Can the tool anonymize data while preserving statistical properties?", answer: "Yes, the 'Perturbation' mode adds controlled random noise to numeric values, preserving mean and distribution while making individual values untraceable." }
    ]
  },

  "mime-finder": {
    instructions: [
      { title: "1. Enter File Extension or MIME Type", desc: "Type a file extension (e.g., .pdf, .jpg) or a MIME type (e.g., application/json) to look up." },
      { title: "2. View Results", desc: "The tool returns the corresponding MIME type for an extension, or the extension(s) for a MIME type." },
      { title: "3. Browse Common Types", desc: "Browse the category browser to explore MIME types by category (text, image, audio, video, application, multipart, message)." }
    ],
    faqs: [
      { question: "How many MIME type associations are in the tool's database?", answer: "The database contains 2,000+ MIME type mappings including IANA-registered and common non-standard types." },
      { question: "Does the tool support MIME type detection by file content (magic bytes)?", answer: "Yes, upload a file and the tool reads the first bytes (magic number signature) to detect the MIME type, useful for files without extensions." },
      { question: "Can I look up the correct MIME type for serving web fonts?", answer: "Yes, font types: woff2 (font/woff2), woff (font/woff), ttf (font/ttf), otf (font/otf), eot (application/vnd.ms-fontobject)." }
    ]
  },

  "cidr-calculator": {
    instructions: [
      { title: "1. Enter CIDR Notation", desc: "Type a CIDR block (e.g., 10.0.0.0/24, 192.168.1.0/28, or 2001:db8::/48)." },
      { title: "2. View Network Details", desc: "The tool displays: network address, broadcast address, usable host range, subnet mask, and total hosts." },
      { title: "3. Explore Subnets", desc: "Use the subnet list to see all subnets within the block." }
    ],
    faqs: [
      { question: "What information does the CIDR calculator display?", answer: "Network address, broadcast address, first/last usable host, subnet mask in dotted decimal and CIDR notation, total IP count, usable host count (minus network/broadcast), and wildcard mask." },
      { question: "How does the calculator handle IPv6 CIDR calculations?", answer: "For IPv6, it shows the network prefix, subnet identifier, interface ID range, and total /64 subnets available. IPv6 doesn't use broadcast addresses." },
      { question: "Can the calculator divide a CIDR block into smaller subnets?", answer: "Yes, enter a desired subnet size (/26, /27, etc.) and the tool lists all subnets at that size within the parent block." }
    ]
  },

  "api-request-builder": {
    instructions: [
      { title: "1. Configure Request Endpoint", desc: "Set HTTP method (GET, POST, PUT, DELETE, PATCH) and full URL. Use environment variables for dynamic values." },
      { title: "2. Add Headers and Parameters", desc: "Add request headers, query parameters, path parameters, and request body (JSON, form-data, URL-encoded)." },
      { title: "3. Send and Inspect Response", desc: "Click Send to execute. View response status, headers, body, timing, and size." }
    ],
    faqs: [
      { question: "How does the request builder differ from the API tester?", answer: "This tool focuses on building requests with advanced configuration (environment variables, dynamic values, chained requests) rather than testing." },
      { question: "Can I add test assertions to validate the response?", answer: "Yes, add assertions like: status code equals 200, response time < 500ms, JSON body contains specific fields. Assertions run automatically after sending." },
      { question: "Does the builder support GraphQL queries?", answer: "Yes, select GraphQL as body type with separate fields for query and variables. Auto-sets Content-Type: application/json." }
    ]
  },

  "api-mock-server-config": {
    instructions: [
      { title: "1. Define Routes and Responses", desc: "Add routes with paths, methods, response status codes, and body templates." },
      { title: "2. Configure Dynamic Responses", desc: "Set up conditional responses based on request parameters, headers, or body content." },
      { title: "3. Generate Mock Server Config", desc: "Export the configuration as a JSON config file for use with mock server tools (JSON Server, Mockoon, WireMock)." }
    ],
    faqs: [
      { question: "What mock server formats can the tool export?", answer: "Export formats: JSON Server (db.json), Mockoon (mockoon.json), WireMock (stubs mapping), Prism (OpenAPI + examples), and custom Node.js Express router." },
      { question: "How does the tool simulate network latency?", answer: "Configure global or per-route response delay (50ms–10s). You can also set randomized delay ranges and failure probability per route." },
      { question: "Can the config include OAuth token validation?", answer: "Yes, configure auth requirements: API key header validation, Bearer JWT decoding, or basic auth. Invalid/expired tokens return 401." }
    ]
  },

  "api-latency-budget": {
    instructions: [
      { title: "1. Enter Page Load Target", desc: "Set the target total page load time (e.g., 3000ms for a 3-second load)." },
      { title: "2. Add API Endpoints", desc: "List all API calls your page makes with their current latency and expected order (sequential or parallel)." },
      { title: "3. Calculate Budget", desc: "The tool allocates latency budgets per endpoint accounting for network overhead, rendering, and parallelization." }
    ],
    faqs: [
      { question: "How does the tool calculate latency budgets for parallel vs sequential requests?", answer: "Sequential requests sum their latencies (max 2 slowest in parallel). The budget calculator accounts for: DNS, TCP, TLS, request send, waiting (TTFB), and content download." },
      { question: "What happens if a single API call exceeds its allocated budget?", answer: "The tool highlights budget overruns in red and suggests optimizations: caching, CDN, response compression, or reducing payload size." },
      { question: "Can I export the latency budget as a performance budget document?", answer: "Yes, export as JSON (for Lighthouse CI integration), Markdown (for team documentation), or spreadsheet CSV." }
    ]
  },

  "api-pagination-calculator": {
    instructions: [
      { title: "1. Set Total Record Count", desc: "Enter the total number of records in your dataset." },
      { title: "2. Set Page Size", desc: "Enter the number of records per page. Common values: 10, 20, 50, 100." },
      { title: "3. View Pagination Results", desc: "The tool calculates: total pages, page ranges, offset values, and links for first/last/next/previous pages." }
    ],
    faqs: [
      { question: "What pagination strategies does the calculator support?", answer: "It supports offset-based (page & limit query params), cursor-based (cursor & limit), keyset pagination (WHERE id > last_seen), and page-based." },
      { question: "How does the tool calculate optimal page size?", answer: "Based on average record size and network conditions, it suggests an optimal page size balancing response time vs number of requests." },
      { question: "Does the calculator generate example API responses with pagination metadata?", answer: "Yes, it generates sample responses with pagination metadata (total, page, per_page, total_pages, next/prev URLs) for different API conventions." }
    ]
  },

  "api-cost-estimator": {
    instructions: [
      { title: "1. Enter API Usage Metrics", desc: "Enter monthly API calls, average response size, and compute duration per call." },
      { title: "2. Select Provider Pricing", desc: "Choose from AWS API Gateway, Cloudflare Workers, Vercel Serverless, Google Cloud Endpoints, or custom pricing." },
      { title: "3. Estimate Monthly Cost", desc: "The tool calculates estimated monthly cost including request charges, data transfer, and compute time." }
    ],
    faqs: [
      { question: "What cost factors does the API cost estimator include?", answer: "It includes: per-request charges, data transfer (in/out), compute time (GB-seconds), API Gateway fees, cache usage, and free tier allowances." },
      { question: "Can I compare costs across multiple cloud providers?", answer: "Yes, select multiple providers to see a side-by-side cost comparison for the same usage metrics." },
      { question: "How does the estimator account for free tier?", answer: "It applies each provider's free tier (e.g., AWS API Gateway: 1M requests/month free) before calculating charges beyond the free tier." }
    ]
  },

  "api-gateway-rate-calculator": {
    instructions: [
      { title: "1. Set Max Request Rate", desc: "Enter the maximum number of requests per second (RPS) your API should accept." },
      { title: "2. Configure Burst Allowance", desc: "Set the burst limit — how many requests exceeding the rate are allowed momentarily before throttling kicks in." },
      { title: "3. Calculate Rate Limit", desc: "The tool shows rate limit headers to return, refill rate, and burst capacity." }
    ],
    faqs: [
      { question: "What is the difference between rate limiting and throttling?", answer: "Rate limiting caps requests within a time window. Throttling slows down requests that exceed the limit by queuing them. The calculator configures both approaches." },
      { question: "How does the token bucket algorithm work for rate limiting?", answer: "The bucket holds tokens (max burst). Tokens refill at a steady rate (refill rate). Each request consumes one token. When the bucket is empty, requests are throttled." },
      { question: "What rate limit headers should my API return?", answer: "Standard headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset (Unix timestamp). The calculator generates the appropriate header values." }
    ]
  },

  "api-rate-limiter-calculator": {
    instructions: [
      { title: "1. Enter Request Volume", desc: "Input your expected daily/monthly API request volume and peak RPS." },
      { title: "2. Select Rate Limit Strategy", desc: "Choose: fixed window, sliding window, token bucket, or leaky bucket." },
      { title: "3. Calculate Configuration", desc: "The tool outputs the ideal rate limit configuration, memory requirements, and expected throttling percentage." }
    ],
    faqs: [
      { question: "What is the difference between fixed window and sliding window rate limiting?", answer: "Fixed window resets the counter at the end of each window (e.g., every minute), which can allow bursts at boundaries. Sliding window uses a rolling time window for more even enforcement." },
      { question: "How does the calculator determine memory requirements?", answer: "For fixed window: one counter per user. For sliding window: multiple timestamp entries per user. The tool estimates Redis memory usage based on user count and window size." },
      { question: "Can the tool suggest rate limits based on historical traffic patterns?", answer: "Yes, paste historical request logs, and the tool analyzes P50/P95/P99 traffic to suggest appropriate rate limits that accommodate normal traffic." }
    ]
  },

  "graphql-cost-estimator": {
    instructions: [
      { title: "1. Paste GraphQL Query", desc: "Paste a GraphQL query or mutation to estimate its cost." },
      { title: "2. Set Cost Factors", desc: "Configure per-field costs (default cost per field, list multiplier, depth multiplier)." },
      { title: "3. Estimate Query Cost", desc: "The tool calculates the query complexity score based on field selection, nesting depth, and list sizes." }
    ],
    faqs: [
      { question: "How does the GraphQL cost estimator calculate query complexity?", answer: "Each field has a base cost (default 1). List fields multiply cost by expected list size. Deeply nested fields have exponential cost. The total is the sum of all selected field costs." },
      { question: "Can the estimator detect expensive N+1 queries in the schema?", answer: "Yes, it flags list fields without dataloader optimization (no @requires or @batch directive) that could cause N+1 query problems at the database level." },
      { question: "Does the tool support directive-based cost annotations?", answer: "Yes, it supports @cost(complexity: 5) and @listSize(start: 20, max: 100) directives per the GraphQL Cost Directive specification." }
    ]
  },

  "grpc-status-code-lookup": {
    instructions: [
      { title: "1. Enter gRPC Status Code", desc: "Type a gRPC status code number (0–16) or its HTTP mapping (200, 429, etc.)." },
      { title: "2. View Status Details", desc: "The tool shows the status name (e.g., DEADLINE_EXCEEDED), number, HTTP mapping, and description." },
      { title: "3. Browse All Status Codes", desc: "Browse the complete list of gRPC status codes with details." }
    ],
    faqs: [
      { question: "What gRPC status codes are defined in the specification?", answer: "16 codes: OK(0), CANCELLED(1), UNKNOWN(2), INVALID_ARGUMENT(3), DEADLINE_EXCEEDED(4), NOT_FOUND(5), ALREADY_EXISTS(6), PERMISSION_DENIED(7), RESOURCE_EXHAUSTED(8), FAILED_PRECONDITION(9), ABORTED(10), OUT_OF_RANGE(11), UNIMPLEMENTED(12), INTERNAL(13), UNAVAILABLE(14), DATA_LOSS(15), UNAUTHENTICATED(16)." },
      { question: "How do gRPC status codes map to HTTP status codes?", answer: "OK → 200, CANCELLED → 499 (client closed), UNKNOWN → 500, INVALID_ARGUMENT → 400, DEADLINE_EXCEEDED → 504, NOT_FOUND → 404, PERMISSION_DENIED → 403, UNAUTHENTICATED → 401." },
      { question: "When should I use UNAVAILABLE vs INTERNAL for server errors?", answer: "UNAVAILABLE (14) means the service is temporarily unreachable (may be retried). INTERNAL (13) means an unexpected condition in the server (not safe to retry without investigation)." }
    ]
  },

  "webhook-retry-config": {
    instructions: [
      { title: "1. Set Retry Parameters", desc: "Configure: max retry attempts (0–10), initial delay (1–60s), backoff multiplier (1–5x)." },
      { title: "2. Select Retry Strategy", desc: "Choose: fixed interval, linear backoff, exponential backoff, exponential with jitter." },
      { title: "3. Generate Retry Schedule", desc: "The tool generates the exact retry schedule showing each attempt's delay and cumulative time." }
    ],
    faqs: [
      { question: "What is exponential backoff with jitter and why is it recommended?", answer: "Exponential backoff doubles the delay after each retry (1s, 2s, 4s, 8s). Jitter adds +/- random offset to prevent thundering herd. This is the AWS and Stripe recommended pattern." },
      { question: "How does the tool calculate total retry duration?", answer: "It sums all delays across retry attempts. For exponential backoff (initial 1s, 5 retries): 1 + 2 + 4 + 8 + 16 = 31s plus jitter. Total timeout includes all retries." },
      { question: "Can the tool generate the retry configuration in code?", answer: "Yes, export the retry configuration as JavaScript, Python, or Go code using your chosen retry strategy parameters." }
    ]
  },

  "webhook-signature-verifier": {
    instructions: [
      { title: "1. Paste Raw Request Body", desc: "Paste the exact raw request body received from the webhook provider." },
      { title: "2. Enter Signature Header", desc: "Enter the signature value from the webhook headers (Stripe: stripe-signature, GitHub: x-hub-signature-256)." },
      { title: "3. Verify Signature", desc: "Enter your shared secret and click Verify to confirm the webhook authenticity." }
    ],
    faqs: [
      { question: "What webhook signature schemes does the verifier support?", answer: "It supports: HMAC-SHA256 (Stripe, GitHub), HMAC-SHA1 (GitHub legacy), RSA-PSS (WebSub), and timestamped schemes (Stripe v2+ includes t= in payload)." },
      { question: "How does the tool handle timestamp tolerance in signature verification?", answer: "For Stripe-style signatures, the tool parses the t=timestamp, computes the expected signature, and allows a configurable tolerance window (default 5 minutes)." },
      { question: "What is the difference between the signing payload for different providers?", answer: "Stripe signs the raw request body prefixed with timestamp. GitHub signs the raw body without prefix. The tool shows the exact signing string construction for each provider." }
    ]
  },

  "subnet-calculator": {
    instructions: [
      { title: "1. Enter Network Address with CIDR", desc: "Type a network address in CIDR notation (e.g., 10.0.0.0/24, 192.168.1.0/28)." },
      { title: "2. View Network Details", desc: "Displays: network address, broadcast, usable range, subnet mask, wildcard mask, total hosts." },
      { title: "3. Subdivide Network", desc: "Enter a target subnet size to see all subnets at that size within the parent network." }
    ],
    faqs: [
      { question: "What is the difference between a /24 and a /28 network?", answer: "A /24 has 256 total IPs with 254 usable hosts. A /28 has 16 total IPs with 14 usable hosts. The /24 provides more addresses, the /28 reserves fewer." },
      { question: "How does subnetting relate to VPC design in cloud providers?", answer: "AWS VPCs use CIDR blocks (e.g., 10.0.0.0/16) subdivided into /24 subnets per availability zone. The calculator helps plan VPC subnet allocation." },
      { question: "Can the tool calculate both IPv4 and IPv6 subnets?", answer: "Yes, it handles IPv4 and IPv6 CIDR notation. For IPv6, /64 is the minimum subnet for SLAAC, and the tool shows the number of /64 subnets available." }
    ]
  },

  "subnet-visualizer": {
    instructions: [
      { title: "1. Enter Parent CIDR Block", desc: "Type the parent CIDR block (e.g., 10.0.0.0/16)." },
      { title: "2. Add Subnets", desc: "Add subnet CIDR blocks that exist within the parent block. The tool visualizes their overlap and allocation." },
      { title: "3. View Visual Map", desc: "A visual diagram shows how subnets are allocated within the parent block, highlighting used vs available space." }
    ],
    faqs: [
      { question: "How does the subnet visualizer display overlapping subnets?", answer: "Each subnet is shown as a colored bar proportional to its size within the parent block. Overlapping subnets are flagged in red." },
      { question: "Can the tool recommend where to place new subnets?", answer: "Yes, it identifies available address space gaps and suggests optimal CIDR placement for new subnets." },
      { question: "Does the visualizer support VPC peering connection visualization?", answer: "Yes, add peered VPC CIDR blocks to check for overlapping CIDR ranges that would prevent VPC peering." }
    ]
  },

  "cors-inspector": {
    instructions: [
      { title: "1. Enter Request URL and Origin", desc: "Type the target URL and the origin URL (the page making the cross-origin request)." },
      { title: "2. Configure Request Details", desc: "Set the HTTP method, custom headers, and whether credentials (cookies) are included." },
      { title: "3. Inspect CORS Result", desc: "The tool shows whether the request would be allowed or blocked, with detailed reasons." }
    ],
    faqs: [
      { question: "What CORS checks does the inspector simulate?", answer: "It simulates: preflight (OPTIONS) check, Access-Control-Allow-Origin validation, method allowlist check, header allowlist check, and credentials flag validation." },
      { question: "How does the tool determine if a preflight is required?", answer: "A preflight is required if: method is not GET/HEAD/POST, Content-Type is not form-safe, or custom headers are included. The tool shows the exact reason." },
      { question: "Can I test CORS errors from a specific browser's perspective?", answer: "Yes, select browser (Chrome, Firefox, Safari) to see browser-specific CORS behavior, as Safari has stricter CORS restrictions for certain features." }
    ]
  },

  "env-file-parser": {
    instructions: [
      { title: "1. Paste .env File Content", desc: "Paste the content of your .env file into the editor." },
      { title: "2. Parse Variables", desc: "The tool parses each line: extracts key-value pairs, handles quoted strings, comments, and multi-line values." },
      { title: "3. View Parsed Results", desc: "Variables are displayed in a table with key, value, and a security classification (public, secret, credential)." }
    ],
    faqs: [
      { question: "What .env file features does the parser handle?", answer: "It handles: quoted strings (single and double), multiline values (backslash or quoted), inline comments (#), variable expansion (${VAR_NAME}), and export prefix." },
      { question: "Does the parser detect potential security issues in .env files?", answer: "Yes, it flags: hardcoded credentials in non-.env files, missing required variables, duplicate keys, and values that look like secrets (API keys, passwords)." },
      { question: "Can the tool convert .env to other configuration formats?", desc: "Yes, export parsed variables as JSON (.env.json), YAML (.env.yaml), or Docker --env-file format." }
    ]
  },

  "cve-lookup": {
    instructions: [
      { title: "1. Enter CVE ID or Keyword", desc: "Type a CVE identifier (e.g., CVE-2024-3094) or a keyword (e.g., 'OpenSSH', 'Log4j')." },
      { title: "2. Search or Lookup", desc: "Click Lookup to fetch CVE details from the NVD database." },
      { title: "3. Review Details", desc: "View: description, CVSS score (v3/v4), affected versions, published date, severity, and references." }
    ],
    faqs: [
      { question: "What CVE data sources does this tool query?", answer: "It queries the National Vulnerability Database (NVD) API for CVE details, CVSS scores, CPE matches, and reference URLs." },
      { question: "How is the CVSS score interpreted?", answer: "CVSS v3 scores: 0.0 (None), 0.1–3.9 (Low), 4.0–6.9 (Medium), 7.0–8.9 (High), 9.0–10.0 (Critical). The tool shows the vector string and breakdown." },
      { question: "Can the tool check if a specific software version is affected by a CVE?", answer: "Yes, enter a CPE (Common Platform Enumeration) string or software name and version to check known vulnerabilities." }
    ]
  },

  "subdomain-finder": {
    instructions: [
      { title: "1. Enter Domain", desc: "Type the target domain (e.g., example.com)." },
      { title: "2. Run Subdomain Discovery", desc: "Click Find to enumerate subdomains using certificate transparency logs and DNS records." },
      { title: "3. Review Results", desc: "Discovered subdomains are listed with their IP addresses and status (resolved, no record, error)." }
    ],
    faqs: [
      { question: "What sources does the subdomain finder use for discovery?", answer: "It queries: Certificate Transparency logs (crt.sh), DNS records (MX, NS, CNAME), and brute-force of common subdomain names." },
      { question: "Is subdomain discovery legal for my own domain?", answer: "Yes, scanning your own domains is legal and recommended for security posture. Scanning third-party domains may violate terms of service or local laws." },
      { question: "How many subdomain queries does the tool perform?", answer: "It checks up to 10,000 common subdomain names from a curated wordlist plus CT log entries which can return hundreds of results." }
    ]
  },

  "aes-decrypt": {
    instructions: [
      { title: "1. Enter Encrypted Data", desc: "Paste the encrypted ciphertext in base64 or hex format." },
      { title: "2. Select AES Parameters", desc: "Choose: key size (128, 192, 256), mode (CBC, GCM, CTR, ECB), and padding (PKCS7, NoPadding)." },
      { title: "3. Enter Key and IV", desc: "Provide the decryption key and initialization vector (IV) in hex or base64." }
    ],
    faqs: [
      { question: "What AES encryption modes does the tool support?", answer: "CBC (Cipher Block Chaining, requires IV), GCM (Galois/Counter Mode, authenticated encryption, requires IV + auth tag), CTR (Counter mode), and ECB (not recommended, no IV)." },
      { question: "How does GCM mode handle authentication tags?", answer: "GCM produces an authentication tag (typically 16 bytes) appended to the ciphertext. The tool requires the tag to verify integrity before decrypting." },
      { question: "What is the difference between PKCS7 and NoPadding?", answer: "PKCS7 adds padding bytes to make the plaintext a multiple of the block size (16 bytes). NoPadding requires the plaintext to already be a multiple of 16 bytes for block modes." }
    ]
  },

  "trailing-space-remover": {
    instructions: [
      { title: "1. Paste or Upload Text", desc: "Paste text or upload a file to remove trailing whitespace." },
      { title: "2. Configure Options", desc: "Choose to remove trailing spaces, trailing tabs, or both. Toggle to preserve empty lines or remove them." },
      { title: "3. Process and Export", desc: "Click Remove to strip trailing whitespace. Download the cleaned file or copy to clipboard." }
    ],
    faqs: [
      { question: "Why is trailing whitespace considered a bad practice in code?", answer: "Trailing whitespace creates noisy diffs, triggers linter warnings, and can cause CI failures. Many style guides forbid it." },
      { question: "Does the tool support batch processing of multiple files?", answer: "Yes, upload multiple files (zip or individually) and the tool processes them all, showing per-file change counts." },
      { question: "Can the tool preserve trailing whitespace in markdown files where it has semantic meaning?", answer: "Yes, markdown mode preserves two trailing spaces before a line break (which creates a <br> in many markdown renderers)." }
    ]
  },

  "port-number-lookup": {
    instructions: [
      { title: "1. Enter Port Number or Service Name", desc: "Type a port number (e.g., 443) or service name (e.g., 'HTTPS', 'SSH')." },
      { title: "2. View Service Info", desc: "The tool shows the registered service name, protocol (TCP/UDP), and common usage description." },
      { title: "3. Browse by Category", desc: "Browse ports by category: web, email, file transfer, database, security, remote access, or well-known (0–1023)." }
    ],
    faqs: [
      { question: "What port number ranges are defined by IANA?", answer: "Well-known ports (0–1023): system services. Registered ports (1024–49151): user applications. Dynamic/private ports (49152–65535): temporary connections." },
      { question: "Can I look up port conflicts between services?", answer: "Yes, the tool shows if a port is used by multiple services and which is the IANA-registered assignment." },
      { question: "Does the tool include UDP ports in addition to TCP?", answer: "Yes, each port entry shows both TCP and UDP assignments, as some services use different protocols on the same port." }
    ]
  },

  "user-agent-parser": {
    instructions: [
      { title: "1. Enter User Agent String", desc: "Paste a user agent string from a browser or HTTP client." },
      { title: "2. Parse Automatically", desc: "The tool parses the UA string and extracts: browser name, version, engine, OS, device type, and crawler detection." },
      { title: "3. Review Parsed Data", desc: "Structured breakdown of the parsed components in a readable table." }
    ],
    faqs: [
      { question: "What information does the user agent parser extract?", answer: "It extracts: browser (Chrome, Firefox, Safari, Edge, etc.), browser version, rendering engine (Blink, Gecko, WebKit), operating system, device type (desktop, mobile, tablet), and crawler/bot detection." },
      { question: "Can the parser distinguish between mobile app webviews and browsers?", answer: "Yes, it detects: Facebook in-app browser, Instagram, Twitter, LinkedIn, and WebView/UIWebView/WKWebView on iOS and Android." },
      { question: "Does the parser identify specific crawlers (Googlebot, Bingbot)?", answer: "Yes, it recognizes Googlebot, Bingbot, DuckDuckBot, Baiduspider, YandexBot, Slackbot, Twitterbot, and 100+ other crawlers." }
    ]
  },

  "rate-limit-header-parser": {
    instructions: [
      { title: "1. Paste Rate Limit Headers", desc: "Paste the HTTP response headers containing rate limit information." },
      { title: "2. Parse Automatically", desc: "The tool extracts rate limit values from common header formats." },
      { title: "3. View Parsed Limits", desc: "Shows: current usage, remaining requests, reset time, and whether you're approaching the limit." }
    ],
    faqs: [
      { question: "What rate limit header formats does the parser recognize?", answer: "It recognizes: X-RateLimit-Limit/Remaining/Reset (GitHub, Shopify), X-Ratelimit-* (Twitter, Dropbox), Retry-After, RateLimit-* (RateLimit standard draft), and custom formats." },
      { question: "How does the tool calculate when the rate limit resets?", answer: "If the reset header is a Unix timestamp, it converts to local time. If it's a duration (seconds), it adds to the current time." },
      { question: "Can the parser suggest optimal request timing to avoid hitting limits?", answer: "Yes, based on the limit and remaining values, it suggests the ideal request interval and when to back off." }
    ]
  },

  "pricing-tier-builder": {
    instructions: [
      { title: "1. Define Pricing Tiers", desc: "Add tier names (Free, Basic, Pro, Enterprise) with monthly prices." },
      { title: "2. Configure Feature Access", desc: "For each tier, enable/disable features. Set numeric limits (users, storage, API calls)." },
      { title: "3. Generate Pricing Table", desc: "Export as HTML table, Markdown, or JSON for your pricing page." }
    ],
    faqs: [
      { question: "How does the pricing tier builder handle feature comparison?", answer: "Each feature is toggled per tier: checkmark (included), number (seated count), or cross (not included). The tool generates a comparison matrix." },
      { question: "Can the tool calculate annual pricing with discounts?", answer: "Yes, set an annual discount percentage (e.g., 20% off). The tool shows monthly vs annual pricing and total savings." },
      { question: "Does the builder support usage-based pricing components?", answer: "Yes, add overage pricing per unit (per API call, per GB storage, per user). The tool estimates total cost at different usage levels." }
    ]
  },

  "code-obfuscator": {
    instructions: [
      { title: "1. Paste JavaScript Code", desc: "Paste your JavaScript source code to obfuscate." },
      { title: "2. Select Obfuscation Options", desc: "Choose techniques: variable renaming, string encoding, control flow flattening, dead code injection, debug protection." },
      { title: "3. Obfuscate and Export", desc: "Click Obfuscate to transform the code. View the obfuscated output and size comparison." }
    ],
    faqs: [
      { question: "What obfuscation techniques does the tool apply?", answer: "Variable renaming (to short/random names), string array encoding, control flow flattening (switch case), dead code injection, self-defending (anti-tamper), and debug protection (anti-debugging)." },
      { question: "Does obfuscation protect code from reverse engineering?", answer: "Obfuscation makes reverse engineering harder and more time-consuming but does not prevent it. Determined attackers can deobfuscate with enough effort." },
      { question: "Can the tool deobfuscate previously obfuscated code?", answer: "Limited deobfuscation is possible for simple transformations (string array decoding, variable renaming). Full deobfuscation for complex transforms (CFG flattening) is not supported." }
    ]
  },

  "api-error-decoder": {
    instructions: [
      { title: "1. Paste Error Response", desc: "Paste the full API error response body (JSON, XML, or plain text) including HTTP status code and headers into the input area." },
      { title: "2. Select API Provider (Optional)", desc: "Choose from known provider formats like Stripe, Twilio, AWS, OpenAI, or GitHub for provider-specific error parsing and known error code lookup." },
      { title: "3. Review Decoded Explanation", desc: "Examine the human-readable explanation, root cause analysis, suggested fix, and related documentation links for each error code found in the response." }
    ],
    faqs: [
      { question: "How does the decoder handle unknown or custom API error formats?", answer: "For unknown formats, the tool performs a best-effort parse by extracting common error fields (error, message, code, detail, status, type) and displays a generic breakdown based on the HTTP status code category." },
      { question: "Can the tool decode errors from AWS SDK responses specifically?", answer: "Yes, AWS mode parses the XML error response format used by S3, Lambda, and DynamoDB, extracting the ErrorCode, ErrorMessage, RequestID, and HostID fields from the XML envelope." },
      { question: "What information does the decoder extract from Stripe error responses?", answer: "For Stripe errors, the tool extracts the type (card_error, api_error, invalid_request_error), code (card_declined, expired_card), param, decline_code, charge ID, and payment intent status." }
    ]
  },

  "api-key-hasher": {
    instructions: [
      { title: "1. Enter API Key", desc: "Paste the API key you want to hash for secure storage. The key is processed entirely in-browser and never sent to any server." },
      { title: "2. Select Hashing Algorithm", desc: "Choose SHA-256 (recommended for most use cases), SHA-512 for extra security, or bcrypt for password-compatible key hashing with configurable cost factor." },
      { title: "3. Copy and Store Hash", desc: "Copy the resulting hash and store it in your database. The original API key should be discarded after hashing for security compliance." }
    ],
    faqs: [
      { question: "Why should API keys be hashed instead of stored in plaintext?", answer: "Plaintext key storage creates a single point of compromise — if the database is breached, all keys are exposed. Hashing ensures that even with database access, attackers cannot reverse-engineer valid keys." },
      { question: "Should I use a salt when hashing API keys for database storage?", answer: "Yes, the tool automatically generates and prepends a random 16-byte salt before hashing. Each key gets a unique salt, preventing rainbow table attacks and ensuring identical keys produce different hashes." },
      { question: "How does the tool compare a provided key against a stored hash for verification?", answer: "The verification mode accepts a provided key and a stored hash string. The tool extracts the salt from the stored hash, re-hashes the provided key with that salt, and performs a constant-time comparison." }
    ]
  },

  "api-response-formatter": {
    instructions: [
      { title: "1. Paste API Response", desc: "Paste the raw API response data as JSON, XML, or plain text into the input panel for immediate reformatting." },
      { title: "2. Choose Output Style", desc: "Select the formatting style: pretty-print with indentation, minified (single line), JSON with sorted keys, or wrap in a standard API envelope structure." },
      { title: "3. Extract and Transform", desc: "Optionally apply transforms like extracting specific fields via JSONPath, converting snake_case to camelCase, or wrapping in a paginated response structure." }
    ],
    faqs: [
      { question: "What API response envelope formats does the formatter support?", answer: "It supports JSON:API (data, included, meta), JSend (status, data, message), standard REST (data, error, pagination), GraphQL (data, errors), and a custom configurable envelope structure." },
      { question: "Can the tool convert between API response formats like XML to JSON?", answer: "Yes, the formatter includes a conversion mode that translates XML responses to JSON, JSON to XML, and YAML to JSON while preserving the data structure and type information." },
      { question: "How does the tool handle nested pagination metadata in the response?", answer: "The pagination detection mode extracts page, limit, total, total_pages, and cursor fields regardless of naming convention (underscore, camelCase, kebab-case) and presents them in a summary header." }
    ]
  },

  "brute-force-time-estimator": {
    instructions: [
      { title: "1. Enter Password or Key Details", desc: "Input the password, passphrase, or key to analyze its resistance against brute-force attacks based on character set composition and length." },
      { title: "2. Set Attacker Capabilities", desc: "Configure the assumed attacker speed — from consumer GPU (10 GH/s) to massive botnet (100 TH/s) — and whether the attack is offline (hash cracking) or online (rate-limited API)." },
      { title: "3. Review Time Estimates", desc: "View estimated cracking times across attacker tiers, from instant to centuries, with entropy bits and comparative strength against common benchmarks." }
    ],
    faqs: [
      { question: "How does the tool calculate entropy for passwords with mixed character sets?", answer: "Entropy is calculated as log2(R^L) where R is the size of the character set (26 for lowercase, 52 for mixed case, 62 for alphanumeric, 95 for all printable ASCII) and L is the length of the password." },
      { question: "What is the difference between online and offline brute-force attack estimates?", answer: "Offline attacks assume the attacker has the password hash and can attempt billions of guesses per second on GPUs. Online attacks are limited by server rate limiting, typically 1–1000 guesses per second before lockout." },
      { question: "How do dictionary attacks and common password patterns factor into the estimate?", answer: "The tool includes a common password dictionary check — if your input matches any of the top 10,000 breached passwords, the estimate shows 'Instant' regardless of length, as it would be guessed in a standard dictionary attack." }
    ]
  },

  "http-retry-policy-builder": {
    instructions: [
      { title: "1. Set Base Retry Parameters", desc: "Configure the maximum number of retry attempts (0–10), base delay in milliseconds (50–5000ms), and which HTTP status codes should trigger a retry (429, 5xx)." },
      { title: "2. Choose Backoff Strategy", desc: "Select from fixed delay, linear backoff, exponential backoff (2^n), exponential with jitter, or decorrelated jitter for distributed system resilience." },
      { title: "3. Generate Configuration Code", desc: "Export the retry policy as a ready-to-use code snippet in JavaScript (axios-retry), Python (tenacity), Go, Java (Resilience4j), or curl retry flags." }
    ],
    faqs: [
      { question: "What is the difference between exponential backoff and exponential backoff with jitter?", answer: "Pure exponential backoff (delay = base * 2^attempt) causes synchronized retries across clients at the same moments. Jitter adds random offset to each delay, preventing thundering herd problems in distributed systems." },
      { question: "Which HTTP status codes should typically trigger a retry in production systems?", answer: "Retry on 429 (Too Many Requests), 502 (Bad Gateway), 503 (Service Unavailable), 504 (Gateway Timeout), and occasional 5xx errors. Do NOT retry on 4xx client errors except 429 with Retry-After header." },
      { question: "How does the builder handle Retry-After headers from the server?", answer: "When enabled, the tool parses the Retry-After header (both HTTP-date and seconds formats) and overrides the calculated backoff delay with the server-specified wait time, respecting the server's explicit instruction." }
    ]
  },

  "query-string-parser": {
    instructions: [
      { title: "1. Enter Query String", desc: "Paste a URL query string (starting with ? or without) into the input field. Supports complex values with arrays, nested objects, and URL-encoded characters." },
      { title: "2. Choose Parsing Convention", desc: "Select the parsing style — simple key-value, PHP-style (key[] for arrays), bracket-notation (key[subkey]), or dot-notation (key.subkey) for nested object support." },
      { title: "3. View Parsed Results", desc: "The tool displays parsed parameters as a formatted JSON object with decoded values, type detection, and a table view with each parameter's raw and decoded form." }
    ],
    faqs: [
      { question: "How does the parser handle duplicate keys in the query string?", answer: "By default, duplicate keys are converted to an array of values. The PHP-style mode treats key[] as explicit array notation, while simple mode keeps only the last occurrence. The tool shows a warning when duplicates are detected." },
      { question: "Can the tool parse and decode complex nested query strings with encoded characters?", answer: "Yes, the parser fully decodes percent-encoded values (%20 → space, %23 → #, %26 → &), handles UTF-8 multibyte sequences, and converts plus signs to spaces per application/x-www-form-urlencoded specification." },
      { question: "Does the tool support the reverse operation of building a query string from parameters?", answer: "Yes, the reverse mode accepts a JSON object and generates the corresponding query string. Nested objects are serialized using the selected convention (bracket-notation by default) with proper URL encoding." }
    ]
  },

  "sse-event-formatter": {
    instructions: [
      { title: "1. Enter Event Data", desc: "Input the event data payload as plain text or JSON. The tool will format it into the Server-Sent Events (SSE) wire format as defined in the HTML specification." },
      { title: "2. Configure Event Fields", desc: "Set optional fields: event (event type name, default 'message'), id (last event ID for reconnection), retry (reconnection time in milliseconds), and data lines." },
      { title: "3. Format and Export", desc: "Copy the formatted SSE stream text, export as a chunked event source file, or view the stream simulation with timing controls for testing clients." }
    ],
    faqs: [
      { question: "What is the SSE wire format and how does it differ from WebSocket messages?", answer: "SSE uses a simple text protocol with lines prefixed by field names (event:, data:, id:, retry:), separated by double newlines. Unlike WebSocket's bidirectional binary frames, SSE is unidirectional server-to-client text only." },
      { question: "How does the formatter handle multiline data payloads in SSE events?", answer: "Multiline data is split across multiple 'data:' lines per the SSE specification. Each line of the data payload gets its own 'data:' prefix, and a double newline terminates the event. The tool handles this automatically." },
      { question: "What is the purpose of the last event ID in SSE reconnection semantics?", answer: "When an SSE connection drops, the browser sends a Last-Event-ID header with the last received 'id' field value. The server can resume the stream from that point, preventing duplicate or missed events during reconnection." }
    ]
  },

  "jwt-inspector": {
    instructions: [
      { title: "1. Paste JWT Token", desc: "Paste the full JSON Web Token (JWT) string — a three-part base64url-encoded token with dots separating header, payload, and signature." },
      { title: "2. Inspect Header and Payload", desc: "View the automatically decoded header (algorithm, type, kid) and payload (claims like sub, iat, exp, iss) as formatted JSON with type-highlighted values." },
      { title: "3. Validate Signature and Expiry", desc: "The tool checks the token expiration (exp), not-before (nbf), and issued-at (iat) claims against the current time, and optionally verifies the HMAC/RSA/ECDSA signature." }
    ],
    faqs: [
      { question: "How does the JWT inspector decode the token without knowing the secret key?", answer: "JWT consists of three base64url-encoded segments: header and payload are JSON objects encoded in plaintext and can be decoded by anyone. Only the signature requires the secret or public key for verification." },
      { question: "What JWT claims does the inspector check for common security issues?", answer: "It flags tokens with no expiration (missing exp), overly long validity (exp - iat > 24h), alg=none (critical vulnerability), weak algorithms (HS256 vs RS256), and mismatched issuer/audience claims." },
      { question: "Can the tool decode and inspect JWTs signed with asymmetric algorithms like RS256?", answer: "Yes, for RS256/ES256, you can paste the public key (PEM or JWK format) to verify the signature. The tool supports RSA, ECDSA, EdDSA, and HMAC algorithm families." }
    ]
  },

  "oauth2-debugger": {
    instructions: [
      { title: "1. Enter OAuth 2.0 Configuration", desc: "Provide the authorization endpoint, token endpoint, client ID, redirect URI, and requested scopes to start debugging the OAuth 2.0 flow." },
      { title: "2. Select Grant Type and Parameters", desc: "Choose the grant type: Authorization Code (with optional PKCE), Client Credentials, Resource Owner Password, or Implicit. Fill in grant-specific parameters like code_verifier or client_secret." },
      { title: "3. Step Through Flow", desc: "Click each step to simulate the OAuth handshake: authorization request, redirect handling, token exchange, and token refresh. View request and response details at each step." }
    ],
    faqs: [
      { question: "What OAuth 2.0 grant types does the debugger support for interactive testing?", answer: "It supports Authorization Code (with PKCE S256/plain), Client Credentials (machine-to-machine), Resource Owner Password (legacy, not recommended), and Implicit (deprecated by OAuth 2.1)." },
      { question: "How does the debugger help troubleshoot redirect URI mismatches?", answer: "The tool compares the redirect_uri sent in the authorization request against the one configured in the authorization server's response. A mismatch is highlighted with the exact difference shown in red." },
      { question: "Can the debugger inspect and decode the returned ID token from an OpenID Connect flow?", answer: "Yes, when OIDC scope is included, the tool decodes the returned id_token JWT, extracts standard claims (sub, email, preferred_username), and validates the nonce and at_hash if present." }
    ]
  },

  "saml-decoder": {
    instructions: [
      { title: "1. Paste SAML Response", desc: "Paste the base64-encoded SAML response XML string (often from a SAMLResponse form field) or the raw XML envelope from an HTTP POST binding." },
      { title: "2. Decode and Pretty-Print XML", desc: "The tool decodes the base64 content, inflates (if deflate-compressed), and pretty-prints the SAML XML with syntax highlighting and collapsible assertion sections." },
      { title: "3. Inspect Assertion Details", desc: "Review parsed attributes like issuer, subject (NameID), conditions (NotBefore, NotOnOrAfter), authentication context, and attribute statements with friendly names and values." }
    ],
    faqs: [
      { question: "What SAML bindings and encoding formats does the decoder support?", answer: "It supports HTTP POST binding (base64-encoded XML), HTTP Redirect binding (base64 + deflate + RelayState), and artifact binding. Both SAML 2.0 and SAML 1.1 response formats are recognized." },
      { question: "How does the tool validate the SAML assertion conditions and timestamps?", answer: "The tool checks NotBefore and NotOnOrAfter conditions against the current time, validates AudienceRestriction against a configured expected audience, and verifies SubjectConfirmation method (bearer, holder-of-key)." },
      { question: "Can the SAML decoder verify the XML digital signature on the assertion?", answer: "Yes, if you provide the IdP's X.509 certificate (from the XML KeyDescriptor or uploaded separately), the tool validates the XML Signature (ds:Signature) using RSA-SHA256 or RSA-SHA1 over the signed info." }
    ]
  },

  "sql-injection-detector": {
    instructions: [
      { title: "1. Enter SQL Query or Input", desc: "Paste an SQL query, a user input string, or a web request parameter to test for potential SQL injection vulnerabilities and patterns." },
      { title: "2. Select Database Type", desc: "Choose the target database: MySQL, PostgreSQL, SQL Server, Oracle, or SQLite — each has different injection syntax, comment styles, and function signatures." },
      { title: "3. Review Detection Results", desc: "The tool highlights suspicious patterns like UNION SELECT, OR 1=1, stacked queries, time-based payloads, and out-of-band exfiltration attempts with severity ratings." }
    ],
    faqs: [
      { question: "What SQL injection patterns does the detector identify and classify?", answer: "It detects classic tautologies (OR 1=1), UNION-based extraction, blind boolean (AND 1=1 vs AND 1=2), time-based (SLEEP, WAITFOR DELAY), error-based (CONVERT, CAST), stacked queries, and second-order injection indicators." },
      { question: "How does the tool distinguish between intentional SQL and likely injection attempts?", answer: "The tool uses a weighted scoring system — common SQL keywords in legitimate queries score low, while patterns like 'OR 1=1--', stacked semicolons, and DBMS-specific comments (#, --) in user-input contexts score high as threats." },
      { question: "Can the detector identify parameterized query placeholders vs concatenated injection?", answer: "Yes, it flags queries with string concatenation (+ or ||) of user input variables, especially near WHERE clauses. Properly parameterized queries using ? or $1 placeholders are marked as safe." }
    ]
  },

  "ssl-certificate-decoder": {
    instructions: [
      { title: "1. Enter Certificate Data", desc: "Paste a PEM-encoded certificate (-----BEGIN CERTIFICATE----- ...), DER (base64 or hex), or PKCS#12 container, or upload a .crt/.pem/.cer/.p12 file." },
      { title: "2. Decode Certificate Fields", desc: "The tool parses and displays all X.509 fields: version, serial number, signature algorithm, issuer, validity period, subject, public key info, and extensions." },
      { title: "3. Review Extensions and Policies", desc: "Examine detailed extension data: Subject Alternative Names (SANs), Key Usage, Extended Key Usage, Basic Constraints, Certificate Policies, and Authority/Subject Key Identifiers." }
    ],
    faqs: [
      { question: "What X.509 certificate fields and extensions does the decoder parse?", answer: "It parses all standard fields plus extensions: SANs (DNS, IP, email), Key Usage (digitalSignature, keyEncipherment), EKU (serverAuth, clientAuth), CRL Distribution Points, Authority Info Access (OCSP, CA Issuers), and custom extensions." },
      { question: "How does the tool decode certificates in different formats like PEM, DER, and PKCS#12?", answer: "PEM is decoded by stripping headers and base64-decoding. DER is decoded as raw binary ASN.1. PKCS#12 containers are decrypted using the provided password, and each certificate (entity + intermediates) is extracted and decoded." },
      { question: "Can the decoder verify the certificate chain against a trusted root store?", answer: "Yes, when you provide intermediate and root certificates, the tool validates the certificate path: each cert's issuer matches the next cert's subject, signature verification, validity period check, and revocation status via CRL/OCSP." }
    ]
  },

  "url-sanitizer": {
    instructions: [
      { title: "1. Enter URL to Sanitize", desc: "Paste the full URL or a list of URLs that need sanitization — removing sensitive data like tracking parameters, session tokens, and personally identifiable information." },
      { title: "2. Select Sanitization Rules", desc: "Choose which parameters to strip: tracking (utm_source, utm_medium, fbclid, gclid), session (sessionid, token, sid), or custom regex patterns for proprietary query parameters." },
      { title: "3. Review and Export Clean URLs", desc: "View the sanitized URL(s) with removed parameters clearly marked. Copy individual URLs or export the entire batch for use in data cleaning pipelines." }
    ],
    faqs: [
      { question: "What tracking and analytics parameters does the URL sanitizer automatically remove?", answer: "It removes UTM tags (utm_source, utm_medium, utm_campaign, utm_term, utm_content), social click IDs (fbclid, gclid, igshid, ttclid), and analytics tokens (_ga, _gl, _hsenc, _openstat) from URLs." },
      { question: "How does the tool handle URL fragments and hash-based routing parameters?", answer: "By default, the hash fragment (#section) is preserved as it's used for client-side routing. Hash-based tracking parameters (#_ga=...) are stripped. The tool also handles URLs with multiple # or ? characters." },
      { question: "Can the sanitizer normalize URLs by lowercasing the domain and removing default ports?", answer: "Yes, enabling URL normalization: lowercases the scheme and hostname, removes default ports (80 for HTTP, 443 for HTTPS), decodes percent-encoded unreserved characters, and removes trailing dots from hostnames." }
    ]
  },

  "csv-data-cleaner": {
    instructions: [
      { title: "1. Upload or Paste CSV Data", desc: "Paste your CSV text or upload a CSV file. The tool auto-detects the delimiter (comma, tab, semicolon, pipe) and displays a preview of the parsed data." },
      { title: "2. Select Cleaning Operations", desc: "Choose from: trim whitespace, remove empty rows, deduplicate rows, normalize date formats, fix encoding issues, standardize number formats, and fill missing values." },
      { title: "3. Apply and Export Clean Data", desc: "Review the cleaning diff showing before/after for each changed cell. Export the cleaned CSV with the same or a custom delimiter." }
    ],
    faqs: [
      { question: "What CSV data quality issues can the cleaner detect and fix automatically?", answer: "It detects leading/trailing whitespace, inconsistent quote escaping, mixed line endings (CRLF vs LF), BOM markers, encoding mismatches (UTF-8 vs Latin-1), extra delimiters within quoted fields, and blank rows." },
      { question: "How does the deduplication feature determine which rows are duplicates?", answer: "You can deduplicate based on all columns matching exactly or select specific key columns. The tool keeps the first occurrence by default and marks removed duplicates in a separate report." },
      { question: "Can the cleaner standardize date formats across the entire CSV to a single format?", answer: "Yes, the date normalization feature detects 20+ common date formats (MM/DD/YYYY, DD-MM-YYYY, YYYYMMDD, ISO 8601) and converts all date columns to your chosen output format with timezone handling." }
    ]
  },

  "csv-statistics": {
    instructions: [
      { title: "1. Upload or Paste CSV Data", desc: "Paste your CSV data or upload a CSV file. The tool automatically parses the header row and identifies each column's data type (numeric, text, date, boolean)." },
      { title: "2. Select Columns for Analysis", desc: "Choose which columns to include in the statistical analysis. Numeric columns generate descriptive statistics; text columns generate frequency and distribution reports." },
      { title: "3. Review Statistical Report", desc: "View per-column statistics: count, unique values, missing values, mean, median, mode, standard deviation, min, max, percentiles (P25, P50, P75, P95, P99), and a histogram distribution." }
    ],
    faqs: [
      { question: "What descriptive statistics does the CSV statistics tool compute for numeric columns?", answer: "It computes count, sum, mean, median, mode, variance, standard deviation, coefficient of variation, skewness, kurtosis, min, max, range, interquartile range (IQR), and 10 percentiles from P5 to P99." },
      { question: "How does the tool handle missing or null values in the statistical calculations?", answer: "Missing values are excluded from calculations and reported as a separate count. The tool shows both the count of non-null values used in calculations and the count of null/excluded values." },
      { question: "Can the tool generate frequency distributions and histograms for categorical data?", answer: "Yes, for text/categorical columns, it generates a frequency table with absolute count, relative frequency (percentage), cumulative frequency, and a horizontal bar chart of the top 20 values." }
    ]
  },

  "csv-to-sqlite": {
    instructions: [
      { title: "1. Upload CSV Files", desc: "Upload one or multiple CSV files. Each CSV file will become a separate table in the SQLite database with column types auto-detected from the data." },
      { title: "2. Configure Schema Options", desc: "Set the database name, choose whether the first row is a header (column names), set column types (TEXT, INTEGER, REAL, BLOB) or let the tool infer them from data samples." },
      { title: "3. Generate and Download", desc: "Click Convert to generate a .sqlite file. Download the SQLite database or get the equivalent SQL CREATE TABLE + INSERT statements." }
    ],
    faqs: [
      { question: "How does the tool infer SQLite column types from CSV data?", answer: "The tool samples the first 1000 rows, attempts to parse each column as INTEGER first, then REAL, then TEXT. If >80% of values parse as a numeric type, that type is assigned. Otherwise TEXT is used as the fallback type." },
      { question: "What happens when a CSV row has fewer columns than the header row?", answer: "Missing values are inserted as NULL. The tool logs warnings with the row numbers of incomplete rows so you can verify data integrity after conversion." },
      { question: "Can the tool handle CSV files that are too large for browser memory?", answer: "Files up to 500 MB are processed in chunks using the File API's streaming capabilities. A progress indicator shows conversion status. For larger files, the tool suggests splitting into smaller CSVs first." }
    ]
  },

  "hash-verifier": {
    instructions: [
      { title: "1. Upload or Paste File Content", desc: "Paste the file content or upload a file to verify its integrity against a known hash. All processing happens locally in your browser." },
      { title: "2. Enter Expected Hash", desc: "Enter the expected hash value in hex format. Select the algorithm used: MD5, SHA-1, SHA-256, SHA-384, SHA-512, SHA-3, or BLAKE2b." },
      { title: "3. Compare and Verify", desc: "The tool computes the hash of your file and performs a case-insensitive comparison, showing a green checkmark for a match or a red X with the actual computed hash for a mismatch." }
    ],
    faqs: [
      { question: "What hash algorithms does the verifier support for file integrity checking?", answer: "It supports MD5, SHA-1, SHA-256, SHA-384, SHA-512, SHA-3 (256/384/512), BLAKE2b (256/512), and BLAKE2s. SHA-256 is recommended for general-purpose file integrity verification." },
      { question: "How does the tool handle large files during hash computation?", answer: "Files are read in 64 MB chunks using the File API's slice method. Each chunk is fed to the Web Crypto API incrementally, preventing browser memory exhaustion regardless of file size." },
      { question: "Can the tool verify checksums from common formats like SHA256SUMS files?", answer: "Yes, the batch verification mode accepts a SHA256SUMS-style file with hash + filename pairs and automatically computes and compares all listed files against their expected hashes." }
    ]
  },

  "backslash-escape": {
    instructions: [
      { title: "1. Enter Text to Escape or Unescape", desc: "Paste the string you want to escape or unescape. The tool processes special characters like newlines, tabs, quotes, and Unicode characters." },
      { title: "2. Select Escape Context", desc: "Choose the target context: JavaScript string, JSON string, Python string, C string, SQL string, or generic backslash escaping for shell commands." },
      { title: "3. Choose Direction and Process", desc: "Toggle between Escape (add backslashes) and Unescape (remove backslashes). Copy the result for use in your code." }
    ],
    faqs: [
      { question: "What special characters does the backslash escape tool handle for JavaScript strings?", answer: "It escapes: single quote (\\'), double quote (\\\"), backslash (\\\\), newline (\\n), carriage return (\\r), tab (\\t), form feed (\\f), backspace (\\b), and Unicode characters above U+FFFF using \\u{XXXXX} syntax." },
      { question: "How does escaping differ between JavaScript strings and JSON strings?", answer: "JSON strings require escaping of double quotes and backslashes, but not single quotes. JavaScript strings additionally escape single quotes and recognize \\v (vertical tab) and \\0 (null character). The tool adjusts per context." },
      { question: "Can the tool escape text for use in SQL query literals?", answer: "Yes, SQL mode escapes single quotes by doubling them ('' instead of ') per ANSI SQL standard, and handles backslash escaping for MySQL where \\' is used. Note: always prefer parameterized queries over manual escaping." }
    ]
  },

  "base32-encoder": {
    instructions: [
      { title: "1. Enter Input Data", desc: "Type or paste text, or upload a file to encode or decode using the Base32 encoding scheme as defined by RFC 4648." },
      { title: "2. Choose Base32 Variant", desc: "Select Standard Base32 (uppercase A–Z and 2–7) for general use, or Base32hex (0–9 and A–V) for lexicographically sortable output, as used in DNSSEC and NSEC3 records." },
      { title: "3. Encode or Decode", desc: "Click Encode to convert to Base32 or Decode to convert back. View the result with optional padding (= characters) or without." }
    ],
    faqs: [
      { question: "What is the difference between Base32 and Base64 encoding in terms of efficiency?", answer: "Base32 encodes 5 bits per character (40% overhead) while Base64 encodes 6 bits per character (33% overhead). Base32 is less space-efficient but uses only alphanumeric characters, making it suitable for case-insensitive systems." },
      { question: "Where is Base32 encoding commonly used in practice?", answer: "Base32 is used in TOTP/HOTP shared secrets (Google Authenticator encodes secrets in Base32), DNSSEC NSEC3 record hashes, Magnet links (BitTorrent), and Crockford's Base32 for human-friendly identifiers." },
      { question: "How does the tool handle padding in Base32 encoded output?", answer: "Base32 output is padded with = characters to make the output length a multiple of 8 characters. The tool provides options to include padding (standard), omit padding (RFC 4648 section 6), or add padding validation when decoding." }
    ]
  },

  "base64-encode-decode": {
    instructions: [
      { title: "1. Enter Input Data", desc: "Type or paste text, upload a file, or choose from sample data to encode or decode using Base64 (RFC 4648) or Base64-URL (RFC 4648 section 5)." },
      { title: "2. Choose Encoding Options", desc: "Select Standard Base64 (with + and / characters) for general use, or Base64-URL (with - and _ characters, no padding) for URL-safe contexts like JWTs and signed URLs." },
      { title: "3. Encode or Decode", desc: "Click Encode to convert to Base64 or Decode to convert back. View both the result and a character-by-character breakdown of the encoding process." }
    ],
    faqs: [
      { question: "What is the difference between Base64 and Base64-URL encoding?", answer: "Standard Base64 uses + and / characters which need URL encoding in query strings. Base64-URL replaces + with - and / with _, omits padding = characters, and is safe for use in URLs, filenames, and JWT without additional percent-encoding." },
      { question: "How does the tool handle decoding of malformed Base64 strings?", answer: "It gracefully handles common issues: missing padding (= characters are added if needed), whitespace is stripped, and invalid characters are flagged with their position. Non-ASCII input is assumed to be UTF-8." },
      { question: "Can the tool detect whether a given string is already Base64-encoded?", answer: "Yes, the auto-detect mode analyzes the character set (A-Z, a-z, 0-9, +, /, =), checks string length divisibility by 4, and attempts decoding to verify — showing a confidence score for the detection." }
    ]
  },

  "base64-json-decoder": {
    instructions: [
      { title: "1. Enter Base64-Encoded JSON", desc: "Paste a Base64 string that contains a JSON payload. This is commonly found in JWT payloads, API tokens, and encoded configuration blobs." },
      { title: "2. Decode Automatically", desc: "The tool decodes the Base64 string to raw text and attempts to parse the result as JSON. If parsing succeeds, the JSON is pretty-printed and syntax-highlighted." },
      { title: "3. Inspect Decoded JSON", desc: "Browse the decoded JSON structure with collapsible tree view. Copy individual field values or the entire decoded object." }
    ],
    faqs: [
      { question: "What happens if the Base64 decoded content is not valid JSON?", answer: "The tool still displays the decoded raw text content with character encoding detection. A warning is shown indicating JSON parse failure, along with the position of the syntax error to help you identify the issue." },
      { question: "Can the tool decode nested Base64 encoding (Base64 inside a JSON value that is itself Base64-encoded)?", answer: "Yes, the tool recursively detects and offers to decode nested Base64 strings found within the decoded JSON fields. Each nested level is indented and labeled with its encoding depth." },
      { question: "How does the decoder handle different JSON-like formats inside Base64 wrappers?", answer: "It attempts to parse as standard JSON first. If that fails, it tries JSON5 (comments, trailing commas), HJSON, or YAML. Supported encodings for the Base64 layer include UTF-8, UTF-16LE, and ASCII." }
    ]
  },

  "base64-to-image": {
    instructions: [
      { title: "1. Paste Base64 Image String", desc: "Paste the Base64-encoded image string, with or without the data URI prefix (data:image/png;base64,). Supports PNG, JPEG, GIF, WebP, and SVG formats." },
      { title: "2. Preview the Image", desc: "The tool renders the decoded image in a live preview panel showing the actual dimensions, file size, and MIME type detected from the data URI." },
      { title: "3. Download as Image File", desc: "Click the Download button to save the decoded image as its native format (.png, .jpg, .gif, .webp). Copy the data URI for direct use in HTML or CSS." }
    ],
    faqs: [
      { question: "What image formats are supported for Base64-to-image conversion?", answer: "The tool supports PNG, JPEG, GIF (including animated), WebP, SVG (vector), BMP, ICO, and AVIF. The format is auto-detected from the data URI mime type or by analyzing the decoded image header bytes." },
      { question: "How does the tool handle invalid or corrupted Base64 image data?", answer: "It validates the Base64 string format first, checks the magic bytes of the decoded binary for a valid image signature (PNG header, JPEG SOI, GIF89a), and shows a specific error message if the data is corrupted." },
      { question: "Can the tool convert between image formats after decoding the Base64 string?", answer: "Yes, after decoding, the tool can re-encode the image in a different format. For example, a Base64 PNG can be downloaded as JPEG (with configurable quality) or WebP (with lossless/lossy toggle)." }
    ]
  },

  "binary-to-text": {
    instructions: [
      { title: "1. Enter Binary Data", desc: "Type or paste binary data as a string of 0s and 1s, with or without spaces separating bytes (8-bit groups) for readability." },
      { title: "2. Configure Binary Interpretation", desc: "Choose the bit grouping: 7-bit (ASCII), 8-bit (standard byte), 16-bit (Unicode), or 32-bit (UTF-32). Select endianness for multi-byte interpretations." },
      { title: "3. Convert and View", desc: "Click Convert to decode the binary to text. The tool shows the decimal and hex value for each byte alongside the decoded character." }
    ],
    faqs: [
      { question: "What character encodings does the binary-to-text converter support?", answer: "It supports ASCII (7-bit), extended ASCII/Latin-1 (8-bit), UTF-8 (variable-width), UTF-16LE/BE, UTF-32 LE/BE, and EBCDIC. UTF-8 is the default and recommended encoding." },
      { question: "How does the tool handle binary strings with spaces, hyphens, or other separators?", answer: "It automatically detects and strips common separators: spaces, hyphens, dots, and underscores between byte groups. The tool also accepts raw binary strings without any separator." },
      { question: "Can the tool convert text to binary as a reverse operation?", answer: "Yes, the reverse mode converts any input text to its binary representation, showing each character's code point in binary form with proper byte grouping." }
    ]
  },

  "character-encoding-converter": {
    instructions: [
      { title: "1. Enter Text or Upload File", desc: "Type or paste text, or upload a file to detect and convert between character encodings. The tool auto-detects the current encoding from byte patterns." },
      { title: "2. Detect Current Encoding", desc: "Click Detect to analyze the byte sequences and identify the source encoding — UTF-8, Latin-1 (ISO 8859-1), Windows-1252, Shift JIS, EUC-KR, GB2312, etc." },
      { title: "3. Convert to Target Encoding", desc: "Select the target encoding and click Convert. The tool displays the converted text and provides a hex dump comparison showing bytes before and after conversion." }
    ],
    faqs: [
      { question: "What character encodings does the converter support for detection and conversion?", answer: "It supports 50+ encodings: UTF-8, UTF-16 (LE/BE), UTF-32 (LE/BE), ISO 8859 series (1–16), Windows codepages (1250–1258), Shift JIS, EUC-JP, EUC-KR, GB2312, GBK, Big5, KOI8-R, KOI8-U, and ISO 2022 variants." },
      { question: "How does the tool detect the character encoding of an input with mixed content?", answer: "It uses byte sequence analysis: UTF-8 BOM detection, valid UTF-8 sequence checking, high-byte pattern matching for single-byte encodings, and character range analysis for CJK multi-byte encodings." },
      { question: "What happens when characters in the source encoding have no equivalent in the target encoding?", answer: "Unmappable characters are replaced with the target encoding's replacement character (usually ? or □). The tool provides a fallback strategy selector: skip, replace with ?, or escape as \\uXXXX." }
    ]
  },

  "hex-ascii-converter": {
    instructions: [
      { title: "1. Enter Hex or ASCII Text", desc: "Type hex bytes (with or without spaces, e.g., 48 65 6C or 48656C) or ASCII text. The tool auto-detects which format you entered." },
      { title: "2. Choose Conversion Direction", desc: "Click Hex to ASCII to decode hex bytes to their character representation, or ASCII to Hex to encode text as hexadecimal byte values." },
      { title: "3. View Detailed Breakdown", desc: "The tool shows each hex byte paired with its ASCII character, decimal value, and binary representation in a comprehensive table." }
    ],
    faqs: [
      { question: "What is the difference between hex to ASCII and hex to text conversion?", answer: "Hex to ASCII interprets each hex byte as an ASCII character code (00–7F for standard ASCII). The same operation is commonly referred to as hex to text since ASCII covers the standard English character set." },
      { question: "How does the tool handle hex strings with spaces, colons, or no separators?", answer: "It accepts hex strings with no delimiters (48656C6C6F), spaces (48 65 6C 6C 6F), colons (48:65:6C:6C:6F), or dashes (48-65-6C-6C-6F). The tool normalizes all formats before conversion." },
      { question: "Can the converter handle non-printable ASCII characters and control codes?", answer: "Yes, the tool displays non-printable bytes (00–1F, 7F) as their control code names (NUL, SOH, STX, etc.) and shows the Unicode replacement character U+FFFD for invalid byte sequences." }
    ]
  },

  "hex-text-converter": {
    instructions: [
      { title: "1. Enter Hex String or Plain Text", desc: "Paste a hex string (e.g., 54686520717569636B) or type plain text. The tool detects the input format automatically for bidirectional conversion." },
      { title: "2. Configure Encoding Options", desc: "Select the text encoding: UTF-8 (standard, variable-width), UTF-16 (fixed 2 bytes per code unit), or Latin-1 (1 byte per character) for hex-text conversion." },
      { title: "3. Convert and Inspect", desc: "View the converted output alongside a detailed byte map showing each character, its hex code point, and its binary representation." }
    ],
    faqs: [
      { question: "How does the hex-to-text converter handle UTF-8 encoded characters that are multiple hex bytes long?", answer: "UTF-8 characters can span 1–4 bytes. The tool properly decodes multi-byte sequences, showing the Unicode code point and the actual rendered character (e.g., U+1F600 rendered as 😀)." },
      { question: "What is the difference between this converter and the hex-to-ASCII converter?", answer: "This tool focuses on full Unicode text conversion using variable-width encodings (UTF-8), while the hex-ASCII converter is limited to 8-bit bytes interpreted as ASCII characters without multi-byte character support." },
      { question: "Can the tool convert hex to text for UTF-16 encoded data with BOM?", answer: "Yes, it detects byte order marks (FEFF for BE, FFFE for LE) and automatically selects the correct byte order. It also handles UCS-2 surrogate pairs for characters outside the Basic Multilingual Plane." }
    ]
  },

  "html-entity-encoder": {
    instructions: [
      { title: "1. Enter HTML Content", desc: "Paste HTML content, plain text with special characters, or a specific string that needs HTML entity encoding or decoding." },
      { title: "2. Choose Encoding Direction", desc: "Select Encode to convert special characters to HTML entities (&amp;, &lt;, &gt;, &quot;, &#39;), or Decode to convert entities back to their character equivalents." },
      { title: "3. Select Entity Format", desc: "Choose between named entities (&amp;) for common characters, decimal numeric entities (&#38;) for broader compatibility, or hex numeric entities (&#x26;) for Unicode characters." }
    ],
    faqs: [
      { question: "Which special characters are automatically encoded when converting to HTML entities?", answer: "The five essential XML/HTML entities: & (&amp;), < (&lt;), > (&gt;), \" (&quot;), and ' (&#39; or &apos;). Additionally, non-ASCII and Unicode characters can be encoded as numeric entities for broader compatibility." },
      { question: "How does the tool handle encoding of Unicode characters outside the Latin-1 range?", answer: "Characters above U+00A0 can be encoded as named entities (if available, e.g., &euro; for €) or as numeric entities (&#8364; or &#x20AC;). The tool also offers a mode where only the 5 required characters are encoded." },
      { question: "What is the difference between &amp; and &#38; in HTML and when should each be used?", answer: "Both represent the same character (&). Named entities (&amp;) are human-readable and preferred for common characters. Numeric entities (&#38;) work in contexts where named entity support is limited, like XML without DTD." }
    ]
  },

  "image-to-base64": {
    instructions: [
      { title: "1. Upload an Image File", desc: "Drag and drop or browse to select an image file. Supports PNG, JPEG, GIF, WebP, SVG, BMP, AVIF, and TIFF formats up to 25 MB." },
      { title: "2. Preview and Configure Output", desc: "View a preview of the uploaded image. Optionally resize or compress before encoding. Choose whether to include the data URI prefix (data:image/png;base64,)." },
      { title: "3. Copy Base64 String", desc: "Copy the generated Base64 string to your clipboard. The tool displays the encoded length and original file size for comparison." }
    ],
    faqs: [
      { question: "How much larger is a Base64-encoded image compared to the original binary file?", answer: "Base64 encoding increases file size by approximately 33% over the original binary. A 100 KB image becomes about 137 KB of Base64 text (including data URI prefix) due to the 6-bit to 8-bit encoding overhead." },
      { question: "When should I use Base64 images in HTML/CSS instead of separate image files?", answer: "Base64 images are useful for small images (under 10 KB) that are embedded in CSS or HTML to reduce HTTP requests. For larger images, separate files load faster because browsers cache them independently." },
      { question: "Can the tool process multiple images at once for batch conversion?", answer: "Yes, upload multiple images and each is processed independently. The output shows all Base64 strings with labels, and you can copy individual results or download all as a JSON map of filename to Base64 string." }
    ]
  },

  "ip-address-converter": {
    instructions: [
      { title: "1. Enter IP Address", desc: "Type an IPv4 address (e.g., 192.168.1.1) or IPv6 address (e.g., 2001:db8::1) to convert between formats and representations." },
      { title: "2. Select Conversion Type", desc: "Choose: IPv4 to IPv6 (IPv4-mapped IPv6), IPv6 to IPv4 (extract embedded IPv4), IP to integer, integer to IP, binary representation, or hex representation." },
      { title: "3. View All Representations", desc: "The tool displays the IP in decimal, hex, binary, octal, integer, and compressed/expanded IPv6 formats side by side." }
    ],
    faqs: [
      { question: "How does the tool convert an IPv4 address to its integer representation?", answer: "The formula is (octet1 * 2^24) + (octet2 * 2^16) + (octet3 * 2^8) + octet4. For example, 192.168.1.1 equals 3232235777. The tool shows the calculation steps for educational purposes." },
      { question: "What is an IPv4-mapped IPv6 address and how is it formatted?", answer: "IPv4-mapped IPv6 addresses embed an IPv4 address in the last 32 bits of an IPv6 address, formatted as ::ffff:192.168.1.1 or ::ffff:c0a8:101. These are used in dual-stack applications to represent IPv4 connections over IPv6 sockets." },
      { question: "Can the converter handle IPv6 shorthand notation and expand it fully?", answer: "Yes, it expands shortened IPv6 addresses (::1 → 0:0:0:0:0:0:0:1), removes leading zeros per group, converts mixed IPv4/IPv6 notation (::ffff:192.168.1.1), and validates the address structure." }
    ]
  },

  "ip-range-expander": {
    instructions: [
      { title: "1. Enter IP Range or CIDR", desc: "Paste an IP range (e.g., 192.168.1.1–192.168.1.255), CIDR block (e.g., 10.0.0.0/24), or comma-separated list of IPs to expand into individual addresses." },
      { title: "2. Configure Output Options", desc: "Choose IPv4 or IPv6 mode, set the maximum number of addresses to display (100–10000), and select output format: one per line, comma-separated, or as CIDR blocks." },
      { title: "3. Generate Expanded List", desc: "Click Expand to generate all IPs in the range. The tool shows a summary with total count, first/last IP, and subnet mask." }
    ],
    faqs: [
      { question: "What IP range formats does the expander accept as input?", answer: "It accepts CIDR notation (10.0.0.0/24), explicit start-end range (10.0.0.1–10.0.0.254), wildcard notation (10.0.0.*), octet range (10.0.0.{1..254}), and mixed formats in a single input." },
      { question: "How does the tool handle very large IP ranges like /16 networks (65,536 addresses)?", answer: "For ranges larger than 10,000 addresses, the tool shows a preview of the first and last 100 IPs with pagination. A summary table shows subnet breakdowns instead of expanding every single address." },
      { question: "Can the expander detect overlapping IP ranges and merge them?", answer: "Yes, when multiple ranges are entered, the tool detects overlaps and optionally merges contiguous ranges into larger CIDR blocks. Merged ranges are shown alongside the original entries." }
    ]
  },

  "json-escape-unescape": {
    instructions: [
      { title: "1. Enter JSON or Text", desc: "Paste a JSON string that needs escaping (special characters converted to escape sequences) or a string with escape sequences that needs unescaping." },
      { title: "2. Choose Escape Direction", desc: "Select Escape to convert newlines, tabs, quotes, and backslashes to \\n, \\t, \\\", \\\\ sequences, or Unescape to convert escape sequences back to their literal characters." },
      { title: "3. Process and Copy", desc: "Click Process to apply the escaping or unescaping. The result is displayed with syntax highlighting for easy verification before copying." }
    ],
    faqs: [
      { question: "Which special characters are escaped when converting to JSON-safe strings?", answer: "Double quotes (\"), backslashes (\\), forward slash (/) for HTML embedding, control characters (\\b, \\f, \\n, \\r, \\t), and Unicode characters above U+FFFF are escaped as \\uXXXX sequences." },
      { question: "What is the difference between JSON.stringify with escaping vs manual escaping?", answer: "JSON.stringify automatically handles all escaping rules including Unicode surrogate pairs and invalid UTF-8 sequences. Manual escaping may miss edge cases like embedded null characters or half-surrogates." },
      { question: "How does the tool handle invalid escape sequences during unescaping?", answer: "Invalid sequences like \\x or \\z are left as-is with a warning. The tool also handles common ambiguities: \\u0041 is correctly decoded to A, and \\\\u0041 remains the literal \\u0041." }
    ]
  },

  "json-flattener": {
    instructions: [
      { title: "1. Paste Nested JSON", desc: "Paste a JSON object with nested structures — objects within objects, arrays, and mixed data types that need to be flattened into a single-level structure." },
      { title: "2. Choose Flattening Strategy", desc: "Select the key separator (dot: user.name, underscore: user_name, bracket: user[name]), how to handle arrays (indexed or bracketed), and whether to include empty values." },
      { title: "3. View and Export Flattened Result", desc: "The flattened JSON is displayed as a single-level object with compound keys. Copy as JSON or CSV, or preview as a table." }
    ],
    faqs: [
      { question: "How does the flattener handle arrays within nested JSON objects?", answer: "Arrays can be flattened using index notation (users.0.name, users.1.name), compressed to a single entry (users.0, users.1), or converted to a comma-separated string for simple types." },
      { question: "What separator options are available for constructing flattened keys?", answer: "Dot notation (address.city), underscore notation (address_city), bracket notation (address[city]), path notation (root/address/city), and custom separator. The tool shows a live preview as you change the separator." },
      { question: "Can the tool perform the reverse operation by unflattening a flat JSON back into nested structure?", answer: "Yes, the reverse mode accepts a flat JSON with compound keys and reconstructs the original nested structure by splitting keys at the separator and creating nested objects and arrays." }
    ]
  },

  "json-formatter": {
    instructions: [
      { title: "1. Paste Raw JSON", desc: "Paste any JSON data (minified, compact, or malformed) into the input panel. The tool validates the JSON and shows line numbers." },
      { title: "2. Configure Formatting Options", desc: "Set indentation size (2, 4, or tab), sort keys alphabetically, toggle trailing commas, and choose between single and double quotes for output." },
      { title: "3. Format and Export", desc: "Click Format to pretty-print the JSON. Copy the formatted output, minify it, or download as a .json file." }
    ],
    faqs: [
      { question: "What JSON validation checks does the formatter perform before formatting?", answer: "It validates: proper opening/closing brackets and braces, valid key-value separators, proper comma placement, valid string escaping, and numeric value formats. Invalid JSON is highlighted with the exact error position." },
      { question: "How does the tool handle very large JSON documents (over 100 MB)?", answer: "Large JSON is processed in streaming mode to avoid browser memory limits. The tool displays a progress bar and incremental preview. For files over 50 MB, minification is faster than pretty-printing." },
      { question: "Can the formatter convert between JSON and JSON5 formats (with comments and trailing commas)?", answer: "Yes, JSON5 mode allows comments (// and /* */), trailing commas, single-quoted keys, and unquoted keys. The tool can convert JSON5 to strict JSON and vice versa." }
    ]
  },

  "json-to-url-params": {
    instructions: [
      { title: "1. Enter JSON Object", desc: "Paste a flat or nested JSON object that you want to convert into URL query string parameters with proper encoding." },
      { title: "2. Configure Serialization Style", desc: "Choose how nested objects are serialized: bracket-notation (user[name]=John), dot-notation (user.name=John), or repeated-key (name=John&name=Doe for arrays)." },
      { title: "3. Generate URL with Params", desc: "Click Convert to generate the query string. Copy just the query string (?key=value&...) or the full URL if you provide a base URL." }
    ],
    faqs: [
      { question: "How does the tool encode special characters in URL parameter names and values?", answer: "All parameter names and values are percent-encoded using encodeURIComponent: spaces become %20, & becomes %26, = becomes %3D, and Unicode characters are encoded as UTF-8 byte sequences (e.g., é → %C3%A9)." },
      { question: "What is the difference between bracket-notation and dot-notation for nested JSON?", answer: "Bracket notation (user[profile][name]=John) is widely compatible with PHP, Rails, and Express apps. Dot notation (user.profile.name=John) is used by some GraphQL clients and C#/.NET systems." },
      { question: "Can the tool convert URL parameters back into a JSON object (reverse operation)?", answer: "Yes, the reverse mode parses a query string using the selected notation convention and reconstructs the original JSON object, handling arrays from repeated keys automatically." }
    ]
  },

  "json-to-zod": {
    instructions: [
      { title: "1. Paste Sample JSON", desc: "Paste an example JSON object or array that represents the shape of data you want to validate with a Zod schema in TypeScript." },
      { title: "2. Configure Schema Options", desc: "Toggle options: mark fields as optional or required, set nullable fields, generate string enums from literal values, add min/max constraints for numbers and strings." },
      { title: "3. Generate and Export Zod Schema", desc: "Copy the generated Zod schema code. The tool outputs valid TypeScript with import statements, ready to use in your project with Zod." }
    ],
    faqs: [
      { question: "How does the tool infer Zod types from JSON data?", answer: "Strings become z.string(), numbers become z.number(), booleans become z.boolean(), arrays become z.array(), nullables become z.nullable(), and objects become z.object() with inferred property types." },
      { question: "Can the tool detect enum-like fields (limited set of string values) and generate z.enum()?", answer: "Yes, when a string field has fewer than 8 unique values across the sample array, the tool generates z.enum(['value1', 'value2']) instead of z.string(), with each value properly quoted." },
      { question: "Does the generated Zod schema include .describe() annotations from JSON field names?", answer: "Yes, each field gets a .describe() call with the original JSON key name for documentation. Comments from JSON5 input are also preserved as .describe() annotations in the output." }
    ]
  },

  "jsonl-formatter": {
    instructions: [
      { title: "1. Paste JSONL Data", desc: "Paste JSONL (JSON Lines) data where each line is a valid JSON object or array. The tool parses and validates each line independently." },
      { title: "2. Format and Validate", desc: "Click Format to pretty-print each JSON line with consistent indentation. Invalid lines are highlighted with the specific JSON parse error." },
      { title: "3. View Summary and Export", desc: "View total lines, valid vs invalid count, byte size, and detected schema across all records. Export as formatted JSONL or pretty-printed JSON array." }
    ],
    faqs: [
      { question: "What is JSONL format and how does it differ from regular JSON?", answer: "JSONL (JSON Lines, RFC 7464) stores one JSON object per line, with a record separator (0x1E) optionally preceding each line. Unlike a JSON array, JSONL can be streamed line by line and appended to incrementally." },
      { question: "How does the tool validate each line of JSONL independently?", answer: "Each line is parsed separately with its own JSON.parse() call. Lines that fail parsing are shown with the error message and character position. The tool also checks for blank lines and leading/trailing whitespace." },
      { question: "Can the tool sort or filter JSONL records based on field values?", answer: "Yes, the query mode lets you filter records using simple field comparisons (field == value, field contains text) and sort by numeric or string fields in ascending or descending order." }
    ]
  },

  "ndjson-to-json": {
    instructions: [
      { title: "1. Paste NDJSON Data", desc: "Paste newline-delimited JSON data where each line is a separate JSON object. The tool accepts data with trailing newlines and empty lines." },
      { title: "2. Choose Conversion Direction", desc: "Select NDJSON to JSON (wraps lines in a JSON array with commas) or JSON to NDJSON (extracts array elements into individual lines)." },
      { title: "3. Configure Output Options", desc: "For NDJSON to array: toggle pretty-printing of array elements. For JSON to NDJSON: choose to minify objects or preserve formatting." }
    ],
    faqs: [
      { question: "How is NDJSON different from JSONL?", answer: "NDJSON (Newline-Delimited JSON) and JSONL are effectively the same format — one JSON object per line. JSONL typically includes the record separator byte (0x1E) while NDJSON uses only newlines as delimiters." },
      { question: "How does the conversion handle JSON array elements that are themselves arrays or deeply nested?", answer: "Each element of the source array is treated as an independent JSON value for the line-by-line output. Deeply nested structures are preserved exactly, with no flattening of the internal structure." },
      { question: "Can the tool stream large NDJSON files that don't fit in browser memory?", answer: "For files up to 200 MB, the tool uses a streaming line reader that processes one line at a time, building the output incrementally. A progress bar shows conversion status." }
    ]
  },

  "svg-base64-converter": {
    instructions: [
      { title: "1. Upload SVG File or Paste Code", desc: "Paste your SVG markup code or upload a .svg file. The tool validates the SVG XML structure before conversion." },
      { title: "2. Convert to Base64 or Vice Versa", desc: "Click SVG to Base64 to convert the SVG code into a data URI. Click Base64 to SVG to decode a base64-encoded SVG back to raw markup." },
      { title: "3. Choose Output Format", desc: "Select the data URI format: svg+xml for browser embedding or image/svg+xml;base64 for CSS background-image and img src usage." }
    ],
    faqs: [
      { question: "What is the advantage of using SVG as a data URI vs a separate file?", answer: "SVG data URIs eliminate an HTTP request and can be inlined in CSS. However, the base64 encoding adds ~33% overhead. For SVGs under 2 KB, inlining as raw SVG (without base64) is more efficient than base64 encoding." },
      { question: "How does the tool handle SVG files with external references (fonts, images) during conversion?", answer: "External references are flagged with warnings. The tool can optionally inline external resources by converting relative URLs to absolute or by embedding small images as data URIs within the SVG." },
      { question: "Can the converter optimize the SVG by removing unnecessary attributes before encoding?", answer: "Yes, the optional cleanup mode strips editor metadata (Inkscape, Illustrator namespaces), removes empty groups, simplifies paths, and removes unused defs before encoding to reduce data URI size." }
    ]
  },

  "text-to-binary": {
    instructions: [
      { title: "1. Enter Text Input", desc: "Type or paste any text string — letters, numbers, symbols, or Unicode characters including emoji — that you want to convert to binary representation." },
      { title: "2. Select Encoding and Format", desc: "Choose character encoding: ASCII (7-bit), UTF-8 (variable), UTF-16, or UTF-32. Select output format: simple binary string or grouped bytes with separators." },
      { title: "3. Convert and Inspect", desc: "View each character's binary representation, decimal code point, and hex value. The tool shows the full binary sequence as a continuous string or grouped by byte." }
    ],
    faqs: [
      { question: "How does UTF-8 encoding affect the binary representation of characters differently than ASCII?", answer: "ASCII characters (U+0000–U+007F) use 7 bits in UTF-8. Characters above U+007F use 2–4 bytes in UTF-8, while ASCII always uses exactly 7 bits (padded to 8). Emoji like 😀 (U+1F600) require 4 bytes (32 bits) in UTF-8." },
      { question: "What is the difference between binary representation with spaces vs without?", answer: "Without spaces, the binary output is a continuous string of bits. With spaces (grouped by byte), each 8-bit group represents one character in ASCII or one byte in UTF-8, making it easier to read individual character encodings." },
      { question: "Can the tool reverse binary back to the original text for verification?", answer: "Yes, the reverse mode accepts a binary string and converts it back to text using the same encoding setting. This allows you to round-trip test: text → binary → text to verify the conversion is lossless." }
    ]
  },
  "code-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Copy and paste any code snippet or file content that needs transformation. The tool automatically detects the content type and applies context-appropriate formatting rules for optimal output." },
      { title: "2. Step 2", desc: "Select the desired output format and adjust any available options. Each formatting option includes a preview of how it affects the result so you can fine-tune before finalizing." },
      { title: "3. Step 3", desc: "Execute the transformation and review the result. A side-by-side diff view highlights the changes made, allowing you to verify correctness before copying or downloading the output." }
    ],
    faqs: [
      { question: "What formatting options does the tool provide beyond basic indentation control?", answer: "It offers trailing comma insertion or removal, arrow function parenthesis, bracket positioning, quote style conversion, semicolon enforcement, spacing around operators, and property sorting within objects." },
      { question: "How does the tool handle formatting of code embedded within template literals or strings?", answer: "Embedded code blocks such as JSX in JavaScript, CSS-in-JS template literals, and HTML in template strings are recursively processed using their respective parsers for correct formatting." },
      { question: "Can the formatter be configured to work consistently across a multi-language project?", answer: "Yes, project mode lets you define a configuration file that specifies formatting rules for every language in your project, ensuring consistent style across all contributors and CI pipelines." }
    ]
  },

  "css-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Input your CSS code including selectors, properties, at-rules, and media queries. The tool handles regular CSS, CSS modules, and CSS-in-JS template literal stylesheets with full support." },
      { title: "2. Step 2", desc: "Adjust formatting preferences such as indentation width, expanded versus compact property layout, alphabetically sorted properties, and vendor prefix grouping for consistent organization." },
      { title: "3. Step 3", desc: "Apply the formatting to reformat the stylesheet with clean consistent spacing. Copy the formatted CSS output directly or download as a properly organized stylesheet file." }
    ],
    faqs: [
      { question: "How does the CSS formatter handle nested rules and preprocessor nesting structures?", answer: "CSS nesting and PostCSS nesting are recognized and treated with progressive indentation. Each nesting level increases the indent, making the hierarchy visually clear and readable." },
      { question: "Can the formatter sort CSS properties in a specific order for consistent stylesheets?", answer: "Yes, choose from alphabetical sorting, concentric ordering covering position and display through typography and visual properties, or SMACSS-style grouping for organized stylesheets." },
      { question: "How are vendor prefixes and their grouping handled during CSS formatting?", answer: "Vendor-prefixed properties like webkit and moz are grouped together after the standard property by default, or you can enable prefix-first mode where prefixed versions come before the standard property." }
    ]
  },

  "css-minifier": {
    instructions: [
      { title: "1. Step 1", desc: "Paste your CSS source code or upload a stylesheet file that needs to be compressed. The tool accepts any valid CSS including custom properties, preprocessor output, and browser-specific extensions." },
      { title: "2. Step 2", desc: "Select a compression level from safe whitespace removal to aggressive optimization including color shortening and selector merging. Each level offers different size reduction trade-offs." },
      { title: "3. Step 3", desc: "Run the minification process and compare the original file size against the compressed result. Download the minified CSS or copy it directly for use in your production deployment pipeline." }
    ],
    faqs: [
      { question: "How much size reduction can I expect from CSS minification for my stylesheets?", answer: "Typical reduction ranges from 30 to 60 percent depending on original formatting. Safe mode saves about 20 to 30 percent by removing whitespace while aggressive mode can save up to 70 percent." },
      { question: "What CSS optimizations does the aggressive compression mode perform beyond whitespace removal?", answer: "Aggressive mode performs hex color shortening, margin and padding shorthand merging, duplicate selector removal, redundant property removal, zero unit stripping, and font-weight number conversion." },
      { question: "Does the minifier preserve CSS source maps for debugging the minified output files?", answer: "Yes, source map generation can be enabled. The minifier outputs a map file alongside the minified CSS, allowing browser devtools to map minified styles back to the original source." }
    ]
  },

  "html-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste HTML code including doctype, head and body sections, and all nested elements. The tool handles HTML5, XHTML, and legacy HTML with template syntax like Handlebars and EJS." },
      { title: "2. Step 2", desc: "Set formatting preferences like indent size, inline versus block element formatting, quote style for attributes, and attribute ordering rules for consistent HTML structure." },
      { title: "3. Step 3", desc: "Reformat the HTML with proper indentation and line breaks. The tool also validates nesting and closes any unclosed tags while highlighting structural issues found during processing." }
    ],
    faqs: [
      { question: "How does the HTML formatter handle embedded CSS and JavaScript within style and script tags?", answer: "Embedded CSS inside style tags is formatted with the CSS parser and JavaScript inside script tags is formatted with the JS parser. Each embedded language gets its own appropriate formatting." },
      { question: "Can the formatter preserve specific inline elements from being broken onto separate lines?", answer: "Yes, configure inline element preservation for tags like span, strong, em, and anchor so they stay on the same line as surrounding text instead of being treated as block elements." },
      { question: "What attribute ordering options are available for consistent HTML formatting results?", answer: "You can order attributes alphabetically, by importance with id and class first then aria and data attributes, or preserve the original order with the option to add newlines for long lines." }
    ]
  },

  "html-minifier": {
    instructions: [
      { title: "1. Step 1", desc: "Paste full HTML documents or fragments that need to be compressed. The tool handles all HTML versions and can process embedded CSS and JavaScript within the same operation." },
      { title: "2. Step 2", desc: "Toggle minification options like comment removal, whitespace collapse, optional tag removal, and inline style or script minification for maximum size reduction." },
      { title: "3. Step 3", desc: "Generate the compressed HTML and review the size savings. Download the minified file or copy the compact output for use in production environments where bandwidth matters." }
    ],
    faqs: [
      { question: "What HTML elements and attributes can be safely removed during the minification process?", answer: "Optional closing tags for list items and paragraphs are removed per HTML5 spec. Boolean attributes like disabled and checked are collapsed. Default type attributes are stripped from script and style tags." },
      { question: "How does the minifier handle Internet Explorer conditional comments in HTML documents?", answer: "IE conditional comments are preserved by default to maintain compatibility. You can optionally strip them if you no longer need IE support, which reduces the file size further." },
      { question: "Can the minifier process multiple HTML files in batch mode for a complete website build?", answer: "Yes, upload a zip of HTML files for batch processing. Each file is minified individually and packaged as a downloadable zip archive with the same directory structure preserved." }
    ]
  },

  "html-to-jsx": {
    instructions: [
      { title: "1. Step 1", desc: "Paste any HTML markup including standard elements, attributes, inline styles, and nested structures that need conversion to JSX syntax for use in React application components." },
      { title: "2. Step 2", desc: "Configure conversion options such as className versus class, htmlFor versus for, camelCase style attributes, and whether to wrap the output in a functional component template." },
      { title: "3. Step 3", desc: "Run the conversion to transform HTML into JSX syntax with proper React attribute names and event handlers. Copy the resulting JSX for direct use in your React components." }
    ],
    faqs: [
      { question: "What HTML attribute transformations are performed when converting to React JSX syntax?", answer: "Class becomes className, for becomes htmlFor, tabindex becomes tabIndex, style strings become JavaScript objects, and various SVG attributes are converted to their camelCase equivalents." },
      { question: "How does the converter handle inline CSS styles during the HTML to JSX conversion process?", answer: "Inline style strings are parsed and converted to camelCase JavaScript objects. Background-color becomes backgroundColor and font-size becomes fontSize with appropriate value handling." },
      { question: "Can the tool convert SVG elements embedded in HTML to proper JSX SVG syntax format?", answer: "Yes, SVG attributes such as stroke-width becoming strokeWidth and fill-rule becoming fillRule are handled appropriately for inline SVGs within JSX components." }
    ]
  },

  "javascript-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste JavaScript source code with support for all modern ECMAScript versions including ES2024, JSX, TypeScript, and Node.js module syntax with import and export declarations." },
      { title: "2. Step 2", desc: "Choose a formatting preset like Airbnb, Standard, Google, or Prettier default. Configure semicolons, quotes, trailing commas, and arrow function parenthesis preferences precisely." },
      { title: "3. Step 3", desc: "Format the code and review changes in a before and after diff view. Accept the formatted version or adjust settings until the output matches your team's agreed style guide." }
    ],
    faqs: [
      { question: "How does the formatter handle formatting of async and await and Promise chains in JavaScript?", answer: "Async functions and await expressions are formatted with proper indentation. Promise chains are aligned on the dot operator by default or configured to indent on each new chain method." },
      { question: "Can the formatter convert between CommonJS require and ES module import syntax automatically?", answer: "Yes, optional module conversion transforms require calls to import statements and module.exports to export default or named exports for migrating legacy codebases to ESM." },
      { question: "Does the formatter automatically sort and group import statements by their source type categories?", answer: "Yes, import sorting groups built-in modules, third-party packages, and internal modules together. Each group is separated by a blank line for improved code readability." }
    ]
  },

  "js-minifier": {
    instructions: [
      { title: "1. Step 1", desc: "Paste your JavaScript code for compression. The tool supports ES5, ES6+, modules, and TypeScript. It parses the abstract syntax tree to safely rename and compress without breaking anything." },
      { title: "2. Step 2", desc: "Select compression level from basic whitespace removal to advanced dead code elimination, constant folding, and tree shaking for maximum size reduction." },
      { title: "3. Step 3", desc: "Generate the minified JavaScript and compare sizes. Download the minified file with proper naming convention or copy the compressed code for production deployment." }
    ],
    faqs: [
      { question: "What JavaScript minification techniques does the tool apply beyond simple whitespace removal?", answer: "It performs identifier shortening known as mangling, dead code elimination, constant folding where constants are precomputed, expression simplification, and block statement merging." },
      { question: "How does the minifier ensure compatibility with older browsers during the minification process?", answer: "The ES5 compatibility mode avoids using modern syntax like arrow functions and const in the output. Ensure your target browser matrix is set before starting minification." },
      { question: "Can the minifier preserve specific function or variable names from being shortened during mangling?", answer: "Yes, a reserved names list lets you specify identifiers to exclude from mangling such as jQuery dollar sign and underscore for global API names exposed to consumers." }
    ]
  },

  "jsx-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste React JSX or TSX code including components, props, children, fragments, and hooks. The tool handles both JSX and TSX file conventions with full TypeScript support." },
      { title: "2. Step 2", desc: "Configure formatting options like quote style for JSX attributes, bracket position for multi-line props, spacing around expression braces, and self-closing tag behavior." },
      { title: "3. Step 3", desc: "Format the JSX with consistent conventions ensuring props are aligned and children are properly indented. The output follows React best practices for readable component code." }
    ],
    faqs: [
      { question: "How does the JSX formatter handle long prop lists on React components with many properties?", answer: "When a component has more than a few props or a prop value exceeds the line width, each prop is placed on its own line with consistent indentation for readability." },
      { question: "Can the formatter convert between string props and JSX expression props automatically?", answer: "Yes, the formatter can convert static string props to JSX expression props and vice versa based on the configured quote and expression preference for consistency." },
      { question: "Does the tool format inline CSS objects within JSX style props as multi-line object structures?", answer: "Yes, inline style objects are expanded to multi-line format when they contain more than a few properties with each CSS property on its own line using proper camelCase keys." }
    ]
  },

  "markdown-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste Markdown content including headings, lists, tables, code blocks, blockquotes, links, images, and inline formatting like bold and italic text for consistent formatting." },
      { title: "2. Step 2", desc: "Set heading style preferences such as ATX with hashes or Setext with underlines. Configure list marker style, table alignment formatting, and maximum line length for text wrapping." },
      { title: "3. Step 3", desc: "Reformat the Markdown and preview the rendered HTML output alongside the formatted source. This ensures visual correctness while maintaining consistent source formatting." }
    ],
    faqs: [
      { question: "What Markdown formatting inconsistencies does the tool automatically detect and fix?", answer: "It normalizes heading spacing with one space after the hash symbols, list indentation, blank lines around blocks, consistent table column alignment, and trailing spaces removal." },
      { question: "How does the formatter handle long lines and paragraph text wrapping in Markdown documents?", answer: "Paragraphs are wrapped at the configured line width while preserving intentional line breaks. Code blocks and inline code are never reflowed to maintain their original content." },
      { question: "Can the tool format Markdown tables with proper column alignment automatically for readability?", answer: "Yes, tables are reformatted so column widths are uniform based on the longest cell in each column. Alignment markers in the separator row are adjusted to match the configured style." }
    ]
  },

  "markdown-slack-converter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste Markdown-formatted text to convert to Slack mrkdwn or paste Slack message text to convert to standard Markdown. Both conversion directions are fully supported." },
      { title: "2. Step 2", desc: "Choose the conversion direction and review how each element maps between formats. Slack-specific formatting like emoji and mentions have no Markdown equivalent and are preserved." },
      { title: "3. Step 3", desc: "Execute the conversion and copy the result directly to your Slack message or Markdown editor. The tool highlights which elements were transformed and which were preserved as-is." }
    ],
    faqs: [
      { question: "What Markdown elements are converted differently when targeting Slack mrkdwn message format?", answer: "Headings become bold text since Slack has no heading levels, horizontal rules are removed, tables are converted to formatted text, and images become hyperlinks." },
      { question: "How does the tool handle Slack-specific formatting that has no equivalent in standard Markdown?", answer: "Slack emoji shortcuts like smile, channel references like general, and user mentions like username are preserved as-is since they are native to Slack and have no Markdown equivalent." },
      { question: "Can the converter handle Slack message attachments and block kit formatting during conversion?", answer: "Yes, the converter supports Slack message attachment formatting including field titles and values that are converted to Markdown blockquotes or tables with appropriate structure." }
    ]
  },

  "python-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste Python code including functions, classes, decorators, type hints, async and await, list comprehensions, and context managers. Supports Python versions 3.6 through 3.13 syntax." },
      { title: "2. Step 2", desc: "Choose PEP 8 compliant formatting with configurable line length. Set quote style preference, trailing comma policy, and blank line rules around functions and classes." },
      { title: "3. Step 3", desc: "Format the Python code and review a PEP 8 compliance report. The output follows standard Python conventions including proper spacing around operators and consistent indentation." }
    ],
    faqs: [
      { question: "How does the Python formatter handle wrapping of long function signatures and argument lists?", answer: "Long parameter lists are wrapped with each argument on its own line indented from the opening parenthesis following PEP 8 guidelines for hanging indents and alignment." },
      { question: "Can the formatter convert between single-quoted and double-quoted strings consistently in Python code?", answer: "Yes, choose your preferred quote style and the tool converts all strings to the selected style, escaping embedded quotes appropriately for consistent code appearance." },
      { question: "Does the tool automatically sort and group Python imports following PEP 8 import conventions?", answer: "Yes, imports are sorted into groups for standard library, third-party, and local imports. Each group is separated by a blank line and imports within groups are alphabetized." }
    ]
  },

  "scss-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste SCSS code with variables, mixins, functions, nested selectors, parent references, interpolation, and control directives for consistent Sass formatting." },
      { title: "2. Step 2", desc: "Configure nesting depth limits, property sorting order, spacing around operators, and expanded versus compact nested block formatting for better readability." },
      { title: "3. Step 3", desc: "Format the SCSS with proper nesting indentation and spacing. The output maintains the semantic hierarchy while following consistent and readable formatting rules." }
    ],
    faqs: [
      { question: "How does the SCSS formatter handle deep nesting and prevent overly specific selectors?", answer: "The tool warns when nesting exceeds a configurable depth limit. Deeply nested selectors are flagged as potential specificity issues with suggestions to refactor structure." },
      { question: "Can the formatter convert between SCSS and Sass indented syntax during the formatting process?", answer: "Yes, the SCSS to Sass mode converts braces and semicolons to indentation-based syntax and vice versa with comments and variable declarations preserved during conversion." },
      { question: "Does the tool format mixin definitions and include calls with consistent argument formatting?", answer: "Yes, mixin definitions have consistent parameter formatting with one per line for long lists. Include calls are formatted with parentheses handling based on configuration." }
    ]
  },

  "tsx-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste TypeScript JSX code including React components with typed props, generics, type annotations, interfaces, and hooks with full type inference and support." },
      { title: "2. Step 2", desc: "Configure JSX quote style, generic component syntax, type annotation spacing, interface property formatting, and import type versus regular import preferences." },
      { title: "3. Step 3", desc: "Format the TSX code with consistent TypeScript JSX conventions. The output is type-safe and follows both TypeScript and React community best practices for readability." }
    ],
    faqs: [
      { question: "How does the TSX formatter handle generic React components with complex type parameters?", answer: "Generic parameters in JSX are formatted with proper spacing and indentation. The formatter distinguishes JSX tags from TypeScript generics using context-aware parsing heuristics." },
      { question: "Can the formatter convert between type and interface declarations for component props?", answer: "Yes, optional conversion mode transforms interface declarations to type aliases for props, helping maintain consistent style within a project that prefers type over interface." },
      { question: "Does the tool format React hook dependency arrays with consistent spacing and alignment?", answer: "Yes, useEffect and useMemo and useCallback dependency arrays are formatted with each dependency on its own line when the array exceeds the line width." }
    ]
  },

  "typescript-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste TypeScript code with interfaces, types, enums, generics, decorators, mapped types, conditional types, and utility types. Supports TS 4.0 through 5.5 features." },
      { title: "2. Step 2", desc: "Configure semicolon usage, quote style, trailing commas, member delimiters, type annotation spacing, and import and export formatting preferences for the output." },
      { title: "3. Step 3", desc: "Format the TypeScript code with strict convention adherence. The output respects spacing around type annotations and generic parameters for clean readable code." }
    ],
    faqs: [
      { question: "How does the TypeScript formatter handle complex union and intersection types across lines?", answer: "Long union types with the pipe symbol and intersection types with the ampersand are wrapped with each member on its own line indented from the type keyword for readability." },
      { question: "Can the formatter sort and organize interface properties and type members automatically?", answer: "Yes, properties can be sorted alphabetically or by visibility such as public then private. Optional properties and method signatures are grouped into consistent sections." },
      { question: "Does the tool format JSDoc comments and transform them to TypeScript annotations properly?", answer: "Yes, JSDoc comments are preserved and can optionally be converted to inline type annotations. Parameter descriptions are kept while type tags become TypeScript types." }
    ]
  },

  "yaml-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste YAML data including mappings, sequences, multi-line strings, anchors, aliases, and complex nested structures from configuration files needing formatting." },
      { title: "2. Step 2", desc: "Set indentation width, line wrapping, quote style for strings, boolean format, and whether to sort mapping keys alphabetically for consistent output." },
      { title: "3. Step 3", desc: "Format the YAML with consistent indentation and spacing. The tool also validates structural correctness after formatting to ensure the output is valid YAML." }
    ],
    faqs: [
      { question: "How does the YAML formatter handle inconsistent indentation and fix it automatically?", answer: "The tool detects the dominant indentation level and normalizes all blocks to that level. Mixed tabs and spaces are converted to spaces and alignment is standardized." },
      { question: "Can the formatter convert between block and flow style for YAML collections and mappings?", answer: "Yes, block-style mappings can be converted to flow-style with curly braces for compact representation and vice versa depending on readability needs." },
      { question: "Does the tool format multi-line strings with the appropriate YAML block scalar indicators?", answer: "Yes, the formatter selects between literal block for strings with newlines and folded block for strings where spaces are preserved but newlines are soft-wrapped." }
    ]
  },

  "avro-to-json-sample": {
    instructions: [
      { title: "1. Step 1", desc: "Paste your Avro schema in JSON format including namespace, type, name, fields with types, default values, and optional properties like doc and order for sample generation." },
      { title: "2. Step 2", desc: "Set the number of sample records to generate and configure random data generation constraints for each field type including strings, numbers, and booleans." },
      { title: "3. Step 3", desc: "Generate realistic JSON sample data from the Avro schema. Download the sample as a JSON file or copy individual records for testing your Avro deserialization logic." }
    ],
    faqs: [
      { question: "How does the tool generate realistic sample data for different Avro field types automatically?", answer: "String fields get lorem ipsum text, int and long fields get random numbers, float and double get decimal values, boolean gets random true or false, and enum picks from defined symbols." },
      { question: "What happens when the Avro schema contains complex nested types like records within records?", answer: "Nested records are recursively generated with the same logic. The depth of nesting is preserved exactly as defined with parent-child relationships maintained in the output." },
      { question: "Can the tool generate sample data matching specific constraints like min and max values?", answer: "Yes, if your Avro schema includes logical types such as decimal or date or custom properties for constraints, the sample generator respects these to produce valid data." }
    ]
  },

  "code-to-curl-converter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste code from any programming language that makes an HTTP request using fetch, axios, requests, httparty, httpClient, or similar HTTP client libraries for conversion." },
      { title: "2. Step 2", desc: "Choose the source language of the code such as JavaScript, Python, Java, Go, Ruby, PHP, or C Sharp so the parser uses the correct pattern matching rules." },
      { title: "3. Step 3", desc: "Convert the source code to the equivalent curl command with all headers, body, method, and URL parameters preserved exactly as they appear in the original source code." }
    ],
    faqs: [
      { question: "How does the converter handle authentication headers like Bearer tokens and Basic Auth?", answer: "Authorization headers are preserved as header flags in curl or converted to the user flag for Basic Auth. The tool warns if it detects hardcoded credentials in the output." },
      { question: "Can the tool convert requests with multipart form data and file uploads to curl syntax?", answer: "Yes, multipart requests are converted to curl form flags. File uploads are represented as form field with at-sign filename with appropriate content type detection." },
      { question: "Does the converter preserve cookie handling and session information from the source code?", answer: "Yes, cookies set via headers or cookie jars are converted to cookie flags in curl. Session state is represented as individual cookie key-value pairs in the command." }
    ]
  },

  "code-to-curl-parser": {
    instructions: [
      { title: "1. Step 1", desc: "Paste source code snippets that include HTTP request creation using common libraries like fetch, axios, and the requests library for parsing into components." },
      { title: "2. Step 2", desc: "The tool automatically identifies the HTTP method, URL, headers, body, query parameters, and authentication from the code pattern regardless of programming language." },
      { title: "3. Step 3", desc: "View the parsed request components displayed in a structured table showing method, URL, headers, body, auth type, and query params for individual copying." }
    ],
    faqs: [
      { question: "What HTTP client libraries across which languages can the parser recognize and extract from?", answer: "It recognizes JavaScript fetch and axios and superagent, Python requests and httpx and aiohttp, Java OkHttp and HttpURLConnection, Go net/http, Ruby Net::HTTP and Faraday." },
      { question: "How does the parser handle dynamically constructed URLs with template literals or concatenation?", answer: "Dynamic URL construction is partially resolved with static parts extracted and dynamic variables shown as placeholders that you can fill in manually to complete the URL." },
      { question: "Can the parser extract request components even when the code is minified or obfuscated?", answer: "The parser works best with readable code. For minified code it makes a best-effort extraction but may miss some patterns. Beautifying the code first improves accuracy." }
    ]
  },

  "curl-to-code": {
    instructions: [
      { title: "1. Step 1", desc: "Paste a curl command including flags like X, H, d, F, b, u, and data or header options from any operating system or API documentation for code generation." },
      { title: "2. Step 2", desc: "Choose the target programming language and HTTP library for the output such as JavaScript fetch, Python requests, Go net/http, or Java OkHttp." },
      { title: "3. Step 3", desc: "Convert the curl command to equivalent code in the target language. The output includes proper imports, error handling, and async patterns where appropriate for production use." }
    ],
    faqs: [
      { question: "How does the converter handle complex curl features like data-binary and form and cookie-jar?", answer: "Data-binary becomes raw body with binary encoding, form becomes multipart form data construction, and cookie-jar becomes cookie store setup with appropriate functionality." },
      { question: "Can the tool generate both synchronous and asynchronous versions of the HTTP call?", answer: "Yes, toggle between sync and async output. JavaScript supports async fetch versus synchronous XMLHttpRequest and Python supports httpx sync versus async modes." },
      { question: "Does the generated code include proper error handling and status code checking logic?", answer: "Yes, the output includes try-catch blocks, HTTP status validation checking for 2xx responses and throwing on 4xx and 5xx, and connection timeout handling." }
    ]
  },

  "curl-to-code-converter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste a curl command string from API documentation or terminal history covering both short and long-form flag variations for conversion to production code." },
      { title: "2. Step 2", desc: "Select the target programming language and preferred HTTP library including JavaScript, Python, Go, Rust, or Java with their respective popular HTTP clients." },
      { title: "3. Step 3", desc: "Generate production-ready code with type definitions, response parsing, retry logic, timeout configuration, and environment variable placeholders for sensitive values." }
    ],
    faqs: [
      { question: "How does the converter handle insecure and cacert curl flags for TLS configuration?", answer: "Insecure sets SSL verification to false with a security warning and cacert adds custom CA bundle configuration in the generated code with proper file paths." },
      { question: "Can the tool convert curl commands with piped input or output redirection operators?", answer: "Piped input and output redirection are flagged as they depend on the shell environment. The generated code includes comments suggesting equivalent data flow handling." },
      { question: "Does the generated code use environment variables for configurable values like tokens and URLs?", answer: "Yes, sensitive values like Bearer tokens, API keys, and base URLs are replaced with environment variable references for secure deployment across environments." }
    ]
  },

  "jsonrpc-builder": {
    instructions: [
      { title: "1. Step 1", desc: "Enter the JSON-RPC method name and parameters as a JSON array for positional arguments or a JSON object for named arguments following the JSON-RPC 2.0 specification." },
      { title: "2. Step 2", desc: "Set the request ID as a number or string and ensure the jsonrpc field is set to version 2.0. The tool auto-generates sequential IDs for batch request scenarios." },
      { title: "3. Step 3", desc: "Generate the complete JSON-RPC request payload. Copy the JSON for direct use or test it against a JSON-RPC endpoint to verify the method call works correctly." }
    ],
    faqs: [
      { question: "What is the difference between JSON-RPC positional and named parameter calling conventions?", answer: "Positional parameters use a JSON array where order matters while named parameters use a JSON object with key-value pairs. Named parameters are generally preferred for clarity." },
      { question: "How does the builder handle JSON-RPC batch requests with multiple method calls included?", answer: "Batch requests are constructed by adding multiple request objects to the builder. Each gets its own unique ID and they are wrapped in a JSON array for processing." },
      { question: "Can the tool generate JSON-RPC error objects for testing error handling scenarios?", answer: "Yes, the error builder creates properly formatted JSON-RPC 2.0 error objects with code, message, and optional data field. Standard error codes are predefined." }
    ]
  },

  "pug-to-html-converter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste Pug template code with its indentation-based syntax including mixins, includes, interpolation, and block inheritance from parent templates for HTML conversion." },
      { title: "2. Step 2", desc: "Set indentation for the output HTML and choose whether to pretty-print or minify. Configure self-closing tag format and doctype selection for the target environment." },
      { title: "3. Step 3", desc: "Render the Pug template to HTML with a split-pane preview showing the output alongside the source. Copy the HTML or download it for use in your web application." }
    ],
    faqs: [
      { question: "How does the converter handle Pug mixins and includes during conversion to HTML output?", answer: "Mixins are expanded inline with their arguments substituted. Includes are resolved by reading the referenced file or by displaying a placeholder where the include goes." },
      { question: "Can the converter handle Pug interpolation with variables and unescaped interpolation safely?", answer: "Yes, both escaped and unescaped interpolation are processed. Escaped interpolation is HTML-entity encoded while unescaped interpolation outputs raw HTML content." },
      { question: "Does the tool support Pug conditional statements and iteration during template rendering?", answer: "Yes, conditionals and loops are evaluated based on provided sample data or rendered with placeholder values. Each iteration generates corresponding HTML blocks." }
    ]
  },

  "proto-schema-converter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste your protobuf file content including syntax declaration, package, imports, message definitions, enums, oneof fields, map fields, and service definitions for conversion." },
      { title: "2. Step 2", desc: "Choose the target output format such as JSON Schema, TypeScript interfaces, Go structs, GraphQL types, Avro schema, or OpenAPI schema specification." },
      { title: "3. Step 3", desc: "Convert the protobuf schema to the target format with preserved field numbers, types, nested structures, and comments. Download the converted schema file." }
    ],
    faqs: [
      { question: "How does the converter map protobuf scalar types to the target language type system?", answer: "Int32 maps to number or integer, int64 maps to string for JavaScript or long for Java, float and double map to number, string maps to string, bool maps to boolean, and bytes maps to base64." },
      { question: "Can the tool handle protobuf imports and resolve cross-file type references automatically?", answer: "Yes, when all imported proto files are provided the tool resolves type references across files. Forward references and circular imports are handled with proper ordering." },
      { question: "Does the conversion preserve protobuf field options and custom options and comments?", answer: "Yes, field-level options are preserved as annotations. Comments are converted to JSDoc or equivalent documentation in the target format where supported." }
    ]
  },

  "protobuf-decoder": {
    instructions: [
      { title: "1. Step 1", desc: "Upload a binary protobuf file or paste hex or base64 encoded protobuf binary data. The tool reads the raw wire-format bytes without requiring the original schema file." },
      { title: "2. Step 2", desc: "Optionally provide the protobuf schema file for field name resolution. Without a schema the tool decodes field numbers and wire types showing raw field tags and values." },
      { title: "3. Step 3", desc: "View the decoded protobuf as a readable JSON-like structure with field numbers, types such as varint and length-delimited, and values for comprehensive inspection." }
    ],
    faqs: [
      { question: "How does the decoder interpret protobuf wire types to reconstruct the message structure?", answer: "Wire type zero decodes variable-length integers, type one reads eight bytes as fixed 64-bit, type two reads length-delimited strings or embedded messages, and type five reads four bytes." },
      { question: "What information is shown when decoding protobuf without the original proto schema file?", answer: "Without a schema the decoder shows field numbers with their wire types, raw varint and fixed values, length-delimited data as hex, and nested message detection heuristics." },
      { question: "Can the tool decode protobuf messages containing oneof fields and map entries correctly?", answer: "Yes, oneof fields are detected when multiple fields share the same oneof index. Map entries are decoded as repeated key-value message pairs with subfields." }
    ]
  },

  "svg-to-css": {
    instructions: [
      { title: "1. Step 1", desc: "Paste SVG markup including paths, shapes, groups, gradients, patterns, filters, text elements, and transformations that need conversion to CSS properties." },
      { title: "2. Step 2", desc: "Choose the output format such as CSS background-image as data URI or individual CSS properties from SVG attributes. Toggle base64 encoding versus UTF-8 inline SVG." },
      { title: "3. Step 3", desc: "Generate the CSS code as a complete declaration block ready for your stylesheet. The output can be used as a background, mask, or clip-path in your web project." }
    ],
    faqs: [
      { question: "What is the advantage of converting SVG to CSS data URI versus linking a separate SVG file?", answer: "Inline data URIs eliminate HTTP requests and work in CSS backgrounds without file path management. However they increase CSS file size by about 33 percent due to base64 encoding." },
      { question: "How does the tool handle SVG gradients and filters during the CSS conversion process?", answer: "SVG gradients are preserved within the inline SVG data URI. CSS-only linear gradient conversion is available for simple two-stop color gradients lacking complex features." },
      { question: "Can the converter extract individual SVG path data for use as CSS clip-path shapes?", answer: "Yes, individual SVG paths can be extracted and converted to CSS clip-path path format. The tool validates that the path is a single continuous shape suitable for clipping." }
    ]
  },

  "svg-optimizer": {
    instructions: [
      { title: "1. Step 1", desc: "Paste SVG source code or upload an SVG file with paths, shapes, gradients, fonts, and metadata that needs to be optimized for web and production use." },
      { title: "2. Step 2", desc: "Toggle optimization passes including editor metadata removal, empty group collapsing, path precision reduction, unused ID removal, and path merging operations." },
      { title: "3. Step 3", desc: "Optimize the SVG and compare the original versus optimized size with a visual preview. Download the optimized SVG file for use in your production application." }
    ],
    faqs: [
      { question: "How much file size reduction can I expect from SVG optimization for web graphics?", answer: "Typical reduction ranges from 20 to 80 percent depending on the source. SVGs from vector editors have significant metadata overhead of 30 to 60 percent that can be stripped." },
      { question: "What SVG elements and attributes are removed during the cleanup optimization pass?", answer: "Removed elements include editor namespaces, empty groups, unused defs, duplicate IDs, hidden elements, default attribute values, and XML declarations when not needed." },
      { question: "Does the optimizer simplify SVG paths by reducing coordinate precision without visible change?", answer: "Yes, path coordinate precision is reduced to a configurable number of decimal places. A typical path with six decimal places can be reduced without visible quality loss." }
    ]
  },

  "cpp-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste C++ code including classes, templates, namespaces, inheritance, lambdas, smart pointers, and move semantics with C++11 through C++23 standard support." },
      { title: "2. Step 2", desc: "Choose from LLVM, Google, Chromium, Mozilla, WebKit, Microsoft, or GNU styles. Configure access modifier indentation and pointer alignment preferences." },
      { title: "3. Step 3", desc: "Format the code with the selected C++ style and review changes in a diff view. Verify all modifications before accepting the formatted output for your project." }
    ],
    faqs: [
      { question: "How does the C++ formatter handle template declarations with long parameter lists?", answer: "Template declarations are formatted with each parameter on its own line when they exceed the line width. Template arguments in calls are also wrapped with proper alignment." },
      { question: "Can the formatter be configured to match an existing project's specific coding style?", answer: "Yes, you can export the configuration as a clang-format file compatible with the Clang-Format tool for consistency between this online formatter and your local environment." },
      { question: "Does the tool properly format C++ lambda expressions with captures and trailing return types?", answer: "Yes, lambdas are formatted with the capture list, parameters, and body all properly indented. Trailing return types are placed on the same line or wrapped based on line length." }
    ]
  },

  "go-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste Go code including packages, imports, functions, methods, structs, interfaces, goroutines, channels, and error handling for standard Go formatting." },
      { title: "2. Step 2", desc: "Apply gofmt-equivalent formatting to standardize indentation with tabs, import grouping, spacing, and brace placement according to official Go conventions." },
      { title: "3. Step 3", desc: "Review the formatted Go code which follows standard formatting conventions. Imports are sorted and grouped into standard library and external package sections." }
    ],
    faqs: [
      { question: "What Go formatting rules does the tool enforce that are specific to the Go language?", answer: "It enforces tabs for indentation, gofmt-compatible brace placement with opening brace on same line, proper spacing around operators, comment formatting, and file-ending newline." },
      { question: "Can the formatter automatically fix common Go style issues like receiver naming problems?", answer: "Yes, it suggests fixes for receiver names that should be short lowercase letters, variable shadowing detection, proper error variable names, and consistent naming conventions." },
      { question: "Does the tool sort and organize Go imports into standard library and third-party groups?", answer: "Yes, imports are sorted into three groups for standard library, third-party packages, and local module imports with each group separated by a blank line." }
    ]
  },

  "kotlin-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste Kotlin code including classes, data classes, sealed classes, coroutines, extension functions, companion objects, and lambda expressions for consistent formatting." },
      { title: "2. Step 2", desc: "Choose formatting rules such as brace placement, property formatting, spacing around colons, expression body formatting, and trailing comma preferences." },
      { title: "3. Step 3", desc: "Format the Kotlin code following official JetBrains coding conventions. The output ensures consistency across all Kotlin projects in your organization." }
    ],
    faqs: [
      { question: "How does the Kotlin formatter handle formatting of chained method calls and extension functions?", answer: "Chained calls are formatted with each method call on its own line indented by one level. The dot operator is placed at the start of each line for visibility and readability." },
      { question: "Can the formatter convert Java-style code patterns to idiomatic Kotlin during formatting?", answer: "Yes, optional Java to Kotlin conversion transforms getters and setters to properties, static methods to companion object functions, and anonymous classes to lambdas." },
      { question: "Does the tool format Kotlin coroutine code with proper structuring of async and launch blocks?", answer: "Yes, coroutine builders are formatted with proper block indentation. Flow collections and channel operations are formatted with consistent operator placement." }
    ]
  },

  "php-beautifier": {
    instructions: [
      { title: "1. Step 1", desc: "Paste PHP code including classes, namespaces, traits, interfaces, closures, generators, type declarations, and PHP 8.x features like attributes and enums." },
      { title: "2. Step 2", desc: "Set indentation style and brace position according to PSR-2 or PSR-12 standards. Configure namespace ordering and control statement formatting preferences." },
      { title: "3. Step 3", desc: "Beautify the PHP code with syntax validation to highlight any parse errors alongside the formatted output. Fix issues and download the clean code for production." }
    ],
    faqs: [
      { question: "What PHP coding standards does the beautifier support for formatting configuration?", answer: "It supports PSR-1, PSR-2, PSR-12, Symfony, and Drupal coding standards. Each preset configures brace placement, line length, namespace formatting, and visibility ordering." },
      { question: "How does the beautifier handle PHP 8 attributes and named arguments during formatting?", answer: "Attributes are placed on the line above the element they decorate with consistent indentation. Named arguments are formatted with the parameter name and value on the same line." },
      { question: "Can the tool organize PHP use statements alphabetically and group them by type category?", answer: "Yes, use statements are sorted alphabetically and grouped into class imports, function imports, and constant imports with each group separated by a blank line per PSR-12." }
    ]
  },

  "ruby-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste Ruby code including classes, modules, blocks, procs, lambdas, mixins, metaprogramming patterns, and Rails-specific syntax for consistent formatting." },
      { title: "2. Step 2", desc: "Choose from RuboCop default, Shopify, or Airbnb styles. Configure indentation, line length, hash formatting, block style, and quote preference for the output." },
      { title: "3. Step 3", desc: "Format the Ruby code and auto-fix common issues like incorrect spacing, indentation, and style violations. The output follows Ruby community conventions for readability." }
    ],
    faqs: [
      { question: "How does the Ruby formatter handle formatting of block arguments and multi-line blocks?", answer: "Blocks with single-line bodies are formatted with curly braces. Multi-line blocks use do and end with proper indentation. Block arguments have consistent spacing inside pipes." },
      { question: "Can the formatter automatically convert between hash rocket and JSON-style syntax in Ruby?", answer: "Yes, the formatter converts older hash rocket syntax to the modern JSON-style syntax where appropriate and vice versa depending on the configured style preference." },
      { question: "Does the tool format Ruby method chains with proper alignment and line breaking logic?", answer: "Yes, method chains are formatted with the dot at the beginning of each continuation line. Trailing dots are avoided and long chains are wrapped with one method per line." }
    ]
  },

  "rust-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste Rust code including structs, enums, traits, impl blocks, generics, lifetimes, macros, match expressions, closures, and async or unsafe blocks for formatting." },
      { title: "2. Step 2", desc: "Apply rustfmt-equivalent formatting with standard Rust conventions including 100 character line width and 4-space indentation for consistency." },
      { title: "3. Step 3", desc: "Format the Rust code following official Rust style guidelines. Merge and organize use statements into consistent style with alphabetical sorting within groups." }
    ],
    faqs: [
      { question: "What Rust-specific formatting rules does the tool enforce for Rust code formatting?", answer: "It enforces proper placement of where clauses, formatted use statements with nesting, proper spacing around arrow symbols, consistent match arm formatting, and struct literal formatting." },
      { question: "How does the formatter handle Rust macro invocations with complex token trees?", answer: "Macro invocations are preserved with their original formatting by default. Common macros are formatted with consistent spacing and nested macro calls are properly indented." },
      { question: "Can the tool merge and organize Rust use statements into a consistent nested style?", answer: "Yes, use statements can be merged into nested use trees or kept as separate lines. Imports are sorted alphabetically within their groups for organized code." }
    ]
  },

  "swift-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste Swift code including structs, classes, protocols, extensions, enums with associated values, optionals, closures, and async await for proper formatting." },
      { title: "2. Step 2", desc: "Configure indentation, line length, colon spacing, semicolon usage, access control ordering, and protocol conformance formatting according to preferences." },
      { title: "3. Step 3", desc: "Format the Swift code following Apple's API design guidelines and recommended coding standards. The output is clean and follows the Swift community conventions." }
    ],
    faqs: [
      { question: "How does the Swift formatter handle formatting of SwiftUI view builder closures and modifiers?", answer: "SwiftUI view bodies are formatted with each view on its own line. Modifier chains are indented one level from the view with one modifier per line for readability." },
      { question: "Can the formatter convert between Swift old and new coding conventions automatically?", answer: "Yes, optional conversions include key path syntax, objc dynamic to objc only when needed, and old-style closure syntax to trailing closure syntax for modern Swift." },
      { question: "Does the tool properly format Swift error handling with throws and try and catch blocks?", answer: "Yes, throwing functions are formatted with throws before the return arrow. Try expressions have proper spacing and catch blocks are placed correctly with error patterns." }
    ]
  },

  "xml-minifier-validator": {
    instructions: [
      { title: "1. Step 1", desc: "Paste XML content for validation and minification. The tool checks well-formedness including proper nesting, matching tags, correct attribute quoting, and character references." },
      { title: "2. Step 2", desc: "Run validation first to check for XML structure errors. After validation passes, configure minification options to remove whitespace and unnecessary line breaks." },
      { title: "3. Step 3", desc: "Minify the validated XML to remove whitespace and comments. The compact output is suitable for API payloads and storage where file size matters." }
    ],
    faqs: [
      { question: "What XML validation checks does the tool perform beyond basic well-formedness checks?", answer: "It validates namespace prefix declarations match their URIs, element and attribute names follow XML naming rules, CDATA sections are properly terminated, and document structure." },
      { question: "How does the minifier handle XML namespaces and preserve essential whitespace content?", answer: "Namespace declarations are preserved. Whitespace in elements with space equals preserve attribute is kept intact. CDATA sections are preserved but tag whitespace is collapsed." },
      { question: "Can the tool validate XML against an XSD schema or DTD for structural correctness checking?", answer: "Yes, provide an XSD schema or DTD to validate the XML document structure, required elements, attribute types, and data value constraints beyond well-formedness." }
    ]
  },

  "xml-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste XML data including configuration files, SOAP envelopes, RSS feeds, SVG graphics, and data interchange formats for consistent pretty-printing and formatting." },
      { title: "2. Step 2", desc: "Set indentation size, line width, attribute formatting preference for long elements, self-closing tag style, and alphabetical attribute sorting for clean output." },
      { title: "3. Step 3", desc: "Pretty-print the XML with consistent indentation and line breaks. The formatted output shows the hierarchical structure clearly for easier reading and editing." }
    ],
    faqs: [
      { question: "How does the XML formatter handle mixed content with both text and child elements mixed?", answer: "For mixed content models with text interleaved with elements, the tool preserves inline text formatting and does not break text nodes onto separate lines for accuracy." },
      { question: "Can the formatter reformat XML that is already partially formatted with inconsistent indentation?", answer: "Yes, the formatter parses the XML into a DOM structure and regenerates the output from scratch, removing all existing formatting and applying consistent rules." },
      { question: "Does the tool offer options for namespace prefix handling and xmlns attribute placement?", answer: "Yes, xmlns declarations can be kept on the root element or moved to the element where each namespace is first used. Namespace prefixes are preserved or shortened." }
    ]
  },

  "cron-parser": {
    instructions: [
      { title: "1. Step 1", desc: "Type a standard five-field or six-field cron expression with standard operators including ranges, steps, list values, and special time strings for parsing." },
      { title: "2. Step 2", desc: "Parse the cron expression to get a human-readable description explaining when the schedule runs and what each field contributes to the overall timing." },
      { title: "3. Step 3", desc: "Generate the next scheduled execution times based on the cron expression. Verify the schedule accuracy by reviewing the exact dates and times of upcoming runs." }
    ],
    faqs: [
      { question: "What cron expression syntax features does the parser support for complex schedule definitions?", answer: "It supports all standard operators including ranges, steps, and lists. Month and weekday names such as JAN or SUN are supported along with special shortcuts like yearly." },
      { question: "How does the parser handle non-standard cron features like L for last and W for weekday?", answer: "L for last day or month or weekday is supported in extended mode. W for nearest weekday is also supported as Quartz-specific extensions for Java scheduling." },
      { question: "Can the tool detect invalid or impossible cron expressions and suggest corrections for them?", answer: "Yes, it validates that field values are within allowed ranges, detects impossible dates like February 30, and flags expressions that would rarely or never execute." }
    ]
  },

  "crypto-kit": {
    instructions: [
      { title: "1. Step 1", desc: "Choose from available cryptographic operations such as hash generation, HMAC computation, random byte generation, key derivation, or entropy estimation." },
      { title: "2. Step 2", desc: "Select the specific algorithm, key size, iteration count, output encoding format, and additional parameters like salt or initialization vector for the operation." },
      { title: "3. Step 3", desc: "Execute the cryptographic operation in-browser using the Web Crypto API. Copy the result in your preferred encoding format for use in your application or system." }
    ],
    faqs: [
      { question: "What cryptographic algorithms are available in the crypto kit toolkit for developers?", answer: "It includes SHA-256 and SHA-384 and SHA-512, HMAC with all SHA variants, PBKDF2 with adjustable iterations, Argon2id via WASM, AES encryption, HKDF key derivation, and random generation." },
      { question: "How does the tool ensure cryptographic operations are performed securely in the browser?", answer: "All operations use the Web Crypto API which is backed by the operating system's cryptographic primitives. Key material and plaintext never leave the browser environment." },
      { question: "Can the tool be used to generate cryptographically secure random passwords and tokens?", answer: "Yes, the random generation module uses crypto.getRandomValues to produce secure random bytes suitable for generating API keys, session tokens, and initialization vectors." }
    ]
  },

  "docker-run-to-compose": {
    instructions: [
      { title: "1. Step 1", desc: "Paste a docker run command including all flags such as port mappings, volume mounts, environment variables, network settings, and restart policies for conversion." },
      { title: "2. Step 2", desc: "Set the Docker Compose version and service name. Choose whether to include compose-only features like healthcheck, depends_on, and deploy sections in the output." },
      { title: "3. Step 3", desc: "Generate the equivalent docker-compose YAML file. The output is a complete ready-to-use Docker Compose service definition for your containerized application." }
    ],
    faqs: [
      { question: "What docker run flags does the converter map to Docker Compose YAML configuration keys?", answer: "Port mappings become ports, volumes become volumes, environment variables become environment, network becomes networks, restart becomes restart, and name becomes container name." },
      { question: "How does the tool handle docker run commands with multiple containers linked via link flag?", answer: "Multiple containers are each converted to separate services. Link directives are converted to depends_on with optional conditions and shared networks in the networks section." },
      { question: "Can the converter handle complex docker run features like mount with volume options specified?", answer: "Yes, mount type bind or volume or tmpfs is converted to the compose mount syntax. Capabilities become cap_add and security options become security_opt in the output." }
    ]
  },

  "html-preview": {
    instructions: [
      { title: "1. Step 1", desc: "Paste any HTML document or fragment including inline CSS and JavaScript. The tool supports HTML5 with canvas, SVG, WebGL, and modern JavaScript APIs for preview." },
      { title: "2. Step 2", desc: "Set viewport size for desktop, tablet, or mobile preview. Enable responsive mode and toggle dark or light theme simulation for accurate rendering previews." },
      { title: "3. Step 3", desc: "Preview the rendered HTML in a sandboxed iframe. Interactive elements like forms, buttons, links, and JavaScript all behave as in a real browser environment." }
    ],
    faqs: [
      { question: "How does the HTML preview render JavaScript-heavy pages and single-page applications?", answer: "JavaScript is fully executed in the sandboxed iframe including DOM manipulation, fetch requests, and ES modules. The preview updates in real-time as you edit the source code." },
      { question: "Is the preview sandboxed to prevent security risks from untrusted HTML content loading?", answer: "Yes, the preview loads in a sandboxed iframe with restricted permissions including no form submission to external sites and no access to the parent page origin." },
      { question: "Can the tool highlight corresponding source code when an element is hovered in preview?", answer: "Yes, the inspector mode links the preview and source editor. Clicking an element in the preview scrolls the source to the corresponding HTML for debugging layout issues." }
    ]
  },

  "oauth-client-setup": {
    instructions: [
      { title: "1. Step 1", desc: "Choose from built-in OAuth provider templates including Google, GitHub, Facebook, Microsoft, Twitter, and Apple. Alternatively configure a custom provider with your own endpoints." },
      { title: "2. Step 2", desc: "Provide your client ID and client secret if confidential. Set the redirect URI, authorized JavaScript origins, and required scopes for your application needs." },
      { title: "3. Step 3", desc: "Generate the OAuth client configuration with code snippets for multiple languages and environment variables. Download the provider-specific configuration JSON." }
    ],
    faqs: [
      { question: "What OAuth grant types does the client setup wizard support for different application types?", answer: "It supports Authorization Code with PKCE for SPAs and mobile apps, Authorization Code with client secret for server-side apps, Client Credentials for machine to machine, and Device Code." },
      { question: "How does the tool generate provider-specific configuration for different OAuth platforms?", answer: "Each provider has a customized template using the correct format for its console. Google uses Google Cloud Console format and GitHub uses OAuth App settings format." },
      { question: "Can the generated configuration include environment variable placeholders for sensitive credentials?", answer: "Yes, client secrets and client IDs are output as environment variable references for secure deployment across different environments without hardcoding credentials." }
    ]
  },

  "oauth-scope-builder": {
    instructions: [
      { title: "1. Step 1", desc: "Choose from supported OAuth providers like Google, Microsoft, GitHub, Facebook, Slack, or Spotify. Each provider has its own list of available scopes and permissions." },
      { title: "2. Step 2", desc: "Browse the categorized scope list for the selected provider. Each scope shows its full name, data access level, and sensitivity rating for informed selection." },
      { title: "3. Step 3", desc: "Copy the formatted scope string and the full authorization URL with selected scopes. The output is ready for use in your OAuth authorization request to the provider." }
    ],
    faqs: [
      { question: "How does the scope builder help determine the minimum scopes needed for an application?", answer: "Scopes are annotated with the specific API endpoints they enable. The builder shows a dependency tree where broader scopes include narrower ones for least-privilege selection." },
      { question: "Can the tool validate that a scope combination is valid for the selected provider and grant type?", answer: "Yes, it validates scope combinations against provider-specific rules including restricted scopes requiring verification, incompatible pairs, and scopes needing configuration." },
      { question: "Does the scope builder support OpenID Connect scopes and custom claims parameters for OIDC?", answer: "Yes, OIDC scopes are included with explanations of which claims each returns. The builder can also generate a claims parameter for specific claims beyond default mappings." }
    ]
  },

  "password-entropy-calculator": {
    instructions: [
      { title: "1. Step 1", desc: "Type a password to analyze its entropy directly or configure password criteria like length and character sets to calculate theoretical maximum entropy." },
      { title: "2. Step 2", desc: "Review the entropy analysis including bits of entropy, estimated cracking time at various attacker speeds, character set composition, and pattern detection results." },
      { title: "3. Step 3", desc: "Check the password against a local database of common and breached passwords without sending it externally. Weak passwords are flagged with improvement suggestions." }
    ],
    faqs: [
      { question: "How does the password entropy calculator determine the estimated cracking time needed?", answer: "It uses the formula where time equals two to the power of entropy minus one divided by guesses per second. Three tiers are shown from online to massive botnet speeds." },
      { question: "What factors reduce the effective entropy of a password beyond character set and length?", answer: "Patterns like dictionary words, keyboard patterns, repeated characters, common substitutions, dates, names, and previously breached passwords reduce effective entropy." },
      { question: "What is the recommended minimum entropy for different security contexts and applications?", answer: "For online services moderate is 30 to 40 bits and strong is 50 to 60 bits. For encryption keys and password managers more than 80 bits is very strong for security." }
    ]
  },

  "postman-to-openapi-converter": {
    instructions: [
      { title: "1. Step 1", desc: "Upload your Postman Collection JSON in v2.0 or v2.1 format or paste the collection data directly into the input panel for parsing and conversion processing." },
      { title: "2. Step 2", desc: "Set the OpenAPI version to 3.0.3 or 3.1.0 and configure how Postman folders map to API tags. Set schema naming conventions and server base URL from Postman variables." },
      { title: "3. Step 3", desc: "Generate the OpenAPI specification in YAML or JSON format. Download the spec file for use with Swagger UI, code generators, or API documentation tools." }
    ],
    faqs: [
      { question: "How does the converter map Postman collection structures to OpenAPI specification components?", answer: "Postman folders become tags, requests become paths with operations, URL parameters become path or query parameters, request bodies become requestBody schemas, and examples become examples." },
      { question: "What Postman-specific features like scripts are handled during conversion to OpenAPI format?", answer: "Pre-request scripts and test scripts are preserved as custom extensions in the OpenAPI output. Dynamic variables are converted to schema examples or removed based on config." },
      { question: "Can the tool handle Postman collections with variables and environment-based URL structures?", answer: "Yes, Postman variables in URLs are extracted and converted to server variables in OpenAPI. The tool creates a servers array with the variable definitions." }
    ]
  },

  "openapi-to-postman": {
    instructions: [
      { title: "1. Step 1", desc: "Upload an OpenAPI 3.0 or 3.1 specification file in YAML or JSON format or paste the spec content directly from your API documentation source for conversion." },
      { title: "2. Step 2", desc: "Set the base URL for Postman environment, choose whether to include examples, toggle folder creation from tags, and configure authentication method for the collection." },
      { title: "3. Step 3", desc: "Generate a Postman Collection JSON file with all endpoints, parameters, request bodies, and authentication configured. Download and import into Postman for testing." }
    ],
    faqs: [
      { question: "How does the converter map OpenAPI paths and operations to Postman collection items?", answer: "Each OpenAPI path plus operation becomes a Postman request. Tags create folders. Operation summaries become request names and parameters become Postman parameters." },
      { question: "What OpenAPI authentication schemes are converted to Postman authorization presets?", answer: "API Key becomes API Key auth, Bearer HTTP becomes Bearer Token, Basic HTTP becomes Basic Auth, and OAuth flows become OAuth 2.0 with the specified grant type." },
      { question: "Can the tool generate Postman environment variables from OpenAPI server variables defined?", answer: "Yes, server variables become environment variables with default values. Example parameters and request bodies are stored as Postman examples for quick testing." }
    ]
  },

  "rest-endpoint-documenter": {
    instructions: [
      { title: "1. Step 1", desc: "Specify the HTTP method, URL path, path parameters, query parameters, headers, request body schema, response status codes, and response body for documentation." },
      { title: "2. Step 2", desc: "Write clear descriptions for the endpoint, each parameter, and each response code. Provide example request and response bodies demonstrating realistic API usage." },
      { title: "3. Step 3", desc: "Generate API documentation in Markdown, HTML, or OpenAPI format. The output includes all defined endpoints with parameters, examples, and descriptions for consumers." }
    ],
    faqs: [
      { question: "What documentation formats can the REST endpoint documenter generate for API consumers?", answer: "It generates Markdown readable docs with tables, HTML styled documentation page, OpenAPI 3.0 YAML or JSON machine-readable spec, and curl command examples for each endpoint." },
      { question: "How does the tool help ensure documentation completeness for each API endpoint created?", answer: "It tracks required fields including endpoint description, parameter descriptions and types, and response status codes with examples. Missing fields are highlighted before generation." },
      { question: "Can the documenter auto-generate request examples from defined schemas and parameter values?", answer: "Yes, based on parameter types and constraints such as min and max and enum and pattern, the tool generates realistic example values for documentation." }
    ]
  },

  "url-encoder-decoder": {
    instructions: [
      { title: "1. Step 1", desc: "Paste a full URL, URL component, or plain text that needs URL encoding or decoding according to RFC 3986 URI specification standards for web development." },
      { title: "2. Step 2", desc: "Select encode mode to convert special characters to percent-encoded sequences or decode mode to convert percent-encoded strings back to original characters." },
      { title: "3. Step 3", desc: "Apply the encoding or decoding operation and review the original versus converted values side by side with specific changes highlighted for clarity." }
    ],
    faqs: [
      { question: "What is the difference between URL encoding and URL component encoding in the tool?", answer: "Full URL encoding encodes the entire URL including colons and slashes making it unusable. Component encoding only encodes characters invalid in a specific URL component." },
      { question: "Which characters are always encoded in URL percent-encoding according to RFC 3986 rules?", answer: "Reserved characters like colon and slash and question mark and hash are encoded. Spaces become percent-encoded sequences or plus signs in form context." },
      { question: "How does the tool handle Unicode and non-ASCII characters during URL encoding operations?", answer: "Non-ASCII characters including Unicode are first encoded as UTF-8 bytes then each byte is percent-encoded. The tool shows the intermediate UTF-8 byte sequence." }
    ]
  },

  "url-parser": {
    instructions: [
      { title: "1. Step 1", desc: "Paste any valid URL including protocol, hostname, port, path, query string, fragment hash, and authentication credentials for complete component parsing." },
      { title: "2. Step 2", desc: "Parse the URL to extract and display all components such as protocol, hostname, port, pathname, search, hash, username, and password in a structured table." },
      { title: "3. Step 3", desc: "View each URL component with its decoded value in a structured table. Individual components can be copied separately for use in your code or debugging tasks." }
    ],
    faqs: [
      { question: "What URL components does the parser extract from a given URL string or address?", answer: "It extracts protocol, hostname, port, pathname, search or query string, hash or fragment, origin, username, password, and the full href for complete component analysis." },
      { question: "How does the parser handle URLs with internationalized domain names containing Unicode characters?", answer: "IDN domains are shown in both Unicode form and Punycode-encoded form. The parser validates the IDN and shows conversion details for each method." },
      { question: "Can the tool parse and decode query string parameters into a structured key-value table?", answer: "Yes, the query string is parsed into a table showing each parameter name, its decoded value, and whether it appears multiple times with duplicate keys grouped." }
    ]
  },

  "web-inspector": {
    instructions: [
      { title: "1. Step 1", desc: "Type the full URL of the website you want to inspect. The tool fetches the page and analyzes its HTML structure, CSS, JavaScript, and network resources used." },
      { title: "2. Step 2", desc: "Review a comprehensive page analysis including title, meta tags, Open Graph tags, headings structure, links count, and images with or without alt text." },
      { title: "3. Step 3", desc: "Examine technical details such as HTTP headers, HTML document outline, CSS class usage, JavaScript context, form elements, and accessibility landmarks on the page." }
    ],
    faqs: [
      { question: "What technical information does the web inspector extract from a given website URL?", answer: "It extracts page metadata, heading structure for SEO analysis, broken links, images missing alt text, Open Graph and Twitter Card tags, HTTP status, and content type headers." },
      { question: "Can the inspector analyze the page SEO and accessibility compliance automatically for you?", answer: "Yes, it checks meta description presence and length, title tag length, heading hierarchy with single h1 and sequential order, alt text on images, and ARIA landmarks." },
      { question: "Does the tool detect third-party scripts and trackers and analytics services loaded by pages?", answer: "Yes, it identifies known third-party scripts such as Google Analytics and Facebook Pixel and CDN libraries showing their source URLs and categories." }
    ]
  },

  "graphql-query-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste any GraphQL operation including query, mutation, subscription, or fragment definition. The tool handles inline fragments, directives, and variable definitions." },
      { title: "2. Step 2", desc: "Set indentation size, line width, argument formatting preference, directive placement, and alphabetical field sorting within selection sets for consistent output." },
      { title: "3. Step 3", desc: "Format the GraphQL query with consistent indentation and spacing. The formatted output is cleaner and easier to read for use in your application code." }
    ],
    faqs: [
      { question: "How does the GraphQL query formatter handle deeply nested queries with multiple field levels?", answer: "Each nesting level is indented by the configured amount. Fields with sub-selections are formatted with the opening brace on the same line and fields indented below." },
      { question: "Can the formatter validate the GraphQL query syntax while formatting the query content?", answer: "Yes, the tool parses the query using the GraphQL parser and reports syntax errors before formatting. Invalid queries are not formatted and errors are shown instead." },
      { question: "Does the tool support formatting of GraphQL operations with fragment spreads and inline fragments?", answer: "Yes, fragment spreads are preserved and formatted inline. Inline fragments are formatted with the type condition on the same line and the selection set indented below." }
    ]
  },

  "graphql-schema-to-json-schema": {
    instructions: [
      { title: "1. Step 1", desc: "Paste your GraphQL schema in Schema Definition Language including types, inputs, enums, interfaces, unions, and directives for conversion to JSON Schema format." },
      { title: "2. Step 2", desc: "Select which GraphQL types to convert and choose the JSON Schema draft version. Configure naming conventions and nullable handling for the output schema." },
      { title: "3. Step 3", desc: "Generate a JSON Schema representation of the GraphQL types following standard JSON Schema conventions for use in validation and code generation tools." }
    ],
    faqs: [
      { question: "How does the converter map GraphQL scalar types to JSON Schema type definitions?", answer: "GraphQL String maps to type string, Int maps to type integer, Float maps to type number, Boolean maps to type boolean, and ID maps to type string with pattern restriction." },
      { question: "How are GraphQL non-null types and list types in the generated JSON Schema output?", answer: "Non-null fields become required entries in the required array. List types become type array with items referencing the inner type schema for proper validation." },
      { question: "Can the tool convert GraphQL enum types to JSON Schema enums with allowed values correctly?", answer: "Yes, GraphQL enums are converted to JSON Schema with type string and an enum array containing all allowed values with descriptions preserved from the GraphQL schema." }
    ]
  },

  "graphql-subscription-builder": {
    instructions: [
      { title: "1. Step 1", desc: "Enter a name for the GraphQL subscription operation and provide a description explaining what events trigger this subscription and what data it returns." },
      { title: "2. Step 2", desc: "Add fields to the subscription payload selection set and define input arguments for filtering subscription events based on channel IDs or event types." },
      { title: "3. Step 3", desc: "Generate the GraphQL subscription string and client-side code. Output includes the SDL definition and JavaScript or React code with WebSocket connection handling." }
    ],
    faqs: [
      { question: "How does the subscription builder structure the GraphQL subscription schema definition?", answer: "The subscription is defined as a field on the Subscription root type with an input argument for filtering and a return type describing the event payload structure." },
      { question: "Can the tool generate client-side code for subscribing to GraphQL events using WebSocket?", answer: "Yes, it generates code for Apollo Client useSubscription hook, urql useSubscription, Relay useSubscription, and raw WebSocket with graphql-ws protocol." },
      { question: "Does the builder include error handling and reconnection logic for production subscription use?", answer: "Yes, generated code includes WebSocket connection lifecycle, automatic reconnection with exponential backoff, error callback handling, and cleanup of subscriptions." }
    ]
  },

  "graphql-variables-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste your GraphQL variables as a JSON object. The tool accepts single-line, minified, or formatted JSON and parses and validates the variable structure." },
      { title: "2. Step 2", desc: "Optionally paste your GraphQL operation string to validate that the provided variables match the defined types and ensure all required variables are present." },
      { title: "3. Step 3", desc: "Pretty-print the variables with proper indentation and sorting. Copy the formatted JSON for use in API calls or export as a GraphQL variables JSON file." }
    ],
    faqs: [
      { question: "How does the formatter validate GraphQL variables against the operation definitions?", answer: "It parses the GraphQL operation to extract variable definitions and checks that each variable in the JSON matches the defined type and no required variable is missing." },
      { question: "Can the tool generate default values for missing GraphQL variables based on their types?", answer: "Yes, for optional variables with default values in the schema the tool can provide sensible defaults such as empty strings and zero and false for booleans." },
      { question: "Does the formatter support converting between GraphQL variables and query string parameters?", answer: "Yes, variables can be converted to URL-encoded query string format for GET-based GraphQL queries or to JSON for POST requests with both serialization formats supported." }
    ]
  },

  "css-specificity-calculator": {
    instructions: [
      { title: "1. Step 1", desc: "Type a CSS selector string from simple element selectors to complex chains with IDs, classes, pseudo-classes, attributes, and combinators for analysis." },
      { title: "2. Step 2", desc: "Calculate the specificity score as a three-part value representing inline styles, IDs, and class or element counts respectively for the given selector." },
      { title: "3. Step 3", desc: "Add multiple selectors to compare their specificity values side by side. The tool shows which selector takes precedence in the CSS cascade resolution order." }
    ],
    faqs: [
      { question: "How is CSS specificity calculated according to the W3C specification rules for cascade?", answer: "Specificity is a four-part value with inline styles at the highest weight, then IDs, then classes and attributes and pseudo-classes, then elements and pseudo-elements." },
      { question: "How does the tool handle the is and not and has pseudo-classes in specificity calculation?", answer: "For is and not and has the specificity uses the most specific argument in the selector list. The where pseudo-class always has zero specificity regardless of arguments." },
      { question: "Can the calculator help debug why certain CSS rules are not being applied as expected?", answer: "Yes, enter both the selector that should apply and the overriding selector. The tool shows specificity of each and explains which cascading rules determine the winner." }
    ]
  },

  "encoder-decoder": {
    instructions: [
      { title: "1. Step 1", desc: "Paste any text string, binary data in hex format, or upload a file that needs to be encoded or decoded using one of the supported encoding schemes." },
      { title: "2. Step 2", desc: "Choose from Base64, Base64URL, Base32, Base16, URL encoding, HTML entities, Unicode escapes, or quoted-printable encoding for the conversion operation." },
      { title: "3. Step 3", desc: "Select encode or decode direction and process the input. View the result in both text and hex dump formats for comprehensive verification of correctness." }
    ],
    faqs: [
      { question: "What encoding and decoding formats does the universal encoder-decoder tool support?", answer: "It supports Base64 standard and URL-safe, Base32 as per RFC 4648, Base16 hex, URL percent encoding, HTML entity encoding, Unicode escape sequences, and quoted-printable." },
      { question: "How does the tool auto-detect whether the input is already encoded and which scheme was used?", answer: "The auto-detect mode analyzes the character set, length, and pattern of the input. Base64 ends with padding characters, hex contains only hex digits, and URL encoding has percent signs." },
      { question: "Can the tool chain multiple encoding and decoding operations in sequence for nested data?", answer: "Yes, the pipeline mode lets you apply multiple encode or decode steps in sequence. Each step is applied to the result of the previous step for nested encodings." }
    ]
  },

  "number-base-converter": {
    instructions: [
      { title: "1. Step 1", desc: "Type a numeric value in any supported base format including decimal, binary, octal, hexadecimal, or base-32 and base-64 for compact number representations." },
      { title: "2. Step 2", desc: "Specify the input base from 2 to 64 and the target output base. The tool supports conversion between any two bases with arbitrary precision handling." },
      { title: "3. Step 3", desc: "View the number displayed in all common bases simultaneously. Additional representations include ASCII interpretation and IEEE 754 float or double decoding." }
    ],
    faqs: [
      { question: "What number bases does the converter support for conversion between numbering systems?", answer: "It supports base-2 binary through base-64 with all standard bases including 8 octal, 10 decimal, 16 hexadecimal, 32 Crockford, and 64 with custom character sets." },
      { question: "How does the tool handle very large numbers that exceed JavaScript safe integer range?", answer: "Numbers beyond the maximum safe integer are handled using BigInt for arbitrary precision integer conversion. Floating-point conversion uses string-based algorithms for exact representation." },
      { question: "Can the converter display the number in IEEE 754 single and double precision binary formats?", answer: "Yes, for decimal inputs the tool shows the IEEE 754 binary representation including 32-bit float and 64-bit double with sign exponent and mantissa breakdown." }
    ]
  },

  "px-rem-converter": {
    instructions: [
      { title: "1. Step 1", desc: "Type a CSS value with pixels or rem unit such as 16px or 2.5rem to convert between the two units. The tool also accepts comma-separated lists for batch conversion." },
      { title: "2. Step 2", desc: "Configure the root font size which defaults to 16px for most browsers. Adjust for projects with custom root font sizes like 14px or 10px for mental math." },
      { title: "3. Step 3", desc: "Get the equivalent value in the target unit with two decimal precision. Copy the converted CSS declaration directly for use in your stylesheet or component." }
    ],
    faqs: [
      { question: "How does the tool calculate the conversion between pixels and rems for CSS values?", answer: "To convert px to rem you divide by the root font size. To convert rem to px you multiply by the root font size. The default base is 16px making one rem equal to 16px." },
      { question: "What is the advantage of using rem units over px in responsive web design strategies?", answer: "Rem units scale with the user browser font size settings improving accessibility. They also allow global resizing by changing a single root font-size value." },
      { question: "Can the converter handle CSS shorthand values with multiple values for batch conversion?", answer: "Yes, multi-value CSS properties are parsed and each value is converted independently. The tool preserves the order and structure of shorthand declarations." }
    ]
  },

  "text-converter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste any text string into the input area. The tool supports Unicode characters including emoji, CJK characters, accented letters, and special symbols for conversion." },
      { title: "2. Step 2", desc: "Choose from uppercase, lowercase, title case, sentence case, camelCase, snake_case, kebab-case, PascalCase, alternating case, or leetspeak transformation." },
      { title: "3. Step 3", desc: "Convert the text to the selected case format. The result appears instantly with a visual comparison showing the original and transformed versions side by side." }
    ],
    faqs: [
      { question: "What text case transformations does the text converter support for formatting strings?", answer: "It supports uppercase, lowercase, Title Case, Sentence case, camelCase, snake_case, kebab-case, PascalCase, Train-Case, dot.case, alternating case, and inverse case." },
      { question: "How does the tool handle special characters and acronyms during case conversion operations?", answer: "Acronyms in title case such as NASA and USA are preserved. Unicode characters maintain their case properties. Words with numbers are handled intelligently in conversions." },
      { question: "Can the tool perform bulk text transformations on multiple lines or a list of strings?", answer: "Yes, multi-line mode applies the conversion to each line independently for converting lists of variable names or database column names to a different convention." }
    ]
  },

  "sql-formatter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste any SQL statement including SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, ALTER, WITH clauses, JOINs, subqueries, window functions, and CTEs for formatting." },
      { title: "2. Step 2", desc: "Choose the SQL dialect such as MySQL, PostgreSQL, SQL Server, Oracle, SQLite, BigQuery, or Snowflake. Configure keyword case, indentation, and line width." },
      { title: "3. Step 3", desc: "Format the SQL with consistent indentation and line breaks at major clauses with aligned keywords. The tool also validates basic SQL syntax during formatting." }
    ],
    faqs: [
      { question: "How does the SQL formatter handle formatting of complex JOIN operations and subqueries?", answer: "JOIN clauses are indented and aligned with their ON conditions. Subqueries are wrapped in parentheses and indented one level. Correlated subqueries are aligned with context." },
      { question: "Can the formatter convert between different SQL dialects during the formatting process?", answer: "Yes, optional dialect conversion handles LIMIT and OFFSET becoming TOP or ROW_NUMBER and ILIKE becoming LOWER equals LOWER for cross-dialect compatibility." },
      { question: "Does the tool support formatting of DDL statements like CREATE TABLE with column definitions?", answer: "Yes, CREATE TABLE columns are formatted one per line with type, constraints such as NOT NULL and DEFAULT and PRIMARY KEY, and comments aligned for readability." }
    ]
  },

  "secret-scanner": {
    instructions: [
      { title: "1. Step 1", desc: "Paste source code, configuration files, log output, or any text content to scan for accidentally exposed secrets and credentials like API keys and passwords." },
      { title: "2. Step 2", desc: "Run the secret detection scan to automatically identify potential secrets such as API keys, tokens, private keys, connection strings, and cloud provider credentials." },
      { title: "3. Step 3", desc: "Review each detected secret with its location, type, and severity. Use the redact feature to replace found secrets with placeholders before sharing the content." }
    ],
    faqs: [
      { question: "What types of secrets and credentials can the secret scanner detect automatically for you?", answer: "It detects AWS access keys, Google API keys, Slack tokens, GitHub tokens, Stripe API keys, Twilio credentials, generic passwords, JWT tokens, private keys, and database connection strings." },
      { question: "How does the scanner reduce false positives when detecting potential secrets in code files?", answer: "It uses entropy analysis and context-aware heuristics where high-entropy strings are flagged only in assignment contexts. Test values and examples are filtered out." },
      { question: "Can the tool scan git repositories for secrets committed in previous commit history?", answer: "Yes, the full git mode analyzes the entire commit history not just current files. It uses patterns to find secrets in historical commits for comprehensive auditing." }
    ]
  },

  "jwt-encoder-signer": {
    instructions: [
      { title: "1. Step 1", desc: "Set the JWT header fields including algorithm such as HS256 or RS256, type as JWT, key ID, and any custom header parameters needed for the JWT token." },
      { title: "2. Step 2", desc: "Add JWT claims including issuer, subject, audience, expiration time, not before, issued at, JWT ID, and custom claims as key-value pairs in the payload." },
      { title: "3. Step 3", desc: "Enter the secret key for HMAC or private key PEM for RSA or EC and sign the token. Generate the complete JWT with all three base64url-encoded segments." }
    ],
    faqs: [
      { question: "What JWT signing algorithms are supported for token generation and signing operations?", answer: "It supports HS256, HS384, HS512 with HMAC, RS256, RS384, RS512 with RSA, ES256, ES384, ES512 with ECDSA, EdDSA with Ed25519, and PS256, PS384, PS512 with RSA-PSS." },
      { question: "How does the tool generate JWT tokens with custom payload claims and proper structure?", answer: "The payload builder provides form fields for standard registered claims with date pickers for time-based claims. Custom claims can be added as key-value pairs." },
      { question: "Can the signer automatically set the expiration time based on a relative duration value?", answer: "Yes, set expiration as a relative duration such as one hour or thirty minutes or seven days. The tool converts relative durations to Unix timestamps automatically." }
    ]
  },

  "jwt-debugger": {
    instructions: [
      { title: "1. Step 1", desc: "Paste any JWT token string with the three-part base64url-encoded header, payload, and signature sections separated by dots for inspection and debugging." },
      { title: "2. Step 2", desc: "The tool automatically decodes the header and payload displaying them as formatted JSON with syntax highlighting and field-by-field inspection capabilities." },
      { title: "3. Step 3", desc: "Check token validity including expiration time, not-before time, issuer match, and audience match. Optionally verify the HMAC or RSA signature with your key." }
    ],
    faqs: [
      { question: "What JWT validation checks does the debugger perform on decoded tokens for security?", answer: "It checks token structure with three segments, valid base64url encoding, expiration against current time, not-before time, issued-at chronology, and algorithm awareness." },
      { question: "How does the tool help debug common JWT issues like expired or malformed tokens?", answer: "Each validation check has a clear pass or fail or error status. Expired tokens show the exact expiration time and malformed segments show the parsing error position." },
      { question: "Can the debugger extract and display nested JSON objects within JWT claims for inspection?", answer: "Yes, nested claims within the payload are rendered as expandable and collapsible JSON trees. Complex claim structures are fully navigable for deep inspection." }
    ]
  },

  "aes-encrypt": {
    instructions: [
      { title: "1. Step 1", desc: "Type or paste the plaintext message or upload a file that needs AES encryption. The tool supports text input of any length and binary files up to file size limit." },
      { title: "2. Step 2", desc: "Select key size of 128, 192, or 256 bits and cipher mode such as CBC, GCM, CTR, or ECB. Configure padding scheme and key or IV input format preferences." },
      { title: "3. Step 3", desc: "Enter the encryption key and IV or generate random ones. Click encrypt to produce the ciphertext in base64 or hex format for secure storage or transmission." }
    ],
    faqs: [
      { question: "What AES encryption modes are available and which is recommended for different use cases?", answer: "GCM authenticated encryption with integrity verification is recommended for most use cases. CBC is widely compatible but lacks authentication. ECB is not recommended." },
      { question: "How does the tool handle key and IV generation for secure AES encryption operations?", answer: "The random key and IV generator uses crypto.getRandomValues for cryptographically secure bytes. Keys are generated at the selected bit length with appropriate IV sizes." },
      { question: "Can the tool decrypt previously AES-encrypted data if the same parameters are provided?", answer: "Yes, the decrypt mode accepts ciphertext, key, IV, and all parameters. For GCM mode the authentication tag must be provided for integrity verification before decrypting." }
    ]
  },

  "bulki-csv-excel-to-json": {
    instructions: [
      { title: "1. Step 1", desc: "Upload one or more CSV, XLSX, or XLS files for conversion to JSON format. The tool auto-detects delimiters and sheet names from the uploaded spreadsheet data." },
      { title: "2. Step 2", desc: "Select the sheet to convert for Excel files with multiple sheets. Toggle header row usage and choose number detection, date format, and header flattening options." },
      { title: "3. Step 3", desc: "Convert the tabular data into JSON as an array of objects, array of arrays, or key-value pairs. Download the JSON file or copy the output for further processing." }
    ],
    faqs: [
      { question: "What Excel formats and CSV delimiters does the converter support for input files?", answer: "Excel formats include xlsx Office Open XML, xls legacy, and xlsm macro-enabled. CSV delimiters include comma, tab, semicolon, pipe, and space with auto-detection." },
      { question: "How does the tool handle merged cells and complex Excel formatting during conversion?", answer: "Merged cells are unmerged with the value copied to all cells in the merge range. Formatting like colors and fonts is stripped. Formulas are evaluated to cached values." },
      { question: "Can the tool convert multiple sheets from an Excel file into separate JSON files at once?", answer: "Yes, each sheet becomes a separate JSON file or array within a single JSON object. You can combine all sheets into one JSON with sheet names as top-level keys." }
    ]
  },

  "bulk-regex-extractor-replacer": {
    instructions: [
      { title: "1. Step 1", desc: "Paste the source text or upload a file containing data that needs pattern-based extraction or replacement using regular expressions across multiple matches." },
      { title: "2. Step 2", desc: "Enter the regex pattern and flags for global, case-insensitive, multiline, and dotall modes. Choose extraction with capture groups or replacement with substitution text." },
      { title: "3. Step 3", desc: "Preview matches highlighted in the source with extracted values listed. For replacements a diff view shows changes. Export results as text or structured JSON format." }
    ],
    faqs: [
      { question: "What regex engine does the bulk extractor and replacer use for pattern matching tasks?", answer: "It uses the JavaScript RegExp engine compliant with ECMAScript supporting lookahead, lookbehind, named capture groups, Unicode property escapes, and dotAll mode." },
      { question: "Can the tool perform find-and-replace operations across multiple files or large text blocks?", answer: "Yes, upload multiple files or paste a large text corpus. The tool processes all matches globally and shows a summary of replacements made per file." },
      { question: "How does the tool handle backreferences and capture groups in the replacement string pattern?", answer: "Replacement strings can use dollar-sign with numbers for numbered groups, dollar-sign with angle brackets for named groups, and dollar-sign ampersand for the full match." }
    ]
  },

  "csv-merger": {
    instructions: [
      { title: "1. Step 1", desc: "Upload two or more CSV files that share a common structure. The tool detects the columns in each file and identifies matching columns for merging operations." },
      { title: "2. Step 2", desc: "Choose the merge method such as appending rows vertically, joining by key column like SQL JOIN, or merging columns side by side by row position." },
      { title: "3. Step 3", desc: "Preview the merged dataset with column mappings and resolve any conflicts. Download the merged CSV file with your chosen delimiter for the final output." }
    ],
    faqs: [
      { question: "What CSV merging strategies does the tool offer for combining datasets together?", answer: "Append or vertical stack where files share columns, Horizontal merge side-by-side where files have same row count, Key-based join on a common column, and Column union." },
      { question: "How does the tool handle mismatched column names or structures between CSV files merging?", answer: "Column mapping interface lets you map columns with different names but similar meaning. Unmatched columns are filled with null values or excluded from the output." },
      { question: "Can the merger deduplicate rows after combining multiple CSV files into one dataset?", answer: "Yes, post-merge deduplication is available based on all columns matching, specific key columns, or fuzzy matching on text columns with duplicates listed in a report." }
    ]
  },

  "csv-splitter": {
    instructions: [
      { title: "1. Step 1", desc: "Upload a large CSV file that needs to be split into smaller more manageable files for processing, email attachment limits, or parallel data processing workflows." },
      { title: "2. Step 2", desc: "Choose to split by row count, number of output files, column value grouping, or percentage-based division of the total dataset into segments." },
      { title: "3. Step 3", desc: "Execute the split and download the individual files or a zip archive. A preview shows the split summary including output count and rows per file." }
    ],
    faqs: [
      { question: "What methods are available for splitting a large CSV file into smaller parts or segments?", answer: "By row count such as every 1000 rows, by equal partition into a set number of files, by column value creating separate files per unique value, and by percentage division." },
      { question: "How does the splitter preserve the CSV header row in each output file created during splitting?", answer: "By default every split file includes the header row as the first line. You can choose to include headers only in the first file for splitting operations." },
      { question: "Can the tool split a CSV by column value creating separate files for each category group?", answer: "Yes, select a column to group by. Each unique value in that column gets its own output file named after the value for organized category-based file splitting." }
    ]
  },

  "csv-transpose": {
    instructions: [
      { title: "1. Step 1", desc: "Paste CSV data or upload a CSV file where rows and columns need to be swapped. This turns rows into columns and columns into rows for data restructuring." },
      { title: "2. Step 2", desc: "Configure whether the first column becomes the new header row and whether to preserve the original header as the first column after the transposition operation." },
      { title: "3. Step 3", desc: "Transpose the data and preview the resulting structure showing the swapped dimensions. Download the transposed CSV with the same or a different delimiter." }
    ],
    faqs: [
      { question: "What is a CSV transpose operation and when would you use it in data processing workflows?", answer: "Transposing swaps rows and columns making a 5-row by 3-column CSV become a 3-row by 5-column CSV. Useful for converting horizontal time-series data to vertical format." },
      { question: "How does the transpose tool handle mixed data types when rows become columns during conversion?", answer: "Each column in the original becomes a row potentially mixing data types. The tool preserves all original values as strings and notes the original type if requested." },
      { question: "Can the tool transpose only a selected range of rows and columns rather than the entire dataset?", answer: "Yes, select a range by specifying row and column indices or choose specific columns to include. This is useful when only a portion needs transformation." }
    ]
  },

  "json-formatter-tool": {
    instructions: [
      { title: "1. Step 1", desc: "Paste any JSON data from API responses, configuration files, data exports, or serialized objects into the editor for formatting, validation, and transformation." },
      { title: "2. Step 2", desc: "Set indentation size, key sorting preference, array formatting style, quote style, and other JSON display preferences for the formatted output." },
      { title: "3. Step 3", desc: "Format the JSON with pretty-printing while validating structure simultaneously. Copy, download, or minify the output for production use in your application." }
    ],
    faqs: [
      { question: "What JSON features does the formatter handle beyond basic pretty-printing and indentation?", answer: "It handles key sorting alphabetically or custom, inline versus expanded arrays, trailing comma toggling, quote conversion, and JSON5 support with comments and unquoted keys." },
      { question: "Can the tool collapse specific parts of the JSON tree while expanding others for focus?", answer: "Yes, the interactive tree view allows collapsing and expanding individual nodes for large JSON responses where you need to focus on specific sections." },
      { question: "Does the formatter provide line numbers and path navigation for each JSON node in the data?", answer: "Yes, JSONPath expressions are shown for each node. Clicking a path highlights it in the source and line numbers help when debugging JSON parsing errors." }
    ]
  },

  "json-path-query-builder": {
    instructions: [
      { title: "1. Step 1", desc: "Paste your JSON document into the input panel. The tool parses the JSON and builds a navigable tree structure showing all available nodes and their paths." },
      { title: "2. Step 2", desc: "Build a JSONPath expression using the interactive builder by selecting nodes from the tree or typing the expression manually with autocomplete suggestions." },
      { title: "3. Step 3", desc: "Execute the JSONPath query and view matching results highlighted in the source. Results are listed in the panel with their full paths and values for inspection." }
    ],
    faqs: [
      { question: "What JSONPath syntax features does the query builder support for complex path queries?", answer: "It supports dot notation, bracket notation, wildcards, array slices, filters with expressions, recursive descent, and union operators for comprehensive query construction." },
      { question: "Can the tool extract and export query results as a separate JSON or CSV file format?", answer: "Yes, query results can be exported as a JSON array of matched values, a CSV file for flat results, or a new JSON document containing only the matched subtree." },
      { question: "How does the interactive tree view help users unfamiliar with JSONPath build correct queries?", answer: "Clicking any node in the tree generates the corresponding JSONPath. Filters and conditions are added via dropdown menus without manual syntax knowledge." }
    ]
  },

  "json-tree-viewer": {
    instructions: [
      { title: "1. Step 1", desc: "Paste any JSON data into the input area. The tool parses the JSON and renders it as an interactive collapsible tree structure for visual data exploration." },
      { title: "2. Step 2", desc: "Navigate the tree by clicking expand and collapse arrows to show or hide nested objects and arrays. The view displays types and values with color coding." },
      { title: "3. Step 3", desc: "Use the search box to find specific keys or values. Click any node to see its full path, value, and type in the detail panel for deep inspection." }
    ],
    faqs: [
      { question: "How does the JSON tree viewer handle files that are too large to display all at once?", answer: "Large JSON files are loaded with virtualized rendering where only visible nodes are rendered in the DOM. Nodes outside the viewport are lazily loaded as you scroll." },
      { question: "What features does the tree viewer offer for analyzing complex JSON structures effectively?", answer: "Features include collapse all and expand all, expand to specific depth, search by key name or value, filter by value type, copy node path, and copy value functionality." },
      { question: "Can the viewer highlight differences between two JSON documents in a side-by-side comparison?", answer: "Yes, the compare mode loads two JSON documents side by side. Added nodes are green, removed nodes are red, and changed values are orange with both values shown." }
    ]
  },

  "yaml-reindenter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste YAML data with inconsistent, mixed, or incorrect indentation. The tool accepts any YAML including mappings, sequences, multi-line strings, and complex nested structures." },
      { title: "2. Step 2", desc: "Set the desired indentation width and use spaces only since tabs are not valid YAML indentation. Configure line wrapping options for long lines." },
      { title: "3. Step 3", desc: "Reindent the YAML by parsing and regenerating it with consistent indentation. The tool also validates the YAML structure and reports any parsing errors found." }
    ],
    faqs: [
      { question: "Why does YAML require consistent indentation and what happens when it is incorrect?", answer: "YAML uses indentation for structure so incorrect indentation changes meaning or causes parse failures. Common issues include mixing tabs and spaces and inconsistent nesting depth." },
      { question: "How does the reindenter handle YAML with anchors and aliases that reference different levels?", answer: "Anchors and aliases are preserved exactly. The reindenter parses the resolved YAML structure and regenerates the document maintaining correct references." },
      { question: "Can the tool convert YAML files between different indentation levels in bulk processing mode?", answer: "Yes, batch mode processes multiple YAML files converting all to the target indentation for consolidating YAML files from different sources into a consistent style." }
    ]
  },

  "csv-to-sql": {
    instructions: [
      { title: "1. Step 1", desc: "Paste CSV data or upload a CSV file with a header row that defines the column names. The tool parses the data and prepares it for SQL INSERT statement generation." },
      { title: "2. Step 2", desc: "Configure the target SQL table name, column data types, and whether to generate CREATE TABLE statements alongside the INSERT statements for complete schema creation." },
      { title: "3. Step 3", desc: "Generate SQL INSERT statements from the CSV data. Download the SQL file for direct execution against your database or copy the statements individually." }
    ],
    faqs: [
      { question: "How does the tool parse CSV headers and generate the corresponding SQL table schema?", answer: "The first row is treated as column headers. Each column data type is inferred from the values allowing the tool to generate appropriate SQL types with size constraints." },
      { question: "Can the generated SQL include both CREATE TABLE and INSERT statements for complete setup?", answer: "Yes, the tool can generate a CREATE TABLE statement with inferred column types followed by INSERT statements for each row. You can choose to include or skip the table creation." },
      { question: "Does the tool handle special characters and quotes in CSV values during SQL generation safely?", answer: "Yes, special characters in string values are properly escaped for SQL. Single quotes are doubled and backslashes are handled according to the database type conventions." }
    ]
  },

  "unicode-converter": {
    instructions: [
      { title: "1. Step 1", desc: "Paste text containing Unicode characters that need conversion between different Unicode normalisation forms such as NFC, NFD, NFKC, or NFKD forms." },
      { title: "2. Step 2", desc: "Choose the conversion direction and target Unicode form. Select additional options like escape sequence format for JavaScript, HTML, or CSS context compatibility." },
      { title: "3. Step 3", desc: "Convert the Unicode text to the target form and review the result. The tool highlights differences between the original and converted text for easy verification." }
    ],
    faqs: [
      { question: "What Unicode normalization forms does the converter support for text transformation?", answer: "It supports NFC for canonical composition, NFD for canonical decomposition, NFKC for compatibility composition, and NFKD for compatibility decomposition of characters." },
      { question: "Can the tool convert Unicode characters to escape sequences for different programming contexts?", answer: "Yes, it generates escape sequences for JavaScript with backslash-u format, HTML with ampersand-hash format, CSS with backslash format, and Python with backslash-N format." },
      { question: "Does the converter detect malformed UTF-8 sequences and suggest proper encoding fixes?", answer: "Yes, it validates UTF-8 byte sequences and flags malformed sequences. Invalid bytes are highlighted and the tool suggests the correct encoding for problematic characters." }
    ]
  },

  "bulk-csv-excel-to-json": {
    instructions: [
      { title: "1. Upload CSV or Excel Files", desc: "Upload one or multiple .csv, .xls, or .xlsx files by dragging them onto the upload area or using the file browser selector for batch processing up to 20 files." },
      { title: "2. Configure Parsing Options", desc: "Set the sheet index for Excel files, choose whether the first row contains headers, define delimiter for CSV files, and select data type inference preferences." },
      { title: "3. Download Resulting JSON Output", desc: "Download each converted file as an individual .json file or combine all results into a single merged JSON array saved as one consolidated output file." }
    ],
    faqs: [
      { question: "Does the converter handle Excel files with multiple sheets each converted separately?", answer: "Yes, each sheet in an Excel workbook becomes either a separate JSON file or a named property in a combined JSON object for complete data extraction across all sheets." },
      { question: "How are empty cells and missing values represented in the resulting JSON?", answer: "Empty cells are represented as JSON null values by default with an option to omit them entirely or substitute a configurable placeholder string like 'N/A' or an empty string." },
      { question: "Does the tool preserve date and number formatting from Excel cells during conversion?", answer: "Yes, dates are converted to ISO 8601 strings by default and numeric formatting such as currency symbols or percentage values is preserved as a metadata annotation in the JSON output." }
    ]
  },
  "code-beautifier": {
    instructions: [
      { title: "1. Paste or Upload Your Code", desc: "Copy your messy, minified, or poorly indented source code and paste it into the editor area, or upload a file directly from your computer to begin the beautification process." },
      { title: "2. Select Language and Indentation", desc: "Choose the appropriate programming language from the dropdown menu and configure your preferred indentation style using spaces or tabs with custom width settings." },
      { title: "3. Click Beautify and Export Result", desc: "Press the beautify button to instantly reformat your code with proper spacing and line breaks, then copy the cleaned output or download it as a new file." }
    ],
    faqs: [
      { question: "Does the code beautifier change the logic of my code?", answer: "No, the beautifier only modifies whitespace, indentation, and line breaks to improve readability. It never alters variable names, function logic, control flow, or any functional part of your source code." },
      { question: "Can I customize the indentation style for different languages?", answer: "Yes, you can configure indentation size from 1 to 8 spaces, choose between tabs and spaces, and select language-specific formatting rules before running the beautifier." },
      { question: "Is my source code stored on your servers after beautification?", answer: "All code processing happens entirely in your browser using client-side JavaScript. Your source code is never transmitted to or stored on any server, ensuring complete privacy and security." }
    ]
  },
};

module.exports = { CONTENT };
