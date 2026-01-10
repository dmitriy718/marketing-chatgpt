import type { MetadataRoute } from "next";

import { getBlogPosts, getLandingPages, getPortfolioItems, getServices } from "@/lib/content";

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
    "/pricing-builder",
    "/best-fit-quiz",
    "/blog",
    "/seo-audit",
    "/competitor-comparison",
    "/marketing-readiness",
    "/competitive-intelligence",
    "/lead-potential",
    "/content-generator",
    "/free-consultation",
    "/portal",
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

  const portfolioEntries = getPortfolioItems()
    .filter((item) => item.slug && item.caseStudy !== false)
    .map((item) => ({
      url: `${baseUrl}/portfolio/${item.slug}`,
      lastModified: new Date(),
    }));

  return [
    ...staticEntries,
    ...serviceEntries,
    ...landingEntries,
    ...blogEntries,
    ...portfolioEntries,
  ];
}
