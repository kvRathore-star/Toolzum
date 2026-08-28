import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
  description:
    "Manage your Toolzum account — view your profile, plan, credits, and favorite tools.",
  robots: { index: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
