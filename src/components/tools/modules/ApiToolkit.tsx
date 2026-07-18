"use client";
import Link from "next/link";
import {
  Globe, Webhook, FileJson, Book, Key,
  Terminal, Code, TestTube, Route, Hash,
  Shield, DollarSign, Gauge, List, Timer,
  AlertCircle, BarChart3, FileText, Server,
  GitCompare, Download, ClipboardList
} from "lucide-react";

const sectionBtn = "inline-flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-default";

interface HubCard {
  name: string;
  slug: string;
  desc: string;
  icon: React.ElementType;
}

function ToolCard({ name, slug, desc, icon: Icon }: HubCard) {
  return (
    <Link
      href={`/developer/${slug}`}
      className="group flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md"
    >
      <span className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{name}</div>
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{desc}</div>
      </div>
    </Link>
  );
}

export default function ApiToolkit() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Intro */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">API Toolkit</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
          A collection of API development tools — test endpoints, generate and hash API keys, estimate costs,
          design rate limits, validate schemas, build webhooks, and generate documentation. Everything runs
          locally in your browser with nothing uploaded to any server.
        </p>
      </div>

      {/* API Tester Tools */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Globe className="w-3.5 h-3.5" /> API Tester Tools</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="API Tester" slug="api-tester" desc="Send GET, POST, PUT, DELETE requests and inspect response status, headers, and body." icon={Terminal} />
          <ToolCard name="API Request Builder" slug="api-request-builder" desc="Build curl commands from method, URL, headers, and body parameters." icon={Code} />
          <ToolCard name="API Response Formatter" slug="api-response-formatter" desc="Beautify JSON and XML API responses with proper indentation and syntax highlighting." icon={FileJson} />
          <ToolCard name="SOAP API Tester" slug="soap-api-tester" desc="Send and debug SOAP envelope requests against XML-based web services." icon={TestTube} />
          <ToolCard name="gRPC Status Code Lookup" slug="grpc-status-code-lookup" desc="Look up gRPC status codes, their descriptions, and common causes." icon={AlertCircle} />
        </div>
      </div>

      {/* API Utility Tools */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Key className="w-3.5 h-3.5" /> API Utility Tools</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="API Key Generator" slug="api-key-generator" desc="Generate secure API keys with configurable length, prefix, and character set." icon={Key} />
          <ToolCard name="API Key Hasher" slug="api-key-hasher" desc="Hash API keys using SHA-256 for secure storage — never store raw keys." icon={Hash} />
          <ToolCard name="API Key Validator" slug="api-key-validator" desc="Validate key format, length, character set, and prefix against your standards." icon={Shield} />
          <ToolCard name="API Cost Estimator" slug="api-cost-estimator" desc="Project API costs based on monthly call volume, price per million, and user count." icon={DollarSign} />
          <ToolCard name="API Latency Budget" slug="api-latency-budget" desc="Calculate latency budgets from SLA requirements across application and service layers." icon={Gauge} />
          <ToolCard name="API Pagination Calculator" slug="api-pagination-calculator" desc="Compute page counts, offset ranges, and navigation parameters for any API." icon={List} />
          <ToolCard name="API Rate Limiter Calculator" slug="api-rate-limiter-calculator" desc="Design rate limit windows, burst allowances, and retry intervals for your endpoints." icon={Timer} />
          <ToolCard name="API Error Decoder" slug="api-error-decoder" desc="Look up HTTP status codes and API error types with descriptions and common causes." icon={AlertCircle} />
          <ToolCard name="API Gateway Rate Calculator" slug="api-gateway-rate-calculator" desc="Calculate gateway rate limits, burst capacities, and throttling thresholds." icon={Gauge} />
          <ToolCard name="API Payload Analyzer" slug="api-payload-analyzer" desc="Analyze JSON payload size, structure, nesting depth, and top-level key count." icon={BarChart3} />
          <ToolCard name="API Changelog Generator" slug="api-changelog-generator" desc="Generate structured changelogs from version diffs with categorized changes." icon={FileText} />
          <ToolCard name="API Documentation Generator" slug="api-documentation-generator" desc="Generate API docs from endpoint descriptions with parameters and response examples." icon={FileText} />
          <ToolCard name="REST Endpoint Documenter" slug="rest-endpoint-documenter" desc="Document REST endpoints with method, path, description, and sample request bodies." icon={Route} />
          <ToolCard name="API Mock Server Config" slug="api-mock-server-config" desc="Generate JSON Server configuration files from endpoint definitions." icon={Server} />
          <ToolCard name="API Mock Data Generator" slug="api-mock-data-generator" desc="Generate realistic mock JSON data from schema descriptions for rapid prototyping." icon={Download} />
        </div>
      </div>

      {/* GraphQL Tools */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><FileJson className="w-3.5 h-3.5" /> GraphQL Tools</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="GraphQL Tester" slug="graphql-tester" desc="Execute GraphQL queries against live endpoints and inspect responses." icon={Terminal} />
          <ToolCard name="GraphQL Query Formatter" slug="graphql-query-formatter" desc="Prettify and format GraphQL queries with proper indentation and spacing." icon={Code} />
          <ToolCard name="GraphQL Variables Formatter" slug="graphql-variables-formatter" desc="Format and validate GraphQL variables JSON with syntax error detection." icon={FileJson} />
          <ToolCard name="GraphQL Schema Validator" slug="graphql-schema-validator" desc="Validate GraphQL SDL schema syntax and detect structural issues." icon={Shield} />
          <ToolCard name="GraphQL Cost Estimator" slug="graphql-cost-estimator" desc="Estimate query complexity from field count and nesting depth." icon={DollarSign} />
          <ToolCard name="GraphQL Subscription Builder" slug="graphql-subscription-builder" desc="Build WebSocket subscription payloads with event names and fields." icon={Webhook} />
          <ToolCard name="GraphQL Schema to JSON Schema" slug="graphql-schema-to-json-schema" desc="Convert GraphQL SDL type definitions to equivalent JSON Schema format." icon={GitCompare} />
        </div>
      </div>

      {/* OpenAPI & Spec Tools */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Book className="w-3.5 h-3.5" /> OpenAPI & Spec Tools</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="OpenAPI Validator" slug="openapi-validator" desc="Validate OpenAPI 3.0 and Swagger spec syntax for required fields and structure." icon={Shield} />
          <ToolCard name="OpenAPI Mock Generator" slug="openapi-mock-generator" desc="Generate mock JSON responses from OpenAPI schema definitions." icon={Download} />
          <ToolCard name="OpenAPI to Postman" slug="openapi-to-postman" desc="Convert OpenAPI specs to Postman collection JSON for API testing." icon={GitCompare} />
          <ToolCard name="Postman to OpenAPI" slug="postman-to-openapi-converter" desc="Convert Postman collections to OpenAPI 3.0 spec format." icon={GitCompare} />
          <ToolCard name="Swagger/OpenAPI Generator" slug="swagger-openapi-generator" desc="Generate complete OpenAPI 3.0 specs from title, version, and endpoint descriptions." icon={Book} />
          <ToolCard name="API Diff Checker" slug="api-diff-checker" desc="Compare two OpenAPI specs to detect new, removed, and modified endpoints." icon={GitCompare} />
          <ToolCard name="API Docs Generator" slug="api-docs-generator" desc="Generate Markdown API documentation from OpenAPI spec JSON." icon={ClipboardList} />
        </div>
      </div>

      {/* Webhook Tools */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Webhook className="w-3.5 h-3.5" /> Webhook Tools</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="Webhook Tester" slug="webhook-tester" desc="Send simulated POST requests with custom JSON payloads to webhook endpoints." icon={Globe} />
          <ToolCard name="Webhook Signature Verifier" slug="webhook-signature-verifier" desc="Verify HMAC-SHA256 signatures to validate webhook authenticity." icon={Shield} />
          <ToolCard name="Webhook Retry Config" slug="webhook-retry-config" desc="Configure retry strategies with exponential backoff and jitter calculations." icon={Timer} />
          <ToolCard name="Webhook Validator" slug="webhook-validator" desc="Validate webhook payload structure including required fields and format." icon={Shield} />
          <ToolCard name="Webhook Payload Generator" slug="webhook-payload-generator" desc="Generate realistic webhook payload examples with customizable event names and fields." icon={Download} />
        </div>
      </div>

      {/* Workflow CTA */}
      <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800/40">
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-blue-600 text-white">
            <Route className="w-4 h-4" />
          </span>
          <div>
            <div className="text-sm font-bold text-zinc-900 dark:text-white">API Workflow Chains</div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Chain tools together — generate a key, hash it, validate it, then estimate its cost — with output feeding into the next step. Available on the Pro plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
