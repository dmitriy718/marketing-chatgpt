import { Metadata } from "next";
import { FreeConsultationPageClient } from "./client";
import { buildPageMetadata, buildLocalBusinessSchema, getDefaultSeoSettings } from "@/lib/seo";
import { getSiteSettings } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Free Marketing Consultation | Book Your Strategy Call",
    description: "Schedule a free 30-minute marketing consultation. Discuss your growth goals, get expert advice, and discover how Carolina Growth can accelerate your business. No obligation, just actionable insights.",
    path: "/free-consultation",
    keywords: ["free consultation", "marketing consultation", "strategy call", "marketing advice", "growth consultation", "business consultation", "marketing strategy"],
  });
}

export default function FreeConsultationPage() {
  const settings = getSiteSettings();
  const seo = getDefaultSeoSettings(settings);
  const localBusinessSchema = buildLocalBusinessSchema(seo);
  
  return (
    <>
      <FreeConsultationPageClient />
      <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
    </>
  );
}
