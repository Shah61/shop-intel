import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/src/core/theme/theme-provider";
import TanstackQueryClientProvider from "@/src/core/lib/query-client-provider";
import { DummySessionProvider } from "@/src/core/lib/dummy-session-provider";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    default: "Pulse | AI-Powered E-Commerce Intelligence",
    template: "%s | Pulse",
  },
  description: "Pulse unifies your sales channels, marketing, inventory, and AI intelligence into one command center. Built for e-commerce operators who outgrow spreadsheets.",
  keywords: ["pulsetech", "pulse", "pulse tech", "ecommerce analytics", "AI commerce", "shopee analytics", "tiktok shop analytics", "inventory management", "marketing intelligence", "ecommerce dashboard"],
  authors: [{ name: "Haris AI Solutions" }],
  creator: "Haris AI Solutions",
  openGraph: {
    title: "Pulse | AI-Powered E-Commerce Intelligence",
    description: "One workspace for revenue, campaigns, inventory, and AI that turns noise into next actions.",
    type: "website",
    siteName: "Pulse",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulse | AI-Powered E-Commerce Intelligence",
    description: "One workspace for revenue, campaigns, inventory, and AI that turns noise into next actions.",
  },
  robots: "index, follow",
  icons: {
    icon: "/Icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0815" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <DummySessionProvider>
          <ThemeProvider>
            <TanstackQueryClientProvider>
              {children}
            </TanstackQueryClientProvider>
            <Toaster />
          </ThemeProvider>
        </DummySessionProvider>
      </body>
    </html>
  );
}