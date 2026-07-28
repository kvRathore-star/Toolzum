import { getCachedToolCounts } from "@/registry/tools-helpers";
import type { Metadata } from "next";

const { totalImplemented } = getCachedToolCounts();

export const metadata: Metadata = {
  title: "Product — Offline Utility Command Center",
  alternates: { canonical: "https://toolzum.com/product" },
  description: `Explore Toolzum's catalog of ${totalImplemented}+ client-side tools — PDF, image, developer, and math utilities, all in your browser.`,
  openGraph: {
    title: "Product | Toolzum",
  },
};

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
