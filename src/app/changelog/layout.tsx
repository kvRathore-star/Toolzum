import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog & Updates",
  alternates: { canonical: "https://toolzum.com/changelog" },  description:
    "Follow the evolution of Toolzum — new tools, performance improvements, and security updates shipped every week.",
  openGraph: {
    title: "Changelog & Updates | Toolzum",
  },
};

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
