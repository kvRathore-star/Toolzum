import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Toolzum account to access premium features and manage your subscription.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
