import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { ABTestingPageClient } from "./client";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "A/B Testing Platform - Test Landing Pages, CTAs & Campaigns",
    description:
      "Built-in A/B testing platform to test variations of landing pages, email campaigns, and CTAs. Includes statistical significance calculations and winner determination.",
    path: "/ab-testing",
  });
}

export default function ABTestingPage() {
  return <ABTestingPageClient />;
}
