import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your Toolzum workspace — manage your account, view usage stats, and access your tools.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
