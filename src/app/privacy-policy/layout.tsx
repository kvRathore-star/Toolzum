import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "https://toolzum.com/privacy-policy" },
  description:
    "Toolzum's privacy policy — all processing is client-side, no files uploaded, zero data collection. Your data stays yours.",
  openGraph: {
    title: "Privacy Policy | Toolzum",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
