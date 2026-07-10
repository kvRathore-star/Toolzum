import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  alternates: { canonical: "https://toolzum.com/careers" },  description:
    "Join Toolzum's fully remote team building privacy-first, offline-first web tools. Open source advocates and WebAssembly engineers.",
  openGraph: {
    title: "Careers | Toolzum",
  },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
