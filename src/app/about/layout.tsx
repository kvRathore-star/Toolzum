import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  alternates: { canonical: "https://toolzum.com/about" },  description:
    "About Toolzum — privacy-first web tools powered by WebAssembly. Everything runs in your browser, nothing uploaded ever.",
  openGraph: {
    title: "About Us | Toolzum",
    description:
      "Privacy-first web tools, all processed in your browser. Nothing uploaded, ever.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
