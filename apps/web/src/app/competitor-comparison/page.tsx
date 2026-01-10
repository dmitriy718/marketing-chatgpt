import { Metadata } from "next";
import { CompetitorComparisonPageClient } from "./client";
import { buildPageMetadata, buildLocalBusinessSchema, getDefaultSeoSettings } from "@/lib/seo";
import { getSiteSettings } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSiteSettings();
  const seo = getDefaultSeoSettings(settings);
  
  return buildPageMetadata({
    title: "Free Competitor Comparison Tool | SEO Analysis vs Competitors",
    description: "Compare your website's SEO performance against competitors. Get instant insights on rankings, backlinks, content quality, and technical SEO to identify opportunities and gaps.",
    path: "/competitor-comparison",
    keywords: ["competitor analysis", "SEO comparison", "competitive intelligence", "website comparison", "SEO audit", "competitor research", "market analysis"],
  });
}

export default function CompetitorComparisonPage() {
  const settings = getSiteSettings();
  const seo = getDefaultSeoSettings(settings);
  const localBusinessSchema = buildLocalBusinessSchema(seo);
  
  return (
    <>
      <CompetitorComparisonPageClient />
      <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
    </>
  );
}
