import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your Toolzum account password. Enter your email to receive a reset link.",
  alternates: { canonical: "https://toolzum.com/forgot-password/" },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
