"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { OnboardingTour } from "@/components/OnboardingTour";
import { OfflineIndicator } from "@/components/OfflineIndicator";

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
      <ServiceWorkerRegister />
      <OnboardingTour />
      {/* #45: single global instance (was tool-pages-only in ToolLayout) */}
      <OfflineIndicator />
      <Header />
      {children}
      <Footer />
    </>
  );
}
