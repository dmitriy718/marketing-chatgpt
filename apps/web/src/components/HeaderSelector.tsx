"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteHeaderDev } from "./SiteHeaderDev";

/**
 * Selects the appropriate header based on the current domain
 * - development.carolinagrowth.co → SiteHeaderDev (experimental nav)
 * - carolinagrowth.co → SiteHeader (production nav)
 * 
 * IMPORTANT: This component ensures dev and production navs are never confused.
 * Dev nav is ONLY shown on development.carolinagrowth.co domain.
 */
export function HeaderSelector() {
  const [isDev, setIsDev] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check the actual hostname at runtime
    const hostname = window.location.hostname;
    setIsDev(hostname === "development.carolinagrowth.co");
  }, []);

  // During SSR or before mount, default to production header
  if (!mounted) {
    return <SiteHeader />;
  }

  return isDev ? <SiteHeaderDev /> : <SiteHeader />;
}
