import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feature Roadmap",
  description:
    "Explore planned tools, vote for upcoming features, and track what's being built on the Toolzum roadmap.",
  openGraph: {
    title: "Feature Roadmap | Toolzum",
  },
};

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
