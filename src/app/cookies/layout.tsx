import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Learn how Toolzum uses cookies and local storage for a privacy-first experience. Minimal, transparent data practices.",
  openGraph: {
    title: "Cookie Policy | Toolzum",
  },
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
