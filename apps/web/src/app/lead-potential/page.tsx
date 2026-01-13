import { Metadata } from "next";
import { LeadPotentialPageClient } from "./client";
import { buildPageMetadata, buildLocalBusinessSchema, getDefaultSeoSettings } from "@/lib/seo";
import { getSiteSettings } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Free Lead Generation Potential Calculator | Calculate Your Growth Opportunity",
    description: "Calculate your untapped lead generation potential. Enter your traffic, conversion rate, and deal value to see how many additional leads and revenue you could generate with conversion optimization.",
    path: "/lead-potential",
    keywords: ["lead generation calculator", "conversion rate calculator", "lead potential", "revenue calculator", "growth calculator", "conversion optimization", "lead generation"],
  });
}

export default function LeadPotentialPage() {
  const settings = getSiteSettings();
  const seo = getDefaultSeoSettings(settings);
  const localBusinessSchema = buildLocalBusinessSchema(seo);
  
  return (
    <>
      <LeadPotentialPageClient />
      <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
    </>
  );
}
