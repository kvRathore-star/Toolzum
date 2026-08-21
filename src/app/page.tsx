import { HomeClient } from "@/components/HomeClient";
import { getCachedToolCounts } from "@/registry/tools-helpers";
import type { Metadata } from "next";

const { totalImplemented } = getCachedToolCounts();

export const metadata: Metadata = {
  title: `Toolzum — ${totalImplemented}+ Privacy-First Browser Tools`,
  description:
    `${totalImplemented}+ privacy-first tools — PDF, images, video, AI, and more — all in one place. Zero servers. Zero uploads. Zero storage. Instant utility.`,
  openGraph: {
    title: `Toolzum — ${totalImplemented}+ Privacy-First Browser Tools`,
    description:
      `${totalImplemented}+ privacy-first tools — PDF, images, video, AI, and more — all in one place. Zero servers. Zero uploads. Zero storage. Instant utility.`,
    images: [{ url: "/og/branding/index.png", width: 1200, height: 630 }],
  },
};

export default function HomePage() {
  return <HomeClient />;
}