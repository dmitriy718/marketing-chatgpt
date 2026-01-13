import { Metadata } from "next";
import { MarketingReadinessPageClient } from "./client";
import { buildPageMetadata, buildLocalBusinessSchema, getDefaultSeoSettings } from "@/lib/seo";
import { getSiteSettings } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Free Marketing Readiness Assessment | Discover Your Marketing Maturity",
    description: "Take our free 10-question marketing readiness assessment. Get your marketing maturity score (0-100) and personalized recommendations to accelerate your business growth.",
    path: "/marketing-readiness",
    keywords: ["marketing assessment", "marketing readiness", "marketing maturity", "marketing evaluation", "growth assessment", "marketing audit", "business growth"],
  });
}

export default function MarketingReadinessPage() {
  const settings = getSiteSettings();
  const seo = getDefaultSeoSettings(settings);
  const localBusinessSchema = buildLocalBusinessSchema(seo);
  
  return (
    <>
      <MarketingReadinessPageClient />
      <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
    </>
  );
}
