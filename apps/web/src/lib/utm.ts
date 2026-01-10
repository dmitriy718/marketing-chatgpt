/**
 * UTM parameter utilities for consistent link tracking
 */

export type UtmSource = 
  | "site" 
  | "email" 
  | "social" 
  | "blog" 
  | "tool" 
  | "portfolio" 
  | "referral"
  | "direct";

export type UtmMedium = 
  | "cta" 
  | "link" 
  | "button" 
  | "email" 
  | "social" 
  | "organic" 
  | "paid"
  | "referral";

export type UtmCampaign = 
  | "hero" 
  | "feature" 
  | "tool" 
  | "service" 
  | "blog" 
  | "newsletter"
  | "promotion"
  | "default";

/**
 * Build a URL with UTM parameters
 */
export function buildUtmUrl(
  baseUrl: string,
  options: {
    source: UtmSource;
    medium: UtmMedium;
    campaign?: UtmCampaign;
    content?: string;
    term?: string;
  }
): string {
  try {
    const url = new URL(baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`);
    
    url.searchParams.set("utm_source", options.source);
    url.searchParams.set("utm_medium", options.medium);
    
    if (options.campaign) {
      url.searchParams.set("utm_campaign", options.campaign);
    }
    
    if (options.content) {
      url.searchParams.set("utm_content", options.content);
    }
    
    if (options.term) {
      url.searchParams.set("utm_term", options.term);
    }
    
    return url.toString();
  } catch {
    // If URL parsing fails, return original
    return baseUrl;
  }
}

/**
 * Add UTM parameters to an existing URL
 */
export function addUtmToUrl(
  url: string,
  options: {
    source: UtmSource;
    medium: UtmMedium;
    campaign?: UtmCampaign;
    content?: string;
    term?: string;
  }
): string {
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    
    // Only add if not already present
    if (!urlObj.searchParams.has("utm_source")) {
      urlObj.searchParams.set("utm_source", options.source);
    }
    if (!urlObj.searchParams.has("utm_medium")) {
      urlObj.searchParams.set("utm_medium", options.medium);
    }
    if (options.campaign && !urlObj.searchParams.has("utm_campaign")) {
      urlObj.searchParams.set("utm_campaign", options.campaign);
    }
    if (options.content && !urlObj.searchParams.has("utm_content")) {
      urlObj.searchParams.set("utm_content", options.content);
    }
    if (options.term && !urlObj.searchParams.has("utm_term")) {
      urlObj.searchParams.set("utm_term", options.term);
    }
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Common UTM presets for different contexts
 */
export const utmPresets = {
  heroCta: (url: string) => buildUtmUrl(url, { source: "site", medium: "cta", campaign: "hero" }),
  footerLink: (url: string) => buildUtmUrl(url, { source: "site", medium: "link", campaign: "footer" }),
  navLink: (url: string) => buildUtmUrl(url, { source: "site", medium: "link", campaign: "navigation" }),
  blogLink: (url: string) => buildUtmUrl(url, { source: "blog", medium: "link", campaign: "blog" }),
  toolLink: (url: string) => buildUtmUrl(url, { source: "tool", medium: "link", campaign: "tool" }),
  serviceLink: (url: string) => buildUtmUrl(url, { source: "site", medium: "link", campaign: "service" }),
  portfolioLink: (url: string) => buildUtmUrl(url, { source: "portfolio", medium: "link", campaign: "portfolio" }),
  emailCta: (url: string) => buildUtmUrl(url, { source: "email", medium: "email", campaign: "newsletter" }),
  socialShare: (url: string, platform: string) => 
    buildUtmUrl(url, { source: "social", medium: "social", campaign: "share", content: platform }),
};
