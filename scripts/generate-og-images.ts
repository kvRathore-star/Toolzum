import { createRequire } from "module";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";
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

interface ToolInfo {
  name: string;
  slug: string;
  category: string;
  description: string;
}

const categories = [...new Set(toolsRegistry.map((t) => t.category))];

function h(type: string, props: Record<string, any> | null, ...children: any[]) {
  return React.createElement(type, props, ...children);
}

function toolOG(tool: ToolInfo) {
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
      ),
      h(
        "div",
        {
          style: {
            fontSize: 16,
            fontWeight: 500,
            padding: "8px 20px",
            borderRadius: 100,
            background: "rgba(255,255,255,0.08)",
            color: "#a1a1aa",
          },
        },
        `${toolsRegistry.length}+ free tools`
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

function categoryOG(category: string, count: number) {
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
      ),
      h(
        "div",
        {
          style: {
            fontSize: 16,
            fontWeight: 500,
            padding: "8px 20px",
            borderRadius: 100,
            background: "rgba(255,255,255,0.08)",
            color: "#a1a1aa",
          },
        },
        `${toolsRegistry.length}+ free tools`
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
      "toolzum.com \u2014 277+ free browser utilities"
    )
  );
}

async function generateImage(element: any, outPath: string) {
  const dir = outPath.substring(0, outPath.lastIndexOf("/"));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const img = new ImageResponse(element, {
    width: 1200,
    height: 630,
    fonts: [{ name: "Geist", data: geistFont, weight: 400, style: "normal" }],
  });
  const resp = await img;
  const buf = Buffer.from(await resp.arrayBuffer());
  writeFileSync(outPath, buf);
}

async function main() {
  console.log(`Generating OG images for ${toolsRegistry.length} tools and ${categories.length} categories...`);

  for (const tool of toolsRegistry) {
    const outPath = `${OUT}/${tool.category.toLowerCase()}/${tool.slug}.png`;
    await generateImage(toolOG(tool), outPath);
    if (toolsRegistry.indexOf(tool) % 25 === 0) {
      console.log(`  [${toolsRegistry.indexOf(tool) + 1}/${toolsRegistry.length}] tools done...`);
    }
  }

  for (const cat of categories) {
    const count = toolsRegistry.filter((t) => t.category === cat).length;
    const outPath = `${OUT}/${cat.toLowerCase()}/index.png`;
    await generateImage(categoryOG(cat, count), outPath);
    console.log(`  Category: ${cat} (${count} tools)`);
  }

  console.log("Done! All OG images generated.");
}

main().catch(console.error);
