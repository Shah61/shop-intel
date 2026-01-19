import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/src/core/theme/theme-provider";
import TanstackQueryClientProvider from "@/src/core/lib/query-client-provider";
import { DummySessionProvider } from "@/src/core/lib/dummy-session-provider";
import toast, { Toaster } from 'react-hot-toast';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shop-Intel Admin",
  description: "Shop-Intel Admin Dashboard",
  openGraph: {
    title: "Shop-Intel Admin",
    description: "Shop-Intel Admin Dashboard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop-Intel Admin",
    description: "Shop-Intel Admin Dashboard",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" }
  ],
  icons: {
    icon: "/Icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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

//test