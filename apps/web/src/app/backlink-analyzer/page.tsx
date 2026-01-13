import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { BacklinkAnalyzerPageClient } from "./client";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Backlink Analyzer - Free SEO Backlink Analysis Tool",
    description:
      "Analyze your website's backlink profile, identify linking opportunities, and get actionable insights for link building campaigns. Free SEO tool.",
    path: "/backlink-analyzer",
  });
}

export default function BacklinkAnalyzerPage() {
  return <BacklinkAnalyzerPageClient />;
}
