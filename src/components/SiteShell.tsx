"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const HIDDEN_CHROME_PATHS = ["/admin"];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = HIDDEN_CHROME_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
