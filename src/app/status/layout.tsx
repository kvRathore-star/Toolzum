import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Status",
  alternates: { canonical: "https://toolzum.com/status" },  description:
    "Check the current operational status of Toolzum's services — CDN, authentication, sandbox core, and cloud relay.",
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
