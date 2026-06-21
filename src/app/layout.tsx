import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { PageTransition } from "@/components/PageTransition";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { toolsRegistry } from "@/registry/tools";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
});

const toolCount = toolsRegistry.length;

export const metadata: Metadata = {
  metadataBase: new URL('https://gotoolhub.com'),
  alternates: { canonical: "https://gotoolhub.com" },
  title: {
    default: "ToolHub — Privacy-First Web Tools",
    template: "%s | ToolHub",
  },
  description:
    `${toolCount}+ free, privacy-first web tools. PDF compression, image editing, text processing, and more — all processed in your browser. Nothing uploaded, ever.`,
  keywords: [
    "web tools",
    "pdf compressor",
    "image background remover",
    "text humanizer",
    "privacy first",
    "free tools",
  ],
  robots: "index, follow",
  openGraph: {
    type: "website",
    siteName: "ToolHub",
    title: "ToolHub — Privacy-First Web Tools",
    description:
      `${toolCount}+ free web tools. Everything processed in your browser.`,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col transition-colors duration-300">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[var(--accent)] focus:text-white focus:rounded-xl focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
          <Header />

          <main id="main-content" className="flex-1">
            <PageTransition>
              {children}
            </PageTransition>
          </main>

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

          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}