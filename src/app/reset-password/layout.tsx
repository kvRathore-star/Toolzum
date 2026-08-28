import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your Toolzum account.",
  robots: { index: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
