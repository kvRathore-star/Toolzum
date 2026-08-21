import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  alternates: { canonical: "https://toolzum.com/about/" },
  description:
    "About Toolzum — privacy-first web tools powered by WebAssembly. Most run in your browser, nothing uploaded for local tools.",
  openGraph: {
    title: "About Us | Toolzum",
    description:
      "About Toolzum — privacy-first web tools powered by WebAssembly. Most run in your browser, nothing uploaded for local tools.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
