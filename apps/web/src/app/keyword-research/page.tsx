import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { KeywordResearchPageClient } from "./client";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Keyword Research Tool - Free SEO Keyword Suggestions & Analysis",
    description:
      "Discover high-value keywords for your SEO strategy. Get keyword suggestions, search volume estimates, competition analysis, and content gap identification.",
    path: "/keyword-research",
  });
}

export default function KeywordResearchPage() {
  return <KeywordResearchPageClient />;
}
