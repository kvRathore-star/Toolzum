import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Toolzum account.",
  alternates: { canonical: "https://toolzum.com/sign-in/" },
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
