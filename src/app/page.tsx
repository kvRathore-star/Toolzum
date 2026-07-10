import { HomeClient } from "@/components/HomeClient";
import { toolsRegistry } from "@/registry/tools";
import type { Metadata } from "next";

const toolCount = toolsRegistry.length;

export const metadata: Metadata = {
  title: `Toolzum — ${toolCount}+ Free Online Tools, All in Your Browser`,
  description:
    `${toolCount}+ privacy-first online tools for PDF, image, video, audio, AI, and more. All processing runs in your browser — nothing uploaded, ever. Free to use.`,
  openGraph: {
    title: `Toolzum — ${toolCount}+ Free Browser-Based Tools`,
    description:
      `Compress PDFs, edit images, convert video, generate AI content, and more — all 100% client-side. No uploads. No accounts required.`,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function HomePage() {
  return <HomeClient />;
}