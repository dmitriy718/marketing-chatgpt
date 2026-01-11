"use client";

import { SiteHeader } from "./SiteHeader";
import { SiteHeaderDev } from "./SiteHeaderDev";

/**
 * Selects the appropriate header based on the current domain
 * - development.carolinagrowth.co → SiteHeaderDev (experimental nav)
 * - carolinagrowth.co → SiteHeader (production nav)
 */
export function HeaderSelector() {
  // Check at runtime for the domain
  if (typeof window !== "undefined") {
    const isDev = window.location.hostname === "development.carolinagrowth.co";
    return isDev ? <SiteHeaderDev /> : <SiteHeader />;
  }
  
  // Server-side: check environment variable
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const isDev = siteUrl.includes("development.carolinagrowth.co");
  return isDev ? <SiteHeaderDev /> : <SiteHeader />;
}
