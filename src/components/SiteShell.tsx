"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { OnboardingTour } from "@/components/OnboardingTour";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { SuccessSignupNudge } from "@/components/SuccessSignupNudge";

/**
 * Layout-level ambient background (27" verdict). Fixed, static
 * (zero motion cost), pointer-transparent, behind content. Fills the
 * peripheral void on ultra-wide screens so capped content doesn't float
 * in flat color. Excluded with the rest of the chrome on admin routes.
 */
function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background: [
          "radial-gradient(60% 40% at 12% 0%, color-mix(in srgb, var(--accent-ink) 7%, transparent), transparent 70%)",
          "radial-gradient(50% 35% at 88% 12%, color-mix(in srgb, var(--accent) 5%, transparent), transparent 70%)",
          "radial-gradient(70% 50% at 50% 100%, color-mix(in srgb, var(--accent-ink) 4%, transparent), transparent 70%)",
        ].join(","),
      }}
    />
  );
}

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
      <SuccessSignupNudge />
      <AmbientBackground />
      <Header />
      {children}
      <Footer />
    </>
  );
}
