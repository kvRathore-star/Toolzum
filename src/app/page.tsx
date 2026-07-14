import { HomeClient } from "@/components/HomeClient";
import { toolsRegistry } from "@/registry/tools";
import type { Metadata } from "next";

const toolCount = toolsRegistry.length;

export const metadata: Metadata = {
  title: `Toolzum — ${toolCount}+ Free Online Tools, All in Your Browser`,
  description:
    `${toolCount}+ privacy-first online tools — PDF, images, video, AI, and more — all in one place. Zero servers. Zero uploads. Zero storage. Instant utility.`,
  openGraph: {
    title: `Toolzum — ${toolCount}+ Free Online Tools, All in Your Browser`,
    description:
      `${toolCount}+ privacy-first online tools — PDF, images, video, AI, and more — all in one place. Zero servers. Zero uploads. Zero storage. Instant utility.`,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function HomePage() {
  return <HomeClient />;
}