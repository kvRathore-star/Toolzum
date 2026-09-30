import type { Metadata } from "next";
import { toolsRegistry } from "@/registry/tools";

const toolCount = toolsRegistry.length;

export const metadata: Metadata = {
  title: "Premium Tools",
  alternates: { canonical: "https://toolzum.com/premium-tools" },
  description: `Browse the ${toolCount}+ Toolzum tools — every tool is free to try in your browser, and Pro unlocks unlimited downloads, batch processing, and priority features. No card needed to start.`,
  openGraph: {
    title: "Toolzum Premium Tools",
    description: `Browse the ${toolCount}+ Toolzum tools — every tool is free to try in your browser, and Pro unlocks unlimited downloads, batch processing, and priority features. No card needed to start.`,
  },
};

export default function PremiumToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
