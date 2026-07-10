import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog & Updates",
  description:
    "Follow the evolution of Toolzum — new tools, performance improvements, and security updates shipped every week.",
  openGraph: {
    title: "Changelog & Updates | Toolzum",
  },
};

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
