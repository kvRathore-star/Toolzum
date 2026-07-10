import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Toolzum's terms of service — guidelines for using our offline-first, client-side browser utility platform.",
  openGraph: {
    title: "Terms of Service | Toolzum",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
