import type { Metadata } from "next";
import { toolsRegistry } from "@/registry/tools";

const toolCount = toolsRegistry.length;

export const metadata: Metadata = {
  title: "Pricing",
  alternates: { canonical: "https://toolzum.com/pricing" },  description: `Toolzum Pro — ₹299/month (or $9.99/mo) for unlimited access to ${toolCount}+ browser-based PDF, image, video, and AI tools. Free plan available. No card needed to start.`,
  openGraph: {
    title: "Toolzum Pricing — Simple & Transparent",
    description: `Toolzum Pro — ₹299/month (or $9.99/mo) for unlimited access to ${toolCount}+ browser-based PDF, image, video, and AI tools. Free plan available. No card needed to start.`,
  }
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
