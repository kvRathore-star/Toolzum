import { HomeClient } from "@/components/HomeClient";
import { getCachedToolCounts, getHomeClientData } from "@/registry/tools-helpers";
import type { Metadata } from "next";

const { totalImplemented } = getCachedToolCounts();
const { popularTools, categoryCounts } = getHomeClientData();

export const metadata: Metadata = {
  title: `Toolzum — ${totalImplemented}+ Privacy-First Browser Tools`,
  description:
    `${totalImplemented}+ privacy-first tools — PDF, images, video, AI, and more — all in one place. Zero servers. Zero uploads. Zero storage. Instant utility.`,
  openGraph: {
    title: `Toolzum — ${totalImplemented}+ Privacy-First Browser Tools`,
    description:
      `${totalImplemented}+ privacy-first tools — PDF, images, video, AI, and more — all in one place. Most run fully in your browser with nothing uploaded; cloud AI tools are clearly marked.`,
    images: [{ url: "/og/branding/index.webp", width: 1200, height: 630 }],
  },
};

export default function HomePage() {
  return <HomeClient popularTools={popularTools} categoryCounts={categoryCounts} />;
}