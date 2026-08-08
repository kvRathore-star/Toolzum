import { createRequire } from "module";
import { createHash } from "crypto";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  rmSync,
} from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { toolsRegistry } from "../src/registry/tools";

const require = createRequire(import.meta.url);
const { ImageResponse } = require(
  resolve(process.cwd(), "node_modules/next/dist/compiled/@vercel/og/index.node.js")
);
const React = require("react");

const geistPath = resolve(
  process.cwd(),
  "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf"
);
const geistFont = readFileSync(geistPath);

const OUT = resolve("public/og");

// Bump whenever toolOG/categoryOG template changes so cached hashes invalidate.
const TEMPLATE_VERSION = "og-template-v1";

const CACHE_FILE = "og-cache.json";

function sha1(input: string): string {
  return createHash("sha1").update(input).digest("hex");
}

function toolHash(tool: ToolInfo): string {
  return sha1(`${TEMPLATE_VERSION}|${tool.name}|${tool.slug}|${tool.category}|${tool.description}`);
}

function categoryHash(category: string, count: number): string {
  return sha1(`${TEMPLATE_VERSION}|cat:${category}|${count}`);
}

function loadCache(cachePath: string): Map<string, string> {
  if (!existsSync(cachePath)) return new Map();
  try {
    return new Map(Object.entries(JSON.parse(readFileSync(cachePath, "utf8"))));
  } catch {
    return new Map();
  }
}

function writeCache(cachePath: string, cache: Map<string, string>): void {
  writeFileSync(cachePath, JSON.stringify(Object.fromEntries(cache), null, 2));
}

export interface ToolInfo {
  name: string;
  slug: string;
  category: string;
  description: string;
}

const categories = [...new Set(toolsRegistry.map((t) => t.category))];

function h(type: string, props: Record<string, any> | null, ...children: any[]) {
  return React.createElement(type, props, ...children);
}

export function toolOG(tool: ToolInfo) {
  const descTrunc =
    tool.description.length > 80
      ? tool.description.slice(0, 77) + "..."
      : tool.description;

  return h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: 1200,
        height: 630,
        background: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)",
        color: "#fff",
        fontFamily: "Geist",
        padding: "60px 80px",
      },
    },
    h(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          marginBottom: "auto",
        },
      },
      h(
        "div",
        { style: { fontSize: 28, fontWeight: 600, letterSpacing: "-0.5px", color: "#a1a1aa" } },
        "toolzum"
      )
    ),
    h(
      "div",
      {
        style: {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        },
      },
      h(
        "div",
        {
          style: {
            fontSize: 64,
            fontWeight: 600,
            letterSpacing: "-1.5px",
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: 900,
          },
        },
        tool.name
      ),
      h(
        "div",
        {
          style: {
            fontSize: 18,
            fontWeight: 500,
            padding: "6px 20px",
            borderRadius: 100,
            color: "#a1a1aa",
          },
        },
        `${tool.category} \u2022 Free Online Tool`
      ),
      h(
        "div",
        {
          style: {
            fontSize: 20,
            color: "#71717a",
            fontWeight: 400,
            textAlign: "center",
            maxWidth: 650,
            lineHeight: 1.5,
          },
        },
        descTrunc
      )
    ),
    h(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "center",
          width: "100%",
          marginTop: "auto",
          gap: 24,
          fontSize: 13,
          color: "#52525b",
          fontWeight: 400,
        },
      },
      "100% browser-based",
      "\u2022",
      "No uploads",
      "\u2022",
      "Zero data leaves your device"
    )
  );
}

export function categoryOG(category: string, count: number) {
  return h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: 1200,
        height: 630,
        background: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)",
        color: "#fff",
        fontFamily: "Geist",
        padding: "60px 80px",
      },
    },
    h(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          marginBottom: "auto",
        },
      },
      h(
        "div",
        { style: { fontSize: 28, fontWeight: 600, letterSpacing: "-0.5px", color: "#a1a1aa" } },
        "toolzum"
      )
    ),
    h(
      "div",
      {
        style: {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        },
      },
      h(
        "div",
        {
          style: {
            fontSize: 72,
            fontWeight: 600,
            letterSpacing: "-1.5px",
            textAlign: "center",
            lineHeight: 1.1,
          },
        },
        category === "indian-utilities" ? "India \ud83c\uddee\ud83c\uddf3 Tools" : category === "E-commerce" ? "E-Commerce" : category
      ),
      h(
        "div",
        {
          style: {
            fontSize: 22,
            color: "#71717a",
            fontWeight: 400,
            textAlign: "center",
          },
        },
        `${count} Free Browser-Based Tools`
      ),
      h(
        "div",
        {
          style: {
            fontSize: 18,
            color: "#52525b",
            fontWeight: 400,
            textAlign: "center",
            marginTop: 8,
          },
        },
        "100% free \u2022 No install \u2022 Privacy-first"
      )
    ),
    h(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "center",
          width: "100%",
          marginTop: "auto",
          fontSize: 13,
          color: "#52525b",
          fontWeight: 400,
        },
      },
      // Manual round number, bumped a few times a year. MUST NOT reference
      // toolsRegistry.length — that would regenerate every category image on
      // any registry change (the 1140-file diff bug this script used to cause).
      "toolzum.com \u2014 1,000+ free browser utilities"
    )
  );
}

async function renderImage(element: any): Promise<Buffer> {
  const img = new ImageResponse(element, {
    width: 1200,
    height: 630,
    fonts: [{ name: "Geist", data: geistFont, weight: 400, style: "normal" }],
  });
  const resp = await img;
  return Buffer.from(await resp.arrayBuffer());
}

async function writeImage(outPath: string, buf: Buffer): Promise<void> {
  const dir = outPath.substring(0, outPath.lastIndexOf("/"));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(outPath, buf);
}

async function runPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>
): Promise<void> {
  let next = 0;
  const tasks = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      await worker(items[i], i);
    }
  });
  await Promise.all(tasks);
}

export async function generateAll(
  tools: ToolInfo[],
  categories: string[],
  outDir: string,
  concurrency = DEFAULT_CONCURRENCY,
  cachePath = `${outDir}/${CACHE_FILE}`
): Promise<void> {
  const cache = loadCache(cachePath);

  interface Job {
    element: any;
    outPath: string;
    hash: string;
  }

  const jobs: Job[] = [];
  const livePaths = new Set<string>();
  const rel = (outPath: string) => outPath.slice(outDir.length + 1);
  const addJob = (element: any, outPath: string, hash: string) => {
    livePaths.add(rel(outPath));
    if (cache.get(rel(outPath)) === hash && existsSync(outPath)) return;
    jobs.push({ element, outPath, hash });
  };

  for (const tool of tools) {
    const outPath = `${outDir}/${tool.category.toLowerCase()}/${tool.slug}.png`;
    addJob(toolOG(tool), outPath, toolHash(tool));
  }

  for (const cat of categories) {
    const count = tools.filter((t) => t.category === cat).length;
    const outPath = `${outDir}/${cat.toLowerCase()}/index.png`;
    addJob(categoryOG(cat, count), outPath, categoryHash(cat, count));
    console.log(`  Category: ${cat} (${count} tools)`);
  }

  const total = tools.length + categories.length;
  const skipped = total - jobs.length;
  const start = Date.now();
  let done = 0;

  await runPool(jobs, concurrency, async (job) => {
    const buf = await renderImage(job.element);
    await writeImage(job.outPath, buf);
    done++;
    if (done % 25 === 0) {
      console.log(`  [${done}/${jobs.length}] rendered...`);
    }
  });

  for (const job of jobs) cache.set(rel(job.outPath), job.hash);
  for (const cachedPath of cache.keys()) {
    if (!livePaths.has(cachedPath)) cache.delete(cachedPath);
  }
  writeCache(cachePath, cache);

  pruneOrphanedImages(outDir, livePaths);

  const ms = Date.now() - start;
  const perImage = ms / Math.max(jobs.length, 1);
  console.log(
    `  Rendered ${jobs.length}/${total} images in ${(ms / 1000).toFixed(1)}s (${skipped} skipped, ~${perImage.toFixed(0)}ms/render, pool=${concurrency}).`
  );
}

function pruneOrphanedImages(outDir: string, livePaths: Set<string>): void {
  let removed = 0;
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const abs = `${dir}/${entry.name}`;
      if (entry.isDirectory()) {
        walk(abs);
        if (readdirSync(abs).length === 0) rmSync(abs, { recursive: true });
      } else if (entry.isFile() && entry.name.endsWith(".png")) {
        const relPath = abs.slice(outDir.length + 1);
        if (!livePaths.has(relPath)) {
          rmSync(abs);
          removed++;
        }
      }
    }
  };
  walk(outDir);
  if (removed > 0) console.log(`  Removed ${removed} orphaned image file(s) not in the live set.`);
}

const DEFAULT_CONCURRENCY = Number(process.env.OG_CONCURRENCY) || 4;
const CACHE = resolve("og-cache.json");

async function main() {
  console.log(`Generating OG images for ${toolsRegistry.length} tools and ${categories.length} categories...`);
  const start = Date.now();
  await generateAll(toolsRegistry, categories, OUT, DEFAULT_CONCURRENCY, CACHE);
  const totalMs = Date.now() - start;
  console.log(`Done! All OG images generated in ${(totalMs / 1000).toFixed(1)}s total.`);
}

const isDirectRun =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) main().catch(console.error);
