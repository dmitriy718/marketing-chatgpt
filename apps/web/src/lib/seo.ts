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
  keywords?: string[];
  image?: string;
  type?: "website" | "article" | "product";
  publishedTime?: string;
  modifiedTime?: string;
}) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${params.path}`;
  const ogImage = params.image || `${baseUrl}/logo.svg`;
  
  return {
    title: params.title,
    description: params.description,
    keywords: params.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: params.title,
      description: params.description,
      url,
      type: params.type || "website",
      images: [{ url: ogImage, alt: params.title }],
      ...(params.publishedTime && { publishedTime: params.publishedTime }),
      ...(params.modifiedTime && { modifiedTime: params.modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: params.title,
      description: params.description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large" as const,
        "max-snippet": -1,
      },
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
      url: settings.baseUrl,
    },
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.publishedAt ?? undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${settings.baseUrl}/blog/${post.slug}`,
    },
    publisher: {
      "@type": "Organization",
      name: settings.siteName,
      url: settings.baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${settings.baseUrl}/logo.svg`,
      },
    },
    image: post.image ? `${settings.baseUrl}${post.image}` : undefined,
  };
}

export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildLocalBusinessSchema(settings: SeoSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${settings.baseUrl}#organization`,
    name: settings.siteName,
    description: settings.defaultDescription,
    url: settings.baseUrl,
    telephone: undefined, // Add if available
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    priceRange: "$$",
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: undefined, // Add if available
        longitude: undefined, // Add if available
      },
    },
  };
}
