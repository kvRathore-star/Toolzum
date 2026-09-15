"use client";

import dynamic from "next/dynamic";

const PostHogProvider = dynamic(
  () => import("@/components/PostHogProvider").then((m) => m.PostHogProvider),
  { ssr: false }
);

const Toaster = dynamic(
  () => import("react-hot-toast").then((m) => m.Toaster),
  { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#18181b",
            color: "#fff",
            border: "1px solid #27272a",
            borderRadius: "12px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </PostHogProvider>
  );
}
