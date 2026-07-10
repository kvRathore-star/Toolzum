import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chrome Extension",
  description:
    "Download the Toolzum Chrome extension for instant access to color pickers, QR codes, screenshots, and more browser utilities.",
  openGraph: {
    title: "Chrome Extension | Toolzum",
  },
};

export default function ExtensionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
