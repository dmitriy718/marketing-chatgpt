import { redirect } from "next/navigation";
import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Pricing Builder | Build Your Custom Marketing Package",
    description: "Build your custom marketing package with our interactive pricing builder. Select your tier, locations, timeline, and support level to get a tailored quote for your business.",
    path: "/pricing-builder",
    keywords: ["pricing builder", "custom package", "marketing pricing", "package builder", "custom quote"],
  });
}

export default function PricingBuilderPage() {
  redirect("/pricing");
}
