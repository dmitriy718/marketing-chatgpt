"use client";

import { useState } from "react";
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
  const [isDev] = useState(
    () =>
      typeof window !== "undefined" &&
      window.location.hostname === "development.carolinagrowth.co"
  );

  return isDev ? <SiteHeaderDev /> : <SiteHeader />;
}
