import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a free Toolzum account to access premium features and save your preferences.",
  alternates: { canonical: "https://toolzum.com/sign-up/" },
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
