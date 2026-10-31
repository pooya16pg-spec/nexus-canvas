import type { Metadata, Viewport } from "next";
// @ts-ignore
import "./globals.css";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#03040A" };

export const metadata: Metadata = {
  title: "NexusCanvas | Pooya Goodarzi — Spatial System Architecture Studio",
  description:
    "Interactive Distributed System Architecture, AI Workflow & Real-Time Collaborative Canvas by Pooya Goodarzi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;800&family=Vazirmatn:wght@400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Vazirmatn', sans-serif" }}>{children}</body>
    </html>
  );
}