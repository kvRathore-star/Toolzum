import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  alternates: { canonical: "https://toolzum.com/contact" },  description:
    "Get in touch with the Toolzum team for support, feedback, bug reports, or enterprise inquiries.",
  openGraph: {
    title: "Contact Us | Toolzum",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
