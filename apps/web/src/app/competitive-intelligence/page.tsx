import { Metadata } from "next";
import { CompetitiveIntelligencePageClient } from "./client";
import { buildPageMetadata, buildLocalBusinessSchema, getDefaultSeoSettings } from "@/lib/seo";
import { getSiteSettings } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSiteSettings();
  const seo = getDefaultSeoSettings(settings);
  
  return buildPageMetadata({
    title: "Free Competitive Intelligence Report | Analyze Any Competitor Website",
    description: "Generate a comprehensive competitive intelligence report for any website. Get SWOT analysis, market positioning insights, content strategy analysis, and actionable recommendations to outperform competitors.",
    path: "/competitive-intelligence",
    keywords: ["competitive intelligence", "competitor analysis", "market intelligence", "SWOT analysis", "competitor research", "competitive analysis", "market research"],
  });
}

export default function CompetitiveIntelligencePage() {
  const settings = getSiteSettings();
  const seo = getDefaultSeoSettings(settings);
  const localBusinessSchema = buildLocalBusinessSchema(seo);
  
  return (
    <>
      <CompetitiveIntelligencePageClient />
      <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
    </>
  );
}
