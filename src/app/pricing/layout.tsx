import type { Metadata } from "next";
import { toolsRegistry } from "@/registry/tools";

const toolCount = toolsRegistry.length;

export const metadata: Metadata = {
  title: "Pricing",
  description: `ToolHub Pro — ₹249/month (or $14.99/mo) for unlimited access to ${toolCount}+ browser-based PDF, image, video, and AI tools. Free plan available. No card needed to start.`,
  openGraph: {
    title: "ToolHub Pricing — Simple & Transparent",
    description: `ToolHub Pro — ₹249/month (or $14.99/mo) for unlimited access to ${toolCount}+ browser-based PDF, image, video, and AI tools. Free plan available. No card needed to start.`,
  }
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
