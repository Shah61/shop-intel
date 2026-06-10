import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/src/core/theme/theme-provider";
import TanstackQueryClientProvider from "@/src/core/lib/query-client-provider";
import { DummySessionProvider } from "@/src/core/lib/dummy-session-provider";
import { VideoGenerationProvider } from "@/src/features/marketing/presentation/view/context/video-generation-context";
import { Toaster } from 'react-hot-toast';
import { siteConfig } from "@/lib/seo/site";
import { JsonLd, organizationJsonLd, webSiteJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.legalName, url: siteConfig.url }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  applicationName: siteConfig.name,
  category: "technology",
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.shortDescription,
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.shortDescription,
    creator: siteConfig.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/Icon.png",
    apple: "/Icon.png",
  },
  formatDetection: {
    telephone: false,
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
        <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
        <DummySessionProvider>
          <ThemeProvider>
            <TanstackQueryClientProvider>
              <VideoGenerationProvider>
                {children}
              </VideoGenerationProvider>
            </TanstackQueryClientProvider>
            <Toaster />
          </ThemeProvider>
        </DummySessionProvider>
      </body>
    </html>
  );
}