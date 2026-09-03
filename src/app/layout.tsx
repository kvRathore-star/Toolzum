import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";
import { GdprConsentBanner } from "@/components/GdprConsentBanner";
import { PostHogProvider } from "@/components/PostHogProvider";
import { ErrorLogger } from "@/components/ErrorLogger";
import { SiteShell } from "@/components/SiteShell";
import { TOOL_COUNT } from "@/registry/site-data.generated";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const toolCount = TOOL_COUNT;



export const metadata: Metadata = {
  metadataBase: new URL('https://toolzum.com'),
  alternates: { canonical: "https://toolzum.com/" },
  title: {
    default: "Toolzum – Privacy-First Web Tools",
    template: "%s | Toolzum",
  },
  description:
    `${toolCount}+ privacy-first tools — PDF, images, video, AI, and more — all in one place. Zero servers. Zero uploads. Zero storage. Instant utility.`,
  robots: "index, follow",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-384x384.png', sizes: '384x384', type: 'image/png' },
    ],
    apple: { url: '/icon-180x180.png' },
  },
  openGraph: {
    type: "website",
    siteName: "Toolzum",
    title: "Toolzum – Privacy-First Web Tools",
    description:
      `${toolCount}+ privacy-first tools — PDF, images, video, AI, and more — all in one place. Zero servers. Zero uploads. Zero storage. Instant utility.`,
    images: [{ url: "/og/branding/index.webp", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/branding/index.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col transition-colors duration-300">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Toolzum",
                "url": "https://toolzum.com",
                "logo": "https://toolzum.com/og/branding/index.webp",
                "description": `${toolCount}+ free, privacy-first web tools that run entirely in your browser.`,
                "sameAs": [],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Toolzum",
                "url": "https://toolzum.com",
                "description": `${toolCount}+ free, privacy-first web tools. Most processed in your browser — nothing uploaded for local tools.`,
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://toolzum.com/tools?search={search_term_string}"
                  },
                  "query-input": "required name=search_term_string"
                }
              }
            ])
          }}
        />
        {process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN && (
          <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token: process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN })} />
        )}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-180x180.png" />
        <link rel="alternate" hrefLang="en" href="https://toolzum.com" />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[var(--accent-ink)] focus:text-white focus:rounded-xl focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
          <SiteShell>
            <PostHogProvider>
              <ErrorLogger>
                <main id="main-content" className="flex-1">
                  {children}
                </main>
              </ErrorLogger>
            </PostHogProvider>
          </SiteShell>

          <Toaster 
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#18181b', // zinc-900
                color: '#fff',
                border: '1px solid #27272a',
                borderRadius: '12px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          <GdprConsentBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}