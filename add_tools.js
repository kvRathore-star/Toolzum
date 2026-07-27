const fs = require('fs');
const path = require('path');

// Read current file
const filePath = path.join(__dirname, 'fix_developer_data.js');
let content = fs.readFileSync(filePath, 'utf-8');

// All 75 slugs to add
const slugs = [
  "code-beautifier", "code-formatter", "css-formatter", "css-minifier",
  "html-formatter", "html-minifier", "html-to-jsx", "javascript-formatter",
  "js-minifier", "jsx-formatter", "markdown-formatter", "markdown-slack-converter",
  "python-formatter", "scss-formatter", "tsx-formatter", "typescript-formatter",
  "yaml-formatter", "avro-to-json-sample", "code-to-curl-converter",
  "code-to-curl-parser", "curl-to-code", "curl-to-code-converter",
  "jsonrpc-builder", "pug-to-html-converter", "proto-schema-converter",
  "protobuf-decoder", "svg-to-css", "svg-optimizer", "cpp-formatter",
  "go-formatter", "kotlin-formatter", "php-beautifier", "ruby-formatter",
  "rust-formatter", "swift-formatter", "xml-minifier-validator", "xml-formatter",
  "cron-parser", "crypto-kit", "docker-run-to-compose", "html-preview",
  "oauth-client-setup", "oauth-scope-builder", "password-entropy-calculator",
  "postman-to-openapi-converter", "openapi-to-postman", "rest-endpoint-documenter",
  "url-encoder-decoder", "url-parser", "web-inspector", "graphql-query-formatter",
  "graphql-schema-to-json-schema", "graphql-subscription-builder",
  "graphql-variables-formatter", "css-specificity-calculator", "encoder-decoder",
  "number-base-converter", "px-rem-converter", "text-converter", "sql-formatter",
  "secret-scanner", "jwt-encoder-signer", "jwt-debugger", "aes-encrypt",
  "bulki-csv-excel-to-json", "bulk-regex-extractor-replacer", "csv-merger",
  "csv-splitter", "csv-transpose", "json-formatter-tool", "json-path-query-builder",
  "json-tree-viewer", "yaml-reindenter", "csv-to-sql", "unicode-converter"
];

// Check which already exist
const existing = new Set();
const slugRegex = /  "([a-z0-9-]+)": \{/g;
let m;
while ((m = slugRegex.exec(content)) !== null) {
  existing.add(m[1]);
}

const missing = slugs.filter(s => !existing.has(s));
console.log(`Total requested: ${slugs.length}`);
console.log(`Already present: ${slugs.length - missing.length}`);
console.log(`Missing to add: ${missing.length}`);

if (missing.length === 0) {
  console.log('All slugs already exist. Nothing to do.');
  process.exit(0);
}

// Generate unique descriptions per slug index
const instructionTexts = [
  // idx 0
  [
    `Paste your source code into the editor area. The tool supports JavaScript, Python, Java, C++, HTML, CSS, and 30+ other programming languages with automatic language detection and syntax highlighting.`,
    `Configure formatting settings including indentation size, brace style, line endings, and max line length to match your project's specific coding conventions and style guide requirements.`,
    `Click the format button to reformat the code with consistent spacing and indentation. Copy the formatted output or download it as a clean file ready for production use.`
  ],
  [
    `Copy and paste any code snippet or file content that needs transformation. The tool automatically detects the content type and applies context-appropriate formatting rules for optimal output.`,
    `Select the desired output format and adjust any available options. Each formatting option includes a preview of how it affects the result so you can fine-tune before finalizing.`,
    `Execute the transformation and review the result. A side-by-side diff view highlights the changes made, allowing you to verify correctness before copying or downloading the output.`
  ],
  [
    `Input your CSS code including selectors, properties, at-rules, and media queries. The tool handles regular CSS, CSS modules, and CSS-in-JS template literal stylesheets with full support.`,
    `Adjust formatting preferences such as indentation width, expanded versus compact property layout, alphabetically sorted properties, and vendor prefix grouping for consistent organization.`,
    `Apply the formatting to reformat the stylesheet with clean consistent spacing. Copy the formatted CSS output directly or download as a properly organized stylesheet file.`
  ],
  [
    `Paste your CSS source code or upload a stylesheet file that needs to be compressed. The tool accepts any valid CSS including custom properties, preprocessor output, and browser-specific extensions.`,
    `Select a compression level from safe whitespace removal to aggressive optimization including color shortening and selector merging. Each level offers different size reduction trade-offs.`,
    `Run the minification process and compare the original file size against the compressed result. Download the minified CSS or copy it directly for use in your production deployment pipeline.`
  ],
  [
    `Paste HTML code including doctype, head and body sections, and all nested elements. The tool handles HTML5, XHTML, and legacy HTML with template syntax like Handlebars and EJS.`,
    `Set formatting preferences like indent size, inline versus block element formatting, quote style for attributes, and attribute ordering rules for consistent HTML structure.`,
    `Reformat the HTML with proper indentation and line breaks. The tool also validates nesting and closes any unclosed tags while highlighting structural issues found during processing.`
  ],
  [
    `Paste full HTML documents or fragments that need to be compressed. The tool handles all HTML versions and can process embedded CSS and JavaScript within the same operation.`,
    `Toggle minification options like comment removal, whitespace collapse, optional tag removal, and inline style or script minification for maximum size reduction.`,
    `Generate the compressed HTML and review the size savings. Download the minified file or copy the compact output for use in production environments where bandwidth matters.`,
  ],
  [
    `Paste any HTML markup including standard elements, attributes, inline styles, and nested structures that need conversion to JSX syntax for use in React application components.`,
    `Configure conversion options such as className versus class, htmlFor versus for, camelCase style attributes, and whether to wrap the output in a functional component template.`,
    `Run the conversion to transform HTML into JSX syntax with proper React attribute names and event handlers. Copy the resulting JSX for direct use in your React components.`,
  ],
  [
    `Paste JavaScript source code with support for all modern ECMAScript versions including ES2024, JSX, TypeScript, and Node.js module syntax with import and export declarations.`,
    `Choose a formatting preset like Airbnb, Standard, Google, or Prettier default. Configure semicolons, quotes, trailing commas, and arrow function parenthesis preferences precisely.`,
    `Format the code and review changes in a before and after diff view. Accept the formatted version or adjust settings until the output matches your team's agreed style guide.`,
  ],
  [
    `Paste your JavaScript code for compression. The tool supports ES5, ES6+, modules, and TypeScript. It parses the abstract syntax tree to safely rename and compress without breaking anything.`,
    `Select compression level from basic whitespace removal to advanced dead code elimination, constant folding, and tree shaking for maximum size reduction.`,
    `Generate the minified JavaScript and compare sizes. Download the minified file with proper naming convention or copy the compressed code for production deployment.`,
  ],
  [
    `Paste React JSX or TSX code including components, props, children, fragments, and hooks. The tool handles both JSX and TSX file conventions with full TypeScript support.`,
    `Configure formatting options like quote style for JSX attributes, bracket position for multi-line props, spacing around expression braces, and self-closing tag behavior.`,
    `Format the JSX with consistent conventions ensuring props are aligned and children are properly indented. The output follows React best practices for readable component code.`,
  ],
  [
    `Paste Markdown content including headings, lists, tables, code blocks, blockquotes, links, images, and inline formatting like bold and italic text for consistent formatting.`,
    `Set heading style preferences such as ATX with hashes or Setext with underlines. Configure list marker style, table alignment formatting, and maximum line length for text wrapping.`,
    `Reformat the Markdown and preview the rendered HTML output alongside the formatted source. This ensures visual correctness while maintaining consistent source formatting.`,
  ],
  [
    `Paste Markdown-formatted text to convert to Slack mrkdwn or paste Slack message text to convert to standard Markdown. Both conversion directions are fully supported.`,
    `Choose the conversion direction and review how each element maps between formats. Slack-specific formatting like emoji and mentions have no Markdown equivalent and are preserved.`,
    `Execute the conversion and copy the result directly to your Slack message or Markdown editor. The tool highlights which elements were transformed and which were preserved as-is.`,
  ],
  [
    `Paste Python code including functions, classes, decorators, type hints, async and await, list comprehensions, and context managers. Supports Python versions 3.6 through 3.13 syntax.`,
    `Choose PEP 8 compliant formatting with configurable line length. Set quote style preference, trailing comma policy, and blank line rules around functions and classes.`,
    `Format the Python code and review a PEP 8 compliance report. The output follows standard Python conventions including proper spacing around operators and consistent indentation.`,
  ],
  [
    `Paste SCSS code with variables, mixins, functions, nested selectors, parent references, interpolation, and control directives for consistent Sass formatting.`,
    `Configure nesting depth limits, property sorting order, spacing around operators, and expanded versus compact nested block formatting for better readability.`,
    `Format the SCSS with proper nesting indentation and spacing. The output maintains the semantic hierarchy while following consistent and readable formatting rules.`,
  ],
  [
    `Paste TypeScript JSX code including React components with typed props, generics, type annotations, interfaces, and hooks with full type inference and support.`,
    `Configure JSX quote style, generic component syntax, type annotation spacing, interface property formatting, and import type versus regular import preferences.`,
    `Format the TSX code with consistent TypeScript JSX conventions. The output is type-safe and follows both TypeScript and React community best practices for readability.`,
  ],
  [
    `Paste TypeScript code with interfaces, types, enums, generics, decorators, mapped types, conditional types, and utility types. Supports TS 4.0 through 5.5 features.`,
    `Configure semicolon usage, quote style, trailing commas, member delimiters, type annotation spacing, and import and export formatting preferences for the output.`,
    `Format the TypeScript code with strict convention adherence. The output respects spacing around type annotations and generic parameters for clean readable code.`,
  ],
  [
    `Paste YAML data including mappings, sequences, multi-line strings, anchors, aliases, and complex nested structures from configuration files needing formatting.`,
    `Set indentation width, line wrapping, quote style for strings, boolean format, and whether to sort mapping keys alphabetically for consistent output.`,
    `Format the YAML with consistent indentation and spacing. The tool also validates structural correctness after formatting to ensure the output is valid YAML.`,
  ],
  [
    `Paste your Avro schema in JSON format including namespace, type, name, fields with types, default values, and optional properties like doc and order for sample generation.`,
    `Set the number of sample records to generate and configure random data generation constraints for each field type including strings, numbers, and booleans.`,
    `Generate realistic JSON sample data from the Avro schema. Download the sample as a JSON file or copy individual records for testing your Avro deserialization logic.`,
  ],
  [
    `Paste code from any programming language that makes an HTTP request using fetch, axios, requests, httparty, httpClient, or similar HTTP client libraries for conversion.`,
    `Choose the source language of the code such as JavaScript, Python, Java, Go, Ruby, PHP, or C Sharp so the parser uses the correct pattern matching rules.`,
    `Convert the source code to the equivalent curl command with all headers, body, method, and URL parameters preserved exactly as they appear in the original source code.`,
  ],
  [
    `Paste source code snippets that include HTTP request creation using common libraries like fetch, axios, and the requests library for parsing into components.`,
    `The tool automatically identifies the HTTP method, URL, headers, body, query parameters, and authentication from the code pattern regardless of programming language.`,
    `View the parsed request components displayed in a structured table showing method, URL, headers, body, auth type, and query params for individual copying.`,
  ],
  [
    `Paste a curl command including flags like X, H, d, F, b, u, and data or header options from any operating system or API documentation for code generation.`,
    `Choose the target programming language and HTTP library for the output such as JavaScript fetch, Python requests, Go net/http, or Java OkHttp.`,
    `Convert the curl command to equivalent code in the target language. The output includes proper imports, error handling, and async patterns where appropriate for production use.`,
  ],
  [
    `Paste a curl command string from API documentation or terminal history covering both short and long-form flag variations for conversion to production code.`,
    `Select the target programming language and preferred HTTP library including JavaScript, Python, Go, Rust, or Java with their respective popular HTTP clients.`,
    `Generate production-ready code with type definitions, response parsing, retry logic, timeout configuration, and environment variable placeholders for sensitive values.`,
  ],
  [
    `Enter the JSON-RPC method name and parameters as a JSON array for positional arguments or a JSON object for named arguments following the JSON-RPC 2.0 specification.`,
    `Set the request ID as a number or string and ensure the jsonrpc field is set to version 2.0. The tool auto-generates sequential IDs for batch request scenarios.`,
    `Generate the complete JSON-RPC request payload. Copy the JSON for direct use or test it against a JSON-RPC endpoint to verify the method call works correctly.`,
  ],
  [
    `Paste Pug template code with its indentation-based syntax including mixins, includes, interpolation, and block inheritance from parent templates for HTML conversion.`,
    `Set indentation for the output HTML and choose whether to pretty-print or minify. Configure self-closing tag format and doctype selection for the target environment.`,
    `Render the Pug template to HTML with a split-pane preview showing the output alongside the source. Copy the HTML or download it for use in your web application.`,
  ],
  [
    `Paste your protobuf file content including syntax declaration, package, imports, message definitions, enums, oneof fields, map fields, and service definitions for conversion.`,
    `Choose the target output format such as JSON Schema, TypeScript interfaces, Go structs, GraphQL types, Avro schema, or OpenAPI schema specification.`,
    `Convert the protobuf schema to the target format with preserved field numbers, types, nested structures, and comments. Download the converted schema file.`,
  ],
  [
    `Upload a binary protobuf file or paste hex or base64 encoded protobuf binary data. The tool reads the raw wire-format bytes without requiring the original schema file.`,
    `Optionally provide the protobuf schema file for field name resolution. Without a schema the tool decodes field numbers and wire types showing raw field tags and values.`,
    `View the decoded protobuf as a readable JSON-like structure with field numbers, types such as varint and length-delimited, and values for comprehensive inspection.`,
  ],
  [
    `Paste SVG markup including paths, shapes, groups, gradients, patterns, filters, text elements, and transformations that need conversion to CSS properties.`,
    `Choose the output format such as CSS background-image as data URI or individual CSS properties from SVG attributes. Toggle base64 encoding versus UTF-8 inline SVG.`,
    `Generate the CSS code as a complete declaration block ready for your stylesheet. The output can be used as a background, mask, or clip-path in your web project.`,
  ],
  [
    `Paste SVG source code or upload an SVG file with paths, shapes, gradients, fonts, and metadata that needs to be optimized for web and production use.`,
    `Toggle optimization passes including editor metadata removal, empty group collapsing, path precision reduction, unused ID removal, and path merging operations.`,
    `Optimize the SVG and compare the original versus optimized size with a visual preview. Download the optimized SVG file for use in your production application.`,
  ],
  [
    `Paste C++ code including classes, templates, namespaces, inheritance, lambdas, smart pointers, and move semantics with C++11 through C++23 standard support.`,
    `Choose from LLVM, Google, Chromium, Mozilla, WebKit, Microsoft, or GNU styles. Configure access modifier indentation and pointer alignment preferences.`,
    `Format the code with the selected C++ style and review changes in a diff view. Verify all modifications before accepting the formatted output for your project.`,
  ],
  [
    `Paste Go code including packages, imports, functions, methods, structs, interfaces, goroutines, channels, and error handling for standard Go formatting.`,
    `Apply gofmt-equivalent formatting to standardize indentation with tabs, import grouping, spacing, and brace placement according to official Go conventions.`,
    `Review the formatted Go code which follows standard formatting conventions. Imports are sorted and grouped into standard library and external package sections.`,
  ],
  [
    `Paste Kotlin code including classes, data classes, sealed classes, coroutines, extension functions, companion objects, and lambda expressions for consistent formatting.`,
    `Choose formatting rules such as brace placement, property formatting, spacing around colons, expression body formatting, and trailing comma preferences.`,
    `Format the Kotlin code following official JetBrains coding conventions. The output ensures consistency across all Kotlin projects in your organization.`,
  ],
  [
    `Paste PHP code including classes, namespaces, traits, interfaces, closures, generators, type declarations, and PHP 8.x features like attributes and enums.`,
    `Set indentation style and brace position according to PSR-2 or PSR-12 standards. Configure namespace ordering and control statement formatting preferences.`,
    `Beautify the PHP code with syntax validation to highlight any parse errors alongside the formatted output. Fix issues and download the clean code for production.`,
  ],
  [
    `Paste Ruby code including classes, modules, blocks, procs, lambdas, mixins, metaprogramming patterns, and Rails-specific syntax for consistent formatting.`,
    `Choose from RuboCop default, Shopify, or Airbnb styles. Configure indentation, line length, hash formatting, block style, and quote preference for the output.`,
    `Format the Ruby code and auto-fix common issues like incorrect spacing, indentation, and style violations. The output follows Ruby community conventions for readability.`,
  ],
  [
    `Paste Rust code including structs, enums, traits, impl blocks, generics, lifetimes, macros, match expressions, closures, and async or unsafe blocks for formatting.`,
    `Apply rustfmt-equivalent formatting with standard Rust conventions including 100 character line width and 4-space indentation for consistency.`,
    `Format the Rust code following official Rust style guidelines. Merge and organize use statements into consistent style with alphabetical sorting within groups.`,
  ],
  [
    `Paste Swift code including structs, classes, protocols, extensions, enums with associated values, optionals, closures, and async await for proper formatting.`,
    `Configure indentation, line length, colon spacing, semicolon usage, access control ordering, and protocol conformance formatting according to preferences.`,
    `Format the Swift code following Apple's API design guidelines and recommended coding standards. The output is clean and follows the Swift community conventions.`,
  ],
  [
    `Paste XML content for validation and minification. The tool checks well-formedness including proper nesting, matching tags, correct attribute quoting, and character references.`,
    `Run validation first to check for XML structure errors. After validation passes, configure minification options to remove whitespace and unnecessary line breaks.`,
    `Minify the validated XML to remove whitespace and comments. The compact output is suitable for API payloads and storage where file size matters.`,
  ],
  [
    `Paste XML data including configuration files, SOAP envelopes, RSS feeds, SVG graphics, and data interchange formats for consistent pretty-printing and formatting.`,
    `Set indentation size, line width, attribute formatting preference for long elements, self-closing tag style, and alphabetical attribute sorting for clean output.`,
    `Pretty-print the XML with consistent indentation and line breaks. The formatted output shows the hierarchical structure clearly for easier reading and editing.`,
  ],
  [
    `Type a standard five-field or six-field cron expression with standard operators including ranges, steps, list values, and special time strings for parsing.`,
    `Parse the cron expression to get a human-readable description explaining when the schedule runs and what each field contributes to the overall timing.`,
    `Generate the next scheduled execution times based on the cron expression. Verify the schedule accuracy by reviewing the exact dates and times of upcoming runs.`,
  ],
  [
    `Choose from available cryptographic operations such as hash generation, HMAC computation, random byte generation, key derivation, or entropy estimation.`,
    `Select the specific algorithm, key size, iteration count, output encoding format, and additional parameters like salt or initialization vector for the operation.`,
    `Execute the cryptographic operation in-browser using the Web Crypto API. Copy the result in your preferred encoding format for use in your application or system.`,
  ],
  [
    `Paste a docker run command including all flags such as port mappings, volume mounts, environment variables, network settings, and restart policies for conversion.`,
    `Set the Docker Compose version and service name. Choose whether to include compose-only features like healthcheck, depends_on, and deploy sections in the output.`,
    `Generate the equivalent docker-compose YAML file. The output is a complete ready-to-use Docker Compose service definition for your containerized application.`,
  ],
  [
    `Paste any HTML document or fragment including inline CSS and JavaScript. The tool supports HTML5 with canvas, SVG, WebGL, and modern JavaScript APIs for preview.`,
    `Set viewport size for desktop, tablet, or mobile preview. Enable responsive mode and toggle dark or light theme simulation for accurate rendering previews.`,
    `Preview the rendered HTML in a sandboxed iframe. Interactive elements like forms, buttons, links, and JavaScript all behave as in a real browser environment.`,
  ],
  [
    `Choose from built-in OAuth provider templates including Google, GitHub, Facebook, Microsoft, Twitter, and Apple. Alternatively configure a custom provider with your own endpoints.`,
    `Provide your client ID and client secret if confidential. Set the redirect URI, authorized JavaScript origins, and required scopes for your application needs.`,
    `Generate the OAuth client configuration with code snippets for multiple languages and environment variables. Download the provider-specific configuration JSON.`,
  ],
  [
    `Choose from supported OAuth providers like Google, Microsoft, GitHub, Facebook, Slack, or Spotify. Each provider has its own list of available scopes and permissions.`,
    `Browse the categorized scope list for the selected provider. Each scope shows its full name, data access level, and sensitivity rating for informed selection.`,
    `Copy the formatted scope string and the full authorization URL with selected scopes. The output is ready for use in your OAuth authorization request to the provider.`,
  ],
  [
    `Type a password to analyze its entropy directly or configure password criteria like length and character sets to calculate theoretical maximum entropy.`,
    `Review the entropy analysis including bits of entropy, estimated cracking time at various attacker speeds, character set composition, and pattern detection results.`,
    `Check the password against a local database of common and breached passwords without sending it externally. Weak passwords are flagged with improvement suggestions.`,
  ],
  [
    `Upload your Postman Collection JSON in v2.0 or v2.1 format or paste the collection data directly into the input panel for parsing and conversion processing.`,
    `Set the OpenAPI version to 3.0.3 or 3.1.0 and configure how Postman folders map to API tags. Set schema naming conventions and server base URL from Postman variables.`,
    `Generate the OpenAPI specification in YAML or JSON format. Download the spec file for use with Swagger UI, code generators, or API documentation tools.`,
  ],
  [
    `Upload an OpenAPI 3.0 or 3.1 specification file in YAML or JSON format or paste the spec content directly from your API documentation source for conversion.`,
    `Set the base URL for Postman environment, choose whether to include examples, toggle folder creation from tags, and configure authentication method for the collection.`,
    `Generate a Postman Collection JSON file with all endpoints, parameters, request bodies, and authentication configured. Download and import into Postman for testing.`,
  ],
  [
    `Specify the HTTP method, URL path, path parameters, query parameters, headers, request body schema, response status codes, and response body for documentation.`,
    `Write clear descriptions for the endpoint, each parameter, and each response code. Provide example request and response bodies demonstrating realistic API usage.`,
    `Generate API documentation in Markdown, HTML, or OpenAPI format. The output includes all defined endpoints with parameters, examples, and descriptions for consumers.`,
  ],
  [
    `Paste a full URL, URL component, or plain text that needs URL encoding or decoding according to RFC 3986 URI specification standards for web development.`,
    `Select encode mode to convert special characters to percent-encoded sequences or decode mode to convert percent-encoded strings back to original characters.`,
    `Apply the encoding or decoding operation and review the original versus converted values side by side with specific changes highlighted for clarity.`,
  ],
  [
    `Paste any valid URL including protocol, hostname, port, path, query string, fragment hash, and authentication credentials for complete component parsing.`,
    `Parse the URL to extract and display all components such as protocol, hostname, port, pathname, search, hash, username, and password in a structured table.`,
    `View each URL component with its decoded value in a structured table. Individual components can be copied separately for use in your code or debugging tasks.`,
  ],
  [
    `Type the full URL of the website you want to inspect. The tool fetches the page and analyzes its HTML structure, CSS, JavaScript, and network resources used.`,
    `Review a comprehensive page analysis including title, meta tags, Open Graph tags, headings structure, links count, and images with or without alt text.`,
    `Examine technical details such as HTTP headers, HTML document outline, CSS class usage, JavaScript context, form elements, and accessibility landmarks on the page.`,
  ],
  [
    `Paste any GraphQL operation including query, mutation, subscription, or fragment definition. The tool handles inline fragments, directives, and variable definitions.`,
    `Set indentation size, line width, argument formatting preference, directive placement, and alphabetical field sorting within selection sets for consistent output.`,
    `Format the GraphQL query with consistent indentation and spacing. The formatted output is cleaner and easier to read for use in your application code.`,
  ],
  [
    `Paste your GraphQL schema in Schema Definition Language including types, inputs, enums, interfaces, unions, and directives for conversion to JSON Schema format.`,
    `Select which GraphQL types to convert and choose the JSON Schema draft version. Configure naming conventions and nullable handling for the output schema.`,
    `Generate a JSON Schema representation of the GraphQL types following standard JSON Schema conventions for use in validation and code generation tools.`,
  ],
  [
    `Enter a name for the GraphQL subscription operation and provide a description explaining what events trigger this subscription and what data it returns.`,
    `Add fields to the subscription payload selection set and define input arguments for filtering subscription events based on channel IDs or event types.`,
    `Generate the GraphQL subscription string and client-side code. Output includes the SDL definition and JavaScript or React code with WebSocket connection handling.`,
  ],
  [
    `Paste your GraphQL variables as a JSON object. The tool accepts single-line, minified, or formatted JSON and parses and validates the variable structure.`,
    `Optionally paste your GraphQL operation string to validate that the provided variables match the defined types and ensure all required variables are present.`,
    `Pretty-print the variables with proper indentation and sorting. Copy the formatted JSON for use in API calls or export as a GraphQL variables JSON file.`,
  ],
  [
    `Type a CSS selector string from simple element selectors to complex chains with IDs, classes, pseudo-classes, attributes, and combinators for analysis.`,
    `Calculate the specificity score as a three-part value representing inline styles, IDs, and class or element counts respectively for the given selector.`,
    `Add multiple selectors to compare their specificity values side by side. The tool shows which selector takes precedence in the CSS cascade resolution order.`,
  ],
  [
    `Paste any text string, binary data in hex format, or upload a file that needs to be encoded or decoded using one of the supported encoding schemes.`,
    `Choose from Base64, Base64URL, Base32, Base16, URL encoding, HTML entities, Unicode escapes, or quoted-printable encoding for the conversion operation.`,
    `Select encode or decode direction and process the input. View the result in both text and hex dump formats for comprehensive verification of correctness.`,
  ],
  [
    `Type a numeric value in any supported base format including decimal, binary, octal, hexadecimal, or base-32 and base-64 for compact number representations.`,
    `Specify the input base from 2 to 64 and the target output base. The tool supports conversion between any two bases with arbitrary precision handling.`,
    `View the number displayed in all common bases simultaneously. Additional representations include ASCII interpretation and IEEE 754 float or double decoding.`,
  ],
  [
    `Type a CSS value with pixels or rem unit such as 16px or 2.5rem to convert between the two units. The tool also accepts comma-separated lists for batch conversion.`,
    `Configure the root font size which defaults to 16px for most browsers. Adjust for projects with custom root font sizes like 14px or 10px for mental math.`,
    `Get the equivalent value in the target unit with two decimal precision. Copy the converted CSS declaration directly for use in your stylesheet or component.`,
  ],
  [
    `Paste any text string into the input area. The tool supports Unicode characters including emoji, CJK characters, accented letters, and special symbols for conversion.`,
    `Choose from uppercase, lowercase, title case, sentence case, camelCase, snake_case, kebab-case, PascalCase, alternating case, or leetspeak transformation.`,
    `Convert the text to the selected case format. The result appears instantly with a visual comparison showing the original and transformed versions side by side.`,
  ],
  [
    `Paste any SQL statement including SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, ALTER, WITH clauses, JOINs, subqueries, window functions, and CTEs for formatting.`,
    `Choose the SQL dialect such as MySQL, PostgreSQL, SQL Server, Oracle, SQLite, BigQuery, or Snowflake. Configure keyword case, indentation, and line width.`,
    `Format the SQL with consistent indentation and line breaks at major clauses with aligned keywords. The tool also validates basic SQL syntax during formatting.`,
  ],
  [
    `Paste source code, configuration files, log output, or any text content to scan for accidentally exposed secrets and credentials like API keys and passwords.`,
    `Run the secret detection scan to automatically identify potential secrets such as API keys, tokens, private keys, connection strings, and cloud provider credentials.`,
    `Review each detected secret with its location, type, and severity. Use the redact feature to replace found secrets with placeholders before sharing the content.`,
  ],
  [
    `Set the JWT header fields including algorithm such as HS256 or RS256, type as JWT, key ID, and any custom header parameters needed for the JWT token.`,
    `Add JWT claims including issuer, subject, audience, expiration time, not before, issued at, JWT ID, and custom claims as key-value pairs in the payload.`,
    `Enter the secret key for HMAC or private key PEM for RSA or EC and sign the token. Generate the complete JWT with all three base64url-encoded segments.`,
  ],
  [
    `Paste any JWT token string with the three-part base64url-encoded header, payload, and signature sections separated by dots for inspection and debugging.`,
    `The tool automatically decodes the header and payload displaying them as formatted JSON with syntax highlighting and field-by-field inspection capabilities.`,
    `Check token validity including expiration time, not-before time, issuer match, and audience match. Optionally verify the HMAC or RSA signature with your key.`,
  ],
  [
    `Type or paste the plaintext message or upload a file that needs AES encryption. The tool supports text input of any length and binary files up to file size limit.`,
    `Select key size of 128, 192, or 256 bits and cipher mode such as CBC, GCM, CTR, or ECB. Configure padding scheme and key or IV input format preferences.`,
    `Enter the encryption key and IV or generate random ones. Click encrypt to produce the ciphertext in base64 or hex format for secure storage or transmission.`,
  ],
  [
    `Upload one or more CSV, XLSX, or XLS files for conversion to JSON format. The tool auto-detects delimiters and sheet names from the uploaded spreadsheet data.`,
    `Select the sheet to convert for Excel files with multiple sheets. Toggle header row usage and choose number detection, date format, and header flattening options.`,
    `Convert the tabular data into JSON as an array of objects, array of arrays, or key-value pairs. Download the JSON file or copy the output for further processing.`,
  ],
  [
    `Paste the source text or upload a file containing data that needs pattern-based extraction or replacement using regular expressions across multiple matches.`,
    `Enter the regex pattern and flags for global, case-insensitive, multiline, and dotall modes. Choose extraction with capture groups or replacement with substitution text.`,
    `Preview matches highlighted in the source with extracted values listed. For replacements a diff view shows changes. Export results as text or structured JSON format.`,
  ],
  [
    `Upload two or more CSV files that share a common structure. The tool detects the columns in each file and identifies matching columns for merging operations.`,
    `Choose the merge method such as appending rows vertically, joining by key column like SQL JOIN, or merging columns side by side by row position.`,
    `Preview the merged dataset with column mappings and resolve any conflicts. Download the merged CSV file with your chosen delimiter for the final output.`,
  ],
  [
    `Upload a large CSV file that needs to be split into smaller more manageable files for processing, email attachment limits, or parallel data processing workflows.`,
    `Choose to split by row count, number of output files, column value grouping, or percentage-based division of the total dataset into segments.`,
    `Execute the split and download the individual files or a zip archive. A preview shows the split summary including output count and rows per file.`,
  ],
  [
    `Paste CSV data or upload a CSV file where rows and columns need to be swapped. This turns rows into columns and columns into rows for data restructuring.`,
    `Configure whether the first column becomes the new header row and whether to preserve the original header as the first column after the transposition operation.`,
    `Transpose the data and preview the resulting structure showing the swapped dimensions. Download the transposed CSV with the same or a different delimiter.`,
  ],
  [
    `Paste any JSON data from API responses, configuration files, data exports, or serialized objects into the editor for formatting, validation, and transformation.`,
    `Set indentation size, key sorting preference, array formatting style, quote style, and other JSON display preferences for the formatted output.`,
    `Format the JSON with pretty-printing while validating structure simultaneously. Copy, download, or minify the output for production use in your application.`,
  ],
  [
    `Paste your JSON document into the input panel. The tool parses the JSON and builds a navigable tree structure showing all available nodes and their paths.`,
    `Build a JSONPath expression using the interactive builder by selecting nodes from the tree or typing the expression manually with autocomplete suggestions.`,
    `Execute the JSONPath query and view matching results highlighted in the source. Results are listed in the panel with their full paths and values for inspection.`,
  ],
  [
    `Paste any JSON data into the input area. The tool parses the JSON and renders it as an interactive collapsible tree structure for visual data exploration.`,
    `Navigate the tree by clicking expand and collapse arrows to show or hide nested objects and arrays. The view displays types and values with color coding.`,
    `Use the search box to find specific keys or values. Click any node to see its full path, value, and type in the detail panel for deep inspection.`,
  ],
  [
    `Paste YAML data with inconsistent, mixed, or incorrect indentation. The tool accepts any YAML including mappings, sequences, multi-line strings, and complex nested structures.`,
    `Set the desired indentation width and use spaces only since tabs are not valid YAML indentation. Configure line wrapping options for long lines.`,
    `Reindent the YAML by parsing and regenerating it with consistent indentation. The tool also validates the YAML structure and reports any parsing errors found.`,
  ],
  [
    `Paste CSV data or upload a CSV file with a header row that defines the column names. The tool parses the data and prepares it for SQL INSERT statement generation.`,
    `Configure the target SQL table name, column data types, and whether to generate CREATE TABLE statements alongside the INSERT statements for complete schema creation.`,
    `Generate SQL INSERT statements from the CSV data. Download the SQL file for direct execution against your database or copy the statements individually.`,
  ],
  [
    `Paste text containing Unicode characters that need conversion between different Unicode normalisation forms such as NFC, NFD, NFKC, or NFKD forms.`,
    `Choose the conversion direction and target Unicode form. Select additional options like escape sequence format for JavaScript, HTML, or CSS context compatibility.`,
    `Convert the Unicode text to the target form and review the result. The tool highlights differences between the original and converted text for easy verification.`,
  ],
];

const faqTexts = [
  // Each slug gets 3 unique QA pairs
  [
    { q: "What programming languages does the beautifier support for formatting source code?", a: "It supports JavaScript, TypeScript, Python, Java, C, C++, C Sharp, Go, Rust, PHP, Ruby, Swift, Kotlin, Dart, HTML, CSS, SCSS, Less, XML, YAML, JSON, SQL, and Markdown with language-specific formatting rules for each language." },
    { q: "How does the beautifier handle minified code and can it expand compressed code?", a: "Minified code is expanded by adding proper line breaks at statement boundaries and then formatted according to the selected style. The tool warns if the input appears to be already minified before starting processing." },
    { q: "Can I customize the beautifier to follow a specific style guide like Google or Airbnb?", a: "Yes, built-in presets for Google, Airbnb, StandardJS, Prettier, and ESLint configurations are available. Select a preset to automatically apply its specific formatting rules for consistent output." },
  ],
  [
    { q: "What formatting options does the tool provide beyond basic indentation control?", a: "It offers trailing comma insertion or removal, arrow function parenthesis, bracket positioning, quote style conversion, semicolon enforcement, spacing around operators, and property sorting within objects." },
    { q: "How does the tool handle formatting of code embedded within template literals or strings?", a: "Embedded code blocks such as JSX in JavaScript, CSS-in-JS template literals, and HTML in template strings are recursively processed using their respective parsers for correct formatting." },
    { q: "Can the formatter be configured to work consistently across a multi-language project?", a: "Yes, project mode lets you define a configuration file that specifies formatting rules for every language in your project, ensuring consistent style across all contributors and CI pipelines." },
  ],
  [
    { q: "How does the CSS formatter handle nested rules and preprocessor nesting structures?", a: "CSS nesting and PostCSS nesting are recognized and treated with progressive indentation. Each nesting level increases the indent, making the hierarchy visually clear and readable." },
    { q: "Can the formatter sort CSS properties in a specific order for consistent stylesheets?", a: "Yes, choose from alphabetical sorting, concentric ordering covering position and display through typography and visual properties, or SMACSS-style grouping for organized stylesheets." },
    { q: "How are vendor prefixes and their grouping handled during CSS formatting?", a: "Vendor-prefixed properties like webkit and moz are grouped together after the standard property by default, or you can enable prefix-first mode where prefixed versions come before the standard property." },
  ],
  [
    { q: "How much size reduction can I expect from CSS minification for my stylesheets?", a: "Typical reduction ranges from 30 to 60 percent depending on original formatting. Safe mode saves about 20 to 30 percent by removing whitespace while aggressive mode can save up to 70 percent." },
    { q: "What CSS optimizations does the aggressive compression mode perform beyond whitespace removal?", a: "Aggressive mode performs hex color shortening, margin and padding shorthand merging, duplicate selector removal, redundant property removal, zero unit stripping, and font-weight number conversion." },
    { q: "Does the minifier preserve CSS source maps for debugging the minified output files?", a: "Yes, source map generation can be enabled. The minifier outputs a map file alongside the minified CSS, allowing browser devtools to map minified styles back to the original source." },
  ],
  [
    { q: "How does the HTML formatter handle embedded CSS and JavaScript within style and script tags?", a: "Embedded CSS inside style tags is formatted with the CSS parser and JavaScript inside script tags is formatted with the JS parser. Each embedded language gets its own appropriate formatting." },
    { q: "Can the formatter preserve specific inline elements from being broken onto separate lines?", a: "Yes, configure inline element preservation for tags like span, strong, em, and anchor so they stay on the same line as surrounding text instead of being treated as block elements." },
    { q: "What attribute ordering options are available for consistent HTML formatting results?", a: "You can order attributes alphabetically, by importance with id and class first then aria and data attributes, or preserve the original order with the option to add newlines for long lines." },
  ],
  [
    { q: "What HTML elements and attributes can be safely removed during the minification process?", a: "Optional closing tags for list items and paragraphs are removed per HTML5 spec. Boolean attributes like disabled and checked are collapsed. Default type attributes are stripped from script and style tags." },
    { q: "How does the minifier handle Internet Explorer conditional comments in HTML documents?", a: "IE conditional comments are preserved by default to maintain compatibility. You can optionally strip them if you no longer need IE support, which reduces the file size further." },
    { q: "Can the minifier process multiple HTML files in batch mode for a complete website build?", a: "Yes, upload a zip of HTML files for batch processing. Each file is minified individually and packaged as a downloadable zip archive with the same directory structure preserved." },
  ],
  [
    { q: "What HTML attribute transformations are performed when converting to React JSX syntax?", a: "Class becomes className, for becomes htmlFor, tabindex becomes tabIndex, style strings become JavaScript objects, and various SVG attributes are converted to their camelCase equivalents." },
    { q: "How does the converter handle inline CSS styles during the HTML to JSX conversion process?", a: "Inline style strings are parsed and converted to camelCase JavaScript objects. Background-color becomes backgroundColor and font-size becomes fontSize with appropriate value handling." },
    { q: "Can the tool convert SVG elements embedded in HTML to proper JSX SVG syntax format?", a: "Yes, SVG attributes such as stroke-width becoming strokeWidth and fill-rule becoming fillRule are handled appropriately for inline SVGs within JSX components." },
  ],
  [
    { q: "How does the formatter handle formatting of async and await and Promise chains in JavaScript?", a: "Async functions and await expressions are formatted with proper indentation. Promise chains are aligned on the dot operator by default or configured to indent on each new chain method." },
    { q: "Can the formatter convert between CommonJS require and ES module import syntax automatically?", a: "Yes, optional module conversion transforms require calls to import statements and module.exports to export default or named exports for migrating legacy codebases to ESM." },
    { q: "Does the formatter automatically sort and group import statements by their source type categories?", a: "Yes, import sorting groups built-in modules, third-party packages, and internal modules together. Each group is separated by a blank line for improved code readability." },
  ],
  [
    { q: "What JavaScript minification techniques does the tool apply beyond simple whitespace removal?", a: "It performs identifier shortening known as mangling, dead code elimination, constant folding where constants are precomputed, expression simplification, and block statement merging." },
    { q: "How does the minifier ensure compatibility with older browsers during the minification process?", a: "The ES5 compatibility mode avoids using modern syntax like arrow functions and const in the output. Ensure your target browser matrix is set before starting minification." },
    { q: "Can the minifier preserve specific function or variable names from being shortened during mangling?", a: "Yes, a reserved names list lets you specify identifiers to exclude from mangling such as jQuery dollar sign and underscore for global API names exposed to consumers." },
  ],
  [
    { q: "How does the JSX formatter handle long prop lists on React components with many properties?", a: "When a component has more than a few props or a prop value exceeds the line width, each prop is placed on its own line with consistent indentation for readability." },
    { q: "Can the formatter convert between string props and JSX expression props automatically?", a: "Yes, the formatter can convert static string props to JSX expression props and vice versa based on the configured quote and expression preference for consistency." },
    { q: "Does the tool format inline CSS objects within JSX style props as multi-line object structures?", a: "Yes, inline style objects are expanded to multi-line format when they contain more than a few properties with each CSS property on its own line using proper camelCase keys." },
  ],
  [
    { q: "What Markdown formatting inconsistencies does the tool automatically detect and fix?", a: "It normalizes heading spacing with one space after the hash symbols, list indentation, blank lines around blocks, consistent table column alignment, and trailing spaces removal." },
    { q: "How does the formatter handle long lines and paragraph text wrapping in Markdown documents?", a: "Paragraphs are wrapped at the configured line width while preserving intentional line breaks. Code blocks and inline code are never reflowed to maintain their original content." },
    { q: "Can the tool format Markdown tables with proper column alignment automatically for readability?", a: "Yes, tables are reformatted so column widths are uniform based on the longest cell in each column. Alignment markers in the separator row are adjusted to match the configured style." },
  ],
  [
    { q: "What Markdown elements are converted differently when targeting Slack mrkdwn message format?", a: "Headings become bold text since Slack has no heading levels, horizontal rules are removed, tables are converted to formatted text, and images become hyperlinks." },
    { q: "How does the tool handle Slack-specific formatting that has no equivalent in standard Markdown?", a: "Slack emoji shortcuts like smile, channel references like general, and user mentions like username are preserved as-is since they are native to Slack and have no Markdown equivalent." },
    { q: "Can the converter handle Slack message attachments and block kit formatting during conversion?", a: "Yes, the converter supports Slack message attachment formatting including field titles and values that are converted to Markdown blockquotes or tables with appropriate structure." },
  ],
  [
    { q: "How does the Python formatter handle wrapping of long function signatures and argument lists?", a: "Long parameter lists are wrapped with each argument on its own line indented from the opening parenthesis following PEP 8 guidelines for hanging indents and alignment." },
    { q: "Can the formatter convert between single-quoted and double-quoted strings consistently in Python code?", a: "Yes, choose your preferred quote style and the tool converts all strings to the selected style, escaping embedded quotes appropriately for consistent code appearance." },
    { q: "Does the tool automatically sort and group Python imports following PEP 8 import conventions?", a: "Yes, imports are sorted into groups for standard library, third-party, and local imports. Each group is separated by a blank line and imports within groups are alphabetized." },
  ],
  [
    { q: "How does the SCSS formatter handle deep nesting and prevent overly specific selectors?", a: "The tool warns when nesting exceeds a configurable depth limit. Deeply nested selectors are flagged as potential specificity issues with suggestions to refactor structure." },
    { q: "Can the formatter convert between SCSS and Sass indented syntax during the formatting process?", a: "Yes, the SCSS to Sass mode converts braces and semicolons to indentation-based syntax and vice versa with comments and variable declarations preserved during conversion." },
    { q: "Does the tool format mixin definitions and include calls with consistent argument formatting?", a: "Yes, mixin definitions have consistent parameter formatting with one per line for long lists. Include calls are formatted with parentheses handling based on configuration." },
  ],
  [
    { q: "How does the TSX formatter handle generic React components with complex type parameters?", a: "Generic parameters in JSX are formatted with proper spacing and indentation. The formatter distinguishes JSX tags from TypeScript generics using context-aware parsing heuristics." },
    { q: "Can the formatter convert between type and interface declarations for component props?", a: "Yes, optional conversion mode transforms interface declarations to type aliases for props, helping maintain consistent style within a project that prefers type over interface." },
    { q: "Does the tool format React hook dependency arrays with consistent spacing and alignment?", a: "Yes, useEffect and useMemo and useCallback dependency arrays are formatted with each dependency on its own line when the array exceeds the line width." },
  ],
  [
    { q: "How does the TypeScript formatter handle complex union and intersection types across lines?", a: "Long union types with the pipe symbol and intersection types with the ampersand are wrapped with each member on its own line indented from the type keyword for readability." },
    { q: "Can the formatter sort and organize interface properties and type members automatically?", a: "Yes, properties can be sorted alphabetically or by visibility such as public then private. Optional properties and method signatures are grouped into consistent sections." },
    { q: "Does the tool format JSDoc comments and transform them to TypeScript annotations properly?", a: "Yes, JSDoc comments are preserved and can optionally be converted to inline type annotations. Parameter descriptions are kept while type tags become TypeScript types." },
  ],
  [
    { q: "How does the YAML formatter handle inconsistent indentation and fix it automatically?", a: "The tool detects the dominant indentation level and normalizes all blocks to that level. Mixed tabs and spaces are converted to spaces and alignment is standardized." },
    { q: "Can the formatter convert between block and flow style for YAML collections and mappings?", a: "Yes, block-style mappings can be converted to flow-style with curly braces for compact representation and vice versa depending on readability needs." },
    { q: "Does the tool format multi-line strings with the appropriate YAML block scalar indicators?", a: "Yes, the formatter selects between literal block for strings with newlines and folded block for strings where spaces are preserved but newlines are soft-wrapped." },
  ],
  [
    { q: "How does the tool generate realistic sample data for different Avro field types automatically?", a: "String fields get lorem ipsum text, int and long fields get random numbers, float and double get decimal values, boolean gets random true or false, and enum picks from defined symbols." },
    { q: "What happens when the Avro schema contains complex nested types like records within records?", a: "Nested records are recursively generated with the same logic. The depth of nesting is preserved exactly as defined with parent-child relationships maintained in the output." },
    { q: "Can the tool generate sample data matching specific constraints like min and max values?", a: "Yes, if your Avro schema includes logical types such as decimal or date or custom properties for constraints, the sample generator respects these to produce valid data." },
  ],
  [
    { q: "How does the converter handle authentication headers like Bearer tokens and Basic Auth?", a: "Authorization headers are preserved as header flags in curl or converted to the user flag for Basic Auth. The tool warns if it detects hardcoded credentials in the output." },
    { q: "Can the tool convert requests with multipart form data and file uploads to curl syntax?", a: "Yes, multipart requests are converted to curl form flags. File uploads are represented as form field with at-sign filename with appropriate content type detection." },
    { q: "Does the converter preserve cookie handling and session information from the source code?", a: "Yes, cookies set via headers or cookie jars are converted to cookie flags in curl. Session state is represented as individual cookie key-value pairs in the command." },
  ],
  [
    { q: "What HTTP client libraries across which languages can the parser recognize and extract from?", a: "It recognizes JavaScript fetch and axios and superagent, Python requests and httpx and aiohttp, Java OkHttp and HttpURLConnection, Go net/http, Ruby Net::HTTP and Faraday." },
    { q: "How does the parser handle dynamically constructed URLs with template literals or concatenation?", a: "Dynamic URL construction is partially resolved with static parts extracted and dynamic variables shown as placeholders that you can fill in manually to complete the URL." },
    { q: "Can the parser extract request components even when the code is minified or obfuscated?", a: "The parser works best with readable code. For minified code it makes a best-effort extraction but may miss some patterns. Beautifying the code first improves accuracy." },
  ],
  [
    { q: "How does the converter handle complex curl features like data-binary and form and cookie-jar?", a: "Data-binary becomes raw body with binary encoding, form becomes multipart form data construction, and cookie-jar becomes cookie store setup with appropriate functionality." },
    { q: "Can the tool generate both synchronous and asynchronous versions of the HTTP call?", a: "Yes, toggle between sync and async output. JavaScript supports async fetch versus synchronous XMLHttpRequest and Python supports httpx sync versus async modes." },
    { q: "Does the generated code include proper error handling and status code checking logic?", a: "Yes, the output includes try-catch blocks, HTTP status validation checking for 2xx responses and throwing on 4xx and 5xx, and connection timeout handling." },
  ],
  [
    { q: "How does the converter handle insecure and cacert curl flags for TLS configuration?", a: "Insecure sets SSL verification to false with a security warning and cacert adds custom CA bundle configuration in the generated code with proper file paths." },
    { q: "Can the tool convert curl commands with piped input or output redirection operators?", a: "Piped input and output redirection are flagged as they depend on the shell environment. The generated code includes comments suggesting equivalent data flow handling." },
    { q: "Does the generated code use environment variables for configurable values like tokens and URLs?", a: "Yes, sensitive values like Bearer tokens, API keys, and base URLs are replaced with environment variable references for secure deployment across environments." },
  ],
  [
    { q: "What is the difference between JSON-RPC positional and named parameter calling conventions?", a: "Positional parameters use a JSON array where order matters while named parameters use a JSON object with key-value pairs. Named parameters are generally preferred for clarity." },
    { q: "How does the builder handle JSON-RPC batch requests with multiple method calls included?", a: "Batch requests are constructed by adding multiple request objects to the builder. Each gets its own unique ID and they are wrapped in a JSON array for processing." },
    { q: "Can the tool generate JSON-RPC error objects for testing error handling scenarios?", a: "Yes, the error builder creates properly formatted JSON-RPC 2.0 error objects with code, message, and optional data field. Standard error codes are predefined." },
  ],
  [
    { q: "How does the converter handle Pug mixins and includes during conversion to HTML output?", a: "Mixins are expanded inline with their arguments substituted. Includes are resolved by reading the referenced file or by displaying a placeholder where the include goes." },
    { q: "Can the converter handle Pug interpolation with variables and unescaped interpolation safely?", a: "Yes, both escaped and unescaped interpolation are processed. Escaped interpolation is HTML-entity encoded while unescaped interpolation outputs raw HTML content." },
    { q: "Does the tool support Pug conditional statements and iteration during template rendering?", a: "Yes, conditionals and loops are evaluated based on provided sample data or rendered with placeholder values. Each iteration generates corresponding HTML blocks." },
  ],
  [
    { q: "How does the converter map protobuf scalar types to the target language type system?", a: "Int32 maps to number or integer, int64 maps to string for JavaScript or long for Java, float and double map to number, string maps to string, bool maps to boolean, and bytes maps to base64." },
    { q: "Can the tool handle protobuf imports and resolve cross-file type references automatically?", a: "Yes, when all imported proto files are provided the tool resolves type references across files. Forward references and circular imports are handled with proper ordering." },
    { q: "Does the conversion preserve protobuf field options and custom options and comments?", a: "Yes, field-level options are preserved as annotations. Comments are converted to JSDoc or equivalent documentation in the target format where supported." },
  ],
  [
    { q: "How does the decoder interpret protobuf wire types to reconstruct the message structure?", a: "Wire type zero decodes variable-length integers, type one reads eight bytes as fixed 64-bit, type two reads length-delimited strings or embedded messages, and type five reads four bytes." },
    { q: "What information is shown when decoding protobuf without the original proto schema file?", a: "Without a schema the decoder shows field numbers with their wire types, raw varint and fixed values, length-delimited data as hex, and nested message detection heuristics." },
    { q: "Can the tool decode protobuf messages containing oneof fields and map entries correctly?", a: "Yes, oneof fields are detected when multiple fields share the same oneof index. Map entries are decoded as repeated key-value message pairs with subfields." },
  ],
  [
    { q: "What is the advantage of converting SVG to CSS data URI versus linking a separate SVG file?", a: "Inline data URIs eliminate HTTP requests and work in CSS backgrounds without file path management. However they increase CSS file size by about 33 percent due to base64 encoding." },
    { q: "How does the tool handle SVG gradients and filters during the CSS conversion process?", a: "SVG gradients are preserved within the inline SVG data URI. CSS-only linear gradient conversion is available for simple two-stop color gradients lacking complex features." },
    { q: "Can the converter extract individual SVG path data for use as CSS clip-path shapes?", a: "Yes, individual SVG paths can be extracted and converted to CSS clip-path path format. The tool validates that the path is a single continuous shape suitable for clipping." },
  ],
  [
    { q: "How much file size reduction can I expect from SVG optimization for web graphics?", a: "Typical reduction ranges from 20 to 80 percent depending on the source. SVGs from vector editors have significant metadata overhead of 30 to 60 percent that can be stripped." },
    { q: "What SVG elements and attributes are removed during the cleanup optimization pass?", a: "Removed elements include editor namespaces, empty groups, unused defs, duplicate IDs, hidden elements, default attribute values, and XML declarations when not needed." },
    { q: "Does the optimizer simplify SVG paths by reducing coordinate precision without visible change?", a: "Yes, path coordinate precision is reduced to a configurable number of decimal places. A typical path with six decimal places can be reduced without visible quality loss." },
  ],
  [
    { q: "How does the C++ formatter handle template declarations with long parameter lists?", a: "Template declarations are formatted with each parameter on its own line when they exceed the line width. Template arguments in calls are also wrapped with proper alignment." },
    { q: "Can the formatter be configured to match an existing project's specific coding style?", a: "Yes, you can export the configuration as a clang-format file compatible with the Clang-Format tool for consistency between this online formatter and your local environment." },
    { q: "Does the tool properly format C++ lambda expressions with captures and trailing return types?", a: "Yes, lambdas are formatted with the capture list, parameters, and body all properly indented. Trailing return types are placed on the same line or wrapped based on line length." },
  ],
  [
    { q: "What Go formatting rules does the tool enforce that are specific to the Go language?", a: "It enforces tabs for indentation, gofmt-compatible brace placement with opening brace on same line, proper spacing around operators, comment formatting, and file-ending newline." },
    { q: "Can the formatter automatically fix common Go style issues like receiver naming problems?", a: "Yes, it suggests fixes for receiver names that should be short lowercase letters, variable shadowing detection, proper error variable names, and consistent naming conventions." },
    { q: "Does the tool sort and organize Go imports into standard library and third-party groups?", a: "Yes, imports are sorted into three groups for standard library, third-party packages, and local module imports with each group separated by a blank line." },
  ],
  [
    { q: "How does the Kotlin formatter handle formatting of chained method calls and extension functions?", a: "Chained calls are formatted with each method call on its own line indented by one level. The dot operator is placed at the start of each line for visibility and readability." },
    { q: "Can the formatter convert Java-style code patterns to idiomatic Kotlin during formatting?", a: "Yes, optional Java to Kotlin conversion transforms getters and setters to properties, static methods to companion object functions, and anonymous classes to lambdas." },
    { q: "Does the tool format Kotlin coroutine code with proper structuring of async and launch blocks?", a: "Yes, coroutine builders are formatted with proper block indentation. Flow collections and channel operations are formatted with consistent operator placement." },
  ],
  [
    { q: "What PHP coding standards does the beautifier support for formatting configuration?", a: "It supports PSR-1, PSR-2, PSR-12, Symfony, and Drupal coding standards. Each preset configures brace placement, line length, namespace formatting, and visibility ordering." },
    { q: "How does the beautifier handle PHP 8 attributes and named arguments during formatting?", a: "Attributes are placed on the line above the element they decorate with consistent indentation. Named arguments are formatted with the parameter name and value on the same line." },
    { q: "Can the tool organize PHP use statements alphabetically and group them by type category?", a: "Yes, use statements are sorted alphabetically and grouped into class imports, function imports, and constant imports with each group separated by a blank line per PSR-12." },
  ],
  [
    { q: "How does the Ruby formatter handle formatting of block arguments and multi-line blocks?", a: "Blocks with single-line bodies are formatted with curly braces. Multi-line blocks use do and end with proper indentation. Block arguments have consistent spacing inside pipes." },
    { q: "Can the formatter automatically convert between hash rocket and JSON-style syntax in Ruby?", a: "Yes, the formatter converts older hash rocket syntax to the modern JSON-style syntax where appropriate and vice versa depending on the configured style preference." },
    { q: "Does the tool format Ruby method chains with proper alignment and line breaking logic?", a: "Yes, method chains are formatted with the dot at the beginning of each continuation line. Trailing dots are avoided and long chains are wrapped with one method per line." },
  ],
  [
    { q: "What Rust-specific formatting rules does the tool enforce for Rust code formatting?", a: "It enforces proper placement of where clauses, formatted use statements with nesting, proper spacing around arrow symbols, consistent match arm formatting, and struct literal formatting." },
    { q: "How does the formatter handle Rust macro invocations with complex token trees?", a: "Macro invocations are preserved with their original formatting by default. Common macros are formatted with consistent spacing and nested macro calls are properly indented." },
    { q: "Can the tool merge and organize Rust use statements into a consistent nested style?", a: "Yes, use statements can be merged into nested use trees or kept as separate lines. Imports are sorted alphabetically within their groups for organized code." },
  ],
  [
    { q: "How does the Swift formatter handle formatting of SwiftUI view builder closures and modifiers?", a: "SwiftUI view bodies are formatted with each view on its own line. Modifier chains are indented one level from the view with one modifier per line for readability." },
    { q: "Can the formatter convert between Swift old and new coding conventions automatically?", a: "Yes, optional conversions include key path syntax, objc dynamic to objc only when needed, and old-style closure syntax to trailing closure syntax for modern Swift." },
    { q: "Does the tool properly format Swift error handling with throws and try and catch blocks?", a: "Yes, throwing functions are formatted with throws before the return arrow. Try expressions have proper spacing and catch blocks are placed correctly with error patterns." },
  ],
  [
    { q: "What XML validation checks does the tool perform beyond basic well-formedness checks?", a: "It validates namespace prefix declarations match their URIs, element and attribute names follow XML naming rules, CDATA sections are properly terminated, and document structure." },
    { q: "How does the minifier handle XML namespaces and preserve essential whitespace content?", a: "Namespace declarations are preserved. Whitespace in elements with space equals preserve attribute is kept intact. CDATA sections are preserved but tag whitespace is collapsed." },
    { q: "Can the tool validate XML against an XSD schema or DTD for structural correctness checking?", a: "Yes, provide an XSD schema or DTD to validate the XML document structure, required elements, attribute types, and data value constraints beyond well-formedness." },
  ],
  [
    { q: "How does the XML formatter handle mixed content with both text and child elements mixed?", a: "For mixed content models with text interleaved with elements, the tool preserves inline text formatting and does not break text nodes onto separate lines for accuracy." },
    { q: "Can the formatter reformat XML that is already partially formatted with inconsistent indentation?", a: "Yes, the formatter parses the XML into a DOM structure and regenerates the output from scratch, removing all existing formatting and applying consistent rules." },
    { q: "Does the tool offer options for namespace prefix handling and xmlns attribute placement?", a: "Yes, xmlns declarations can be kept on the root element or moved to the element where each namespace is first used. Namespace prefixes are preserved or shortened." },
  ],
  [
    { q: "What cron expression syntax features does the parser support for complex schedule definitions?", a: "It supports all standard operators including ranges, steps, and lists. Month and weekday names such as JAN or SUN are supported along with special shortcuts like yearly." },
    { q: "How does the parser handle non-standard cron features like L for last and W for weekday?", a: "L for last day or month or weekday is supported in extended mode. W for nearest weekday is also supported as Quartz-specific extensions for Java scheduling." },
    { q: "Can the tool detect invalid or impossible cron expressions and suggest corrections for them?", a: "Yes, it validates that field values are within allowed ranges, detects impossible dates like February 30, and flags expressions that would rarely or never execute." },
  ],
  [
    { q: "What cryptographic algorithms are available in the crypto kit toolkit for developers?", a: "It includes SHA-256 and SHA-384 and SHA-512, HMAC with all SHA variants, PBKDF2 with adjustable iterations, Argon2id via WASM, AES encryption, HKDF key derivation, and random generation." },
    { q: "How does the tool ensure cryptographic operations are performed securely in the browser?", a: "All operations use the Web Crypto API which is backed by the operating system's cryptographic primitives. Key material and plaintext never leave the browser environment." },
    { q: "Can the tool be used to generate cryptographically secure random passwords and tokens?", a: "Yes, the random generation module uses crypto.getRandomValues to produce secure random bytes suitable for generating API keys, session tokens, and initialization vectors." },
  ],
  [
    { q: "What docker run flags does the converter map to Docker Compose YAML configuration keys?", a: "Port mappings become ports, volumes become volumes, environment variables become environment, network becomes networks, restart becomes restart, and name becomes container name." },
    { q: "How does the tool handle docker run commands with multiple containers linked via link flag?", a: "Multiple containers are each converted to separate services. Link directives are converted to depends_on with optional conditions and shared networks in the networks section." },
    { q: "Can the converter handle complex docker run features like mount with volume options specified?", a: "Yes, mount type bind or volume or tmpfs is converted to the compose mount syntax. Capabilities become cap_add and security options become security_opt in the output." },
  ],
  [
    { q: "How does the HTML preview render JavaScript-heavy pages and single-page applications?", a: "JavaScript is fully executed in the sandboxed iframe including DOM manipulation, fetch requests, and ES modules. The preview updates in real-time as you edit the source code." },
    { q: "Is the preview sandboxed to prevent security risks from untrusted HTML content loading?", a: "Yes, the preview loads in a sandboxed iframe with restricted permissions including no form submission to external sites and no access to the parent page origin." },
    { q: "Can the tool highlight corresponding source code when an element is hovered in preview?", a: "Yes, the inspector mode links the preview and source editor. Clicking an element in the preview scrolls the source to the corresponding HTML for debugging layout issues." },
  ],
  [
    { q: "What OAuth grant types does the client setup wizard support for different application types?", a: "It supports Authorization Code with PKCE for SPAs and mobile apps, Authorization Code with client secret for server-side apps, Client Credentials for machine to machine, and Device Code." },
    { q: "How does the tool generate provider-specific configuration for different OAuth platforms?", a: "Each provider has a customized template using the correct format for its console. Google uses Google Cloud Console format and GitHub uses OAuth App settings format." },
    { q: "Can the generated configuration include environment variable placeholders for sensitive credentials?", a: "Yes, client secrets and client IDs are output as environment variable references for secure deployment across different environments without hardcoding credentials." },
  ],
  [
    { q: "How does the scope builder help determine the minimum scopes needed for an application?", a: "Scopes are annotated with the specific API endpoints they enable. The builder shows a dependency tree where broader scopes include narrower ones for least-privilege selection." },
    { q: "Can the tool validate that a scope combination is valid for the selected provider and grant type?", a: "Yes, it validates scope combinations against provider-specific rules including restricted scopes requiring verification, incompatible pairs, and scopes needing configuration." },
    { q: "Does the scope builder support OpenID Connect scopes and custom claims parameters for OIDC?", a: "Yes, OIDC scopes are included with explanations of which claims each returns. The builder can also generate a claims parameter for specific claims beyond default mappings." },
  ],
  [
    { q: "How does the password entropy calculator determine the estimated cracking time needed?", a: "It uses the formula where time equals two to the power of entropy minus one divided by guesses per second. Three tiers are shown from online to massive botnet speeds." },
    { q: "What factors reduce the effective entropy of a password beyond character set and length?", a: "Patterns like dictionary words, keyboard patterns, repeated characters, common substitutions, dates, names, and previously breached passwords reduce effective entropy." },
    { q: "What is the recommended minimum entropy for different security contexts and applications?", a: "For online services moderate is 30 to 40 bits and strong is 50 to 60 bits. For encryption keys and password managers more than 80 bits is very strong for security." },
  ],
  [
    { q: "How does the converter map Postman collection structures to OpenAPI specification components?", a: "Postman folders become tags, requests become paths with operations, URL parameters become path or query parameters, request bodies become requestBody schemas, and examples become examples." },
    { q: "What Postman-specific features like scripts are handled during conversion to OpenAPI format?", a: "Pre-request scripts and test scripts are preserved as custom extensions in the OpenAPI output. Dynamic variables are converted to schema examples or removed based on config." },
    { q: "Can the tool handle Postman collections with variables and environment-based URL structures?", a: "Yes, Postman variables in URLs are extracted and converted to server variables in OpenAPI. The tool creates a servers array with the variable definitions." },
  ],
  [
    { q: "How does the converter map OpenAPI paths and operations to Postman collection items?", a: "Each OpenAPI path plus operation becomes a Postman request. Tags create folders. Operation summaries become request names and parameters become Postman parameters." },
    { q: "What OpenAPI authentication schemes are converted to Postman authorization presets?", a: "API Key becomes API Key auth, Bearer HTTP becomes Bearer Token, Basic HTTP becomes Basic Auth, and OAuth flows become OAuth 2.0 with the specified grant type." },
    { q: "Can the tool generate Postman environment variables from OpenAPI server variables defined?", a: "Yes, server variables become environment variables with default values. Example parameters and request bodies are stored as Postman examples for quick testing." },
  ],
  [
    { q: "What documentation formats can the REST endpoint documenter generate for API consumers?", a: "It generates Markdown readable docs with tables, HTML styled documentation page, OpenAPI 3.0 YAML or JSON machine-readable spec, and curl command examples for each endpoint." },
    { q: "How does the tool help ensure documentation completeness for each API endpoint created?", a: "It tracks required fields including endpoint description, parameter descriptions and types, and response status codes with examples. Missing fields are highlighted before generation." },
    { q: "Can the documenter auto-generate request examples from defined schemas and parameter values?", a: "Yes, based on parameter types and constraints such as min and max and enum and pattern, the tool generates realistic example values for documentation." },
  ],
  [
    { q: "What is the difference between URL encoding and URL component encoding in the tool?", a: "Full URL encoding encodes the entire URL including colons and slashes making it unusable. Component encoding only encodes characters invalid in a specific URL component." },
    { q: "Which characters are always encoded in URL percent-encoding according to RFC 3986 rules?", a: "Reserved characters like colon and slash and question mark and hash are encoded. Spaces become percent-encoded sequences or plus signs in form context." },
    { q: "How does the tool handle Unicode and non-ASCII characters during URL encoding operations?", a: "Non-ASCII characters including Unicode are first encoded as UTF-8 bytes then each byte is percent-encoded. The tool shows the intermediate UTF-8 byte sequence." },
  ],
  [
    { q: "What URL components does the parser extract from a given URL string or address?", a: "It extracts protocol, hostname, port, pathname, search or query string, hash or fragment, origin, username, password, and the full href for complete component analysis." },
    { q: "How does the parser handle URLs with internationalized domain names containing Unicode characters?", a: "IDN domains are shown in both Unicode form and Punycode-encoded form. The parser validates the IDN and shows conversion details for each method." },
    { q: "Can the tool parse and decode query string parameters into a structured key-value table?", a: "Yes, the query string is parsed into a table showing each parameter name, its decoded value, and whether it appears multiple times with duplicate keys grouped." },
  ],
  [
    { q: "What technical information does the web inspector extract from a given website URL?", a: "It extracts page metadata, heading structure for SEO analysis, broken links, images missing alt text, Open Graph and Twitter Card tags, HTTP status, and content type headers." },
    { q: "Can the inspector analyze the page SEO and accessibility compliance automatically for you?", a: "Yes, it checks meta description presence and length, title tag length, heading hierarchy with single h1 and sequential order, alt text on images, and ARIA landmarks." },
    { q: "Does the tool detect third-party scripts and trackers and analytics services loaded by pages?", a: "Yes, it identifies known third-party scripts such as Google Analytics and Facebook Pixel and CDN libraries showing their source URLs and categories." },
  ],
  [
    { q: "How does the GraphQL query formatter handle deeply nested queries with multiple field levels?", a: "Each nesting level is indented by the configured amount. Fields with sub-selections are formatted with the opening brace on the same line and fields indented below." },
    { q: "Can the formatter validate the GraphQL query syntax while formatting the query content?", a: "Yes, the tool parses the query using the GraphQL parser and reports syntax errors before formatting. Invalid queries are not formatted and errors are shown instead." },
    { q: "Does the tool support formatting of GraphQL operations with fragment spreads and inline fragments?", a: "Yes, fragment spreads are preserved and formatted inline. Inline fragments are formatted with the type condition on the same line and the selection set indented below." },
  ],
  [
    { q: "How does the converter map GraphQL scalar types to JSON Schema type definitions?", a: "GraphQL String maps to type string, Int maps to type integer, Float maps to type number, Boolean maps to type boolean, and ID maps to type string with pattern restriction." },
    { q: "How are GraphQL non-null types and list types in the generated JSON Schema output?", a: "Non-null fields become required entries in the required array. List types become type array with items referencing the inner type schema for proper validation." },
    { q: "Can the tool convert GraphQL enum types to JSON Schema enums with allowed values correctly?", a: "Yes, GraphQL enums are converted to JSON Schema with type string and an enum array containing all allowed values with descriptions preserved from the GraphQL schema." },
  ],
  [
    { q: "How does the subscription builder structure the GraphQL subscription schema definition?", a: "The subscription is defined as a field on the Subscription root type with an input argument for filtering and a return type describing the event payload structure." },
    { q: "Can the tool generate client-side code for subscribing to GraphQL events using WebSocket?", a: "Yes, it generates code for Apollo Client useSubscription hook, urql useSubscription, Relay useSubscription, and raw WebSocket with graphql-ws protocol." },
    { q: "Does the builder include error handling and reconnection logic for production subscription use?", a: "Yes, generated code includes WebSocket connection lifecycle, automatic reconnection with exponential backoff, error callback handling, and cleanup of subscriptions." },
  ],
  [
    { q: "How does the formatter validate GraphQL variables against the operation definitions?", a: "It parses the GraphQL operation to extract variable definitions and checks that each variable in the JSON matches the defined type and no required variable is missing." },
    { q: "Can the tool generate default values for missing GraphQL variables based on their types?", a: "Yes, for optional variables with default values in the schema the tool can provide sensible defaults such as empty strings and zero and false for booleans." },
    { q: "Does the formatter support converting between GraphQL variables and query string parameters?", a: "Yes, variables can be converted to URL-encoded query string format for GET-based GraphQL queries or to JSON for POST requests with both serialization formats supported." },
  ],
  [
    { q: "How is CSS specificity calculated according to the W3C specification rules for cascade?", a: "Specificity is a four-part value with inline styles at the highest weight, then IDs, then classes and attributes and pseudo-classes, then elements and pseudo-elements." },
    { q: "How does the tool handle the is and not and has pseudo-classes in specificity calculation?", a: "For is and not and has the specificity uses the most specific argument in the selector list. The where pseudo-class always has zero specificity regardless of arguments." },
    { q: "Can the calculator help debug why certain CSS rules are not being applied as expected?", a: "Yes, enter both the selector that should apply and the overriding selector. The tool shows specificity of each and explains which cascading rules determine the winner." },
  ],
  [
    { q: "What encoding and decoding formats does the universal encoder-decoder tool support?", a: "It supports Base64 standard and URL-safe, Base32 as per RFC 4648, Base16 hex, URL percent encoding, HTML entity encoding, Unicode escape sequences, and quoted-printable." },
    { q: "How does the tool auto-detect whether the input is already encoded and which scheme was used?", a: "The auto-detect mode analyzes the character set, length, and pattern of the input. Base64 ends with padding characters, hex contains only hex digits, and URL encoding has percent signs." },
    { q: "Can the tool chain multiple encoding and decoding operations in sequence for nested data?", a: "Yes, the pipeline mode lets you apply multiple encode or decode steps in sequence. Each step is applied to the result of the previous step for nested encodings." },
  ],
  [
    { q: "What number bases does the converter support for conversion between numbering systems?", a: "It supports base-2 binary through base-64 with all standard bases including 8 octal, 10 decimal, 16 hexadecimal, 32 Crockford, and 64 with custom character sets." },
    { q: "How does the tool handle very large numbers that exceed JavaScript safe integer range?", a: "Numbers beyond the maximum safe integer are handled using BigInt for arbitrary precision integer conversion. Floating-point conversion uses string-based algorithms for exact representation." },
    { q: "Can the converter display the number in IEEE 754 single and double precision binary formats?", a: "Yes, for decimal inputs the tool shows the IEEE 754 binary representation including 32-bit float and 64-bit double with sign exponent and mantissa breakdown." },
  ],
  [
    { q: "How does the tool calculate the conversion between pixels and rems for CSS values?", a: "To convert px to rem you divide by the root font size. To convert rem to px you multiply by the root font size. The default base is 16px making one rem equal to 16px." },
    { q: "What is the advantage of using rem units over px in responsive web design strategies?", a: "Rem units scale with the user browser font size settings improving accessibility. They also allow global resizing by changing a single root font-size value." },
    { q: "Can the converter handle CSS shorthand values with multiple values for batch conversion?", a: "Yes, multi-value CSS properties are parsed and each value is converted independently. The tool preserves the order and structure of shorthand declarations." },
  ],
  [
    { q: "What text case transformations does the text converter support for formatting strings?", a: "It supports uppercase, lowercase, Title Case, Sentence case, camelCase, snake_case, kebab-case, PascalCase, Train-Case, dot.case, alternating case, and inverse case." },
    { q: "How does the tool handle special characters and acronyms during case conversion operations?", a: "Acronyms in title case such as NASA and USA are preserved. Unicode characters maintain their case properties. Words with numbers are handled intelligently in conversions." },
    { q: "Can the tool perform bulk text transformations on multiple lines or a list of strings?", a: "Yes, multi-line mode applies the conversion to each line independently for converting lists of variable names or database column names to a different convention." },
  ],
  [
    { q: "How does the SQL formatter handle formatting of complex JOIN operations and subqueries?", a: "JOIN clauses are indented and aligned with their ON conditions. Subqueries are wrapped in parentheses and indented one level. Correlated subqueries are aligned with context." },
    { q: "Can the formatter convert between different SQL dialects during the formatting process?", a: "Yes, optional dialect conversion handles LIMIT and OFFSET becoming TOP or ROW_NUMBER and ILIKE becoming LOWER equals LOWER for cross-dialect compatibility." },
    { q: "Does the tool support formatting of DDL statements like CREATE TABLE with column definitions?", a: "Yes, CREATE TABLE columns are formatted one per line with type, constraints such as NOT NULL and DEFAULT and PRIMARY KEY, and comments aligned for readability." },
  ],
  [
    { q: "What types of secrets and credentials can the secret scanner detect automatically for you?", a: "It detects AWS access keys, Google API keys, Slack tokens, GitHub tokens, Stripe API keys, Twilio credentials, generic passwords, JWT tokens, private keys, and database connection strings." },
    { q: "How does the scanner reduce false positives when detecting potential secrets in code files?", a: "It uses entropy analysis and context-aware heuristics where high-entropy strings are flagged only in assignment contexts. Test values and examples are filtered out." },
    { q: "Can the tool scan git repositories for secrets committed in previous commit history?", a: "Yes, the full git mode analyzes the entire commit history not just current files. It uses patterns to find secrets in historical commits for comprehensive auditing." },
  ],
  [
    { q: "What JWT signing algorithms are supported for token generation and signing operations?", a: "It supports HS256, HS384, HS512 with HMAC, RS256, RS384, RS512 with RSA, ES256, ES384, ES512 with ECDSA, EdDSA with Ed25519, and PS256, PS384, PS512 with RSA-PSS." },
    { q: "How does the tool generate JWT tokens with custom payload claims and proper structure?", a: "The payload builder provides form fields for standard registered claims with date pickers for time-based claims. Custom claims can be added as key-value pairs." },
    { q: "Can the signer automatically set the expiration time based on a relative duration value?", a: "Yes, set expiration as a relative duration such as one hour or thirty minutes or seven days. The tool converts relative durations to Unix timestamps automatically." },
  ],
  [
    { q: "What JWT validation checks does the debugger perform on decoded tokens for security?", a: "It checks token structure with three segments, valid base64url encoding, expiration against current time, not-before time, issued-at chronology, and algorithm awareness." },
    { q: "How does the tool help debug common JWT issues like expired or malformed tokens?", a: "Each validation check has a clear pass or fail or error status. Expired tokens show the exact expiration time and malformed segments show the parsing error position." },
    { q: "Can the debugger extract and display nested JSON objects within JWT claims for inspection?", a: "Yes, nested claims within the payload are rendered as expandable and collapsible JSON trees. Complex claim structures are fully navigable for deep inspection." },
  ],
  [
    { q: "What AES encryption modes are available and which is recommended for different use cases?", a: "GCM authenticated encryption with integrity verification is recommended for most use cases. CBC is widely compatible but lacks authentication. ECB is not recommended." },
    { q: "How does the tool handle key and IV generation for secure AES encryption operations?", a: "The random key and IV generator uses crypto.getRandomValues for cryptographically secure bytes. Keys are generated at the selected bit length with appropriate IV sizes." },
    { q: "Can the tool decrypt previously AES-encrypted data if the same parameters are provided?", a: "Yes, the decrypt mode accepts ciphertext, key, IV, and all parameters. For GCM mode the authentication tag must be provided for integrity verification before decrypting." },
  ],
  [
    { q: "What Excel formats and CSV delimiters does the converter support for input files?", a: "Excel formats include xlsx Office Open XML, xls legacy, and xlsm macro-enabled. CSV delimiters include comma, tab, semicolon, pipe, and space with auto-detection." },
    { q: "How does the tool handle merged cells and complex Excel formatting during conversion?", a: "Merged cells are unmerged with the value copied to all cells in the merge range. Formatting like colors and fonts is stripped. Formulas are evaluated to cached values." },
    { q: "Can the tool convert multiple sheets from an Excel file into separate JSON files at once?", a: "Yes, each sheet becomes a separate JSON file or array within a single JSON object. You can combine all sheets into one JSON with sheet names as top-level keys." },
  ],
  [
    { q: "What regex engine does the bulk extractor and replacer use for pattern matching tasks?", a: "It uses the JavaScript RegExp engine compliant with ECMAScript supporting lookahead, lookbehind, named capture groups, Unicode property escapes, and dotAll mode." },
    { q: "Can the tool perform find-and-replace operations across multiple files or large text blocks?", a: "Yes, upload multiple files or paste a large text corpus. The tool processes all matches globally and shows a summary of replacements made per file." },
    { q: "How does the tool handle backreferences and capture groups in the replacement string pattern?", a: "Replacement strings can use dollar-sign with numbers for numbered groups, dollar-sign with angle brackets for named groups, and dollar-sign ampersand for the full match." },
  ],
  [
    { q: "What CSV merging strategies does the tool offer for combining datasets together?", a: "Append or vertical stack where files share columns, Horizontal merge side-by-side where files have same row count, Key-based join on a common column, and Column union." },
    { q: "How does the tool handle mismatched column names or structures between CSV files merging?", a: "Column mapping interface lets you map columns with different names but similar meaning. Unmatched columns are filled with null values or excluded from the output." },
    { q: "Can the merger deduplicate rows after combining multiple CSV files into one dataset?", a: "Yes, post-merge deduplication is available based on all columns matching, specific key columns, or fuzzy matching on text columns with duplicates listed in a report." },
  ],
  [
    { q: "What methods are available for splitting a large CSV file into smaller parts or segments?", a: "By row count such as every 1000 rows, by equal partition into a set number of files, by column value creating separate files per unique value, and by percentage division." },
    { q: "How does the splitter preserve the CSV header row in each output file created during splitting?", a: "By default every split file includes the header row as the first line. You can choose to include headers only in the first file for splitting operations." },
    { q: "Can the tool split a CSV by column value creating separate files for each category group?", a: "Yes, select a column to group by. Each unique value in that column gets its own output file named after the value for organized category-based file splitting." },
  ],
  [
    { q: "What is a CSV transpose operation and when would you use it in data processing workflows?", a: "Transposing swaps rows and columns making a 5-row by 3-column CSV become a 3-row by 5-column CSV. Useful for converting horizontal time-series data to vertical format." },
    { q: "How does the transpose tool handle mixed data types when rows become columns during conversion?", a: "Each column in the original becomes a row potentially mixing data types. The tool preserves all original values as strings and notes the original type if requested." },
    { q: "Can the tool transpose only a selected range of rows and columns rather than the entire dataset?", a: "Yes, select a range by specifying row and column indices or choose specific columns to include. This is useful when only a portion needs transformation." },
  ],
  [
    { q: "What JSON features does the formatter handle beyond basic pretty-printing and indentation?", a: "It handles key sorting alphabetically or custom, inline versus expanded arrays, trailing comma toggling, quote conversion, and JSON5 support with comments and unquoted keys." },
    { q: "Can the tool collapse specific parts of the JSON tree while expanding others for focus?", a: "Yes, the interactive tree view allows collapsing and expanding individual nodes for large JSON responses where you need to focus on specific sections." },
    { q: "Does the formatter provide line numbers and path navigation for each JSON node in the data?", a: "Yes, JSONPath expressions are shown for each node. Clicking a path highlights it in the source and line numbers help when debugging JSON parsing errors." },
  ],
  [
    { q: "What JSONPath syntax features does the query builder support for complex path queries?", a: "It supports dot notation, bracket notation, wildcards, array slices, filters with expressions, recursive descent, and union operators for comprehensive query construction." },
    { q: "Can the tool extract and export query results as a separate JSON or CSV file format?", a: "Yes, query results can be exported as a JSON array of matched values, a CSV file for flat results, or a new JSON document containing only the matched subtree." },
    { q: "How does the interactive tree view help users unfamiliar with JSONPath build correct queries?", a: "Clicking any node in the tree generates the corresponding JSONPath. Filters and conditions are added via dropdown menus without manual syntax knowledge." },
  ],
  [
    { q: "How does the JSON tree viewer handle files that are too large to display all at once?", a: "Large JSON files are loaded with virtualized rendering where only visible nodes are rendered in the DOM. Nodes outside the viewport are lazily loaded as you scroll." },
    { q: "What features does the tree viewer offer for analyzing complex JSON structures effectively?", a: "Features include collapse all and expand all, expand to specific depth, search by key name or value, filter by value type, copy node path, and copy value functionality." },
    { q: "Can the viewer highlight differences between two JSON documents in a side-by-side comparison?", a: "Yes, the compare mode loads two JSON documents side by side. Added nodes are green, removed nodes are red, and changed values are orange with both values shown." },
  ],
  [
    { q: "Why does YAML require consistent indentation and what happens when it is incorrect?", a: "YAML uses indentation for structure so incorrect indentation changes meaning or causes parse failures. Common issues include mixing tabs and spaces and inconsistent nesting depth." },
    { q: "How does the reindenter handle YAML with anchors and aliases that reference different levels?", a: "Anchors and aliases are preserved exactly. The reindenter parses the resolved YAML structure and regenerates the document maintaining correct references." },
    { q: "Can the tool convert YAML files between different indentation levels in bulk processing mode?", a: "Yes, batch mode processes multiple YAML files converting all to the target indentation for consolidating YAML files from different sources into a consistent style." },
  ],
  [
    { q: "How does the tool parse CSV headers and generate the corresponding SQL table schema?", a: "The first row is treated as column headers. Each column data type is inferred from the values allowing the tool to generate appropriate SQL types with size constraints." },
    { q: "Can the generated SQL include both CREATE TABLE and INSERT statements for complete setup?", a: "Yes, the tool can generate a CREATE TABLE statement with inferred column types followed by INSERT statements for each row. You can choose to include or skip the table creation." },
    { q: "Does the tool handle special characters and quotes in CSV values during SQL generation safely?", a: "Yes, special characters in string values are properly escaped for SQL. Single quotes are doubled and backslashes are handled according to the database type conventions." },
  ],
  [
    { q: "What Unicode normalization forms does the converter support for text transformation?", a: "It supports NFC for canonical composition, NFD for canonical decomposition, NFKC for compatibility composition, and NFKD for compatibility decomposition of characters." },
    { q: "Can the tool convert Unicode characters to escape sequences for different programming contexts?", a: "Yes, it generates escape sequences for JavaScript with backslash-u format, HTML with ampersand-hash format, CSS with backslash format, and Python with backslash-N format." },
    { q: "Does the converter detect malformed UTF-8 sequences and suggest proper encoding fixes?", a: "Yes, it validates UTF-8 byte sequences and flags malformed sequences. Invalid bytes are highlighted and the tool suggests the correct encoding for problematic characters." },
  ],
];

const NEWLINE = '\n';

let output = '';

for (let i = 0; i < missing.length; i++) {
  const slug = missing[i];
  const ins = instructionTexts[i % instructionTexts.length];
  const faq = faqTexts[i % faqTexts.length];
  
  output += NEWLINE;
  output += `  "${slug}": {\n`;
  output += `    instructions: [\n`;
  for (let j = 0; j < 3; j++) {
    const idx = (i * 3 + j) % ins.length;
    output += `      { title: "${j+1}. Step ${j+1}", desc: "${ins[idx]}" }${j < 2 ? ',' : ''}\n`;
  }
  output += `    ],\n`;
  output += `    faqs: [\n`;
  for (let j = 0; j < 3; j++) {
    const idx = (i * 3 + j) % faq.length;
    const q = faq[idx].q;
    const a = faq[idx].a;
    output += `      { question: "${q}", answer: "${a}" }${j < 2 ? ',' : ''}\n`;
  }
  output += `    ]\n`;
  output += `  },${NEWLINE}`;
}

// Now replace the closing
const marker = '  "text-to-binary": {';
const markerEnd = '},';

// Find the last entry closing and insert before "};"
const closePos = content.lastIndexOf('};');
const endPos = closePos;

const newContent = content.slice(0, closePos) + output + content.slice(closePos);

fs.writeFileSync(filePath, newContent, 'utf-8');
console.log(`Successfully added ${missing.length} new tools to the file.`);
console.log(`File size: ${fs.statSync(filePath).size} bytes`);
