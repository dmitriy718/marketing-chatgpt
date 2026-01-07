import type { MetadataRoute } from "next";

import { getBlogPosts, getLandingPages, getServices } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://carolinagrowth.co";

  const staticRoutes = [
    "",
    "/services",
    "/portfolio",
    "/about",
    "/team",
    "/contact",
    "/growth-audit",
    "/roi-calculator",
    "/growth-sprint",
    "/conversion-teardown",
    "/lead-routing",
    "/revenue-forecast",
    "/paid-media-audit",
    "/local-seo",
    "/email-nurture",
    "/retention-referral",
    "/web-design",
    "/proposal-wizard",
    "/utm-builder",
    "/landing-templates",
    "/pricing",
    "/blog",
    "/privacy",
    "/terms",
    "/cookies",
    "/accessibility",
  ];

  const staticEntries = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  const serviceEntries = getServices().map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: new Date(),
  }));

  const landingEntries = getLandingPages().map((page) => ({
    url: `${baseUrl}/landing/${page.slug}`,
    lastModified: new Date(),
  }));

  const blogEntries = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...serviceEntries, ...landingEntries, ...blogEntries];
}
