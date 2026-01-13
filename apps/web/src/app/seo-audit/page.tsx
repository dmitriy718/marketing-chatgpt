import { Metadata } from "next";
import { SeoAuditPageClient } from "./client";
import { buildPageMetadata, buildLocalBusinessSchema, getDefaultSeoSettings } from "@/lib/seo";
import { getSiteSettings } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Free SEO Website Auditor | Analyze Any Website's SEO Score",
    description: "Get an instant SEO score (0-100) for any website with actionable recommendations. Free SEO analysis tool that checks title tags, meta descriptions, headings, images, links, and structured data.",
    path: "/seo-audit",
    keywords: ["SEO audit", "SEO analyzer", "website SEO checker", "free SEO tool", "SEO score", "SEO analysis", "website audit", "SEO checker"],
  });
}

export default function SeoAuditPage() {
  const settings = getSiteSettings();
  const seo = getDefaultSeoSettings(settings);
  const localBusinessSchema = buildLocalBusinessSchema(seo);
  
  return (
    <>
      <SeoAuditPageClient />
      <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
    </>
  );
}
