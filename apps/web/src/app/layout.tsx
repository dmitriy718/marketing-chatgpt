import { Manrope, Sora } from "next/font/google";

import { SiteFooter } from "@/components/SiteFooter";
import { HeaderSelector } from "@/components/HeaderSelector";
import { ChatWidgetEnhanced } from "@/components/ChatWidgetEnhanced";
import { Analytics } from "@/components/Analytics";
import { PostHogProvider } from "@/components/PostHogProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeScript } from "@/components/ThemeScript";
import { UtmTracker } from "@/components/UtmTracker";
import { getSiteSettings } from "@/lib/content";

import "./globals.css";

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const siteSettings = getSiteSettings();
const siteName = siteSettings.siteName ?? "Carolina Growth";
const siteTagline =
  siteSettings.tagline ??
  "Local marketing built to convert for businesses ready to scale.";
const defaultDescription =
  siteSettings.defaultDescription ??
  "Carolina Growth delivers lead generation, SEO, and performance marketing built for local businesses ready to scale.";
const ogImage = siteSettings.ogImage;

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"),
  title: {
    default: `${siteName} | ${siteTagline}`,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  openGraph: {
    title: `${siteName} | ${siteTagline}`,
    description: defaultDescription,
    type: "website",
    images: ogImage ? [{ url: ogImage }] : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | ${siteTagline}`,
    description: defaultDescription,
    images: ogImage ? [ogImage] : undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${sora.variable} ${manrope.variable} antialiased`}>
        <PostHogProvider>
          <ThemeProvider>
            <Analytics />
            <UtmTracker />
            <div className="flex min-h-screen flex-col">
              <a href="#main-content" className="skip-link">
                Skip to content
              </a>
              <HeaderSelector />
              <main id="main-content" className="flex-1">
                {children}
              </main>
              <SiteFooter />
              <ChatWidgetEnhanced />
            </div>
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
