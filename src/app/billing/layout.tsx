import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing & Subscriptions",
  alternates: { canonical: "https://toolzum.com/billing" },  description:
    "Manage your Toolzum billing, payment methods, invoices, and subscription plan.",
  openGraph: {
    title: "Billing & Subscriptions | Toolzum",
  },
};

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
