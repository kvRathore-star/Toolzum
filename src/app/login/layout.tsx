import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Toolzum account to access premium features and manage your subscription.",
  alternates: { canonical: "https://toolzum.com/login/" },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
