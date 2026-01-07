import type { BlogPost, Service, SiteSettings } from "@/lib/content";

type SeoSettings = {
  siteName: string;
  siteTagline: string;
  defaultDescription: string;
  baseUrl: string;
};

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
}

export function getSeoSettings(params: {
  siteName: string;
  siteTagline: string;
  defaultDescription: string;
}) {
  return {
    ...params,
    baseUrl: getBaseUrl(),
  };
}

export function getDefaultSeoSettings(settings: Partial<SiteSettings>) {
  return getSeoSettings({
    siteName: settings.siteName ?? "Carolina Growth",
    siteTagline: settings.tagline ?? "Local growth studio",
    defaultDescription:
      settings.defaultDescription ??
      "Carolina Growth delivers lead generation, SEO, and performance marketing built for local businesses ready to scale.",
  });
}

export function buildPageMetadata(params: {
  title: string;
  description: string;
  path: string;
}) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${params.path}`;
  return {
    title: params.title,
    description: params.description,
    alternates: { canonical: url },
    openGraph: {
      title: params.title,
      description: params.description,
      url,
    },
    twitter: {
      title: params.title,
      description: params.description,
    },
  };
}

export function buildOrganizationSchema(settings: SeoSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    url: settings.baseUrl,
    description: settings.defaultDescription,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      url: `${settings.baseUrl}/contact`,
    },
  };
}

export function buildWebSiteSchema(settings: SeoSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteName,
    url: settings.baseUrl,
    description: settings.siteTagline,
  };
}

export function buildServiceSchema(service: Service, settings: SeoSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description ?? service.summary ?? settings.defaultDescription,
    provider: {
      "@type": "Organization",
      name: settings.siteName,
      url: settings.baseUrl,
    },
    areaServed: "United States",
    url: `${settings.baseUrl}/services/${service.slug}`,
  };
}

export function buildServiceListSchema(services: Service[], settings: SeoSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: service.title,
      url: `${settings.baseUrl}/services/${service.slug}`,
    })),
  };
}

export function buildArticleSchema(post: BlogPost, settings: SeoSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? settings.defaultDescription,
    author: {
      "@type": "Organization",
      name: post.author ?? settings.siteName,
    },
    datePublished: post.publishedAt ?? undefined,
    mainEntityOfPage: `${settings.baseUrl}/blog/${post.slug}`,
    publisher: {
      "@type": "Organization",
      name: settings.siteName,
    },
  };
}
